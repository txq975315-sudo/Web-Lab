import { LabProvider, useLab } from './context/LabContext'
import LabPanel from './components/LabPanel'
import ArchivePanel from './components/ArchivePanel'
import Sidebar from './components/Sidebar'
import ArchaeologySidebar from './components/ArchaeologySidebar'
import ArchaeologyV2 from './components/ArchaeologyV2'
import CommandPalette from './components/CommandPalette'
import SettingsModal from './components/SettingsModal'
import { initStore } from './utils/dataStore'
import { useState, useEffect } from 'react'

function AppContent() {
  const { setActiveDocId, sidebarCollapsed, setSidebarCollapsed, labMode, activeDocId } = useLab()
  const [showSettings, setShowSettings] = useState(false)

  const handleSelectDoc = (doc) => {
    setActiveDocId(doc.id)
  }

  const isArchaeology = labMode === 'archaeology'

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#F9FAFB' }}>
      <div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        style={{
          backgroundColor: '#F3F4F6',
          borderBottom: '1px solid #E5E7EB'
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-gray-700">Thinking Lab</span>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
          title="设置"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
              stroke="rgba(107, 114, 128, 0.7)"
              strokeWidth="1.8"
            />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"
              stroke="rgba(107, 114, 128, 0.7)"
              strokeWidth="1.8"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div
          className="h-full overflow-hidden flex-shrink-0 transition-all duration-300 ease-in-out"
          style={{
            minWidth: 0,
            width: sidebarCollapsed ? 40 : 220
          }}
        >
          <Sidebar onSelectDoc={handleSelectDoc} />
        </div>
        <div className="flex-1 flex overflow-hidden gap-0 pr-6 pb-6 pt-6">
          <div className="flex-[5] overflow-hidden" style={{ minWidth: 0 }}>
            {isArchaeology && !activeDocId ? (
              <ArchaeologyV2 />
            ) : (
              <ArchivePanel />
            )}
          </div>
          <div className="flex-[5] overflow-hidden" style={{ minWidth: 0 }}>
            <LabPanel />
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
      console.debug('[Thinking Lab] init OK — 项目数据以 LabContext projectTree（kairos-project-tree）为准')
    }
  }, [])

  return (
    <LabProvider>
      <AppContent />
    </LabProvider>
  )
}
