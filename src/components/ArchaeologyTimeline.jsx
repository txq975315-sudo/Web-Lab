import { useLab } from '../context/LabContext'
import { useState } from 'react'

// 六模块分类（与项目树 categoryType 对齐）
const MODULE_CATEGORIES = [
  { value: 'constitution', label: '01 项目宪法' },
  { value: 'market', label: '02 市场与用户洞察' },
  { value: 'strategy', label: '03 策略与增长' },
  { value: 'decision', label: '04 决策链图谱' },
  { value: 'antifragile', label: '05 反脆弱审计' },
  { value: 'roadmap', label: '06 执行路线图' }
]

function ChevronDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M3.5 2L6.5 5L3.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArchiveIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <path d="M1.5 4.5V10.5H10.5V4.5M1.5 1.5H10.5V4.5H1.5V1.5Z" stroke="currentColor" strokeWidth="1" />
      <line x1="4.5" y1="6.5" x2="7.5" y2="6.5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  )
}

const TIMELINE_NODE_TYPES = {
  hypothesis: { label: '初始假设', color: 'var(--color-accent-warm)', bg: 'var(--color-accent-dim)' },
  challenge: { label: '遭遇挑战', color: 'var(--color-error)', bg: 'var(--color-error-dim)' },
  revision: { label: '认知修正', color: 'var(--color-warning)', bg: 'var(--color-warning-dim)' },
  conclusion: { label: '收敛结论', color: 'var(--color-success)', bg: 'var(--color-success-dim)' },
}

const DIMENSION_LABELS = {
  business: '商业',
  product: '产品',
  society: '社会'
}

