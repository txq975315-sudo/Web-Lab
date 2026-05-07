function CheckCircle({ size = 14, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}

export default function HealthIndicator({ percentage, locked, total }) {
  const dots = 5
  const filled = Math.round((percentage / 100) * dots)
  
  if (total === 0) {
    return <span className="text-gray-300 text-xs">—</span>
  }
  
  if (percentage === 100) {
    return <CheckCircle size={14} className="text-emerald-500" />
  }
  
  return (
    <div className="flex items-center gap-0.5" title={`${locked}/${total} 决策已确定`}>
      {Array.from({ length: dots }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            i < filled ? 'bg-emerald-500' : 'border border-gray-300'
          }`}
        />
      ))}
    </div>
  )
}