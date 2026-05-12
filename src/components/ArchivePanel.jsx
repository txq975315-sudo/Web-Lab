import { useLab } from '../context/LabContext'
import { useState, useEffect } from 'react'
import { buildDocMap } from '../utils/linkParser'
import { TEMPLATE_TYPES } from '../config/templates'
import DocumentForm from './DocumentForm'
import DocumentRenderer from './DocumentRenderer'

function EmptyState({ projectName }) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mb-6 text-lab-border">
        <rect x="8" y="12" width="48" height="40" rx="4" stroke="currentColor" strokeWidth="2" />
        <path d="M8 28L32 44L56 28" stroke="currentColor" strokeWidth="2" />
        <path d="M24 12V4C24 2.89543 24.8954 2 26 2H38C39.1046 2 40 2.89543 40 4V12" stroke="currentColor" strokeWidth="2" />
        <line x1="32" y1="32" x2="32" y2="44" stroke="currentColor" strokeWidth="2" />
      </svg>
      <h2 className="text-lg font-semibold font-display text-lab-ink mb-2">欢迎来到 {projectName}</h2>
      <p className="text-sm text-lab-muted mb-4 text-center max-w-[280px]">从左侧新建文档开始，记录你的思考和决策</p>
    </div>
  )
}

function DocumentConflictWarning({ conflicts, onStartPressureTest }) {
  return (
    <div
      className="mb-4 p-4 rounded-xl border"
      style={{
        backgroundColor: 'var(--color-warning-dim)',
        borderColor: 'color-mix(in srgb, var(--color-warning) 35%, transparent)',
      }}
    >
      <div className="flex items-start gap-3">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="flex-shrink-0 mt-0.5"
        >
          <path
            d="M8 2L14 12H2L8 2Z"
            stroke="var(--color-warning)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M8 5V8" stroke="var(--color-warning)" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="8" cy="11" r="1" fill="var(--color-warning)" />
        </svg>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-lab-ink">宪法冲突检测</h4>
          <p className="text-xs text-lab-muted mt-1">{conflicts?.summary}</p>
          {conflicts?.conflicts && conflicts.conflicts.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {conflicts.conflicts.slice(0, 2).map((conflict, idx) => (
                <div
                  key={idx}
                  className="text-xs p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-overlay)' }}
                >
                  <div className="font-medium text-lab-ink">违反约束 #{conflict.constraintIndex + 1}</div>
                  <div className="text-lab-muted mt-0.5">约束: {conflict.constraintText}</div>
                  <div className="text-lab-muted">冲突: {conflict.prdViolation}</div>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={onStartPressureTest}
            className="mt-3 text-xs px-3 py-1.5 rounded-lg font-medium lab-btn-primary transition-opacity hover:opacity-95"
          >
            🔍 开启压力测试
          </button>
        </div>
      </div>
    </div>
  )
}

function ReadingView({
  doc,
  categoryName,
  onEdit,
  onSummonMentor,
  onDelete,
  hasConflicts,
  conflicts,
  onStartPressureTest,
  allDocsMap,
  compact = false,
  onRequestClose,
}) {
  const { selectDocument } = useLab()
  
  // 安全检查
  if (!doc) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">📄</p>
          <h3 className="text-lg font-semibold font-display text-lab-ink mb-2">文档不存在</h3>
          <p className="text-sm text-lab-muted">请选择其他文档</p>
        </div>
      </div>
    )
  }
  
  const hasBacklinks = doc?.backlinks && Array.isArray(doc.backlinks) && doc.backlinks.length > 0
  const hasReferences = doc?.references && Array.isArray(doc.references) && doc.references.length > 0
  const showBacklinks = hasBacklinks || hasReferences

  const handleLinkClick = (docId) => {
    if (docId) {
      selectDocument(docId)
    }
  }

  const handleDeleteClick = () => {
    if (confirm('确定要删除此文档吗？此操作不可撤销。')) {
      onDelete()
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div
        className={`flex items-start justify-between ${compact ? 'border-b px-3 py-2' : 'px-6 py-4 border-b border-lab-border-subtle'}`}
        style={compact ? { borderColor: 'rgba(15, 23, 42, 0.08)' } : undefined}
      >
        <div className="min-w-0 flex-1 pr-2">
          <h1 className={`font-semibold font-display text-lab-ink ${compact ? 'text-sm' : 'text-lg'}`}>
            {doc?.name || '未命名文档'}
          </h1>
          <div className={`flex flex-wrap items-center gap-2 ${compact ? 'mt-0.5' : 'mt-1'}`}>
            <span className="text-xs text-lab-muted">{categoryName}</span>
            {doc?.updatedAt && (
              <span className="text-xs text-lab-faint">
                更新于 {new Date(doc.updatedAt).toLocaleDateString('zh-CN')}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          {onRequestClose && (
            <button
              type="button"
              onClick={onRequestClose}
              className="rounded-lg p-1.5 text-lab-muted transition-colors hover:bg-[rgba(15,23,42,0.06)] hover:text-lab-ink"
              aria-label="关闭文档"
              title="关闭文档"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={handleDeleteClick}
            className={`rounded-lg font-medium text-[var(--color-text-inverted)] transition-all hover:opacity-95 active:scale-[0.98] ${compact ? 'px-2 py-1 text-[10px]' : 'text-xs px-3 py-1.5'}`}
            style={{ backgroundColor: 'var(--color-error)', borderRadius: '9px' }}
          >
            删除
          </button>
          <button
            type="button"
            onClick={onSummonMentor}
            className={`rounded-lg font-medium text-[var(--color-text-inverted)] transition-all hover:opacity-95 active:scale-[0.98] ${compact ? 'px-2 py-1 text-[10px]' : 'text-xs px-3 py-1.5'}`}
            style={{ backgroundColor: 'var(--color-accent-blue)', borderRadius: '9px' }}
          >
            ✨ 召唤导师
          </button>
          <button
            type="button"
            onClick={onEdit}
            className={`rounded-lg font-medium text-lab-muted transition-colors hover:bg-lab-accent-dim hover:text-lab-accent-warm ${compact ? 'px-2 py-1 text-[10px]' : 'text-xs px-3 py-1.5'}`}
          >
            编辑
          </button>
        </div>
      </div>

      <div className={`flex-1 overflow-auto ${compact ? 'px-2 py-2' : 'px-6 py-4'}`}>
        {hasConflicts && conflicts && (
          <DocumentConflictWarning conflicts={conflicts} onStartPressureTest={onStartPressureTest} />
        )}

        <div
          className={
            compact
              ? 'rounded-md px-1 py-1'
              : 'p-6 rounded-xl bg-lab-overlay border border-lab-border-subtle shadow-card'
          }
        >
          <DocumentRenderer doc={doc} />
        </div>

        {showBacklinks && (
          <div className="mt-6 pt-4 border-t border-lab-border-subtle">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-lab-muted mb-2">← 被引用</p>
                {hasBacklinks ? (
                  <div className="space-y-1">
                    {(doc.backlinks || []).map(blId => {
                      const blDoc = allDocsMap?.[blId]
                      return (
                        <div
                          key={blId}
                          onClick={() => blDoc && handleLinkClick(blId)}
                          className="text-sm text-lab-accent-warm cursor-pointer hover:underline truncate"
                        >
                          {blDoc ? blDoc.name : blId}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-lab-muted">暂无</p>
                )}
              </div>
              <div>
                <p className="text-xs text-lab-muted mb-2">→ 引用</p>
                {hasReferences ? (
                  <div className="space-y-1">
                    {(doc.references || []).map(refId => {
                      const refDoc = allDocsMap?.[refId]
                      return (
                        <div
                          key={refId}
                          onClick={() => refDoc && handleLinkClick(refId)}
                          className="text-sm text-lab-accent-warm cursor-pointer hover:underline truncate"
                        >
                          {refDoc ? refDoc.name : refId}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-lab-muted">暂无</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EditingView({ doc, categoryName, onSave, onCancel, allDocsMap, compact = false, onRequestClose }) {
  const handleSave = (data) => {
    onSave(data)
  }
  
  // 安全检查
  if (!doc) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">📝</p>
          <h3 className="text-lg font-semibold font-display text-lab-ink mb-2">文档不存在</h3>
          <p className="text-sm text-lab-muted">无法找到要编辑的文档</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div
        className={`flex items-start justify-between ${compact ? 'border-b px-3 py-2' : 'px-6 py-4 border-b border-lab-border-subtle'}`}
        style={compact ? { borderColor: 'rgba(15, 23, 42, 0.08)' } : undefined}
      >
        <div>
          <h1 className={`font-semibold font-display text-lab-ink ${compact ? 'text-sm' : 'text-lg'}`}>
            {doc?.name || '未命名文档'}
          </h1>
          <div className={`flex items-center gap-3 ${compact ? 'mt-0.5' : 'mt-1'}`}>
            <span className="text-xs text-lab-muted">{categoryName}</span>
            <span className="text-xs text-lab-accent-warm">编辑中</span>
          </div>
        </div>
        {onRequestClose && (
          <button
            type="button"
            onClick={onRequestClose}
            className="rounded-lg p-1.5 text-lab-muted transition-colors hover:bg-[rgba(15,23,42,0.06)]"
            aria-label="关闭文档"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <div className={`flex-1 overflow-auto ${compact ? 'px-2 py-2' : 'px-6 py-4'}`}>
        <div className={compact ? '' : 'p-6 rounded-xl bg-lab-overlay border border-lab-border-subtle shadow-card'}>
          <DocumentForm doc={doc} onSave={handleSave} onCancel={onCancel} />
        </div>
      </div>
    </div>
  )
}

export default function ArchivePanel({ variant = 'page' }) {
  const { 
    projectTree, 
    activeProjectId, 
    activeDocId, 
    currentProject, 
    findNodeById,
    saveDocument,
    deleteDocument,
    selectDocument,
    documentConflicts,
    switchExpertMode,
    expertMode,
    setProjectMemories,
    setLabMessageToSend,
    setAutoSendLabMessage,
    setActiveLabTab,
    labMode,
    setLabMode
  } = useLab()

  const [editingDocId, setEditingDocId] = useState(null)
  const [previousDocId, setPreviousDocId] = useState(null)

  const allDocsMap = buildDocMap(projectTree)

  const selectedDoc = activeDocId ? findNodeById(activeDocId) : null

  const getCategoryName = (docId) => {
    if (!currentProject?.children || !docId) return ''
    
    for (const category of currentProject.children) {
      if (category?.children?.some(child => child?.id === docId)) {
        return category.name
      }
    }
    return ''
  }

  useEffect(() => {
    if (activeDocId && activeDocId !== previousDocId && selectedDoc) {
      const isNew = !selectedDoc.updatedAt || 
        (new Date(selectedDoc.updatedAt).getTime() > Date.now() - 2000)
      
      if (isNew) {
        setEditingDocId(activeDocId)
      }
    }
    setPreviousDocId(activeDocId)
  }, [activeDocId, selectedDoc])

  const handleEdit = () => {
    setEditingDocId(activeDocId)
  }

  const handleSave = (data) => {
    if (!activeDocId) return
    
    saveDocument(activeDocId, {
      name: data.name,
      content: data.content || '',
      fields: data.fields || {}
    })
    setEditingDocId(null)
  }

  const handleCancel = () => {
    setEditingDocId(null)
  }

  const handleDelete = () => {
    if (!activeDocId) return
    
    console.log('🗑️ 开始删除文档:', activeDocId)
    // 先清除所有状态，防止渲染时访问已删除的文档
    selectDocument(null)
    setEditingDocId(null)
    // 然后再执行删除操作
    deleteDocument(activeDocId)
    console.log('✅ 文档删除完成')
  }

  const handleSummonMentor = () => {
    if (!selectedDoc || !currentProject) return

    const projectMemory = {
      projectId: activeProjectId,
      totalInteractions: 1,
      lastUpdated: new Date().toISOString(),
      insights: [],
      discussionTopics: []
    }

    setProjectMemories(prev => ({
      ...prev,
      [activeProjectId]: projectMemory
    }))

    const messageContent = `请深入分析当前文档：「${selectedDoc.name}」。

文档内容：
${selectedDoc.content || JSON.stringify(selectedDoc.fields || {}, null, 2)}

请提出深度追问，帮助我完善这份文档。`

    setLabMessageToSend(messageContent)
    setAutoSendLabMessage(true)
    setActiveLabTab('live')
    
    if (labMode !== 'live') {
      setLabMode('live')
    }
  }

  const handleStartPressureTest = () => {
    if (expertMode !== 'pressure') {
      switchExpertMode('pressure')
    }
  }

  const isEditing = editingDocId && editingDocId === activeDocId
  const categoryName = selectedDoc ? getCategoryName(selectedDoc.id) : ''
  const hasConflicts = activeDocId && documentConflicts[activeDocId]?.hasConflict
  const conflicts = activeDocId ? documentConflicts[activeDocId] : null

  const isInline = variant === 'inline'
  const compact = isInline
  const closeInline = isInline ? () => selectDocument(null) : undefined

  return (
    <div
      className={
        isInline
          ? 'flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-transparent'
          : 'h-full flex flex-col overflow-hidden bg-lab-base'
      }
    >
      {!isInline && (
        <div className="px-6 pt-4 pb-2">
          <p className="text-xs text-lab-muted">{currentProject?.name || ''}</p>
        </div>
      )}

      {!activeDocId && !editingDocId ? (
        <div className="flex-1">
          <EmptyState projectName={currentProject?.name || '思维实验室'} />
        </div>
      ) : selectedDoc && isEditing ? (
        <EditingView
          doc={selectedDoc}
          categoryName={categoryName}
          onSave={handleSave}
          onCancel={handleCancel}
          allDocsMap={allDocsMap}
          compact={compact}
          onRequestClose={closeInline}
        />
      ) : selectedDoc ? (
        <ReadingView
          doc={selectedDoc}
          categoryName={categoryName}
          onEdit={handleEdit}
          onSummonMentor={handleSummonMentor}
          onDelete={handleDelete}
          hasConflicts={hasConflicts}
          conflicts={conflicts}
          onStartPressureTest={handleStartPressureTest}
          allDocsMap={allDocsMap}
          compact={compact}
          onRequestClose={closeInline}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-4xl mb-4">🔍</p>
            <h3 className="text-lg font-semibold font-display text-lab-ink mb-2">文档未找到</h3>
            <p className="text-sm text-lab-muted">无法找到该文档</p>
          </div>
        </div>
      )}
    </div>
  )
}
