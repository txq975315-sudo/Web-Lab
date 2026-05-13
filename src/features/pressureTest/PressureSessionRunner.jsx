import { useEffect, useState, useCallback } from 'react'
import { STORAGE_KEYS } from '../../config/storageKeys.js'
import { getPressureSession } from './pressureSessionStore.js'
import { findAwaitingAnswerSlot } from './pressureTypes.js'
import { bootstrapPressureSession, submitPressureAnswer } from './pressureApi.js'

/**
 * @param {object} props
 * @param {string} props.sessionId
 * @param {() => void} props.onExit
 * @param {() => void} [props.onOpenGrowthCoach]
 */
export default function PressureSessionRunner({ sessionId, onExit, onRestart, onOpenGrowthCoach }) {
  const [session, setSession] = useState(() => getPressureSession(sessionId))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(/** @type {string|null} */ (null))
  const [answerDraft, setAnswerDraft] = useState('')

  const refresh = useCallback(() => {
    setSession(getPressureSession(sessionId))
  }, [sessionId])

  useEffect(() => {
    let cancelled = false
    const s = getPressureSession(sessionId)
    if (!s) {
      setError('会话不存在或已删除')
      return
    }
    setSession(s)
    if (s.status !== 'deconstructing') return

    setBusy(true)
    setError(null)
    ;(async () => {
      try {
        const config = localStorage.getItem(STORAGE_KEYS.AI_CONFIG)
        if (!config) {
          throw new Error('请先在右上角「设置」中填写 API Key')
        }
        await bootstrapPressureSession(sessionId)
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
    session && session.status !== 'deconstructing'
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
      await submitPressureAnswer(sessionId, answerDraft.trim())
      setAnswerDraft('')
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  const handleCopyReport = async () => {
    if (!session?.blindSpotReport) return
    const lines = []
    lines.push(`# 压力测试 · 盲区快照`)
    lines.push('')
    lines.push(`原始 idea：${session.originalIdea}`)
    lines.push(
      `判定：${session.blindSpotReport.verdict === 'needs_rethink' ? '建议深入思考' : '基本可行'}`,
    )
    lines.push(session.blindSpotReport.verdictText || '')
    lines.push('')
    lines.push('## 盲区清单')
    for (const b of session.blindSpotReport.blindSpots || []) {
      lines.push(`- [${b.severity}] ${b.dimension}：${b.description} → ${b.suggestion}`)
    }
    const text = lines.join('\n')
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      window.prompt('复制以下内容：', text)
    }
  }

  if (error && session?.status === 'deconstructing') {
    return (
      <div className="flex flex-col gap-3 px-4 py-6 md:px-6">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-warning)' }}>
          拆解失败：{error}
        </p>
        <p className="text-xs" style={{ color: 'var(--wb-muted)' }}>
          请检查网络与 API Key 后重试，或返回对话练习使用原有实时演练。
        </p>
        <button type="button" className="wb-btn-ghost w-fit px-4 py-2 text-xs" onClick={onExit}>
          返回
        </button>
      </div>
    )
  }

  if (error && !session) {
    return (
      <div className="flex flex-col gap-3 px-4 py-6 md:px-6">
        <p className="text-sm" style={{ color: 'var(--color-warning)' }}>
          {error}
        </p>
        <button type="button" className="wb-btn-ghost w-fit px-4 py-2 text-xs" onClick={onExit}>
          返回
        </button>
      </div>
    )
  }

  if (session?.status === 'completed' && session.blindSpotReport) {
    const rep = session.blindSpotReport
    const hard = rep.verdict === 'needs_rethink'
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold" style={{ color: 'var(--wb-text)' }}>
            思维盲区快照
          </h2>
          <button
            type="button"
            className="rounded-full px-3 py-1.5 text-xs font-medium hover:bg-[rgba(15,23,42,0.06)]"
            style={{ color: 'var(--wb-muted)' }}
            onClick={onExit}
          >
            返回对话练习
          </button>
        </div>

        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{
            borderColor: hard ? 'color-mix(in srgb, var(--color-warning) 35%, transparent)' : 'var(--color-border-subtle)',
            background: hard ? 'var(--color-warning-dim)' : 'var(--color-bg-raised)',
            color: 'var(--wb-text)',
          }}
        >
          <p className="font-semibold">{hard ? '建议深入思考' : '基本可行'}</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--wb-muted)' }}>
            {rep.verdictText}
          </p>
        </div>

        {Array.isArray(rep.deconstructionSnapshot) && rep.deconstructionSnapshot.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--wb-muted)' }}>
              拆解快照
            </p>
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <table className="w-full min-w-[280px] text-left text-xs">
                <thead>
                  <tr style={{ background: 'var(--color-bg-overlay)' }}>
                    <th className="px-3 py-2 font-medium">维度</th>
                    <th className="px-3 py-2 font-medium">你的描述</th>
                    <th className="px-3 py-2 font-medium">追问发现</th>
                  </tr>
                </thead>
                <tbody>
                  {rep.deconstructionSnapshot.map((row, i) => (
                    <tr key={i} className="border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                      <td className="px-3 py-2 align-top">{row.dimension}</td>
                      <td className="px-3 py-2 align-top">{row.userClaim}</td>
                      <td className="px-3 py-2 align-top">{row.aiFinding}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--wb-muted)' }}>
            盲区清单
          </p>
          <ul className="space-y-2">
            {(rep.blindSpots || []).map((b, i) => (
              <li
                key={i}
                className="rounded-xl border px-3 py-2 text-xs leading-relaxed"
                style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--wb-text)' }}
              >
                <span className="font-medium">
                  [{b.severity === 'high' ? '高' : b.severity === 'medium' ? '中' : '低'}] {b.dimension}
                </span>
                ：{b.description}
                {b.suggestion ? (
                  <span className="mt-1 block" style={{ color: 'var(--wb-muted)' }}>
                    建议：{b.suggestion}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button type="button" className="wb-btn-primary px-4 py-2 text-xs" onClick={handleCopyReport}>
            复制报告
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
          <button
            type="button"
            className="wb-btn-ghost px-4 py-2 text-xs"
            onClick={() => {
              onOpenGrowthCoach?.()
            }}
          >
            去成长教练
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
            {session?.name || '压力测试'}
          </p>
          <p className="text-[11px]" style={{ color: 'var(--wb-muted)' }}>
            标准档 · 第{' '}
            {session ? Math.min(3, (findAwaitingAnswerSlot(session)?.roundIdx ?? 2) + 1) : 1} 轮 · 进度 {progress}/9
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium hover:bg-[rgba(15,23,42,0.06)]"
          style={{ color: 'var(--wb-muted)' }}
          title="进度已写入本机，稍后在「已保存的会话」里继续"
          onClick={onExit}
          disabled={busy}
        >
          保存并退出
        </button>
      </div>

      {error && (
        <div className="shrink-0 px-4 py-2 text-xs" style={{ color: 'var(--color-warning)', background: 'var(--color-warning-dim)' }}>
          {error}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6">
        {busy && session?.status === 'deconstructing' ? (
          <p className="text-sm" style={{ color: 'var(--wb-muted)' }}>
            正在拆解 idea 并生成首轮追问…
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
