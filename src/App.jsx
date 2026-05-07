import { LabProvider, useLab } from './context/LabContext'
import LabPanel from './components/LabPanel'
import ArchivePanel from './components/ArchivePanel'
import Sidebar from './components/Sidebar'
import ArchaeologySidebar from './components/ArchaeologySidebar'
import ArchaeologyTimeline from './components/ArchaeologyTimeline'
import CommandPalette from './components/CommandPalette'
import SettingsModal from './components/SettingsModal'
import { useState } from 'react'

function AppContent() {
  const { setActiveDocId, sidebarCollapsed, labMode } = useLab()
  const [showSettings, setShowSettings] = useState(false)

  const handleSelectDoc = (doc) => {
    setActiveDocId(doc.id)
  }

  const isArchaeology = labMode === 'archaeology'

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#F9FAFB' }}>
      <div
        className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{
          backgroundColor: '#1F2937',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white">Kairos Thinking Lab</span>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          title="设置"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
              stroke="rgba(255, 255, 255, 0.8)"
              strokeWidth="1.8"
            />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"
              stroke="rgba(255, 255, 255, 0.8)"
              strokeWidth="1.8"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div
          className="overflow-hidden flex-shrink-0 transition-all duration-300 ease-in-out"
          style={{
            minWidth: 0,
            width: sidebarCollapsed ? 40 : 220
          }}
        >
          {isArchaeology ? (
            <ArchaeologySidebar />
          ) : (
            <Sidebar onSelectDoc={handleSelectDoc} />
          )}
        </div>
        <div className="flex-1 flex overflow-hidden gap-0 pr-6 pb-6 pt-6">
          <div className="flex-[5] overflow-hidden" style={{ minWidth: 0 }}>
            {isArchaeology ? (
              <ArchaeologyTimeline />
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
  return (
    <LabProvider>
      <AppContent />
    </LabProvider>
  )
}
