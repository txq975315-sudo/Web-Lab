import { useLab } from '../context/LabContext'
import { STORAGE_KEYS } from '../config/storageKeys.js'
import { useState, useRef, useEffect, useCallback } from 'react'
import SelectionMenu from './SelectionMenu'
import ChatHistorySidebar from './ChatHistorySidebar'
import { chatComplete } from '../utils/aiApi'
import { ARCHAEOLOGY_PROMPT } from '../config/aiPrompts'
import { augmentSystemPromptWithTerminology } from '../utils/aiTerminologyPreference.js'
import GrowthCoachPanel from './growthCoach/GrowthCoachPanel'
import { LAB_BACKGROUND_IMAGES, getLabBackgroundIndex } from '../config/labBackgrounds'
import PressureTestWorkbench from '../features/pressureTest'
import PressureSessionRunner from '../features/pressureTest/PressureSessionRunner.jsx'
import PressureSessionList from '../features/pressureTest/PressureSessionList.jsx'
import { createPressureSession } from '../features/pressureTest/pressureSessionStore.js'
import WorkbenchMiddleToolColumn from './workbench/WorkbenchMiddleToolColumn'
import ModuleSegmentedControl from './workbench/ModuleSegmentedControl'
import ArchivePanel from './ArchivePanel'
import LiveLab from './LabPanel/LiveLab'

