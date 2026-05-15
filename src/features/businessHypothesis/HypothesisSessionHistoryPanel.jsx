import { useState, useEffect, useCallback, useMemo } from 'react'
import { useLab } from '../../context/LabContext'
import { STORAGE_KEYS } from '../../config/storageKeys.js'
import { listHypothesisSessions, deleteHypothesisSession } from './hypothesisStore.js'

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

function calendarDayKey(ts) {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function daySectionLabel(key) {
  const now = new Date()
  const todayKey = calendarDayKey(now.getTime())
  const yest = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
  const yestKey = calendarDayKey(yest.getTime())
  if (key === todayKey) return '今天'
  if (key === yestKey) return '昨天'
  const [yy, mm, dd] = key.split('-').map((x) => Number(x))
  return `${yy}年${mm}月${dd}日`
}

/**
 * @param {object} props
 * @param {string|null} [props.activeRunnerId]
 * @param {(id: string) => void} [props.onView]
 * @param {(id: string) => void} [props.onContinue]
 * @param {(id: string) => void} [props.onAfterDelete]
 * @param {boolean} [props.transparent]
 */
export default function HypothesisSessionHistoryPanel({
  activeRunnerId: activeOverride,
  onView: onViewOverride,
  onContinue: onContinueOverride,
  onAfterDelete,
  transparent = true,
}) {
  const { continueHypothesisSession, viewHypothesisSession, hypothesisWorkbenchActiveSessionId } = useLab()
  const activeRunnerId = activeOverride ?? hypothesisWorkbenchActiveSessionId ?? null
  const handleView = onViewOverride ?? viewHypothesisSession
  const handleContinue = onContinueOverride ?? continueHypothesisSession

  const [rows, setRows] = useState(() => listHypothesisSessions())
  const [openByDay, setOpenByDay] = useState(() => (/** @type {Record<string, boolean>} */ ({})))

  const refresh = useCallback(() => {
    setRows(listHypothesisSessions())
  }, [])

  useEffect(() => {
    refresh()
  }, [activeRunnerId, refresh])

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

  const groups = useMemo(() => {
    const map = new Map()
    for (const s of rows) {
      const ts = s.updatedAt || s.createdAt
      const key = calendarDayKey(ts)
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(s)
    }
    for (const list of map.values()) {
      list.sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt))
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0))
  }, [rows])

  const isDayOpen = (key) => openByDay[key] !== false

  const toggleDay = (key) => {
    setOpenByDay((prev) => ({ ...prev, [key]: prev[key] === false ? true : false }))
  }

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
    if (!window.confirm('确定删除该假设构建会话？不可恢复。')) return
    deleteHypothesisSession(id)
    refresh()
    onAfterDelete?.(id)
  }

  const rowClass = transparent ? 'wb-transparent-list-row' : ''

  if (rows.length === 0) {
    return (
      <p
        className="p-4 text-center text-xs"
        style={{ color: 'var(--wb-muted)', textShadow: transparent ? '0 1px 1px rgba(255,255,255,0.65)' : undefined }}
      >
        暂无已保存的假设构建。在中间主区域开始后，记录会按日期出现在这里。
      </p>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-2 text-xs">
      <p
        className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wide"
        style={{ color: 'var(--wb-muted)', textShadow: transparent ? '0 1px 1px rgba(255,255,255,0.6)' : undefined }}
      >
        已保存 · 按日期
      </p>
      <ul className="space-y-1">
        {groups.map(([dayKey, sessions]) => (
          <li key={dayKey} className="rounded-lg">
            <button
              type="button"
              onClick={() => toggleDay(dayKey)}
              className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left font-medium transition-colors hover:bg-[rgba(255,255,255,0.35)]"
              style={{ color: 'var(--wb-text)', textShadow: transparent ? '0 1px 1px rgba(255,255,255,0.75)' : undefined }}
              aria-expanded={isDayOpen(dayKey)}
            >
              <span>
                {daySectionLabel(dayKey)}
                <span className="ml-2 text-[10px] font-normal opacity-70">({sessions.length})</span>
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="shrink-0 opacity-55 transition-transform"
                style={{ transform: isDayOpen(dayKey) ? 'rotate(180deg)' : 'rotate(0deg)' }}
                aria-hidden
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {isDayOpen(dayKey) && (
              <ul className="space-y-1.5 pb-2 pl-1">
                {sessions.map((s) => {
                  const active = s.id === activeRunnerId
                  return (
                    <li
                      key={s.id}
                      className={`flex items-start gap-2 rounded-lg px-2 py-2 ${rowClass} ${transparent ? '' : 'border'}`}
                      style={
                        transparent
                          ? {
                              color: 'var(--wb-text)',
                              background: active ? 'rgba(255,255,255,0.45)' : undefined,
                              boxShadow: active ? 'inset 0 0 0 1px rgba(0,170,255,0.22)' : undefined,
                            }
                          : { borderColor: 'var(--wb-border)', color: 'var(--wb-text)' }
                      }
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{s.name || '未命名'}</p>
                        <p className="mt-0.5 text-[11px]" style={{ color: 'var(--wb-muted)' }}>
                          {sessionProgressLabel(s)} · {fmt(s.updatedAt || s.createdAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        <button
                          type="button"
                          className="rounded-md px-2 py-1 text-[11px] font-medium hover:bg-[rgba(15,23,42,0.08)]"
                          style={{ color: 'var(--wb-text)' }}
                          onClick={() => handleView(s.id)}
                        >
                          查看
                        </button>
                        <button
                          type="button"
                          className="rounded-md px-2 py-1 text-[11px] font-medium hover:bg-[rgba(15,23,42,0.08)]"
                          style={{ color: 'var(--wb-text)' }}
                          onClick={() => handleContinue(s.id)}
                        >
                          继续
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
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
