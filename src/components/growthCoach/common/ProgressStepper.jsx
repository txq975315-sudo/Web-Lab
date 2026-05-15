const STEPS = [
  { id: 1, label: '概念', hint: 'L1' },
  { id: 2, label: '框架', hint: 'L2' },
  { id: 3, label: '工具包', hint: 'L3' },
  { id: 4, label: '跟练', hint: 'L4' },
  { id: 5, label: '实战', hint: 'L5' },
]

/**
 * @param {object} props
 * @param {'intro'|1|2|3|4|5|'feedback'} props.phase
 * @param {(id: 1|2|3|4|5) => void} [props.onJump] — 仅允许跳回已完成的学练步
 * @param {number} props.maxReached — 已到达过的最大步号 1–5（用于可点击回退）
 */
export default function ProgressStepper({ phase, onJump, maxReached = 1 }) {
  const current =
    phase === 'intro' || phase === 'feedback' ? null : typeof phase === 'number' ? phase : null
  const allDone = phase === 'feedback'

  return (
    <nav
      className="mb-4 flex flex-wrap items-center gap-1 rounded-xl border border-lab-border-subtle bg-lab-raised px-2 py-2"
      aria-label="学习进度"
    >
      {STEPS.map((s, i) => {
        const done = allDone || (current != null && s.id < current)
        const active = current === s.id
        const jumpable =
          typeof onJump === 'function' && s.id <= maxReached && s.id !== current && maxReached > 0
        const baseClass = [
          'rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors',
          active
            ? 'bg-[var(--color-brand-blue)] text-white shadow-sm'
            : done
              ? 'bg-lab-overlay text-lab-ink ring-1 ring-lab-border-subtle'
              : 'text-lab-muted',
        ].join(' ')
        return (
          <div key={s.id} className="flex items-center">
            {i > 0 && (
              <span className="mx-0.5 text-lab-faint" aria-hidden>
                →
              </span>
            )}
            {jumpable ? (
              <button
                type="button"
                onClick={() => onJump(s.id)}
                className={`${baseClass} cursor-pointer hover:bg-lab-accent-dim`}
              >
                <span className="text-lab-faint">{s.hint}</span> {s.label}
              </button>
            ) : (
              <span className={baseClass}>
                <span className="text-lab-faint">{s.hint}</span> {s.label}
              </span>
            )}
          </div>
        )
      })}
      {allDone && (
        <>
          <span className="mx-0.5 text-lab-faint">→</span>
          <span className="rounded-lg bg-lab-overlay px-2.5 py-1 text-[11px] font-medium text-lab-ink ring-1 ring-lab-border-subtle">
            反馈
          </span>
        </>
      )}
    </nav>
  )
}
