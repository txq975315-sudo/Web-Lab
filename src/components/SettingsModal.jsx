import { useState, useEffect, useRef } from 'react'
import { useLab } from '../context/LabContext'
import { STORAGE_KEYS } from '../config/storageKeys.js'
import { downloadLabDataExport, importLabDataFromJson } from '../utils/labDataSync'

const STORAGE_KEY = STORAGE_KEYS.AI_CONFIG

const PROVIDERS = {
  openrouter: {
    label: 'OpenRouter',
    defaultBaseURL: 'https://openrouter.ai/api/v1',
    defaultModel: 'deepseek/deepseek-chat'
  },
  deepseek: {
    label: 'DeepSeek',
    defaultBaseURL: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat'
  },
  openai: {
    label: 'OpenAI',
    defaultBaseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o'
  },
  custom: {
    label: '自定义',
    defaultBaseURL: '',
    defaultModel: ''
  }
}

function loadConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export default function SettingsModal({ isOpen, onClose }) {
  const { migrateLegacyFlatStore } = useLab()
  const importInputRef = useRef(null)
  const [provider, setProvider] = useState('openrouter')
  const [apiKey, setApiKey] = useState('')
  const [baseURL, setBaseURL] = useState('')
  const [model, setModel] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const config = loadConfig()
      if (config) {
        setProvider(config.provider || 'openrouter')
        setApiKey(config.apiKey || '')
        setBaseURL(config.baseURL || '')
        setModel(config.model || '')
      } else {
        setProvider('openrouter')
        setApiKey('')
        setBaseURL(PROVIDERS.openrouter.defaultBaseURL)
        setModel(PROVIDERS.openrouter.defaultModel)
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (!showApiKey) return
    const timer = setTimeout(() => setShowApiKey(false), 3000)
    return () => clearTimeout(timer)
  }, [showApiKey])

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider)
    const providerConfig = PROVIDERS[newProvider]
    setBaseURL(providerConfig.defaultBaseURL)
    setModel(providerConfig.defaultModel)
  }

  const handleSave = () => {
    const config = {
      provider,
      apiKey,
      baseURL,
      model
    }
    saveConfig(config)
    onClose()
  }

  const handleImportFile = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : ''
      const result = importLabDataFromJson(text)
      if (!result.ok) {
        window.alert(result.error)
        return
      }
      if (
        window.confirm(
          '导入将用备份覆盖本浏览器内的工作台数据（项目树、对话历史、API 配置等）。确定后页面将刷新。'
        )
      ) {
        window.location.reload()
      }
    }
    reader.onerror = () => window.alert('读取文件失败')
    reader.readAsText(file, 'utf-8')
  }

  const handleMigrateLegacyFlat = () => {
    if (
      !window.confirm(
        '将从浏览器 localStorage 的早期扁平库（thinking-lab-legacy-flat-data）合并到左侧项目树。\n可多次执行，可能产生重复文档。\n是否继续？'
      )
    ) {
      return
    }
    const r = migrateLegacyFlatStore()
    window.alert(r.ok ? r.message : r.message)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: '#1F2937',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          <h2 className="text-lg font-semibold text-white">API 设置</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1L13 13M13 1L1 13"
                stroke="rgba(255, 255, 255, 0.6)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <p className="text-xs text-white/55 leading-relaxed">
            API Key 需自行向 OpenRouter、DeepSeek 等服务商申请并填入下方；仅保存在本机浏览器，不会上传到任何服务器。共用电脑时请注意退出或清除密钥。
          </p>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              API Provider
            </label>
            <select
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              {Object.entries(PROVIDERS).map(([key, { label }]) => (
                <option key={key} value={key} style={{ backgroundColor: '#1F2937' }}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-2.5 pr-20 rounded-lg text-sm text-white placeholder-white/40 outline-none"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-white/50 hover:text-white/80 transition-colors"
              >
                {showApiKey ? '隐藏' : '显示'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Base URL
            </label>
            <input
              type="text"
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
              placeholder="https://api.example.com/v1"
              className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-white/40 outline-none"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Model
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-4o"
              className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-white/40 outline-none"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            />
          </div>

          <div
            className="rounded-xl p-4 space-y-3"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <h3 className="text-sm font-medium text-white">数据与环境</h3>
            <p className="text-xs text-white/55 leading-relaxed">
              侧栏与文档列表保存在本机浏览器存储中。Chrome 与 Trae 内置预览、或{' '}
              <code className="text-white/70">localhost</code> 与{' '}
              <code className="text-white/70">127.0.0.1</code> 之间数据隔离，界面可能不一致；这不代表代码版本不同。当前源：
              <span className="text-white/80"> {typeof window !== 'undefined' ? window.location.origin : ''}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => downloadLabDataExport()}
                className="px-3 py-2 text-xs font-medium rounded-lg text-white transition-colors"
                style={{ backgroundColor: 'rgba(139, 92, 246, 0.5)', border: '1px solid rgba(139, 92, 246, 0.6)' }}
              >
                导出工作台备份
              </button>
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                className="px-3 py-2 text-xs font-medium rounded-lg text-white/90 transition-colors hover:bg-white/10"
                style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}
              >
                导入备份…
              </button>
              <button
                type="button"
                onClick={handleMigrateLegacyFlat}
                className="px-3 py-2 text-xs font-medium rounded-lg text-amber-100/95 transition-colors hover:bg-white/10"
                style={{ border: '1px solid rgba(251, 191, 36, 0.45)' }}
                title="仅当你曾使用过早期扁平结构存储项目时使用"
              >
                合并旧版扁平库…
              </button>
            </div>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
        </div>

        <div
          className="px-6 py-4 flex items-center justify-end gap-3"
          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-sm font-medium text-white rounded-lg transition-all"
            style={{
              backgroundColor: '#8B5CF6',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

export { STORAGE_KEY }
