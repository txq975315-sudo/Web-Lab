import { useState, useEffect, useRef } from 'react'
import { chatComplete } from '../../../utils/aiApi'
import { extractJsonBlock } from '../../../utils/extractJsonBlock'
import * as prompts from '../../../config/growthCoachPrompts'
import { augmentSystemPromptWithTerminology } from '../../../utils/aiTerminologyPreference.js'
import CoachFormattedText from '../CoachFormattedText'

const MAX_USER_ROUNDS = 3

/**
 * 成长教练 · 评分后内嵌模拟追问（不切换 live 模式）
 */
export default function MockInterviewModal({
  sessionKey,
  isOpen,
  onClose,
  projectName,
  scenario,
  fieldValues,
  feedback,
  hintCountsByField,
}) {
  const [phase, setPhase] = useState('idle')
  const [lines, setLines] = useState([])
  const [input, setInput] = useState('')
  const [userRound, setUserRound] = useState(0)
  const [focusLabel, setFocusLabel] = useState('')
  const [networkError, setNetworkError] = useState(null)

  const projectNameRef = useRef(projectName)
  const scenarioRef = useRef(scenario)
  const fieldValuesRef = useRef(fieldValues)
  const feedbackRef = useRef(feedback)
  projectNameRef.current = projectName
  scenarioRef.current = scenario
  fieldValuesRef.current = fieldValues
  feedbackRef.current = feedback

  useEffect(() => {
    if (!isOpen) {
      setPhase('idle')
      setLines([])
      setInput('')
      setUserRound(0)
      setFocusLabel('')
      setNetworkError(null)
      return
    }
    let cancelled = false
    ;(async () => {
      setPhase('loading')
      setNetworkError(null)
      setLines([])
      setInput('')
      setUserRound(0)
      setFocusLabel('')
      try {
        const fb = feedbackRef.current || {}
        const fieldsJson = JSON.stringify(fieldValuesRef.current || {}, null, 0)
        const userPrompt = prompts.buildMockInterviewOpenPrompt({
          projectName: projectNameRef.current,
          scenario: scenarioRef.current || '',
          fieldsJson,
          overallScore: fb.overallScore ?? '—',
          weakestAspects: fb.weakestAspects,
          blindSpot: fb.blindSpot,
          followUpHints: fb.followUpHints,
        })
        const text = await chatComplete([
          { role: 'system', content: augmentSystemPromptWithTerminology(prompts.SYSTEM_JSON_PUBLIC_GROUNDING) },
          { role: 'user', content: userPrompt },
        ])
        if (cancelled) return
        const json = extractJsonBlock(text)
        const q = json.openingQuestion || '请用一两句话说说：你认为这次分析里最大的不确定点在哪里？'
        setFocusLabel(json.focusLabel || '')
        setLines([{ role: 'coach', content: q }])
        setPhase('chat')
      } catch (e) {
        if (!cancelled) {
          setNetworkError(e.message || String(e))
          setPhase('error')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isOpen, sessionKey])

  const handleRetryOpen = () => {
    setNetworkError(null)
    setPhase('loading')
    setLines([])
    ;(async () => {
      try {
        const fb = feedbackRef.current || {}
        const fieldsJson = JSON.stringify(fieldValuesRef.current || {}, null, 0)
        const userPrompt = prompts.buildMockInterviewOpenPrompt({
          projectName: projectNameRef.current,
          scenario: scenarioRef.current || '',
          fieldsJson,
          overallScore: fb.overallScore ?? '—',
          weakestAspects: fb.weakestAspects,
          blindSpot: fb.blindSpot,
          followUpHints: fb.followUpHints,
        })
        const text = await chatComplete([
          { role: 'system', content: augmentSystemPromptWithTerminology(prompts.SYSTEM_JSON_PUBLIC_GROUNDING) },
          { role: 'user', content: userPrompt },
        ])
        const json = extractJsonBlock(text)
        const q = json.openingQuestion || '请用一两句话说说：你认为这次分析里最大的不确定点在哪里？'
        setFocusLabel(json.focusLabel || '')
        setLines([{ role: 'coach', content: q }])
        setPhase('chat')
      } catch (e) {
        setNetworkError(e.message || String(e))
        setPhase('error')
      }
    })()
  }

  const handleSend = async () => {
    const reply = input.trim()
    if (!reply || phase !== 'chat') return
    const prevLines = lines
    const nextRound = userRound + 1
    const nextLines = [...lines, { role: 'user', content: reply }]
    setLines(nextLines)
    setInput('')
    setNetworkError(null)
    setPhase('loading')
    const transcript = nextLines
      .map((t) => `${t.role === 'coach' ? 'Coach' : '用户'}：\n${t.content}`)
      .join('\n\n')
    try {
      const userPrompt = prompts.buildMockInterviewTurnPrompt({
        transcript,
        userAnswer: reply,
        round: nextRound,
        maxRounds: MAX_USER_ROUNDS,
      })
      const text = await chatComplete([
        { role: 'system', content: augmentSystemPromptWithTerminology(prompts.SYSTEM_JSON_PUBLIC_GROUNDING) },
        { role: 'user', content: userPrompt },
      ])
      const json = extractJsonBlock(text)
      let coachBlock = json.coachMessage || ''
      if (json.followUpQuestion && !json.done) {
        coachBlock += `\n\n---\n\n**下一问：**\n\n${json.followUpQuestion}`
      }
      if (json.done && json.closingSummary) {
        coachBlock += `\n\n---\n\n### 收束小结\n\n${json.closingSummary}`
      }
      const after = [...nextLines, { role: 'coach', content: coachBlock }]
      setLines(after)
      setUserRound(nextRound)
      const forceEnd = nextRound >= MAX_USER_ROUNDS
      setNetworkError(null)
      if (json.done || forceEnd) {
        setPhase('summary')
      } else {
        setPhase('chat')
      }
    } catch (e) {
      setLines(prevLines)
      setInput(reply)
      setNetworkError(e.message || String(e))
      setPhase('chat')
    }
  }

  if (!isOpen) return null

  const hintTotal = hintCountsByField
    ? Object.values(hintCountsByField).reduce((a, v) => a + (Number(v) || 0), 0)
    : 0

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(15,23,42,0.45)] p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mock-interview-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-lab-border-subtle bg-lab-overlay shadow-elevated">
        <div className="flex-shrink-0 border-b border-lab-border-subtle bg-lab-raised px-4 py-3">
          <h2 id="mock-interview-title" className="font-display text-sm font-semibold text-lab-ink">
            模拟检验 · 合伙人追问
          </h2>
          {focusLabel && <p className="mt-0.5 text-[11px] text-lab-muted">本轮聚焦：{focusLabel}</p>}
          <p className="mt-1 text-[10px] text-lab-faint">
            内嵌在「学」中，不切换实时演练；练习提示共点击 {hintTotal} 次（各字段 0–3 计）
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          {phase === 'loading' && lines.length === 0 && (
            <p className="text-xs text-lab-muted">正在生成第一轮追问…</p>
          )}
          {networkError && phase === 'error' && (
            <div className="rounded-lg border border-lab-warning/40 bg-[var(--color-warning-dim)] p-3 text-xs text-lab-ink">
              {networkError}
              <button
                type="button"
                className="mt-2 w-full rounded-lab py-2 text-xs lab-btn-primary"
                onClick={handleRetryOpen}
              >
                重试
              </button>
            </div>
          )}
          {lines.map((row, i) => (
            <div
              key={i}
              className={`rounded-lg border px-3 py-2 text-sm ${
                row.role === 'coach'
                  ? 'border-lab-border-subtle bg-lab-raised text-lab-ink'
                  : 'border-lab-border-subtle bg-lab-overlay text-lab-ink'
              }`}
            >
              <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-lab-faint">
                {row.role === 'coach' ? 'Coach' : '你'}
              </div>
              <div className="coach-md--surface text-xs leading-relaxed">
                <CoachFormattedText text={row.content} compact indentParagraphs={false} />
              </div>
            </div>
          ))}
          {phase === 'loading' && lines.length > 0 && (
            <p className="text-xs text-lab-muted">Coach 正在回复…</p>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-lab-border-subtle p-4">
          {phase === 'chat' && userRound < MAX_USER_ROUNDS && (
            <>
              {networkError && (
                <div className="mb-2 rounded-md border border-lab-warning/35 bg-[var(--color-warning-dim)] px-2 py-1.5 text-[11px] text-lab-ink">
                  {networkError}
                </div>
              )}
              <textarea
                className="mb-2 min-h-[4.5rem] w-full resize-y rounded-lg border border-lab-border bg-lab-overlay px-2 py-1.5 text-sm text-lab-ink focus:border-lab-accent focus:outline-none font-body"
                placeholder="输入你的回答…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="button"
                disabled={phase !== 'chat' || !input.trim()}
                onClick={handleSend}
                className="w-full rounded-lab py-2.5 text-sm font-medium lab-btn-primary font-sans disabled:opacity-50"
              >
                发送回答
              </button>
            </>
          )}
          {phase === 'summary' && (
            <p className="mb-2 text-center text-[11px] text-lab-muted">本轮检验已结束（最多 {MAX_USER_ROUNDS} 轮作答）</p>
          )}
          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full rounded-lab border border-lab-border-subtle py-2 text-sm text-lab-muted hover:bg-lab-accent-dim"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
