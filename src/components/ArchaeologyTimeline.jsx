import { useLab } from '../context/LabContext'
import { useState } from 'react'

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
  hypothesis: { label: '初始假设', color: '#8B5CF6', bg: '#F5F3FF' },
  challenge: { label: '遭遇挑战', color: '#EF4444', bg: '#FEF2F2' },
  revision: { label: '认知修正', color: '#F59E0B', bg: '#FFFBEB' },
  conclusion: { label: '收敛结论', color: '#10B981', bg: '#ECFDF5' }
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
          <div className="w-px flex-1 min-h-[16px]" style={{ backgroundColor: '#E5E7EB' }} />
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
            <span className="text-[9px] text-gray-400">
              {DIMENSION_LABELS[node.dimension] || node.dimension}
            </span>
          )}
        </div>

        {expanded && (
          <div className="mt-2 ml-5 p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
            {node.quote && (
              <blockquote className="text-[11px] text-gray-500 italic border-l-2 border-gray-200 pl-2 mb-2">
                "{node.quote}"
              </blockquote>
            )}
            <p className="text-[11px] text-gray-600">{node.summary}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ExtractionCard({ title, items, color, bg, borderColor, onArchive }) {
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('insight')
  const { projectTree, archiveToProject, highlightNodeAfterRender, activeArchaeologyId, setActiveDocId, labMode } = useLab()

  const handleArchive = (item) => {
    if (!selectedProjectId) {
      setShowProjectPicker(true)
      return
    }
    const result = archiveToProject(activeArchaeologyId, item, selectedProjectId, selectedCategory)
    if (result.newDocId) {
      const projectName = projectTree.find(p => p.id === selectedProjectId)?.name || ''
      const categoryName = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
      highlightNodeAfterRender(result.newDocId, () => {
        setActiveDocId(result.newDocId)
      })
    }
    setShowProjectPicker(false)
    setSelectedProjectId(null)
  }

  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: bg, border: `1px solid ${borderColor}` }}>
      <h4 className="text-[11px] font-semibold mb-2 flex items-center gap-1.5" style={{ color }}>
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: color,
          flexShrink: 0
        }} />
        {title}
        <span className="text-[10px] font-normal ml-auto" style={{ color: '#9CA3AF' }}>
          {items.length}
        </span>
      </h4>

      {items.length === 0 && (
        <p className="text-[10px] text-gray-400">暂无提取内容</p>
      )}

      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="p-2 rounded-lg" style={{ backgroundColor: '#FFFFFF' }}>
            <p className="text-[11px] text-gray-700 leading-relaxed">{item.text || item.summary}</p>
            <button
              onClick={() => handleArchive(item)}
              className="mt-1.5 text-[10px] font-medium flex items-center gap-1 transition-colors hover:opacity-80"
              style={{ color }}
            >
              <ArchiveIcon />
              归档到项目
            </button>
          </div>
        ))}
      </div>

      {showProjectPicker && (
        <div className="mt-2 p-2 rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
          <p className="text-[10px] text-gray-400 mb-1.5">选择目标项目</p>
          <div className="space-y-1 mb-2">
            {projectTree.map(project => (
              <button
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className="w-full text-left px-2 py-1 rounded text-[11px] transition-colors"
                style={{
                  backgroundColor: selectedProjectId === project.id ? '#F3F4F6' : 'transparent',
                  color: selectedProjectId === project.id ? '#111827' : '#6B7280'
                }}
              >
                {project.name}
              </button>
            ))}
          </div>
          {selectedProjectId && (
            <>
              <p className="text-[10px] text-gray-400 mb-1">挂载节点</p>
              <div className="flex gap-1">
                {['insight', 'archive', 'decision'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="px-2 py-1 rounded text-[10px] transition-colors"
                    style={{
                      backgroundColor: selectedCategory === cat ? '#F3F4F6' : 'transparent',
                      color: selectedCategory === cat ? '#111827' : '#9CA3AF'
                    }}
                  >
                    {cat === 'insight' ? 'Insight' : cat === 'archive' ? 'Archive' : 'Decision'}
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="flex gap-1.5 mt-2">
            <button
              onClick={() => setShowProjectPicker(false)}
              className="flex-1 py-1 rounded text-[10px] text-gray-500 hover:bg-gray-100"
            >
              取消
            </button>
            <button
              onClick={() => {
                if (selectedProjectId) {
                  handleArchive({})
                  setShowProjectPicker(false)
                }
              }}
              className="flex-1 py-1 rounded text-[10px] font-medium text-white"
              style={{ backgroundColor: color }}
              disabled={!selectedProjectId}
            >
              确认归档
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
          <p className="text-sm text-gray-400 mb-1">选择一个考古记录</p>
          <p className="text-[11px] text-gray-300">或粘贴对话记录开始新的分析</p>
        </div>
      </div>
    )
  }

  const hasTimeline = session.timeline && session.timeline.length > 0

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
        <h2 className="text-sm font-semibold text-gray-800">{session.title}</h2>
        <p className="text-[10px] text-gray-400 mt-0.5">
          分析于 {new Date(session.analyzedAt).toLocaleString('zh-CN')}
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex gap-6 p-6" style={{ minHeight: '100%' }}>
          <div className="flex-1 min-w-0">
            <h3 className="text-[11px] font-semibold text-gray-500 mb-4 tracking-wide">
              认知地层时间轴
            </h3>

            {!hasTimeline ? (
              <div className="p-6 text-center rounded-xl" style={{ backgroundColor: '#F9FAFB' }}>
                <p className="text-[11px] text-gray-400">分析中...</p>
                <p className="text-[10px] text-gray-300 mt-1">正在提取认知地层结构</p>
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
                <h3 className="text-[11px] font-semibold text-gray-500 mb-3 tracking-wide">
                  原始对话
                </h3>
                <div
                  className="p-4 rounded-xl text-[11px] text-gray-600 leading-relaxed whitespace-pre-wrap"
                  style={{ backgroundColor: '#F9FAFB', maxHeight: '300px', overflow: 'auto' }}
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
              color="#059669"
              bg="#ECFDF5"
              borderColor="#A7F3D0"
            />
            <ExtractionCard
              title="认知盲区"
              items={session.blindSpots || []}
              color="#DC2626"
              bg="#FEF2F2"
              borderColor="#FECACA"
            />
            <ExtractionCard
              title="待办考古"
              items={session.actionItems || []}
              color="#D97706"
              bg="#FFFBEB"
              borderColor="#FCD34D"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
