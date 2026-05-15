import { COMPETITIVE_ANALYSIS } from '../../../config/competitiveAnalysis'

export default function L2MethodFrame({ onNext }) {
  const { L2, primaryMethodology, secondaryMethodology } = COMPETITIVE_ANALYSIS
  return (
    <div className="flex max-h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-lab-border-subtle bg-lab-overlay shadow-card">
      <div className="flex-shrink-0 border-b border-lab-border-subtle bg-lab-raised px-4 py-3">
        <h3 className="font-display text-sm font-semibold text-lab-ink">L2 方法层 · 思考框架</h3>
        <p className="mt-0.5 text-[11px] text-lab-muted">
          主：{primaryMethodology.name} · 辅：{secondaryMethodology.name} · 约 5 分钟
        </p>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 text-sm text-lab-ink font-body">
        <p className="rounded-lg border border-lab-border-subtle bg-[var(--color-warning-dim)]/25 px-3 py-2 text-xs text-lab-ink">
          <strong>辅方法论提醒：</strong>
          {L2.auxiliaryTip}
        </p>
        <p className="text-xs text-lab-muted">
          <strong className="text-lab-ink">记忆钩子：</strong>
          {L2.memoryHook}
        </p>
        <section>
          <h4 className="text-xs font-semibold text-lab-ink">MYY 五步流程</h4>
          <ol className="mt-2 list-decimal space-y-2 pl-4 text-xs">
            {L2.myySteps.map((row) => (
              <li key={row.title} className="marker:font-medium">
                <div className="font-medium text-lab-ink">{row.title}</div>
                <div className="text-lab-muted">核心问题：{row.core}</div>
                <div className="mt-0.5 text-lab-muted">{row.detail}</div>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h4 className="text-xs font-semibold text-lab-ink">竞品怎么选</h4>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[280px] border-collapse text-left text-[11px]">
              <thead>
                <tr className="border-b border-lab-border-subtle text-lab-muted">
                  <th className="py-1 pr-2 font-medium">类型</th>
                  <th className="py-1 pr-2 font-medium">数量</th>
                  <th className="py-1 pr-2 font-medium">目的</th>
                  <th className="py-1 font-medium">怎么判断</th>
                </tr>
              </thead>
              <tbody>
                {L2.competitorSelection.map((r) => (
                  <tr key={r.type} className="border-b border-lab-border-subtle align-top text-lab-ink">
                    <td className="py-1.5 pr-2 font-medium">{r.type}</td>
                    <td className="py-1.5 pr-2 text-lab-muted">{r.count}</td>
                    <td className="py-1.5 pr-2 text-lab-muted">{r.purpose}</td>
                    <td className="py-1.5 text-lab-muted">{r.how}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h4 className="text-xs font-semibold text-lab-ink">四视角拆解（对照练习与评分）</h4>
          <ul className="mt-2 space-y-2 text-xs">
            {L2.fourLayers.map((row) => (
              <li key={row.layer} className="rounded-lg border border-lab-border-subtle bg-lab-raised px-3 py-2">
                <div className="font-medium text-lab-ink">{row.layer}</div>
                <div className="text-lab-muted">看什么：{row.look}</div>
                <div className="text-lab-muted">核心问：{row.question}</div>
                <div className="text-lab-muted">产出线索：{row.output}</div>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className="flex-shrink-0 border-t border-lab-border-subtle p-4">
        <button type="button" onClick={onNext} className="w-full rounded-lab py-2.5 text-sm font-medium lab-btn-primary font-sans">
          下一步：操作层（L3）
        </button>
      </div>
    </div>
  )
}
