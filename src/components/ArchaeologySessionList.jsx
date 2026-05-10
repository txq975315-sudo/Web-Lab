import { useState, useEffect } from 'react'
import { archaeologyStore } from '../utils/dataStore'

export default function ArchaeologySessionList({ activeSessionId, onSelectSession }) {
  const [sessions, setSessions] = useState([])

  const refresh = () => setSessions(archaeologyStore.getAllSessions())

  useEffect(() => {
    refresh()
  }, [])

  const handleCreate = () => {
    const name = prompt('给这次考古起个名字：', '产品决策复盘')
    if (!name) return
    archaeologyStore.createSession(name)
    refresh()
  }

  const handleDelete = (id, e) => {
    e.stopPropagation()
    if (!confirm('确定删除这个考古会话？')) return
    archaeologyStore.deleteSession(id)
    if (activeSessionId === id) onSelectSession(null)
    refresh()
  }

  return (
    <div className="w-[200px] shrink-0 border-r border-lab-border-subtle p-2 overflow-auto bg-lab-raised">
      <button
        type="button"
        onClick={handleCreate}
        className="w-full mb-2 py-2 rounded-md text-xs font-medium bg-lab-success text-[color:var(--color-text-inverted)] hover:opacity-92"
      >
        + 新建考古会话
      </button>

      {sessions.length === 0 && (
        <div className="text-center py-5 px-2 text-xs text-lab-muted">
          暂无考古会话<br />点击上方新建
        </div>
      )}

      {sessions.map(s => (
        <div
          key={s.id}
          role="button"
          tabIndex={0}
          onClick={() => onSelectSession(s.id)}
          onKeyDown={(e) => e.key === 'Enter' && onSelectSession(s.id)}
          className={`p-2 mb-1 rounded cursor-pointer border transition-colors ${
            s.id === activeSessionId
              ? 'bg-lab-accent-dim border-lab-accent'
              : 'bg-lab-overlay border-transparent hover:bg-lab-accent-dim/60'
          }`}
        >
          <div className="font-medium text-sm text-lab-ink">{s.name}</div>
          <div className="text-xs text-lab-muted mt-1">
            {s.conversationChunks.length}段对话 ·
            {s.status === 'analyzing' ? '分析中' : s.status === 'reviewing' ? '审核中' : '已归档'}
          </div>
          <button
            type="button"
            onClick={(e) => handleDelete(s.id, e)}
            className="mt-1 text-[11px] text-lab-error bg-transparent border-none cursor-pointer hover:underline"
          >
            删除
          </button>
        </div>
      ))}
    </div>
  )
}
