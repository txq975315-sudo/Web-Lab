import { useLab } from '../context/LabContext'
import { useState } from 'react'

export default function ChatHistorySidebar({ setMessages, setInputValue }) {
  const { 
    activeProjectId, 
    allHistoryMessages, 
    currentSessionId, 
    viewingHistorySessionId, 
    setViewingHistorySessionId, 
    startNewSession,
    chatSessions,
    deleteChatSession,
    renameChatSession
  } = useLab()
  
  const [editingSessionId, setEditingSessionId] = useState(null)
  const [editName, setEditName] = useState('')
  const [isExpanded, setIsExpanded] = useState(true)

  const projectSessions = chatSessions[activeProjectId] || []
  
  const startNewChat = () => {
    const newSessionId = startNewSession()
    setViewingHistorySessionId(null)
    setMessages([])
    setInputValue('')
  }

  const viewSession = (sessionId) => {
    if (sessionId === viewingHistorySessionId) {
      setViewingHistorySessionId(null)
      setMessages([])
    } else {
      setViewingHistorySessionId(sessionId)
      const historyMessages = allHistoryMessages[activeProjectId]?.[sessionId] || []
      setMessages(historyMessages)
    }
  }

  const handleDelete = (e, sessionId) => {
    e.stopPropagation()
    if (confirm('确定要删除这个会话吗？')) {
      deleteChatSession(sessionId)
      if (viewingHistorySessionId === sessionId) {
        setViewingHistorySessionId(null)
        setMessages([])
      }
    }
  }

  const handleRename = (e, sessionId) => {
    e.stopPropagation()
    setEditingSessionId(sessionId)
    const session = projectSessions.find(s => s.id === sessionId)
    setEditName(session?.title || '')
  }

  const handleSaveRename = (sessionId) => {
    if (editName.trim()) {
      renameChatSession(sessionId, editName.trim())
    }
    setEditingSessionId(null)
  }

  const handleKeyDown = (e, sessionId) => {
    if (e.key === 'Enter') {
      handleSaveRename(sessionId)
    } else if (e.key === 'Escape') {
      setEditingSessionId(null)
    }
  }

  // 收起状态的极简样式
  if (!isExpanded) {
    return (
      <div 
        className="h-full flex flex-col items-center justify-start py-4"
        style={{
          width: '60px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderLeft: '1px solid rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* 展开按钮 */}
        <button
          onClick={() => setIsExpanded(true)}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-gray-100 mb-2"
          title="展开历史记录"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7 4L13 10L7 16" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        {/* 新对话按钮 */}
        <button
          onClick={startNewChat}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-gray-100 mb-4"
          title="新建对话"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4V16M4 10H16" stroke="#667eea" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        
        {/* 会话图标列表 */}
        <div className="flex-1 flex flex-col items-center space-y-2 w-full">
          {projectSessions.slice(0, 8).map((session, index) => {
            const isActive = session.id === currentSessionId && !viewingHistorySessionId
            const isViewing = session.id === viewingHistorySessionId
            
            return (
              <button
                key={session.id}
                onClick={() => viewSession(session.id)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-medium transition-all ${
                  isActive || isViewing
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={session.title}
              >
                {session.title.charAt(0).toUpperCase()}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // 展开状态的完整样式
  return (
    <div 
      className="h-full flex flex-col"
      style={{
        width: '260px',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderLeft: '1px solid rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* 头部 */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 1.5L16.5 6V15H1.5V6L9 1.5Z" stroke="#667eea" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 15V9H6V15" stroke="#667eea" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3 className="text-sm font-semibold text-gray-800">对话历史</h3>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          title="收起"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L6 10L12 16" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* 新对话按钮 */}
      <div className="px-4 py-2">
        <button
          onClick={startNewChat}
          className="w-full py-2.5 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
          style={{
            backgroundColor: '#667eea',
            color: 'white',
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.25)'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V13M3 8H13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          新对话
        </button>
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {projectSessions.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-2 opacity-50">
              <path d="M16 4L28 10V26L16 32L4 26V10L16 4Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 26V18H20V26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            开始你的第一个对话吧
          </div>
        ) : (
          projectSessions.map((session) => {
            const isActive = session.id === currentSessionId && !viewingHistorySessionId
            const isViewing = session.id === viewingHistorySessionId
            
            return (
              <div
                key={session.id}
                onClick={() => viewSession(session.id)}
                className={`group p-3 rounded-xl cursor-pointer transition-all border ${
                  isActive || isViewing
                    ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'
                    : 'bg-transparent border-transparent hover:bg-gray-50'
                }`}
              >
                {editingSessionId === session.id ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleSaveRename(session.id)}
                    onKeyDown={(e) => handleKeyDown(e, session.id)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800 focus:outline-none focus:border-purple-400"
                    autoFocus
                  />
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium truncate ${
                          isActive || isViewing ? 'text-purple-700' : 'text-gray-700'
                        }`}>
                          {session.title}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(session.createdAt).toLocaleDateString('zh-CN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <button
                          onClick={(e) => handleRename(e, session.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                          title="重命名"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2 10.5V12.5H4L10.5 5.5L8.5 3.5L2 10.5Z" stroke="#667eea" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, session.id)}
                          className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                          title="删除"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M4 4L10 10M10 4L4 10" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      {session.messageCount || 0} 条消息
                    </div>
                  </>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* 底部按钮 - 查看历史会话时显示 */}
      {viewingHistorySessionId && (
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={startNewChat}
            className="w-full py-2 px-3 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: '#f3f4f6',
              color: '#4B5563'
            }}
          >
            开始新对话
          </button>
        </div>
      )}
    </div>
  )
}
