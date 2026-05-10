import { useState, useEffect, useMemo } from 'react'
import { useLab } from '../context/LabContext'
import DocumentForm from './DocumentForm'
import DocumentRenderer from './DocumentRenderer'
import { getTemplateLabel, getTemplateIcon, getTemplateFields } from '../config/templates'

function ManifestoField({ field, value, onChange, isEditing }) {
  const [charCount, setCharCount] = useState((value || '').length)
  const maxLength = field.maxLength || 200
  const isOverLimit = charCount > maxLength

  const handleChange = (e) => {
    const newValue = e.target.value
    setCharCount(newValue.length)
    if (onChange) onChange(field.key, newValue)
  }

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-lab-ink flex items-center gap-1.5">
          {field.label}
          {field.required && <span className="text-lab-error">*</span>}
        </label>
        {(field.maxLength || isEditing) && (
          <span className={`text-xs ${isOverLimit ? 'text-lab-error font-medium' : 'text-lab-muted'}`}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>

      {isEditing ? (
        <>
          {field.type === 'textarea' ? (
            <textarea
              value={value || ''}
              onChange={handleChange}
              placeholder={field.placeholder}
              maxLength={maxLength}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 transition-all ${
                isOverLimit
                  ? 'border-red-300 focus:ring-red-200 bg-red-50'
                  : 'border-lab-border-subtle focus:ring-lab-accent focus:border-lab-accent'
              }`}
              style={{ minHeight: '100px', maxHeight: '200px' }}
            />
          ) : (
            <input
              type="text"
              value={value || ''}
              onChange={handleChange}
              placeholder={field.placeholder}
              maxLength={maxLength}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                isOverLimit
                  ? 'border-red-300 focus:ring-red-200 bg-red-50'
                  : 'border-lab-border-subtle focus:ring-lab-accent focus:border-lab-accent'
              }`}
            />
          )}
          {isOverLimit && (
            <p className="mt-1 text-xs text-lab-error">⚠️ 已超过字数限制，请精简内容</p>
          )}
        </>
      ) : (
        <div className="px-3 py-2.5 bg-lab-raised rounded-lg text-sm text-lab-ink whitespace-pre-line min-h-[44px]">
          {value || <span className="text-lab-muted italic">未填写</span>}
        </div>
      )}
    </div>
  )
}

