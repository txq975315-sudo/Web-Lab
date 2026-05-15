import { useMemo, useState } from 'react'
import { TEMPLATES } from '../../../config/templates'
import {
  COMPETITIVE_L5_FIELD_ORDER,
  COMPETITIVE_L5_SHORT_LABELS,
} from '../../../config/hintLevels'
import { getFieldPerspectiveLabel } from '../../../config/competitiveAnalysis'
import { useExercise, growthCoachL5StorageKey } from '../../../hooks/useExercise'
import CoachFormattedText from '../CoachFormattedText'
import DimensionStepper from '../common/DimensionStepper'
import HintButton from '../common/HintButton'

const SWOT_FIELDS = [
  { key: 'swot_strength', label: 'S 优势 — 我们相比竞品的差异化优势', placeholder: '列举我们有哪些竞品没有的优势...' },
  { key: 'swot_weakness', label: 'W 劣势 — 竞品相比我们的优势 / 我们的短板', placeholder: '竞品有什么是我们做不到的？' },
  { key: 'swot_opportunity', label: 'O 机会 — 竞品未覆盖的市场空白 / 用户痛点', placeholder: '哪些用户需求还没有被满足？' },
  { key: 'swot_threat', label: 'T 威胁 — 竞品可能反击的方向 / 行业趋势风险', placeholder: '如果竞品也做我们的功能怎么办？' },
]

const STRATEGY_OPTIONS = [
  { id: 'SO', label: 'SO 策略 — 利用优势抓机会', full: '用我们的长板打竞品的空白' },
  { id: 'WO', label: 'WO 策略 — 弥补劣势抓机会', full: '先补短板再抢机会' },
  { id: 'ST', label: 'ST 策略 — 利用优势防威胁', full: '用护城河抵御竞品反击' },
  { id: 'WT', label: 'WT 策略 — 防守型策略', full: '避开竞品的强处，找细分领域' },
]

const TOTAL_FIELDS = COMPETITIVE_L5_FIELD_ORDER.length + SWOT_FIELDS.length + 2 // 10 + 4 + strategy + differentiation

