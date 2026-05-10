import { STORAGE_KEYS } from "../config/storageKeys.js";

const DEFAULT_CONFIG = {
  baseUrl: "https://openrouter.ai/api/v1",
  model: "deepseek/deepseek-chat"
};

function getConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.AI_CONFIG);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

/** 设置弹窗保存字段为 baseURL（与服务端习惯一致），此处兼容 baseUrl */
function resolveStoredBaseUrl(config) {
  if (!config) return null;
  return config.baseURL ?? config.baseUrl ?? null;
}

function getApiUrl(config) {
  const storedBase = resolveStoredBaseUrl(config);
  if (config?.provider === 'deepseek') {
    // 开发环境走 Vite 代理，避免浏览器直连 DeepSeek 的跨域问题
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      return '/api/deepseek';
    }
    return storedBase || 'https://api.deepseek.com/v1';
  }
  return storedBase || DEFAULT_CONFIG.baseUrl;
}

function handleHttpError(status) {
  switch (status) {
    case 401:
      return "API Key 无效，请检查设置";
    case 402:
      return "API 余额不足，请充值";
    case 429:
      return "请求频率过高，请稍后再试";
    default:
      return `HTTP ${status} 错误`;
  }
}

export async function streamChat(messages, onChunk, onDone, onError) {
  const config = getConfig();
  if (!config?.apiKey) {
    onError?.("请先点击右上角设置 API Key");
    return;
  }

  try {
    const apiUrl = getApiUrl(config);
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.apiKey}`
    };

    if (config.provider !== 'deepseek') {
      headers["HTTP-Referer"] = window.location.href;
      headers["X-Title"] = "Kairos Thinking Lab";
    }

    let response;
    try {
      response = await fetch(`${apiUrl}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: config.model || DEFAULT_CONFIG.model,
          messages,
          stream: true,
          temperature: 0.3
        })
      });
    } catch (err) {
      throw mapFetchFailure(err);
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || handleHttpError(response.status));
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter(l => l.trim().startsWith("data: "));

      for (const line of lines) {
        const data = line.replace("data: ", "").trim();
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullText += content;
            onChunk?.(content, fullText);
          }
        } catch {}
      }
    }
    onDone?.(fullText);
  } catch (error) {
    const raw = error?.message || '';
    const msg =
      raw === 'Failed to fetch' || error?.name === 'TypeError'
        ? mapFetchFailure(error).message
        : raw || '调用失败';
    onError?.(msg);
  }
}

function mapFetchFailure(err) {
  const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;
  const hint = isDev
    ? '无法连接 API（网络或被拦截）。使用 DeepSeek 时请用 npm run dev 启动以启用 /api/deepseek 代理；或到设置切换为 OpenRouter 并检查 Key。'
    : '无法连接 API。预览/构建产物无开发代理，请在设置中使用 OpenRouter 等可直接访问的端点，或自行配置同源反向代理。';
  return new Error(hint);
}

export async function chatComplete(messages) {
  const config = getConfig();
  if (!config?.apiKey) throw new Error("请先设置 API Key");

  const apiUrl = getApiUrl(config);
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${config.apiKey}`
  };

  if (config.provider !== 'deepseek') {
    headers["HTTP-Referer"] = window.location.href;
    headers["X-Title"] = "Kairos Thinking Lab";
  }

  let response;
  try {
    response = await fetch(`${apiUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: config.model || DEFAULT_CONFIG.model,
        messages,
        stream: false,
        temperature: 0.3
      })
    });
  } catch (err) {
    throw mapFetchFailure(err);
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || handleHttpError(response.status));
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
