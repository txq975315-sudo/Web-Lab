/**
 * 选中文本后的拖拽归档工具条（当前未接入主流程，保留供后续与 SelectionMenu 等联动）。
 */
export default function DragToolbar({ selectedText, position, onClose, messageId }) {
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
      className="fixed z-50 flex flex-shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 shadow-lg"
      style={{
        left: position.x,
        top: position.y - 40,
        backgroundColor: 'rgba(20, 20, 19, 0.94)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(250, 249, 245, 0.12)',
        transform: 'translateX(-50%)'
      }}
    >
      <span className="mr-1 max-w-[100px] truncate text-[10px] text-white/50">
        {selectedText.slice(0, 15)}...
      </span>
      <div
        draggable
        onDragStart={handleDragStart}
        className="flex h-6 w-6 cursor-grab items-center justify-center rounded-md transition-colors hover:bg-white/10 active:cursor-grabbing"
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
        type="button"
        onClick={onClose}
        className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-white/10"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M1 1L7 7M7 1L1 7" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
