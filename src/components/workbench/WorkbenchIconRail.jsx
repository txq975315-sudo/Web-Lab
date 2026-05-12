import { useLab } from '../../context/LabContext'

/** 顺序：项目 → 智能推荐 → 历史压力练习 → 历史成长教学 → 历史对话考古 → 智力雷达 */
const TOOLS = [
  { id: 'projects', label: '项目', Icon: RailIconFolder },
  { id: 'recommend', label: '智能推荐', Icon: RailIconSpark },
  { id: 'practice', label: '历史压力练习', Icon: RailIconPressureHistory },
  { id: 'learning', label: '历史成长教学', Icon: RailIconBook },
  { id: 'archaeology', label: '历史对话考古', Icon: RailIconSearch },
  { id: 'radar', label: '智力雷达', Icon: RailIconRadar },
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

/** 历史压力练习：均衡条波形，与闪电/书本/雷达等轮廓区分 */
function RailIconPressureHistory({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="max-h-[22px] max-w-[22px]">
      <path
        d="M5 9v6M9 6v12M13 10v4M17 7v10"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
      {active && (
        <path
          d="M4 17.5h16"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.35"
        />
      )}
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

export default function WorkbenchIconRail({ activeTool, onToolChange, onSettingsClick, highlightProjectsWhenIdle = false }) {
  const { switchLabMode } = useLab()

  return (
    <nav
      className="wb-rail-glass wb-rail-solid wb-rail-w flex h-full min-h-0 flex-col py-1.5"
      aria-label="工作台工具"
    >
      <div className="flex shrink-0 justify-center">
        <button
          type="button"
          title="返回首页"
          aria-label="返回首页"
          onClick={() => switchLabMode('landing')}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors duration-200 hover:bg-[rgba(255,255,255,0.55)]"
          style={{ color: 'var(--color-brand-blue)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
              stroke="currentColor"
              strokeWidth="1.65"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* 工具列上沿与 logo 底沿对齐，无额外垂直居中留白 */}
      <div className="flex shrink-0 flex-col items-center gap-1 pt-0">
        {TOOLS.map((t) => {
          const active =
            activeTool === t.id || (highlightProjectsWhenIdle && t.id === 'projects' && activeTool == null)
          const Icon = t.Icon
          return (
            <button
              key={t.id}
              type="button"
              title={t.label}
              aria-label={t.label}
              aria-pressed={active}
              onClick={() => onToolChange(active ? null : t.id)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors duration-200 hover:bg-[var(--wb-primary-muted)]"
              style={{
                color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                background: active ? 'rgba(255, 253, 248, 0.72)' : 'transparent',
              }}
            >
              <Icon active={active} />
            </button>
          )
        })}
      </div>

      <div className="min-h-0 flex-1" aria-hidden />

      <div className="flex shrink-0 justify-center pb-0.5">
        <button
          type="button"
          title="设置"
          aria-label="设置"
          onClick={onSettingsClick}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors duration-200 hover:bg-[var(--wb-primary-muted)] hover:text-[var(--color-text-primary)]"
        >
          <RailIconSettings />
        </button>
      </div>
    </nav>
  )
}
