import { useLab } from '../context/LabContext'
import { useState, useRef, useEffect, useCallback } from 'react'
import SelectionMenu from './SelectionMenu'
import ChatHistorySidebar from './ChatHistorySidebar'
import GrowthCoachPanel from './growthCoach/GrowthCoachPanel'
import PressureTestWorkbench from '../features/pressureTest'
import PressureSessionRunner from '../features/pressureTest/PressureSessionRunner.jsx'
import PressureSessionInlineViewer from '../features/pressureTest/PressureSessionInlineViewer.jsx'
import { createPressureSession } from '../features/pressureTest/pressureSessionStore.js'
import HypothesisWorkbench from '../features/businessHypothesis'
import HypothesisSessionRunner from '../features/businessHypothesis/HypothesisSessionRunner.jsx'
import HypothesisSessionInlineViewer from '../features/businessHypothesis/HypothesisSessionInlineViewer.jsx'
import { createHypothesisSession } from '../features/businessHypothesis/hypothesisStore.js'
import WorkbenchMiddleToolColumn from './workbench/WorkbenchMiddleToolColumn'
import ModuleSegmentedControl from './workbench/ModuleSegmentedControl'
import ArchivePanel from './ArchivePanel'
import ArchaeologyV2 from './ArchaeologyV2'

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

