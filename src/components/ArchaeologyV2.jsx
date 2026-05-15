import { useLab } from '../context/LabContext'
import { useState, useEffect } from 'react'
import { archaeologyStore } from '../utils/dataStore'
import ArchaeologyInputArea from './ArchaeologyInputArea'
import ArchaeologyReportView from './ArchaeologyReportView'

export default function ArchaeologyV2({ variant = 'full' }) {
  const inline = variant === 'inline'
  const {
    archaeologySessions,
    activeArchaeologyId,
    setActiveArchaeologyId,
    createArchaeologySessionV2,
    deleteArchaeologySession
  } = useLab()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newSessionName, setNewSessionName] = useState('')
  const [archaeologyData, setArchaeologyData] = useState(() => {
    return archaeologyStore ? archaeologyStore.getAllSessions() : []
  })

  const refreshData = () => {
    setArchaeologyData(archaeologyStore.getAllSessions())
  }

  const activeSession = archaeologyData.find(s => s.id === activeArchaeologyId)

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

  return inline ? (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {/* 行内模式：紧凑会话选择器 + 主舞台 */}
      <div className="flex flex-shrink-0 items-center gap-2 border-b border-lab-border-subtle bg-transparent px-3 py-2">
        <select
          value={activeArchaeologyId || ''}
          onChange={(e) => { setActiveArchaeologyId(e.target.value || null); refreshData() }}
          className="max-w-[180px] truncate rounded-lg border border-lab-border-subtle bg-lab-raised px-2 py-1 text-xs text-lab-ink outline-none"
        >
          <option value="">选择会话...</option>
          {(archaeologySessions || []).map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => { createArchaeologySessionV2('新考古会话'); refreshData() }}
          className="shrink-0 rounded-md bg-lab-accent px-2 py-1 text-xs text-[var(--color-text-inverted)] hover:opacity-92"
        >
          + 新建
        </button>
      </div>

      {/* 主舞台 */}
       <div className="wb-arch-middle-shift flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
         {!activeSession ? (
           <div className="flex h-full flex-col items-center justify-center bg-lab-base p-6">
             <h2 className="mb-2 font-display text-xl font-semibold text-lab-ink">对话考古</h2>
             <p className="mb-6 max-w-md text-center text-sm text-lab-muted">
               从对话中提取时间轴、决策链、盲区、假设和知识资产<br />
               支持迭代添加对话内容，每条结果可确认/驳回/编辑
             </p>
             <p className="text-sm text-lab-faint">请在左侧选择或创建一个考古会话</p>
           </div>
         ) : (
           <>
             <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border-b border-lab-border-subtle bg-transparent px-4 py-2 md:px-6">
               <div className="min-w-0">
                 <h2 className="truncate font-display text-sm font-semibold text-lab-ink">{activeSession.name}</h2>
                 <p className="text-xs text-lab-muted">
                   已确认 <span className="font-medium text-lab-accent-warm">{getConfirmedCount(activeSession)}</span> 条 · {activeSession.conversationChunks.length} 段对话
                 </p>
               </div>
             </div>

             <ArchaeologyInputArea sessionId={activeSession.id} onAnalysisComplete={refreshData} />

             <div className="min-h-0 flex-1 overflow-hidden">
               <div className="h-full overflow-auto p-4 md:p-6">
                   {activeSession.conversationChunks.length > 0 && (
                     <div className="mb-6">
                       <h3 className="text-sm font-semibold font-display text-lab-ink mb-3 flex items-center gap-2">
                         <span className="w-2 h-2 bg-lab-warning rounded-full" />
                         已添加的对话 ({activeSession.conversationChunks.length} 段)
                       </h3>
                       <div className="space-y-2">
                         {activeSession.conversationChunks.map((chunk, idx) => (
                           <div key={chunk.id} className="p-3 bg-lab-raised rounded-lg border border-lab-border-subtle">
                             <div className="flex items-center justify-between mb-1">
                               <span className="text-xs text-lab-muted">对话 #{idx + 1}</span>
                               <span className="text-xs text-lab-faint">
                                 {new Date(chunk.addedAt).toLocaleString('zh-CN')}
                               </span>
                             </div>
                             <p className="text-sm text-lab-ink whitespace-pre-wrap line-clamp-3">
                               {chunk.content}
                             </p>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   <div className="space-y-6">
                     <AnalysisSection title="时间轴" dimension="timeline" items={activeSession.analysis?.timeline || []} sessionId={activeSession.id} updateItemStatus={handleUpdateItemStatus} color="var(--color-accent-blue)" renderItem={(item) => (<><p className="font-medium text-sm">{item.stage}</p><p className="text-xs text-lab-muted mt-1">{item.date}</p><p className="text-sm text-lab-ink mt-1">{item.decision}</p></>)} />
                     <AnalysisSection title="决策链" dimension="turningPoints" items={activeSession.analysis?.turningPoints || []} sessionId={activeSession.id} updateItemStatus={handleUpdateItemStatus} color="var(--color-success)" renderItem={(item) => (<><p className="font-medium text-sm">{item.name}</p><p className="text-xs text-lab-muted mt-1">触发: {item.trigger}</p><p className="text-sm text-lab-ink mt-1">最终选择: {item.finalChoice}</p></>)} />
                     <AnalysisSection title="盲区图" dimension="blindSpots" items={activeSession.analysis?.blindSpots || []} sessionId={activeSession.id} updateItemStatus={handleUpdateItemStatus} color="var(--color-error)" renderItem={(item) => (<><p className="font-medium text-sm">{item.question}</p><p className="text-xs text-lab-muted mt-1">重要性: {item.importance}</p><p className="text-sm text-lab-ink mt-1">建议: {item.suggestion}</p></>)} />
                     <AnalysisSection title="假设清单" dimension="assumptions" items={activeSession.analysis?.assumptions || []} sessionId={activeSession.id} updateItemStatus={handleUpdateItemStatus} color="var(--color-accent-warm)" renderItem={(item) => (<><p className="font-medium text-sm">{item.assumption}</p><p className="text-xs text-lab-muted mt-1">风险: {item.risk}</p><p className="text-sm text-lab-ink mt-1">验证: {item.validation}</p></>)} />
                     <AnalysisSection title="知识资产" dimension="assets" items={activeSession.analysis?.assets || []} sessionId={activeSession.id} updateItemStatus={handleUpdateItemStatus} color="var(--color-warning)" renderItem={(item) => (<><p className="font-medium text-sm">{item.content}</p><p className="text-xs text-lab-muted mt-1">类型: {item.type}</p><p className="text-xs text-lab-warning mt-1">建议归档: {item.suggestedTemplate}</p></>)} />
                   </div>
                 </div>
             </div>
           </>
         )}
       </div>
     </div>
   ) : (
     <div className="wb-lab-bridge flex h-full min-h-0 flex-col overflow-hidden lg:flex-row">
       {/* 左侧会话列表 */}
       <div className="max-h-[38vh] shrink-0 overflow-auto border-b border-lab-border-subtle bg-lab-raised p-2 lg:h-auto lg:max-h-none lg:w-52 lg:border-b-0 lg:border-r">
         {showCreateForm ? (
           <div className="mb-2 p-2 rounded-md bg-lab-overlay border border-lab-border-subtle">
             <input
               type="text"
               placeholder="输入会话名称..."
               value={newSessionName}
               onChange={(e) => setNewSessionName(e.target.value)}
               className="w-full px-1.5 py-1.5 mb-1.5 text-xs border border-lab-border-subtle rounded bg-lab-overlay text-lab-ink outline-none focus:border-lab-accent"
               onKeyDown={(e) => e.key === 'Enter' && handleCreateSession()}
               autoFocus
             />
             <div className="flex gap-1">
               <button
                 type="button"
                 onClick={handleCreateSession}
                 className="flex-1 py-1.5 text-xs rounded bg-lab-success text-[color:var(--color-text-inverted)] hover:opacity-92"
               >
                 创建
               </button>
               <button
                 type="button"
                 onClick={() => { setShowCreateForm(false); setNewSessionName(''); }}
                 className="px-2 py-1.5 text-xs rounded border border-lab-border-subtle bg-lab-raised text-lab-ink hover:bg-lab-accent-dim"
               >
                 取消
               </button>
             </div>
           </div>
         ) : (
           <button
             type="button"
             onClick={() => setShowCreateForm(true)}
             className="w-full mb-2 py-2 rounded-md text-xs font-medium bg-lab-success text-[color:var(--color-text-inverted)] hover:opacity-92"
           >
             + 新建考古会话
           </button>
         )}

         {(!archaeologySessions || archaeologySessions.length === 0) && (
           <div className="text-center py-5 px-2 text-xs text-lab-muted">
             暂无考古会话<br />点击上方新建
           </div>
         )}

         {(archaeologySessions || []).map(s => (
           <div
             key={s.id}
             role="button"
             tabIndex={0}
             onClick={() => setActiveArchaeologyId(s.id)}
             onKeyDown={(e) => e.key === 'Enter' && setActiveArchaeologyId(s.id)}
             className={`p-2 mb-1 rounded cursor-pointer border transition-colors ${
               s.id === activeArchaeologyId
                 ? 'bg-lab-accent-dim border-lab-accent'
                 : 'bg-lab-overlay border-transparent hover:bg-lab-accent-dim/60'
             }`}
           >
             <div className="font-medium text-sm text-lab-ink">{s.name}</div>
             <div className="text-xs text-lab-muted mt-1">
               {s.conversationChunks.length}段对话 ·
               {s.status === 'analyzing' ? '分析中' : s.status === 'reviewing' ? '审核中' : '已归档'}
             </div>
             <button
               type="button"
               onClick={(e) => {
                 e.stopPropagation()
                 deleteArchaeologySession(s.id)
                 refreshData()
               }}
               className="mt-1 text-[11px] text-lab-error bg-transparent border-none cursor-pointer hover:underline"
             >
               删除
             </button>
           </div>
         ))}
       </div>

       {/* 中间：五维审阅主舞台 */}
       <div className="wb-arch-middle-shift flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-lab-border-subtle lg:border-r">
        {!activeSession ? (
          <div className="flex h-full flex-col items-center justify-center bg-lab-base p-6">
            <h2 className="mb-2 font-display text-xl font-semibold text-lab-ink">对话考古</h2>
            <p className="mb-6 max-w-md text-center text-sm text-lab-muted">
              从对话中提取时间轴、决策链、盲区、假设和知识资产<br />
              支持迭代添加对话内容，每条结果可确认/驳回/编辑
            </p>
            <p className="text-sm text-lab-faint">请在左侧选择或创建一个考古会话</p>
          </div>
        ) : (
          <>
            <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border-b border-lab-border-subtle bg-lab-overlay px-6 py-3 md:px-8">
              <div className="min-w-0">
                <h2 className="truncate font-display text-base font-semibold text-lab-ink md:text-lg">{activeSession.name}</h2>
                <p className="mt-0.5 text-xs text-lab-muted">
                  创建于 {new Date(activeSession.createdAt).toLocaleString('zh-CN')} · 已确认{' '}
                  <span className="font-medium text-lab-accent-warm">{getConfirmedCount(activeSession)}</span> 条 ·{' '}
                  {activeSession.conversationChunks.length} 段对话
                </p>
              </div>
              <p className="hidden text-xs text-lab-faint lg:inline">宽屏下右侧为报告预览与归档</p>
            </div>

            <ArchaeologyInputArea sessionId={activeSession.id} onAnalysisComplete={refreshData} />

            <div className="min-h-0 flex-1 overflow-hidden">
              <div className="h-full overflow-auto p-6 md:p-8">
                  {/* 显示已添加的对话历史 */}
                  {activeSession.conversationChunks.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold font-display text-lab-ink mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-lab-warning rounded-full" />
                        已添加的对话 ({activeSession.conversationChunks.length} 段)
                      </h3>
                      <div className="space-y-2">
                        {activeSession.conversationChunks.map((chunk, idx) => (
                          <div key={chunk.id} className="p-3 bg-lab-raised rounded-lg border border-lab-border-subtle">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-lab-muted">对话 #{idx + 1}</span>
                              <span className="text-xs text-lab-faint">
                                {new Date(chunk.addedAt).toLocaleString('zh-CN')}
                              </span>
                            </div>
                            <p className="text-sm text-lab-ink whitespace-pre-wrap line-clamp-3">
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
                      color="var(--color-accent-blue)"
                      renderItem={(item) => (
                        <>
                          <p className="font-medium text-sm">{item.stage}</p>
                          <p className="text-xs text-lab-muted mt-1">{item.date}</p>
                          <p className="text-sm text-lab-ink mt-1">{item.decision}</p>
                        </>
                      )}
                    />

                    <AnalysisSection
                      title="决策链"
                      dimension="turningPoints"
                      items={activeSession.analysis?.turningPoints || []}
                      sessionId={activeSession.id}
                      updateItemStatus={handleUpdateItemStatus}
                      color="var(--color-success)"
                      renderItem={(item) => (
                        <>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-lab-muted mt-1">触发: {item.trigger}</p>
                          <p className="text-sm text-lab-ink mt-1">最终选择: {item.finalChoice}</p>
                        </>
                      )}
                    />

                    <AnalysisSection
                      title="盲区图"
                      dimension="blindSpots"
                      items={activeSession.analysis?.blindSpots || []}
                      sessionId={activeSession.id}
                      updateItemStatus={handleUpdateItemStatus}
                      color="var(--color-error)"
                      renderItem={(item) => (
                        <>
                          <p className="font-medium text-sm">{item.question}</p>
                          <p className="text-xs text-lab-muted mt-1">重要性: {item.importance}</p>
                          <p className="text-sm text-lab-ink mt-1">建议: {item.suggestion}</p>
                        </>
                      )}
                    />

                    <AnalysisSection
                      title="假设清单"
                      dimension="assumptions"
                      items={activeSession.analysis?.assumptions || []}
                      sessionId={activeSession.id}
                      updateItemStatus={handleUpdateItemStatus}
                      color="var(--color-accent-warm)"
                      renderItem={(item) => (
                        <>
                          <p className="font-medium text-sm">{item.assumption}</p>
                          <p className="text-xs text-lab-muted mt-1">风险: {item.risk}</p>
                          <p className="text-sm text-lab-ink mt-1">验证: {item.validation}</p>
                        </>
                      )}
                    />

                    <AnalysisSection
                      title="知识资产"
                      dimension="assets"
                      items={activeSession.analysis?.assets || []}
                      sessionId={activeSession.id}
                      updateItemStatus={handleUpdateItemStatus}
                      color="var(--color-warning)"
                      renderItem={(item) => (
                        <>
                          <p className="font-medium text-sm">{item.content}</p>
                          <p className="text-xs text-lab-muted mt-1">类型: {item.type}</p>
                          <p className="text-xs text-lab-warning mt-1">
                            建议归档: {item.suggestedTemplate}
                          </p>
                        </>
                      )}
                    />
                  </div>
                </div>
            </div>
          </>
        )}
      </div>

      <div className="flex max-h-[45vh] min-h-[280px] shrink-0 flex-col overflow-hidden border-t border-lab-border-subtle bg-lab-base lg:max-h-none lg:h-auto lg:w-[min(32vw,420px)] lg:min-h-0 lg:border-t-0 lg:border-l">
        {activeSession ? (
          <ArchaeologyReportView variant="panel" session={activeSession} onRefresh={refreshData} />
        ) : (
          <div className="flex flex-1 items-center justify-center p-4 text-center text-xs text-lab-muted">
            选择会话后，此处为 Markdown 预览与知识资产归档
          </div>
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
      <h3 className="text-sm font-semibold font-display text-lab-ink mb-3 flex items-center gap-2 flex-wrap">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        {title}
        <span className="text-xs text-lab-muted font-normal">
          ({pendingItems.length} 待确认 / {confirmedItems.length} 已确认 / {rejectedItems.length} 已驳回)
        </span>
      </h3>

      <div className="space-y-2">
        {pendingItems.map((item) => (
          <div key={item.id} className="p-3 bg-lab-overlay rounded-lg border border-lab-border-subtle shadow-card">
            {editingId === item.id ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-24 p-2 border border-lab-border-subtle rounded text-xs mb-2 bg-lab-overlay text-lab-ink outline-none focus:border-lab-accent"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(item.id)}
                    className="px-2 py-1 bg-lab-success text-[color:var(--color-text-inverted)] rounded text-xs hover:opacity-92"
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="px-2 py-1 bg-lab-raised text-lab-ink border border-lab-border-subtle rounded text-xs hover:bg-lab-accent-dim"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <>
                {renderItem(item)}
                <div className="flex gap-2 mt-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleConfirm(item.id)}
                    className="px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 bg-[var(--color-success-dim)] text-lab-success border border-lab-border-subtle hover:opacity-90"
                  >
                    <span>✓</span> 确认
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(item.id)}
                    className="px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 bg-[var(--color-error-dim)] text-lab-error border border-lab-border-subtle hover:opacity-90"
                  >
                    <span>✗</span> 驳回
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="px-2 py-1 bg-lab-raised text-lab-ink rounded text-xs font-medium border border-lab-border-subtle hover:bg-lab-accent-dim transition-colors flex items-center gap-1"
                  >
                    <span>✏️</span> 编辑
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {confirmedItems.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-lg border border-lab-border-subtle bg-[var(--color-success-dim)]"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="px-1.5 py-0.5 bg-lab-success/20 text-lab-success rounded text-xs font-medium border border-lab-border-subtle">
                ✓ 已确认
              </span>
            </div>
            {renderItem(item)}
            {item.editedContent && (
              <div className="mt-2 p-2 bg-lab-overlay rounded text-xs text-lab-muted border border-lab-border-subtle">
                <p className="font-medium text-lab-ink mb-1">编辑内容:</p>
                <pre className="whitespace-pre-wrap text-lab-ink">{item.editedContent}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
