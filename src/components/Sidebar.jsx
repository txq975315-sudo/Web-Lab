import { useLab } from '../context/LabContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useCallback, useMemo } from 'react'
import HealthIndicator from './HealthIndicator'
import { useLocalStorage } from '../hooks/useLocalStorage'

function Chevron({ expanded }) {
  return (
    <motion.svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      animate={{ rotate: expanded ? 90 : 0 }}
      transition={{ duration: 0.2 }}
      style={{ flexShrink: 0 }}
    >
      <path d="M3.5 2L6.5 5L3.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  )
}

function DocIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <rect x="1.5" y="1" width="9" height="10" rx="1.5" stroke="currentColor" strokeWidth="1" />
      <line x1="4" y1="4" x2="8" y2="4" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="4" y1="6" x2="8" y2="6" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="4" y1="8" x2="6.5" y2="8" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <path d="M1.5 3.5C1.5 2.94772 1.94772 2.5 2.5 2.5H4.5L5.5 3.5H9.5C10.0523 3.5 10.5 3.94772 10.5 4.5V9.5C10.5 10.0523 10.0523 10.5 9.5 10.5H2.5C1.94772 10.5 1.5 10.0523 1.5 9.5V3.5Z" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function ProjectIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <line x1="1" y1="5" x2="13" y2="5" stroke="currentColor" strokeWidth="1" />
      <line x1="5" y1="5" x2="5" y2="13" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function DecisionIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1" />
      <path d="M4.5 6L5.5 7L7.5 5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HeadingDot({ level }) {
  return (
    <span
      style={{
        width: 4,
        height: 4,
        borderRadius: '50%',
        backgroundColor: level === 2 ? '#9CA3AF' : '#D1D5DB',
        flexShrink: 0
      }}
    />
  )
}

function BacklinkDot() {
  return (
    <span
      style={{
        width: 4,
        height: 4,
        borderRadius: '50%',
        backgroundColor: '#3B82F6',
        flexShrink: 0,
        marginLeft: 2
      }}
      title="有反向链接"
    />
  )
}

function StatusDot({ status, onClick }) {
  const colors = {
    exploring: '#FBBF24',
    locked: '#10B981',
    rejected: '#F87171'
  }
  const labels = {
    exploring: '探索中',
    locked: '已确定',
    rejected: '已否决'
  }

  return (
    <span
      onClick={(e) => { e.stopPropagation(); onClick(e) }}
      className="flex-shrink-0 cursor-pointer transition-transform hover:scale-125"
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: colors[status] || '#D1D5DB'
      }}
      title={`${labels[status] || '未知'} - 点击切换`}
    />
  )
}

function AlertTriangle() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="flex-shrink-0"
    >
      <path
        d="M7 1L12 11H2L7 1Z"
        stroke="#F59E0B"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 5V8"
        stroke="#F59E0B"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="7" cy="10" r="1" fill="#F59E0B" />
    </svg>
  )
}

function HealthDots({ health }) {
  if (health.total === 0) return null

  const dots = []
  for (let i = 0; i < health.total; i++) {
    dots.push(
      <span
        key={i}
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          backgroundColor: i < health.locked ? '#10B981' : 'transparent',
          border: i < health.locked ? 'none' : '1px solid #D1D5DB',
          flexShrink: 0
        }}
      />
    )
  }

  return (
    <span
      className="flex items-center gap-0.5 ml-auto flex-shrink-0"
      title={`${health.total} 个决策中 ${health.locked} 个已确定`}
    >
      {dots}
    </span>
  )
}

function CheckCircle() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-auto flex-shrink-0">
      <circle cx="7" cy="7" r="6" fill="#D1FAE5" stroke="#10B981" strokeWidth="1" />
      <path d="M4.5 7L6 8.5L9.5 5" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ConstitutionTooltip({ constraints }) {
  const [show, setShow] = useState(false)

  if (!constraints || constraints.length === 0) return null

  const display = constraints.slice(0, 2).join(' · ')
  const hasMore = constraints.length > 2

  return (
    <div className="relative">
      <p
        className="text-[11px] text-gray-400 mt-0.5 truncate cursor-default"
        onMouseEnter={() => hasMore && setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {display}{hasMore ? ' ...' : ''}
      </p>
      {show && hasMore && (
        <div
          className="absolute left-0 top-full mt-1 z-50 rounded-lg p-2.5 shadow-lg"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            minWidth: '180px'
          }}
        >
          <p className="text-[10px] text-gray-400 mb-1">全部约束</p>
          {constraints.map((c, i) => (
            <p key={i} className="text-[11px] text-gray-600">{i + 1}. {c}</p>
          ))}
        </div>
      )}
    </div>
  )
}