/**
 * L5 · 逐字段练习 + 渐进提示 + 草稿（sessionStorage）
 * 改造：四视角分组 + 去预填 + SWOT 输出表单
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

  // SWOT 状态
  const [swotAnswers, setSwotAnswers] = useState({
    swot_strength: '',
    swot_weakness: '',
    swot_opportunity: '',
    swot_threat: '',
  })
  const [selectedStrategy, setSelectedStrategy] = useState(null)
  const [differentiationText, setDifferentiationText] = useState('')

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

  // 判断当前是否在 SWOT 部分
  const isInSwotField = ex.currentIndex >= COMPETITIVE_L5_FIELD_ORDER.length
  const swotIndex = ex.currentIndex - COMPETITIVE_L5_FIELD_ORDER.length
  const isSwotQuadrant = isInSwotField && swotIndex < SWOT_FIELDS.length
  const isStrategy = isInSwotField && swotIndex === SWOT_FIELDS.length
  const isDifferentiation = isInSwotField && swotIndex === SWOT_FIELDS.length + 1

  // 当前 $APPEALS 字段
  const f = isInSwotField ? null : fieldMap[ex.currentKey]
  const val = f ? (ex.answers[ex.currentKey] ?? '') : ''

  // 获取当前字段的视角标签
  const perspectiveLabel = f ? getFieldPerspectiveLabel(ex.currentKey) : null

  // 检查 $APPEALS 字段是否填完
  const appealsFilledCount = COMPETITIVE_L5_FIELD_ORDER.filter(
    (k) => (ex.answers[k] || '').trim().length > 0
  ).length

  const handleSubmit = () => {
    const payload = ex.getAnswers()
    const empty = COMPETITIVE_L5_FIELD_ORDER.filter((k) => !(payload[k] || '').trim())
    if (empty.length > 0) {
      const ok = window.confirm(
        `还有 ${empty.length} 个 $APPEALS 字段未填写（含空白）。确定提交让 AI 评分吗？`
      )
      if (!ok) return
    }
    // 合并 SWOT 数据
    const fullPayload = {
      ...payload,
      ...swotAnswers,
      selectedStrategy,
      differentiationText,
    }
    onSubmitAnswers({ answers: fullPayload, hintCountsByField: ex.getHintCounts() })
  }

  // 渲染 SWOT 字段
  const renderSwotField = (sf) => {
    const val = swotAnswers[sf.key] || ''
    return (
      <div key={sf.key} className="space-y-2 rounded-lg border border-lab-border-subtle bg-lab-raised p-3">
        <span className="text-xs font-semibold text-lab-ink">{sf.label}</span>
        <textarea
          className="mt-1 w-full resize-y rounded-lg border border-lab-border bg-lab-overlay px-2 py-1.5 text-xs text-lab-ink placeholder:text-lab-faint focus:border-lab-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-lab-accent font-body"
          rows={4}
          value={val}
          placeholder={sf.placeholder}
          onChange={(e) => setSwotAnswers((prev) => ({ ...prev, [sf.key]: e.target.value }))}
        />
      </div>
    )
  }

  // 渲染策略选择
  const renderStrategySelection = () => (
    <div className="space-y-3 rounded-lg border border-lab-border-subtle bg-lab-raised p-3">
      <h4 className="text-xs font-semibold text-lab-ink">SWOT 策略选择</h4>
      <p className="text-[11px] text-lab-muted">基于你的 SWOT 分析，选择最适合的策略方向：</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {STRATEGY_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setSelectedStrategy(opt.id)}
            className={`rounded-lg border-2 p-2.5 text-left transition-all ${
              selectedStrategy === opt.id
                ? 'border-[var(--color-brand-blue)] bg-[var(--color-brand-blue)]/5'
                : 'border-lab-border-subtle hover:bg-lab-accent-dim'
            }`}
          >
            <div className="text-xs font-semibold text-lab-ink">{opt.label}</div>
            <div className="mt-0.5 text-[10px] text-lab-muted">{opt.full}</div>
          </button>
        ))}
      </div>

      {/* 差异化定位 */}
      <div className="mt-3">
        <h4 className="text-xs font-semibold text-lab-ink">
          差异化定位 <span className="text-lab-faint font-normal">（一句话）</span>
        </h4>
        <p className="mt-0.5 text-[10px] text-lab-muted">
          用一句话说清楚：「我们是谁、为谁、提供什么独特价值？」
        </p>
        <textarea
          className="mt-1 w-full resize-y rounded-lg border border-lab-border bg-lab-overlay px-2 py-1.5 text-xs text-lab-ink placeholder:text-lab-faint focus:border-lab-accent focus:outline-none font-body"
          rows={3}
          value={differentiationText}
          placeholder="例如：我们是一款为职场白领设计的社交化专注工具..."
          onChange={(e) => setDifferentiationText(e.target.value)}
        />
      </div>
    </div>
  )

  return (
    <div className="flex max-h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-lab-border-subtle bg-lab-overlay shadow-card">
      <div className="flex-shrink-0 border-b border-lab-border-subtle bg-lab-raised px-4 py-3">
        <p className="rounded-md bg-lab-overlay px-2 py-1.5 text-[11px] leading-relaxed text-lab-muted ring-1 ring-lab-border-subtle font-body">
          <span className="font-medium text-lab-ink">L5 实战 · 逐维填写</span>
          {' · '}
          己方应为「<strong className="text-lab-ink">{ownProductName || '当前项目'}</strong>
          」；竞品写进「竞品名称」字段。可点维度标签切换；提示每字段最多 3 条。
          {' · '}
          <span className="text-[var(--color-brand-blue)]">四视角框架</span>
        </p>
        <div className="mt-1 text-[11px] text-lab-muted">
          练习次数：第 {attemptNumber + 1} 次 · 使用四视角框架（用户/功能/体验/业务）
        </div>
        <div className="coach-md--surface mt-2 text-sm">
          <CoachFormattedText text={scenarioKey ? scenario : '正在拉取场景…'} />
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {/* $APPEALS 字段部分 */}
        {!isInSwotField && (
          <>
            <DimensionStepper
              dimensions={stepperDims}
              index={ex.currentIndex}
              onChange={ex.setFieldIndex}
              mode="perspective"
              itemLabel="字段"
            />

            {f && (
              <label className="block">
                {/* 视角标签 */}
                {perspectiveLabel && (
                  <div className="mb-1 text-[10px] font-medium" style={{ color: 'var(--color-brand-blue)' }}>
                    📊 {perspectiveLabel.perspectiveName} · {perspectiveLabel.fieldLabel}
                  </div>
                )}
                <span className="text-xs font-medium text-lab-muted">{f.label}</span>
                <textarea
                  className="mt-1 min-h-[8rem] w-full resize-y rounded-lg border border-lab-border bg-lab-overlay px-2 py-1.5 text-sm text-lab-ink placeholder:text-lab-faint focus:border-lab-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-lab-accent focus-visible:ring-offset-2 focus-visible:ring-offset-lab-overlay font-body"
                  rows={6}
                  value={val}
                  placeholder={f.placeholder || `请填写【${perspectiveLabel?.perspectiveName || f.label}】相关内容...`}
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
              已填写 {appealsFilledCount}/{COMPETITIVE_L5_FIELD_ORDER.length} 维
              {ex.draftSavedAt != null && ' · 草稿已写入浏览器'}
            </p>
          </>
        )}

        {/* SWOT 四象限 */}
        {isSwotQuadrant && (
          <div className="space-y-4">
            <div className="rounded-lg border border-lab-border-subtle bg-[var(--color-brand-blue)]/5 p-3">
              <h4 className="text-xs font-semibold text-lab-ink">📋 SWOT 分析</h4>
              <p className="mt-1 text-[11px] text-lab-muted">
                基于你的 $APPEALS 分析，填写 SWOT 四象限，推导策略方向。
              </p>
            </div>
            {renderSwotField(SWOT_FIELDS[swotIndex])}
          </div>
        )}

        {/* 策略选择 */}
        {isStrategy && renderStrategySelection()}

        {/* 差异化定位（单独步骤） */}
        {isDifferentiation && (
          <div className="space-y-3 rounded-lg border border-lab-border-subtle bg-lab-raised p-3">
            <h4 className="text-xs font-semibold text-lab-ink">差异化定位</h4>
            <p className="text-[11px] text-lab-muted">
              综合你的 $APPEALS 分析和 SWOT 结论，完成差异化定位陈述。
            </p>
            <textarea
              className="w-full resize-y rounded-lg border border-lab-border bg-lab-overlay px-2 py-1.5 text-xs text-lab-ink placeholder:text-lab-faint focus:border-lab-accent focus:outline-none font-body"
              rows={3}
              value={differentiationText}
              placeholder="用一句话说清楚我们的差异化定位..."
              onChange={(e) => setDifferentiationText(e.target.value)}
            />
          </div>
        )}

        {/* 总进度 */}
        <p className="text-[10px] text-lab-muted">
          $APPEALS {appealsFilledCount}/10 · SWOT{' '}
          {Object.values(swotAnswers).filter((v) => v.trim()).length}/{SWOT_FIELDS.length} ·
          策略 {selectedStrategy ? '✓' : '✗'} · 定位 {differentiationText.trim().length >= 5 ? '✓' : '✗'}
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
            disabled={disabled || ex.currentIndex >= TOTAL_FIELDS - 1}
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
