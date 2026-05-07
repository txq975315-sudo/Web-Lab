import { useState, useEffect } from 'react'

const STORAGE_KEY = 'kairos-ai-config'

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
