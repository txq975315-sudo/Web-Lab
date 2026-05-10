import { useLab } from '../context/LabContext'
import { useState, useEffect } from 'react'
import { buildDocMap } from '../utils/linkParser'
import { TEMPLATE_TYPES } from '../config/templates'
import DocumentForm from './DocumentForm'
import DocumentRenderer from './DocumentRenderer'

function EmptyState({ projectName }) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mb-6">
        <rect x="8" y="12" width="48" height="40" rx="4" stroke="#D1D5DB" strokeWidth="2" />
        <path d="M8 28L32 44L56 28" stroke="#D1D5DB" strokeWidth="2" />
        <path d="M24 12V4C24 2.89543 24.8954 2 26 2H38C39.1046 2 40 2.89543 40 4V12" stroke="#D1D5DB" strokeWidth="2" />
        <line x1="32" y1="32" x2="32" y2="44" stroke="#D1D5DB" strokeWidth="2" />
      </svg>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">欢迎来到 {projectName}</h2>
      <p className="text-sm text-gray-500 mb-4 text-center max-w-[280px]">从左侧新建文档开始，记录你的思考和决策</p>
    </div>
  )
}

function DocumentConflictWarning({ conflicts, onStartPressureTest }) {
  return (
    <div 
      className="mb-4 p-4 rounded-xl"
      style={{
        backgroundColor: '#FFFBEB',
        border: '1px solid #FEF3C7'
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
            stroke="#F59E0B"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M8 5V8" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="8" cy="11" r="1" fill="#F59E0B" />
        </svg>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-amber-900">宪法冲突检测</h4>
          <p className="text-xs text-amber-700 mt-1">{conflicts?.summary}</p>
          {conflicts?.conflicts && conflicts.conflicts.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {conflicts.conflicts.slice(0, 2).map((conflict, idx) => (
                <div
                  key={idx}
                  className="text-xs p-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}
                >
                  <div className="font-medium text-amber-800">违反约束 #{conflict.constraintIndex + 1}</div>
                  <div className="text-amber-600 mt-0.5">约束: {conflict.constraintText}</div>
                  <div className="text-amber-600">冲突: {conflict.prdViolation}</div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={onStartPressureTest}
            className="mt-3 text-xs px-3 py-1.5 rounded-lg font-medium text-white transition-all hover:scale-105"
            style={{ backgroundColor: '#8B5CF6' }}
          >
            🔍 开启压力测试
          </button>
        </div>
      </div>
    </div>
  )
}

function ReadingView({ doc, categoryName, onEdit, onSummonMentor, onDelete, hasConflicts, conflicts, onStartPressureTest, allDocsMap }) {
  const { selectDocument } = useLab()
  
  // 安全检查
  if (!doc) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">📄</p>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">文档不存在</h3>
          <p className="text-sm text-gray-500">请选择其他文档</p>
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
      <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">{doc?.name || '未命名文档'}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-500">{categoryName}</span>
            {doc?.updatedAt && (
              <span className="text-xs text-gray-400">
                更新于 {new Date(doc.updatedAt).toLocaleDateString('zh-CN')}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDeleteClick}
            className="text-xs px-3 py-1.5 rounded-lg font-medium text-white transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#EF4444', borderRadius: '9px' }}
          >
            删除
          </button>
          <button
            onClick={onSummonMentor}
            className="text-xs px-3 py-1.5 rounded-lg font-medium text-white transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#7C3AED' }}
          >
            ✨ 召唤导师
          </button>
          <button
            onClick={onEdit}
            className="text-xs px-3 py-1.5 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-all"
          >
            编辑
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {hasConflicts && conflicts && (
          <DocumentConflictWarning 
            conflicts={conflicts} 
            onStartPressureTest={onStartPressureTest} 
          />
        )}

        <div
          className="p-6 rounded-xl"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <DocumentRenderer doc={doc} />
        </div>

        {showBacklinks && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-2">← 被引用</p>
                {hasBacklinks ? (
                  <div className="space-y-1">
                    {(doc.backlinks || []).map(blId => {
                      const blDoc = allDocsMap?.[blId]
                      return (
                        <div
                          key={blId}
                          onClick={() => blDoc && handleLinkClick(blId)}
                          className="text-sm text-blue-600 cursor-pointer hover:underline truncate"
                        >
                          {blDoc ? blDoc.name : blId}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">暂无</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">→ 引用</p>
                {hasReferences ? (
                  <div className="space-y-1">
                    {(doc.references || []).map(refId => {
                      const refDoc = allDocsMap?.[refId]
                      return (
                        <div
                          key={refId}
                          onClick={() => refDoc && handleLinkClick(refId)}
                          className="text-sm text-blue-600 cursor-pointer hover:underline truncate"
                        >
                          {refDoc ? refDoc.name : refId}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">暂无</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EditingView({ doc, categoryName, onSave, onCancel, allDocsMap }) {
  const handleSave = (data) => {
    onSave(data)
  }
  
  // 安全检查
  if (!doc) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">📝</p>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">文档不存在</h3>
          <p className="text-sm text-gray-500">无法找到要编辑的文档</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">{doc?.name || '未命名文档'}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-500">{categoryName}</span>
            <span className="text-xs text-purple-500">编辑中</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        <div
          className="p-6 rounded-xl"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB'
          }}
        >
          <DocumentForm 
            doc={doc} 
            onSave={handleSave} 
            onCancel={onCancel} 
          />
        </div>
      </div>
    </div>
  )
}

export default function ArchivePanel() {
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

  return (
    <div 
      className="h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: '#F9FAFB' }}
    >
      <div className="px-6 pt-4 pb-2">
        <p className="text-xs text-gray-500">{currentProject?.name || ''}</p>
      </div>

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
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-4xl mb-4">🔍</p>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">文档未找到</h3>
            <p className="text-sm text-gray-500">无法找到该文档</p>
          </div>
        </div>
      )}
    </div>
  )
}
