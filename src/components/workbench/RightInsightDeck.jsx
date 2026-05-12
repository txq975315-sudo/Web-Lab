import { useMemo, useState, useEffect } from 'react'
import { useLab } from '../../context/LabContext'

const GOAL_KEY = 'thinking-lab-daily-goal-v1'

function IconLightbulb() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <path
        d="M9 21h6M12 17a5 5 0 005-5c0-3-2.5-5-5-5s-5 2-5 5c0 2.5 2 4 4 5v1"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 18h6" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
    </svg>
  )
}

function DailyGoalRing({ current, total }) {
  const pct = total ? Math.min(100, (current / total) * 100) : 0
  const r = 34
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-[72px] w-[72px] shrink-0">
        <svg width="72" height="72" viewBox="0 0 80 80" className="absolute inset-0 scale-[0.9]">
          <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-border-subtle)" strokeWidth="7" />
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke="var(--color-brand-blue)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform="rotate(-90 40 40)"
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center text-[12px] font-semibold"
          style={{ color: 'var(--wb-text)' }}
        >
          {current}/{total}
        </div>
      </div>
      <div className="min-w-0 text-sm" style={{ color: 'var(--wb-muted)' }}>
        <p className="font-semibold" style={{ color: 'var(--wb-text)' }}>
          今日训练目标
        </p>
        <p className="mt-1 text-xs leading-relaxed">
          完成 {total} 次压力测试；还差 {Math.max(0, total - current)} 次达标。
        </p>
      </div>
    </div>
  )
}

function updatedAgo(projectId) {
  const n = (projectId || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const opts = ['刚刚更新', '15 分钟前', '2 小时前', '昨天', '3 天前']
  return opts[n % opts.length]
}

function coachTip() {
  return '每一练先锁定场景与用户，再落到模板字段；提交后会给出维度分与盲区，方便回填到项目树。'
}

function liveTip() {
  return '先交代清楚目标用户与核心价值，再展开竞品与变现。模型会按「定位 → 竞争 → 可行性」递进追问。'
}

function archaeologyTip() {
  return '粘贴完整对话后扫描地层；在时间轴与转折点处标注假设，再把沉淀归档进对应项目模块。'
}

function dashboardTip() {
  return '从「练」进入压力测试，从「学」刷方法论模板，从「看」整理对话资产，形成刻意练习闭环。'
}

export default function RightInsightDeck({ className = '' }) {
  const { projectTree, activeProjectId, setActiveProject, switchLabMode, labMode } = useLab()
  const [daily, setDaily] = useState({ current: 0, total: 3 })

  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10)
      const raw = localStorage.getItem(GOAL_KEY)
      const parsed = raw ? JSON.parse(raw) : {}
      if (parsed.date === today && typeof parsed.current === 'number') {
        setDaily({ current: parsed.current, total: parsed.total ?? 3 })
      } else {
        setDaily({ current: 0, total: 3 })
      }
    } catch {
      setDaily({ current: 0, total: 3 })
    }
  }, [labMode])

  const recent = [...(projectTree || [])].slice(0, 3)

  const tipText = useMemo(() => {
    if (labMode === 'coach') return coachTip()
    if (labMode === 'archaeology') return archaeologyTip()
    if (labMode === 'live') return liveTip()
    return dashboardTip()
  }, [labMode])

  const tipTitle = useMemo(() => {
    if (labMode === 'coach') return 'AI 教练提示 · 学'
    if (labMode === 'archaeology') return 'AI 教练提示 · 看'
    if (labMode === 'live') return 'AI 教练提示 · 练'
    return 'AI 教练提示'
  }, [labMode])

  const goProject = (projectId, mode) => {
    setActiveProject(projectId)
    switchLabMode(mode)
  }

  return (
    <aside
      className={`flex min-h-0 w-[250px] shrink-0 flex-col gap-3 overflow-y-auto py-1 pl-2 pr-0 ${className}`}
    >
      <div className="wb-card rounded-[var(--wb-radius-xl)] p-4 text-left">
        <div className="flex items-start gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl backdrop-blur-sm"
            style={{
              color: 'var(--color-brand-blue)',
              background: 'color-mix(in srgb, var(--color-brand-blue) 12%, var(--color-bg-raised))',
            }}
          >
            <IconLightbulb />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--wb-text)' }}>
              {tipTitle}
            </h3>
            <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--wb-muted)' }}>
              {tipText}
            </p>
          </div>
        </div>
      </div>

      <div
        className="wb-card p-4 transition-shadow duration-200 hover:shadow-[var(--wb-shadow-card)]"
        style={{ borderRadius: 'var(--wb-radius-lg)' }}
      >
        <h3 className="text-sm font-semibold" style={{ color: 'var(--wb-text)' }}>
          最近项目
        </h3>
        <ul className="mt-3 space-y-2">
          {recent.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  const target =
                    labMode === 'archaeology'
                      ? 'archaeology'
                      : labMode === 'coach'
                        ? 'coach'
                        : labMode === 'live'
                          ? 'live'
                          : 'live'
                  goProject(p.id, target)
                }}
                className="flex w-full cursor-pointer flex-col rounded-xl px-3 py-2.5 text-left transition-colors duration-200 hover:bg-[rgba(20,20,19,0.04)]"
                style={{
                  background:
                    p.id === activeProjectId ? 'rgba(20, 20, 19, 0.055)' : 'transparent',
                }}
              >
                <span className="truncate text-sm font-medium" style={{ color: 'var(--wb-text)' }}>
                  {p.name}
                </span>
                <span className="mt-1 text-[11px]" style={{ color: 'var(--wb-muted)' }}>
                  {updatedAgo(p.id)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="wb-card p-4 transition-shadow duration-200 hover:shadow-[var(--wb-shadow-card)]"
        style={{ borderRadius: 'var(--wb-radius-lg)' }}
      >
        <DailyGoalRing current={daily.current} total={daily.total} />
      </div>
    </aside>
  )
}
