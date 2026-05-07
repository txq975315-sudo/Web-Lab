const DEFAULT_CONFIG = {
  baseUrl: "https://openrouter.ai/api/v1",
  model: "deepseek/deepseek-chat"
};

function getConfig() {
  try {
    const saved = localStorage.getItem("kairos-ai-config");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function getApiUrl(config) {
  if (config?.provider === 'deepseek') {
    return '/api/deepseek';
  }
  return config?.baseUrl || DEFAULT_CONFIG.baseUrl;
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

    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: config.model || DEFAULT_CONFIG.model,
        messages,
        stream: true,
        temperature: 0.3
      })
    });

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
    onError?.(error.message || "调用失败");
  }
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

  const response = await fetch(`${apiUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.model || DEFAULT_CONFIG.model,
      messages,
      stream: false,
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || handleHttpError(response.status));
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
