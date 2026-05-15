import { useMemo } from 'react'
import { PERSPECTIVE_MAPPING } from '../../../config/competitiveAnalysis'

/**
 * L4 只读 / L5 编辑共用的维度标签栏
 * @param {{ id: string, shortName: string }[]} props.dimensions
 * @param {number} props.index — 0-based
 * @param {(i: number) => void} props.onChange
 * @param {'view'|'edit'|'perspective'} props.mode — perspective 模式按四视角分组
 * @param {string} [props.itemLabel='维度'] — L5 可传「字段」
 */
export default function DimensionStepper({ dimensions, index, onChange, mode, itemLabel = '维度' }) {
  const safe = Math.max(0, Math.min(dimensions.length - 1, index))

  // perspective 模式下，计算每个维度的视角归属
  const dimsWithPerspective = useMemo(() => {
    if (mode !== 'perspective' || !PERSPECTIVE_MAPPING) return dimensions
    const dimMap = {}
    for (const [, p] of Object.entries(PERSPECTIVE_MAPPING)) {
      for (const f of p.fields) {
        dimMap[f.key] = { perspectiveName: p.name, perspectiveColor: p.color }
      }
    }
    return dimensions.map((d) => ({
      ...d,
      perspective: dimMap[d.id] || null,
    }))
  }, [dimensions, mode])

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1">
        {dimsWithPerspective.map((d, i) => {
          const active = i === safe
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onChange(i)}
              className={[
                'rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
                active
                  ? 'bg-[var(--color-brand-blue)] text-white shadow-sm'
                  : 'bg-lab-overlay text-lab-muted ring-1 ring-lab-border-subtle hover:text-lab-ink',
              ].join(' ')}
              title={d.perspective ? `${d.perspective.perspectiveName} · ${d.shortName}` : d.shortName}
            >
              {d.shortName}
            </button>
          )
        })}
      </div>
      {/* perspective 模式下显示当前字段的视角归属 */}
      {mode === 'perspective' && dimsWithPerspective[safe]?.perspective && (
        <div
          className="inline-block rounded px-2 py-0.5 text-[10px] font-medium"
          style={{
            backgroundColor: dimsWithPerspective[safe].perspective.perspectiveColor + '20',
            color: dimsWithPerspective[safe].perspective.perspectiveColor,
          }}
        >
          {dimsWithPerspective[safe].perspective.perspectiveName}
        </div>
      )}
      <div className="text-[11px] text-lab-muted">
        {itemLabel} {safe + 1}/{dimensions.length}
        {mode === 'view' && ' · 案例带读'}
        {mode === 'edit' && ' · 练习作答'}
        {mode === 'perspective' && ' · 四视角 · 逐维填写'}
      </div>
    </div>
  )
}
