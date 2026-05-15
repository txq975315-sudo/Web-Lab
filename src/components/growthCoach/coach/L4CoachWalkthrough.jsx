import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { COMPETITIVE_ANALYSIS } from '../../../config/competitiveAnalysis'

const SWOT_STORAGE_KEY = 'growthCoach_l4_swot_thoughts'
const L4_DIMENSION_IDS = ['targetUser', 'coreFunction', 'pricing', 'growth', 'ux', 'tech', 'business', 'differentiation']

/**
 * L4 跟练 — 强制互动组件
 * 
 * 6 步结构：
 * Step 1-4：四视角分析（每步含 Coach 提问 → 用户思考 → 解锁答案）
 *   将 8 维度按四视角归并为 4 步
 * Step 5：SWOT 推导（4 象限逐一提问，每象限独立输入+解锁）
 * Step 6：SWOT 策略选择（SO/WO/ST/WT 单选 + 差异化定位）
 * 
 * 每步状态机：questioning → thinking(用户已输入) → revealed(已解锁)
 */
export default function L4CoachWalkthrough({ onNext }) {
  const { L4 } = COMPETITIVE_ANALYSIS
  const byDimension = L4.byDimension

  // ========== 步骤定义 ==========
  const perspectiveSteps = [
    {
      id: 'perspective_1',
      label: '用户视角层',
      dimensions: ['targetUser'],
      desc: '谁在用？帮用户做了什么？',
    },
    {
      id: 'perspective_2',
      label: '产品功能层',
      dimensions: ['coreFunction'],
      desc: '功能与差异',
    },
    {
      id: 'perspective_3',
      label: '用户体验层',
      dimensions: ['pricing', 'growth', 'ux', 'tech'],
      desc: '路径与痛点',
    },
    {
      id: 'perspective_4',
      label: '业务视角层',
      dimensions: ['business', 'differentiation'],
      desc: '商业化与运营',
    },
  ]

  const TOTAL_STEPS = 6 // 4 perspective + 1 SWOT + 1 strategy
  const SWOT_INDEX = 4 // 0-based: step 5
  const STRATEGY_INDEX = 5 // 0-based: step 6

  // ========== 状态 ==========
  const [currentStep, setCurrentStep] = useState(0)
  // 各维度的解锁状态
  const [revealedSet, setRevealedSet] = useState(new Set())
  // 用户输入
  const [userThoughts, setUserThoughts] = useState({})
  // SWOT 策略选择
  const [selectedStrategy, setSelectedStrategy] = useState(null)
  const [differentiationText, setDifferentiationText] = useState('')
  // 输入展开
  const [thinkingOpen, setThinkingOpen] = useState({})

  // 加载 localStorage 中的 SWOT 思考
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SWOT_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setUserThoughts((prev) => ({ ...prev, ...parsed }))
      }
    } catch { /* ignore */ }
  }, [])

  // 保存 SWOT 思考到 localStorage
  const saveThoughtToStorage = useCallback((dimId, text) => {
    try {
      const existing = JSON.parse(localStorage.getItem(SWOT_STORAGE_KEY) || '{}')
      existing[dimId] = text
      localStorage.setItem(SWOT_STORAGE_KEY, JSON.stringify(existing))
    } catch { /* ignore */ }
  }, [])

  // 获取当前维度信息
  const getStepInfo = (index) => {
    if (index < 4) {
      const ps = perspectiveSteps[index]
      const dims = ps.dimensions.map((id) => byDimension.find((d) => d.id === id)).filter(Boolean)
      return {
        type: 'perspective',
        label: ps.label,
        desc: ps.desc,
        coachQuestion: dims[0]?.coachQuestion || '请思考这个维度的竞品分析...',
        coachAnswer: dims.map((d) => d.coach).filter(Boolean).join('\n\n'),
        miss: dims.map((d) => d.miss).filter(Boolean).join('\n'),
        takeaway: dims.map((d) => d.takeaway).filter(Boolean).join('\n'),
        subTitle: `${ps.label} · ${ps.desc}`,
      }
    }
    if (index === SWOT_INDEX) {
      return {
        type: 'swot',
        label: 'SWOT 推导',
        desc: '四象限逐一分析',
        subTitle: 'SWOT 分析 · 每个象限独立思考',
        swot: L4.swot,
      }
    }
    if (index === STRATEGY_INDEX) {
      return {
        type: 'strategy',
        label: '策略选择',
        desc: '选择你的 SWOT 策略',
        subTitle: 'SWOT 策略选择 · 基于你的分析做出决策',
      }
    }
    return { type: 'unknown', label: '', desc: '', subTitle: '' }
  }

  const stepInfo = getStepInfo(currentStep)

  // 判断当前步是否已解锁
  const isStepRevealed = () => {
    if (currentStep < 4) {
      const ps = perspectiveSteps[currentStep]
      return ps.dimensions.every((id) => revealedSet.has(id))
    }
    if (currentStep === SWOT_INDEX) {
      return L4.swot.quadrants.every((q) => revealedSet.has(q.id))
    }
    if (currentStep === STRATEGY_INDEX) {
      return selectedStrategy != null && differentiationText.trim().length >= 5
    }
    return false
  }

  // 是否可以进入下一步
  const canProceed = isStepRevealed()

  // 解锁当前步
  const handleReveal = () => {
    if (currentStep < 4) {
      const ps = perspectiveSteps[currentStep]
      const newSet = new Set(revealedSet)
      ps.dimensions.forEach((id) => newSet.add(id))
      setRevealedSet(newSet)
    } else if (currentStep === SWOT_INDEX) {
      const newSet = new Set(revealedSet)
      L4.swot.quadrants.forEach((q) => newSet.add(q.id))
      setRevealedSet(newSet)
    }
  }

  // 用户输入（per dimension）
  const handleThoughtChange = (dimId, text) => {
    setUserThoughts((prev) => ({ ...prev, [dimId]: text }))
    if (dimId.startsWith('perspective_') || dimId.startsWith('strength') || dimId.startsWith('weakness') || 
        dimId.startsWith('opportunity') || dimId.startsWith('threat')) {
      saveThoughtToStorage(dimId, text)
    }
  }

  // 展开/收起输入区
  const toggleThinking = (dimId) => {
    setThinkingOpen((prev) => ({ ...prev, [dimId]: !prev[dimId] }))
  }

  // 渲染 SWOT 象限
  const renderSwotQuadrant = (q) => {
    const revealed = revealedSet.has(q.id)
    const thought = userThoughts[q.id] || ''
    const isThinking = thinkingOpen[q.id]

    return (
      <div key={q.id} className="rounded-lg border border-lab-border-subtle bg-lab-raised p-3">
        <h4 className="text-xs font-bold" style={{ color: 'var(--color-brand-blue)' }}>
          {q.name}
        </h4>
        {/* Coach 提问 */}
        <div className="mt-2 rounded-md bg-[var(--color-warning-dim)]/20 px-3 py-2 text-xs text-lab-ink">
          🎤 {q.coachQuestion}
        </div>

        {/* 用户思考 */}
        {!isThinking && !thought && (
          <button
            type="button"
            onClick={() => toggleThinking(q.id)}
            className="mt-2 text-[11px] text-lab-muted underline hover:text-lab-ink"
          >
            [输入我的想法]
          </button>
        )}
        {(isThinking || thought) && (
          <div className="mt-2">
            <textarea
              className="w-full resize-y rounded-lg border border-lab-border bg-lab-overlay px-2 py-1.5 text-xs text-lab-ink placeholder:text-lab-faint focus:border-lab-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-lab-accent font-body"
              rows={3}
              value={thought}
              placeholder="先别急着看答案，试着自己想想..."
              onChange={(e) => handleThoughtChange(q.id, e.target.value)}
            />
            {thought && (
              <button
                type="button"
                onClick={() => toggleThinking(q.id)}
                className="mt-1 text-[10px] text-lab-muted underline"
              >
                [收起]
              </button>
            )}
          </div>
        )}

        {/* 解锁并显示答案 */}
        {!revealed ? (
          <button
            type="button"
            onClick={() => {
              const newSet = new Set(revealedSet)
              newSet.add(q.id)
              setRevealedSet(newSet)
            }}
            className="mt-2 rounded-md border border-lab-border-subtle px-3 py-1 text-[11px] text-lab-muted hover:bg-lab-accent-dim"
          >
            [看教练怎么想]
          </button>
        ) : (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-2 space-y-2 overflow-hidden"
          >
            <div className="rounded-md bg-lab-overlay px-3 py-2 text-xs text-lab-ink ring-1 ring-lab-border-subtle">
              <span className="font-semibold text-lab-ink">💡 Coach 思考：</span>
              <p className="mt-1 whitespace-pre-wrap">{q.coachAnswer}</p>
            </div>
            <div className="rounded-md bg-[var(--color-warning-dim)]/15 px-3 py-2 text-xs">
              <span className="font-semibold">⚠️ 容易漏掉：</span>
              <p className="mt-0.5 text-lab-muted">{q.miss}</p>
            </div>
            <div className="rounded-md bg-[var(--color-brand-blue)]/10 px-3 py-2 text-xs">
              <span className="font-semibold" style={{ color: 'var(--color-brand-blue)' }}>🔍 对你有什么启发：</span>
              <p className="mt-0.5">{q.takeaway}</p>
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  // 渲染策略选择
  const renderStrategy = () => {
    const options = L4.swot.strategyOptions
    return (
      <div className="space-y-3">
        <p className="text-xs text-lab-muted">
          基于你的 SWOT 分析，选择最适合的策略方向：
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((opt) => {
            const isSelected = selectedStrategy === opt.id
            const colorMap = {
              blue: 'var(--color-brand-blue)',
              green: '#10b981',
              orange: '#f59e0b',
              red: '#ef4444',
            }
            const color = colorMap[opt.color] || 'var(--color-brand-blue)'
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedStrategy(opt.id)}
                className={[
                  'rounded-lg border-2 p-3 text-left transition-all',
                  isSelected
                    ? 'shadow-sm'
                    : 'border-lab-border-subtle hover:bg-lab-accent-dim',
                ].join(' ')}
                style={{
                  borderColor: isSelected ? color : undefined,
                  backgroundColor: isSelected ? color + '10' : undefined,
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {isSelected ? '✓' : opt.id.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-lab-ink">{opt.fullName}</div>
                    <div className="text-[10px] text-lab-muted">{opt.description}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* 差异化定位 */}
        <div className="rounded-lg border border-lab-border-subtle bg-lab-raised p-3">
          <h4 className="text-xs font-semibold text-lab-ink">
            差异化定位 <span className="text-lab-faint font-normal">（一句话）</span>
          </h4>
          <p className="mt-1 text-[11px] text-lab-muted">
            用一句话说清楚：「我们是谁、为谁、提供什么独特价值？」
          </p>
          <textarea
            className="mt-2 w-full resize-y rounded-lg border border-lab-border bg-lab-overlay px-2 py-1.5 text-xs text-lab-ink placeholder:text-lab-faint focus:border-lab-accent focus:outline-none font-body"
            rows={3}
            value={differentiationText}
            placeholder="例如：我们是一款为职场白领设计的社交化专注工具，提供团队竞赛和陪伴式监督的独特体验..."
            onChange={(e) => setDifferentiationText(e.target.value)}
          />
        </div>
      </div>
    )
  }

  // 渲染透视分析步骤
  const renderPerspectiveStep = (info) => {
    const revealed = isStepRevealed()
    const dimId = `perspective_${currentStep + 1}`
    const thought = userThoughts[dimId] || ''
    const isThinking = thinkingOpen[dimId]

    return (
      <div className="space-y-3">
        {/* Coach 提问 */}
        <div className="rounded-lg border border-lab-border-subtle bg-[var(--color-warning-dim)]/10 p-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">🎤</span>
            <span className="text-xs font-semibold text-lab-ink">Coach 提问</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-lab-ink">{info.coachQuestion}</p>
        </div>

        {/* 用户思考 */}
        {!isThinking && !thought && (
          <button
            type="button"
            onClick={() => toggleThinking(dimId)}
            className="text-[11px] text-lab-muted underline hover:text-lab-ink"
          >
            [输入我的想法]
          </button>
        )}
        {(isThinking || thought) && (
          <div>
            <textarea
              className="w-full resize-y rounded-lg border border-lab-border bg-lab-overlay px-2 py-1.5 text-xs text-lab-ink placeholder:text-lab-faint focus:border-lab-accent focus:outline-none font-body"
              rows={3}
              value={thought}
              placeholder="先别急着看答案，试着自己想想..."
              onChange={(e) => handleThoughtChange(dimId, e.target.value)}
            />
            {thought && (
              <button
                type="button"
                onClick={() => toggleThinking(dimId)}
                className="mt-1 text-[10px] text-lab-muted underline"
              >
                [收起]
              </button>
            )}
          </div>
        )}

        {/* 解锁/答案 */}
        {!revealed ? (
          <button
            type="button"
            onClick={handleReveal}
            className="w-full rounded-lab border border-lab-border-subtle py-2 text-xs text-lab-ink hover:bg-lab-accent-dim"
          >
            [看教练怎么想]
          </button>
        ) : (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-2 overflow-hidden"
          >
            <div className="rounded-md bg-lab-overlay px-3 py-2 text-xs text-lab-ink ring-1 ring-lab-border-subtle">
              <span className="font-semibold">💡 Coach 思考：</span>
              <p className="mt-1 whitespace-pre-wrap">{info.coachAnswer}</p>
            </div>
            <div className="rounded-md bg-[var(--color-warning-dim)]/15 px-3 py-2 text-xs">
              <span className="font-semibold">⚠️ 容易漏掉：</span>
              <p className="mt-0.5 text-lab-muted">{info.miss}</p>
            </div>
            <div className="rounded-md bg-[var(--color-brand-blue)]/10 px-3 py-2 text-xs">
              <span className="font-semibold" style={{ color: 'var(--color-brand-blue)' }}>🔍 对你有什么启发：</span>
              <p className="mt-0.5">{info.takeaway}</p>
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <div className="flex max-h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-lab-border-subtle bg-lab-overlay shadow-card">
      {/* 头部 */}
      <div className="flex-shrink-0 border-b border-lab-border-subtle bg-lab-raised px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm font-semibold text-lab-ink">L4 跟练 · 案例带做</h3>
            <p className="mt-0.5 text-[11px] text-lab-muted">
              {L4.product.name} · {L4.product.subtitle}
            </p>
          </div>
          <div className="text-right">
            <span className="rounded-md bg-[var(--color-brand-blue)]/10 px-2 py-0.5 text-[11px] font-medium" style={{ color: 'var(--color-brand-blue)' }}>
              {stepInfo.subTitle}
            </span>
          </div>
        </div>
        <div className="mt-2 text-[11px] text-lab-muted">
          步骤 {currentStep + 1}/{TOTAL_STEPS} · {stepInfo.label}
          {canProceed && ' ✅'}
        </div>
      </div>

      {/* 内容区 */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {currentStep < 4 && renderPerspectiveStep(stepInfo)}
        
        {currentStep === SWOT_INDEX && (
          <div className="space-y-4">
            <div className="rounded-lg border border-lab-border-subtle bg-lab-raised p-3">
              <p className="text-xs leading-relaxed text-lab-ink">
                四视角分析完了，现在是最关键的一步——用 SWOT 推导出我们的策略。
                每个象限独立思考并填写，完成后逐一解锁 Coach 点评。
              </p>
            </div>
            {L4.swot.quadrants.map(renderSwotQuadrant)}
          </div>
        )}

        {currentStep === STRATEGY_INDEX && renderStrategy()}
      </div>

      {/* 底部导航 */}
      <div className="flex-shrink-0 space-y-2 border-t border-lab-border-subtle p-4">
        <div className="flex gap-2">
          <button
            type="button"
            disabled={currentStep <= 0}
            onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
            className="flex-1 rounded-lab border border-lab-border-subtle py-2 text-sm text-lab-muted hover:bg-lab-accent-dim disabled:opacity-40"
          >
            ← 上一步
          </button>
          {currentStep < TOTAL_STEPS - 1 ? (
            <button
              type="button"
              disabled={!canProceed}
              onClick={() => {
                if (canProceed) setCurrentStep((p) => Math.min(TOTAL_STEPS - 1, p + 1))
              }}
              className="flex-1 rounded-lab py-2 text-sm font-medium lab-btn-primary font-sans disabled:opacity-50"
            >
              下一步 → {currentStep + 2}/{TOTAL_STEPS} {!canProceed && '（需先解锁）'}
            </button>
          ) : (
            <button
              type="button"
              disabled={!canProceed}
              onClick={onNext}
              className="flex-1 rounded-lab py-2.5 text-sm font-medium lab-btn-primary font-sans disabled:opacity-50"
            >
              {canProceed ? '完成跟练 → 去练习' : '请先完成策略选择'}
            </button>
          )}
        </div>
        {currentStep < TOTAL_STEPS - 1 && !canProceed && (
          <p className="text-center text-[10px] text-lab-muted">
            💡 需要先解锁当前步骤才能继续
          </p>
        )}
      </div>
    </div>
  )
}
