import { useMemo, useState } from 'react'
import { COMPETITIVE_ANALYSIS } from '../../../config/competitiveAnalysis'
import DimensionStepper from '../common/DimensionStepper'

export default function L4CaseStudy({ onNext, onPrev }) {
  const { dimensions, L4 } = COMPETITIVE_ANALYSIS
  const [ix, setIx] = useState(0)

  const block = useMemo(() => {
    const id = dimensions[ix]?.id
    return L4.byDimension.find((b) => b.id === id) || L4.byDimension[0]
  }, [dimensions, ix, L4.byDimension])

  return (
    <div className="flex max-h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-lab-border-subtle bg-lab-overlay shadow-card">
      <div className="flex-shrink-0 border-b border-lab-border-subtle bg-lab-raised px-4 py-3">
        <h3 className="font-display text-sm font-semibold text-lab-ink">L4 案例层 · Coach 带做</h3>
        <p className="mt-0.5 text-[11px] text-lab-muted">
          {L4.product.name} · {L4.product.subtitle} · 约 15 分钟
        </p>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        <p className="text-xs leading-relaxed text-lab-muted font-body">{L4.coachIntro}</p>
        <DimensionStepper dimensions={dimensions} index={ix} onChange={setIx} mode="view" />
        <div className="rounded-lg border border-lab-border-subtle bg-lab-raised p-3 text-sm text-lab-ink font-body">
          <h4 className="text-xs font-semibold text-lab-muted">Coach 思考</h4>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed">{block.coach}</p>
          <h4 className="mt-3 text-xs font-semibold text-lab-warning">容易漏掉</h4>
          <p className="mt-1 text-xs text-lab-muted">{block.miss}</p>
          <h4 className="mt-3 text-xs font-semibold text-[var(--color-brand-blue)]">对你有什么启发</h4>
          <p className="mt-1 text-xs text-lab-ink">{block.takeaway}</p>
        </div>
      </div>
      <div className="flex-shrink-0 space-y-2 border-t border-lab-border-subtle p-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPrev}
            className="flex-1 rounded-lab border border-lab-border-subtle py-2 text-sm text-lab-muted hover:bg-lab-accent-dim"
          >
            ← 上一步（L3）
          </button>
          <button
            type="button"
            onClick={onNext}
            className="flex-1 rounded-lab py-2.5 text-sm font-medium lab-btn-primary font-sans"
          >
            去练习（L5）
          </button>
        </div>
      </div>
    </div>
  )
}
