import { useState, useEffect, useRef } from 'react'
import { useLab } from '../context/LabContext'
import { getTemplateFields } from '../config/templates'

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function Sparkles() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  )
}

function ArchiveIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M20 9v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9" />
      <path d="M16 3.13V5a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V3.13" />
    </svg>
  )
}

function FieldSelector({ doc, onSelectField, onCancel }) {
  const templateFields = getTemplateFields(doc.docType) || []
  
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onCancel}>
      <div
        className="bg-lab-overlay rounded-xl p-4 shadow-elevated border border-lab-border-subtle w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold font-display text-lab-ink mb-3">选择目标字段</h3>
        <p className="text-xs text-lab-muted mb-4">文档: {doc.name}</p>
        <div className="space-y-1">
          {templateFields.map(field => (
            <button
              key={field.key}
              type="button"
              onClick={() => onSelectField(field.key)}
              className="w-full px-3 py-2 rounded-lg text-sm text-left text-lab-ink hover:bg-lab-accent-dim transition-colors"
            >
              {field.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="w-full mt-4 px-3 py-2 rounded-lg text-sm text-lab-muted hover:bg-lab-raised transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  )
}

function findAllDocuments(projectTree) {
  const docs = []
  function walk(nodes) {
    for (const node of nodes) {
      if (node.type === 'document') {
        docs.push(node)
      }
      if (node.children) walk(node.children)
    }
  }
  walk(projectTree)
  return docs
}

function recommendDocument(text, documents) {
  const keywords = {
    persona: ['用户', '画像', '客户', '人群', '痛点', '需求', '价值'],
    canvas: ['商业', '画布', '模式', '收入', '成本', '渠道'],
    prd: ['功能', '需求', '逻辑', '规格', '设计', '流程'],
    decision: ['决策', '决定', '选择', '方案', '结论']
  }
  
  let bestMatch = null
  let bestScore = 0
  
  for (const doc of documents) {
    const docType = doc.docType || doc.typeKey || 'blank'
    const typeKeywords = keywords[docType] || []
    let score = 0
    
    for (const keyword of typeKeywords) {
      if (text.includes(keyword)) {
        score++
      }
    }
    
    if (score > bestScore) {
      bestScore = score
      bestMatch = doc
    }
  }
  
  return bestMatch
}

// 六模块分类定义（与项目树 categoryType 对齐）
const QUICK_CATEGORIES = [
  { value: 'constitution', label: '01 项目宪法', icon: '🔒', color: '#C96442' },
  { value: 'market', label: '02 市场与用户洞察', icon: '👤', color: '#6A9BCC' },
  { value: 'strategy', label: '03 策略与增长', icon: '🚀', color: '#D97757' },
  { value: 'decision', label: '04 决策链图谱', icon: '⚖️', color: '#788C5D' },
  { value: 'antifragile', label: '05 反脆弱审计', icon: '💀', color: '#C0453A' },
  { value: 'roadmap', label: '06 执行路线图', icon: '🚩', color: '#6B6860' },
]

function classifyByKeywords(text) {
  const keywordRules = [
    { keywords: ['必须', '只能', '绝不', '禁止', '不得'], category: 'constitution', label: '硬性约束' },
    { keywords: ['决定', '拍板', '定了', '确定', '决议'], category: 'decision', label: '已做决策' },
    { keywords: ['放弃', '砍掉', '排除', '否决', '取消'], category: 'decision', label: '否决墓地' },
    { keywords: ['用户', '客户', '人群', '画像'], category: 'market', label: '用户洞察' },
    { keywords: ['灵感', '也许', '可能', '想法', '创意'], category: 'market', label: '创意灵感' },
    { keywords: ['功能', '规格', '技术', '设计', 'PRD'], category: 'strategy', label: '产品策略' }
  ]
  
  for (const rule of keywordRules) {
    for (const keyword of rule.keywords) {
      if (text.includes(keyword)) {
        return rule
      }
    }
  }
  
  return null
}

export default function SelectionMenu({ text, position, onClose }) {
  const { projectTree, activeProjectId, setActiveDocId, appendContentToDocument, highlightNodeAfterRender, currentSessionId, addDocumentToCategory } = useLab()
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [showFieldSelector, setShowFieldSelector] = useState(false)
  const [targetDoc, setTargetDoc] = useState(null)
  const [usePolish, setUsePolish] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showQuickArchive, setShowQuickArchive] = useState(false)
  const menuRef = useRef(null)
  
  const documents = findAllDocuments(projectTree)
  const activeProject = projectTree.find(p => p.id === activeProjectId)
  const autoClassification = classifyByKeywords(text)
  
  useEffect(() => {
    const recommended = recommendDocument(text, documents)
    if (recommended) {
      setSelectedDoc(recommended)
      const project = projectTree.find(p => 
        p.children?.some(c => c.children?.some(d => d.id === recommended.id))
      )
      if (project) {
        setSelectedProject(project)
      }
    } else if (activeProject) {
      setSelectedProject(activeProject)
    }
    
    if (autoClassification) {
      setSelectedCategory(autoClassification.category)
    }
    
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose()
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleArchive = async () => {
    if (!selectedDoc) return
    
    const templateFields = getTemplateFields(selectedDoc.docType)
    
    if (templateFields && templateFields.length > 0 && selectedDoc.docType !== 'blank') {
      setTargetDoc(selectedDoc)
      setShowFieldSelector(true)
    } else {
      await performArchive(selectedDoc.id, null)
    }
  }
  
  const handleFieldSelect = async (fieldKey) => {
    if (!targetDoc) return
    await performArchive(targetDoc.id, fieldKey)
    setShowFieldSelector(false)
    setTargetDoc(null)
  }
  
  const performArchive = async (docId, fieldKey) => {
    const source = {
      projectId: activeProjectId,
      sessionId: currentSessionId,
      messageId: `msg_${Date.now()}`,
      timestamp: new Date().toLocaleString('zh-CN')
    }
    
    await appendContentToDocument(docId, text, fieldKey, usePolish, source)
    
    highlightNodeAfterRender(docId, () => {
      setActiveDocId(docId)
    })
    
    onClose()
  }
  
  const handleQuickArchive = async () => {
    if (!selectedProject || !selectedCategory) return
    
    const newDoc = {
      name: text.slice(0, 30) + (text.length > 30 ? '...' : ''),
      content: text,
      docType: 'blank',
      fields: {}
    }
    
    const result = await addDocumentToCategory(activeProjectId, selectedCategory, newDoc)
    
    if (result.newDocId) {
      highlightNodeAfterRender(result.newDocId, () => {
        setActiveDocId(result.newDocId)
      })
    }
    
    onClose()
  }
  
  const handleProjectChange = (project) => {
    setSelectedProject(project)
    setSelectedDoc(null)
  }
  
  const projectDocs = selectedProject 
    ? documents.filter(doc => {
        const findInProject = (nodes) => {
          for (const node of nodes) {
            if (node.id === doc.id) return true
            if (node.children && findInProject(node.children)) return true
          }
          return false
        }
        return findInProject([selectedProject])
      })
    : []
  
  return (
    <>
      <div
        ref={menuRef}
        className="fixed z-50 bg-lab-overlay border border-lab-border-subtle rounded-lg shadow-card p-3 min-w-[280px]"
        style={{
          left: Math.min(position.x, window.innerWidth - 300),
          top: Math.min(position.y, window.innerHeight - 350),
          borderRadius: '9px'
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-lab-muted">
            已选择 <span className="font-semibold text-lab-ink">{text.length}</span> 字
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center rounded text-lab-muted hover:bg-lab-accent-dim hover:text-lab-accent-warm transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-2">
          <div className="relative">
            <select
              value={selectedProject?.id || ''}
              onChange={(e) => handleProjectChange(projectTree.find(p => p.id === e.target.value))}
              className="w-full px-3 py-2 text-sm bg-lab-raised rounded-lg border border-lab-border-subtle outline-none focus-visible:ring-2 focus-visible:ring-lab-accent cursor-pointer appearance-none text-lab-ink"
            >
              <option value="">选择目标项目</option>
              {projectTree.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-lab-muted">
              <ChevronDown />
            </div>
          </div>
          
          <div className="relative">
            <select
              value={selectedDoc?.id || ''}
              onChange={(e) => setSelectedDoc(documents.find(d => d.id === e.target.value))}
              disabled={!selectedProject}
              className="w-full px-3 py-2 text-sm bg-lab-raised rounded-lg border border-lab-border-subtle outline-none focus-visible:ring-2 focus-visible:ring-lab-accent cursor-pointer appearance-none disabled:opacity-50 text-lab-ink"
            >
              <option value="">选择目标文档</option>
              {projectDocs.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} ({doc.docType === 'blank' ? '空白' : doc.docType})
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-lab-muted">
              <ChevronDown />
            </div>
          </div>
          
          <label className="flex items-center gap-2 text-xs text-lab-muted cursor-pointer">
            <input
              type="checkbox"
              checked={usePolish}
              onChange={(e) => setUsePolish(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-lab-border text-lab-accent accent-[var(--color-brand-blue)] focus-visible:ring-2 focus-visible:ring-lab-accent"
            />
            <span className="flex items-center gap-1">
              <Sparkles className="text-lab-warning" />
              智能润色后归档
            </span>
          </label>
          
          {autoClassification && (
            <div className="text-xs text-lab-success bg-[var(--color-success-dim)] px-2 py-1.5 rounded-lg flex items-center gap-1 border border-lab-border-subtle">
              <Sparkles className="text-lab-success" />
              自动识别: {autoClassification.label}
            </div>
          )}
          
          <button
            onClick={() => setShowQuickArchive(!showQuickArchive)}
            type="button"
            className="w-full text-left px-3 py-2 text-xs text-lab-muted hover:bg-lab-accent-dim rounded-lg transition-colors flex items-center justify-between"
          >
            <span>快速归档到分类</span>
            <ChevronDown className={`transition-transform ${showQuickArchive ? 'rotate-180' : ''}`} />
          </button>
          
          {showQuickArchive && (
            <div className="space-y-1.5 pl-2">
              <div className="relative">
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-lab-raised rounded-lg border border-lab-border-subtle outline-none focus-visible:ring-2 focus-visible:ring-lab-accent cursor-pointer appearance-none text-lab-ink"
                >
                  <option value="">选择分类</option>
                  {QUICK_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-lab-muted">
                  <ChevronDown />
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickArchive}
                disabled={!selectedCategory || !selectedProject}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: selectedCategory && selectedProject ? 'var(--color-success)' : 'var(--color-border-default)',
                  color: selectedCategory && selectedProject ? 'var(--color-text-inverted)' : 'var(--color-text-muted)',
                }}
              >
                <ArchiveIcon />
                创建新文档
              </button>
            </div>
          )}
          
          <button
            type="button"
            onClick={handleArchive}
            disabled={!selectedDoc}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: selectedDoc ? 'var(--color-brand-blue)' : 'var(--color-border-default)',
              color: selectedDoc ? 'var(--color-text-inverted)' : 'var(--color-text-muted)',
            }}
          >
            <ArchiveIcon />
            归档到文档
          </button>
        </div>
      </div>
      
      {showFieldSelector && targetDoc && (
        <FieldSelector
          doc={targetDoc}
          onSelectField={handleFieldSelect}
          onCancel={() => {
            setShowFieldSelector(false)
            setTargetDoc(null)
          }}
        />
      )}
    </>
  )
}