import { useMemo } from 'react'
import { TEMPLATES } from '../../../config/templates'
import {
  COMPETITIVE_L5_FIELD_ORDER,
  COMPETITIVE_L5_SHORT_LABELS,
} from '../../../config/hintLevels'
import { useExercise, growthCoachL5StorageKey } from '../../../hooks/useExercise'
import CoachFormattedText from '../CoachFormattedText'
import DimensionStepper from '../common/DimensionStepper'
import HintButton from '../common/HintButton'

/**
 * L5 · 逐字段练习 + 渐进提示 + 草稿（sessionStorage）
 */
export default function L5ExercisePanel({
  projectId,
  scenario,
  prefillHint,
  initialFields,
  ownProductName,
  attemptNumber,
  disabled,
  scoreLoading,
  onSubmitAnswers,
}) {
  const scenarioKey = (scenario || '').trim()
  const storageKey = growthCoachL5StorageKey(projectId)

  const ex = useExercise({
    storageKey,
    scenarioKey,
    initialAnswers: initialFields,
    maxHintsPerField: 3,
  })

  const fieldMap = useMemo(() => {
    const m = {}
    for (const f of TEMPLATES.competitive_analysis.fields) {
      m[f.key] = f
    }
    return m
  }, [])

  const stepperDims = useMemo(
    () =>
      COMPETITIVE_L5_FIELD_ORDER.map((id) => ({
        id,
        shortName: COMPETITIVE_L5_SHORT_LABELS[id] || id,
      })),
    []
  )

  const f = fieldMap[ex.currentKey]
  const val = ex.answers[ex.currentKey] ?? ''

  const handleSubmit = () => {
    const payload = ex.getAnswers()
    const empty = COMPETITIVE_L5_FIELD_ORDER.filter((k) => !(payload[k] || '').trim())
    if (empty.length > 0) {
      const ok = window.confirm(
        `还有 ${empty.length} 个字段未填写（含空白）。确定提交让 AI 评分吗？`
      )
      if (!ok) return
    }
    if (!(payload.competitorName || '').trim()) {
      const go = window.confirm('「竞品名称」仍为空。确定仍要提交评分吗？')
      if (!go) return
    }
    onSubmitAnswers({ answers: payload, hintCountsByField: ex.getHintCounts() })
  }

  return (
    <div className="flex max-h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-lab-border-subtle bg-lab-overlay shadow-card">
      <div className="flex-shrink-0 border-b border-lab-border-subtle bg-lab-raised px-4 py-3">
        <p className="rounded-md bg-lab-overlay px-2 py-1.5 text-[11px] leading-relaxed text-lab-muted ring-1 ring-lab-border-subtle font-body">
          <span className="font-medium text-lab-ink">L5 练习 · 逐维填写</span>
          {' · '}
          己方应为「<strong className="text-lab-ink">{ownProductName || '当前项目'}</strong>
          」；竞品写进「竞品名称」字段。可点维度标签切换；提示每字段最多 3 条。
        </p>
        <div className="mt-2 text-xs text-lab-muted">
          练习次数：第 {attemptNumber + 1} 次
          {attemptNumber === 0 && '（预填约 50%）'}
          {attemptNumber === 1 && '（预填约 20%）'}
          {attemptNumber >= 2 && '（独立完成）'}
        </div>
        <div className="coach-md--surface mt-2 text-sm">
          <CoachFormattedText text={scenarioKey ? scenario : '正在拉取场景…'} />
        </div>
        {prefillHint && (
          <div className="mt-2 text-xs text-lab-muted">
            <CoachFormattedText text={prefillHint} />
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        <DimensionStepper
          dimensions={stepperDims}
          index={ex.currentIndex}
          onChange={ex.setFieldIndex}
          mode="edit"
          itemLabel="字段"
        />

        {f && (
          <label className="block">
            <span className="text-xs font-medium text-lab-muted">{f.label}</span>
            <textarea
              className="mt-1 min-h-[8rem] w-full resize-y rounded-lg border border-lab-border bg-lab-overlay px-2 py-1.5 text-sm text-lab-ink placeholder:text-lab-faint focus:border-lab-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-lab-accent focus-visible:ring-offset-2 focus-visible:ring-offset-lab-overlay font-body"
              rows={6}
              value={val}
              placeholder={f.placeholder || ''}
              disabled={disabled}
              onChange={(e) => ex.updateAnswer(ex.currentKey, e.target.value)}
            />
          </label>
        )}

        <HintButton
          hintsUsed={ex.hintsUsed}
          maxHints={ex.maxHintsPerField}
          onRequest={ex.requestHint}
          disabled={disabled}
        />

        {ex.revealedHints.length > 0 && (
          <ul className="space-y-1.5 rounded-lg border border-lab-border-subtle bg-lab-raised p-3 text-xs leading-relaxed text-lab-ink font-body">
            {ex.revealedHints.map((text, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0 text-lab-faint">{i + 1}.</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="text-[11px] text-lab-muted">
          已填写 {ex.filledCount}/{COMPETITIVE_L5_FIELD_ORDER.length} 维
          {ex.draftSavedAt != null && ' · 草稿已写入浏览器（关闭页面前可恢复）'}
        </p>
      </div>

      <div className="flex-shrink-0 space-y-2 border-t border-lab-border-subtle p-4">
        <div className="flex gap-2">
          <button
            type="button"
            disabled={disabled || ex.currentIndex <= 0}
            onClick={ex.goPrev}
            className="flex-1 rounded-lab border border-lab-border-subtle py-2 text-sm text-lab-muted hover:bg-lab-accent-dim disabled:opacity-40"
          >
            ← 上一维
          </button>
          <button
            type="button"
            disabled={disabled || ex.currentIndex >= COMPETITIVE_L5_FIELD_ORDER.length - 1}
            onClick={ex.goNext}
            className="flex-1 rounded-lab border border-lab-border-subtle py-2 text-sm text-lab-muted hover:bg-lab-accent-dim disabled:opacity-40"
          >
            下一维 →
          </button>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={ex.flushDraft}
          className="w-full rounded-lab border border-lab-border-subtle py-2 text-xs text-lab-muted hover:bg-lab-accent-dim"
        >
          保存草稿到浏览器
        </button>
        <button
          type="button"
          disabled={disabled || scoreLoading}
          onClick={handleSubmit}
          className="w-full rounded-lab py-2.5 text-sm font-medium lab-btn-primary font-sans disabled:opacity-50"
        >
          {scoreLoading ? '评分中…' : '提交练习'}
        </button>
      </div>
    </div>
  )
}
