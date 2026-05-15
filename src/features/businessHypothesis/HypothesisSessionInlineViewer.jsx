import { useCallback, useEffect, useState } from 'react'
import { STORAGE_KEYS } from '../../config/storageKeys.js'
import { getHypothesisSession } from './hypothesisStore.js'
import { findAwaitingAnswerSlot } from './hypothesisTypes.js'
import { HypothesisPracticeRecordSection } from './HypothesisSessionPracticeRecord.jsx'
import BusinessCanvasViewer from './BusinessCanvasViewer.jsx'

const SESSIONS_CHANGED = 'thinking-lab-hypothesis-sessions-changed'

/**
 * @param {import('./hypothesisTypes.js').HypothesisSession} s
 */
function sessionProgressLabel(s) {
  if (s.status === 'completed') return '已完成'
  if (s.status === 'ideating') return '初始化中…'
  let n = 0
  for (const r of s.rounds || []) {
    for (const q of r.questions || []) {
      if (q.answerText) n++
    }
  }
  return `${n}/8 已答`
}

/**
 * @param {object} props
 * @param {string} props.sessionId
 * @param {() => void} props.onClose
 * @param {(id: string) => void} [props.onEnterPractice]
 */
export default function HypothesisSessionInlineViewer({ sessionId, onClose, onEnterPractice }) {
  const [session, setSession] = useState(() => getHypothesisSession(sessionId))

  const refresh = useCallback(() => {
    setSession(getHypothesisSession(sessionId))
  }, [sessionId])

  useEffect(() => {
    refresh()
  }, [sessionId, refresh])

  useEffect(() => {
    const onCustom = () => refresh()
    const onStorage = (e) => {
      if (e.key === STORAGE_KEYS.HYPOTHESIS_ENGINE_SESSIONS || e.key === null) refresh()
    }
    window.addEventListener(SESSIONS_CHANGED, onCustom)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(SESSIONS_CHANGED, onCustom)
      window.removeEventListener('storage', onStorage)
    }
  }, [refresh])

  const slot = session ? findAwaitingAnswerSlot(session) : null
  const previewQuestion =
    session && slot ? session.rounds[slot.roundIdx].questions[slot.qIdx].questionText : ''

  if (!session) {
    return (
      <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-transparent">
        <div
          className="flex shrink-0 items-start justify-between border-b px-3 py-2"
          style={{ borderColor: 'rgba(15, 23, 42, 0.08)' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--wb-text)' }}>
            假设构建
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-lab-muted transition-colors hover:bg-[rgba(15,23,42,0.06)] hover:text-lab-ink"
            aria-label="关闭"
            title="关闭"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-6 text-center">
          <p className="text-2xl" aria-hidden>📋</p>
          <p className="text-sm font-medium" style={{ color: 'var(--wb-text)' }}>
            会话不存在或已删除
          </p>
          <p className="text-xs" style={{ color: 'var(--wb-muted)' }}>
            该记录可能已被清空，请关闭此栏后从历史列表重选。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-transparent">
      <div
        className="flex shrink-0 items-start justify-between gap-2 border-b px-3 py-2"
        style={{ borderColor: 'rgba(15, 23, 42, 0.08)' }}
      >
        <div className="min-w-0 flex-1 pr-1">
          <h2 className="truncate text-sm font-semibold" style={{ color: 'var(--wb-text)' }}>
            {session.name || '假设构建'}
          </h2>
          <p className="mt-0.5 text-[10px]" style={{ color: 'var(--wb-muted)' }}>
            仅查看 · {sessionProgressLabel(session)}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
          {onEnterPractice ? (
            <button
              type="button"
              onClick={() => onEnterPractice(sessionId)}
              className="rounded-lg px-2 py-1 text-[10px] font-medium text-[var(--color-text-inverted)] transition-opacity hover:opacity-95"
              style={{ backgroundColor: 'var(--color-accent-green)', borderRadius: '9px' }}
            >
              继续构建
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-lab-muted transition-colors hover:bg-[rgba(15,23,42,0.06)] hover:text-lab-ink"
            aria-label="关闭"
            title="关闭"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <p className="mb-2 text-[10px] leading-relaxed" style={{ color: 'var(--wb-muted)' }}>
          仅浏览本机已存记录，不会发起 AI 调用。关闭本栏后主区不变。
        </p>
        <HypothesisPracticeRecordSection session={session} />
        {session.status === 'completed' && session.canvas ? (
          <div className="mt-3 border-t pt-3" style={{ borderColor: 'rgba(15, 23, 42, 0.08)' }}>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--wb-muted)' }}>
              商业假设画布
            </p>
            <BusinessCanvasViewer session={session} />
          </div>
        ) : session.status !== 'ideating' ? (
          <div className="mt-3 border-t pt-3" style={{ borderColor: 'rgba(15, 23, 42, 0.08)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--wb-muted)' }}>
              当前追问（预览）
            </p>
            <p className="mt-1.5 text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--wb-text)' }}>
              {previewQuestion || '—'}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--wb-muted)' }}>
            本会话尚未开始构建。点「继续构建」后开始引导。
          </p>
        )}
      </div>
    </div>
  )
}
