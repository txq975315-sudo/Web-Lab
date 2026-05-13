import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import { useLab } from '../../context/LabContext'
import { STORAGE_KEYS } from '../../config/storageKeys.js'
import { streamChat } from '../../utils/aiApi'
import { buildLiveLabSystemPrompt } from '../../config/aiPrompts'

const LIVE_LAB_MD_PLUGINS = [remarkBreaks]

export default function LiveLab({
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
  const composerTextareaRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const activeProject = projectTree.find(p => p.id === activeProjectId)

  const adjustComposerHeight = useCallback(() => {
    const el = composerTextareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const style = window.getComputedStyle(el)
    const lineHeight = parseFloat(style.lineHeight) || 20
    const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
    const maxH = lineHeight * 5 + padY
    const next = Math.min(el.scrollHeight, maxH)
    el.style.height = `${Math.max(lineHeight + padY, next)}px`
    el.style.overflowY = el.scrollHeight > maxH ? 'auto' : 'hidden'
  }, [])

  useEffect(() => {
    adjustComposerHeight()
  }, [inputValue, workbenchUi, adjustComposerHeight])

  const handleComposerKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (isStreaming || !inputValue.trim()) return
      e.currentTarget.form?.requestSubmit()
    }
  }

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
      <div
        className={`relative z-10 flex flex-wrap items-center justify-between gap-2 pt-2 ${workbenchUi ? 'px-0' : 'px-6'}`}
        style={workbenchUi ? { color: 'var(--wb-muted)' } : undefined}
      >
        <span
          className={`max-w-[min(100%,42rem)] text-[10px] leading-snug ${workbenchUi ? 'text-[var(--wb-muted)]' : 'text-lab-muted'}`}
        >
          {activeProject ? (
            <>正在项目：{activeProject.name}</>
          ) : (
            <>
              尚未绑定项目。请在左侧项目树中选择项目，或新建项目后再开始对话（绑定后消息将归档到该项目）。
            </>
          )}
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

      <div
        ref={messagesRef}
        className={`relative flex-1 overflow-auto pb-4 space-y-6 z-10 ${workbenchUi ? 'px-0' : 'px-6'}`}
        onMouseUp={handleTextSelect}
      >
        {displayMessages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-lab-muted text-sm">
            {viewingHistorySessionId ? '该会话暂无消息' : '暂无对话记录'}
          </div>
        ) : (
          displayMessages.map((message, msgIndex) => {
            const key =
              message.id != null && String(message.id) !== ''
                ? String(message.id)
                : `msg-fallback-${msgIndex}`

            if (message.type === 'system') {
              return (
                <div
                  key={key}
                  data-message-id={message.id}
                  className="flex flex-col items-center justify-center gap-1"
                >
                  <div
                    className="max-w-[90%] rounded-lg px-4 py-2 font-body shadow-sm"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.96)',
                      color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border-subtle)',
                      boxShadow: '0 1px 10px rgba(20, 20, 19, 0.05)',
                    }}
                  >
                    <p className="whitespace-pre-wrap text-xs">{message.content}</p>
                  </div>
                  <time className="text-[10px] opacity-70" style={{ color: 'var(--color-text-muted)' }}>
                    {message.time}
                  </time>
                </div>
              )
            }

            if (message.type === 'user') {
              const userBubbleSurface = {
                background: 'rgba(15, 23, 42, 0.05)',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                color: 'var(--wb-primary-hex, #3a4a40)',
              }
              return (
                <div
                  key={key}
                  data-message-id={message.id}
                  className="flex justify-end"
                >
                  <div className="flex max-w-[min(100%,42rem)] flex-col items-end gap-1">
                    <div
                      className="rounded-2xl rounded-br-md px-4 py-3 font-body transition-colors duration-200 hover:bg-[rgba(15,23,42,0.06)]"
                      style={
                        workbenchUi
                          ? userBubbleSurface
                          : {
                              background: 'rgba(15, 23, 42, 0.05)',
                              border: '1px solid rgba(15, 23, 42, 0.08)',
                              color: 'var(--color-text-primary)',
                            }
                      }
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                    </div>
                    <time
                      className="px-0.5 text-[10px] tabular-nums"
                      style={{ color: workbenchUi ? 'var(--wb-muted)' : 'var(--color-text-muted)' }}
                    >
                      {message.time}
                    </time>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={key}
                data-message-id={message.id}
                className="flex w-full min-w-0 justify-start"
              >
                <div className="w-full min-w-0 max-w-full pr-2">
                  <div className="live-lab-assistant-md">
                    <ReactMarkdown remarkPlugins={LIVE_LAB_MD_PLUGINS}>{message.content}</ReactMarkdown>
                  </div>
                  {message.formatWarnings && message.formatWarnings.length > 0 && (
                    <div
                      className="mt-3 rounded-lg p-2 text-xs"
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
                        <div key={i} className="ml-2">
                          • {warning}
                        </div>
                      ))}
                    </div>
                  )}
                  <time
                    className="mt-2 block text-[10px] tabular-nums"
                    style={{ color: workbenchUi ? 'var(--wb-muted)' : 'var(--color-text-muted)' }}
                  >
                    {message.time}
                  </time>
                </div>
              </div>
            )
          })
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
            <div className="wb-composer-bar flex flex-col gap-2 px-2 py-2 md:px-3">
              <textarea
                ref={composerTextareaRef}
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleComposerKeyDown}
                placeholder="补充追问或继续对话…"
                data-send-input
                className="min-h-[44px] min-w-0 w-full resize-none border-0 bg-transparent px-0.5 py-1 text-sm leading-5 text-[var(--wb-text)] outline-none placeholder:text-[var(--wb-muted)]"
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-0.5">
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
                </div>
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
            </div>
          ) : (
            <div className="flex items-end gap-3">
              <textarea
                ref={composerTextareaRef}
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleComposerKeyDown}
                placeholder="输入你的想法..."
                data-send-input
                className="min-h-[48px] flex-1 resize-none rounded-xl px-4 py-3 text-sm leading-5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-lab-accent focus-visible:ring-offset-2 focus-visible:ring-offset-lab-base font-body text-lab-ink placeholder:text-lab-faint"
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