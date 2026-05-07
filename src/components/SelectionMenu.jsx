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
        className="bg-white rounded-xl p-4 shadow-xl w-80" 
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-gray-800 mb-3">选择目标字段</h3>
        <p className="text-xs text-gray-500 mb-4">文档: {doc.name}</p>
        <div className="space-y-1">
          {templateFields.map(field => (
            <button
              key={field.key}
              onClick={() => onSelectField(field.key)}
              className="w-full px-3 py-2 rounded-lg text-sm text-left hover:bg-gray-50 transition-colors"
            >
              {field.label}
            </button>
          ))}
        </div>
        <button
          onClick={onCancel}
          className="w-full mt-4 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors"
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

export default function SelectionMenu({ text, position, onClose }) {
  const { projectTree, activeProjectId, setActiveDocId, appendContentToDocument, highlightNodeAfterRender } = useLab()
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [showFieldSelector, setShowFieldSelector] = useState(false)
  const [targetDoc, setTargetDoc] = useState(null)
  const [usePolish, setUsePolish] = useState(false)
  const menuRef = useRef(null)
  
  const documents = findAllDocuments(projectTree)
  const activeProject = projectTree.find(p => p.id === activeProjectId)
  
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
    appendContentToDocument(docId, text, fieldKey, usePolish)
    
    highlightNodeAfterRender(docId, () => {
      setActiveDocId(docId)
    })
    
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
        className="fixed z-50 bg-white rounded-lg shadow-md p-3 min-w-[280px]"
        style={{
          left: Math.min(position.x, window.innerWidth - 300),
          top: Math.min(position.y, window.innerHeight - 350),
          borderRadius: '9px'
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500">
            已选择 <span className="font-semibold text-gray-700">{text.length}</span> 字
          </span>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
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
              className="w-full px-3 py-2 text-sm bg-gray-50 rounded-lg border-none outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer appearance-none"
            >
              <option value="">选择目标项目</option>
              {projectTree.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown />
            </div>
          </div>
          
          <div className="relative">
            <select
              value={selectedDoc?.id || ''}
              onChange={(e) => setSelectedDoc(documents.find(d => d.id === e.target.value))}
              disabled={!selectedProject}
              className="w-full px-3 py-2 text-sm bg-gray-50 rounded-lg border-none outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer appearance-none disabled:opacity-50"
            >
              <option value="">选择目标文档</option>
              {projectDocs.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} ({doc.docType === 'blank' ? '空白' : doc.docType})
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown />
            </div>
          </div>
          
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={usePolish}
              onChange={(e) => setUsePolish(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="flex items-center gap-1">
              <Sparkles className="text-yellow-500" />
              智能润色后归档
            </span>
          </label>
          
          <button
            onClick={handleArchive}
            disabled={!selectedDoc}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: selectedDoc ? '#8B5CF6' : '#E5E7EB',
              color: selectedDoc ? 'white' : '#9CA3AF'
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