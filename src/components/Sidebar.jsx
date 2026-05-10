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
    constitution: '#C96442',
    'market-insight': '#6A9BCC',
    'product-strategy': '#788C5D',
    'decision-chain': '#C96442',
    'anti-fragile-audit': '#C0453A',
    'execution-roadmap': '#D97757',
  }

  let color = '#B0AEA5'
  if (categoryType?.includes('archive') || categoryType?.includes('product')) color = '#788C5D'
  if (categoryType?.includes('insight') || categoryType?.includes('market')) color = '#6A9BCC'
  if (categoryType?.includes('decision') || categoryType?.includes('constitution')) color = '#C96442'
  
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
        className="w-full flex items-center justify-between px-3 py-2 bg-lab-overlay border border-lab-border rounded-lab hover:bg-lab-raised transition-colors duration-[150ms] ease-lab"
      >
        <span className="text-sm font-medium text-lab-ink truncate">
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
            className="absolute top-full left-0 right-0 mt-1 bg-lab-overlay border border-lab-border rounded-lab shadow-card z-50"
          >
            <div className="max-h-60 overflow-y-auto">
              {projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => {
                    setActiveProject(project.id)
                    setIsOpen(false)
                  }}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors duration-[150ms] ease-lab ${
                    project.id === activeProjectId
                      ? 'lab-row-selected'
                      : 'hover:bg-lab-raised text-lab-ink'
                  }`}
                >
                  {project.name}
                </button>
              ))}
            </div>
            
            <div className="border-t border-lab-border-subtle">
              {showCreateForm ? (
                <form onSubmit={handleCreateProject} className="p-2">
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="输入项目名称..."
                    className="w-full px-2 py-1 text-sm border border-lab-border rounded-lab bg-lab-overlay text-lab-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-lab-accent focus-visible:ring-offset-2 focus-visible:ring-offset-lab-overlay"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      className="flex-1 px-2 py-1 text-sm lab-btn-primary rounded-lab"
                    >
                      创建
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false)
                        setNewProjectName('')
                      }}
                      className="flex-1 px-2 py-1 text-sm text-lab-muted hover:bg-lab-raised rounded-lab"
                    >
                      取消
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full px-3 py-2 text-sm text-lab-muted hover:bg-lab-raised flex items-center gap-2"
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
          backgroundColor: isSet ? 'var(--color-accent-dim)' : 'var(--color-bg-base)',
          border: isSet ? '1px solid var(--color-border-subtle)' : '1px dashed var(--color-border-default)',
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-lab-accent-warm font-semibold uppercase tracking-wider">
              核心定位
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              onClick={handleToggle}
              className="text-xs text-lab-faint hover:text-lab-muted transition-colors cursor-pointer"
            >
              {isExpanded ? '收起' : '查看'}
            </span>
            <span className="text-xs text-lab-faint">编辑</span>
          </div>
        </div>
        <p className="text-[10px] text-lab-muted leading-relaxed" style={{ lineHeight: '1.4' }}>
          {displaySlogan}
        </p>
      </div>
      
      {isExpanded && (
        <div className="mt-2 px-3">
          {constitutionFields.map(({ key, label }) => (
            <div key={key} className="mb-1.5">
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-lab-faint uppercase tracking-wider">
                  {label}
                </span>
              </div>
              <p className="text-[9px] text-lab-muted leading-relaxed mt-0.5" style={{ lineHeight: '1.3' }}>
                {fields[key] || <span className="text-lab-faint italic">未设置</span>}
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
              ? 'bg-lab-accent-dim text-lab-accent-warm'
              : 'hover:bg-lab-raised text-lab-ink'
          }`}
          title={node.name}
        >
          <span className="text-base leading-none text-lab-muted">•</span>
        </button>
      </div>
    )
  }

  return (
    <div className="select-none">
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lab transition-colors duration-[150ms] ease-lab ${
          isSelected
            ? 'bg-lab-accent-dim text-lab-accent-warm'
            : 'hover:bg-lab-raised text-lab-ink'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {!isDocument && <Chevron expanded={isExpanded} />}
        {isDocument && <span className="w-2" />}
        {isDocument ? (
          <span className="flex-shrink-0">
            <CategoryDot categoryType={node.parentId} />
          </span>
        ) : null}

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
            className="flex items-center gap-2 px-2 py-1.5 text-xs text-lab-ink hover:bg-lab-accent-dim hover:text-lab-accent-warm rounded-lab transition-colors border border-transparent hover:border-lab-border w-full justify-start"
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
    <div className="sticky bottom-0 bg-lab-overlay border-t border-lab-border-subtle p-3">
      <button
        type="button"
        onClick={() => setShowTemplates(!showTemplates)}
        className="w-full py-2.5 lab-btn-primary text-sm flex items-center justify-center gap-2"
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
            <div className="mt-3 bg-lab-overlay border border-lab-border rounded-lab shadow-elevated">
              <div className="flex items-center justify-between px-3 py-2 border-b border-lab-border-subtle">
                <span className="text-sm font-semibold text-lab-ink">选择模板</span>
                <button
                  type="button"
                  onClick={() => setShowTemplates(false)}
                  className="text-lab-faint hover:text-lab-muted"
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

/**
 * 左侧导航：语义分区参考 shadcn Sidebar（Header / 可滚动 Content / Footer），
 * 状态仍在 LabContext，不引入全页 SidebarProvider。
 */
export default function Sidebar() {
  const { activeDocId, currentProject, sidebarCollapsed, setSidebarCollapsed } = useLab()

  return (
    <div className="relative flex h-full min-h-0 flex-col border-r border-lab-border-subtle bg-lab-sidebar">
      {/* Header */}
      {!sidebarCollapsed && (
        <header className="flex shrink-0 items-start justify-between gap-2 border-b border-lab-border-subtle p-4">
          <div>
            <h2 className="mb-1 font-display text-lg font-semibold text-lab-ink">思维实验室</h2>
            <p className="text-xs text-lab-muted">管理你的项目和文档</p>
          </div>
          <button
            type="button"
            onClick={() => setSidebarCollapsed(true)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lab text-lab-faint transition-colors hover:bg-lab-accent-dim hover:text-lab-muted"
            title="收起侧边栏"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>
      )}

      {sidebarCollapsed && (
        <button
          type="button"
          onClick={() => setSidebarCollapsed(false)}
          className="flex h-8 w-full shrink-0 items-center justify-center border-b border-lab-border-subtle text-lab-faint hover:bg-lab-accent-dim hover:text-lab-muted"
          title="展开侧边栏"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}

      {!sidebarCollapsed ? (
        <div className="px-4 pt-4">
          <ProjectSelector />
        </div>
      ) : (
        <div className="p-2">
          <button
            type="button"
            className="flex h-8 w-full items-center justify-center text-xs font-semibold text-lab-muted"
            title={currentProject?.name || '选择项目'}
          >
            {(currentProject?.name || '项').slice(0, 1)}
          </button>
        </div>
      )}

      {!sidebarCollapsed && (
        <div className="px-4 pt-2">
          <ConstitutionAnchor />
        </div>
      )}

      {/* Content（可滚动） */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden px-2 py-2">
        {currentProject?.children?.map((category, catIndex) => (
          <TreeNode
            key={category?.id != null && String(category.id) !== '' ? String(category.id) : `root-cat-${catIndex}`}
            node={category}
            selectedDocId={activeDocId}
            collapsed={sidebarCollapsed}
          />
        ))}
        {!currentProject?.children?.length && !sidebarCollapsed && (
          <div className="py-8 text-center text-sm text-lab-muted">暂无分类</div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto shrink-0 border-t border-lab-border-subtle bg-lab-overlay">
        {sidebarCollapsed ? (
          <div className="p-2">
            <button
              type="button"
              className="flex h-8 w-full items-center justify-center rounded-lab text-lg transition-colors hover:bg-lab-raised"
              title="新建文档"
            >
              +
            </button>
          </div>
        ) : (
          <NewDocumentButton />
        )}
      </footer>

      {/* Rail：右缘点击收起/展开（仅借鉴交互，不占全页布局） */}
      <button
        type="button"
        aria-label="切换侧边栏宽度"
        title="切换侧边栏"
        onClick={() => setSidebarCollapsed((c) => !c)}
        className="absolute inset-y-3 right-0 z-10 hidden w-2 rounded-l-md hover:bg-lab-accent-dim/50 md:block"
      />
    </div>
  )
}
