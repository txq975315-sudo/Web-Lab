import { useLab } from '../context/LabContext'
import { STORAGE_KEYS } from '../config/storageKeys.js'
import { useState, useRef, useEffect } from 'react'
import SelectionMenu from './SelectionMenu'
import ChatHistorySidebar from './ChatHistorySidebar'
import { streamChat, chatComplete } from '../utils/aiApi'
import { buildLiveLabSystemPrompt, ARCHAEOLOGY_PROMPT } from '../config/aiPrompts'
import GrowthCoachPanel from './growthCoach/GrowthCoachPanel'
import { LAB_BACKGROUND_IMAGES, getLabBackgroundIndex } from '../config/labBackgrounds'
import PressureTestWorkbench from './workbench/PressureTestWorkbench'
import WorkbenchMiddleToolColumn from './workbench/WorkbenchMiddleToolColumn'
import ModuleSegmentedControl from './workbench/ModuleSegmentedControl'

function DragToolbar({ selectedText, position, onClose, messageId }) {
  const handleDragStart = (e) => {
    const dragData = {
      source: 'live_lab',
      text: selectedText,
      timestamp: new Date().toISOString(),
      messageId: messageId || null
    }
    e.dataTransfer.setData('application/json', JSON.stringify(dragData))
    e.dataTransfer.effectAllowed = 'copy'

    const ghost = document.createElement('div')
    ghost.style.cssText = `
      position: fixed; top: -1000px; left: -1000px;
      padding: 8px 12px; background: rgba(20,20,19,0.82); color: var(--color-text-inverted);
      border-radius: 8px; font-size: 12px; max-width: 200px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      pointer-events: none; z-index: 9999;
      backdrop-filter: blur(8px);
      border: 1px solid rgba(250,249,245,0.18);
    `
    ghost.textContent = selectedText.slice(0, 20) + (selectedText.length > 20 ? '...' : '')
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 10, 10)
    setTimeout(() => document.body.removeChild(ghost), 0)
  }

  return (
    <div
      className="fixed z-50 flex items-center gap-1 rounded-lg shadow-lg px-2 py-1.5"
      style={{
        left: position.x,
        top: position.y - 40,
        backgroundColor: 'rgba(20, 20, 19, 0.94)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(250, 249, 245, 0.12)',
        transform: 'translateX(-50%)'
      }}
    >
      <span className="text-[10px] text-white/50 mr-1 truncate max-w-[100px]">
        {selectedText.slice(0, 15)}...
      </span>
      <div
        draggable
        onDragStart={handleDragStart}
        className="w-6 h-6 flex items-center justify-center rounded-md cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors"
        title="拖拽归档到左侧导航"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="3" cy="3" r="1" fill="rgba(255,255,255,0.7)" />
          <circle cx="9" cy="3" r="1" fill="rgba(255,255,255,0.7)" />
          <circle cx="3" cy="6" r="1" fill="rgba(255,255,255,0.7)" />
          <circle cx="9" cy="6" r="1" fill="rgba(255,255,255,0.7)" />
          <circle cx="3" cy="9" r="1" fill="rgba(255,255,255,0.7)" />
          <circle cx="9" cy="9" r="1" fill="rgba(255,255,255,0.7)" />
        </svg>
      </div>
      <button
        onClick={onClose}
        className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M1 1L7 7M7 1L1 7" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

function LiveLab({
  messages,
  setMessages,
  inputValue,
  setInputValue,
  handleTextSelect,
  historyMessages,
  viewingHistorySessionId,
  setViewingHistorySessionId,
  activeProjectId,
  saveMessageToHistory,
  setCurrentSessionId,
  currentSessionId,
  workbenchUi = false,
  workbenchComposerRef,
}) {
  const { projectTree, expertMode } = useLab()
  const messagesRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const activeProject = projectTree.find(p => p.id === activeProjectId)

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isStreaming) return

    const config = localStorage.getItem(STORAGE_KEYS.AI_CONFIG)
    if (!config) {
      alert('请先在页面右上角打开「设置」并填写 API Key')
      return
    }

    const displayText = inputValue.trim()
    let apiUserContent = displayText
    if (expertMode === 'pressure') {
      try {
        const d = localStorage.getItem('thinking-lab-pressure-depth')
        const label =
          d === 'fast'
            ? '【追问深度：快速 · 约 6 轮】'
            : d === 'deep'
              ? '【追问深度：深度 · 约 20 轮】'
              : '【追问深度：标准 · 约 12 轮】'
        apiUserContent = `${label}\n\n${displayText}`
      } catch {
        /* ignore */
      }
    }

    const userMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: displayText,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])
    saveMessageToHistory(userMessage)
    setInputValue('')
    setIsStreaming(true)

    const assistantMessageId = `msg_${Date.now() + 1}`
    const assistantMessage = {
      id: assistantMessageId,
      type: 'assistant',
      content: '',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      streaming: true
    }
    
    setMessages(prev => [...prev, assistantMessage])

    const chatMessages = messages
      .filter(m => m.type === 'user' || m.type === 'assistant')
      .slice(-10)
      .map(m => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.content
      }))

    const systemPrompt = buildLiveLabSystemPrompt(activeProject || {}, expertMode)

    await streamChat(
      [
        { role: 'system', content: systemPrompt },
        ...chatMessages,
        { role: 'user', content: apiUserContent }
      ],
      (chunk, fullText) => {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: fullText }
            : msg
        ))
      },
      (fullText) => {
        setIsStreaming(false)
        const completedMessage = { ...assistantMessage, content: fullText, streaming: false }
        
        const warnings = []
        
        if (expertMode === 'pressure') {
          const hasSectionHeaders = /###\s*[1234]\./.test(fullText)
          if (!hasSectionHeaders) {
            warnings.push('AI 未遵循格式约束（缺少四维模块标题），请重试')
          }
          
          const hasFatalQuestion = /\*\*致命追问：\*\*/.test(fullText)
          if (!hasFatalQuestion) {
            warnings.push('AI 未包含致命追问，请重试')
          }
          
          const hasJsonBlock = /```json/.test(fullText)
          if (!hasJsonBlock) {
            warnings.push('未提取到结构化数据（JSON）')
          }
        }
        
        if (warnings.length > 0) {
          completedMessage.formatWarnings = warnings
          console.warn('格式校验警告:', warnings)
        }
        
        saveMessageToHistory(completedMessage)
        
        try {
          const jsonMatch = fullText.match(/```json\s*([\s\S]*?)```/)
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[1])
            console.log('AI 元数据提取成功:', parsed)
          }
        } catch (error) {
          console.log('JSON 解析失败，可能是普通回复')
        }
      },
      (errorMsg) => {
        setIsStreaming(false)
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: `❌ 错误：${errorMsg}`, streaming: false }
            : msg
        ))
      }
    )
  }

  const handleBackToLive = () => {
    setViewingHistorySessionId(null)
  }

  const displayMessages = viewingHistorySessionId ? historyMessages : messages

  const liveLabBody = (
    <>
      {activeProject && (
        <div
          className={`relative z-10 flex items-center justify-between pt-2 ${workbenchUi ? 'px-0' : 'px-6'}`}
          style={workbenchUi ? { color: 'var(--wb-muted)' } : undefined}
        >
          <span className={`text-[10px] ${workbenchUi ? 'text-[var(--wb-muted)]' : 'text-lab-muted'}`}>
            正在项目：{activeProject.name}
          </span>
          {viewingHistorySessionId && (
            <button
              type="button"
              onClick={handleBackToLive}
              className="text-[10px] text-lab-accent hover:text-lab-accent-warm transition-colors"
            >
              ← 返回实时对话
            </button>
          )}
        </div>
      )}

      <div
        ref={messagesRef}
        className={`relative flex-1 overflow-auto pb-4 space-y-4 z-10 ${workbenchUi ? 'px-0' : 'px-6'}`}
        onMouseUp={handleTextSelect}
      >
        {displayMessages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-lab-muted text-sm">
            {viewingHistorySessionId ? '该会话暂无消息' : '暂无对话记录'}
          </div>
        ) : (
          displayMessages.map((message, msgIndex) => (
            <div
              key={message.id != null && String(message.id) !== '' ? String(message.id) : `msg-fallback-${msgIndex}`}
              data-message-id={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} ${message.type === 'system' ? 'justify-center' : ''}`}
            >
              <div
                className={`max-w-[75%] p-4 rounded-2xl font-body ${
                  message.type === 'user'
                    ? 'text-[var(--color-text-inverted)] rounded-br-md'
                    : message.type === 'system'
                    ? 'text-xs rounded-lg'
                    : 'rounded-bl-md'
                }`}
                style={{
                  backgroundColor:
                    message.type === 'user'
                      ? workbenchUi
                        ? 'var(--wb-primary)'
                        : 'var(--color-brand-blue)'
                      : message.type === 'system'
                      ? 'var(--color-bg-inverted)'
                      : 'var(--color-bg-overlay)',
                  backdropFilter: message.type === 'user' ? 'none' : 'blur(8px)',
                  border:
                    message.type === 'assistant'
                      ? '1px solid var(--color-border-subtle)'
                      : workbenchUi && message.type === 'user'
                        ? '1px solid color-mix(in srgb, var(--wb-steel) 35%, transparent)'
                        : 'none',
                  color:
                    message.type === 'system'
                      ? 'var(--color-text-inverted)'
                      : message.type === 'user'
                      ? '#ffffff'
                      : 'var(--color-text-primary)',
                }}
              >
                <p className={`text-sm ${message.type === 'system' ? 'text-xs' : ''}`}>
                  {message.content}
                </p>
                {message.formatWarnings && message.formatWarnings.length > 0 && (
                  <div
                    className="mt-2 p-2 rounded-lg text-xs"
                    style={{
                      backgroundColor: 'var(--color-warning-dim)',
                      border: '1px solid color-mix(in srgb, var(--color-warning) 35%, transparent)',
                      color: 'var(--color-warning)',
                    }}
                  >
                    <div className="mb-1 flex items-center gap-1.5 font-medium">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
                        <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path
                          d="M10.3 3.2L2.7 18c-.8 1.5.2 3.3 2 3.3h14.6c1.8 0 2.8-1.8 2-3.3L13.7 3.2c-.9-1.6-3.5-1.6-4.4 0z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                      </svg>
                      格式警告：
                    </div>
                    {message.formatWarnings.map((warning, i) => (
                      <div key={i} className="ml-2">• {warning}</div>
                    ))}
                  </div>
                )}
                <span
                  className="text-xs mt-1 block text-right"
                  style={{
                    color:
                      message.type === 'user'
                        ? 'rgba(250,249,245,0.75)'
                        : 'var(--color-text-muted)',
                  }}
                >
                  {message.time}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {!viewingHistorySessionId && (
        <form
          ref={workbenchUi ? workbenchComposerRef : undefined}
          data-workbench-composer={workbenchUi ? 'true' : undefined}
          onSubmit={handleSend}
          className={`relative z-10 ${workbenchUi ? 'px-0 pb-5' : 'px-6 pb-6'}`}
        >
          {workbenchUi ? (
            <div className="wb-composer-bar flex items-center gap-1 px-2 py-2 md:gap-2 md:px-3">
              <button
                type="button"
                className="cursor-pointer rounded-lg p-2 text-[var(--wb-muted)] transition-colors hover:bg-[var(--wb-sky-muted)] hover:text-[var(--wb-steel)]"
                aria-label="附件"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-lg p-2 text-[var(--wb-muted)] transition-colors hover:bg-[var(--wb-sky-muted)] hover:text-[var(--wb-steel)]"
                aria-label="模板"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M9 9h6M9 13h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-lg p-2 text-[var(--wb-muted)] transition-colors hover:bg-[var(--wb-sky-muted)] hover:text-[var(--wb-steel)]"
                aria-label="语音输入"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3zM19 10v1a7 7 0 01-14 0v-1M12 18v4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="补充追问或继续对话…"
                data-send-input
                className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-[var(--wb-text)] outline-none placeholder:text-[var(--wb-muted)]"
              />
              <button
                type="submit"
                data-send-button
                disabled={isStreaming}
                title={isStreaming ? '发送中…' : '发送'}
                aria-label={isStreaming ? '发送中' : '发送'}
                className="wb-btn-primary flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center p-0 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                style={{ borderRadius: 'var(--wb-radius-btn, 20px)' }}
              >
                {isStreaming ? (
                  <span className="text-xs">…</span>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="输入你的想法..."
                className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-lab-accent focus-visible:ring-offset-2 focus-visible:ring-offset-lab-base transition-all text-lab-ink placeholder:text-lab-faint font-body"
                style={{
                  backgroundColor: 'var(--color-bg-overlay)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '12px',
                }}
              />
              <button
                type="submit"
                data-send-button
                disabled={isStreaming}
                className="lab-btn-primary rounded-xl px-6 py-3 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-sans"
              >
                {isStreaming ? '正在输入...' : '发送'}
              </button>
            </div>
          )}
        </form>
      )}
    </>
  )

  return workbenchUi ? (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="wb-thread flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{liveLabBody}</div>
    </div>
  ) : (
    liveLabBody
  )
}

function ArchaeologyLab() {
  const { createArchaeologySession, archaeologySessions, activeArchaeologyId, setActiveArchaeologyId, updateArchaeologySession } = useLab()
  const [pasteText, setPasteText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)

  const activeSession = archaeologySessions?.find(s => s.id === activeArchaeologyId)

  const handleScan = async () => {
    if (!pasteText.trim()) return

    const config = localStorage.getItem(STORAGE_KEYS.AI_CONFIG)
    if (!config) {
      alert('请先点击右上角设置 API Key')
      return
    }

    setAnalyzing(true)

    const session = createArchaeologySession(pasteText)

    try {
      const result = await chatComplete([
        { role: 'system', content: ARCHAEOLOGY_PROMPT },
        { role: 'user', content: pasteText }
      ])

      let parsedData
      try {
        parsedData = JSON.parse(result)
      } catch (parseError) {
        console.error('JSON 解析失败:', parseError)
        updateArchaeologySession(session.id, {
          timeline: [],
          decisions: [],
          blindSpots: [],
          actionItems: [],
          rawResponse: result,
          parseError: 'AI 返回格式异常，请手动检查'
        })
        setAnalyzing(false)
        return
      }

      updateArchaeologySession(session.id, {
        timeline: parsedData.timeline || [],
        decisions: parsedData.decisions || [],
        blindSpots: parsedData.blindSpots || [],
        actionItems: parsedData.actionItems || [],
        summary: parsedData.summary || null
      })

      setAnalyzing(false)
    } catch (error) {
      console.error('API 调用失败:', error)
      setAnalyzing(false)
      alert(`扫描失败：${error.message}`)
    }
  }

  return (
    <div className="relative flex-1 flex flex-col z-10 overflow-hidden">
      <div className="px-6 pt-2">
        <span
          className="text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1"
          style={{
            backgroundColor: 'var(--color-warning-dim)',
            color: 'var(--color-warning)',
            border: '1px solid color-mix(in srgb, var(--color-warning) 35%, transparent)',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1" />
            <path d="M5 2.5V5L6.5 6" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
          </svg>
          对话考古模式
        </span>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-4 pb-6 overflow-auto">
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="粘贴你与 AI 的历史对话记录（Markdown 格式）..."
          className="w-full flex-1 min-h-[160px] p-4 rounded-xl text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-lab-accent font-body transition-all text-lab-ink placeholder:text-lab-faint"
          style={{
            backgroundColor: 'var(--color-bg-overlay)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '14px',
          }}
        />

        <button
          type="button"
          onClick={handleScan}
          disabled={!pasteText.trim() || analyzing}
          className={`w-full mt-3 py-3 rounded-xl text-sm font-medium font-sans transition-all flex items-center justify-center gap-2 ${
            pasteText.trim() && !analyzing ? 'lab-btn-primary' : ''
          }`}
          style={
            !pasteText.trim() || analyzing
              ? {
                  backgroundColor: 'var(--color-bg-raised)',
                  color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-border-subtle)',
                  cursor: analyzing ? 'wait' : 'default',
                }
              : undefined
          }
        >
          {analyzing ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="var(--color-text-muted)" strokeWidth="1.5" />
                <path d="M12.5 7A5.5 5.5 0 0 0 7 1.5" stroke="var(--color-brand-blue)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              正在扫描地层...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="7" cy="7" r="2" fill="currentColor" />
                <line x1="7" y1="1.5" x2="7" y2="3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="7" y1="10.5" x2="7" y2="12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="1.5" y1="7" x2="3.5" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="10.5" y1="7" x2="12.5" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              开始地层扫描
            </>
          )}
        </button>

        {activeSession && (
          <div
            className="mt-4 p-4 rounded-xl border border-lab-border-subtle bg-lab-overlay/95 backdrop-blur-sm"
          >
            <p className="text-[10px] text-lab-muted mb-1">当前考古摘要</p>
            <p className="text-xs text-lab-ink leading-relaxed font-body">
              {activeSession.title}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[9px] text-lab-faint">
                {activeSession.timeline?.length || 0} 个地层节点
              </span>
              <span className="text-[9px] text-lab-faint">
                {activeSession.decisions?.length || 0} 个决策
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MemoryCard({ projectId, getMemorySummary }) {
  const [expanded, setExpanded] = useState(false)
  const memory = getMemorySummary(projectId)

  if (!memory || memory.totalInteractions === 0) {
    return null
  }

  return (
    <div
      className="mx-4 mb-2 rounded-xl overflow-hidden"
      style={{
        backgroundColor: 'var(--color-bg-overlay)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--color-border-subtle)',
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center justify-between text-lab-ink hover:text-lab-accent-warm transition-colors"
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '14px' }}>🧠</span>
          <span className="text-[11px] font-medium">
            记忆 ({memory.insightCount} 洞察)
          </span>
        </div>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          <div className="text-[10px] text-lab-muted">
            共 {memory.totalInteractions} 次交互 · 最后更新: {
              memory.lastUpdated ? new Date(memory.lastUpdated).toLocaleString('zh-CN', {
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : '无'
            }
          </div>

          {memory.recentInsight && (
            <div className="p-2 rounded-lg bg-lab-raised border border-lab-border-subtle">
              <div className="text-[9px] text-lab-faint mb-1">最近洞察</div>
              <div className="text-[10px] text-lab-ink leading-relaxed font-body">
                {memory.recentInsight.length > 60
                  ? memory.recentInsight.slice(0, 60) + '...'
                  : memory.recentInsight
                }
              </div>
            </div>
          )}

          {memory.recentTopics.length > 0 && (
            <div>
              <div className="text-[9px] text-lab-faint mb-1">讨论话题</div>
              <div className="flex flex-wrap gap-1">
                {memory.recentTopics.map((topic, i) => (
                  <span
                    key={i}
                    className="text-[9px] px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: 'var(--color-accent-dim)',
                      color: 'var(--color-accent-warm)',
                    }}
                  >
                    {topic.length > 15 ? topic.slice(0, 15) + '...' : topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function LabPanel({
  hideTopTabs = false,
  flushChrome = false,
  hideChatHistorySidebar = false,
  workbenchLayout = false,
  workbenchRailTool = null,
  onWorkbenchRailToolClose,
}) {
  const { labMode, switchLabMode, projectTree, activeProjectId, allHistoryMessages, viewingHistorySessionId, setViewingHistorySessionId, saveMessageToHistory, startNewSession, labMessageToSend, autoSendLabMessage, getMemorySummary, currentSessionId, setCurrentSessionId } = useLab()
  const [inputValue, setInputValue] = useState('')
  const [stressDraft, setStressDraft] = useState('')
  const [messages, setMessages] = useState([
    { id: 'seed-system', type: 'system', content: '欢迎来到 Thinking Lab，开始你的商业化思维练习吧！', time: '刚刚' },
    { id: 'seed-user-demo', type: 'user', content: '什么是商业化思维？', time: '10:30' },
    { id: 'seed-assistant-demo', type: 'assistant', content: '商业化思维是一种将创意和价值转化为可持续商业模式的思考方式。它要求我们从市场、用户、竞争和财务等多个维度系统性地分析商业机会，并将碎片化的洞察转化为可执行的商业策略。', time: '10:31' }
  ])
  const [selectionMenu, setSelectionMenu] = useState(null)
  const workbenchComposerRef = useRef(null)
  const [pressureGuideOpen, setPressureGuideOpen] = useState(() => {
    try {
      return sessionStorage.getItem('thinking-lab-pressure-guide') !== 'dismissed'
    } catch {
      return true
    }
  })

  const historyMessages = viewingHistorySessionId 
    ? allHistoryMessages[activeProjectId]?.[viewingHistorySessionId] || []
    : []

  const tabs = [
    { id: 'live', label: '实时演练' },
    { id: 'coach', label: '成长教练' },
    { id: 'archaeology', label: '对话考古' }
  ]

  const rawIndex = tabs.findIndex(t => t.id === labMode)
  const activeIndex = rawIndex >= 0 ? rawIndex : 0

  const bgIndex = getLabBackgroundIndex()
  const currentBg =
    LAB_BACKGROUND_IMAGES.length > 0
      ? LAB_BACKGROUND_IMAGES[bgIndex] || LAB_BACKGROUND_IMAGES[0]
      : ''

  const handleTextSelect = () => {
    setTimeout(() => {
      const selection = window.getSelection()
      const text = selection?.toString().trim()
      if (text && text.length > 0) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()

        setSelectionMenu({
          text,
          position: {
            x: rect.left + rect.width / 2,
            y: rect.top
          }
        })
      } else {
        setSelectionMenu(null)
      }
    }, 10)
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectionMenu && !e.target.closest('[class*="fixed z-50"]')) {
        setSelectionMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selectionMenu])

  useEffect(() => {
    if (labMessageToSend) {
      setInputValue(labMessageToSend)
      if (autoSendLabMessage) {
        setTimeout(() => {
          const sendButton = document.querySelector('[data-send-button]')
          if (sendButton) {
            sendButton.click()
          }
        }, 100)
      }
    }
  }, [labMessageToSend, autoSendLabMessage])

  const wbLive = workbenchLayout && hideTopTabs && labMode === 'live'
  /** 工作台「学」：与「练」一致使用 mint 底，不使用全屏装饰背景图 */
  const coachWorkbenchSurface = flushChrome && hideTopTabs && labMode === 'coach'

  const dismissPressureGuide = () => {
    setPressureGuideOpen(false)
    try {
      sessionStorage.setItem('thinking-lab-pressure-guide', 'dismissed')
    } catch {
      /* ignore */
    }
  }

  const openPressureGuide = () => {
    setPressureGuideOpen(true)
    try {
      sessionStorage.removeItem('thinking-lab-pressure-guide')
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className={`h-full flex overflow-hidden ${flushChrome ? 'rounded-none border-0 shadow-none' : 'rounded-l-lg rounded-r-2xl border border-lab-border-subtle shadow-card'}`}
    >
      {/* 左侧主要内容 */}
      <div
        className="flex min-h-0 flex-1 flex-col relative"
        style={{
          minWidth: 0,
          backgroundImage: wbLive || coachWorkbenchSurface ? 'none' : `url(${currentBg})`,
          backgroundSize: wbLive || coachWorkbenchSurface ? undefined : 'cover',
          backgroundPosition: wbLive || coachWorkbenchSurface ? undefined : 'center',
          backgroundRepeat: wbLive || coachWorkbenchSurface ? undefined : 'no-repeat',
          backgroundColor:
            wbLive || coachWorkbenchSurface ? 'transparent' : 'var(--color-bg-base)',
        }}
      >
        {!wbLive && !coachWorkbenchSurface && (
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                'linear-gradient(165deg, rgba(217,119,87,0.06) 0%, transparent 42%), radial-gradient(ellipse 70% 50% at 80% 20%, rgba(106,155,204,0.06), transparent)',
            }}
          />
        )}
        {!hideTopTabs && (
          <div className="relative flex justify-center pt-6 pb-4 z-10">
            <div
              className="relative flex items-center rounded-2xl"
              style={{
                backgroundColor: 'rgba(253, 252, 248, 0.82)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--color-border-subtle)',
                boxShadow: 'var(--shadow-card)',
                padding: '3px',
                width: '300px',
                height: '30px',
              }}
            >
              <div
                className="absolute rounded-xl transition-all duration-400 ease-out"
                style={{
                  top: '3px',
                  left: '3px',
                  width: 'calc(33.333% - 2px)',
                  height: '24px',
                  backgroundColor: 'var(--color-bg-overlay)',
                  transform: `translateX(${activeIndex * 100}%)`,
                  boxShadow: 'var(--shadow-card)',
                  transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />

              {tabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => switchLabMode(tab.id)}
                  className="relative z-10 flex-1 h-full flex items-center justify-center text-sm font-medium rounded-xl transition-colors duration-300 font-sans"
                  style={{
                    color:
                      labMode === tab.id
                        ? 'var(--color-text-primary)'
                        : 'var(--color-text-secondary)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {wbLive ? (
          <div className="flex min-h-0 flex-1 flex-row overflow-hidden">
            <WorkbenchMiddleToolColumn tool={workbenchRailTool} onClose={onWorkbenchRailToolClose || (() => {})} />

            <div className="flex min-h-0 min-w-0 flex-1 flex-col pb-3 pl-1 pr-3 pt-0 md:pb-4 md:pl-2 md:pr-5" style={{ flex: '1 1 65%' }}>
              <div className="wb-pressure-dialog min-h-0 flex-1">
                <div className="wb-pressure-dialog-segment">
                  <ModuleSegmentedControl variant="dialog" />
                </div>
                {pressureGuideOpen ? (
                  <>
                    <div className="min-h-0 flex-1 overflow-y-auto scroll-smooth">
                      <div className="wb-thread w-full px-4 py-4 md:px-6">
                        <PressureTestWorkbench
                          draftValue={stressDraft}
                          setDraftValue={setStressDraft}
                          disabled={false}
                          onSubmit={() => {
                            if (!stressDraft.trim()) return
                            const draft = stressDraft.trim()
                            dismissPressureGuide()
                            setInputValue(draft)
                            setStressDraft('')
                            window.setTimeout(() => {
                              workbenchComposerRef.current?.querySelector('[data-send-button]')?.click()
                            }, 120)
                          }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="wb-thread w-full shrink-0 px-4 pt-3 md:px-6">
                      <div className="wb-substrip flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-2.5 md:px-5">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold" style={{ color: 'var(--wb-text)' }}>
                            对话练习
                          </p>
                          <p className="truncate text-[11px]" style={{ color: 'var(--wb-muted)' }}>
                            下方为追问与补充输入区；需要改初始想法可打开引导页
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={openPressureGuide}
                          className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 hover:bg-[var(--wb-primary-muted)]"
                          style={{
                            color: 'var(--wb-primary-hex, #3a4a40)',
                            background: 'rgba(15, 23, 42, 0.05)',
                          }}
                        >
                          编辑初始想法
                        </button>
                      </div>
                    </div>
                    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
                      <LiveLab
                        messages={messages}
                        setMessages={setMessages}
                        inputValue={inputValue}
                        setInputValue={setInputValue}
                        handleTextSelect={handleTextSelect}
                        historyMessages={historyMessages}
                        viewingHistorySessionId={viewingHistorySessionId}
                        setViewingHistorySessionId={setViewingHistorySessionId}
                        activeProjectId={activeProjectId}
                        saveMessageToHistory={saveMessageToHistory}
                        currentSessionId={currentSessionId}
                        setCurrentSessionId={setCurrentSessionId}
                        workbenchUi={wbLive}
                        workbenchComposerRef={workbenchComposerRef}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {labMode !== 'coach' && (
              <MemoryCard projectId={activeProjectId} getMemorySummary={getMemorySummary} />
            )}

            <div className="relative flex-1 flex flex-col overflow-hidden transition-opacity duration-200" style={{ opacity: 1 }}>
              {labMode === 'coach' ? (
                <GrowthCoachPanel />
              ) : labMode === 'live' ? (
                <LiveLab
                  messages={messages}
                  setMessages={setMessages}
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  handleTextSelect={handleTextSelect}
                  historyMessages={historyMessages}
                  viewingHistorySessionId={viewingHistorySessionId}
                  setViewingHistorySessionId={setViewingHistorySessionId}
                  activeProjectId={activeProjectId}
                  saveMessageToHistory={saveMessageToHistory}
                  currentSessionId={currentSessionId}
                  setCurrentSessionId={setCurrentSessionId}
                  workbenchUi={wbLive}
                />
              ) : (
                <ArchaeologyLab />
              )}
            </div>
          </>
        )}

        {selectionMenu && (
          <SelectionMenu
            text={selectionMenu.text}
            position={selectionMenu.position}
            onClose={() => setSelectionMenu(null)}
          />
        )}
      </div>

      {/* 右侧历史记录侧边栏 - 只在实时演练模式显示 */}
      {labMode === 'live' && !hideChatHistorySidebar ? (
        <ChatHistorySidebar setMessages={setMessages} setInputValue={setInputValue} />
      ) : null}
    </div>
  )
}
