import { useState, useMemo } from 'react'
import { CASE_LIBRARY } from '../../../config/competitiveAnalysis'

/**
 * 独立训练面板
 * 从案例库选择 2-3 个真实产品，或自行输入竞品名
 */
export default function IndependentPracticePanel({ onConfirm }) {
  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState('')
  const [customInput, setCustomInput] = useState('')
  const [activeCategory, setActiveCategory] = useState('全部')

  // 提取所有行业分类
  const categories = useMemo(() => {
    const cats = ['全部', ...new Set(CASE_LIBRARY.map((p) => p.category))]
    return cats
  }, [])

  // 按筛选条件过滤案例
  const filtered = useMemo(() => {
    let list = CASE_LIBRARY
    if (activeCategory !== '全部') {
      list = list.filter((p) => p.category === activeCategory)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.desc.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    }
    return list
  }, [search, activeCategory])

  // 切换选择
  const toggleProduct = (product) => {
    setSelected((prev) => {
      const exists = prev.find((p) => p.id === product.id)
      if (exists) return prev.filter((p) => p.id !== product.id)
      if (prev.length >= 3) return prev // 最多 3 个
      return [...prev, product]
    })
  }

  // 添加自定义产品
  const addCustom = () => {
    const name = customInput.trim()
    if (!name) return
    const id = `custom_${Date.now()}`
    const product = { id, name, desc: '自行输入的竞品', category: '自定义' }
    setSelected((prev) => {
      if (prev.length >= 3) return prev
      return [...prev, product]
    })
    setCustomInput('')
  }

  const canConfirm = selected.length >= 2

  return (
    <div className="flex max-h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-lab-border-subtle bg-lab-overlay shadow-card">
      <div className="flex-shrink-0 border-b border-lab-border-subtle bg-lab-raised px-4 py-3">
        <h3 className="font-display text-sm font-semibold text-lab-ink">选择要分析的竞品</h3>
        <p className="mt-0.5 text-[11px] text-lab-muted">
          从案例库选择 2-3 个真实产品，或自行输入竞品名称
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {/* 已选计数 */}
        <div className="flex items-center justify-between rounded-lg bg-lab-raised px-3 py-2 text-xs">
          <span className="text-lab-ink">
            已选：<strong>{selected.length}</strong>/3
          </span>
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selected.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1 rounded-md bg-[var(--color-brand-blue)]/10 px-2 py-0.5 text-[10px]"
                  style={{ color: 'var(--color-brand-blue)' }}
                >
                  {p.name}
                  <button
                    type="button"
                    onClick={() => toggleProduct(p)}
                    className="ml-0.5 hover:opacity-70"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 搜索和分类筛选 */}
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索产品..."
            className="flex-1 rounded-lg border border-lab-border bg-lab-overlay px-2 py-1.5 text-xs text-lab-ink placeholder:text-lab-faint focus:border-lab-accent focus:outline-none"
          />
          <div className="flex gap-1 overflow-x-auto">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="自行输入产品名..."
              className="w-36 rounded-lg border border-lab-border bg-lab-overlay px-2 py-1.5 text-xs text-lab-ink placeholder:text-lab-faint focus:border-lab-accent focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') addCustom()
              }}
            />
            <button
              type="button"
              onClick={addCustom}
              disabled={!customInput.trim() || selected.length >= 3}
              className="shrink-0 rounded-lg border border-lab-border-subtle px-2 py-1.5 text-[11px] text-lab-muted hover:bg-lab-accent-dim disabled:opacity-40"
            >
              添加
            </button>
          </div>
        </div>

        {/* 分类标签 */}
        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={[
                'rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors',
                activeCategory === cat
                  ? 'bg-[var(--color-brand-blue)] text-white'
                  : 'bg-lab-overlay text-lab-muted ring-1 ring-lab-border-subtle hover:text-lab-ink',
              ].join(' ')}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 案例列表 */}
        <div className="grid gap-2 sm:grid-cols-2">
          {filtered.map((product) => {
            const isSelected = selected.some((p) => p.id === product.id)
            const disabled = selected.length >= 3 && !isSelected
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => toggleProduct(product)}
                disabled={disabled}
                className={[
                  'rounded-lg border p-3 text-left transition-all',
                  isSelected
                    ? 'border-[var(--color-brand-blue)] bg-[var(--color-brand-blue)]/5'
                    : 'border-lab-border-subtle bg-lab-raised hover:bg-lab-accent-dim',
                  disabled ? 'opacity-40' : '',
                ].join(' ')}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-lab-ink">
                    {isSelected ? '☑ ' : '☐ '}
                    {product.name}
                  </span>
                  <span className="rounded bg-lab-overlay px-1.5 py-0.5 text-[9px] text-lab-faint ring-1 ring-lab-border-subtle">
                    {product.category}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-lab-muted">{product.desc}</p>
              </button>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <p className="py-8 text-center text-xs text-lab-muted">未找到匹配的产品</p>
        )}
      </div>

      {/* 底部 */}
      <div className="flex-shrink-0 space-y-2 border-t border-lab-border-subtle p-4">
        <button
          type="button"
          disabled={!canConfirm}
          onClick={() => onConfirm(selected)}
          className="w-full rounded-lab py-2.5 text-sm font-medium lab-btn-primary font-sans disabled:opacity-50"
        >
          {canConfirm
            ? `开始分析（${selected.map((p) => p.name).join(' vs ')}）`
            : `请至少选择 2 个产品（当前 ${selected.length}/3）`}
        </button>
      </div>
    </div>
  )
}
