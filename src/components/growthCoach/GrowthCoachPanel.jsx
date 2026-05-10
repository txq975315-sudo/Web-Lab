import { useState, useEffect, useCallback } from 'react'
import { useLab } from '../../context/LabContext'
import { chatComplete } from '../../utils/aiApi'
import { extractJsonBlock } from '../../utils/extractJsonBlock'
import { getMethodologyForTemplate } from '../../config/methodology'
import * as prompts from '../../config/growthCoachPrompts'
import { recordCoachSession, getTemplateAttempts } from '../../utils/growthCoachStore'
import KnowledgeCard from './KnowledgeCard'
import ExerciseForm from './ExerciseForm'
import AIFeedbackPanel from './AIFeedbackPanel'

const P0_TEMPLATE = 'competitive_analysis'

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
    ourAdvantage: ''
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
    startNewSession
  } = useLab()

  const project = projectTree.find(p => p.id === activeProjectId)
  const projectName = project?.name || '当前项目'
  const methodology = getMethodologyForTemplate(P0_TEMPLATE)
  const methodologyName = methodology?.name || '多维拆解法'

  const [step, setStep] = useState('intro')
  const [cardLoading, setCardLoading] = useState(false)
  const [cardError, setCardError] = useState(null)
  const [cardData, setCardData] = useState(null)

  const [exerciseLoading, setExerciseLoading] = useState(false)
  const [scenario, setScenario] = useState('')
  const [prefillHint, setPrefillHint] = useState('')
  const [fieldValues, setFieldValues] = useState(emptyFields)

  const [scoreLoading, setScoreLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const attemptNumber = getTemplateAttempts(P0_TEMPLATE)

  const resetRound = useCallback(() => {
    setStep('intro')
    setCardData(null)
    setCardError(null)
    setScenario('')
    setPrefillHint('')
    setFieldValues(emptyFields())
    setFeedback(null)
  }, [])

  useEffect(() => {
    if (step !== 'card' || cardData) return
    let cancelled = false
    ;(async () => {
      setCardLoading(true)
      setCardError(null)
      try {
        const userPrompt = prompts.buildKnowledgeCardPrompt(projectName, methodologyName)
        const text = await chatComplete([
          { role: 'system', content: prompts.SYSTEM_JSON_PUBLIC_GROUNDING },
          { role: 'user', content: userPrompt }
        ])
        if (cancelled) return
        const json = extractJsonBlock(text)
        setCardData(json)
      } catch (e) {
        if (!cancelled) setCardError(e.message || String(e))
      } finally {
        if (!cancelled) setCardLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [step, cardData, projectName, methodologyName])

  useEffect(() => {
    if (step !== 'exercise' || scenario) return
    let cancelled = false
    ;(async () => {
      setExerciseLoading(true)
      try {
        const userPrompt = prompts.buildExerciseScenarioPrompt(projectName, methodologyName, attemptNumber)
        const text = await chatComplete([
          { role: 'system', content: prompts.SYSTEM_JSON_PUBLIC_GROUNDING },
          { role: 'user', content: userPrompt }
        ])
        if (cancelled) return
        const json = extractJsonBlock(text)
        setScenario(json.scenario || '')
        setPrefillHint(json.prefillHint || '')
        const raw = json.fields || {}
        setFieldValues(prev => ({ ...emptyFields(), ...prev, ...raw }))
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

  const handleFieldChange = (key, value) => {
    setFieldValues(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmitExercise = async () => {
    setScoreLoading(true)
    try {
      const userPrompt = prompts.buildScoreExercisePrompt(
        scenario,
        JSON.stringify(fieldValues, null, 0),
        methodologyName
      )
      const text = await chatComplete([
        { role: 'system', content: prompts.SYSTEM_JSON_PUBLIC_GROUNDING },
        { role: 'user', content: userPrompt }
      ])
      const json = extractJsonBlock(text)
      setFeedback(json)
      recordCoachSession(P0_TEMPLATE, 'multi_dimensional', Number(json.overallScore) || 0)
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
    const userSummary = keys.map(k => `${k}: ${(fieldValues[k] || '').slice(0, 120)}`).join('\n')
    const msg = prompts.buildCoachHandoffMessage({
      projectName,
      scenario,
      userFieldsSummary: userSummary,
      feedbackSummary: `总分 ${feedback.overallScore}。${feedback.blindSpot || ''}`
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
    setScenario('')
    setPrefillHint('')
    setFieldValues(emptyFields())
  }

  return (
    <div className="wb-lab-bridge relative flex h-full flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          background:
            'radial-gradient(ellipse 120% 80% at 50% -20%, color-mix(in srgb, var(--wb-mint) 90%, transparent), transparent)',
        }}
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden pb-4 pt-3">
        <div className="wb-thread flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="mb-3 flex-shrink-0 px-6 md:px-8">
          <h2 className="font-display text-base font-semibold text-lab-ink">成长教练 · P0</h2>
          <p className="mt-1 text-xs text-lab-muted">
            模板：<span className="font-medium text-lab-ink">竞品分析（{P0_TEMPLATE}）</span>
            {' · '}
            方法论：<span className="font-medium" style={{ color: 'var(--color-accent-blue)' }}>{methodologyName}</span>
            {methodology?.hook && ` — ${methodology.hook}`}
          </p>
        </div>

        <div className="min-h-0 w-full flex-1 overflow-y-auto">
          {step === 'intro' && (
            <div className="w-full rounded-xl border border-lab-border-subtle bg-lab-overlay p-6 shadow-card md:p-8">
              <p className="text-sm leading-relaxed text-lab-ink font-body">
                本轮将走通：<strong>知识卡片 → 场景练习 → AI 评分 → 右侧实时演练追问</strong>
                。内容会要求结合<strong>公开可查</strong>的行业事实、媒体报道与真实成败案例来理解 $APPEALS（模型无法实时上网，具体数字与引用请你务必自行交叉验证）。
                请先确认右上角已配置 API Key。
              </p>
              <p className="mt-3 text-sm leading-relaxed text-lab-muted font-body">
                <strong className="text-lab-ink">和左侧项目的关系：</strong>
                知识卡片里的真实案例、方法论，是在教<strong>通用打法</strong>，与左侧当前选哪个项目<strong>没有硬性绑定</strong>，你可以先当「行业课」来读。
                进入<strong>场景练习</strong>后，题目正文里的<strong>己方</strong>应与<strong>左侧当前项目同名</strong>，<strong>竞品</strong>为 AI 指定的<strong>真实品牌</strong>——这样是在练框架：己方哪怕是早期概念名也可以。
                完成一轮后可点<strong>「再来一轮」</strong>或练习里的<strong>「重新生成场景」</strong>换题继续练；不限一局。
              </p>
              <button
                type="button"
                onClick={() => setStep('card')}
                className="mt-6 w-full rounded-lab py-2.5 text-sm font-medium lab-btn-primary font-sans"
              >
                开始：生成知识卡片
              </button>
            </div>
          )}

          {step === 'card' && (
            <div className="w-full">
              <KnowledgeCard
                data={cardData}
                loading={cardLoading}
                error={cardError}
                ownProductName={projectName}
                onContinue={() => setStep('exercise')}
              />
            </div>
          )}

          {step === 'exercise' && (
            <div className="w-full">
              {exerciseLoading && !scenario && (
                <div className="mb-2 text-xs text-lab-muted">正在生成场景与预填…</div>
              )}
              <ExerciseForm
                scenario={scenario || '…'}
                prefillHint={prefillHint}
                values={fieldValues}
                onChange={handleFieldChange}
                onSubmit={handleSubmitExercise}
                disabled={scoreLoading || exerciseLoading}
                attemptNumber={attemptNumber}
                ownProductName={projectName}
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
              />
              <button
                type="button"
                onClick={resetRound}
                className="w-full rounded-lab border border-lab-border-subtle py-2 text-sm text-lab-muted hover:bg-lab-accent-dim hover:text-lab-accent-warm"
              >
                再来一轮
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
