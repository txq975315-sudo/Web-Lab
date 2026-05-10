import React from 'react'

/**
 * 捕获子树运行时错误，避免整页白屏；开发环境打印堆栈。
 */
export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('[AppErrorBoundary]', error, info.componentStack)
    }
  }

  render() {
    if (this.state.error) {
      const msg = this.state.error?.message || String(this.state.error)
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center p-8"
          style={{ backgroundColor: '#F9FAFB', fontFamily: 'system-ui, sans-serif' }}
        >
          <h1 className="text-lg font-semibold text-gray-800 mb-2">页面加载出错</h1>
          <p className="text-sm text-gray-600 max-w-md text-center mb-4">
            可能是浏览器里缓存的旧数据与当前版本不兼容。可先尝试下方「清除站点数据并刷新」；若使用子路径部署，请确认环境变量{' '}
            <code className="text-xs bg-gray-200 px-1 rounded">VITE_BASE</code> 与托管路径一致。
          </p>
          {import.meta.env.DEV && (
            <pre className="text-xs text-red-800 bg-red-50 p-3 rounded max-w-lg overflow-auto mb-4 whitespace-pre-wrap">
              {msg}
            </pre>
          )}
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm hover:bg-gray-700"
              onClick={() => window.location.reload()}
            >
              刷新页面
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => {
                try {
                  window.localStorage.clear()
                } finally {
                  window.location.reload()
                }
              }}
            >
              清除站点数据并刷新
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