function ManifestoVersionHistory({ versions, onRestore }) {
  const [expanded, setExpanded] = useState(false)

  if (!versions || versions.length === 0) {
    return null
  }

  return (
    <div className="mt-6 pt-4 border-t border-lab-border-subtle">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-sm font-medium text-lab-ink hover:text-lab-accent-warm transition-colors"
      >
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>版本历史</span>
        <span className="text-xs text-lab-muted">({versions.length} 个版本)</span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
          {versions.map((version, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border border-lab-border-subtle hover:border-lab-accent hover:bg-lab-accent-dim/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-lab-accent-warm">
                    v{version.version || (versions.length - index)}
                  </span>
                  <span className="text-xs text-lab-muted">
                    {new Date(version.timestamp).toLocaleString('zh-CN')}
                  </span>
                </div>
                {onRestore && (
                  <button
                    type="button"
                    onClick={() => onRestore(index)}
                    className="text-xs text-lab-accent-blue hover:text-lab-accent-warm"
                  >
                    恢复此版本
                  </button>
                )}
              </div>
              {version.changeReason && (
                <p className="text-xs text-lab-muted mb-1">
                  📝 {version.changeReason}
                </p>
              )}
              <div className="text-xs text-lab-muted space-y-1">
                {Object.entries(version.fields || {}).slice(0, 2).map(([key, val]) => (
                  <div key={key}>
                    <span className="font-medium">{key}:</span>{' '}
                    <span className="line-clamp-1">{val?.toString().substring(0, 50)}...</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ManifestoDetail({ doc, onBack }) {
  const {
    updateDocument,
    updateManifesto,
    activeProject,
    allDocuments,
    setActiveDocId,
    auditFullProject
  } = useLab()

  const [isEditing, setIsEditing] = useState(false)
  const [localFields, setLocalFields] = useState(doc?.fields || {})
  const [versionHistory, setVersionHistory] = useState(doc?.versionHistory || [])
  const [currentVersion, setCurrentVersion] = useState(doc?.version || 1)

  const templateType = 'manifesto'
  const fields = getTemplateFields(templateType)

  useEffect(() => {
    if (doc) {
      setLocalFields(doc.fields || {})
      setVersionHistory(doc.versionHistory || [])
      setCurrentVersion(doc.version || 1)
    }
  }, [doc])

  const handleFieldChange = (key, value) => {
    setLocalFields(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = () => {
    const newVersion = currentVersion + 1
    const versionRecord = {
      version: newVersion,
      timestamp: new Date().toISOString(),
      fields: { ...localFields },
      changeReason: '手动保存更新'
    }

    const updatedHistory = [...versionHistory, versionRecord]

    if (updateManifesto) {
      updateManifesto(activeProject?.id, localFields, '手动保存', {
        version: newVersion,
        versionHistory: updatedHistory
      })
    } else {
      updateDocument(doc.id, {
        fields: localFields,
        version: newVersion,
        versionHistory: updatedHistory
      })
    }

    setCurrentVersion(newVersion)
    setVersionHistory(updatedHistory)
    setIsEditing(false)
  }

  const handleSaveAndAudit = () => {
    handleSave()

    setTimeout(() => {
      if (auditFullProject) {
        console.log('🔄 触发全项目审计...')
        auditFullProject(activeProject?.id)
      }
    }, 300)
  }

  const slogan = useMemo(() => localFields.slogan || '', [localFields.slogan])
  const lastUpdated = doc?.updatedAt || new Date().toISOString()

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 顶部导航栏 */}
      <div className="px-6 pt-5 pb-4 border-b border-lab-border-subtle bg-gradient-to-r from-lab-accent-dim to-lab-overlay">
        {/* 版本信息 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-lab-accent-dim text-lab-accent-warm text-xs font-semibold border border-lab-border-subtle">
              <span>🎯</span>
              <span>核心定位</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-lab-muted">
              <span className="px-1.5 py-0.5 bg-lab-raised rounded border border-lab-border-subtle">v{currentVersion}</span>
              <span>·</span>
              <span>更新于 {new Date(lastUpdated).toLocaleDateString('zh-CN')}</span>
            </div>
          </div>

          {/* 操作按钮组 */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs font-medium text-lab-muted hover:text-lab-ink border border-lab-border-subtle rounded-lg transition-colors hover:bg-lab-raised"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!localFields.slogan?.trim()}
                  className="lab-btn-primary px-3 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                >
                  💾 保存
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndAudit}
                  disabled={!localFields.slogan?.trim()}
                  className="px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 bg-lab-success hover:opacity-92"
                >
                  🔍 保存并审计
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="lab-btn-primary px-3 py-1.5 text-xs"
                >
                  ✏️ 编辑定位
                </button>
              </>
            )}
          </div>
        </div>

        {/* Slogan 大字展示 */}
        {!isEditing && slogan && (
          <div className="mb-4 p-4 bg-lab-overlay rounded-xl border-2 border-lab-accent-dim shadow-card">
            <p className="text-2xl font-bold font-display text-center text-lab-ink leading-relaxed">
              "{slogan}"
            </p>
          </div>
        )}

        {/* 面包屑 */}
        <Breadcrumb
          items={[
            { id: null, label: activeProject?.name || 'Kairos App', icon: '🏠' },
            { id: 'constitution', label: '01 项目宪法', icon: '📁' },
            { id: doc.id, label: '核心定位', icon: '🎯' }
          ]}
          onNavigate={(id) => {
            if (!id) {
              if (onBack) onBack()
              else setActiveDocId(null)
            } else {
              setActiveDocId(id)
            }
          }}
        />
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-1">
          {fields.map(field => (
            <ManifestoField
              key={field.key}
              field={field}
              value={localFields[field.key]}
              onChange={handleFieldChange}
              isEditing={isEditing}
            />
          ))}
        </div>

        {/* 版本历史 */}
        <div className="max-w-3xl mx-auto">
          <ManifestoVersionHistory
            versions={versionHistory}
            onRestore={(index) => {
              const versionToRestore = versionHistory[index]
              if (versionToRestore && window.confirm(`确定恢复到 v${versionToRestore.version} 吗？`)) {
                setLocalFields(versionToRestore.fields)
                setIsEditing(true)
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}

function Breadcrumb({ items, onNavigate }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-lab-muted mb-4">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <div key={index} className="flex items-center gap-1.5">
            {index > 0 && <span className="text-lab-border">/</span>}
            <button
              type="button"
              onClick={() => !isLast && onNavigate(item.id)}
              disabled={isLast}
              className={`transition-colors ${
                isLast
                  ? 'text-lab-ink font-medium cursor-default'
                  : 'hover:text-lab-accent-warm cursor-pointer'
              }`}
            >
              {item.icon && <span className="mr-0.5">{item.icon}</span>}
              {item.label}
            </button>
          </div>
        )
      })}
    </div>
  )
}

function StatusIndicator({ status, onToggle }) {
  const statusConfig = {
    exploring: {
      color: 'var(--color-warning)',
      dim: 'var(--color-warning-dim)',
      label: '探索中',
    },
    locked: {
      color: 'var(--color-success)',
      dim: 'var(--color-success-dim)',
      label: '已确定',
    },
    rejected: {
      color: 'var(--color-error)',
      dim: 'var(--color-error-dim)',
      label: '已否决',
    },
  }

  const config = statusConfig[status] || statusConfig.exploring

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        if (onToggle) onToggle()
      }}
      className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 border border-lab-border-subtle"
      style={{ backgroundColor: config.dim, color: config.color }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: config.color,
          boxShadow: `0 0 0 2px white, 0 0 0 3px ${config.color}`
        }}
      />
      {config.label}
    </button>
  )
}

function EvidencePanel({ evidence, title = "证据链" }) {
  const [expanded, setExpanded] = useState(false)

  if (!evidence || evidence.length === 0) return null

  const supporting = evidence.filter(e => e.type === 'supporting')
  const challenging = evidence.filter(e => e.type === 'challenging')
  const neutral = evidence.filter(e => e.type === 'neutral')

  return (
    <div className="mt-6 pt-4 border-t border-lab-border-subtle">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-sm font-medium text-lab-ink hover:text-lab-accent-warm transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          >
            <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{title}</span>
          <span className="text-xs text-lab-muted">({evidence.length})</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {supporting.length > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-[var(--color-success-dim)] text-lab-success border border-lab-border-subtle">
              {supporting.length} 👍
            </span>
          )}
          {challenging.length > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-600">
              {challenging.length} 👎
            </span>
          )}
        </div>
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {supporting.map((e, i) => (
            <EvidenceCard key={`sup-${i}`} evidence={e} type="supporting" />
          ))}
          {neutral.map((e, i) => (
            <EvidenceCard key={`neu-${i}`} evidence={e} type="neutral" />
          ))}
          {challenging.map((e, i) => (
            <EvidenceCard key={`chal-${i}`} evidence={e} type="challenging" />
          ))}
        </div>
      )}
    </div>
  )
}

