const TOOLS = [
  { id: 'projects', label: '项目', Icon: RailIconFolder },
  { id: 'radar', label: '能力雷达', Icon: RailIconRadar },
  { id: 'recommend', label: '智能推荐', Icon: RailIconSpark },
  { id: 'archaeology', label: '对话考古', Icon: RailIconSearch },
  { id: 'practice', label: '压力 / 练习记录', Icon: RailIconZap },
  { id: 'learning', label: '学习记录', Icon: RailIconBook },
]

function RailIconFolder({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="max-h-[22px] max-w-[22px]">
      <path
        d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.12 : 0}
      />
    </svg>
  )
}

function RailIconRadar({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="max-h-[22px] max-w-[22px]">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.65" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.65" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      {active && <circle cx="12" cy="12" r="2" fill="currentColor" fillOpacity="0.35" />}
    </svg>
  )
}

function RailIconSpark({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="max-h-[22px] max-w-[22px]">
      <path
        d="M12 2l1.2 5.2L18 9l-4.8 1.8L12 16l-1.2-5.2L6 9l4.8-1.8L12 2z"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinejoin="round"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.14 : 0}
      />
    </svg>
  )
}

function RailIconSearch({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="max-h-[22px] max-w-[22px]">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.65" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
      {active && <circle cx="11" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.2" />}
    </svg>
  )
}

function RailIconZap({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="max-h-[22px] max-w-[22px]">
      <path
        d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.14 : 0}
      />
    </svg>
  )
}

function RailIconBook({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="max-h-[22px] max-w-[22px]">
      <path
        d="M4 19.5A2.5 2.5 0 016.5 17H20"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
      <path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.1 : 0}
      />
    </svg>
  )
}

function RailIconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        d="M12 15a3 3 0 100-6 3 3 0 000 6Z"
        strokeWidth="1.65"
      />
      <path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function WorkbenchIconRail({ activeTool, onToolChange, onSettingsClick }) {
  return (
    <nav
      className="wb-rail-glass flex h-full min-h-0 w-[81px] shrink-0 flex-col items-center justify-center gap-1 py-2"
      aria-label="工作台工具"
    >
      <div className="flex flex-col items-center justify-center gap-1">
        {TOOLS.map((t) => {
          const active = activeTool === t.id
          const Icon = t.Icon
          return (
            <button
              key={t.id}
              type="button"
              title={t.label}
              aria-label={t.label}
              aria-pressed={active}
              onClick={() => onToolChange(active ? null : t.id)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors duration-200 hover:bg-[var(--wb-primary-muted)]"
              style={{
                color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                background: active ? 'rgba(255, 253, 248, 0.72)' : 'transparent',
              }}
            >
              <Icon active={active} />
            </button>
          )
        })}
        <button
          type="button"
          title="设置"
          aria-label="设置"
          onClick={onSettingsClick}
          className="mt-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors duration-200 hover:bg-[var(--wb-primary-muted)] hover:text-[var(--color-text-primary)]"
        >
          <RailIconSettings />
        </button>
      </div>
    </nav>
  )
}
