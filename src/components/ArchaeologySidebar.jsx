import { useLab } from '../context/LabContext'

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1" />
      <path d="M6 3.5V6L8 7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ItemCountIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1" />
      <path d="M4.5 6L5.5 7L7.5 5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2.5 3.5H9.5M4.5 3.5V2.5C4.5 2.22386 4.72386 2 5 2H7C7.27614 2 7.5 2.22386 7.5 2.5V3.5M5 5.5V9M7 5.5V9M3 3.5L3.5 9.5C3.5 9.77614 3.72386 10 4 10H8C8.27614 10 8.5 9.77614 8.5 9.5L9 3.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function formatDate(isoString) {
  const d = new Date(isoString)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${month}/${day} ${hours}:${minutes}`
}

export default function ArchaeologySidebar({ compact = false }) {
  const {
    archaeologySessions,
    activeArchaeologyId,
    setActiveArchaeologyId,
    deleteArchaeologySession,
    switchLabMode
  } = useLab()

  const getItemCount = (session) => {
    if (!session) return 0
    const analysis = session.analysis || {}
    return (
      (analysis.timeline?.length || 0) +
      (analysis.turningPoints?.length || 0) +
      (analysis.blindSpots?.length || 0) +
      (analysis.assumptions?.length || 0) +
      (analysis.assets?.length || 0)
    )
  }

  if (compact) {
    return (
      <div
        className="h-full w-full flex flex-col overflow-hidden"
        style={{
          backgroundColor: '#FFFFFF'
        }}
      >
        <div className="px-3 pt-3 pb-1 flex items-center justify-between">
          <p className="text-[9px] tracking-wide uppercase" style={{ color: '#9CA3AF' }}>
            考古记录
          </p>
        </div>

        <div className="flex-1 overflow-auto px-2 pb-3">
          {(!archaeologySessions || archaeologySessions.length === 0) && (
            <div className="px-2 py-4 text-center">
              <p className="text-[10px] text-gray-300">暂无记录</p>
            </div>
          )}

          {(archaeologySessions || []).map((session, index) => {
            const isActive = activeArchaeologyId === session.id
            const itemCount = getItemCount(session)

            return (
              <div
                key={session.id}
                onClick={() => setActiveArchaeologyId(session.id)}
                className="px-2 py-1.5 rounded-lg cursor-pointer transition-colors mb-1 group relative"
                style={{
                  backgroundColor: isActive ? '#FEF3C7' : 'transparent',
                  border: isActive ? '1px solid #FCD34D' : '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = '#F9FAFB'
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[10px] font-medium truncate"
                      style={{ color: isActive ? '#92400E' : '#4B5563' }}
                    >
                      #{archaeologySessions.length - index}
                    </p>
                    {itemCount > 0 && (
                      <span className="text-[8px] text-amber-600">
                        {itemCount}个项目
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('确定要删除这条考古记录吗？')) {
                        deleteArchaeologySession(session.id)
                      }
                    }}
                    className="w-4 h-4 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                    style={{ color: '#9CA3AF' }}
                    title="删除"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div
      className="h-full w-full flex flex-col overflow-hidden"
      style={{
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #F3F4F6'
      }}
    >
      <div className="px-4 pt-4 pb-2 flex items-center justify-between border-b border-gray-50">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#D97706' }}>
            <span className="text-[9px] font-bold" style={{ color: '#FFFFFF' }}>TA</span>
          </span>
          <h1 className="text-xs font-semibold tracking-tight truncate" style={{ color: '#374151' }}>
            对话考古 V2
          </h1>
        </div>
      </div>

      <div className="px-4 pt-3 pb-2">
        <p className="text-[10px] tracking-wide" style={{ color: '#D1D5DB' }}>
          考古来源
        </p>
      </div>

      <div className="flex-1 overflow-auto px-2 pb-4">
        {(!archaeologySessions || archaeologySessions.length === 0) && (
          <div className="px-3 py-6 text-center">
            <p className="text-[11px] text-gray-400">暂无考古记录</p>
            <p className="text-[10px] text-gray-300 mt-1">在右侧创建新的考古会话开始分析</p>
          </div>
        )}

        {(archaeologySessions || []).map((session, index) => {
          const isActive = activeArchaeologyId === session.id
          const itemCount = getItemCount(session)

          return (
            <div
              key={session.id}
              onClick={() => setActiveArchaeologyId(session.id)}
              className="px-2 py-2 rounded-lg cursor-pointer transition-colors mb-1 group"
              style={{
                backgroundColor: isActive ? '#FEF3C7' : 'transparent',
                border: isActive ? '1px solid #FCD34D' : '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = '#F9FAFB'
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0 flex-1">
                  <p
                    className="text-[11px] font-medium truncate"
                    style={{ color: isActive ? '#92400E' : '#374151' }}
                  >
                    考古 #{(archaeologySessions || []).length - index}：{session.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                      <ClockIcon />
                      {formatDate(session.createdAt)}
                    </span>
                    {itemCount > 0 && (
                      <span className="text-[9px] text-amber-600 flex items-center gap-0.5">
                        <ItemCountIcon />
                        {itemCount} 个项目
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteArchaeologySession(session.id)
                  }}
                  className="w-5 h-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  style={{ color: '#9CA3AF' }}
                  title="删除"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-3 py-3 border-t border-gray-100">
        <button
          onClick={() => switchLabMode('live')}
          className="w-full py-2 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5"
          style={{
            backgroundColor: '#F3F4F6',
            color: '#6B7280'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#E5E7EB'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#F3F4F6'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M7.5 3L4.5 6L7.5 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          返回项目视图
        </button>
      </div>
    </div>
  )
}
