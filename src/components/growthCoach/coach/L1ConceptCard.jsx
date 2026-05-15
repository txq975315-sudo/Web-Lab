import { COMPETITIVE_ANALYSIS } from '../../../config/competitiveAnalysis'

export default function L1ConceptCard({ onNext }) {
  const L1 = COMPETITIVE_ANALYSIS.L1
  return (
    <div className="flex max-h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-lab-border-subtle bg-lab-overlay shadow-card">
      <div className="flex-shrink-0 border-b border-lab-border-subtle bg-lab-raised px-4 py-3">
        <h3 className="font-display text-sm font-semibold text-lab-ink">L1 概念层 · 知识卡片</h3>
        <p className="mt-0.5 text-[11px] text-lab-muted">约 3 分钟 · 先统一「竞品分析到底在干什么」</p>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 text-sm leading-relaxed text-lab-ink font-body">
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-lab-muted">一句话</h4>
          <p className="mt-1">{L1.oneSentence}</p>
        </section>
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-lab-muted">为什么重要</h4>
          <p className="mt-1">{L1.whyItMatters}</p>
        </section>
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-lab-muted">类比</h4>
          <p className="mt-1">{L1.analogy}</p>
        </section>
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-lab-muted">三个目的</h4>
          <ul className="mt-2 space-y-2">
            {L1.threePurposes.map((p) => (
              <li
                key={p.name}
                className="rounded-lg border border-lab-border-subtle bg-lab-raised px-3 py-2 text-xs"
              >
                <span className="font-medium text-lab-ink">{p.name}</span>
                <span className="text-lab-muted"> — {p.desc}</span>
                <div className="mt-1 text-lab-muted">产出：{p.output}</div>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className="flex-shrink-0 border-t border-lab-border-subtle p-4">
        <button type="button" onClick={onNext} className="w-full rounded-lab py-2.5 text-sm font-medium lab-btn-primary font-sans">
          理解了，下一步 → L2 框架
        </button>
      </div>
    </div>
  )
}
