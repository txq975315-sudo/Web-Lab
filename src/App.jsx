import { LabProvider, useLab } from './context/LabContext'
import LabPanel from './components/LabPanel'
import ArchivePanel from './components/ArchivePanel'
import ArchaeologyV2 from './components/ArchaeologyV2'
import CommandPalette from './components/CommandPalette'
import SettingsModal from './components/SettingsModal'
import DashboardHome from './components/DashboardHome'
import ModuleSegmentedControl from './components/workbench/ModuleSegmentedControl'
import WorkbenchIconRail from './components/workbench/WorkbenchIconRail'
import WorkbenchLeftPanel from './components/workbench/WorkbenchLeftPanel'
import RightInsightDeck from './components/workbench/RightInsightDeck'
import LandingScrollExperience from './components/LandingScrollExperience'
import { initStore } from './utils/dataStore'
import { useState, useEffect, useCallback } from 'react'
import AppErrorBoundary from './components/AppErrorBoundary'

function AppContent() {
  const {
    labMode,
    switchLabMode,
    activeDocId,
    selectDocument,
    activeProjectId,
    projects,
    activeArchaeologyId,
    archaeologySessions,
  } = useLab()

  const [showSettings, setShowSettings] = useState(false)
  const [railTool, setRailTool] = useState(null)
  /** 压力练工作台：与左侧「智能推荐」联动，收起/展开右侧 Insight 栏 */
  const [rightInsightDeckOpen, setRightInsightDeckOpen] = useState(true)

  const closeRail = useCallback(() => setRailTool(null), [])

  const liveWorkbenchSurface = labMode === 'live'

  const activeProject = projects?.find((p) => p.id === activeProjectId)
  const activeArchSession = archaeologySessions?.find((s) => s.id === activeArchaeologyId)

  /** 必须与 landing 早退无关：早退后若再挂载更多 hooks 会违反 Rules of Hooks 并白屏 */
  useEffect(() => {
    if (activeDocId) {
      setRailTool(null)
    }
  }, [activeDocId])

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

  const renderMain = () => {
    if (activeDocId && labMode !== 'live') {
      return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
          <div className="wb-substrip flex flex-shrink-0 flex-wrap items-center gap-2 px-6 py-2.5 md:px-8 lg:px-10 xl:px-12">
            <button
              type="button"
              onClick={() => selectDocument(null)}
              className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--wb-primary-muted)]"
              style={{ color: 'var(--wb-text)' }}
            >
              ← 关闭文档
            </button>
            <span className="text-xs" style={{ color: 'var(--wb-muted)' }}>
              文档阅读
            </span>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => switchLabMode('live')}
                className="rounded-full px-2 py-1 text-xs transition-colors hover:bg-[var(--wb-primary-muted)]"
                style={{ color: 'var(--wb-muted)' }}
              >
                去演练
              </button>
              <button
                type="button"
                onClick={() => switchLabMode('coach')}
                className="rounded-full px-2 py-1 text-xs transition-colors hover:bg-[var(--wb-primary-muted)]"
                style={{ color: 'var(--wb-muted)' }}
              >
                去练习
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <ArchivePanel />
          </div>
        </div>
      )
    }

    if (labMode === 'dashboard') {
      return <DashboardHome />
    }

    if (labMode === 'archaeology') {
      return (
        <div className="h-full min-h-0 overflow-hidden rounded-2xl bg-transparent shadow-[var(--wb-shadow-card)]">
          <ArchaeologyV2 />
        </div>
      )
    }

    if (labMode === 'coach') {
      return (
        <div className="h-full min-h-0 overflow-hidden">
          <LabPanel hideTopTabs flushChrome workbenchLayout={false} hideChatHistorySidebar />
        </div>
      )
    }

    if (labMode === 'live') {
      return (
        <div className="h-full min-h-0 overflow-hidden">
          <LabPanel
            hideTopTabs
            flushChrome
            workbenchLayout
            hideChatHistorySidebar
            workbenchRailTool={railTool}
            onWorkbenchRailToolClose={closeRail}
            onPressureTestStart={() => setRightInsightDeckOpen(true)}
          />
        </div>
      )
    }

    return <DashboardHome />
  }

  /** 非压力练全屏工作台或右栏展开时显示右侧 Insight；压力练下可由「智能推荐」收起 */
  const showRightInsightDeck = !liveWorkbenchSurface || rightInsightDeckOpen

  return (
    <div className="wb-shell flex h-screen flex-col overflow-hidden font-sans">
      {!liveWorkbenchSurface && (
        <header
          className="wb-top-header grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 py-2.5 pl-1.5 pr-6 md:pr-8 lg:pr-10 xl:pr-12"
        >
          <div className="flex min-w-0 justify-start">
            <button
              type="button"
              onClick={() => switchLabMode('landing')}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors duration-200 hover:bg-[var(--wb-primary-muted)]"
              style={{ color: 'var(--color-brand-blue)' }}
              aria-label="思维训练工作台"
              title="返回首页"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="flex min-w-0 justify-center px-1">
            <ModuleSegmentedControl />
          </div>

          <div className="flex min-w-0 items-center justify-end gap-2">
            <button
              type="button"
              className="wb-header-placeholder-btn flex h-9 min-w-[2.75rem] cursor-default items-center justify-center rounded-full border px-3 font-display text-xs font-semibold"
              style={{
                borderColor: 'var(--color-border-subtle)',
                color: 'var(--color-text-primary)',
              }}
              aria-label="预留入口"
              title="功能预留"
            >
              AL
            </button>
          </div>
        </header>
      )}

      {!activeDocId && labMode === 'coach' && activeProject && (
        <div
          className="wb-substrip flex flex-shrink-0 items-center px-6 py-1.5 text-xs md:px-8 lg:px-10 xl:px-12"
          style={{ color: 'var(--wb-muted)' }}
        >
          <span className="font-medium" style={{ color: 'var(--wb-text)' }}>
            当前项目
          </span>
          <span className="ml-2 truncate">{activeProject.name}</span>
        </div>
      )}

      {!activeDocId && labMode === 'archaeology' && activeArchSession && (
        <div
          className="wb-substrip flex flex-shrink-0 items-center px-6 py-1.5 text-xs md:px-8 lg:px-10 xl:px-12"
          style={{ color: 'var(--wb-muted)' }}
        >
          <span className="font-medium" style={{ color: 'var(--wb-text)' }}>
            考古会话
          </span>
          <span className="ml-2 truncate">{activeArchSession.name}</span>
        </div>
      )}

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 overflow-hidden">   {/* 水平行：图标栏 + 面板 + 主内容 */}
        <WorkbenchIconRail
          activeTool={railTool}
          onToolChange={setRailTool}
          onSettingsClick={() => setShowSettings(true)}
          highlightProjectsWhenIdle={liveWorkbenchSurface}
          insightDeckOpen={liveWorkbenchSurface ? rightInsightDeckOpen : null}
          onRecommendInsightToggle={
            liveWorkbenchSurface ? () => setRightInsightDeckOpen((v) => !v) : undefined
          }
        />
        {railTool && !liveWorkbenchSurface && (
          <>
            <div
              className="pointer-events-none relative hidden h-full w-[465px] shrink-0 bg-gradient-to-r from-white/60 to-white/80 lg:block"
              aria-hidden="true"
            />
            <div className="fixed inset-y-0 left-[var(--wb-rail-width)] z-50 flex lg:relative lg:inset-auto lg:left-0 lg:z-auto">
              <WorkbenchLeftPanel tool={railTool} onClose={closeRail} surface="solid" />
            </div>
          </>
        )}

        <div
          className={`wb-workbench-row flex min-h-0 min-w-0 flex-1 overflow-hidden bg-transparent px-4 ${
            liveWorkbenchSurface ? 'wb-workbench-row--live' : ''
          }`}
        >
          <main
            className={`relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${
              liveWorkbenchSurface
                ? 'rounded-none bg-transparent shadow-none'
                : 'rounded-[36px] bg-white/75 shadow-[var(--wb-shadow-card)]'
            }`}
          >
            {renderMain()}
          </main>

          {showRightInsightDeck && <RightInsightDeck className="hidden shrink-0 xl:flex" />}
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
