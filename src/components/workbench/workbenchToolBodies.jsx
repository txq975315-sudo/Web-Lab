import { loadSkillProgress } from '../../utils/growthCoachStore'
import { METHODOLOGY_ORDER, METHODOLOGY_CONFIG } from '../../config/methodology'
import { archaeologyStore } from '../../utils/dataStore'
import PressureSessionHistoryPanel from '../../features/pressureTest/PressureSessionHistoryPanel.jsx'
import HypothesisSessionHistoryPanel from '../../features/businessHypothesis/HypothesisSessionHistoryPanel.jsx'

export function RadarPanelBody({ transparent }) {
  const skill = loadSkillProgress()
  const trackClass = transparent ? 'wb-transparent-track' : ''
  return (
    <div className="h-full overflow-y-auto p-4 text-sm" style={{ color: 'var(--wb-muted)' }}>
      <p className="mb-4 text-xs leading-relaxed" style={{ textShadow: transparent ? '0 1px 1px rgba(255,255,255,0.6)' : undefined }}>
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
              <div className={`mt-1 h-1.5 overflow-hidden rounded-full ${trackClass || 'bg-[var(--wb-page-bg)]'}`}>
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, v)}%`, background: 'var(--wb-secondary)' }} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function ArchaeologyListBody({ transparent }) {
  const sessions = archaeologyStore?.getAllSessions?.() || []
  const rowClass = transparent ? 'wb-transparent-list-row' : ''
  return (
    <div className="h-full overflow-y-auto p-3 text-xs">
      {sessions.length === 0 ? (
        <p className="p-4 text-center" style={{ color: 'var(--wb-muted)', textShadow: transparent ? '0 1px 1px rgba(255,255,255,0.65)' : undefined }}>
          暂无考古会话
        </p>
      ) : (
        <ul className="space-y-2">
          {sessions.map((s) => (
            <li
              key={s.id}
              className={`rounded-lg px-3 py-2 ${rowClass} ${transparent ? '' : 'border'}`}
              style={
                transparent
                  ? { color: 'var(--wb-text)' }
                  : { borderColor: 'var(--wb-border)', color: 'var(--wb-text)' }
              }
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

export function PlaceholderBody({ text, transparent }) {
  return (
    <div
      className="flex h-full flex-col items-center justify-center p-6 text-center text-sm"
      style={{
        color: 'var(--wb-muted)',
        textShadow: transparent ? '0 1px 2px rgba(255,255,255,0.7)' : undefined,
      }}
    >
      {text}
    </div>
  )
}

/** 非「项目树」的中间栏工具 id → 标题 */
export const WORKBENCH_MIDDLE_TOOL_TITLES = {
  radar: '智力雷达',
  recommend: '智能推荐',
  archaeology: '历史对话考古',
  practice: '历史压力练习',
  'hypothesis-practice': '历史假设构建',
  learning: '历史成长教学',
}

/**
 * @param {object} props
 * @param {string|null} [props.pressureHistory.activeRunnerId]
 * @param {(id: string) => void} [props.pressureHistory.onView]
 * @param {(id: string) => void} [props.pressureHistory.onContinue]
 * @param {(id: string) => void} [props.pressureHistory.onAfterDelete]
 */
export function WorkbenchToolPaneContent({ tool, transparent = true, pressureHistory = null }) {
  if (!tool || tool === 'projects') return null

  if (tool === 'radar') return <RadarPanelBody transparent={transparent} />
  if (tool === 'archaeology') return <ArchaeologyListBody transparent={transparent} />
  if (tool === 'recommend') {
    return (
      <PlaceholderBody
        transparent={transparent}
        text="基于能力缺口与模板进度推荐下一练 — 内容将与成长教练联动接入。"
      />
    )
  }
  if (tool === 'practice') {
    return (
      <PressureSessionHistoryPanel
        transparent={transparent}
        activeRunnerId={pressureHistory?.activeRunnerId ?? null}
        onView={pressureHistory?.onView}
        onContinue={pressureHistory?.onContinue}
        onAfterDelete={pressureHistory?.onAfterDelete}
      />
    )
  }
  if (tool === 'hypothesis-practice') {
    return (
      <HypothesisSessionHistoryPanel
        transparent={transparent}
        activeRunnerId={pressureHistory?.activeRunnerId ?? null}
        onView={pressureHistory?.onView}
        onContinue={pressureHistory?.onContinue}
        onAfterDelete={pressureHistory?.onAfterDelete}
      />
    )
  }
  if (tool === 'learning') {
    return <PlaceholderBody transparent={transparent} text="成长教练练习记录摘要 — 可与导出备份联动。" />
  }
  return null
}
