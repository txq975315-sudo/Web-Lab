import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useLab } from '../context/LabContext'
import { collectAllDocNames, buildDocMap } from '../utils/linkParser'
import { TEMPLATE_TYPES, createDefaultFields } from '../config/templates'

function fuzzyMatch(text, query) {
  if (!query) return { match: true, score: 0 }
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()

  if (lowerText.includes(lowerQuery)) {
    return { match: true, score: lowerText.indexOf(lowerQuery) === 0 ? 10 : 5 }
  }

  let qi = 0
  for (let ti = 0; ti < lowerText.length && qi < lowerQuery.length; ti++) {
    if (lowerText[ti] === lowerQuery[qi]) qi++
  }
  if (qi === lowerQuery.length) return { match: true, score: 1 }

  return { match: false, score: 0 }
}

function highlightMatch(text, query) {
  if (!query) return text
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const idx = lowerText.indexOf(lowerQuery)
  if (idx === -1) return text

  return (
    <>
      {text.slice(0, idx)}
      <span style={{ backgroundColor: 'var(--color-accent-dim)', color: 'var(--color-accent-warm)' }}>
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-lab-muted" aria-hidden>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function EnterIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-lab-muted" aria-hidden>
      <path d="M9 2V7.5C9 8.32843 8.32843 9 7.5 9H3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 7L3 9L5 11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ProjectIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <line x1="1" y1="5" x2="13" y2="5" stroke="currentColor" strokeWidth="1" />
      <line x1="5" y1="5" x2="5" y2="13" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function DocIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="1.5" y="1" width="9" height="10" rx="1.5" stroke="currentColor" strokeWidth="1" />
      <line x1="4" y1="4" x2="8" y2="4" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="4" y1="6" x2="8" y2="6" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
      <path d="M6 3.5V6L8 7.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

const QUICK_ACTIONS = [
  { id: 'new-blank', label: '新建空白文档', icon: '📄', prefix: 'New:', action: 'create-blank' },
  { id: 'new-persona', label: '新建用户画像', icon: '👤', prefix: 'New:', action: 'create-persona' },
  { id: 'new-canvas', label: '新建商业画布', icon: '🧩', prefix: 'New:', action: 'create-canvas' },
  { id: 'new-prd', label: '新建 PRD 规格', icon: '📋', prefix: 'New:', action: 'create-prd' },
  { id: 'new-decision', label: '新建决策记录', icon: '✅', prefix: 'New:', action: 'create-decision' }
]

export default function CommandPalette() {
  const {
    projectTree, recentDocuments, openDocument, switchProject,
    activeProjectId, addDocument, setActiveDocId
  } = useLab()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const allDocsMap = useMemo(() => buildDocMap(projectTree), [projectTree])

  const allDocsFlat = useMemo(() => {
    const docs = []
    for (const project of projectTree) {
      function walk(nodes, projName) {
        for (const node of nodes) {
          if (node.type === 'document') {
            docs.push({ ...node, projectName: projName, projectId: project.id })
          }
          if (node.children) walk(node.children, projName)
        }
      }
      walk([project], project.name)
    }
    return docs
  }, [projectTree])

  const recentDocs = useMemo(() => {
    return recentDocuments
      .map(id => allDocsFlat.find(d => d.id === id))
      .filter(Boolean)
      .slice(0, 3)
  }, [recentDocuments, allDocsFlat])

  const isProjectMode = query.startsWith('>')
  const isNewMode = query.toLowerCase().startsWith('new:')

  const searchQuery = isProjectMode
    ? query.slice(1).trim()
    : isNewMode
    ? query.slice(4).trim()
    : query.trim()

  const filteredDocs = useMemo(() => {
    if (isProjectMode || isNewMode) return []
    if (!searchQuery) return []
    return allDocsFlat
      .map(doc => {
        const titleResult = fuzzyMatch(doc.name, searchQuery)
        const contentText = doc.content || ''
        const fieldsText = doc.fields ? Object.values(doc.fields).join(' ') : ''
        const contentResult = fuzzyMatch(contentText + ' ' + fieldsText, searchQuery)
        return {
          doc,
          score: Math.max(titleResult.score * 2, contentResult.score),
          match: titleResult.match || contentResult.match
        }
      })
      .filter(r => r.match)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(r => r.doc)
  }, [allDocsFlat, searchQuery, isProjectMode, isNewMode])

  const filteredProjects = useMemo(() => {
    if (!isProjectMode) return []
    if (!searchQuery) return projectTree
    return projectTree.filter(p => fuzzyMatch(p.name, searchQuery).match)
  }, [projectTree, searchQuery, isProjectMode])

  const filteredActions = useMemo(() => {
    if (!isNewMode) return []
    if (!searchQuery) return QUICK_ACTIONS
    return QUICK_ACTIONS.filter(a => fuzzyMatch(a.label, searchQuery).match)
  }, [searchQuery, isNewMode])

  const showRecent = !searchQuery && !isProjectMode && !isNewMode && recentDocs.length > 0
  const showDocs = filteredDocs.length > 0
  const showProjects = filteredProjects.length > 0
  const showActions = filteredActions.length > 0

  const totalItems = (showRecent ? recentDocs.length : 0) +
    (showDocs ? filteredDocs.length : 0) +
    (showProjects ? filteredProjects.length : 0) +
    (showActions ? filteredActions.length : 0)

  const getSelectedItem = useCallback(() => {
    let idx = selectedIndex
    if (showRecent) {
      if (idx < recentDocs.length) return { type: 'recent', data: recentDocs[idx] }
      idx -= recentDocs.length
    }
    if (showDocs) {
      if (idx < filteredDocs.length) return { type: 'doc', data: filteredDocs[idx] }
      idx -= filteredDocs.length
    }
    if (showProjects) {
      if (idx < filteredProjects.length) return { type: 'project', data: filteredProjects[idx] }
      idx -= filteredProjects.length
    }
    if (showActions) {
      if (idx < filteredActions.length) return { type: 'action', data: filteredActions[idx] }
    }
    return null
  }, [selectedIndex, showRecent, recentDocs, showDocs, filteredDocs, showProjects, filteredProjects, showActions, filteredActions])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        const tag = document.activeElement?.tagName?.toLowerCase()
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return
        e.preventDefault()
        setOpen(prev => !prev)
        setQuery('')
        setSelectedIndex(0)
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault()
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % Math.max(totalItems, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + totalItems) % Math.max(totalItems, 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      executeSelection()
    }
  }

  const executeSelection = () => {
    const item = getSelectedItem()
    if (!item) return

    setOpen(false)
    setQuery('')

    if (item.type === 'recent' || item.type === 'doc') {
      openDocument(item.data.id)
    } else if (item.type === 'project') {
      switchProject(item.data.id)
    } else if (item.type === 'action') {
      handleQuickAction(item.data.action)
    }
  }

  const handleQuickAction = (action) => {
    const templateMap = {
      'create-blank': 'blank',
      'create-persona': 'persona',
      'create-canvas': 'canvas',
      'create-prd': 'prd',
      'create-decision': 'decision'
    }

    const templateType = templateMap[action]
    if (!templateType) return

    const categoryMap = {
      persona: 'cat-insight',
      canvas: 'cat-insight',
      prd: 'cat-archive',
      decision: 'cat-decision',
      blank: 'cat-insight'
    }

    const parentId = categoryMap[templateType] || 'cat-insight'

    const newDocId = addDocument(parentId, {
      name: '未命名文档',
      docType: templateType,
      typeKey: templateType,
      fields: templateType !== 'blank' ? createDefaultFields(templateType) : {},
      content: ''
    })

    setTimeout(() => setActiveDocId(newDocId), 200)
  }

  const handleItemClick = (type, data) => {
    setOpen(false)
    setQuery('')

    if (type === 'recent' || type === 'doc') {
      openDocument(data.id)
    } else if (type === 'project') {
      switchProject(data.id)
    } else if (type === 'action') {
      handleQuickAction(data.action)
    }
  }

  if (!open) return null

  const selectedItem = getSelectedItem()
  const footerText = selectedItem
    ? selectedItem.type === 'project' ? '↵ 切换项目' : selectedItem.type === 'action' ? '↵ 创建文档' : '↵ 打开文档'
    : '输入关键词搜索...'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      style={{ backgroundColor: 'rgba(20, 20, 19, 0.4)', backdropFilter: 'blur(4px)' }}
      onClick={() => setOpen(false)}
    >
      <div
        className="rounded-xl overflow-hidden flex flex-col bg-lab-overlay border border-lab-border-subtle shadow-elevated"
        style={{
          width: '640px',
          maxHeight: '480px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-lab-border-subtle">
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索文档、切换项目或执行命令..."
            className="flex-1 text-sm text-lab-ink bg-transparent border-none outline-none placeholder:text-lab-faint font-sans"
          />
          <span className="text-[10px] text-lab-muted flex items-center gap-1 flex-shrink-0">
            <span className="px-1.5 py-0.5 rounded bg-lab-raised text-lab-muted font-mono text-[9px] border border-lab-border-subtle">
              ESC
            </span>
            关闭
          </span>
        </div>

        <div ref={listRef} className="flex-1 overflow-auto py-2">
          {!searchQuery && !isProjectMode && !isNewMode && (
            <div>
              {showRecent && (
                <div>
                  <div className="px-4 py-1.5 text-[10px] text-lab-muted uppercase tracking-wider flex items-center gap-1.5">
                    <ClockIcon /> 最近访问
                  </div>
                  {recentDocs.map((doc, i) => (
                    <div
                      key={`recent-${doc.projectId || 'p'}-${doc.id || 'id'}-${i}`}
                      onClick={() => handleItemClick('recent', doc)}
                      className={`flex items-center gap-3 px-4 py-2 cursor-pointer mx-1 rounded-lg transition-colors ${
                        selectedIndex === i ? 'bg-lab-accent-dim' : 'hover:bg-lab-raised'
                      }`}
                    >
                      <span className="text-lab-muted flex-shrink-0"><DocIcon /></span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-lab-ink truncate">{doc.name}</p>
                        <p className="text-[10px] text-lab-muted">{doc.projectName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <div className="px-4 py-1.5 text-[10px] text-lab-muted uppercase tracking-wider flex items-center gap-1.5">
                  <PlusIcon /> 快捷操作
                </div>
                {QUICK_ACTIONS.map((action, i) => {
                  const idx = (showRecent ? recentDocs.length : 0) + i
                  return (
                    <div
                      key={action.id}
                      onClick={() => handleItemClick('action', action)}
                      className={`flex items-center gap-3 px-4 py-2 cursor-pointer mx-1 rounded-lg transition-colors ${
                        selectedIndex === idx ? 'bg-lab-accent-dim' : 'hover:bg-lab-raised'
                      }`}
                    >
                      <span className="text-base flex-shrink-0">{action.icon}</span>
                      <span className="text-sm text-lab-ink">{action.label}</span>
                      <span className="text-[10px] text-lab-muted ml-auto">New:</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {showDocs && (
            <div>
              <div className="px-4 py-1.5 text-[10px] text-lab-muted uppercase tracking-wider">文档</div>
              {filteredDocs.map((doc, i) => {
                const idx = (showRecent ? recentDocs.length : 0) + i
                return (
                  <div
                    key={`search-${doc.projectId || 'p'}-${doc.id || 'id'}-${i}`}
                    onClick={() => handleItemClick('doc', doc)}
                    className={`flex items-center gap-3 px-4 py-2 cursor-pointer mx-1 rounded-lg transition-colors ${
                      selectedIndex === idx ? 'bg-lab-accent-dim' : 'hover:bg-lab-raised'
                    }`}
                  >
                    <span className="text-lab-muted flex-shrink-0"><DocIcon /></span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-lab-ink truncate">
                        {highlightMatch(doc.name, searchQuery)}
                      </p>
                      <p className="text-[10px] text-lab-muted">{doc.projectName}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {showProjects && (
            <div>
              <div className="px-4 py-1.5 text-[10px] text-lab-muted uppercase tracking-wider">项目</div>
              {filteredProjects.map((project, i) => {
                const idx = (showRecent ? recentDocs.length : 0) + (showDocs ? filteredDocs.length : 0) + i
                return (
                  <div
                    key={project.id}
                    onClick={() => handleItemClick('project', project)}
                    className={`flex items-center gap-3 px-4 py-2 cursor-pointer mx-1 rounded-lg transition-colors ${
                      selectedIndex === idx ? 'bg-lab-accent-dim' : 'hover:bg-lab-raised'
                    }`}
                  >
                    <span className="text-lab-muted flex-shrink-0"><ProjectIcon /></span>
                    <span className="text-sm text-lab-ink">
                      {highlightMatch(project.name, searchQuery)}
                    </span>
                    {project.id === activeProjectId && (
                      <span className="text-[10px] text-lab-accent-warm ml-auto">当前</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {showActions && (
            <div>
              <div className="px-4 py-1.5 text-[10px] text-lab-muted uppercase tracking-wider">创建</div>
              {filteredActions.map((action, i) => {
                const idx = (showRecent ? recentDocs.length : 0) + (showDocs ? filteredDocs.length : 0) + (showProjects ? filteredProjects.length : 0) + i
                return (
                  <div
                    key={action.id}
                    onClick={() => handleItemClick('action', action)}
                    className={`flex items-center gap-3 px-4 py-2 cursor-pointer mx-1 rounded-lg transition-colors ${
                      selectedIndex === idx ? 'bg-lab-accent-dim' : 'hover:bg-lab-raised'
                    }`}
                  >
                    <span className="text-base flex-shrink-0">{action.icon}</span>
                    <span className="text-sm text-lab-ink">{action.label}</span>
                  </div>
                )
              })}
            </div>
          )}

          {!showRecent && !showDocs && !showProjects && !showActions && searchQuery && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-lab-muted">未找到匹配结果</p>
              <p className="text-xs text-lab-faint mt-1">尝试其他关键词，或使用 New: 前缀创建新文档</p>
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-lab-border-subtle flex items-center justify-between">
          <span className="text-[10px] text-lab-muted">{footerText}</span>
          <div className="flex items-center gap-3 text-[10px] text-lab-muted">
            <span className="flex items-center gap-1">
              <span className="px-1 py-0.5 rounded bg-lab-raised text-lab-muted font-mono text-[9px] border border-lab-border-subtle">
                ↑↓
              </span>
              导航
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1 py-0.5 rounded bg-lab-raised text-lab-muted font-mono text-[9px] border border-lab-border-subtle">
                ↵
              </span>
              选择
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
