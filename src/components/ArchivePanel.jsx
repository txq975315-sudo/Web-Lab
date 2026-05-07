import { useLab } from '../context/LabContext'
import { useState, useEffect, useRef } from 'react'
import { renderContentWithLinks, insertWikiLink, collectAllDocNames, buildDocMap } from '../utils/linkParser'
import { TEMPLATE_TYPES, getTemplateLabel, getTemplateIcon, createDefaultFields, getForcedCategory } from '../config/templates'
import DocumentForm from './DocumentForm'
import DocumentRenderer from './DocumentRenderer'

function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="rgba(107, 114, 128, 0.3)" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#6B7280" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function EmptyState({ onCreateNew }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-4">
        <rect x="6" y="14" width="36" height="28" rx="3" stroke="#D1D5DB" strokeWidth="1.5" />
        <path d="M6 22L24 32L42 22" stroke="#D1D5DB" strokeWidth="1.5" />
        <path d="M18 14V8C18 7.44772 18.4477 7 19 7H29C29.5523 7 30 7.44772 30 8V14" stroke="#D1D5DB" strokeWidth="1.5" />
        <line x1="24" y1="26" x2="24" y2="34" stroke="#D1D5DB" strokeWidth="1.5" />
      </svg>
      <p className="text-sm text-gray-400">暂无文档</p>
      <p className="text-xs mt-1 text-gray-300">在左侧导航中选择或创建文档</p>
      {onCreateNew && (
        <button
          onClick={onCreateNew}
          className="mt-4 text-xs px-4 py-2 rounded-lg font-medium text-white transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: '#8B5CF6' }}
        >
          + 新建文档
        </button>
      )}
    </div>
  )
}

function LinkSuggestPopover({ show, position, suggestions, onSelect, highlightedIndex }) {
  if (!show || suggestions.length === 0) return null

  return (
    <div
      className="fixed z-50 rounded-lg shadow-lg py-1 overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        minWidth: '200px',
        maxHeight: '200px',
        overflowY: 'auto'
      }}
    >
      {suggestions.map((doc, idx) => (
        <div
          key={doc.id}
          onClick={() => onSelect(doc)}
          className="px-3 py-1.5 text-xs cursor-pointer flex items-center gap-2"
          style={{
            backgroundColor: idx === highlightedIndex ? '#F3F4F6' : 'transparent'
          }}
          onMouseEnter={(e) => {
            if (idx !== highlightedIndex) e.currentTarget.style.backgroundColor = '#F9FAFB'
          }}
          onMouseLeave={(e) => {
            if (idx !== highlightedIndex) e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <span className="text-gray-400 flex-shrink-0">📄</span>
          <span className="text-gray-700 truncate">{doc.name}</span>
        </div>
      ))}
    </div>
  )
}

function WikiLink({ title, id, exists, onLinkClick }) {
  const handleClick = (e) => {
    e.preventDefault()
    if (exists && id && onLinkClick) {
      onLinkClick(id)
    } else if (!exists) {
      const create = window.confirm(`文档「${title}」不存在，是否创建？`)
      if (create && onLinkClick) {
        onLinkClick(null, title)
      }
    }
  }

  return (
    <span
      onClick={handleClick}
      className="cursor-pointer underline underline-offset-2"
      style={{
        color: exists ? '#3B82F6' : '#EF4444',
        textDecorationColor: exists ? 'rgba(59, 130, 246, 0.4)' : 'rgba(239, 68, 68, 0.4)'
      }}
      title={exists ? `跳转到「${title}」` : `「${title}」不存在，点击创建`}
    >
      {title}
    </span>
  )
}

