import CoachFormattedText from './CoachFormattedText'

const DIM_LABELS = {
  price: '$ 价格',
  availability: '可获得性',
  packaging: '包装',
  performance: '性能',
  easeOfUse: '易用性',
  assurance: '保证',
  lifeCycle: '生命周期成本',
  social: '社会接受度',
  ourAdvantage: '我们的差异化',
}

export default function AIFeedbackPanel({ feedback, onGoLive, loading }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-lab-border-subtle bg-lab-overlay p-6 text-sm text-lab-muted">
        正在生成评分…
      </div>
    )
  }

  if (!feedback) return null

  const dimScores = feedback.dimensionScores || {}
  const dimComments = feedback.dimensionComments || {}
  const overall = feedback.overallScore ?? '—'

  return (
    <div className="flex max-h-full w-full flex-col overflow-hidden rounded-xl border border-lab-border-subtle bg-lab-overlay shadow-elevated">
      <div
        className="flex-shrink-0 border-b border-lab-border-subtle px-4 py-3"
        style={{ backgroundColor: 'var(--color-bg-raised)' }}
      >
        <div className="text-xs text-lab-muted">总体评分</div>
        <div className="mt-1 flex items-end gap-2">
          <span className="text-3xl font-semibold font-display" style={{ color: 'var(--color-accent-orange)' }}>
            {overall}
          </span>
          <span className="text-sm text-lab-muted">/ 5</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-lab-border-subtle">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, (Number(overall) / 5) * 100)}%`,
              background:
                'linear-gradient(90deg, var(--color-error), var(--color-warning), var(--color-success))',
            }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3 text-sm">
          {Object.keys(DIM_LABELS).map((k) => {
            const s = dimScores[k]
            if (s == null) return null
            return (
              <div key={k} className="flex gap-2 border-b border-lab-border-subtle pb-2">
                <div className="w-24 flex-shrink-0 text-xs font-medium text-lab-muted">{DIM_LABELS[k]}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            n <= s ? 'var(--color-accent-orange)' : 'var(--color-border-default)',
                        }}
                      />
                    ))}
                    <span className="ml-2 text-xs text-lab-muted">{s}</span>
                  </div>
                  {dimComments[k] && (
                    <div className="mt-1 text-xs text-lab-muted font-body">
                      <CoachFormattedText text={dimComments[k]} compact indentParagraphs={false} />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {feedback.blindSpot && (
          <div className="mt-4 rounded-lg border border-lab-warning/35 bg-[var(--color-warning-dim)] p-3 text-sm text-lab-ink">
            <span className="font-medium">最大盲区：</span>
            <div className="mt-1">
              <CoachFormattedText text={feedback.blindSpot} compact indentParagraphs={false} />
            </div>
          </div>
        )}

        {feedback.methodologyBind && (
          <div className="mt-3 rounded-lg border border-lab-border-subtle bg-lab-raised p-3 text-sm text-lab-ink font-body">
            <CoachFormattedText text={feedback.methodologyBind} compact indentParagraphs={false} />
          </div>
        )}
      </div>

      <div className="flex-shrink-0 space-y-2 border-t border-lab-border-subtle p-4">
        <button type="button" onClick={onGoLive} className="w-full rounded-lab py-2.5 text-sm font-medium lab-btn-primary font-sans">
          去「实时演练」模拟追问（成长教练模式）
        </button>
        <p className="text-center text-[10px] text-lab-faint">将切换右侧到实时演练，并自动填入追问上下文</p>
      </div>
    </div>
  )
}
