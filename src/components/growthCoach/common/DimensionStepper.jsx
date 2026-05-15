/**
 * L4 只读 / L5 编辑共用的维度标签栏
 * @param {{ id: string, shortName: string }[]} props.dimensions
 * @param {number} props.index — 0-based
 * @param {(i: number) => void} props.onChange
 * @param {'view'|'edit'} props.mode
 * @param {string} [props.itemLabel='维度'] — L5 可传「字段」
 */
export default function DimensionStepper({ dimensions, index, onChange, mode, itemLabel = '维度' }) {
  const safe = Math.max(0, Math.min(dimensions.length - 1, index))

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1">
        {dimensions.map((d, i) => {
          const active = i === safe
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onChange(i)}
              className={[
                'rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
                active
                  ? 'bg-[var(--color-brand-blue)] text-white'
                  : 'bg-lab-overlay text-lab-muted ring-1 ring-lab-border-subtle hover:text-lab-ink',
              ].join(' ')}
            >
              {d.shortName}
            </button>
          )
        })}
      </div>
      <div className="text-[11px] text-lab-muted">
        {itemLabel} {safe + 1}/{dimensions.length}
        {mode === 'view' ? ' · 案例带读' : ' · 练习作答'}
      </div>
    </div>
  )
}
