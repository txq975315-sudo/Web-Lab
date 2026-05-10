import { useMemo } from 'react'
import { loadSkillProgress } from '../utils/growthCoachStore'
import { METHODOLOGY_ORDER, METHODOLOGY_CONFIG } from '../config/methodology'

export default function CoachSidePanel({ className = '' }) {
  const skill = useMemo(() => loadSkillProgress(), [])
  const attempts = skill.byTemplate?.competitive_analysis?.attempts ?? 0

  return (
    <aside
      className={`flex flex-col overflow-hidden rounded-2xl border border-lab-border-subtle bg-lab-raised shadow-card ${className}`}
    >
      <div className="border-b border-lab-border-subtle px-4 py-3">
        <h2 className="font-display text-sm font-semibold text-lab-ink">练习洞察</h2>
        <p className="mt-0.5 text-xs text-lab-muted">竞品分析模板累计：{attempts} 次</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-lab-faint">方法论掌握度</p>
        <ul className="mt-3 space-y-3">
          {METHODOLOGY_ORDER.map((id) => {
            const name = METHODOLOGY_CONFIG[id]?.name || id
            const v = skill.dimensions[id] ?? 0
            return (
              <li key={id}>
                <div className="flex items-center justify-between gap-2 text-[11px] text-lab-muted">
                  <span className="truncate text-lab-ink">{name}</span>
                  <span>{Math.round(v)}</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-lab-overlay">
                  <div className="h-full rounded-full bg-lab-accent" style={{ width: `${Math.min(100, v)}%` }} />
                </div>
              </li>
            )
          })}
        </ul>
        <p className="mt-6 text-xs leading-relaxed text-lab-muted">
          完整 SVG 雷达图与历史对比将在此呈现（PRD 3.10）。当前为紧凑进度条，便于边练边看。
        </p>
      </div>
    </aside>
  )
}
