import { useState } from 'react'
import { useLab } from '../context/LabContext'
import { TEMPLATE_TYPES, getTemplateLabel, getTemplateIcon, createDefaultFields } from '../config/templates'
import { motion, AnimatePresence } from 'framer-motion'

// Chevron 组件
function Chevron({ expanded }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-transform duration-200"
      style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
    >
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  )
}

// 文档分类颜色指示器
function CategoryDot({ categoryType }) {
  const dotColors = {
    'constitution': '#8B5CF6', // 紫色 - 宪法/决策
    'market-insight': '#3B82F6', // 蓝色 - 洞察
    'product-strategy': '#10B981', // 绿色 - 存档
    'decision-chain': '#8B5CF6', // 紫色 - 决策
    'anti-fragile-audit': '#EF4444', // 红色 - 审计
    'execution-roadmap': '#F59E0B' // 橙色 - 执行
  }
  
  // 默认分类匹配
  let color = '#9CA3AF'
  if (categoryType?.includes('archive') || categoryType?.includes('product')) color = '#10B981'
  if (categoryType?.includes('insight') || categoryType?.includes('market')) color = '#3B82F6'
  if (categoryType?.includes('decision') || categoryType?.includes('constitution')) color = '#8B5CF6'
  
  return (
    <span
      className="flex-shrink-0 w-2 h-2 rounded-full"
      style={{ backgroundColor: dotColors[categoryType] || color }}
    />
  )
}