function EvidenceCard({ evidence, type }) {
  const typeConfig = {
    supporting: { bg: 'bg-[var(--color-success-dim)]', border: 'border-lab-success/30', icon: '👍' },
    challenging: { bg: 'bg-red-50', border: 'border-red-200', icon: '👎' },
    neutral: { bg: 'bg-lab-raised', border: 'border-lab-border-subtle', icon: '⚖️' },
  }

  const config = typeConfig[type] || typeConfig.neutral

  return (
    <div className={`p-3 rounded-lg border ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-2">
        <span className="text-sm flex-shrink-0 mt-0.5">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-lab-ink">{evidence.content || evidence.text || ''}</p>
          {(evidence.source || evidence.date) && (
            <p className="text-xs text-lab-muted mt-1">
              {evidence.source && <span>来源: {evidence.source}</span>}
              {evidence.source && evidence.date && <span> · </span>}
              {evidence.date && <span>{evidence.date}</span>}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function BacklinkPanel({ backlinks, references, allDocsMap, onNavigate }) {
  const [expanded, setExpanded] = useState(false)
  const hasBacklinks = backlinks && backlinks.length > 0
  const hasReferences = references && references.length > 0

  if (!hasBacklinks && !hasReferences) return null

  return (
    <div className="mt-6 pt-4 border-t border-lab-border-subtle">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-sm font-medium text-lab-ink hover:text-lab-accent-warm transition-colors"
      >
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>关联文档</span>
        <span className="text-xs text-lab-muted">
          ({[...(backlinks || []), ...(references || [])].length})
        </span>
      </button>

      {expanded && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-lab-muted mb-2 font-medium">← 被引用于</p>
            {hasBacklinks ? (
              <div className="space-y-1.5">
                {backlinks.map(blId => {
                  const blDoc = allDocsMap[blId]
                  return (
                    <button
                      key={blId}
                      onClick={() => blDoc && onNavigate && onNavigate(blId)}
                      className="block w-full text-left text-xs text-lab-accent-blue hover:text-lab-accent-warm hover:bg-lab-accent-dim px-2 py-1.5 rounded transition-colors truncate"
                    >
                      📄 {blDoc ? blDoc.name : blId}
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-lab-muted italic">暂无被引用记录</p>
            )}
          </div>

          <div>
            <p className="text-xs text-lab-muted mb-2 font-medium">→ 引用了</p>
            {hasReferences ? (
              <div className="space-y-1.5">
                {references.map(refId => {
                  const refDoc = allDocsMap[refId]
                  return (
                    <button
                      key={refId}
                      onClick={() => refDoc && onNavigate && onNavigate(refId)}
                      className="block w-full text-left text-xs text-lab-accent-blue hover:text-lab-accent-warm hover:bg-lab-accent-dim px-2 py-1.5 rounded transition-colors truncate"
                    >
                      📄 {refDoc ? refDoc.name : refId}
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-lab-muted italic">暂无引用记录</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DocumentDetail({ doc, onBack, onSummonMentor }) {
  const {
    updateDocument,
    activeProject,
    allDocuments,
    setActiveDocId,
    summonMentor
  } = useLab()

  const [isEditing, setIsEditing] = useState(false)
  const [localTitle, setLocalTitle] = useState(doc?.name || doc?.title || '')
  const [localContent, setLocalContent] = useState(doc?.content || '')
  const [localFields, setLocalFields] = useState(doc?.fields || {})

  useEffect(() => {
    if (doc) {
      setLocalTitle(doc.name || doc.title || '')
      setLocalContent(doc.content || '')
      setLocalFields(doc.fields || {})
    }
  }, [doc])

  const templateType = doc?.docType || doc?.typeKey || 'blank'
  const templateLabel = getTemplateLabel(templateType)
  const templateIcon = getTemplateIcon(templateType)
  const isStructured = !['blank', 'markdown'].includes(templateType)

  const handleSave = () => {
    if (doc) {
      updateDocument(doc.id, {
        name: localTitle,
        content: localContent,
        fields: localFields
      })
      setIsEditing(false)
    }
  }

  const handleFieldChange = (key, value) => {
    setLocalFields(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSummonMentor = () => {
    if (onSummonMentor) {
      onSummonMentor(doc)
    } else if (summonMentor) {
      summonMentor({
        docId: doc.id,
        docName: doc.name,
        docType: templateType,
        context: `正在查看文档「${doc.name}」，请基于此文档内容提供指导。`
      })
    }
  }

  const buildBreadcrumbItems = () => {
    const items = [
      { id: null, label: activeProject?.name || 'Kairos App', icon: '🏠' }
    ]

    if (doc) {
      const moduleMap = {
        'constitution': { label: '01 项目宪法', icon: '📁' },
        'market-insight': { label: '02 市场与用户洞察', icon: '📁' },
        'product-strategy': { label: '03 产品与商业策略', icon: '📁' },
        'decision-chain': { label: '04 决策链图谱', icon: '🔀' },
        'anti-fragile-audit': { label: '05 反脆弱审计', icon: '📁' },
        'execution-roadmap': { label: '06 执行路线图', icon: '📁' }
      }

      const moduleId = doc.parentId?.split('-cat-')[1]?.replace(/-/g, '-') || ''
      const moduleInfo = moduleMap[moduleId]

      if (moduleInfo) {
        items.push({ id: moduleId, ...moduleInfo })
      }

      items.push({
        id: doc.id,
        label: doc.name || doc.title || '未命名文档',
        icon: templateIcon
      })
    }

    return items
  }

  const handleBreadcrumbNavigate = (id) => {
    if (id === null) {
      if (onBack) onBack()
      else setActiveDocId(null)
    } else {
      setActiveDocId(id)
    }
  }

  const buildAllDocsMap = () => {
    const map = {}
    allDocuments.forEach(d => { map[d.id] = d })
    return map
  }

  if (!doc) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-lab-muted">未找到文档</p>
          <button
            type="button"
            onClick={onBack}
            className="mt-3 text-xs text-lab-accent-warm hover:text-lab-accent"
          >
            返回列表
          </button>
        </div>
      </div>
    )
  }

  // 如果是核心定位文档，使用特殊的 ManifestoDetail 组件
  const actualDocType = doc.docType || doc.typeKey || 'blank'
  if (actualDocType === 'manifesto' || doc.id?.includes('manifesto') || doc.id?.includes('core-positioning')) {
    return <ManifestoDetail doc={doc} onBack={onBack} />
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 顶部导航栏 */}
      <div className="px-6 pt-5 pb-3 border-b border-lab-border-subtle">
        {/* 面包屑 */}
        <Breadcrumb
          items={buildBreadcrumbItems()}
          onNavigate={handleBreadcrumbNavigate}
        />

        {/* 标题栏 */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                className="w-full text-xl font-bold font-display text-lab-ink border-b-2 border-lab-accent focus:outline-none pb-1"
                autoFocus
              />
            ) : (
              <h1 className="text-xl font-bold font-display text-lab-ink truncate">
                {localTitle}
              </h1>
            )}

            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-lab-accent-dim text-lab-accent-warm border border-lab-border-subtle">
                {templateIcon}
                {templateLabel}
              </span>

              {['constitution'].includes(templateType.split('-')[0]) &&
               ['decisions-made', 'rejected-graveyard'].some(t => doc.id.includes(t)) && (
                <StatusIndicator
                  status={doc.status || 'exploring'}
                  onToggle={() => {
                    // 状态切换逻辑
                  }}
                />
              )}

              <span className="text-xs text-lab-muted">
                更新于 {new Date(doc.updatedAt || Date.now()).toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>

          {/* 操作按钮组 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs font-medium text-lab-muted hover:text-lab-ink border border-lab-border-subtle rounded-lg transition-colors hover:bg-lab-raised"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="lab-btn-primary px-3 py-1.5 text-xs"
                >
                  保存
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 text-xs font-medium text-lab-muted hover:text-lab-ink border border-lab-border-subtle rounded-lg transition-colors hover:bg-lab-raised"
                >
                  ✏️ 编辑
                </button>
                <button
                  type="button"
                  onClick={handleSummonMentor}
                  className="px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all hover:scale-105 flex items-center gap-1 bg-lab-success hover:opacity-92"
                >
                  🧙 召唤导师
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {isEditing ? (
          /* 编辑模式 */
          <div className="max-w-3xl mx-auto">
            {isStructured ? (
              /* 结构化表单编辑 */
              <DocumentForm
                doc={{ ...doc, name: localTitle, fields: localFields, content: localContent }}
                onSave={(updatedData) => {
                  updateDocument(doc.id, updatedData)
                  setIsEditing(false)
                }}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              /* Markdown/空白编辑 */
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-lab-ink mb-2">
                    文档内容
                  </label>
                  <textarea
                    value={localContent}
                    onChange={(e) => setLocalContent(e.target.value)}
                    placeholder="开始输入内容..."
                    className="w-full h-96 p-4 text-sm border border-lab-border-subtle rounded-lg resize-none focus:outline-none focus:border-lab-accent focus:ring-2 focus:ring-lab-accent bg-lab-overlay text-lab-ink"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 只读模式 */
          <div className="max-w-3xl mx-auto">
            {isStructured && doc.fields && Object.keys(doc.fields).length > 0 ? (
              /* 结构化字段展示 */
              <div className="bg-lab-overlay rounded-lg border border-lab-border-subtle overflow-hidden shadow-card">
                <div className="px-6 py-4 bg-lab-raised border-b border-lab-border-subtle">
                  <h3 className="text-sm font-semibold font-display text-lab-ink">{templateLabel} 字段</h3>
                </div>
                <div className="divide-y divide-lab-border-subtle">
                  {Object.entries(localFields).map(([key, value]) => (
                    <div key={key} className="px-6 py-4">
                      <dt className="text-xs font-medium text-lab-muted uppercase tracking-wide mb-1">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </dt>
                      <dd className="text-sm text-lab-ink whitespace-pre-line">
                        {value || '-'}
                      </dd>
                    </div>
                  ))}
                </div>
              </div>
            ) : localContent ? (
              /* Markdown 内容渲染 */
              <DocumentRenderer content={localContent} />
            ) : (
              /* 空状态 */
              <div className="text-center py-20">
                <p className="text-sm text-lab-muted">该文档暂无内容</p>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="mt-3 text-xs text-lab-accent-warm hover:text-lab-accent"
                >
                  开始编辑 →
                </button>
              </div>
            )}

            {/* 证据链面板 */}
            <EvidencePanel evidence={doc.evidence} />

            {/* 反链面板 */}
            <BacklinkPanel
              backlinks={doc.backlinks}
              references={doc.references}
              allDocsMap={buildAllDocsMap()}
              onNavigate={(id) => setActiveDocId(id)}
            />
          </div>
        )}
      </div>
    </div>
  )
}