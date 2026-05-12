import { useEffect, useRef, useState } from 'react'
import { useLab } from '../context/LabContext'

const BG_URL = '/backgrounds/bg-figma-sky.jpg'

const INTRO_DELAY_MS = 1000

/** 顶栏白底：与 workbench-prd --wb-landing-nav-* 对齐 */
const NAV_BAR_BG = 'var(--wb-landing-nav-bg, rgba(255, 255, 255, 0.68))'
const NAV_BAR_BLUR = 'var(--wb-landing-nav-blur, 16px)'
const NAV_BAR_BORDER = 'var(--wb-landing-nav-border-bottom, rgba(255, 255, 255, 0.45))'
const NAV_BAR_INSET = 'var(--wb-landing-nav-inset, 0 1px 0 rgba(255, 255, 255, 0.35) inset)'

/** 中部导航文字：#000000 @ 50%（无底纹） */
const NAV_LINK_TEXT = 'rgba(0, 0, 0, 0.5)'

/** 图4 标签：约 5% 白 + 玻璃模糊 */
const AI_BADGE_GLASS = {
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255, 255, 255, 0.22)',
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12)',
}

/** 功能卡标题：文艺柔和（霞鹜文楷 + Lora 衬线回退） */
const FEATURE_TITLE_FONT =
  "'LXGW WenKai', 'Lora', 'PingFang SC', 'Microsoft YaHei', 'Noto Serif SC', serif"

/** 功能页 card：#FFFFFF 5% + 玻璃模糊（设计稿圆角 24） */
const FEATURE_CARD_GLASS = {
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.28)',
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 8px 32px rgba(20, 20, 19, 0.06)',
}

const FEATURES = [
  {
    id: 'live',
    title: '压力测试',
    titleEn: 'Stress Test',
    desc: 'AI 反复追问，训练商业洞察力和产品思维，梳理完整项目树。',
    descEn: 'Repeated AI questioning trains business insight and product thinking, building a complete project tree.',
  },
  {
    id: 'coach',
    title: '成长教练',
    titleEn: 'Growth Coach',
    desc: '案例教学 + 任务模拟 + AI 评分，边学边练，实现商业化学习闭环。',
    descEn: 'Case studies, task simulations, and AI scoring enable learning-by-doing for business skill growth.',
  },
  {
    id: 'archaeology',
    title: '对话考古',
    titleEn: 'Archaeology Lab',
    desc: '粘贴历史对话，人机协作分析，复盘决策并生成行动项。',
    descEn: 'Paste past conversations, analyze with AI, review decisions, and generate action items.',
  },
]

