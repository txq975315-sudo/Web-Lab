import Sidebar from '../Sidebar'
import {
  RadarPanelBody,
  ArchaeologyListBody,
  PlaceholderBody,
} from './workbenchToolBodies'
import PressureSessionHistoryPanel from '../../features/pressureTest/PressureSessionHistoryPanel.jsx'

function PanelChrome({ title, onClose, children }) {
  return (
    <div
      className="wb-left-panel-pop flex h-full w-[367px] shrink-0 flex-col overflow-hidden rounded-[36px] bg-gradient-to-b from-white/90 to-white/80 shadow-[2px_2px_3px_rgba(111,159,183,0.5)]"
    >
      <div className="flex shrink-0 items-center justify-between px-6 py-4">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--wb-text)' }}>
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

/** 非压力工作台：白底浮层 */
function PanelTransparentChrome({ title, onClose, children }) {
  return (
    <div className="wb-left-panel-transparent flex h-full min-h-0 w-[min(22rem,calc(100vw-4.5rem))] shrink-0 flex-col overflow-hidden rounded-2xl">
      <div className="wb-transparent-head flex shrink-0 items-center justify-between px-4 py-3">
        <h2
          className="text-sm font-semibold"
          style={{ color: 'var(--wb-text)', textShadow: '0 1px 2px rgba(255,255,255,0.75)' }}
        >
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-[var(--wb-muted)] hover:bg-[rgba(255,255,255,0.22)] hover:text-[var(--wb-text)]"
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

/**
 * @param {'solid' | 'transparent'} surface
 */
export default function WorkbenchLeftPanel({ tool, onClose, surface = 'solid' }) {
  if (!tool) return null

  const transparent = surface === 'transparent'
  const Chrome = transparent ? PanelTransparentChrome : PanelChrome

  if (tool === 'projects') {
    return (
      <Chrome title="项目树" onClose={onClose}>
        <div className="wb-embed-lab flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
          <Sidebar />
        </div>
      </Chrome>
    )
  }

  if (tool === 'radar') {
    return (
      <Chrome title="智力雷达" onClose={onClose}>
        <RadarPanelBody transparent={transparent} />
      </Chrome>
    )
  }

  if (tool === 'recommend') {
    return (
      <Chrome title="智能推荐" onClose={onClose}>
        <PlaceholderBody
          transparent={transparent}
          text="基于能力缺口与模板进度推荐下一练 — 内容将与成长教练联动接入。"
        />
      </Chrome>
    )
  }

  if (tool === 'archaeology') {
    return (
      <Chrome title="历史对话考古" onClose={onClose}>
        <ArchaeologyListBody transparent={transparent} />
      </Chrome>
    )
  }

  if (tool === 'practice') {
    return (
      <Chrome title="历史压力练习" onClose={onClose}>
        <PressureSessionHistoryPanel transparent={transparent} />
      </Chrome>
    )
  }

  if (tool === 'learning') {
    return (
      <Chrome title="历史成长教学" onClose={onClose}>
        <PlaceholderBody transparent={transparent} text="成长教练练习记录摘要 — 可与导出备份联动。" />
      </Chrome>
    )
  }

  return null
}