function TreeItem({ node, depth, onSelectDoc }) {
  const {
    activeProjectId, switchProject, toggleTreeNode,
    activeDocId, setActiveDocId, setActiveHeadingId, activeHeadingId,
    dropToCreateDocument, expandProjectNodes, highlightedDocId,
    toggleDecisionStatus, getProjectHealth
  } = useLab()

  const [dragOver, setDragOver] = useState(false)
  const nodeRef = useRef(null)

  const { projectTree } = useLab()

  const isProject = node.type === 'project'
  const isCategory = node.type === 'category'
  const isDocument = node.type === 'document'
  const hasChildren = node.children && node.children.length > 0
  const hasOutline = isDocument && node.outline && node.outline.length > 0
  const hasBacklinks = isDocument && node.backlinks && node.backlinks.length > 0
  const isDecisionDoc = isDocument && node.docType === 'decision'

  const parentNode = useMemo(() => {
    if (!isDocument || !projectTree) return null
    const findParent = (nodes) => {
      for (const n of nodes) {
        if (n.children?.some(c => c.id === node.id)) return n
        if (n.children) {
          const found = findParent(n.children)
          if (found) return found
        }
      }
      return null
    }
    return findParent(projectTree)
  }, [node.id, isDocument, projectTree])

  const isInDecisionCategory = parentNode?.categoryType === 'decision'
  const isMisplacedDecision = isDecisionDoc && !isInDecisionCategory

  const isActiveProject = isProject && activeProjectId === node.id
  const isActiveDoc = isDocument && activeDocId === node.id
  const isHighlighted = isDocument && highlightedDocId === node.id

  const isDropTarget = isProject || isCategory

  const projectHealth = useMemo(() => {
    if (isProject) return getProjectHealth(node.id)
    return null
  }, [isProject, node.id, getProjectHealth, projectTree])

  const handleClick = () => {
    if (isProject) {
      switchProject(node.id)
      if (!node.expanded) toggleTreeNode(node.id)
    } else if (isCategory) {
      toggleTreeNode(node.id)
    } else if (isDocument) {
      if (activeDocId === node.id) {
        toggleTreeNode(node.id)
      } else {
        setActiveDocId(node.id)
        setActiveHeadingId(null)
        if (!node.expanded) toggleTreeNode(node.id)
        if (onSelectDoc) onSelectDoc(node)
      }
    }
  }

  const handleHeadingClick = (e, heading) => {
    e.stopPropagation()
    setActiveHeadingId(heading.id)
    
    let elementId = ''
    if (heading.fieldKey) {
      elementId = `field-${node.id}-${heading.fieldKey}`
    } else {
      elementId = `heading-${node.id}-${heading.id}`
    }
    
    const el = document.getElementById(elementId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleStatusClick = (e) => {
    e.stopPropagation()
    toggleDecisionStatus(node.id)
  }

  const getCategoryColor = () => {
    if (!isCategory) return {}
    if (node.categoryType === 'insight') return { color: '#8B5CF6' }
    if (node.categoryType === 'archive') return { color: '#3B82F6' }
    if (node.categoryType === 'decision') return { color: '#F59E0B' }
    return {}
  }

  const handleDragOver = (e) => {
    if (!isDropTarget) return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
    setDragOver(true)

    if (isProject && !node.expanded) {
      expandProjectNodes(node.id)
    } else if (isCategory && !node.expanded) {
      toggleTreeNode(node.id)
    }
  }

  const handleDragEnter = (e) => {
    if (!isDropTarget) return
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    if (!isDropTarget) return
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  const handleDrop = (e) => {
    if (!isDropTarget) return
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)

    try {
      const rawData = e.dataTransfer.getData('application/json')
      if (!rawData) return
      const dragData = JSON.parse(rawData)
      if (dragData.source !== 'live_lab') return

      const projectId = isProject ? node.id : activeProjectId
      const parentId = isCategory ? node.id : node.id

      dropToCreateDocument(projectId, parentId, dragData)
    } catch (err) {
      console.error('Drop error:', err)
    }
  }

  const bgColor = dragOver
    ? '#F3E8FF'
    : isHighlighted
    ? 'rgba(34, 197, 94, 0.12)'
    : isActiveProject || isActiveDoc
    ? '#F3F4F6'
    : 'transparent'

  const borderStyle = dragOver
    ? '2px dashed #A855F7'
    : isHighlighted
    ? '1px solid rgba(34, 197, 94, 0.3)'
    : 'none'

  const isRejected = isDecisionDoc && isInDecisionCategory && node.status === 'rejected'

  return (
    <div ref={nodeRef} data-node-id={node.id}>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="flex items-center gap-1.5 py-1 px-1.5 rounded-md cursor-pointer transition-all select-none"
        style={{
          paddingLeft: `${depth * 14 + 6}px`,
          backgroundColor: bgColor,
          color: isActiveProject || isActiveDoc ? '#111827' : isDocument ? '#6B7280' : '#374151',
          border: borderStyle,
          transition: 'background-color 0.2s, border 0.2s'
        }}
        onMouseEnter={(e) => {
          if (!dragOver && !isActiveProject && !isActiveDoc && !isHighlighted) {
            e.currentTarget.style.backgroundColor = '#F9FAFB'
          }
        }}
        onMouseLeave={(e) => {
          if (!dragOver && !isActiveProject && !isActiveDoc && !isHighlighted) {
            e.currentTarget.style.backgroundColor = 'transparent'
          }
        }}
      >
        {(isProject || isCategory || (isDocument && hasOutline)) && (
          <Chevron expanded={node.expanded} />
        )}
        {!isProject && !isCategory && !hasOutline && <span style={{ width: 10, flexShrink: 0 }} />}

        {isProject ? (
          <ProjectIcon />
        ) : isCategory ? (
          node.categoryType === 'decision' ? <DecisionIcon /> : <FolderIcon />
        ) : (
          <DocIcon />
        )}

        <span
          className="text-xs truncate"
          style={{
            fontWeight: isProject ? 600 : isCategory ? 500 : 400,
            fontSize: isProject ? '12px' : '11px',
            textDecoration: isRejected ? 'line-through' : 'none',
            color: isRejected ? '#9CA3AF' : undefined,
            ...getCategoryColor()
          }}
        >
          {node.name}
        </span>

        {isDecisionDoc && isInDecisionCategory && (
          <StatusDot status={node.status} onClick={handleStatusClick} />
        )}
        {isMisplacedDecision && (
          <span title="决策记录应归档到 Decision 分类">
            <AlertTriangle />
          </span>
        )}

        {hasBacklinks && <BacklinkDot />}

        {isDocument && node.standardized && (
          <span
            className="text-[9px] px-1 py-0.5 rounded-full font-medium ml-auto"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.12)',
              color: '#16a34a'
            }}
          >
            ✓
          </span>
        )}

        {isProject && projectHealth && projectHealth.total > 0 && (
          projectHealth.percentage === 100
            ? <CheckCircle />
            : <HealthDots health={projectHealth} />
        )}
      </div>

      {isProject && node.constitution && (
        <div style={{ paddingLeft: `${depth * 14 + 6 + 24}px` }}>
          <ConstitutionTooltip constraints={node.constitution.constraints} />
        </div>
      )}

      <AnimatePresence>
        {node.expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {node.children.map(child => (
              <TreeItem
                key={child.id}
                node={child}
                depth={depth + 1}
                onSelectDoc={onSelectDoc}
              />
            ))}
          </motion.div>
        )}

        {node.expanded && isDocument && hasOutline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {node.outline.map(heading => (
              <div
                key={heading.id}
                onClick={(e) => handleHeadingClick(e, heading)}
                className="flex items-center gap-1.5 py-0.5 px-1.5 rounded-md cursor-pointer transition-colors select-none"
                style={{
                  paddingLeft: `${(depth + 1) * 14 + 6 + (heading.level === 3 ? 12 : 0)}px`,
                  color: activeHeadingId === heading.id ? '#111827' : '#9CA3AF',
                  backgroundColor: activeHeadingId === heading.id ? '#F3F4F6' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (activeHeadingId !== heading.id) e.currentTarget.style.backgroundColor = '#F9FAFB'
                }}
                onMouseLeave={(e) => {
                  if (activeHeadingId !== heading.id) e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <HeadingDot level={heading.level} />
                <span className="text-[10px] truncate leading-tight">{heading.text}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Sidebar({ onSelectDoc }) {
  const { projectTree, sidebarCollapsed, setSidebarCollapsed, expandAllProjects, activeProjectId, getProjectHealth, switchProject } = useLab()
  const [sidebarDragOver, setSidebarDragOver] = useState(false)
  const expandedRef = useRef(false)

  const handleSidebarDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setSidebarDragOver(true)
    if (!expandedRef.current) {
      expandedRef.current = true
      expandAllProjects()
    }
  }

  const handleSidebarDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'none'
  }

  const handleSidebarDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return
    setSidebarDragOver(false)
    expandedRef.current = false
  }

function ChevronDown({ size = 14, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function ChevronRight({ size = 14, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function Plus({ size = 12, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function ProjectDashboard({ projects, activeProjectId, getProjectHealth, switchProject }) {
  const [isOpen, setIsOpen] = useState(true)
  
  const toggleDashboard = () => {
    setIsOpen(!isOpen)
    localStorage.setItem('kairos-dashboard-collapsed', String(!isOpen))
  }

  const currentProject = projects.find(p => p.id === activeProjectId)

  return (
    <div className="project-dashboard">
      <button onClick={toggleDashboard} className="flex items-center justify-between w-full px-3 py-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">项目仪表盘</span>
        <ChevronDown size={14} className={`transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="px-2 pb-3 space-y-1">
          {projects.map(project => {
            const health = getProjectHealth(project.id)
            return (
              <button
                key={project.id}
                onClick={() => switchProject(project.id)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors ${
                  activeProjectId === project.id ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="truncate">{project.name}</span>
                <HealthIndicator percentage={health.percentage} locked={health.locked} total={health.total} />
              </button>
            )
          })}
          
          <button 
            onClick={() => {}} 
            className="w-full flex items-center gap-1.5 px-2 py-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Plus size={12} />
            新建项目
          </button>
        </div>
      )}
      
      {!isOpen && currentProject && (
        <button onClick={toggleDashboard} className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-gray-700">
          <span className="truncate">{currentProject.name}</span>
          <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
        </button>
      )}
    </div>
  )
}

  const handleSidebarDrop = (e) => {
    e.preventDefault()
    setSidebarDragOver(false)
    expandedRef.current = false
  }

  if (sidebarCollapsed) {
    return (
      <div
        className="h-full w-full flex flex-col items-center py-4 gap-4"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          title="展开导航"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3L9 7L5 11" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <span
            className="text-[10px] font-bold tracking-wider"
            style={{ color: '#374151', writingMode: 'vertical-rl' }}
          >
            TL
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          {projectTree.map(project => (
            <div
              key={project.id}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#D1D5DB' }}
              title={project.name}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className="h-full w-full flex flex-col overflow-hidden"
      style={{
        backgroundColor: '#FFFFFF',
        borderRight: sidebarDragOver ? '2px dashed #A855F7' : '1px solid #F3F4F6'
      }}
      onDragOver={handleSidebarDragOver}
      onDragEnter={handleSidebarDragEnter}
      onDragLeave={handleSidebarDragLeave}
      onDrop={handleSidebarDrop}
    >
      <div className="px-4 pt-4 pb-2 flex items-center justify-between border-b border-gray-50">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#111827' }}>
            <span className="text-[9px] font-bold" style={{ color: '#FFFFFF' }}>TL</span>
          </span>
          <h1 className="text-xs font-semibold tracking-tight truncate" style={{ color: '#374151' }}>
            Thinking Lab
          </h1>
        </div>
        <button
          onClick={() => setSidebarCollapsed(true)}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors flex-shrink-0"
          title="收起导航"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M7.5 3L4.5 6L7.5 9" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <ProjectDashboard 
        projects={projectTree} 
        activeProjectId={activeProjectId} 
        getProjectHealth={getProjectHealth}
        switchProject={switchProject}
      />

      <div className="px-4 pt-3 pb-2">
        <p className="text-[10px] tracking-wide" style={{ color: '#D1D5DB' }}>
          项目导航
        </p>
      </div>

      <div className="flex-1 overflow-auto px-2 pb-4">
        {projectTree.map(project => (
          <TreeItem
            key={project.id}
            node={project}
            depth={0}
            onSelectDoc={onSelectDoc}
          />
        ))}
      </div>
    </div>
  )
}