// 项目选择下拉菜单
function ProjectSelector() {
  const { projects, activeProjectId, setActiveProject, createProject } = useLab()
  const [isOpen, setIsOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleCreateProject = (e) => {
    e.preventDefault()
    if (newProjectName.trim()) {
      createProject(newProjectName.trim())
      setNewProjectName('')
      setShowCreateForm(false)
      setIsOpen(false)
    }
  }

  const activeProject = projects.find(p => p.id === activeProjectId)

  return (
    <div className="relative mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-800 truncate">
          {activeProject?.name || '选择项目'}
        </span>
        <Chevron expanded={isOpen} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="project-selector-panel"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          >
            <div className="max-h-60 overflow-y-auto">
              {projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => {
                    setActiveProject(project.id)
                    setIsOpen(false)
                  }}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                    project.id === activeProjectId
                      ? 'bg-purple-50 text-purple-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {project.name}
                </button>
              ))}
            </div>
            
            <div className="border-t border-gray-200">
              {showCreateForm ? (
                <form onSubmit={handleCreateProject} className="p-2">
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="输入项目名称..."
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      className="flex-1 px-2 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      创建
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false)
                        setNewProjectName('')
                      }}
                      className="flex-1 px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                    >
                      取消
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  新建项目
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 宪法锚点组件
function ConstitutionAnchor() {
  const { currentProject, selectDocument } = useLab()
  const [isExpanded, setIsExpanded] = useState(false)
  
  // 简化版 - 只查找 manifesto 文档
  const findManifestoDoc = () => {
    if (!currentProject?.children) return null
    const constitutionCat = currentProject.children.find(c => 
      c.categoryType === 'constitution' || (c.name && c.name.includes('宪法'))
    )
    if (!constitutionCat?.children) return null
    return constitutionCat.children.find(d => 
      d.docType === 'manifesto' || d.typeKey === 'manifesto' || (d.name && d.name.includes('核心定位'))
    )
  }
  
  const manifestoDoc = findManifestoDoc()
  const fields = manifestoDoc?.fields || {}
  
  // 5 个核心字段
  const constitutionFields = [
    { key: 'slogan', label: '一句话宣言' },
    { key: 'targetUser', label: '目标用户' },
    { key: 'differentiation', label: '差异化' },
    { key: 'vibe', label: '产品气质' },
    { key: 'antiWhat', label: '明确反对' }
  ]
  
  // 检查是否有任何字段已设置
  const isSet = Object.values(fields).some(v => v && v.trim())
  const displaySlogan = fields?.slogan || '未设置核心定位'
  
  const handleToggle = (e) => {
    e.stopPropagation()
    setIsExpanded(prev => !prev)
  }
  
  const handleEdit = () => {
    const doc = findManifestoDoc()
    if (doc?.id) {
      selectDocument(doc.id)
    }
  }
  
  return (
    <div className="w-full mb-4">
      <div
        onClick={handleEdit}
        className="w-full text-left p-3 rounded-lg transition-all hover:shadow-sm cursor-pointer"
        style={{
          backgroundColor: isSet ? '#F5F3FF' : '#F9FAFB',
          border: isSet ? '1px solid #DDD6FE' : '1px dashed #D1D5DB'
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-purple-600 font-semibold uppercase tracking-wider">
              核心定位
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              onClick={handleToggle}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              {isExpanded ? '收起' : '查看'}
            </span>
            <span className="text-xs text-gray-400">
              编辑
            </span>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 leading-relaxed" style={{ lineHeight: '1.4' }}>
          {displaySlogan}
        </p>
      </div>
      
      {isExpanded && (
        <div className="mt-2 px-3">
          {constitutionFields.map(({ key, label }) => (
            <div key={key} className="mb-1.5">
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-gray-400 uppercase tracking-wider">
                  {label}
                </span>
              </div>
              <p className="text-[9px] text-gray-400 leading-relaxed mt-0.5" style={{ lineHeight: '1.3' }}>
                {fields[key] || <span className="text-gray-300 italic">未设置</span>}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function treeChildKey(parentNode, child, index) {
  if (child?.id != null && String(child.id) !== '') return String(child.id)
  return `tree-fallback-${parentNode?.id || 'root'}-${index}-${child?.type || 'node'}-${child?.name || ''}`
}

// 树形节点组件
function TreeNode({ node, level = 0, selectedDocId, onSelect, onToggle, collapsed }) {
  const { selectDocument, toggleTreeNode } = useLab()
  const isExpanded = node.expanded
  const isSelected = selectedDocId === node.id
  const isDocument = node.type === 'document'
  const isCategory = node.type === 'category'
  const isProject = node.type === 'project'

  const handleClick = () => {
    if (isDocument) {
      selectDocument(node.id)
      onSelect?.(node.id)
    } else {
      toggleTreeNode(node.id)
      onToggle?.(node.id)
    }
  }

  // 收起状态下只显示图标，不展开子节点
  if (collapsed) {
    return (
      <div className="select-none">
        <button
          onClick={handleClick}
          className={`w-full h-8 flex items-center justify-center rounded transition-colors ${
            isSelected
              ? 'bg-purple-100 text-purple-700'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          title={node.name}
        >
          <span className="text-base">
            {isDocument ? (
              <span style={{ fontSize: '10px' }}>•</span>
            ) : (
              isProject ? '📁' : '📂'
            )}
          </span>
        </button>
      </div>
    )
  }

  return (
    <div className="select-none">
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded transition-colors ${
          isSelected
            ? 'bg-purple-100 text-purple-700'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {!isDocument && <Chevron expanded={isExpanded} />}
        {isDocument && <span className="w-2" />}
        
        <span className="flex-shrink-0">
          {isDocument ? (
            <CategoryDot categoryType={node.parentId} />
          ) : (
            <span className="text-lg">
              {isProject ? '📁' : '📂'}
            </span>
          )}
        </span>
        
        <span className="truncate flex-1 text-left">
          {node.name}
        </span>
      </button>

      {node.children && node.children.length > 0 && isExpanded && (
        <div className="mt-0.5">
          {node.children.map((child, index) => (
            <TreeNode
              key={treeChildKey(node, child, index)}
              node={child}
              level={level + 1}
              selectedDocId={selectedDocId}
              onSelect={onSelect}
              onToggle={onToggle}
              collapsed={collapsed}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// 模板选择菜单
function TemplateSelector({ onSelect, onClose }) {
  const { currentProject, createDocument } = useLab()
  
  // 获取当前项目的第一个分类作为默认父节点
  const getDefaultParentId = () => {
    if (currentProject?.children?.length > 0) {
      return currentProject.children[0].id
    }
    return null
  }

  const handleTemplateSelect = (templateType) => {
    const parentId = getDefaultParentId()
    if (!parentId) {
      alert('没有可用的分类来创建文档')
      return
    }

    const template = TEMPLATE_TYPES[templateType]
    createDocument(parentId, {
      name: template.label,
      docType: templateType,
      typeKey: templateType,
      fields: createDefaultFields(templateType)
    })
    onSelect?.()
    onClose?.()
  }

  return (
    <div className="p-2 max-h-64 overflow-y-auto">
      <div className="flex flex-col gap-0.5">
        {Object.entries(TEMPLATE_TYPES).map(([key, template]) => (
          <button
            key={key}
            onClick={() => handleTemplateSelect(key)}
            className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-md transition-colors border border-transparent hover:border-purple-200 w-full justify-start"
            title={template.label}
          >
            <span className="text-sm">{template.icon}</span>
            <span className="whitespace-nowrap text-left">{template.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// 新建文档按钮
function NewDocumentButton() {
  const [showTemplates, setShowTemplates] = useState(false)

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3">
      <button
        onClick={() => setShowTemplates(!showTemplates)}
        className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-purple-600 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
        新建文档
      </button>

      <AnimatePresence>
        {showTemplates && (
          <motion.div
            key="new-document-template-panel"
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 bg-white border border-purple-200 rounded-lg shadow-lg">
              <div className="flex items-center justify-between px-3 py-2 border-b border-purple-100">
                <span className="text-sm font-semibold text-gray-700">选择模板</span>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </button>
              </div>
              <TemplateSelector onClose={() => setShowTemplates(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 主 Sidebar 组件
export default function Sidebar() {
  const { projects, activeProjectId, activeDocId, currentProject, sidebarCollapsed, setSidebarCollapsed } = useLab()

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* 头部 - 收起时隐藏 */}
      {!sidebarCollapsed && (
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">思维实验室</h2>
            <p className="text-xs text-gray-500">管理你的项目和文档</p>
          </div>
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="收起侧边栏"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* 收起状态下的展开按钮 */}
      {sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="w-full h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title="展开侧边栏"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}

      {/* 项目选择器 - 收起时简化显示 */}
      {!sidebarCollapsed ? (
        <div className="px-4 pt-4">
          <ProjectSelector />
        </div>
      ) : (
        <div className="p-2">
          <button
            className="w-full h-8 flex items-center justify-center text-lg"
            title={currentProject?.name || '选择项目'}
          >
            📁
          </button>
        </div>
      )}

      {/* 宪法锚点 - 收起时隐藏 */}
      {!sidebarCollapsed && (
        <div className="px-4 pt-2">
          <ConstitutionAnchor />
        </div>
      )}

      {/* 项目树 - 收起时只显示图标 */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {currentProject?.children?.map((category, catIndex) => (
          <TreeNode
            key={category?.id != null && String(category.id) !== '' ? String(category.id) : `root-cat-${catIndex}`}
            node={category}
            selectedDocId={activeDocId}
            collapsed={sidebarCollapsed}
          />
        ))}
        {!currentProject?.children?.length && !sidebarCollapsed && (
          <div className="text-center text-sm text-gray-400 py-8">
            暂无分类
          </div>
        )}
      </div>

      {/* 新建文档按钮 - 收起时简化显示 */}
      {sidebarCollapsed ? (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-2">
          <button
            className="w-full h-8 flex items-center justify-center text-lg hover:bg-gray-50 rounded transition-colors"
            title="新建文档"
          >
            +
          </button>
        </div>
      ) : (
        <NewDocumentButton />
      )}
    </div>
  )
}
