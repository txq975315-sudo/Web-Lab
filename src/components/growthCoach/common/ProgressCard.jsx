import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { COMPETITIVE_ANALYSIS } from '../../../config/competitiveAnalysis'

const STEPS = [
  { id: 1, label: '概念', hint: 'L1', time: '3 分钟' },
  { id: 2, label: '框架', hint: 'L2', time: '5 分钟' },
  { id: 3, label: '工具包', hint: 'L3', time: '10 分钟' },
  { id: 4, label: '跟练', hint: 'L4', time: '15 分钟' },
  { id: 5, label: '实战', hint: 'L5', time: '15 分钟' },
]

/**
 * 右侧进度卡片组件
 * 显示学习进度 + 可折叠的操作方法论（四视角框架）
 * 支持两种模式：
 * 1. 通过 props 传入 phase/maxReached（GrowthCoachPanel 内使用）
 * 2. 从 localStorage 读取（RightInsightDeck 独立使用）
 */
export default function ProgressCard({ phase: propPhase, maxReached: propMaxReached }) {
  // 独立模式（无 props）时，用 tick 触发 localStorage 重读
  const [tick, setTick] = useState(0)
  const [methodologyOpen, setMethodologyOpen] = useState(false)

  useEffect(() => {
    if (propPhase != null) return
    const id = setInterval(() => setTick((t) => t + 1), 1500)
    return () => clearInterval(id)
  }, [propPhase])

  const { phase, maxReached } = useMemo(() => {
    if (propPhase != null) {
      return { phase: propPhase, maxReached: propMaxReached ?? 1 }
    }
    try {
      const stored = localStorage.getItem('growthCoach_current_step')
      const storedMax = localStorage.getItem('growthCoach_current_maxReached')
      return {
        phase: stored ? JSON.parse(stored) : null,
        maxReached: storedMax ? Number(storedMax) : 1,
      }
    } catch {
      return { phase: null, maxReached: 1 }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propPhase, propMaxReached, tick])

  const fourLayers = COMPETITIVE_ANALYSIS?.L2?.fourLayers || []

  const current =
    phase === 'intro' || phase === 'feedback'
      ? null
      : typeof phase === 'number'
        ? phase
        : null
  const allDone = phase === 'feedback'
  const isPathSelect =
    phase === 'pathSelect' || phase === 'projectMode' || phase === 'independentMode'

  const nextStep = current != null && current < 5 ? STEPS[current] : null

  const stepStatus = (id) => {
    if (allDone) return { icon: '●', color: 'text-green-500', label: '已完成' }
    if (current != null && id < current) return { icon: '●', color: 'text-green-500', label: '已完成' }
    if (current === id) return { icon: '●', color: 'text-[var(--color-brand-blue)]', label: '当前' }
    return { icon: '○', color: 'text-lab-faint', label: '未开始' }
  }

  return (
    <div className="rounded-xl border border-lab-border-subtle bg-lab-raised p-3 shadow-sm">
      {/* ====== 学习进度 ====== */}
      <h4 className="text-xs font-semibold text-lab-ink">📍 学习进度</h4>
      <ul className="mt-2 space-y-1.5">
        {STEPS.map((s) => {
          const st = stepStatus(s.id)
          const isCurrent = current === s.id
          return (
            <li key={s.id} className="flex items-center gap-2 text-[11px]">
              <span className={`${st.color} text-xs`} title={st.label}>
                {st.icon}
              </span>
              <span
                className={
                  isCurrent
                    ? 'font-medium text-lab-ink'
                    : st.label === '已完成'
                      ? 'text-lab-muted'
                      : 'text-lab-faint'
                }
              >
                {s.hint} {s.label}
              </span>
              {isCurrent && (
                <span className="ml-auto text-[10px] text-lab-faint">{s.time}</span>
              )}
            </li>
          )
        })}
      </ul>
      <div className="mt-3 border-t border-lab-border-subtle pt-2 text-[11px]">
        {allDone ? (
          <p className="text-green-500">✅ 全部完成！</p>
        ) : isPathSelect ? (
          <p className="text-[var(--color-brand-blue)]">
            当前：选择练习模式
            <br />
            <span className="text-lab-faint">下一步：L5 实战</span>
          </p>
        ) : current ? (
          <p className="text-lab-ink">
            当前：{STEPS.find((s) => s.id === current)?.hint}{' '}
            {STEPS.find((s) => s.id === current)?.label}
            {nextStep && (
              <>
                <br />
                <span className="text-lab-faint">
                  下一步：{nextStep.hint} {nextStep.label}
                </span>
              </>
            )}
          </p>
        ) : (
          <p className="text-lab-faint">准备开始</p>
        )}
      </div>

      {/* ====== 可折叠的操作方法论 ====== */}
      <div className="mt-3 border-t border-lab-border-subtle pt-2">
        <button
          type="button"
          onClick={() => setMethodologyOpen((o) => !o)}
          className="flex w-full items-center justify-between text-xs font-semibold text-lab-ink"
        >
          <span>📋 操作方法论</span>
          <span className="text-[10px] text-lab-muted">
            {methodologyOpen ? '▲ 收起' : '▼ 展开'}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {methodologyOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-2">
                <p className="text-[10px] leading-relaxed text-lab-muted">
                  <strong className="text-lab-ink">四视角拆解框架</strong>—— 竞品分析的核心方法论
                </p>
                {fourLayers.map((layer) => (
                  <div
                    key={layer.layer}
                    className="rounded-lg border border-lab-border-subtle bg-lab-overlay px-2 py-1.5"
                  >
                    <p className="text-[10px] font-semibold text-lab-ink">{layer.layer}</p>
                    <p className="mt-0.5 text-[9px] text-lab-muted">
                      看什么：{layer.look}
                    </p>
                    <p className="text-[9px] text-lab-muted">{layer.question}</p>
                    <p className="text-[9px] text-[var(--color-brand-blue)]">
                      产出：{layer.output}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
