import CoachFormattedText from './CoachFormattedText'

/** 新制：四维度完整性 0–4 + 深度 0–4 + 洞察 0–2 = 总分 0–10 */
const RUBRIC_META = {
  fourDimensionsCompleteness: { label: '四维度完整性', max: 4 },
  answerDepth: { label: '回答深度', max: 4 },
  differentiationInsight: { label: '差异化洞察', max: 2 },
}

const LEGACY_DIM_LABELS = {
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

function RubricMeter({ score, max }) {
  const n = Math.max(0, Math.min(max, Number(score) || 0))
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full"
          style={{
            backgroundColor: i < n ? 'var(--color-brand-blue)' : 'var(--color-border-default)',
          }}
        />
      ))}
      <span className="ml-2 text-xs text-lab-muted">
        {n}/{max}
      </span>
    </div>
  )
}

export default function AIFeedbackPanel({ feedback, onGoLive, loading, onOpenMockInterview }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-lab-border-subtle bg-lab-overlay p-6 text-sm text-lab-muted">
        正在生成评分…
      </div>
    )
  }

  if (!feedback) return null

  const rubricScores = feedback.rubricScores || null
  const rubricComments = feedback.rubricComments || {}
  const legacyDimScores = feedback.dimensionScores || {}
  const legacyDimComments = feedback.dimensionComments || {}
  const overall = feedback.overallScore ?? '—'
  const useRubric = rubricScores && typeof rubricScores.fourDimensionsCompleteness === 'number'

  return (
    <div className="flex max-h-full w-full flex-col overflow-hidden rounded-xl border border-lab-border-subtle bg-lab-overlay shadow-elevated">
      <div
        className="flex-shrink-0 border-b border-lab-border-subtle px-4 py-3"
        style={{ backgroundColor: 'var(--color-bg-raised)' }}
      >
        <div className="text-xs text-lab-muted">总体评分</div>
        <div className="mt-1 flex items-end gap-2">
          <span className="text-3xl font-semibold font-display" style={{ color: 'var(--color-brand-blue)' }}>
            {overall}
          </span>
          <span className="text-sm text-lab-muted">{useRubric ? '/ 10' : '/ 5'}</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-lab-border-subtle">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, (Number(overall) / (useRubric ? 10 : 5)) * 100)}%`,
              background:
                'linear-gradient(90deg, var(--color-error), var(--color-warning), var(--color-success))',
            }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3 text-sm">
          {useRubric ? (
            (Object.keys(RUBRIC_META)).map((key) => {
              const meta = RUBRIC_META[key]
              const s = rubricScores[key]
              if (s == null) return null
              const isWeak = Array.isArray(feedback.weakestAspects) && feedback.weakestAspects.includes(key)
              return (
                <div
                  key={key}
                  className={`flex gap-2 border-b border-lab-border-subtle pb-2 ${isWeak ? 'rounded-md bg-[var(--color-warning-dim)]/40 ring-1 ring-lab-warning/25' : ''}`}
                >
                  <div className="w-28 flex-shrink-0 text-xs font-medium text-lab-muted">{meta.label}</div>
                  <div className="min-w-0 flex-1">
                    <RubricMeter score={s} max={meta.max} />
                    {rubricComments[key] && (
                      <div className="mt-1 text-xs text-lab-muted font-body">
                        <CoachFormattedText text={rubricComments[key]} compact indentParagraphs={false} />
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            Object.keys(LEGACY_DIM_LABELS).map((k) => {
              const s = legacyDimScores[k]
              if (s == null) return null
              return (
                <div key={k} className="flex gap-2 border-b border-lab-border-subtle pb-2">
                  <div className="w-24 flex-shrink-0 text-xs font-medium text-lab-muted">{LEGACY_DIM_LABELS[k]}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor:
                              n <= s ? 'var(--color-brand-blue)' : 'var(--color-border-default)',
                          }}
                        />
                      ))}
                      <span className="ml-2 text-xs text-lab-muted">{s}</span>
                    </div>
                    {legacyDimComments[k] && (
                      <div className="mt-1 text-xs text-lab-muted font-body">
                        <CoachFormattedText text={legacyDimComments[k]} compact indentParagraphs={false} />
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
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
        {typeof onOpenMockInterview === 'function' && (
          <button
            type="button"
            onClick={onOpenMockInterview}
            className="w-full rounded-lab border border-lab-border-subtle py-2.5 text-sm font-medium text-lab-ink hover:bg-lab-accent-dim font-sans"
          >
            在本页接受检验（模拟追问）
          </button>
        )}
        <button type="button" onClick={onGoLive} className="w-full rounded-lab py-2.5 text-sm font-medium lab-btn-primary font-sans">
          去「实时演练」模拟追问（成长教练模式）
        </button>
        <p className="text-center text-[10px] text-lab-faint">内嵌检验不切换模式；实时演练将切到「练」并自动填入上下文</p>
      </div>
    </div>
  )
}
