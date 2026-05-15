import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { COMPETITIVE_ANALYSIS } from '../../../config/competitiveAnalysis'

export default function L3OperationChecklist({ onNext, onSkipToCase }) {
  const { steps } = COMPETITIVE_ANALYSIS.L3
  const [openId, setOpenId] = useState(steps[0]?.id || null)

  return (
    <div className="flex max-h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-lab-border-subtle bg-lab-overlay shadow-card">
      <div className="flex-shrink-0 border-b border-lab-border-subtle bg-lab-raised px-4 py-3">
        <h3 className="font-display text-sm font-semibold text-lab-ink">L3 操作层 · 实操清单</h3>
        <p className="mt-0.5 text-[11px] text-lab-muted">约 10 分钟 · 五步可展开</p>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
        {steps.map((s, idx) => {
          const open = openId === s.id
          return (
            <div key={s.id} className="rounded-lg border border-lab-border-subtle bg-lab-raised">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium text-lab-ink"
                onClick={() => setOpenId(open ? null : s.id)}
              >
                <span>
                  <span className="text-lab-faint">{idx + 1}/5</span> {s.title}
                </span>
                <span className="text-xs text-lab-muted">{open ? '▼' : '▶'}</span>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-lab-border-subtle"
                  >
                    <div className="space-y-2 p-3 text-xs leading-relaxed text-lab-ink font-body">
                      <div>
                        <span className="font-medium text-lab-muted">工具：</span>
                        {s.tool}
                      </div>
                      <ol className="list-decimal space-y-1 pl-4">
                        {s.actions.map((a) => (
                          <li key={a}>{a}</li>
                        ))}
                      </ol>
                      <div className="rounded-md bg-lab-overlay px-2 py-1.5 text-lab-muted ring-1 ring-lab-border-subtle">
                        <span className="font-medium text-lab-ink">Coach：</span>
                        {s.coachTip}
                      </div>
                      <div className="grid gap-1 sm:grid-cols-2">
                        <div className="rounded border border-lab-warning/30 bg-[var(--color-error)]/5 px-2 py-1 text-lab-ink">
                          <span className="text-lab-faint">❌</span> {s.pitfalls.bad}
                        </div>
                        <div className="rounded border border-lab-border-subtle bg-lab-overlay px-2 py-1 text-lab-ink">
                          <span className="text-lab-faint">✅</span> {s.pitfalls.good}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
      <div className="flex-shrink-0 space-y-2 border-t border-lab-border-subtle p-4">
        <button type="button" onClick={onNext} className="w-full rounded-lab py-2.5 text-sm font-medium lab-btn-primary font-sans">
          下一步：案例层（L4）
        </button>
        <button
          type="button"
          onClick={onSkipToCase}
          className="w-full rounded-lab border border-lab-border-subtle py-2 text-xs text-lab-muted hover:bg-lab-accent-dim hover:text-lab-accent-warm"
        >
          跳过，直接看案例（L4）
        </button>
      </div>
    </div>
  )
}