export default function LabPanel({
  hideTopTabs = false,
  flushChrome = false,
  hideChatHistorySidebar = false,
  workbenchRailTool = null,
  onWorkbenchRailToolClose,
  onPressureTestStart,
}) {
  const {
    labMode,
    switchLabMode,
    projectTree,
    activeProjectId,
    activeDocId,
    allHistoryMessages,
    viewingHistorySessionId,
    setViewingHistorySessionId,
    saveMessageToHistory,
    startNewSession,
    labMessageToSend,
    autoSendLabMessage,
    getMemorySummary,
    currentSessionId,
    setCurrentSessionId,
    setPressureWorkbenchActiveSessionId,
    consumePressureSessionResume,
    hypothesisWorkbenchActiveSessionId,
    setHypothesisWorkbenchActiveSessionId,
    continueHypothesisSession,
    viewHypothesisSession,
    consumeHypothesisSessionResume,
  } = useLab()
  const [inputValue, setInputValue] = useState('')
  const [stressDraft, setStressDraft] = useState('')
  const [pressureRunnerSessionId, setPressureRunnerSessionId] = useState(/** @type {string|null} */ (null))
  const [pressureViewSessionId, setPressureViewSessionId] = useState(/** @type {string|null} */ (null))
  const [liveSubMode, setLiveSubMode] = useState(() => {
    try { return sessionStorage.getItem('thinking-lab-live-sub-mode') || 'pressure' }
    catch { return 'pressure' }
  })
  const [hypothesisDraft, setHypothesisDraft] = useState('')
  const [hypothesisRunnerSessionId, setHypothesisRunnerSessionId] = useState(/** @type {string|null} */ (null))
  const [hypothesisViewSessionId, setHypothesisViewSessionId] = useState(/** @type {string|null} */ (null))
  const [messages, setMessages] = useState(() => LIVE_LAB_DEFAULT_SEED_MESSAGES.map((m) => ({ ...m })))
  const [selectionMenu, setSelectionMenu] = useState(null)
  const workbenchComposerRef = useRef(null)

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

  const WB_INLINE_PRESSURE_W_KEY = 'thinking-lab-wb-inline-pressure-view-width-v1'
  const [wbInlinePressureViewWidth, setWbInlinePressureViewWidth] = useState(() => {
    try {
      const raw = sessionStorage.getItem(WB_INLINE_PRESSURE_W_KEY)
      const n = raw != null ? Number(raw) : NaN
      return Number.isFinite(n) ? Math.min(560, Math.max(220, n)) : 300
    } catch {
      return 300
    }
  })
  const wbPressureDragRef = useRef({ active: false, startX: 0, startW: 0, lastW: 300 })

  const onWbPressureViewResizePointerDown = useCallback(
    (e) => {
      if (e.button !== 0) return
      e.preventDefault()
      wbPressureDragRef.current = {
        active: true,
        startX: e.clientX,
        startW: wbInlinePressureViewWidth,
        lastW: wbInlinePressureViewWidth,
      }
      const onMove = (ev) => {
        const d = wbPressureDragRef.current
        if (!d.active) return
        const dx = ev.clientX - d.startX
        const next = Math.min(560, Math.max(220, d.startW + dx))
        d.lastW = next
        setWbInlinePressureViewWidth(next)
      }
      const onUp = () => {
        wbPressureDragRef.current.active = false
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        try {
          sessionStorage.setItem(WB_INLINE_PRESSURE_W_KEY, String(wbPressureDragRef.current.lastW))
        } catch {
          /* ignore */
        }
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [wbInlinePressureViewWidth]
  )

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

  useEffect(() => {
    if (labMode !== 'live') return
    const pending = consumePressureSessionResume()
    if (!pending) return
    if (pending.mode === 'view') {
      setPressureViewSessionId(pending.sessionId)
      return
    }
    setPressureViewSessionId(null)
    setPressureRunnerSessionId(pending.sessionId)
  }, [labMode, consumePressureSessionResume])

  /** 从历史假设构建恢复会话 */
  useEffect(() => {
    if (labMode !== 'live') return
    const pending = consumeHypothesisSessionResume()
    if (!pending) return
    setLiveSubMode('hypothesis')
    if (pending.mode === 'view') {
      setHypothesisViewSessionId(pending.sessionId)
      return
    }
    setHypothesisViewSessionId(null)
    setHypothesisRunnerSessionId(pending.sessionId)
  }, [labMode, consumeHypothesisSessionResume])

  useEffect(() => {
    if (labMode === 'live') {
      setPressureWorkbenchActiveSessionId(pressureRunnerSessionId || pressureViewSessionId)
      setHypothesisWorkbenchActiveSessionId(hypothesisRunnerSessionId || hypothesisViewSessionId)
    } else {
      setPressureWorkbenchActiveSessionId(null)
      setHypothesisWorkbenchActiveSessionId(null)
    }
  }, [
    labMode,
    pressureRunnerSessionId,
    pressureViewSessionId,
    hypothesisRunnerSessionId,
    hypothesisViewSessionId,
    setPressureWorkbenchActiveSessionId,
    setHypothesisWorkbenchActiveSessionId,
  ])

  /** 持久化子模式选择 */
  useEffect(() => {
    try { sessionStorage.setItem('thinking-lab-live-sub-mode', liveSubMode) } catch { /* ignore */ }
  }, [liveSubMode])

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

  return (
    <div
      className={`h-full flex overflow-hidden ${flushChrome ? 'rounded-none border-0 shadow-none' : 'rounded-l-lg rounded-r-2xl border border-lab-border-subtle shadow-card'}`}
    >
      {/* 左侧主要内容 */}
      <div
        className="flex min-h-0 flex-1 flex-col relative"
        style={{
          minWidth: 0,
          backgroundImage: 'none',
          backgroundColor: 'transparent',
        }}
      >
        {/* ═══ 统一布局：三模式共享 wb-pressure-dialog + 滑动切换 ═══ */}
        <div className="flex min-h-0 flex-1 flex-row overflow-hidden">
            {/* 中间工具列：点击图标展开，再次点击收起 */}
            {workbenchRailTool && (
              <WorkbenchMiddleToolColumn
                tool={workbenchRailTool}
                onClose={onWorkbenchRailToolClose || (() => {})}
                pressureHistory={
                  labMode === 'live'
                    ? {
                        activeRunnerId: liveSubMode === 'pressure'
                          ? (pressureRunnerSessionId || pressureViewSessionId)
                          : (hypothesisRunnerSessionId || hypothesisViewSessionId),
                        onView: (id) => {
                          if (liveSubMode === 'pressure') setPressureViewSessionId(id)
                          else setHypothesisViewSessionId(id)
                        },
                        onContinue: (id) => {
                          if (liveSubMode === 'pressure') {
                            setPressureViewSessionId(null)
                            setPressureRunnerSessionId(id)
                          } else {
                            setHypothesisViewSessionId(null)
                            setHypothesisRunnerSessionId(id)
                          }
                        },
                        onAfterDelete: (id) => {
                          if (id === pressureRunnerSessionId) setPressureRunnerSessionId(null)
                          if (id === pressureViewSessionId) setPressureViewSessionId(null)
                          if (id === hypothesisRunnerSessionId) setHypothesisRunnerSessionId(null)
                          if (id === hypothesisViewSessionId) setHypothesisViewSessionId(null)
                        },
                      }
                    : null
                }
              />
            )}

            {/* 内联文档：仅 live 模式 */}
            {labMode === 'live' && activeDocId && (
              <>
                <div
                  className="wb-live-archive-inline flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg bg-transparent"
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
                  className="wb-live-archive-separator group relative w-2 shrink-0 cursor-col-resize select-none touch-none"
                >
                  <div
                    className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-[rgba(15,23,42,0.12)] transition-colors group-hover:bg-[var(--color-accent-orange)]"
                    aria-hidden
                  />
                </div>
              </>
            )}

            {/* 历史压力会话查看器：仅 live 模式 */}
            {labMode === 'live' && pressureViewSessionId && (
              <>
                <div
                  className="wb-live-pressure-view-inline flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg bg-transparent"
                  style={{
                    flex: '1 1 auto',
                    minWidth: wbInlinePressureViewWidth,
                    maxWidth: 560,
                    border: '1px solid rgba(15, 23, 42, 0.09)',
                  }}
                >
                  <PressureSessionInlineViewer
                    sessionId={pressureViewSessionId}
                    onClose={() => setPressureViewSessionId(null)}
                    onEnterPractice={(id) => {
                      setPressureViewSessionId(null)
                      setPressureRunnerSessionId(id)
                    }}
                  />
                </div>
                <div
                  role="separator"
                  aria-orientation="vertical"
                  aria-label="拖动调整压力练习查看区宽度"
                  onMouseDown={onWbPressureViewResizePointerDown}
                  className="wb-live-pressure-view-separator group relative w-2 shrink-0 cursor-col-resize select-none touch-none"
                >
                  <div
                    className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-[rgba(15,23,42,0.12)] transition-colors group-hover:bg-[var(--color-accent-orange)]"
                    aria-hidden
                  />
                </div>
              </>
            )}

            {labMode === 'live' && hypothesisViewSessionId && (
              <>
                <div
                  className="wb-live-pressure-view-inline flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg bg-transparent"
                  style={{
                    flex: '1 1 auto',
                    minWidth: wbInlinePressureViewWidth,
                    maxWidth: 560,
                    border: '1px solid rgba(15, 23, 42, 0.09)',
                  }}
                >
                  <HypothesisSessionInlineViewer
                    sessionId={hypothesisViewSessionId}
                    onClose={() => setHypothesisViewSessionId(null)}
                    onEnterPractice={(id) => {
                      setHypothesisViewSessionId(null)
                      setHypothesisRunnerSessionId(id)
                    }}
                  />
                </div>
                <div
                  role="separator"
                  aria-orientation="vertical"
                  aria-label="拖动调整假设构建查看区宽度"
                  onMouseDown={onWbPressureViewResizePointerDown}
                  className="wb-live-pressure-view-separator group relative w-2 shrink-0 cursor-col-resize select-none touch-none"
                >
                  <div
                    className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-[rgba(15,23,42,0.12)] transition-colors group-hover:bg-[var(--color-accent-orange)]"
                    aria-hidden
                  />
                </div>
              </>
            )}

            {/* 主列：三模式共享 wb-pressure-dialog + 滑动切换 */}
            <div
              className="wb-pressure-main-column flex min-h-0 min-w-0 flex-col pb-3 pl-1 pr-3 pt-0 md:pb-4 md:pl-2 md:pr-5"
              style={
                (labMode === 'live' && (activeDocId || pressureViewSessionId || hypothesisViewSessionId))
                  ? { flex: '0 1 min(65%, 56rem)', minWidth: 0 }
                  : { flex: '1 1 65%', minWidth: 0 }
              }
            >
              <div className="wb-pressure-dialog min-h-0 flex-1">
                <div className="wb-pressure-dialog-segment">
                  <ModuleSegmentedControl variant="dialog" />
                </div>

                {/*** 滑动切换容器 ***/}
                <div className="wb-slide-container">
                  <div
                    className="wb-slide-track"
                    style={{
                      transform: `translateX(${
                        labMode === 'live' ? 0 : labMode === 'coach' ? -100 / 3 : -200 / 3
                      }%)`,
                    }}
                  >
                    {/* 面板 0：压力测试 / 假设构建（练） */}
                    <div className="wb-slide-panel">
                      {labMode === 'live' && (
                        <>
                          {/* 子模式切换 */}
                          <div className="flex shrink-0 items-center gap-1.5 px-4 pt-3 pb-2 md:px-6">
                            <button
                              type="button"
                              onClick={() => {
                                setLiveSubMode('pressure')
                                setHypothesisViewSessionId(null)
                                setHypothesisRunnerSessionId(null)
                              }}
                              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                liveSubMode === 'pressure'
                                  ? 'bg-white/80 text-[var(--wb-text)] shadow-sm'
                                  : 'text-[var(--wb-muted)] hover:bg-white/40'
                              }`}
                            >
                              压力测试
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setLiveSubMode('hypothesis')
                                setPressureViewSessionId(null)
                                setPressureRunnerSessionId(null)
                              }}
                              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                liveSubMode === 'hypothesis'
                                  ? 'bg-white/80 text-[var(--wb-text)] shadow-sm'
                                  : 'text-[var(--wb-muted)] hover:bg-white/40'
                              }`}
                            >
                              假设构建
                            </button>
                          </div>

                          {liveSubMode === 'pressure' ? (
                            pressureRunnerSessionId ? (
                              <PressureSessionRunner
                                sessionId={pressureRunnerSessionId}
                                onExit={() => setPressureRunnerSessionId(null)}
                                onRestart={() => {
                                  setPressureRunnerSessionId(null)
                                }}
                                onOpenGrowthCoach={() => {
                                  switchLabMode('coach')
                                  setPressureRunnerSessionId(null)
                                }}
                              />
                            ) : (
                              <div className="wb-pressure-dialog-guide-scroll min-h-0 flex-1">
                                <div className="wb-pressure-dialog-guide-inner wb-thread w-full px-4 py-4 md:px-6">
                                  <PressureTestWorkbench
                                    draftValue={stressDraft}
                                    setDraftValue={setStressDraft}
                                    disabled={false}
                                    onSubmit={() => {
                                      if (!stressDraft.trim()) return
                                      onPressureTestStart?.()
                                      const id = createPressureSession(stressDraft.trim())
                                      setPressureViewSessionId(null)
                                      setPressureRunnerSessionId(id)
                                      setStressDraft('')
                                    }}
                                  />
                                </div>
                              </div>
                            )
                          ) : hypothesisRunnerSessionId ? (
                            <HypothesisSessionRunner
                              sessionId={hypothesisRunnerSessionId}
                              onExit={() => setHypothesisRunnerSessionId(null)}
                              onRestart={() => {
                                setHypothesisRunnerSessionId(null)
                              }}
                            />
                          ) : (
                            <div className="wb-pressure-dialog-guide-scroll min-h-0 flex-1">
                              <div className="wb-pressure-dialog-guide-inner wb-thread w-full px-4 py-4 md:px-6">
                                <HypothesisWorkbench
                                  draftValue={hypothesisDraft}
                                  setDraftValue={setHypothesisDraft}
                                  disabled={false}
                                  onSubmit={() => {
                                    if (!hypothesisDraft.trim()) return
                                    const id = createHypothesisSession(hypothesisDraft.trim())
                                    setHypothesisViewSessionId(null)
                                    setHypothesisRunnerSessionId(id)
                                    setHypothesisDraft('')
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* 面板 1：成长教练（学） */}
                    <div className="wb-slide-panel">
                      {labMode === 'coach' && (
                        <div className="wb-pressure-dialog-guide-scroll min-h-0 flex-1">
                          <div className="wb-pressure-dialog-guide-inner wb-thread w-full px-4 py-4 md:px-6">
                            <GrowthCoachPanel />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 面板 2：对话考古（看） */}
                    <div className="wb-slide-panel">
                      {labMode === 'archaeology' && (
                        <div className="wb-pressure-dialog-guide-scroll min-h-0 flex-1">
                          <div className="wb-pressure-dialog-guide-inner wb-thread w-full px-4 py-4 md:px-6">
                            <ArchaeologyV2 variant="inline" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>   

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
