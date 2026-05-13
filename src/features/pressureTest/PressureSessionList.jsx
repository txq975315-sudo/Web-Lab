import { useState, useEffect, useCallback } from 'react'
import { listPressureSessions, deletePressureSession } from './pressureSessionStore.js'

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
 * @param {object} props
 * @param {string|null} [props.activeRunnerId]
 * @param {(id: string) => void} props.onContinue
 * @param {(id: string) => void} [props.onAfterDelete]
 */
export default function PressureSessionList({ activeRunnerId, onContinue, onAfterDelete }) {
  const [rows, setRows] = useState(() => listPressureSessions())

  const refresh = useCallback(() => {
    setRows(listPressureSessions())
  }, [])

  useEffect(() => {
    refresh()
  }, [activeRunnerId, refresh])

  if (rows.length === 0) return null

  const fmt = (ts) => {
    try {
      return new Date(ts).toLocaleString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  const handleDelete = (id, e) => {
    e.stopPropagation()
    if (!window.confirm('确定删除该压力测试会话？不可恢复。')) return
    deletePressureSession(id)
    refresh()
    onAfterDelete?.(id)
  }

  return (
    <div
      className="wb-card mb-4 overflow-hidden px-4 py-3 md:px-5"
      style={{ borderRadius: 'var(--wb-radius-lg)' }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--wb-muted)' }}>
        已保存 · 可休息后续做
      </p>
      <ul className="mt-2 max-h-48 space-y-1.5 overflow-y-auto">
        {rows.map((s) => {
          const active = s.id === activeRunnerId
          return (
            <li
              key={s.id}
              className="flex items-start gap-2 rounded-lg px-2 py-2 text-xs transition-colors"
              style={{
                background: active ? 'rgba(15, 23, 42, 0.06)' : 'transparent',
                border: active ? '1px solid var(--color-border-subtle)' : '1px solid transparent',
              }}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium" style={{ color: 'var(--wb-text)' }}>
                  {s.name || '未命名'}
                </p>
                <p className="mt-0.5 text-[11px]" style={{ color: 'var(--wb-muted)' }}>
                  {sessionProgressLabel(s)} · {fmt(s.updatedAt || s.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  className="rounded-md px-2 py-1 text-[11px] font-medium hover:bg-[rgba(15,23,42,0.08)]"
                  style={{ color: 'var(--wb-text)' }}
                  onClick={() => onContinue(s.id)}
                >
                  {s.status === 'completed' ? '查看报告' : '继续'}
                </button>
                <button
                  type="button"
                  className="rounded-md px-2 py-0.5 text-[10px] hover:bg-[rgba(220,38,38,0.08)]"
                  style={{ color: 'var(--color-warning)' }}
                  onClick={(e) => handleDelete(s.id, e)}
                >
                  删除
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
