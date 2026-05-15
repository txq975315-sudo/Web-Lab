import { useState, useEffect, useCallback } from 'react'
import { useLab } from '../../context/LabContext'
import { chatComplete } from '../../utils/aiApi'
import { extractJsonBlock } from '../../utils/extractJsonBlock'
import { getMethodologyForTemplate } from '../../config/methodology'
import * as prompts from '../../config/growthCoachPrompts'
import { augmentSystemPromptWithTerminology } from '../../utils/aiTerminologyPreference.js'
import { recordCoachSession, getTemplateAttempts } from '../../utils/growthCoachStore'
import { growthCoachL5StorageKey } from '../../hooks/useExercise'
import AIFeedbackPanel from './AIFeedbackPanel'
import L1ConceptCard from './coach/L1ConceptCard'
import L2MethodFrame from './coach/L2MethodFrame'
import L3OperationChecklist from './coach/L3OperationChecklist'
import L4CoachWalkthrough from './coach/L4CoachWalkthrough'
import L5ExercisePanel from './coach/L5ExercisePanel'
import MockInterviewModal from './feedback/MockInterviewModal'
import PathSelectorModal from './coach/PathSelectorModal'
import IndependentPracticePanel from './coach/IndependentPracticePanel'

const P0_TEMPLATE = 'competitive_analysis'

/** @typedef {'intro'|1|2|3|4|'pathSelect'|'projectMode'|'independentMode'|5|'feedback'} CoachStep */

function emptyFields() {
  return {
    competitorName: '',
    price: '',
    availability: '',
    packaging: '',
    performance: '',
    easeOfUse: '',
    assurance: '',
    lifeCycle: '',
    social: '',
    ourAdvantage: '',
  }
}

