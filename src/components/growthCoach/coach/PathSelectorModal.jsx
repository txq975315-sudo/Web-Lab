/**
 * 双路径练习入口选择器
 * L4 完成后显示，选择"项目绑定训练"或"独立训练"
 */
export default function PathSelectorModal({
  projectName,
  hasProject,
  onSelectProjectMode,
  onSelectIndependentMode,
}) {
  return (
    <div className="flex max-h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-lab-border-subtle bg-lab-overlay shadow-card">
      <div className="flex-shrink-0 border-b border-lab-border-subtle bg-lab-raised px-4 py-3">
        <h3 className="font-display text-sm font-semibold text-lab-ink">📋 请选择实战模式</h3>
        <p className="mt-0.5 text-[11px] text-lab-muted">
          L4 跟练完成！选择如何进入 L5 实战练习
        </p>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {/* 项目绑定模式 */}
        <div
          className={`rounded-xl border-2 p-4 transition-all ${
            hasProject
              ? 'border-[var(--color-brand-blue)] bg-[var(--color-brand-blue)]/5'
              : 'border-lab-border-subtle bg-lab-raised opacity-60'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-semibold text-lab-ink">📁 项目绑定训练</h4>
              <p className="mt-1 text-xs text-lab-muted">
                用你已有的项目 idea 进行竞品分析练习
              </p>
            </div>
            {hasProject && (
              <span className="rounded-full bg-[var(--color-brand-blue)]/10 px-2 py-0.5 text-[10px] font-medium" style={{ color: 'var(--color-brand-blue)' }}>
                推荐
              </span>
            )}
          </div>
          <div className="mt-3 space-y-1 text-xs text-lab-muted">
            {hasProject ? (
              <>
                <p>
                  <span className="font-medium text-lab-ink">当前项目：</span>
                  {projectName}
                </p>
                <p>系统自动生成针对你项目的竞品分析练习题</p>
              </>
            ) : (
              <p>当前没有绑定项目，请先在左侧工作台创建一个项目</p>
            )}
          </div>
          <button
            type="button"
            disabled={!hasProject}
            onClick={onSelectProjectMode}
            className={`mt-3 w-full rounded-lab py-2.5 text-sm font-medium font-sans disabled:opacity-50 ${
              hasProject ? 'lab-btn-primary' : 'border border-lab-border-subtle text-lab-muted bg-lab-overlay'
            }`}
          >
            {hasProject ? '选择此模式 → L5 实战' : '暂不可用'}
          </button>
        </div>

        {/* 独立训练模式 */}
        <div className="rounded-xl border-2 border-lab-border-subtle bg-lab-raised p-4 transition-all hover:border-[var(--color-brand-blue)]/50">
          <h4 className="text-sm font-semibold text-lab-ink">🔍 独立训练 · 多案例对比</h4>
          <p className="mt-1 text-xs text-lab-muted">
            从案例库选择 2-3 个真实产品进行对比分析
          </p>
          <div className="mt-3 space-y-1 text-xs text-lab-muted">
            <p>📚 案例库：40+ 真实产品组合</p>
            <p>涵盖：协同办公 / 内容社区 / 电商 / 效率工具 / 搜索 等行业</p>
          </div>
          <button
            type="button"
            onClick={onSelectIndependentMode}
            className="mt-3 w-full rounded-lab border border-lab-border-subtle py-2.5 text-sm font-medium text-lab-ink hover:bg-lab-accent-dim font-sans"
          >
            选择此模式 → 选择案例
          </button>
        </div>
      </div>
    </div>
  )
}
