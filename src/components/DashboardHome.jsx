import { useState } from 'react'
import { useLab } from '../context/LabContext'

export default function DashboardHome() {
  const { switchLabMode } = useLab()
  const [viewMode, setViewMode] = useState('landing') // 'landing' 或 'selection'

  // 滚动到功能选择页
  const scrollToSelection = () => {
    setViewMode('selection')
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-12 pb-20">
        
        {/* 落地页 */}
        <section className="min-h-[80vh] flex flex-col items-center justify-center text-center">
          <div className="mb-8">
            <div className="inline-block px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 mb-6">
              <span className="text-sm font-medium" style={{ color: 'var(--color-brand-blue)' }}>
                🎨 Thinking Lab
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              思维训练工作台
            </h1>
            <p className="text-xl mb-8" style={{ color: 'var(--color-text-secondary)' }}>
              你的刻意练习圣地
            </p>
          </div>

          {/* 向下滚动引导 */}
          <button
            onClick={scrollToSelection}
            className="group flex flex-col items-center gap-2 transition-all hover:-translate-y-1"
          >
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              页面下方渐进引导
            </span>
            <div className="w-6 h-10 border-2 rounded-full flex items-start justify-center pt-1"
                 style={{ borderColor: 'var(--color-border-subtle)' }}>
              <div className="w-1.5 h-3 rounded-full animate-bounce"
                   style={{ backgroundColor: 'var(--color-brand-blue)' }} />
            </div>
          </button>
        </section>

        {/* 功能选择页 */}
        <section className="py-20">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--color-text-primary)' }}>
            选择你的训练方式
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* 压力训练卡片 */}
            <div 
              className="cursor-pointer transition-all hover:-translate-y-2 hover:shadow-xl"
              onClick={() => switchLabMode('live')}
            >
              <div 
                className="bg-white/90 backdrop-blur-md rounded-3xl p-8 h-full flex flex-col"
                style={{ 
                  borderRadius: '36px',
                  border: '1px solid rgba(132, 132, 132, 0.2)',
                  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)'
                }}
              >
                <div className="text-4xl mb-4">🏋️</div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  压力训练
                </h3>
                <p className="mb-6 flex-1" style={{ color: 'var(--color-text-secondary)' }}>
                  对你的想法进行多角度的压力测试，发现潜在的漏洞和风险
                </p>
                <button
                  className="w-full py-3 rounded-xl font-medium text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-brand-blue)' }}
                >
                  立即进入 →
                </button>
              </div>
            </div>

            {/* 成长教练卡片 */}
            <div 
              className="cursor-pointer transition-all hover:-translate-y-2 hover:shadow-xl"
              onClick={() => switchLabMode('coach')}
            >
              <div 
                className="bg-white/90 backdrop-blur-md rounded-3xl p-8 h-full flex flex-col"
                style={{ 
                  borderRadius: '36px',
                  border: '1px solid rgba(132, 132, 132, 0.2)',
                  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)'
                }}
              >
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  成长教练
                </h3>
                <p className="mb-6 flex-1" style={{ color: 'var(--color-text-secondary)' }}>
                  按照方法论模板完成练习，逐步提升你的思维能力
                </p>
                <button
                  className="w-full py-3 rounded-xl font-medium text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-brand-blue)' }}
                >
                  立即进入 →
                </button>
              </div>
            </div>

            {/* 对话考古卡片 */}
            <div 
              className="cursor-pointer transition-all hover:-translate-y-2 hover:shadow-xl"
              onClick={() => switchLabMode('archaeology')}
            >
              <div 
                className="bg-white/90 backdrop-blur-md rounded-3xl p-8 h-full flex flex-col"
                style={{ 
                  borderRadius: '36px',
                  border: '1px solid rgba(132, 132, 132, 0.2)',
                  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)'
                }}
              >
                <div className="text-4xl mb-4">📜</div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  对话考古
                </h3>
                <p className="mb-6 flex-1" style={{ color: 'var(--color-text-secondary)' }}>
                  整理历史对话，归档你的知识资产，沉淀成长轨迹
                </p>
                <button
                  className="w-full py-3 rounded-xl font-medium text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-brand-blue)' }}
                >
                  立即进入 →
                </button>
              </div>
            </div>

          </div>

          {/* 说明文字 */}
          <div className="mt-12 text-center">
            <p style={{ color: 'var(--color-text-secondary)' }}>
              说明文字/快速引导（可选）
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}