function TimelineNode({ node, isLast }) {
  const [expanded, setExpanded] = useState(false)
  const config = TIMELINE_NODE_TYPES[node.type] || TIMELINE_NODE_TYPES.hypothesis

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: config.bg, border: `2px solid ${config.color}` }}
        >
          <span className="text-[9px] font-bold" style={{ color: config.color }}>
            {node.type === 'hypothesis' ? 'H' : node.type === 'challenge' ? 'C' : node.type === 'revision' ? 'R' : '✓'}
          </span>
        </div>
        {!isLast && (
          <div className="w-px flex-1 min-h-[16px]" style={{ backgroundColor: 'var(--color-border-default)' }} />
        )}
      </div>

      <div className="flex-1 pb-4">
        <div
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 cursor-pointer group"
        >
          {expanded ? <ChevronDown /> : <ChevronRight />}
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: config.bg, color: config.color }}>
            {config.label}
          </span>
          {node.dimension && (
            <span className="text-[9px] text-lab-muted">
              {DIMENSION_LABELS[node.dimension] || node.dimension}
            </span>
          )}
        </div>

        {expanded && (
          <div className="mt-2 ml-5 p-3 rounded-lg border border-lab-border-subtle" style={{ backgroundColor: 'var(--color-bg-raised)' }}>
            {node.quote && (
              <blockquote className="text-[11px] text-lab-muted italic border-l-2 border-lab-border pl-2 mb-2">
                "{node.quote}"
              </blockquote>
            )}
            <p className="text-[11px] text-lab-ink">{node.summary}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ExtractionCard({ title, items, color, bg, borderColor, onArchive }) {
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('market')
  const [selectedDocId, setSelectedDocId] = useState(null)
  const [selectedFieldKey, setSelectedFieldKey] = useState(null)
  const [pendingItem, setPendingItem] = useState(null)
  const [archiveSuccess, setArchiveSuccess] = useState(null)
  const { projectTree, archiveToProject, highlightNodeAfterRender, activeArchaeologyId, setActiveDocId, labMode, findNodeById, appendContentToDocument } = useLab()

  const getProjectDocs = (projectId) => {
    const project = projectTree.find(p => p.id === projectId)
    if (!project || !project.children) return []
    const docs = []
    const walk = (nodes) => {
      for (const node of nodes) {
        if (node.type === 'document') docs.push(node)
        if (node.children) walk(node.children)
      }
    }
    for (const cat of project.children) {
      if (cat.children) walk(cat.children)
    }
    return docs
  }

  const handleArchive = (item) => {
    if (!selectedProjectId) {
      setPendingItem(item)
      setShowProjectPicker(true)
      return
    }
    const result = archiveToProject(activeArchaeologyId, item, selectedProjectId, selectedCategory)
    if (result && result.newDocId) {
      const projectName = projectTree.find(p => p.id === selectedProjectId)?.name || ''
      const categoryName = MODULE_CATEGORIES.find(c => c.value === selectedCategory)?.label || selectedCategory
      setArchiveSuccess({ projectName, categoryName, itemText: item.text || item.decision || item.item || '内容' })
      setTimeout(() => setArchiveSuccess(null), 3000)
    } else {
      console.warn('Archive failed: no document created')
    }
    setShowProjectPicker(false)
    setSelectedProjectId(null)
    setSelectedDocId(null)
    setSelectedFieldKey(null)
    setPendingItem(null)
  }

  const handleDirectArchive = async (item, docId, fieldKey) => {
    const content = item.text || item.decision || item.item || item.area || item.summary || JSON.stringify(item)
    const doc = findNodeById(docId)
    if (!doc) return
    
    const itemType = item.decision ? '决策' : item.item ? '待办' : item.area ? '盲区' : '考古内容'
    const structuredContent = `${itemType}：${content}${item.rationale ? '\n理由：' + item.rationale : ''}${item.priority ? '\n优先级：' + item.priority : ''}`
    
    appendContentToDocument(docId, structuredContent, fieldKey, false, {
      projectId: activeArchaeologyId,
      timestamp: new Date().toLocaleString('zh-CN')
    })
    
    const projectName = projectTree.find(p => p.children?.some(c => c.children?.some(d => d.id === docId)))?.name || ''
    setArchiveSuccess({ projectName, categoryName: doc.name, itemText: content.slice(0, 20) + '...' })
    setTimeout(() => setArchiveSuccess(null), 3000)
  }

  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: bg, border: `1px solid ${borderColor}` }}>
      {archiveSuccess && (
        <div
          className="mb-2 px-2 py-1.5 rounded-lg text-[10px] font-medium flex items-center gap-1.5 border"
          style={{
            backgroundColor: 'var(--color-success-dim)',
            color: 'var(--color-text-success)',
            borderColor: 'var(--color-border-subtle)',
          }}
        >
          ✅ 已归档到 <span className="font-semibold">{archiveSuccess.projectName}</span> → <span>{archiveSuccess.categoryName}</span>
        </div>
      )}
      <h4 className="text-[11px] font-semibold mb-2 flex items-center gap-1.5" style={{ color }}>
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: color,
          flexShrink: 0
        }} />
        {title}
        <span className="text-[10px] font-normal ml-auto text-lab-muted">
          {items.length}
        </span>
      </h4>

      {items.length === 0 && (
        <p className="text-[10px] text-lab-muted">暂无提取内容</p>
      )}

      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="p-2 rounded-lg bg-lab-overlay border border-lab-border-subtle">
            <p className="text-[11px] text-lab-ink leading-relaxed">{item.text || item.decision || item.item || item.area || item.summary || '未提取到内容'}</p>
            {item.rationale && (
              <p className="text-[10px] text-lab-muted mt-1 italic">理由：{item.rationale}</p>
            )}
            <div className="mt-1.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleArchive(item)}
                className="text-[10px] font-medium flex items-center gap-1 transition-colors hover:opacity-80"
                style={{ color }}
              >
                <ArchiveIcon />
                新建文档
              </button>
            </div>
          </div>
        ))}
      </div>

      {showProjectPicker && (
        <div className="mt-2 p-2 rounded-lg bg-lab-overlay border border-lab-border-subtle">
          <p className="text-[10px] text-lab-muted mb-1.5">选择目标项目</p>
          <div className="space-y-1 mb-2 max-h-24 overflow-y-auto">
            {projectTree.map(project => (
              <button
                type="button"
                key={project.id}
                onClick={() => {
                  setSelectedProjectId(project.id)
                  setSelectedDocId(null)
                  setSelectedFieldKey(null)
                }}
                className="w-full text-left px-2 py-1 rounded text-[11px] transition-colors"
                style={{
                  backgroundColor: selectedProjectId === project.id ? 'var(--color-accent-dim)' : 'transparent',
                  color: selectedProjectId === project.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                }}
              >
                {project.name}
              </button>
            ))}
          </div>
          {selectedProjectId && (
            <>
              <p className="text-[10px] text-lab-muted mb-1">分类</p>
              <div className="relative mb-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value)
                    setSelectedDocId(null)
                    setSelectedFieldKey(null)
                  }}
                  className="w-full px-2 py-1 text-[10px] bg-lab-raised rounded-lg border border-lab-border-subtle outline-none focus-visible:ring-2 focus-visible:ring-lab-accent cursor-pointer appearance-none text-lab-ink"
                  style={{ paddingRight: '20px' }}
                >
                  {MODULE_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-lab-muted">
                  <ChevronDown />
                </div>
              </div>
              
              <p className="text-[10px] text-lab-muted mb-1">或直接归档到已有文档</p>
              <div className="space-y-1 mb-2 max-h-24 overflow-y-auto">
                {getProjectDocs(selectedProjectId).slice(0, 10).map(doc => (
                  <button
                    type="button"
                    key={doc.id}
                    onClick={() => {
                      setSelectedDocId(doc.id)
                      setSelectedCategory(null)
                    }}
                    className="w-full text-left px-2 py-1 rounded text-[10px] transition-colors truncate"
                    style={{
                      backgroundColor: selectedDocId === doc.id ? 'var(--color-accent-dim)' : 'transparent',
                      color: selectedDocId === doc.id ? 'var(--color-accent-warm)' : 'var(--color-text-secondary)',
                    }}
                  >
                    {doc.name || '未命名文档'}
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="flex gap-1.5 mt-2">
            <button
              type="button"
              onClick={() => {
                setShowProjectPicker(false)
                setSelectedProjectId(null)
                setSelectedDocId(null)
                setSelectedFieldKey(null)
                setPendingItem(null)
              }}
              className="flex-1 py-1 rounded text-[10px] text-lab-muted hover:bg-lab-accent-dim"
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => {
                if (pendingItem) {
                  if (selectedDocId) {
                    handleDirectArchive(pendingItem, selectedDocId, selectedFieldKey)
                    setShowProjectPicker(false)
                  } else {
                    handleArchive(pendingItem)
                  }
                }
              }}
              className="flex-1 py-1 rounded text-[10px] font-medium text-[color:var(--color-text-inverted)]"
              style={{ backgroundColor: color }}
              disabled={!pendingItem || (!selectedProjectId && !selectedDocId)}
            >
              {selectedDocId ? '追加到文档' : '创建新文档'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ArchaeologyTimeline() {
  const { archaeologySessions, activeArchaeologyId } = useLab()

  const session = archaeologySessions.find(s => s.id === activeArchaeologyId)

  if (!session) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-lab-muted mb-1">选择一个考古记录</p>
          <p className="text-[11px] text-lab-faint">或粘贴对话记录开始新的分析</p>
        </div>
      </div>
    )
  }

  const hasTimeline = session.timeline && session.timeline.length > 0

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-lab-border-subtle flex-shrink-0 bg-lab-overlay">
        <h2 className="text-sm font-semibold font-display text-lab-ink">{session.title}</h2>
        <p className="text-[10px] text-lab-muted mt-0.5">
          分析于 {new Date(session.analyzedAt).toLocaleString('zh-CN')}
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex gap-6 p-6" style={{ minHeight: '100%' }}>
          <div className="flex-1 min-w-0">
            <h3 className="text-[11px] font-semibold text-lab-muted mb-4 tracking-wide">
              认知地层时间轴
            </h3>

            {!hasTimeline ? (
              <div className="p-6 text-center rounded-xl border border-lab-border-subtle bg-lab-raised">
                <p className="text-[11px] text-lab-muted">分析中...</p>
                <p className="text-[10px] text-lab-faint mt-1">正在提取认知地层结构</p>
              </div>
            ) : (
              <div>
                {session.timeline.map((node, i) => (
                  <TimelineNode
                    key={i}
                    node={node}
                    isLast={i === session.timeline.length - 1}
                  />
                ))}
              </div>
            )}

            {session.rawText && (
              <div className="mt-6">
                <h3 className="text-[11px] font-semibold text-lab-muted mb-3 tracking-wide">
                  原始对话
                </h3>
                <div
                  className="p-4 rounded-xl text-[11px] text-lab-ink leading-relaxed whitespace-pre-wrap border border-lab-border-subtle bg-lab-raised"
                  style={{ maxHeight: '300px', overflow: 'auto' }}
                >
                  {session.rawText}
                </div>
              </div>
            )}
          </div>

          <div className="w-[240px] flex-shrink-0 space-y-3">
            <ExtractionCard
              title="决策节点"
              items={session.decisions || []}
              color="var(--color-success)"
              bg="var(--color-success-dim)"
              borderColor="var(--color-border-subtle)"
            />
            <ExtractionCard
              title="认知盲区"
              items={session.blindSpots || []}
              color="var(--color-error)"
              bg="var(--color-error-dim)"
              borderColor="var(--color-border-subtle)"
            />
            <ExtractionCard
              title="待办考古"
              items={session.actionItems || []}
              color="var(--color-warning)"
              bg="var(--color-warning-dim)"
              borderColor="var(--color-border-subtle)"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
