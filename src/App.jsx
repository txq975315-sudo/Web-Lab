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

  const closeRail = useCallback(() => setRailTool(null), [])

  const activeProject = projects?.find((p) => p.id === activeProjectId)
  const activeArchSession = archaeologySessions?.find((s) => s.id === activeArchaeologyId)

  useEffect(() => {
    if (activeDocId) {
      setRailTool(null)
    }
  }, [activeDocId])

  useEffect(() => {
    setRailTool(null)
  }, [labMode])

  const renderMain = () => {
    if (activeDocId) {
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
          <LabPanel hideTopTabs flushChrome workbenchLayout hideChatHistorySidebar />
        </div>
      )
    }

    return <DashboardHome />
  }

  /** 文档阅读时也保留工作台左右栏（图标栏 + 右侧信息栏），与练·学·看一致 */
  const showWorkbenchChrome = true
  const showRightDeck = true

  return (
    <div className="wb-shell flex h-screen flex-col overflow-hidden font-sans">
      <header
        className="wb-top-header grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 py-2.5 pl-1.5 pr-6 md:pr-8 lg:pr-10 xl:pr-12"
      >
        <div className="flex min-w-0 justify-start">
          <button
            type="button"
            onClick={() => switchLabMode('dashboard')}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors duration-200 hover:bg-[var(--wb-primary-muted)]"
            style={{ color: 'var(--color-accent-orange)' }}
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
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[var(--wb-primary-muted)]"
            style={{ color: 'var(--color-text-secondary)' }}
            aria-label="通知"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border font-display text-xs font-semibold"
            style={{
              background: 'var(--color-bg-raised)',
              borderColor: 'var(--color-border-subtle)',
              color: 'var(--color-text-primary)',
            }}
            aria-label="账户"
          >
            AL
          </button>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--wb-primary-muted)] hover:text-[var(--color-text-primary)]"
            title="设置"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
          </button>
        </div>
      </header>

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

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <WorkbenchIconRail
          activeTool={railTool}
          onToolChange={setRailTool}
          onSettingsClick={() => setShowSettings(true)}
        />
        {railTool && (
          <div className="fixed inset-y-0 left-[44px] z-50 flex lg:relative lg:inset-auto lg:left-0 lg:z-auto">
            <WorkbenchLeftPanel tool={railTool} onClose={closeRail} />
          </div>
        )}

        <div className="wb-workbench-row flex min-h-0 min-w-0 flex-1 overflow-hidden bg-transparent pb-3 pt-3 pl-6 pr-4 md:pl-8 md:pr-6 lg:pl-10 lg:pr-8 xl:px-10">
          <main className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-transparent">
            {renderMain()}
          </main>

          <RightInsightDeck className="hidden shrink-0 xl:flex" />
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
