import { useLab } from '../context/LabContext'
import { useState, useEffect } from 'react'
import { archaeologyStore, store } from '../utils/dataStore'
import ArchaeologyInputArea from './ArchaeologyInputArea'
import ArchaeologyReportView from './ArchaeologyReportView'

export default function ArchaeologyV2() {
  const {
    archaeologySessions,
    activeArchaeologyId,
    setActiveArchaeologyId,
    createArchaeologySessionV2,
    deleteArchaeologySession
  } = useLab()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newSessionName, setNewSessionName] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const [archaeologyData, setArchaeologyData] = useState(() => {
    return archaeologyStore ? archaeologyStore.getAllSessions() : []
  })

  const refreshData = () => {
    setArchaeologyData(archaeologyStore.getAllSessions())
    setRefreshKey(prev => prev + 1)
  }

  const activeSession = archaeologyData.find(s => s.id === activeArchaeologyId)
  const [view, setView] = useState('review') // 'review' | 'report'

  // 计算所有已确认项目数量
  const getConfirmedCount = (session) => {
    if (!session || !session.analysis) return 0
    const dimensions = ['timeline', 'turningPoints', 'blindSpots', 'assumptions', 'assets']
    return dimensions.reduce((total, dim) => {
      const items = session.analysis[dim] || []
      return total + items.filter(i => i.status === 'confirmed').length
    }, 0)
  }

  const handleCreateSession = () => {
    if (newSessionName.trim()) {
      createArchaeologySessionV2(newSessionName.trim())
      setNewSessionName('')
      setShowCreateForm(false)
      refreshData()
    }
  }

  const handleUpdateItemStatus = (sessionId, dimension, itemId, status, editedContent) => {
    archaeologyStore.updateItemStatus(sessionId, dimension, itemId, status, editedContent)
    refreshData()
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* 左侧会话列表 */}
      <div style={{ width: 200, borderRight: '1px solid #eee', padding: 8, overflow: 'auto' }}>
        {showCreateForm ? (
          <div style={{ marginBottom: 8, padding: 8, background: '#f9fafb', borderRadius: 4 }}>
            <input
              type="text"
              placeholder="输入会话名称..."
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: 12, marginBottom: 6 }}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateSession()}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={handleCreateSession}
                style={{ flex: 1, padding: 6, background: '#10B981', color: 'white', border: 'none', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}
              >
                创建
              </button>
              <button
                onClick={() => { setShowCreateForm(false); setNewSessionName(''); }}
                style={{ padding: 6, background: '#6B7280', color: 'white', border: 'none', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setShowCreateForm(true)} 
            style={{ width: '100%', marginBottom: 8, padding: 8, background: '#10B981', color: 'white', border: 'none', borderRadius: 4, fontSize: 13, cursor: 'pointer' }}
          >
            + 新建考古会话
          </button>
        )}
        
        {(!archaeologySessions || archaeologySessions.length === 0) && (
          <div style={{ color: '#999', textAlign: 'center', padding: 20, fontSize: 12 }}>
            暂无考古会话<br/>点击上方新建
          </div>
        )}
        
        {(archaeologySessions || []).map(s => (
          <div
            key={s.id}
            onClick={() => setActiveArchaeologyId(s.id)}
            style={{
              padding: 8,
              marginBottom: 4,
              borderRadius: 4,
              cursor: 'pointer',
              background: s.id === activeArchaeologyId ? '#e0e7ff' : '#f9fafb'
            }}
          >
            <div style={{ fontWeight: 500, fontSize: 14 }}>{s.name}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              {s.conversationChunks.length}段对话 ·
              {s.status === 'analyzing' ? '分析中' : s.status === 'reviewing' ? '审核中' : '已归档'}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                deleteArchaeologySession(s.id)
                refreshData()
              }}
              style={{ fontSize: 11, color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', marginTop: 4 }}
            >
              删除
            </button>
          </div>
        ))}
      </div>

      {/* 右侧主内容 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!activeSession ? (
          <div className="h-full flex flex-col items-center justify-center p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">对话考古 V2</h2>
            <p className="text-gray-500 text-sm mb-6 text-center">
              从对话中提取时间轴、决策链、盲区、假设和知识资产<br/>
              支持迭代添加对话内容，每条结果可确认/驳回/编辑
            </p>
            <p className="text-gray-400 text-sm">请在左侧选择或创建一个考古会话</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{activeSession.name}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    创建于 {new Date(activeSession.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setView('review')}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                      view === 'review' 
                        ? 'bg-indigo-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    审阅
                  </button>
                  <button
                    onClick={() => setView('report')}
                    disabled={getConfirmedCount(activeSession) === 0}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                      view === 'report' 
                        ? 'bg-emerald-500 text-white' 
                        : getConfirmedCount(activeSession) > 0 
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    报告 ({getConfirmedCount(activeSession)})
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {activeSession.conversationChunks.length} 段对话
              </div>
            </div>

            {/* 使用新的 ArchaeologyInputArea 组件 */}
            <ArchaeologyInputArea
              sessionId={activeSession.id}
              onAnalysisComplete={refreshData}
            />

            <div className="flex-1 overflow-hidden">
              {view === 'review' ? (
                <div className="h-full overflow-auto p-6">
                  {/* 显示已添加的对话历史 */}
                  {activeSession.conversationChunks.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                        已添加的对话 ({activeSession.conversationChunks.length} 段)
                      </h3>
                      <div className="space-y-2">
                        {activeSession.conversationChunks.map((chunk, idx) => (
                          <div key={chunk.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500">对话 #{idx + 1}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(chunk.addedAt).toLocaleString('zh-CN')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                              {chunk.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 确认层：各维度结果 */}
                  <div className="space-y-6">
                    <AnalysisSection
                      title="时间轴"
                      dimension="timeline"
                      items={activeSession.analysis?.timeline || []}
                      sessionId={activeSession.id}
                      updateItemStatus={handleUpdateItemStatus}
                      color="#3B82F6"
                      renderItem={(item) => (
                        <>
                          <p className="font-medium text-sm">{item.stage}</p>
                          <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                          <p className="text-sm text-gray-600 mt-1">{item.decision}</p>
                        </>
                      )}
                    />

                    <AnalysisSection
                      title="决策链"
                      dimension="turningPoints"
                      items={activeSession.analysis?.turningPoints || []}
                      sessionId={activeSession.id}
                      updateItemStatus={handleUpdateItemStatus}
                      color="#10B981"
                      renderItem={(item) => (
                        <>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-1">触发: {item.trigger}</p>
                          <p className="text-sm text-gray-600 mt-1">最终选择: {item.finalChoice}</p>
                        </>
                      )}
                    />

                    <AnalysisSection
                      title="盲区图"
                      dimension="blindSpots"
                      items={activeSession.analysis?.blindSpots || []}
                      sessionId={activeSession.id}
                      updateItemStatus={handleUpdateItemStatus}
                      color="#EF4444"
                      renderItem={(item) => (
                        <>
                          <p className="font-medium text-sm">{item.question}</p>
                          <p className="text-xs text-gray-500 mt-1">重要性: {item.importance}</p>
                          <p className="text-sm text-gray-600 mt-1">建议: {item.suggestion}</p>
                        </>
                      )}
                    />

                    <AnalysisSection
                      title="假设清单"
                      dimension="assumptions"
                      items={activeSession.analysis?.assumptions || []}
                      sessionId={activeSession.id}
                      updateItemStatus={handleUpdateItemStatus}
                      color="#8B5CF6"
                      renderItem={(item) => (
                        <>
                          <p className="font-medium text-sm">{item.assumption}</p>
                          <p className="text-xs text-gray-500 mt-1">风险: {item.risk}</p>
                          <p className="text-sm text-gray-600 mt-1">验证: {item.validation}</p>
                        </>
                      )}
                    />

                    <AnalysisSection
                      title="知识资产"
                      dimension="assets"
                      items={activeSession.analysis?.assets || []}
                      sessionId={activeSession.id}
                      updateItemStatus={handleUpdateItemStatus}
                      color="#F59E0B"
                      renderItem={(item) => (
                        <>
                          <p className="font-medium text-sm">{item.content}</p>
                          <p className="text-xs text-gray-500 mt-1">类型: {item.type}</p>
                          <p className="text-xs text-amber-600 mt-1">
                            建议归档: {item.suggestedTemplate}
                          </p>
                        </>
                      )}
                    />
                  </div>
                </div>
              ) : (
                <ArchaeologyReportView
                  session={activeSession}
                  onBack={() => setView('review')}
                  onRefresh={refreshData}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function AnalysisSection({ title, dimension, items, sessionId, updateItemStatus, color, renderItem }) {
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')

  const handleConfirm = (itemId) => {
    updateItemStatus(sessionId, dimension, itemId, 'confirmed')
  }

  const handleReject = (itemId) => {
    updateItemStatus(sessionId, dimension, itemId, 'rejected')
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setEditContent(item.editedContent || JSON.stringify(item, null, 2))
  }

  const handleSaveEdit = (itemId) => {
    updateItemStatus(sessionId, dimension, itemId, 'confirmed', editContent)
    setEditingId(null)
    setEditContent('')
  }

  const pendingItems = items.filter(i => i.status === 'pending')
  const confirmedItems = items.filter(i => i.status === 'confirmed')
  const rejectedItems = items.filter(i => i.status === 'rejected')

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
        {title}
        <span className="text-xs text-gray-400 font-normal">
          ({pendingItems.length} 待确认 / {confirmedItems.length} 已确认 / {rejectedItems.length} 已驳回)
        </span>
      </h3>

      <div className="space-y-2">
        {pendingItems.map((item) => (
          <div key={item.id} className="p-3 bg-white rounded-lg border border-gray-200">
            {editingId === item.id ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-24 p-2 border border-gray-200 rounded text-xs mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(item.id)}
                    className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <>
                {renderItem(item)}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleConfirm(item.id)}
                    className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition-colors flex items-center gap-1"
                  >
                    <span>✓</span> 确认
                  </button>
                  <button
                    onClick={() => handleReject(item.id)}
                    className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-colors flex items-center gap-1"
                  >
                    <span>✗</span> 驳回
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    <span>✏️</span> 编辑
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {confirmedItems.map((item) => (
          <div key={item.id} className="p-3 rounded-lg border" style={{ backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-1.5 py-0.5 bg-green-200 text-green-700 rounded text-xs font-medium">✓ 已确认</span>
            </div>
            {renderItem(item)}
            {item.editedContent && (
              <div className="mt-2 p-2 bg-white rounded text-xs text-gray-600">
                <p className="font-medium text-gray-500 mb-1">编辑内容:</p>
                <pre className="whitespace-pre-wrap">{item.editedContent}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
