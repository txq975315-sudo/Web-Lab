import { useCallback, useEffect, useState } from 'react'
import { STORAGE_KEYS } from '../../config/storageKeys.js'
import { getPressureSession } from './pressureSessionStore.js'
import { findAwaitingAnswerSlot } from './pressureTypes.js'
import { PracticeRecordSection } from './PressureSessionPracticeRecord.jsx'

const SESSIONS_CHANGED = 'thinking-lab-pressure-sessions-changed'

/**
 * @param {import('./pressureTypes.js').PressureSession} s
 */
function sessionProgressLabel(s) {
  if (s.status === 'completed') return '已完成'
  if (s.status === 'deconstructing') return '拆解中…'
  let n = 0
  for (const r of s.rounds || []) {
    for (const q of r.questions || []) {
      if (q.answerText) n++
    }
  }
  return `${n}/9 已答`
}

/**
 * @param {import('./pressureTypes.js').PressureSession} session
 */
function BlindSpotReportStatic({ session }) {
  const rep = session.blindSpotReport
  if (!rep) return null
  const hard = rep.verdict === 'needs_rethink'
  return (
    <div className="space-y-3 border-t pt-3" style={{ borderColor: 'rgba(15, 23, 42, 0.08)' }}>
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--wb-muted)' }}>
        思维盲区快照
      </p>
      <div
        className="rounded-xl border px-3 py-2.5 text-xs"
        style={{
          borderColor: hard ? 'color-mix(in srgb, var(--color-warning) 35%, transparent)' : 'var(--color-border-subtle)',
          background: hard ? 'var(--color-warning-dim)' : 'var(--color-bg-raised)',
          color: 'var(--wb-text)',
        }}
      >
        <p className="font-semibold">{hard ? '建议深入思考' : '基本可行'}</p>
        <p className="mt-1 text-[11px] leading-relaxed" style={{ color: 'var(--wb-muted)' }}>
          {rep.verdictText}
        </p>
      </div>
      {Array.isArray(rep.deconstructionSnapshot) && rep.deconstructionSnapshot.length > 0 && (
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--wb-muted)' }}>
            拆解快照
          </p>
          <div className="overflow-x-auto rounded-lg border text-[10px]" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <table className="w-full min-w-[240px] text-left">
              <thead>
                <tr style={{ background: 'var(--color-bg-overlay)' }}>
                  <th className="px-2 py-1.5 font-medium">维度</th>
                  <th className="px-2 py-1.5 font-medium">你的描述</th>
                  <th className="px-2 py-1.5 font-medium">追问发现</th>
                </tr>
              </thead>
              <tbody>
                {rep.deconstructionSnapshot.map((row, i) => (
                  <tr key={i} className="border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                    <td className="px-2 py-1.5 align-top">{row.dimension}</td>
                    <td className="px-2 py-1.5 align-top">{row.userClaim}</td>
                    <td className="px-2 py-1.5 align-top">{row.aiFinding}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--wb-muted)' }}>
          盲区清单
        </p>
        <ul className="space-y-1.5">
          {(rep.blindSpots || []).map((b, i) => (
            <li
              key={i}
              className="rounded-lg border px-2 py-1.5 text-[10px] leading-relaxed"
              style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--wb-text)' }}
            >
              <span className="font-medium">
                [{b.severity === 'high' ? '高' : b.severity === 'medium' ? '中' : '低'}] {b.dimension}
              </span>
              ：{b.description}
              {b.suggestion ? (
                <span className="mt-0.5 block" style={{ color: 'var(--wb-muted)' }}>
                  建议：{b.suggestion}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/**
 * 压力工作台内联「查看」：布局与占位对齐内联文档（ArchivePanel inline）— 顶栏 + 可滚动正文 + 关闭。
 *
 * @param {object} props
 * @param {string} props.sessionId
 * @param {() => void} props.onClose
 * @param {(id: string) => void} [props.onEnterPractice]
 */
export default function PressureSessionInlineViewer({ sessionId, onClose, onEnterPractice }) {
  const [session, setSession] = useState(() => getPressureSession(sessionId))

  const refresh = useCallback(() => {
    setSession(getPressureSession(sessionId))
  }, [sessionId])

  useEffect(() => {
    refresh()
  }, [sessionId, refresh])

  useEffect(() => {
    const onCustom = () => refresh()
    const onStorage = (e) => {
      if (e.key === STORAGE_KEYS.PRESSURE_ENGINE_SESSIONS || e.key === null) refresh()
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
            压力练习
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
          <p className="text-2xl" aria-hidden>
            ⚡
          </p>
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
            {session.name || '压力练习'}
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
              style={{ backgroundColor: 'var(--color-accent-blue)', borderRadius: '9px' }}
            >
              进入练习
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
          仅浏览本机已存记录，不会发起拆解或提交。关闭本栏后主区不变（与内联文档栏一致）。
        </p>
        <PracticeRecordSection session={session} />
        {session.status === 'completed' && session.blindSpotReport ? (
          <BlindSpotReportStatic session={session} />
        ) : session.status !== 'deconstructing' ? (
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
            本会话尚未完成拆解。点「进入练习」后将连接 AI 继续。
          </p>
        )}
      </div>
    </div>
  )
}
