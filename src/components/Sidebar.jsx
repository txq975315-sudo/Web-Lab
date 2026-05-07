import { useLab } from '../context/LabContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useCallback, useMemo } from 'react'
import HealthIndicator from './HealthIndicator'

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
  for (let i = 0; i < Math.min(health.total, 5); i++) {
    dots.push(
      <span
        key={i}
        style={{
          width: 6,
          height: 6,
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
      className="flex items-center gap-1 ml-auto flex-shrink-0"
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

function ProjectDashboard({ projects, activeProjectId, getProjectHealth, switchProject, setActiveDocId, createProject }) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  const currentProject = projects.find(p => p.id === activeProjectId)

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  const handleProjectClick = (projectId) => {
    switchProject(projectId)
  }

  const handleNewProject = () => {
    const projectName = prompt('请输入项目名称：', '新项目')
    if (projectName && projectName.trim()) {
      createProject(projectName.trim())
    }
  }

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={handleToggle}
        className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-gray-50 transition-colors"
      >
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">项目仪表盘</span>
        <Chevron expanded={isExpanded} />
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-2 pb-3 space-y-1">
              {projects.map(project => {
                const health = getProjectHealth(project.id)
                const isActive = activeProjectId === project.id
                
                return (
                  <button
                    key={project.id}
                    onClick={() => handleProjectClick(project.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive 
                        ? 'bg-purple-50 text-purple-700' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="truncate flex-1 text-left">{project.name}</span>
                    {health.total > 0 && (
                      health.percentage === 100 
                        ? <CheckCircle />
                        : <HealthDots health={health} />
                    )}
                  </button>
                )
              })}
              
              <button
                onClick={handleNewProject}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                新建项目
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isExpanded && currentProject && (
        <div className="px-3 pb-2.5">
          <button
            onClick={handleToggle}
            className="w-full flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            <span className="truncate">{currentProject.name}</span>
            <Chevron expanded={false} />
          </button>
        </div>
      )}
    </div>
  )
}

function ConstitutionAnchor({ constitution, setActiveDocId, activeProject }) {
  if (!constitution) return null

  const constraints = constitution.constraints || []

  // 使用 useMemo 确保 slogan 变化时 0 延迟更新
  // 优先级：manifesto 文档的 fields.slogan > constitution.corePositioning > "未设置核心定位"
  const displaySlogan = useMemo(() => {
    // 策略 1：从 constitution.manifesto.fields.slogan 读取
    const manifestoSlogan = constitution?.manifesto?.fields?.slogan
    if (manifestoSlogan && manifestoSlogan.trim() !== '') {
      return manifestoSlogan
    }

    // 策略 2：从 constitution.corePositioning 读取
    if (constitution?.corePositioning && constitution.corePositioning !== '未设置核心定位') {
      return constitution.corePositioning
    }

    // 策略 3：从项目树中的 manifesto 文档动态读取
    if (activeProject?.children) {
      const constitutionCat = activeProject.children.find(cat =>
        cat.categoryType === 'constitution' || cat.id.includes('constitution')
      )

      if (constitutionCat?.children) {
        const manifestoDoc = constitutionCat.children.find(doc =>
          doc.docType === 'manifesto' || doc.typeKey === 'manifesto'
        )

        if (manifestoDoc?.fields?.slogan && manifestoDoc.fields.slogan.trim() !== '') {
          return manifestoDoc.fields.slogan
        }
      }
    }

    return '未设置核心定位'
  }, [constitution, activeProject])

  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipRef = useRef(null)

  // 查找核心定位文档的实际 ID
  const findManifestoDocId = () => {
    if (!constitution) return null

    // 优先使用 manifesto 文档（如果存在）
    if (constitution.manifestoDocId) {
      return constitution.manifestoDocId
    }

    // 尝试从项目树中查找
    if (activeProject?.children) {
      const constitutionCat = activeProject.children.find(cat =>
        cat.categoryType === 'constitution' || cat.id.includes('constitution')
      )
      if (constitutionCat?.children) {
        const manifestoDoc = constitutionCat.children.find(doc =>
          doc.docType === 'manifesto' || doc.typeKey === 'manifesto'
        )
        if (manifestoDoc) {
          return manifestoDoc.id
        }
      }
    }

    return 'core-positioning' // 回退到默认值
  }

  const handleClickCore = () => {
    if (setActiveDocId) {
      const manifestoDocId = findManifestoDocId()
      setActiveDocId(manifestoDocId)
    }
  }

  const handleClickConstraint = (index) => {
    // TODO: 实现约束详情查看
  }

  // 检查是否已设置核心定位（有实际内容）
  const hasContent = displaySlogan && displaySlogan !== '未设置核心定位'

  return (
    <div
      className="mx-3 mb-3 p-3 rounded-xl border transition-all hover:shadow-md"
      style={{
        background: hasContent
          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(168, 85, 247, 0.05) 100%)'
          : 'rgba(249, 250, 251, 1)',
        borderColor: hasContent ? 'rgba(139, 92, 246, 0.2)' : 'rgba(229, 231, 235, 1)'
      }}
    >
      {/* 核心定位 */}
      <button
        onClick={handleClickCore}
        className="w-full text-left group mb-2"
      >
        <div className="flex items-start gap-2">
          <span className="text-base mt-0.5 flex-shrink-0">{hasContent ? '🎯' : '📍'}</span>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium truncate transition-colors ${
                hasContent
                  ? 'text-purple-900 group-hover:text-purple-700'
                  : 'text-gray-500 group-hover:text-gray-700'
              }`}
              title={displaySlogan}
            >
              {displaySlogan}
            </p>
            {!hasContent && (
              <p className="text-xs text-gray-400 mt-0.5">点击设置核心定位</p>
            )}
          </div>
          <svg
            className="w-4 h-4 text-gray-400 group-hover:text-purple-600 flex-shrink-0 mt-0.5 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>

      {/* 硬性约束 */}
      {constraints.length > 0 && (
        <div className="flex items-start gap-2 relative pt-2 border-t border-gray-100">
          <span className="text-sm mt-0.5 flex-shrink-0">🔒</span>
          <div className="flex-1 min-w-0">
            <div
              className="flex flex-wrap gap-x-1.5 gap-y-0.5 relative"
              onMouseEnter={() => constraints.length > 3 && setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              ref={tooltipRef}
            >
              {constraints.slice(0, 3).map((constraint, index) => (
                <button
                  key={index}
                  onClick={() => handleClickConstraint(index)}
                  className="text-[11px] text-gray-500 hover:text-purple-600 transition-colors truncate max-w-[120px]"
                  title={constraint}
                >
                  {index > 0 && '· '}
                  {constraint}
                </button>
              ))}
              {constraints.length > 3 && (
                <span className="text-[11px] text-purple-600 font-medium cursor-pointer hover:text-purple-700">
                  +{constraints.length - 3}
                </span>
              )}

              {showTooltip && constraints.length > 3 && (
                <div
                  className="absolute left-0 top-full mt-2 z-50 rounded-lg p-3 shadow-xl border border-purple-100"
                  style={{
                    backgroundColor: '#FFFFFF',
                    minWidth: '220px',
                    maxWidth: '280px'
                  }}
                >
                  <p className="text-xs font-semibold text-purple-700 mb-2">全部硬性约束 ({constraints.length})</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {constraints.map((constraint, index) => (
                      <button
                        key={index}
                        onClick={() => handleClickConstraint(index)}
                        className="block w-full text-left text-xs text-gray-600 hover:text-purple-600 hover:bg-purple-50 px-2 py-1.5 rounded transition-colors"
                      >
                        <span className="inline-block w-4 text-gray-400 font-medium">{index + 1}.</span>
                        {constraint}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const DOCUMENT_TEMPLATES = [
  { id: 'user-persona', name: '用户画像', icon: '👤', module: 'market-insight' },
  { id: 'competitor-analysis', name: '竞品分析', icon: '⚔️', module: 'market-insight' },
  { id: 'market-size', name: '市场规模', icon: '📈', module: 'market-insight' },
  { id: 'business-canvas', name: '商业画布', icon: '🧩', module: 'market-insight' },
  { id: 'prd-spec', name: 'PRD 规格', icon: '📋', module: 'product-strategy' },
  { id: 'north-star-metric', name: '北极星指标', icon: '🎯', module: 'product-strategy' },
  { id: 'growth-engine', name: '增长飞轮', icon: '🔄', module: 'product-strategy' },
  { id: 'monetization', name: '变现策略', icon: '💰', module: 'product-strategy' },
  { id: 'gtm-plan', name: 'GTM 计划', icon: '🚀', module: 'product-strategy' },
  { id: 'financial-model', name: '财务模型', icon: '📊', module: 'product-strategy' },
  { id: 'death-prediction', name: '死亡预测', icon: '💀', module: 'anti-fragile-audit' },
  { id: 'moat-building', name: '壁垒建设', icon: '🏰', module: 'anti-fragile-audit' },
  { id: 'external-dependencies', name: '外部依赖', icon: '🔗', module: 'anti-fragile-audit' },
  { id: 'mvp-scope', name: 'MVP 范围', icon: '✂️', module: 'execution-roadmap' },
  { id: 'milestones', name: '里程碑', icon: '🚩', module: 'execution-roadmap' },
  { id: 'hypothesis-validation', name: '假设验证', icon: '🧪', module: 'execution-roadmap' },
  { id: 'measurement-plan', name: '衡量方案', icon: '📉', module: 'execution-roadmap' },
  { id: 'resource-budget', name: '资源预算', icon: '👛', module: 'execution-roadmap' },
  { id: 'action-items', name: '待办行动', icon: '✅', module: 'execution-roadmap' }
]

function TemplateSelector({ moduleId, onSelectTemplate, onClose }) {
  const filteredTemplates = DOCUMENT_TEMPLATES.filter(t => t.module === moduleId)

  return (
    <div className="relative">
      <div className="grid grid-cols-2 gap-1 mt-2">
        {filteredTemplates.map(template => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-600 hover:bg-purple-50 hover:text-purple-700 rounded-md transition-colors border border-transparent hover:border-purple-200"
          >
            <span>{template.icon}</span>
            <span className="truncate">{template.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

const MODULE_STRUCTURE = [
  {
    id: 'constitution',
    number: '01',
    name: '项目宪法',
    icon: '📁',
    categoryType: 'constitution',
    isAlwaysVisible: true,
    description: '核心定位、约束和决策'
  },
  {
    id: 'market-insight',
    number: '02',
    name: '市场与用户洞察',
    icon: '🔍',
    categoryType: 'market-insight',
    isAlwaysVisible: false,
    description: '用户、竞品和市场'
  },
  {
    id: 'product-strategy',
    number: '03',
    name: '产品与商业策略',
    icon: '⚡',
    categoryType: 'product-strategy',
    isAlwaysVisible: false,
    description: 'PRD、指标和增长'
  },
  {
    id: 'decision-chain',
    number: '04',
    name: '决策链图谱',
    icon: '🔀',
    isSpecialView: true,
    isAlwaysVisible: true,
    description: '决策时间轴视图'
  },
  {
    id: 'anti-fragile-audit',
    number: '05',
    name: '反脆弱审计',
    icon: '🛡️',
    categoryType: 'anti-fragile-audit',
    isAlwaysVisible: false,
    description: '风险预测和壁垒'
  },
  {
    id: 'execution-roadmap',
    number: '06',
    name: '执行路线图',
    icon: '🗺️',
    categoryType: 'execution-roadmap',
    isAlwaysVisible: false,
    description: 'MVP 和里程碑'
  }
]

function ProjectNavigator({ projectChildren, activeProject, activeDocId, setActiveDocId, setActiveHeadingId, onSpecialModuleClick, updateDocument, addDocument }) {
  const [expandedModules, setExpandedModules] = useState({
    'constitution': true
  })
  const [draggedItem, setDraggedItem] = useState(null)
  const [dropTargetModule, setDropTargetModule] = useState(null)
  const [showTemplateSelector, setShowTemplateSelector] = useState(null)
  const [showGlobalTemplateSelector, setShowGlobalTemplateSelector] = useState(false)
  const [documentStates, setDocumentStates] = useState({})

  // 动态计算每个模块的文档数量
  const getModuleDocuments = useCallback((moduleConfig) => {
    if (!activeProject || !activeProject.children) {
      return []
    }

    const category = activeProject.children.find(cat => {
      const catId = cat.id.split('-').pop()
      return cat.categoryType === moduleConfig.categoryType || catId === moduleConfig.id
    })

    if (!category) {
      return []
    }

    return category.children?.filter(doc => doc.type === 'document') || []
  }, [activeProject])

  // 过滤可见模块：有文档的模块 + 始终显示的模块
  const visibleModules = useMemo(() => {
    return MODULE_STRUCTURE.filter(moduleConfig => {
      if (moduleConfig.isAlwaysVisible || moduleConfig.isSpecialView) return true

      const docsInModule = getModuleDocuments(moduleConfig)
      return docsInModule.length > 0
    })
  }, [activeProject, getModuleDocuments])

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }))
  }

  const getDecisionHealth = () => {
    if (!projectChildren) return { total: 0, locked: 0 }
    let total = 0
    let locked = 0
    
    function walk(nodes) {
      for (const node of nodes) {
        if (node.type === 'document' && node.docType === 'decision') {
          total++
          if (node.status === 'locked') locked++
        }
        if (node.children) walk(node.children)
      }
    }
    
    walk(projectChildren)
    return { total, locked }
  }

  const handleDragStart = (e, childConfig, moduleConfig) => {
    setDraggedItem({
      childConfig,
      sourceModule: moduleConfig.id,
      childDocId: `${moduleConfig.id}-${childConfig.id}`
    })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'document-move',
      sourceModule: moduleConfig.id,
      documentId: childConfig.id,
      documentName: childConfig.name
    }))
    
    setTimeout(() => {
      e.target.style.opacity = '0.5'
    }, 0)
  }

  const handleDragEnd = (e) => {
    setDraggedItem(null)
    setDropTargetModule(null)
    e.target.style.opacity = '1'
  }

  const handleDragOver = (e, targetModuleId) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (draggedItem && draggedItem.sourceModule !== targetModuleId) {
      e.dataTransfer.dropEffect = 'move'
      setDropTargetModule(targetModuleId)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDropTargetModule(null)
  }

  const handleDrop = (e, targetModuleId) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!draggedItem || draggedItem.sourceModule === targetModuleId) {
      setDraggedItem(null)
      setDropTargetModule(null)
      return
    }
    
    console.log(`移动文档 "${draggedItem.childConfig.name}" 从 ${draggedItem.sourceModule} 到 ${targetModuleId}`)
    
    setDraggedItem(null)
    setDropTargetModule(null)
  }

  const cycleDecisionStatus = (docId) => {
    setDocumentStates(prev => {
      const currentStatus = prev[docId] || 'exploring'
      const statusCycle = {
        'exploring': 'locked',
        'locked': 'rejected',
        'rejected': 'exploring'
      }
      
      return {
        ...prev,
        [docId]: statusCycle[currentStatus]
      }
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'exploring':
        return '#FBBF24'
      case 'locked':
        return '#10B981'
      case 'rejected':
        return '#EF4444'
      default:
        return '#D1D5DB'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'exploring':
        return '探索中'
      case 'locked':
        return '已确定'
      case 'rejected':
        return '已否决'
      default:
        return '未知'
    }
  }

  const isDecisionDocument = (moduleId, childId) => {
    return ['constitution'].includes(moduleId) && 
           ['decisions-made', 'rejected-graveyard'].includes(childId)
  }

  const getEvidenceBadges = (docId) => {
    const mockEvidence = Math.random() > 0.7 ? {
      supporting: Math.floor(Math.random() * 5),
      challenging: Math.floor(Math.random() * 3)
    } : null
    
    return mockEvidence
  }

  // 从项目树中查找实际的文档
  const findActualDocument = (project, moduleId, childId) => {
    if (!project || !project.children) return null

    const category = project.children.find(cat => {
      // 匹配 categoryType 或 ID 的最后部分
      const catId = cat.id.split('-').pop()
      return cat.categoryType === moduleId || catId === moduleId
    })

    if (!category || !category.children) return null

    // 查找文档（通过 docType、typeKey 或名称匹配）
    const doc = category.children.find(doc =>
      (doc.docType === childId) ||
      (doc.typeKey === childId) ||
      (doc.id.includes(childId))
    )

    return doc || null
  }

  // 动态创建文档
  const handleDynamicDocumentCreation = (moduleConfig, childConfig, project) => {
    console.log(`🔧 开始动态创建文档: ${childConfig.name}`, { module: moduleConfig.id, child: childConfig.id })

    // 找到对应的分类节点
    const category = project?.children?.find(cat => {
      const catId = cat.id.split('-').pop()
      return cat.categoryType === moduleConfig.id || catId === moduleConfig.id
    })

    if (!category) {
      return
    }

    // 创建新文档
    const newDoc = {
      id: `${category.id}-doc-${childConfig.id}-${Date.now()}`,
      name: childConfig.name,
      type: 'document',
      docType: childConfig.id,
      typeKey: childConfig.id,
      parentId: category.id,
      fields: createDefaultFields(childConfig.id),
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      versionHistory: []
    }

    // 调用 LabContext 的 addDocument 方法
    if (addDocument && typeof addDocument === 'function') {
      try {
        const newDocId = addDocument(category.id, newDoc)

        // 延迟选中，确保状态已更新
        setTimeout(() => {
          setActiveDocId(newDocId)
          setActiveHeadingId(null)
        }, 100)
      } catch (error) {
        console.error('❌ 文档创建失败:', error)
      }
    }
  }

  const handleCreateFromTemplate = (template, moduleId) => {
    setShowGlobalTemplateSelector(false)

    // 如果没有指定模块，根据模板的 module 字段自动推荐
    const targetModuleId = moduleId || template.module || 'product-strategy'

    // 找到目标模块的分类节点
    const category = activeProject?.children?.find(cat => {
      const catId = cat.id.split('-').pop()
      return cat.categoryType === targetModuleId || catId === targetModuleId
    })

    if (!category) {
      alert(`无法找到模块 "${targetModuleId}"，请检查项目结构`)
      return
    }

    // 创建新文档
    const newDoc = {
      id: `${category.id}-doc-${template.id}-${Date.now()}`,
      name: template.name,
      type: 'document',
      docType: template.id,
      typeKey: template.id,
      parentId: category.id,
      fields: createDefaultFields(template.id),
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      versionHistory: []
    }

    if (addDocument && typeof addDocument === 'function') {
      try {
        const newDocId = addDocument(category.id, newDoc)

        // 展开对应模块
        setExpandedModules(prev => ({ ...prev, [targetModuleId]: true }))

        // 延迟选中新创建的文档
        setTimeout(() => {
          setActiveDocId(newDocId)
          setActiveHeadingId(null)
        }, 200)
      } catch (error) {
        console.error('❌ 文档创建失败:', error)
        alert(`文档创建失败: ${error.message}`)
      }
    } else {
      alert('系统错误：文档创建功能不可用')
    }
  }

  // 获取文档图标
  const getDocumentIcon = (docType) => {
    const iconMap = {
      'manifesto': '🎯',
      'user-persona': '👤',
      'competitor-analysis': '⚔️',
      'market-size': '📈',
      'business-canvas': '🧩',
      'prd-spec': '📋',
      'north-star-metric': '🎯',
      'growth-engine': '🔄',
      'monetization': '💰',
      'gtm-plan': '🚀',
      'financial-model': '📊',
      'decision': '✅',
      'death-prediction': '💀',
      'moat-building': '🏰',
      'external-dependencies': '🔗',
      'mvp-scope': '✂️',
      'milestones': '🚩',
      'hypothesis-validation': '🧪',
      'measurement-plan': '📉',
      'resource-budget': '👛',
      'action-items': '✅'
    }
    return iconMap[docType] || '📄'
  }

  // 统计总文档数
  const totalDocuments = useMemo(() => {
    if (!activeProject?.children) return 0
    return activeProject.children.reduce((total, cat) => {
      return total + (cat.children?.filter(doc => doc.type === 'document').length || 0)
    }, 0)
  }, [activeProject])

  return (
    <div className="px-2 pb-4">
      {/* 全局"新建文档"按钮 */}
      <button
        onClick={() => setShowGlobalTemplateSelector(true)}
        className="w-full mb-3 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-purple-600 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        新建文档
        <span className="text-xs opacity-75">({totalDocuments} 份资产)</span>
      </button>

      {/* 全局模板选择器 */}
      {showGlobalTemplateSelector && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-3 p-3 bg-white rounded-lg border border-purple-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-700">选择模板</span>
            <button
              onClick={() => setShowGlobalTemplateSelector(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <TemplateSelector
            moduleId={null}
            onSelectTemplate={(template) => handleCreateFromTemplate(template, null)}
            onClose={() => setShowGlobalTemplateSelector(false)}
          />
        </motion.div>
      )}

      {/* 动态模块列表 */}
      {visibleModules.map(moduleConfig => {
        const isExpanded = expandedModules[moduleConfig.id] || false
        const isActive = activeDocId === moduleConfig.id
        const isDropTarget = dropTargetModule === moduleConfig.id
        const moduleDocs = getModuleDocuments(moduleConfig)
        const docsCount = moduleDocs.length

        // 特殊模块（决策链）单独处理
        if (moduleConfig.isSpecialView) {
          return (
            <div key={moduleConfig.id} className="mb-1">
              <button
                onClick={() => onSpecialModuleClick && onSpecialModuleClick(moduleConfig.id)}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm font-semibold transition-colors group ${
                  isActive ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50 text-gray-800'
                }`}
              >
                <span className="text-base">{moduleConfig.icon}</span>
                <span className="text-purple-600 font-bold">{moduleConfig.number}</span>
                <span>{moduleConfig.name}</span>
                <span className="ml-auto text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
                  点击查看时间轴
                </span>
              </button>
            </div>
          )
        }

        // 普通模块 - 动态显示/隐藏
        // 始终显示的模块或有文档的模块正常显示
        // 空模块以灰色折叠状态显示
        if (!moduleConfig.isAlwaysVisible && docsCount === 0 && !moduleConfig.isSpecialView) {
          return (
            <div key={moduleConfig.id} className="mb-1 opacity-50">
              <button
                onClick={() => {
                  toggleModule(moduleConfig.id)
                  setShowTemplateSelector(moduleConfig.id)
                }}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm font-semibold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors group"
              >
                <Chevron expanded={false} />
                <span className="text-base">{moduleConfig.icon}</span>
                <span className="text-gray-400 font-bold">{moduleConfig.number}</span>
                <span>{moduleConfig.name}</span>
                <span className="ml-auto text-xs text-gray-400 group-hover:text-gray-500">
                  空
                </span>
              </button>
              {showTemplateSelector === moduleConfig.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="ml-4 pl-3 border-l border-gray-200 py-2"
                >
                  <p className="text-xs text-gray-400 mb-2">该模块暂无文档</p>
                  <TemplateSelector
                    moduleId={moduleConfig.id}
                    onSelectTemplate={(template) => handleCreateFromTemplate(template, moduleConfig.id)}
                    onClose={() => setShowTemplateSelector(null)}
                  />
                </motion.div>
              )}
            </div>
          )
        }

        return (
          <div
            key={moduleConfig.id}
            className="mb-1"
            onDragOver={(e) => handleDragOver(e, moduleConfig.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, moduleConfig.id)}
            style={{
              borderRadius: '8px',
              border: isDropTarget ? '2px dashed #A855F7' : '2px solid transparent',
              backgroundColor: isDropTarget ? 'rgba(168, 85, 247, 0.05)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <button
              onClick={() => {
                toggleModule(moduleConfig.id)
                setActiveDocId(null)
                setActiveHeadingId(null)
              }}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm font-semibold transition-colors group ${
                isActive ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50 text-gray-800'
              } ${docsCount === 0 ? 'opacity-60' : ''}`}
            >
              <Chevron expanded={isExpanded} />
              <span className="text-base">{moduleConfig.icon}</span>
              <span className="text-purple-600 font-bold">{moduleConfig.number}</span>
              <span>{moduleConfig.name}</span>

              {docsCount > 0 && (
                <span className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                  ({docsCount})
                  {moduleConfig.id === 'constitution' && (() => {
                    const health = getDecisionHealth()
                    return health.total > 0 ? (
                      <span className="flex gap-0.5">
                        {[...Array(Math.min(health.total, 3))].map((_, i) => (
                          <span
                            key={i}
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: i < health.locked ? '#10B981' : 'transparent',
                              border: i < health.locked ? 'none' : '1px solid #D1D5DB'
                            }}
                          />
                        ))}
                      </span>
                    ) : null
                  })()}
                </span>
              )}
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 pl-3 border-l border-gray-200 space-y-0.5 py-1">
                    {moduleDocs.map(doc => {
                      const isChildActive = activeDocId === doc.id
                      const docStatus = documentStates[doc.id] || 'exploring'
                      const evidence = getEvidenceBadges(doc.id)
                      const isDecision = doc.docType === 'decision'

                      return (
                        <div
                          key={doc.id}
                          draggable={!moduleConfig.isSpecialView}
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = 'move'
                            e.dataTransfer.setData('text/plain', JSON.stringify({
                              type: 'document-move',
                              sourceModule: moduleConfig.id,
                              documentId: doc.id,
                              documentName: doc.name
                            }))
                          }}
                          onDragEnd={handleDragEnd}
                          className={`group/doc flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-all cursor-pointer ${
                            isChildActive
                              ? 'bg-purple-50 text-purple-700 border-l-2 border-purple-500 -ml-[9px] pl-[8px]'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                          }`}
                          style={{
                            opacity: draggedItem?.childDocId === doc.id ? 0.5 : 1
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveDocId(doc.id)
                              setActiveHeadingId(null)
                            }}
                            className="flex items-center gap-2 flex-1 min-w-0"
                          >
                            <span className="text-sm flex-shrink-0">{getDocumentIcon(doc.docType)}</span>
                            <span className="truncate flex-1">{doc.name}</span>

                            {evidence && (
                              <span className="flex items-center gap-1 ml-2 flex-shrink-0">
                                {evidence.supporting > 0 && (
                                  <span className="flex items-center gap-0.5 text-xs text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">
                                    {evidence.supporting}👍
                                  </span>
                                )}
                                {evidence.challenging > 0 && (
                                  <span className="flex items-center gap-0.5 text-xs text-red-600 bg-red-50 px-1 py-0.5 rounded">
                                    {evidence.challenging}👎
                                  </span>
                                )}
                              </span>
                            )}
                          </button>

                          {isDecision && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                cycleDecisionStatus(doc.id)
                              }}
                              className="flex-shrink-0 ml-1 transition-transform hover:scale-125"
                              title={`${getStatusLabel(docStatus)} - 点击切换状态`}
                            >
                              <span
                                style={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  display: 'inline-block',
                                  backgroundColor: getStatusColor(docStatus),
                                  boxShadow: `0 0 0 2px white, 0 0 0 3px ${getStatusColor(docStatus)}`
                                }}
                              />
                            </button>
                          )}

                          {!moduleConfig.isSpecialView && (
                            <span className="opacity-0 group-hover/doc:opacity-100 transition-opacity text-gray-400 text-xs flex-shrink-0">
                              ⠿
                            </span>
                          )}
                        </div>
                      )
                    })}

                    {docsCount === 0 && (
                      <div className="flex items-center justify-between px-2 py-2 text-xs text-gray-400 italic">
                        该模块暂无文档
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

function TreeItem({ node, depth, onSelectDoc }) {
  const {
    activeProjectId, switchProject, toggleTreeNode,
    activeDocId, setActiveDocId, setActiveHeadingId, activeHeadingId,
    dropToCreateDocument, expandProjectNodes, highlightedDocId,
    toggleDecisionStatus, getProjectHealth,
    documentConflicts
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

        {isDocument && documentConflicts[node.id]?.hasConflict && (
          <span title="文档存在宪法冲突，请查看详情">
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
  const { projectTree, sidebarCollapsed, setSidebarCollapsed, expandAllProjects, activeProjectId, getProjectHealth, switchProject, setActiveDocId, createProject, activeDocId, setActiveHeadingId, addDocument } = useLab()
  const [sidebarDragOver, setSidebarDragOver] = useState(false)
  const expandedRef = useRef(false)

  const currentProject = projectTree.find(p => p.id === activeProjectId)
  const constitution = currentProject?.constitution

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

  const handleSidebarDrop = (e) => {
    e.preventDefault()
    setSidebarDragOver(false)
    expandedRef.current = false
  }

  if (sidebarCollapsed) {
    return (
      <div
        className="h-full w-full flex flex-col items-center py-4 gap-4"
        style={{ backgroundColor: '#FFFFFF', borderRight: '1px solid #E5E7EB' }}
      >
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          title="展开侧边栏"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: '#FFFFFF', borderRight: '1px solid #E5E7EB' }}
      onDragEnter={handleSidebarDragEnter}
      onDragOver={handleSidebarDragOver}
      onDragLeave={handleSidebarDragLeave}
      onDrop={handleSidebarDrop}
    >
      <div className="flex-1 overflow-y-auto">
        <ProjectDashboard
          projects={projectTree}
          activeProjectId={activeProjectId}
          getProjectHealth={getProjectHealth}
          switchProject={switchProject}
          setActiveDocId={setActiveDocId}
          createProject={createProject}
        />

        <ConstitutionAnchor
          constitution={constitution}
          setActiveDocId={setActiveDocId}
          activeProject={currentProject}
        />

        <ProjectNavigator
          projectChildren={currentProject?.children}
          activeProject={currentProject}
          activeDocId={activeDocId}
          setActiveDocId={setActiveDocId}
          setActiveHeadingId={setActiveHeadingId}
          addDocument={addDocument}
          onSpecialModuleClick={(moduleId) => {
            console.log('特殊模块点击:', moduleId)
            if (moduleId === 'decision-chain') {
              console.log('切换到决策链时间轴视图')
            }
          }}
        />
      </div>
    </div>
  )
}
