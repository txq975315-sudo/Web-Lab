import { useEffect, useState, useCallback } from 'react'
import { STORAGE_KEYS } from '../../config/storageKeys.js'
import { getHypothesisSession } from './hypothesisStore.js'
import { findAwaitingAnswerSlot } from './hypothesisTypes.js'
import { bootstrapHypothesisSession, submitHypothesisAnswer } from './hypothesisApi.js'
import { HypothesisPracticeRecordSection } from './HypothesisSessionPracticeRecord.jsx'
import BusinessCanvasViewer from './BusinessCanvasViewer.jsx'

/**
 * @param {import('./hypothesisTypes.js').HypothesisSession|null|undefined} session
 */
function shouldConfirmBeforeExit(session) {
  if (!session) return false
  if (session.status === 'completed' && session.canvas) return false
  return true
}

/**
 * @param {object} props
 * @param {string} props.sessionId
 * @param {() => void} props.onExit
 * @param {() => void} [props.onRestart]
 */
export default function HypothesisSessionRunner({ sessionId, onExit, onRestart }) {
  const [session, setSession] = useState(() => getHypothesisSession(sessionId))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(/** @type {string|null} */ (null))
  const [answerDraft, setAnswerDraft] = useState('')

  const refresh = useCallback(() => {
    setSession(getHypothesisSession(sessionId))
  }, [sessionId])

  const requestExit = useCallback(() => {
    const s = getHypothesisSession(sessionId)
    if (shouldConfirmBeforeExit(s)) {
      if (!window.confirm('确定要退出吗？进度将保存。')) return
    }
    onExit()
  }, [sessionId, onExit])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      requestExit()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [requestExit])

  useEffect(() => {
    let cancelled = false
    const s = getHypothesisSession(sessionId)
    if (!s) {
      setError('会话不存在或已删除')
      return
    }
    setSession(s)
    if (s.status !== 'ideating') return

    setBusy(true)
    setError(null)
    ;(async () => {
      try {
        const config = localStorage.getItem(STORAGE_KEYS.AI_CONFIG)
        if (!config) {
          throw new Error('请先在右上角「设置」中填写 API Key')
        }
        await bootstrapHypothesisSession(sessionId)
        if (!cancelled) refresh()
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (!cancelled) setBusy(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [sessionId, refresh])

  const slot = session ? findAwaitingAnswerSlot(session) : null
  const currentQuestion =
    session && slot
      ? session.rounds[slot.roundIdx].questions[slot.qIdx].questionText
      : ''

  const progress =
    session && session.status !== 'ideating'
      ? (() => {
          let answered = 0
          for (const r of session.rounds) {
            for (const q of r.questions) {
              if (q.answerText) answered++
            }
          }
          return answered
        })()
      : 0

  const handleSubmitAnswer = async (e) => {
    e.preventDefault()
    if (!answerDraft.trim() || busy) return
    setBusy(true)
    setError(null)
    try {
      await submitHypothesisAnswer(sessionId, answerDraft.trim())
      setAnswerDraft('')
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  const handleCopyCanvas = async () => {
    if (!session?.canvas?.rawMarkdown) return
    const text = session.canvas.rawMarkdown
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      window.prompt('复制以下内容：', text)
    }
  }

  if (error && session?.status === 'ideating') {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-6 md:px-6">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-warning)' }}>
          初始化失败：{error}
        </p>
        <p className="text-xs" style={{ color: 'var(--wb-muted)' }}>
          请检查网络与 API Key 后重试。
        </p>
        <button type="button" className="wb-btn-ghost w-fit px-4 py-2 text-xs" onClick={requestExit}>
          结束练习
        </button>
      </div>
    )
  }

  if (error && !session) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-6 md:px-6">
        <p className="text-sm" style={{ color: 'var(--color-warning)' }}>
          {error}
        </p>
        <button type="button" className="wb-btn-ghost w-fit px-4 py-2 text-xs" onClick={requestExit}>
          结束练习
        </button>
      </div>
    )
  }

  if (session?.status === 'completed' && session.canvas) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold" style={{ color: 'var(--wb-text)' }}>
            你的商业假设画布
          </h2>
          <button
            type="button"
            className="pressure-session-exit-btn rounded-full px-3 py-1.5 text-xs font-medium hover:bg-[rgba(15,23,42,0.06)]"
            style={{ color: 'var(--wb-muted)' }}
            onClick={requestExit}
            title="结束（Esc）"
          >
            结束
          </button>
        </div>

        <HypothesisPracticeRecordSection session={session} />

        <BusinessCanvasViewer session={session} />

        <div className="flex flex-wrap gap-2 pt-2">
          <button type="button" className="wb-btn-primary px-4 py-2 text-xs" onClick={handleCopyCanvas}>
            复制画布
          </button>
          <button
            type="button"
            className="wb-btn-ghost px-4 py-2 text-xs"
            onClick={() => {
              onRestart?.()
            }}
          >
            再来一次
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b px-4 py-3 md:px-6" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold" style={{ color: 'var(--wb-text)' }}>
            {session?.name || '假设构建'}
          </p>
          <p className="text-[11px]" style={{ color: 'var(--wb-muted)' }}>
            第 {session ? Math.min(4, (findAwaitingAnswerSlot(session)?.roundIdx ?? 3) + 1) : 1} 轮 · 进度 {progress}/8
          </p>
        </div>
        <button
          type="button"
          className="pressure-session-exit-btn shrink-0 rounded-full px-3 py-1.5 text-xs font-medium hover:bg-[rgba(15,23,42,0.06)]"
          style={{ color: 'var(--wb-muted)' }}
          title="进度已保存至本机；结束（Esc）"
          onClick={requestExit}
          disabled={busy}
        >
          结束
        </button>
      </div>

      {error && (
        <div className="shrink-0 px-4 py-2 text-xs" style={{ color: 'var(--color-warning)', background: 'var(--color-warning-dim)' }}>
          {error}
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 md:px-6">
        <HypothesisPracticeRecordSection session={session} />
        {busy && session?.status === 'ideating' ? (
          <p className="text-sm" style={{ color: 'var(--wb-muted)' }}>
            正在生成首轮追问…
          </p>
        ) : (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--wb-muted)' }}>
              当前追问
            </p>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--wb-text)' }}>
              {currentQuestion || (busy ? '生成中…' : '—')}
            </p>

            <form onSubmit={handleSubmitAnswer} className="mt-6 flex flex-col gap-3">
              <textarea
                value={answerDraft}
                onChange={(e) => setAnswerDraft(e.target.value)}
                rows={5}
                disabled={busy || !currentQuestion}
                placeholder="写下你的回答…"
                className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none"
                style={{
                  border: '1px solid var(--color-border-subtle)',
                  background: 'var(--color-bg-raised)',
                  color: 'var(--color-text-primary)',
                }}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={busy || !currentQuestion || !answerDraft.trim()}
                  className="wb-btn-primary px-6 py-2.5 text-sm disabled:opacity-50"
                  style={{ borderRadius: 'var(--wb-radius-btn, 20px)' }}
                >
                  {busy ? '提交中…' : '提交回答'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
