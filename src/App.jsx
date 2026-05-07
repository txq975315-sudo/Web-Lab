import { LabProvider, useLab } from './context/LabContext'
import LabPanel from './components/LabPanel'
import ArchivePanel from './components/ArchivePanel'
import Sidebar from './components/Sidebar'
import ArchaeologySidebar from './components/ArchaeologySidebar'
import ArchaeologyTimeline from './components/ArchaeologyTimeline'
import CommandPalette from './components/CommandPalette'

function AppContent() {
  const { setActiveDocId, sidebarCollapsed, labMode } = useLab()

  const handleSelectDoc = (doc) => {
    setActiveDocId(doc.id)
  }

  const isArchaeology = labMode === 'archaeology'

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#F9FAFB' }}>
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
      <CommandPalette />
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
