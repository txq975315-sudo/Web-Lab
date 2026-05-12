/**
 * BottomToolbar — Figma 底部操作栏
 * 白色背景，顶部圆角8px，边框 #D9D9D9
 * 预留输出框 + 上传 + 发送区域
 */
export default function BottomToolbar() {
  return (
    <div className="wb-bottom-toolbar flex h-[96px] shrink-0 items-center justify-between rounded-t-[8px] border-t border-[#D9D9D9] bg-white px-6">
      {/* 左侧：状态提示 */}
      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        <span>准备开始训练...</span>
      </div>
      {/* 右侧：操作按钮预留 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-[13px] px-4 text-sm font-medium text-white transition-colors"
          style={{ background: 'var(--color-accent-orange)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          发送
        </button>
      </div>
    </div>
  )
}