export default function GrowthCoachPanel() {
  const {
    projectTree,
    activeProjectId,
    switchLabMode,
    switchExpertMode,
    setLabMessageToSend,
    setAutoSendLabMessage,
    startNewSession,
  } = useLab()

  const project = projectTree.find((p) => p.id === activeProjectId)
  const projectName = project?.name || '当前项目'
  const methodology = getMethodologyForTemplate(P0_TEMPLATE)
  const methodologyName = methodology?.name || '多维拆解法'

  /** @type {[CoachStep, React.Dispatch<React.SetStateAction<CoachStep>>]} */
  const [step, setStep] = useState('intro')
  const [maxReached, setMaxReached] = useState(0)

  const [exerciseLoading, setExerciseLoading] = useState(false)
  const [scenario, setScenario] = useState('')
  const [prefillHint, setPrefillHint] = useState('')
  const [fieldValues, setFieldValues] = useState(emptyFields)

  const [scoreLoading, setScoreLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [lastHintCounts, setLastHintCounts] = useState({})
  const [mockInterviewOpen, setMockInterviewOpen] = useState(false)
  const [mockSessionKey, setMockSessionKey] = useState(0)

  // 双路径状态
  const [selectedProducts, setSelectedProducts] = useState([])
  const [practiceMode, setPracticeMode] = useState(null) // 'project' | 'independent'

  const attemptNumber = getTemplateAttempts(P0_TEMPLATE)

  useEffect(() => {
    if (typeof step === 'number') {
      setMaxReached((m) => Math.max(m, step))
    }
  }, [step])

  // 将当前步骤同步到 localStorage（供右侧边栏 ProgressCard 读取）
  useEffect(() => {
    try {
      localStorage.setItem('growthCoach_current_step', JSON.stringify(step))
      localStorage.setItem('growthCoach_current_maxReached', String(maxReached))
    } catch { /* ignore */ }
  }, [step, maxReached])

  const resetRound = useCallback(() => {
    setStep('intro')
    setMaxReached(0)
    setScenario('')
    setPrefillHint('')
    setFieldValues(emptyFields())
    setFeedback(null)
    setLastHintCounts({})
    setMockInterviewOpen(false)
    setSelectedProducts([])
    setPracticeMode(null)
  }, [])

  useEffect(() => {
    if (step !== 5 || scenario) return
    let cancelled = false
    ;(async () => {
      setExerciseLoading(true)
      try {
        let userPrompt
        if (practiceMode === 'independent' && selectedProducts.length > 0) {
          // 独立训练模式
          userPrompt = prompts.buildExerciseScenarioPrompt(
            selectedProducts.map((p) => p.name).join(' vs '),
            methodologyName,
            attemptNumber
          )
        } else {
          userPrompt = prompts.buildExerciseScenarioPrompt(projectName, methodologyName, attemptNumber)
        }
        const text = await chatComplete([
          { role: 'system', content: augmentSystemPromptWithTerminology(prompts.SYSTEM_JSON_PUBLIC_GROUNDING) },
          { role: 'user', content: userPrompt },
        ])
        if (cancelled) return
        const json = extractJsonBlock(text)
        setScenario(json.scenario || '')
        setPrefillHint(json.prefillHint || '')
        const raw = json.fields || {}
        setFieldValues((prev) => ({ ...emptyFields(), ...prev, ...raw }))
      } catch (e) {
        if (!cancelled) {
          setScenario('场景生成失败，请检查 API Key 后点击「重新生成场景」。')
          setPrefillHint(String(e.message || e))
        }
      } finally {
        if (!cancelled) setExerciseLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [step, scenario, projectName, methodologyName, attemptNumber])

  const handleSubmitExercise = async (submitPayload) => {
    const payload =
      submitPayload &&
      typeof submitPayload === 'object' &&
      !Array.isArray(submitPayload) &&
      submitPayload.answers
        ? submitPayload.answers
        : submitPayload || fieldValues
    const hintCountsByField =
      submitPayload &&
      typeof submitPayload === 'object' &&
      submitPayload.hintCountsByField &&
      typeof submitPayload.hintCountsByField === 'object'
        ? submitPayload.hintCountsByField
        : {}
    setLastHintCounts(hintCountsByField)
    setFieldValues(payload)
    setScoreLoading(true)
    try {
      const userPrompt = prompts.buildScoreExercisePrompt(
        scenario,
        JSON.stringify(payload, null, 0),
        methodologyName,
        hintCountsByField
      )
      const text = await chatComplete([
        { role: 'system', content: augmentSystemPromptWithTerminology(prompts.SYSTEM_JSON_PUBLIC_GROUNDING) },
        { role: 'user', content: userPrompt },
      ])
      const json = extractJsonBlock(text)
      setFeedback(json)
      const usesRubric =
        json.rubricScores && typeof json.rubricScores.fourDimensionsCompleteness === 'number'
      recordCoachSession(P0_TEMPLATE, 'multi_dimensional', Number(json.overallScore) || 0, {
        maxScore: usesRubric ? 10 : 5,
      })
      try {
        sessionStorage.removeItem(growthCoachL5StorageKey(activeProjectId))
      } catch {
        /* ignore */
      }
      setStep('feedback')
    } catch (e) {
      alert(e.message || String(e))
    } finally {
      setScoreLoading(false)
    }
  }

  const handleGoLive = () => {
    if (!feedback) return
    const keys = Object.keys(emptyFields())
    const userSummary = keys.map((k) => `${k}: ${(fieldValues[k] || '').slice(0, 120)}`).join('\n')
    const rubric = feedback.rubricScores
    const rubricLine =
      rubric && typeof rubric.fourDimensionsCompleteness === 'number'
        ? `分项：四维度完整性 ${rubric.fourDimensionsCompleteness}/4，深度 ${rubric.answerDepth}/4，洞察 ${rubric.differentiationInsight}/2。薄弱项：${(feedback.weakestAspects || []).join('、') || '—'}。`
        : ''
    const usesRubric = rubric && typeof rubric.fourDimensionsCompleteness === 'number'
    const msg = prompts.buildCoachHandoffMessage({
      projectName,
      scenario,
      userFieldsSummary: userSummary,
      feedbackSummary: `总分 ${feedback.overallScore}/${usesRubric ? 10 : 5}。${rubricLine}${feedback.blindSpot || ''}`,
    })
    startNewSession()
    switchExpertMode('guided')
    switchLabMode('live')
    requestAnimationFrame(() => {
      setLabMessageToSend(msg)
      setAutoSendLabMessage(true)
    })
  }

  const regenerateScenario = () => {
    try {
      sessionStorage.removeItem(growthCoachL5StorageKey(activeProjectId))
    } catch {
      /* ignore */
    }
    setScenario('')
    setPrefillHint('')
    setFieldValues(emptyFields())
  }

  return (
    <div className="wb-lab-bridge relative flex min-h-0 w-full min-w-0 flex-col overflow-hidden">
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden pb-4 pt-3">
        {/*
          不在此层再套 .wb-thread：外层 LabPanel 的 guide-inner 已是 wb-thread，避免双窄栏+错位感
        */}
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
          <div className="mb-1 flex-shrink-0 px-6 md:px-8">
            <h2 className="font-display text-base font-semibold text-lab-ink">成长教练 · P0</h2>
            <p className="mt-1 text-xs text-lab-muted">
              模板：<span className="font-medium text-lab-ink">竞品分析（{P0_TEMPLATE}）</span>
              {' · '}
              方法论：<span className="font-medium" style={{ color: 'var(--color-accent-blue)' }}>
                {methodologyName}
              </span>
              {methodology?.hook && ` — ${methodology.hook}`}
            </p>
          </div>

          <div className="min-h-0 w-full flex-1 overflow-y-auto px-6 pb-4 md:px-8">
            {step === 'intro' && (
              <div className="w-full rounded-xl border border-lab-border-subtle bg-lab-overlay p-6 shadow-card md:p-8">
                <p className="text-sm leading-relaxed text-lab-ink font-body">
                  本轮走通：<strong>L1 概念 → L2 方法 → L3 操作清单 → L4 Forest 案例带读 → L5 场景练习</strong>
                  ，最后 <strong>AI 评分（十分制：四维度完整性 0–4 + 深度 0–4 + 洞察 0–2）</strong>
                  与<strong>实时演练追问</strong>。L1–L4 为内置教材（零等待）；L5 需配置 API Key 生成场景与评分。
                </p>
                <p className="mt-3 text-sm leading-relaxed text-lab-muted font-body">
                  <strong className="text-lab-ink">与左侧项目：</strong>
                  L1–L4 教通用框架；进入 <strong>L5</strong> 后题干中的己方应与<strong>当前项目同名</strong>，竞品为
                  <strong>真实品牌</strong>。数字与引用请自行交叉验证（模型无法实时联网）。
                </p>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-6 w-full rounded-lab py-2.5 text-sm font-medium lab-btn-primary font-sans"
                >
                  开始学习（L1）
                </button>
              </div>
            )}

            {step === 1 && <L1ConceptCard onNext={() => setStep(2)} />}

            {step === 2 && <L2MethodFrame onNext={() => setStep(3)} />}

            {step === 3 && (
              <L3OperationChecklist onNext={() => setStep(4)} onSkipToCase={() => setStep(4)} />
            )}

            {step === 4 && (
              <L4CoachWalkthrough onNext={() => setStep('pathSelect')} />
            )}

            {step === 'pathSelect' && (
              <PathSelectorModal
                projectName={projectName}
                hasProject={activeProjectId != null}
                onSelectProjectMode={() => {
                  setPracticeMode('project')
                  setStep(5)
                }}
                onSelectIndependentMode={() => setStep('independentMode')}
              />
            )}

            {step === 'independentMode' && (
              <IndependentPracticePanel
                onConfirm={(products) => {
                  setSelectedProducts(products)
                  setPracticeMode('independent')
                  setStep(5)
                }}
              />
            )}

            {step === 5 && (
              <div className="w-full">
                {exerciseLoading && !scenario && (
                  <div className="mb-2 text-xs text-lab-muted">正在生成场景与预填…</div>
                )}
                <L5ExercisePanel
                  projectId={activeProjectId}
                  scenario={scenario}
                  prefillHint={prefillHint}
                  initialFields={fieldValues}
                  ownProductName={projectName}
                  attemptNumber={attemptNumber}
                  disabled={exerciseLoading || !scenario.trim()}
                  scoreLoading={scoreLoading}
                  onSubmitAnswers={handleSubmitExercise}
                />
                {scenario && (
                  <button
                    type="button"
                    onClick={regenerateScenario}
                    className="mt-2 w-full text-xs text-lab-muted underline hover:text-lab-accent-warm"
                  >
                    重新生成场景
                  </button>
                )}
              </div>
            )}

            {step === 'feedback' && (
              <div className="w-full space-y-4">
                <AIFeedbackPanel
                  feedback={feedback}
                  loading={scoreLoading}
                  onGoLive={handleGoLive}
                  onOpenMockInterview={() => {
                    setMockSessionKey((k) => k + 1)
                    setMockInterviewOpen(true)
                  }}
                />
                <button
                  type="button"
                  onClick={resetRound}
                  className="w-full rounded-lab border border-lab-border-subtle py-2 text-sm text-lab-muted hover:bg-lab-accent-dim hover:text-lab-accent-warm"
                >
                  再来一轮（从 L1 重新走）
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <MockInterviewModal
        sessionKey={mockSessionKey}
        isOpen={mockInterviewOpen}
        onClose={() => setMockInterviewOpen(false)}
        projectName={projectName}
        scenario={scenario}
        fieldValues={fieldValues}
        feedback={feedback}
        hintCountsByField={lastHintCounts}
      />
    </div>
  )
}