function RelatedDocuments({ doc, allDocsMap, onLinkClick }) {
  const [expanded, setExpanded] = useState(false)
  const hasBacklinks = doc.backlinks && doc.backlinks.length > 0
  const hasReferences = doc.references && doc.references.length > 0

  if (!hasBacklinks && !hasReferences) return null

  return (
    <div className="mt-4 pt-3 border-t border-gray-100">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <path d="M3.5 2L6.5 5L3.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        关联文档
        <span className="text-gray-300">
          ({[...(doc.backlinks || []), ...(doc.references || [])].length})
        </span>
      </button>

      {expanded && (
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-gray-400 mb-1.5">← 被引用</p>
            {hasBacklinks ? (
              <div className="space-y-1">
                {doc.backlinks.map(blId => {
                  const blDoc = allDocsMap[blId]
                  return (
                    <div
                      key={blId}
                      onClick={() => blDoc && onLinkClick && onLinkClick(blId)}
                      className="text-xs text-blue-600 cursor-pointer hover:underline truncate"
                    >
                      {blDoc ? blDoc.name : blId}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-300">暂无</p>
            )}
          </div>
          <div>
            <p className="text-[10px] text-gray-400 mb-1.5">→ 引用</p>
            {hasReferences ? (
              <div className="space-y-1">
                {doc.references.map(refId => {
                  const refDoc = allDocsMap[refId]
                  return (
                    <div
                      key={refId}
                      onClick={() => refDoc && onLinkClick && onLinkClick(refId)}
                      className="text-xs text-blue-600 cursor-pointer hover:underline truncate"
                    >
                      {refDoc ? refDoc.name : refId}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-300">暂无</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function renderContentWithAnchorsAndLinks(content, outline, allDocsMap, onLinkClick) {
  if (!content) return null

  const linkParts = renderContentWithLinks(content, allDocsMap, onLinkClick)
  if (!linkParts || linkParts.length === 0) {
    return <div className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">{content}</div>
  }

  const headingMap = {}
  if (outline) {
    for (const h of outline) {
      headingMap[h.text] = h.id
    }
  }

  const fullText = linkParts.map(p => p.type === 'text' ? p.value : p.raw).join('')
  const lines = fullText.split('\n')
  const lineElements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    const h2Match = line.match(/^##\s+(.+)/)
    if (h2Match) {
      const text = h2Match[1].trim()
      const id = headingMap[text]
      lineElements.push(
        <h3
          key={`h2-${i}`}
          id={id ? `heading-${id}` : undefined}
          className="text-sm font-semibold text-gray-800 mt-6 mb-2 pb-1 border-b border-gray-100 scroll-mt-4"
        >
          {text}
        </h3>
      )
      i++
      continue
    }

    const h3Match = line.match(/^###\s+(.+)/)
    if (h3Match) {
      const text = h3Match[1].trim()
      const id = headingMap[text]
      lineElements.push(
        <h4
          key={`h3-${i}`}
          id={id ? `heading-${id}` : undefined}
          className="text-xs font-semibold text-gray-700 mt-4 mb-1 scroll-mt-4"
        >
          {text}
        </h4>
      )
      i++
      continue
    }

    if (line.trim() === '') {
      lineElements.push(<div key={`br-${i}`} className="h-2" />)
      i++
      continue
    }

    if (line.startsWith('- ')) {
      lineElements.push(
        <li key={`li-${i}`} className="text-sm text-gray-600 ml-4 leading-relaxed">
          {line.replace(/^-\s*/, '')}
        </li>
      )
      i++
      continue
    }

    if (line.startsWith('- [ ]')) {
      lineElements.push(
        <li key={`li-${i}`} className="text-sm text-gray-500 ml-4 leading-relaxed flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded border border-gray-300 flex-shrink-0" />
          {line.replace(/^-\s*\[ \]\s*/, '')}
        </li>
      )
      i++
      continue
    }

    lineElements.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed text-gray-600">
        {line}
      </p>
    )
    i++
  }

  return <div>{lineElements}</div>
}

function TemplateSelector({ onSelect, onClose, activeProject }) {
  const templates = Object.values(TEMPLATE_TYPES)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  
  const categories = activeProject?.children?.filter(c => c.type === 'category') || []
  
  const forcedCategory = selectedTemplate ? getForcedCategory(selectedTemplate) : null
  
  const categoryLabels = {
    'cat-insight': 'Insight',
    'cat-archive': 'Archive',
    'cat-decision': 'Decision'
  }

  const handleSelect = () => {
    const targetCategory = forcedCategory || selectedCategory
    onSelect(selectedTemplate, targetCategory)
  }

  if (!selectedTemplate) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} onClick={onClose}>
        <div
          className="rounded-2xl p-6 w-[380px] max-h-[500px] overflow-auto"
          style={{ backgroundColor: '#FFFFFF', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-sm font-semibold text-gray-800 mb-1">选择文档模板</h3>
          <p className="text-xs text-gray-400 mb-4">选择模板后将使用结构化表单编辑</p>

          <div className="space-y-2">
            {templates.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-95"
                style={{
                  backgroundColor: '#FAFAFA',
                  border: '1px solid #F3F4F6'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F3FF'; e.currentTarget.style.borderColor = '#DDD6FE' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FAFAFA'; e.currentTarget.style.borderColor = '#F3F4F6' }}
              >
                <span className="text-lg flex-shrink-0">{tpl.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">{tpl.label}</p>
                  <p className="text-[10px] text-gray-400">{tpl.category}</p>
                </div>
                {tpl.id !== 'blank' && (
                  <span className="text-[10px] text-purple-400 flex-shrink-0">结构化</span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 text-xs py-2 rounded-lg font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} onClick={onClose}>
      <div
        className="rounded-2xl p-6 w-[380px]"
        style={{ backgroundColor: '#FFFFFF', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setSelectedTemplate(null)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <h3 className="text-sm font-semibold text-gray-800">选择分类</h3>
        </div>
        
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl" style={{ backgroundColor: '#FAFAFA', border: '1px solid #F3F4F6' }}>
          <span className="text-xl">{getTemplateIcon(selectedTemplate)}</span>
          <span className="text-sm font-medium text-gray-800">{getTemplateLabel(selectedTemplate)}</span>
        </div>

        {forcedCategory ? (
          <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}>
            <p className="text-xs text-gray-700">
              <span className="font-medium">该模板将自动归档到 </span>
              <span className="font-semibold">{categoryLabels[forcedCategory] || forcedCategory}</span>
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">选择归档位置</p>
            <div className="space-y-2 mb-4">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor: selectedCategory === cat.id ? '#F5F3FF' : '#FAFAFA',
                    border: selectedCategory === cat.id ? '1px solid #DDD6FE' : '1px solid #F3F4F6'
                  }}
                >
                  <span className="text-lg">
                    {cat.categoryType === 'decision' ? '✅' : '📁'}
                  </span>
                  <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSelect}
            disabled={!forcedCategory && !selectedCategory}
            className="flex-1 py-2 rounded-xl text-sm font-medium text-white transition-colors"
            style={{
              backgroundColor: forcedCategory || selectedCategory ? '#8B5CF6' : '#D1D5DB',
              cursor: forcedCategory || selectedCategory ? 'pointer' : 'not-allowed'
            }}
          >
            创建
          </button>
        </div>
      </div>
    </div>
  )
}

function DocumentSection({ doc }) {
  const { standardizeContent, updateDocument, navigateToDoc, projectTree, addDocument, toggleDecisionStatus } = useLab()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(doc.content || '')
  const [showLinkSuggest, setShowLinkSuggest] = useState(false)
  const [linkSuggestPos, setLinkSuggestPos] = useState({ x: 0, y: 0 })
  const [linkSearchText, setLinkSearchText] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const textareaRef = useRef(null)

  const templateType = doc.docType || doc.typeKey || 'blank'
  const isTemplateDoc = templateType !== 'blank' && templateType !== 'document' && templateType !== 'research' && templateType !== 'framework' && templateType !== 'analysis' && templateType !== 'report'
  const isDecisionDoc = templateType === 'decision'

  const allDocsMap = buildDocMap(projectTree)
  const allDocNames = collectAllDocNames(projectTree)

  const statusConfig = {
    exploring: { label: '探索中', bg: '#FEF3C7', text: '#D97706', border: '#FCD34D', dot: '#FBBF24' },
    locked: { label: '已确定', bg: '#D1FAE5', text: '#059669', border: '#A7F3D0', dot: '#10B981' },
    rejected: { label: '已否决', bg: '#FEE2E2', text: '#DC2626', border: '#FECACA', dot: '#F87171' }
  }

  const handleStatusToggle = () => {
    toggleDecisionStatus(doc.id)
  }

  const handleStandardize = async () => {
    if (loading || doc.standardized) return
    setLoading(true)
    try {
      const standardizedContent = await standardizeContent(doc.content, doc.typeKey || 'document')
      updateDocument(doc.id, { content: standardizedContent, standardized: true })
    } catch (error) {
      console.error('标准化失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartEdit = () => {
    if (isTemplateDoc) {
      setEditing(true)
    } else {
      setEditContent(doc.content || '')
      setEditing(true)
    }
  }

  const handleSaveEdit = () => {
    updateDocument(doc.id, { content: editContent })
    setEditing(false)
    setShowLinkSuggest(false)
  }

  const handleCancelEdit = () => {
    setEditContent(doc.content || '')
    setEditing(false)
    setShowLinkSuggest(false)
  }

  const handleFormSave = (data) => {
    updateDocument(doc.id, {
      name: data.name,
      content: data.content || '',
      fields: data.fields || {},
      docType: data.docType || templateType
    })
    setEditing(false)
  }

  const handleFormCancel = () => {
    setEditing(false)
  }

  const handleConvertToTemplate = (newType) => {
    const existingContent = doc.content || ''
    const defaultFields = createDefaultFields(newType)
    if (existingContent && Object.keys(defaultFields).length > 0) {
      const firstKey = Object.keys(defaultFields)[0]
      defaultFields[firstKey] = existingContent
    }
    updateDocument(doc.id, {
      docType: newType,
      fields: defaultFields,
      content: ''
    })
    setShowTemplateSelector(false)
    setEditing(true)
  }

  const handleTextareaChange = (e) => {
    const value = e.target.value
    setEditContent(value)

    const cursorPos = e.target.selectionStart
    const textBeforeCursor = value.slice(0, cursorPos)

    const bracketMatch = textBeforeCursor.match(/\[\[([^\]|]*)$/)
    if (bracketMatch) {
      const searchText = bracketMatch[1].toLowerCase()
      setLinkSearchText(searchText)

      const filtered = allDocNames.filter(d =>
        d.id !== doc.id && d.name.toLowerCase().includes(searchText)
      ).slice(0, 8)

      if (filtered.length > 0) {
        const rect = textareaRef.current?.getBoundingClientRect()
        if (rect) {
          setLinkSuggestPos({ x: rect.left + 20, y: rect.bottom - 40 })
        }
        setShowLinkSuggest(true)
        setHighlightedIndex(0)
      } else {
        setShowLinkSuggest(false)
      }
    } else {
      setShowLinkSuggest(false)
    }
  }

  const handleTextareaKeyDown = (e) => {
    if (!showLinkSuggest) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(prev =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredSuggestions[highlightedIndex]) {
        handleLinkSelect(filteredSuggestions[highlightedIndex])
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setShowLinkSuggest(false)
    }
  }

  const handleLinkSelect = (selectedDoc) => {
    const cursorPos = textareaRef.current?.selectionStart || 0
    const result = insertWikiLink(editContent, cursorPos, selectedDoc.name, selectedDoc.id)
    setEditContent(result.content)
    setShowLinkSuggest(false)

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(result.cursorOffset, result.cursorOffset)
      }
    }, 0)
  }

  const handleLinkClick = (docId, titleToCreate) => {
    if (docId) {
      navigateToDoc(docId)
    } else if (titleToCreate) {
      const newDocId = addDocument('cat-insight', {
        name: titleToCreate,
        docType: 'blank',
        typeKey: 'document',
        fields: {},
        content: ''
      })
      setTimeout(() => navigateToDoc(newDocId), 200)
    }
  }

  const filteredSuggestions = allDocNames.filter(d =>
    d.id !== doc.id && d.name.toLowerCase().includes(linkSearchText.toLowerCase())
  ).slice(0, 8)

  const displayTypeLabel = isTemplateDoc ? getTemplateLabel(templateType) : (doc.type || '文档')

  return (
    <section
      id={`section-${doc.id}`}
      className="mb-8 scroll-mt-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-800">{doc.name}</h3>
          {doc.standardized && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.12)',
                color: '#16a34a',
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}
            >
              Standardized
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
            style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
          >
            {isTemplateDoc && <span>{getTemplateIcon(templateType)}</span>}
            {displayTypeLabel}
          </span>
          {isDecisionDoc && (
            <span
              onClick={handleStatusToggle}
              className="text-[10px] px-2 py-0.5 rounded-full font-medium cursor-pointer flex items-center gap-1 transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: statusConfig[doc.status]?.bg || '#F3F4F6',
                color: statusConfig[doc.status]?.text || '#6B7280',
                border: `1px solid ${statusConfig[doc.status]?.border || '#E5E7EB'}`
              }}
              title="点击切换状态"
            >
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: statusConfig[doc.status]?.dot || '#D1D5DB'
              }} />
              {statusConfig[doc.status]?.label || '未知'}
            </span>
          )}
          {!editing && (
            <button
              onClick={handleStartEdit}
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-all hover:scale-110 active:scale-95"
              style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}
              title="编辑"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" stroke="#6B7280" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          {!isTemplateDoc && (
            <>
              <button
                onClick={handleStandardize}
                disabled={loading || doc.standardized}
                className="flex items-center justify-center w-7 h-7 rounded-lg transition-all hover:scale-110 active:scale-95"
                style={{
                  backgroundColor: doc.standardized ? '#F3F4F6' : '#F9FAFB',
                  opacity: doc.standardized ? 0.5 : 1,
                  cursor: doc.standardized ? 'default' : 'pointer',
                  border: '1px solid #E5E7EB'
                }}
                title="AI 标准化"
              >
                {loading ? <Spinner /> : <span style={{ fontSize: '14px' }}>✨</span>}
              </button>
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="flex items-center justify-center w-7 h-7 rounded-lg transition-all hover:scale-110 active:scale-95"
                style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}
                title="转换为模板"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="1.5" y="1.5" width="9" height="9" rx="1.5" stroke="#8B5CF6" strokeWidth="1" />
                  <path d="M4 6H8M6 4V8" stroke="#8B5CF6" strokeWidth="1" strokeLinecap="round" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      <div
        className="p-5 rounded-xl"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #F3F4F6',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}
      >
        {editing ? (
          isTemplateDoc ? (
            <DocumentForm doc={doc} onSave={handleFormSave} onCancel={handleFormCancel} />
          ) : (
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={handleTextareaChange}
                onKeyDown={handleTextareaKeyDown}
                className="w-full min-h-[120px] text-sm leading-relaxed text-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 resize-y"
                style={{
                  backgroundColor: '#FAFAFA',
                  border: '1px solid #E5E7EB',
                  fontFamily: 'inherit'
                }}
                placeholder="输入内容... 输入 [[ 可引用其他文档"
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={handleSaveEdit}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium text-white"
                  style={{ backgroundColor: '#8B5CF6' }}
                >
                  保存
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium text-gray-500 hover:bg-gray-100"
                >
                  取消
                </button>
                <span className="text-[10px] text-gray-400 ml-auto">输入 [[ 引用其他文档</span>
              </div>
              <LinkSuggestPopover
                show={showLinkSuggest}
                position={linkSuggestPos}
                suggestions={filteredSuggestions}
                onSelect={handleLinkSelect}
                highlightedIndex={highlightedIndex}
              />
            </div>
          )
        ) : (
          <>
            {isTemplateDoc ? (
              <DocumentRenderer doc={doc} />
            ) : (
              renderContentWithAnchorsAndLinks(doc.content, doc.outline, allDocsMap, handleLinkClick)
            )}
            <RelatedDocuments doc={doc} allDocsMap={allDocsMap} onLinkClick={handleLinkClick} />
          </>
        )}
      </div>

      {showTemplateSelector && (
        <TemplateSelector
          onSelect={handleConvertToTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </section>
  )
}

export default function ArchivePanel() {
  const { activeProject, allDocuments, activeDocId, setActiveDocId, addDocument } = useLab()
  const scrollRef = useRef(null)
  const [showNewDocSelector, setShowNewDocSelector] = useState(false)

  useEffect(() => {
    if (activeDocId && scrollRef.current) {
      const el = document.getElementById(`section-${activeDocId}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        el.classList.add('highlight-pulse')
        setTimeout(() => el.classList.remove('highlight-pulse'), 2000)
      }
    }
  }, [activeDocId])

  const handleCreateDocument = (templateType, categoryId) => {
    setShowNewDocSelector(false)

    const newDocId = addDocument(categoryId, {
      name: '未命名文档',
      docType: templateType,
      typeKey: templateType,
      fields: templateType !== 'blank' ? createDefaultFields(templateType) : {},
      content: ''
    })

    setTimeout(() => {
      setActiveDocId(newDocId)
    }, 200)
  }

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: '#F9FAFB', minWidth: 0 }}
    >
      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">资产沉淀区</h2>
          <p className="text-xs text-gray-400 mt-0.5">{activeProject?.name || ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {allDocuments.length} 份文档
          </span>
          <button
            onClick={() => setShowNewDocSelector(true)}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium text-white transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#8B5CF6' }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1V9M1 5H9" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            新建文档
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto px-6 pb-8">
        {allDocuments.length === 0 ? (
          <EmptyState onCreateNew={() => setShowNewDocSelector(true)} />
        ) : (
          allDocuments.map(doc => (
            <DocumentSection key={doc.id} doc={doc} />
          ))
        )}
      </div>

      {showNewDocSelector && (
        <TemplateSelector
          onSelect={handleCreateDocument}
          onClose={() => setShowNewDocSelector(false)}
          activeProject={activeProject}
        />
      )}
    </div>
  )
}
