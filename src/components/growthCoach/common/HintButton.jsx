/**
 * 渐进提示：每点一次揭示下一档文案，最多 maxHints 次
 */
export default function HintButton({ hintsUsed, maxHints, onRequest, disabled }) {
  const can = hintsUsed < maxHints && !disabled

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={!can}
        onClick={onRequest}
        className="rounded-lg border border-lab-border-subtle bg-lab-raised px-3 py-1.5 text-xs font-medium text-lab-ink transition-colors hover:bg-lab-accent-dim disabled:cursor-not-allowed disabled:opacity-45"
      >
        💡 给点提示
        <span className="ml-1 text-lab-muted">
          {hintsUsed}/{maxHints}
        </span>
      </button>
      {hintsUsed >= maxHints && (
        <p className="text-[10px] text-lab-faint">已用完本字段提示，可先回看 L4 案例或换一维再写。</p>
      )}
    </div>
  )
}
