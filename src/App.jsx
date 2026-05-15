import { LabProvider, useLab } from './context/LabContext'
import LabPanel from './components/LabPanel'
import CommandPalette from './components/CommandPalette'
import SettingsModal from './components/SettingsModal'
import ModuleSegmentedControl from './components/workbench/ModuleSegmentedControl'
import WorkbenchIconRail from './components/workbench/WorkbenchIconRail'
import RightInsightDeck from './components/workbench/RightInsightDeck'
import LandingScrollExperience from './components/LandingScrollExperience'
import { initStore } from './utils/dataStore'
import { useState, useEffect, useCallback } from 'react'
import AppErrorBoundary from './components/AppErrorBoundary'

function AppContent() {
  const {
    labMode,
    pressureWorkbenchActiveSessionId,
  } = useLab()

  const [showSettings, setShowSettings] = useState(false)
  const [railTool, setRailTool] = useState(null)
  const [rightInsightDeckOpen, setRightInsightDeckOpen] = useState(true)

  const closeRail = useCallback(() => setRailTool(null), [])

  /** 统一布局：所有非 landing 模式共享同一套 wb-shell 外壳 */
  const isLiveMode = labMode === 'live'
  /** 压力会话进行中时收起右侧 Insight */
  const isInSession = isLiveMode && Boolean(pressureWorkbenchActiveSessionId)

  useEffect(() => {
    setRailTool(null)
  }, [labMode])

  if (labMode === 'landing') {
    return (
      <>
        <LandingScrollExperience />
        <CommandPalette />
        <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      </>
    )
  }

  return (
    <div className="wb-shell flex h-screen flex-col overflow-hidden font-sans">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <WorkbenchIconRail
            activeTool={railTool}
            onToolChange={setRailTool}
            onSettingsClick={() => setShowSettings(true)}
            highlightProjectsWhenIdle={isLiveMode}
            insightDeckOpen={isLiveMode ? rightInsightDeckOpen : null}
            onRecommendInsightToggle={
              isLiveMode ? () => setRightInsightDeckOpen((v) => !v) : undefined
            }
          />
          {/* WorkbenchLeftPanel 已删除，所有工具内容由 WorkbenchMiddleToolColumn（对话框内透明列）处理 */}

          <div
            className={`wb-workbench-row flex min-h-0 min-w-0 flex-1 overflow-hidden bg-transparent px-4 ${
              isInSession ? 'wb-pressure-session-active' : ''
            }`}
          >
            <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-none bg-transparent shadow-none">
              <LabPanel
                hideTopTabs
                flushChrome
                hideChatHistorySidebar
                workbenchRailTool={railTool}
                onWorkbenchRailToolClose={closeRail}
                onPressureTestStart={() => setRightInsightDeckOpen(true)}
              />
            </main>

            {rightInsightDeckOpen && !isInSession && (
              <RightInsightDeck className="hidden shrink-0 xl:flex" />
            )}
          </div>
        </div>
      </div>

      <CommandPalette />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}

export default function App() {
  useEffect(() => {
    initStore()
    if (import.meta.env.DEV) {
      console.debug('[Thinking Lab] init OK — 项目数据以 LabContext projectTree（thinking-lab-project-tree）为准')
    }
  }, [])

  return (
    <LabProvider>
      <AppErrorBoundary>
        <AppContent />
      </AppErrorBoundary>
    </LabProvider>
  )
}
