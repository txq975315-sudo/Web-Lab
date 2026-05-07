import { useLab } from '../context/LabContext'
import { useState, useRef, useEffect } from 'react'
import SelectionMenu from './SelectionMenu'

const BACKGROUNDS = [
  '/backgrounds/bg-1.jpg',
  '/backgrounds/bg-2.jpg',
  '/backgrounds/bg-3.jpg',
  '/backgrounds/bg-4.png'
]

function getDailyBackgroundIndex() {
  const today = new Date()
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
  return dayOfYear % BACKGROUNDS.length
}

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
      padding: 8px 12px; background: rgba(31,41,55,0.7); color: rgba(255,255,255,0.9);
      border-radius: 8px; font-size: 12px; max-width: 200px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      pointer-events: none; z-index: 9999;
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.2);
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
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
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

function LiveLab({ messages, setMessages, inputValue, setInputValue, handleTextSelect }) {
  const { activeProjectId, projectTree } = useLab()
  const messagesRef = useRef(null)
  const activeProject = projectTree.find(p => p.id === activeProjectId)

  const handleSend = (e) => {
    e.preventDefault()
    if (inputValue.trim()) {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'user',
        content: inputValue,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }])
      setInputValue('')

      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          type: 'assistant',
          content: '这是一个很好的问题。让我从商业分析的角度来帮你梳理一下思路...',
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }])
      }, 800)
    }
  }

  return (
    <>
      {activeProject && (
        <div className="relative z-10 px-6 pt-2">
          <span className="text-[10px] text-white/60">
            正在项目：{activeProject.name}
          </span>
        </div>
      )}

      <div
        ref={messagesRef}
        className="relative flex-1 overflow-auto px-6 pb-4 space-y-4 z-10"
        onMouseUp={handleTextSelect}
      >
        {messages.map(message => (
          <div
            key={message.id}
            data-message-id={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} ${message.type === 'system' ? 'justify-center' : ''}`}
          >
            <div
              className={`max-w-[75%] p-4 rounded-2xl ${
                message.type === 'user'
                  ? 'text-white rounded-br-md'
                  : message.type === 'system'
                  ? 'text-xs rounded-lg'
                  : 'rounded-bl-md'
              }`}
              style={{
                backgroundColor: message.type === 'user'
                  ? 'rgba(255,255,255,0.25)'
                  : message.type === 'system'
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                border: message.type === 'assistant' ? '1px solid rgba(255,255,255,0.15)' : 'none',
                color: message.type === 'system' ? 'rgba(255,255,255,0.7)' : 'white'
              }}
            >
              <p className={`text-sm ${message.type === 'system' ? 'text-xs' : ''}`}>
                {message.content}
              </p>
              <span className="text-xs mt-1 block text-right" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {message.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="relative px-6 pb-6 z-10">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="输入你的想法..."
            className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all text-white placeholder-white/50"
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '12px'
            }}
          />
          <button
            type="submit"
            className="px-6 py-3 text-sm font-medium rounded-xl transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'rgba(255,255,255,0.25)',
              backdropFilter: 'blur(8px)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            发送
          </button>
        </div>
      </form>
    </>
  )
}

function ArchaeologyLab() {
  const { createArchaeologySession, archaeologySessions, activeArchaeologyId, setActiveArchaeologyId, updateArchaeologySession } = useLab()
  const [pasteText, setPasteText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)

  const activeSession = archaeologySessions.find(s => s.id === activeArchaeologyId)

  const handleScan = () => {
    if (!pasteText.trim()) return

    setAnalyzing(true)

    const session = createArchaeologySession(pasteText)

    setTimeout(() => {
      const mockTimeline = [
        {
          type: 'hypothesis',
          dimension: 'product',
          quote: pasteText.slice(0, 60) + '...',
          summary: '从对话中提取的初始产品假设，用户表达了对特定功能的需求。'
        },
        {
          type: 'challenge',
          dimension: 'business',
          quote: '这里可能存在商业化落地的挑战...',
          summary: '在商业化层面遭遇挑战，需要重新评估目标市场和定价策略。'
        },
        {
          type: 'revision',
          dimension: 'product',
          quote: '经过讨论，我们调整了方案...',
          summary: '基于挑战反馈，对产品方案进行了认知修正，聚焦核心价值主张。'
        },
        {
          type: 'conclusion',
          dimension: 'society',
          quote: '最终我们达成共识...',
          summary: '收敛结论：产品方向确认，下一步进入详细规格设计阶段。'
        }
      ]

      const mockDecisions = [
        { text: '采用订阅制定价模型，基础版免费+高级版付费', summary: '定价策略决策' },
        { text: '优先支持 Android 平台，iOS 延后至 Q3', summary: '平台优先级决策' }
      ]

      const mockBlindSpots = [
        { text: '未充分考虑竞品在东南亚市场的先发优势', summary: '竞品分析盲区' },
        { text: '用户隐私合规（GDPR/CCPA）的具体实施方案尚未明确', summary: '合规盲区' }
      ]

      const mockActionItems = [
        { text: '下周完成竞品功能对比矩阵', summary: '竞品调研待办' },
        { text: '与法务确认数据跨境传输合规要求', summary: '合规确认待办' }
      ]

      updateArchaeologySession(session.id, {
        timeline: mockTimeline,
        decisions: mockDecisions,
        blindSpots: mockBlindSpots,
        actionItems: mockActionItems
      })

      setAnalyzing(false)
    }, 2000)
  }

  return (
    <div className="relative flex-1 flex flex-col z-10 overflow-hidden">
      <div className="px-6 pt-2">
        <span
          className="text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1"
          style={{
            backgroundColor: 'rgba(251, 191, 36, 0.2)',
            color: '#FCD34D',
            border: '1px solid rgba(251, 191, 36, 0.3)'
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
          className="w-full flex-1 min-h-[160px] p-4 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all text-white placeholder-white/40"
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '14px'
          }}
        />

        <button
          onClick={handleScan}
          disabled={!pasteText.trim() || analyzing}
          className="w-full mt-3 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
          style={{
            backgroundColor: analyzing
              ? 'rgba(255,255,255,0.1)'
              : pasteText.trim()
              ? 'rgba(255,255,255,0.25)'
              : 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(8px)',
            color: pasteText.trim() ? 'white' : 'rgba(255,255,255,0.3)',
            border: '1px solid rgba(255,255,255,0.15)',
            cursor: pasteText.trim() && !analyzing ? 'pointer' : 'default'
          }}
        >
          {analyzing ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                <path d="M12.5 7A5.5 5.5 0 0 0 7 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
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
          <div className="mt-4 p-4 rounded-xl" style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <p className="text-[10px] text-white/50 mb-1">当前考古摘要</p>
            <p className="text-xs text-white/80 leading-relaxed">
              {activeSession.title}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[9px] text-white/40">
                {activeSession.timeline?.length || 0} 个地层节点
              </span>
              <span className="text-[9px] text-white/40">
                {activeSession.decisions?.length || 0} 个决策
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LabPanel() {
  const { labMode, switchLabMode, projectTree, activeProjectId } = useLab()
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState([
    { id: 1, type: 'system', content: '欢迎来到 Thinking Lab，开始你的商业化思维练习吧！', time: '刚刚' },
    { id: 2, type: 'user', content: '什么是商业化思维？', time: '10:30' },
    { id: 3, type: 'assistant', content: '商业化思维是一种将创意和价值转化为可持续商业模式的思考方式。它要求我们从市场、用户、竞争和财务等多个维度系统性地分析商业机会，并将碎片化的洞察转化为可执行的商业策略。', time: '10:31' }
  ])
  const [dragToolbar, setDragToolbar] = useState(null)
  const [selectionMenu, setSelectionMenu] = useState(null)

  const tabs = [
    { id: 'live', label: '实时演练' },
    { id: 'archaeology', label: '对话考古' }
  ]

  const activeIndex = tabs.findIndex(t => t.id === labMode)

  const dailyBgIndex = getDailyBackgroundIndex()
  const currentBg = BACKGROUNDS[dailyBgIndex]

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

  return (
    <div
      className="h-full flex flex-col rounded-2xl overflow-hidden relative"
      style={{
        minWidth: 0,
        backgroundImage: `url(${currentBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#667eea'
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.75) 0%, rgba(118, 75, 162, 0.75) 50%, rgba(240, 147, 251, 0.7) 100%)'
        }}
      />

      <div className="relative flex justify-center pt-6 pb-4 z-10">
        <div
          className="relative flex items-center rounded-2xl"
          style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            padding: '3px',
            width: '240px',
            height: '30px'
          }}
        >
          <div
            className="absolute rounded-xl transition-all duration-400 ease-out"
            style={{
              top: '3px',
              left: '3px',
              width: 'calc(50% - 3px)',
              height: '24px',
              backgroundColor: '#FFFFFF',
              transform: `translateX(${activeIndex * 100}%)`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          />

          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => switchLabMode(tab.id)}
              className="relative z-10 flex-1 h-full flex items-center justify-center text-sm font-medium rounded-xl transition-colors duration-300"
              style={{
                color: labMode === tab.id ? '#1F2937' : 'rgba(255,255,255,0.8)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex-1 flex flex-col overflow-hidden transition-opacity duration-200" style={{ opacity: 1 }}>
        {labMode === 'live' ? (
          <LiveLab
            messages={messages}
            setMessages={setMessages}
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleTextSelect={handleTextSelect}
          />
        ) : (
          <ArchaeologyLab />
        )}
      </div>

      {selectionMenu && (
        <SelectionMenu
          text={selectionMenu.text}
          position={selectionMenu.position}
          onClose={() => setSelectionMenu(null)}
        />
      )}
    </div>
  )
}
