import Sidebar from '../Sidebar'
import { loadSkillProgress } from '../../utils/growthCoachStore'
import { METHODOLOGY_ORDER, METHODOLOGY_CONFIG } from '../../config/methodology'
import { archaeologyStore } from '../../utils/dataStore'

function PanelChrome({ title, onClose, children }) {
  return (
    <div
      className="wb-left-panel-pop wb-card flex h-full w-[min(100vw-76px,250px)] shrink-0 flex-col sm:w-[250px]"
    >
      <div className="flex shrink-0 items-center justify-between px-4 py-3">
        <h2 className="font-display text-sm font-semibold" style={{ color: 'var(--wb-text)' }}>
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-[var(--wb-muted)] hover:bg-[var(--wb-primary-muted)] hover:text-[var(--wb-primary)]"
          aria-label="关闭面板"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  )
}

function RadarPanelBody() {
  const skill = loadSkillProgress()
  return (
    <div className="h-full overflow-y-auto p-4 text-sm" style={{ color: 'var(--wb-muted)' }}>
      <p className="mb-4 text-xs leading-relaxed">
        七维方法论掌握进度（本地）。完整 SVG 雷达将后续替换为本视图。
      </p>
      <ul className="space-y-3">
        {METHODOLOGY_ORDER.map((id) => {
          const name = METHODOLOGY_CONFIG[id]?.name || id
          const v = skill.dimensions[id] ?? 0
          return (
            <li key={id}>
              <div className="flex justify-between text-xs" style={{ color: 'var(--wb-text)' }}>
                <span>{name}</span>
                <span>{Math.round(v)}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--wb-page-bg)]">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, v)}%`, background: 'var(--wb-secondary)' }} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ArchaeologyListBody() {
  const sessions = archaeologyStore?.getAllSessions?.() || []
  return (
    <div className="h-full overflow-y-auto p-3 text-xs">
      {sessions.length === 0 ? (
        <p className="p-4 text-center" style={{ color: 'var(--wb-muted)' }}>
          暂无考古会话
        </p>
      ) : (
        <ul className="space-y-2">
          {sessions.map((s) => (
            <li
              key={s.id}
              className="rounded-lg border px-3 py-2"
              style={{ borderColor: 'var(--wb-border)', color: 'var(--wb-text)' }}
            >
              <div className="font-medium">{s.name}</div>
              <div className="mt-1 text-[11px]" style={{ color: 'var(--wb-muted)' }}>
                {s.conversationChunks?.length ?? 0} 段对话
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function PlaceholderBody({ text }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center text-sm" style={{ color: 'var(--wb-muted)' }}>
      {text}
    </div>
  )
}

export default function WorkbenchLeftPanel({ tool, onClose }) {
  if (!tool) return null

  if (tool === 'projects') {
    return (
      <PanelChrome title="项目树" onClose={onClose}>
        <div className="wb-embed-lab flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
          <Sidebar />
        </div>
      </PanelChrome>
    )
  }

  if (tool === 'radar') {
    return (
      <PanelChrome title="能力雷达" onClose={onClose}>
        <RadarPanelBody />
      </PanelChrome>
    )
  }

  if (tool === 'recommend') {
    return (
      <PanelChrome title="智能推荐" onClose={onClose}>
        <PlaceholderBody text="基于能力缺口与模板进度推荐下一练 — 内容将与成长教练联动接入。" />
      </PanelChrome>
    )
  }

  if (tool === 'archaeology') {
    return (
      <PanelChrome title="对话考古" onClose={onClose}>
        <ArchaeologyListBody />
      </PanelChrome>
    )
  }

  if (tool === 'practice') {
    return (
      <PanelChrome title="压力 / 练习记录" onClose={onClose}>
        <PlaceholderBody text="演练会话历史将汇总于此（与右侧 LiveLab 历史互通后续接入）。" />
      </PanelChrome>
    )
  }

  if (tool === 'learning') {
    return (
      <PanelChrome title="学习记录" onClose={onClose}>
        <PlaceholderBody text="成长教练练习记录摘要 — 可与导出备份联动。" />
      </PanelChrome>
    )
  }

  return null
}