export default function LandingScrollExperience() {
  const { switchLabMode } = useLab()
  const scrollerRef = useRef(null)
  const featuresRef = useRef(null)
  const [introRevealed, setIntroRevealed] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setIntroRevealed(true), INTRO_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [])

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div
      ref={scrollerRef}
      className="landing-scroll-root relative h-screen snap-y snap-mandatory overflow-y-auto overflow-x-hidden font-sans"
    >
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BG_URL})`, backgroundColor: '#e6f0f8' }}
        aria-hidden
      />

      {/* 首屏：云底 + 三块主内容（无整体黑底） */}
      <section className="relative flex min-h-[100vh] snap-start flex-col items-center justify-center px-5 pb-14 pt-[5.5rem] md:px-10 md:pt-24">
        <div
          className={`mx-auto flex w-full max-w-3xl flex-col items-center gap-8 text-center transition-opacity duration-700 ease-out md:gap-10 ${
            introRevealed ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          {/* 块 1：人工智能标签 — 约 5% 透明玻璃质感 */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium text-white md:text-sm"
            style={AI_BADGE_GLASS}
          >
            <span className="h-2 w-2 shrink-0 rounded-sm bg-[#22c55e]" aria-hidden />
            <span className="font-display tracking-tight">Artificial Intelligence 人工智能</span>
          </div>

          {/* 块 2：标语 — 无底纹，叠在云图上 */}
          <div className="max-w-2xl space-y-4 px-1">
            <p
              className="font-display text-lg font-semibold leading-relaxed text-white md:text-xl"
              style={{ textShadow: '0 1px 18px rgba(0,0,0,0.25), 0 0 2px rgba(0,0,0,0.15)' }}
            >
              让每一个创意都有落地的可能，让每一次决策都有数据的支撑。
            </p>
            <p
              className="font-display text-base italic leading-relaxed text-white/95 md:text-lg"
              style={{ textShadow: '0 1px 14px rgba(0,0,0,0.22)' }}
            >
              Turn every idea into action, and every decision into insight.
            </p>
          </div>

          {/* 块 3：CTA — 白底黑字 */}
          <button
            type="button"
            onClick={scrollToFeatures}
            className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[#0a0a0a] shadow-md transition-transform hover:-translate-y-0.5 md:text-base"
          >
            Discover Thinking Lab / 探索思维训练 AI
            <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>
              ›
            </span>
          </button>
        </div>
      </section>

      <section
        ref={featuresRef}
        className="relative flex min-h-[100vh] snap-start flex-col items-center justify-center px-6 py-16 md:px-12 md:py-20"
      >
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-stretch gap-10 md:grid-cols-3 md:gap-8">
          {FEATURES.map((f) => (
            <div
              key={f.id}
              role="button"
              tabIndex={0}
              aria-label={`进入${f.title}`}
              onClick={() => switchLabMode(f.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  switchLabMode(f.id)
                }
              }}
              className="group flex cursor-pointer flex-col text-left outline-none transition-transform duration-300 focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent hover:-translate-y-1"
            >
              <h3
                className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xl font-medium leading-relaxed tracking-wide text-black md:mb-6 md:text-[1.35rem]"
                style={{ fontFamily: FEATURE_TITLE_FONT }}
              >
                <span className="h-2 w-2 shrink-0 rounded-sm bg-[#22c55e]" aria-hidden />
                <span>{f.title}</span>
                <span className="font-medium text-black/80">（{f.titleEn}）</span>
              </h3>
              <div
                className="flex min-h-0 flex-1 flex-col rounded-[24px] p-8 transition-shadow duration-300 group-hover:shadow-xl"
                style={FEATURE_CARD_GLASS}
              >
                <p
                  className="flex-1 text-sm leading-relaxed text-white"
                  style={{ textShadow: '0 1px 12px rgba(0,0,0,0.2)' }}
                >
                  {f.desc}
                </p>
                <p
                  className="mt-3 text-xs leading-relaxed text-white/85"
                  style={{ textShadow: '0 1px 10px rgba(0,0,0,0.18)' }}
                >
                  {f.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 顶栏：横向通铺；白底 60–75%；中部链接区黑 50% fill */}
      <header
        className={`fixed left-0 right-0 top-0 z-30 w-full transition-transform duration-500 ease-out ${
          introRevealed ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ pointerEvents: introRevealed ? 'auto' : 'none' }}
      >
        <div
          className="flex w-full items-stretch justify-between gap-3 px-4 py-2 md:gap-6 md:px-8 md:py-2.5"
          style={{
            background: NAV_BAR_BG,
            backdropFilter: `blur(${NAV_BAR_BLUR})`,
            WebkitBackdropFilter: `blur(${NAV_BAR_BLUR})`,
            borderBottom: `1px solid ${NAV_BAR_BORDER}`,
            boxShadow: NAV_BAR_INSET,
          }}
        >
          <div className="flex shrink-0 items-center justify-center" style={{ color: 'var(--color-brand-blue, #00aaff)' }} aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path
                d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <nav className="flex min-w-0 flex-1 items-center justify-center px-2 md:px-6">
            <div
              className="flex max-w-full flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs md:gap-x-8 md:text-sm"
              style={{ color: NAV_LINK_TEXT }}
            >
              <span className="cursor-default whitespace-nowrap font-display">Product 产品</span>
              <span className="cursor-default whitespace-nowrap font-display">Introduction 介绍</span>
              <span className="cursor-default whitespace-nowrap font-display">Information 信息</span>
            </div>
          </nav>

          <div className="flex shrink-0 items-center">
            <button
              type="button"
              className="rounded-full bg-[#141312] px-3 py-1 text-[11px] font-semibold leading-tight text-white md:px-3.5 md:py-1.5 md:text-xs"
              disabled
            >
              待开放
            </button>
          </div>
        </div>
      </header>
    </div>
  )
}
