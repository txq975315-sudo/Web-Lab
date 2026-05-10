import { useMemo } from 'react'
import { useLab } from '../../context/LabContext'
import { loadSkillProgress } from '../../utils/growthCoachStore'

const SEGMENTS = [
  {
    id: 'live',
    label: '压力练习（练）',
    short: '练',
    badgeKey: 'live',
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
        <path
          d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
          fill={active ? 'currentColor' : 'none'}
          fillOpacity={active ? 0.12 : 0}
        />
      </svg>
    ),
  },
  {
    id: 'coach',
    label: '成长教练（学）',
    short: '学',
    badgeKey: 'coach',
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
        <path
          d="M4 19.5A2.5 2.5 0 016.5 17H20"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M9 7h6M9 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'archaeology',
    label: '对话考古（看）',
    short: '看',
    badgeKey: 'arch',
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
        <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M11 8v4l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

function useModuleBadges() {
  return useMemo(() => {
    const skill = loadSkillProgress()
    const templateCount = Object.keys(skill.byTemplate || {}).length
    const coachHint = templateCount < 2
    return {
      coach: coachHint,
      arch: false,
      live: false,
    }
  }, [])
}

export default function ModuleSegmentedControl() {
  const { labMode, switchLabMode } = useLab()
  const badges = useModuleBadges()

  const activeIndex = SEGMENTS.findIndex((s) => s.id === labMode)
  const thumbOn = activeIndex >= 0

  return (
    <div
      className="relative inline-flex min-w-0 max-w-full items-stretch rounded-full p-1 shadow-sm backdrop-blur-sm"
      style={{
        background: 'var(--wb-segment-track)',
        border: '1px solid rgba(255, 253, 248, 0.65)',
        boxShadow: '0 2px 16px rgba(20, 20, 19, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.75)',
      }}
      role="tablist"
      aria-label="模块切换"
    >
      <div
        className="pointer-events-none absolute bottom-1 top-1 rounded-full transition-all duration-200 ease-out"
        style={{
          width: 'calc((100% - 8px) / 3)',
          left: 4,
          background: 'var(--wb-segment-thumb)',
          border: '1px solid var(--wb-segment-thumb-border)',
          transform: thumbOn ? `translateX(calc(${activeIndex} * 100%))` : 'translateX(0)',
          opacity: thumbOn ? 1 : 0,
          boxShadow: thumbOn ? '0 1px 3px rgba(20, 20, 19, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.95)' : 'none',
        }}
        aria-hidden
      />

      {SEGMENTS.map((s) => {
        const active = labMode === s.id
        const showBadge =
          (s.badgeKey === 'coach' && badges.coach) ||
          (s.badgeKey === 'arch' && badges.arch) ||
          (s.badgeKey === 'live' && badges.live)
        return (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => switchLabMode(s.id)}
            className={`relative flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors duration-200 md:px-4 md:text-sm ${
              active ? 'wb-segment-active' : 'wb-segment-surface hover:bg-white/40'
            }`}
            style={
              active
                ? { color: 'var(--color-text-primary)' }
                : { color: 'var(--color-text-secondary)' }
            }
          >
            {showBadge && (
              <span
                className="absolute right-2 top-2 h-2 w-2 rounded-full md:right-3"
                style={{ background: 'color-mix(in srgb, var(--color-accent-orange) 75%, #ffffff)' }}
                title="有待完成"
                aria-hidden
              />
            )}
            {s.icon(active)}
            <span className="hidden truncate lg:inline">{s.label}</span>
            <span className="lg:hidden">{s.short}</span>
          </button>
        )
      })}
    </div>
  )
}
