import WorkbenchProjectTree from './WorkbenchProjectTree'
import { WORKBENCH_MIDDLE_TOOL_TITLES, WorkbenchToolPaneContent } from './workbenchToolBodies'

/**
 * 压力工作台中间单列：项目树与其它工具互斥，同一区块切换内容（不叠 card）
 */
/**
 * @param {object} [props.pressureHistory] 历史压力练习回调（仅 live 工作台传入）
 */
export default function WorkbenchMiddleToolColumn({ tool, onClose, pressureHistory = null }) {
  const showTree = !tool || tool === 'projects'

  return (
    <aside
      className="wb-pressure-tree-column flex min-h-0 shrink-0 flex-col items-stretch overflow-hidden overflow-x-hidden pb-4 pl-2 pr-2 pt-0 md:pl-3 md:pr-3 min-[900px]:pr-4"
      style={{ flex: '0 0 clamp(9.5rem, 17vw, 13.5rem)', maxWidth: '220px' }}
      {...(showTree ? { 'data-wb-workbench-project-tree': true } : {})}
    >
      {!showTree && (
        <div className="mb-2 flex shrink-0 items-center justify-between gap-2 border-b border-white/25 px-1 py-2">
          <span
            className="truncate text-xs font-semibold"
            style={{ color: 'var(--wb-text)', textShadow: '0 1px 2px rgba(255,255,255,0.75)' }}
          >
            {WORKBENCH_MIDDLE_TOOL_TITLES[tool] || tool}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-[var(--wb-muted)] transition-colors hover:bg-[rgba(255,255,255,0.2)] hover:text-[var(--wb-text)]"
            aria-label="返回项目树"
            title="返回项目树"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        {showTree ? (
          <WorkbenchProjectTree />
        ) : (
          <WorkbenchToolPaneContent tool={tool} transparent pressureHistory={pressureHistory} />
        )}
      </div>
    </aside>
  )
}