/** 实时演练无历史时的占位消息（与本地持久化无关） */
const LIVE_LAB_DEFAULT_SEED_MESSAGES = [
  { id: 'seed-system', type: 'system', content: '欢迎来到 Thinking Lab，开始你的商业化思维练习吧！', time: '刚刚' },
  { id: 'seed-user-demo', type: 'user', content: '什么是商业化思维？', time: '10:30' },
  {
    id: 'seed-assistant-demo',
    type: 'assistant',
    content:
      '商业化思维是一种将创意和价值转化为可持续商业模式的思考方式。它要求我们从市场、用户、竞争和财务等多个维度系统性地分析商业机会，并将碎片化的洞察转化为可执行的商业策略。',
    time: '10:31',
  },
]

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
        { role: 'system', content: augmentSystemPromptWithTerminology(ARCHAEOLOGY_PROMPT) },
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
  onPressureTestStart,
}) {
  const { labMode, switchLabMode, projectTree, activeProjectId, activeDocId, allHistoryMessages, viewingHistorySessionId, setViewingHistorySessionId, saveMessageToHistory, startNewSession, labMessageToSend, autoSendLabMessage, getMemorySummary, currentSessionId, setCurrentSessionId } = useLab()
  const [inputValue, setInputValue] = useState('')
  const [stressDraft, setStressDraft] = useState('')
  const [pressureRunnerSessionId, setPressureRunnerSessionId] = useState(/** @type {string|null} */ (null))
  const [messages, setMessages] = useState(() => LIVE_LAB_DEFAULT_SEED_MESSAGES.map((m) => ({ ...m })))
  const [selectionMenu, setSelectionMenu] = useState(null)
  const workbenchComposerRef = useRef(null)
  const [pressureGuideOpen, setPressureGuideOpen] = useState(() => {
    try {
      return sessionStorage.getItem('thinking-lab-pressure-guide') !== 'dismissed'
    } catch {
      return true
    }
  })

  const WB_INLINE_DOC_W_KEY = 'thinking-lab-wb-inline-doc-width-v1'
  const [wbInlineDocWidth, setWbInlineDocWidth] = useState(() => {
    try {
      const raw = sessionStorage.getItem(WB_INLINE_DOC_W_KEY)
      const n = raw != null ? Number(raw) : NaN
      return Number.isFinite(n) ? Math.min(560, Math.max(220, n)) : 300
    } catch {
      return 300
    }
  })
  const wbDocDragRef = useRef({ active: false, startX: 0, startW: 0, lastW: 300 })

  const onWbDocResizePointerDown = useCallback(
    (e) => {
      if (e.button !== 0) return
      e.preventDefault()
      wbDocDragRef.current = {
        active: true,
        startX: e.clientX,
        startW: wbInlineDocWidth,
        lastW: wbInlineDocWidth,
      }
      const onMove = (ev) => {
        const d = wbDocDragRef.current
        if (!d.active) return
        const dx = ev.clientX - d.startX
        const next = Math.min(560, Math.max(220, d.startW + dx))
        d.lastW = next
        setWbInlineDocWidth(next)
      }
      const onUp = () => {
        wbDocDragRef.current.active = false
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        try {
          sessionStorage.setItem(WB_INLINE_DOC_W_KEY, String(wbDocDragRef.current.lastW))
        } catch {
          /* ignore */
        }
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [wbInlineDocWidth]
  )

  const historyMessages = viewingHistorySessionId 
    ? allHistoryMessages[activeProjectId]?.[viewingHistorySessionId] || []
    : []

  /** 从持久化恢复当前会话消息（刷新/切项目后不再只剩演示三句）。勿依赖 allHistoryMessages 引用频繁重跑，以免打断流式输出。 */
  useEffect(() => {
    if (viewingHistorySessionId) return
    if (!activeProjectId || !currentSessionId) return
    const stored = allHistoryMessages[activeProjectId]?.[currentSessionId]
    if (Array.isArray(stored) && stored.length > 0) {
      setMessages(stored)
    } else {
      setMessages(LIVE_LAB_DEFAULT_SEED_MESSAGES.map((m) => ({ ...m })))
    }
  }, [activeProjectId, currentSessionId, viewingHistorySessionId])
  // 仅随「项目 / 会话 / 历史视图」变化重hydrate；不把 allHistoryMessages 放入 deps，避免父级每次存盘后引用变化打断流式输出。

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

            {activeDocId && (
              <>
                <div
                  className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg bg-transparent"
                  style={{
                    flex: '1 1 auto',
                    minWidth: wbInlineDocWidth,
                    maxWidth: 560,
                    border: '1px solid rgba(15, 23, 42, 0.09)',
                  }}
                >
                  <ArchivePanel variant="inline" />
                </div>
                <div
                  role="separator"
                  aria-orientation="vertical"
                  aria-label="拖动调整文档区宽度"
                  onMouseDown={onWbDocResizePointerDown}
                  className="group relative w-2 shrink-0 cursor-col-resize select-none touch-none"
                >
                  <div
                    className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-[rgba(15,23,42,0.12)] transition-colors group-hover:bg-[var(--color-accent-orange)]"
                    aria-hidden
                  />
                </div>
              </>
            )}

            <div
              className="flex min-h-0 min-w-0 flex-col pb-3 pl-1 pr-3 pt-0 md:pb-4 md:pl-2 md:pr-5"
              style={
                activeDocId
                  ? { flex: '0 1 min(65%, 56rem)', minWidth: 0 }
                  : { flex: '1 1 65%', minWidth: 0 }
              }
            >
              <div className="wb-pressure-dialog min-h-0 flex-1">
                <div className="wb-pressure-dialog-segment">
                  <ModuleSegmentedControl variant="dialog" />
                </div>
                {pressureRunnerSessionId ? (
                  <PressureSessionRunner
                    sessionId={pressureRunnerSessionId}
                    onExit={() => setPressureRunnerSessionId(null)}
                    onRestart={() => {
                      setPressureRunnerSessionId(null)
                      setPressureGuideOpen(true)
                    }}
                    onOpenGrowthCoach={() => {
                      switchLabMode('coach')
                      setPressureRunnerSessionId(null)
                    }}
                  />
                ) : pressureGuideOpen ? (
                  <>
                    <div className="wb-pressure-dialog-guide-scroll min-h-0 flex-1 overflow-y-auto scroll-smooth">
                      <div className="wb-pressure-dialog-guide-inner wb-thread w-full px-4 py-4 md:px-6">
                        <PressureSessionList
                          activeRunnerId={pressureRunnerSessionId}
                          onContinue={(id) => {
                            setPressureRunnerSessionId(id)
                            dismissPressureGuide()
                          }}
                          onAfterDelete={(id) => {
                            if (id === pressureRunnerSessionId) setPressureRunnerSessionId(null)
                          }}
                        />
                        <PressureTestWorkbench
                          draftValue={stressDraft}
                          setDraftValue={setStressDraft}
                          disabled={false}
                          onSubmit={() => {
                            if (!stressDraft.trim()) return
                            onPressureTestStart?.()
                            const id = createPressureSession(stressDraft.trim())
                            setPressureRunnerSessionId(id)
                            dismissPressureGuide()
                            setStressDraft('')
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
                            下方为追问区；新建或继续请在「已保存的会话」与引导页操作
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={openPressureGuide}
                            className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 hover:bg-[var(--wb-primary-muted)]"
                            style={{
                              color: 'var(--wb-primary-hex, #3a4a40)',
                              background: 'rgba(15, 23, 42, 0.05)',
                            }}
                          >
                            已保存的会话
                          </button>
                          <button
                            type="button"
                            onClick={openPressureGuide}
                            className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 hover:bg-[var(--wb-primary-muted)]"
                            style={{
                              color: 'var(--wb-primary-hex, #3a4a40)',
                              background: 'rgba(15, 23, 42, 0.05)',
                            }}
                          >
                            编辑初始想法
                          </button>
                        </div>
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
