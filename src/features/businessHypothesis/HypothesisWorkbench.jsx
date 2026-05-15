const EXAMPLES = [
  {
    text: '为小型宠物店做会员管理系统，按月收费，帮店主管理客户信息和消费记录。',
    done: true,
  },
  {
    text: '做一个面向自由职业者的税务计算工具，自动生成报表。',
    done: true,
  },
  {
    text: '用 AI 帮独立开发者写产品文案和竞价竞价关键词。',
    done: false,
  },
  {
    text: '为社区团购团长做一套自动分拣和配送路线规划工具。',
    done: false,
  },
]

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 opacity-45" aria-hidden>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function HypothesisWorkbench({ draftValue, setDraftValue, onSubmit, disabled }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4 px-6 md:px-8">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-[0_1px_8px_rgba(20,20,19,0.06)]"
          style={{
            background: 'color-mix(in srgb, var(--color-accent-green) 14%, var(--color-bg-raised))',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: 'var(--color-accent-green)' }}>
            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.65" fill="color-mix(in srgb, var(--color-accent-green) 22%, transparent)" />
            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.65" fill="color-mix(in srgb, var(--color-accent-green) 22%, transparent)" />
            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.65" fill="color-mix(in srgb, var(--color-accent-green) 22%, transparent)" />
            <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.65" fill="color-mix(in srgb, var(--color-accent-green) 22%, transparent)" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold tracking-tight" style={{ color: 'var(--wb-text)' }}>
            你好，Allison
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight md:text-xl" style={{ color: 'var(--wb-text)' }}>
            有什么想法需要我帮你梳理成商业假设？
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--wb-muted)' }}>
            4轮共建引导，帮你把模糊想法变成<strong className="font-medium">可执行的商业假设画布 + 验证计划</strong>。
          </p>
        </div>
      </div>

      <div className="wb-card p-6 md:p-8" style={{ borderRadius: 'var(--wb-radius-lg)' }}>
        <h2 className="text-base font-semibold" style={{ color: 'var(--wb-text)' }}>
          开始假设构建
        </h2>

        <textarea
          value={draftValue}
          onChange={(e) => setDraftValue(e.target.value)}
          placeholder="描述你的商业想法，越详细越好…"
          rows={6}
          className="mt-4 w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(217,119,87,0.18)]"
          style={{
            border: '1px solid var(--color-border-subtle)',
            background: 'var(--color-bg-raised)',
            color: 'var(--color-text-primary)',
            boxShadow: 'inset 0 1px 2px rgba(20, 20, 19, 0.04)',
          }}
        />

        <p className="mt-4 text-xs leading-relaxed" style={{ color: 'var(--wb-muted)' }}>
          按 4轮×2问 结构引导，结束后生成商业假设画布和验证计划。已保存的会话在左侧栏「历史练习」中查看与继续。
        </p>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            disabled={disabled || !draftValue?.trim()}
            onClick={onSubmit}
            className="wb-btn-primary px-8 py-3 text-sm"
            style={{ borderRadius: 'var(--wb-radius-btn, 20px)' }}
          >
            开始构建
          </button>
        </div>
      </div>

      <div className="wb-card overflow-hidden p-0 md:p-0" style={{ borderRadius: 'var(--wb-radius-lg)' }}>
        <p
          className="px-6 pb-2 pt-5 text-xs font-semibold uppercase tracking-wide md:px-8 md:pt-6"
          style={{ color: 'var(--wb-muted)' }}
        >
          示例想法
        </p>
        <ul className="space-y-1 px-6 pb-5 md:space-y-1.5 md:px-8 md:pb-6">
          {EXAMPLES.map((ex) => (
            <li key={ex.text}>
              <button
                type="button"
                onClick={() => setDraftValue(ex.text)}
                className="flex w-full cursor-pointer items-start gap-3 rounded-xl py-3 text-left text-sm transition-colors duration-200 hover:bg-[rgba(20,20,19,0.04)]"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{
                    background: ex.done
                      ? 'color-mix(in srgb, var(--color-accent-green) 55%, var(--color-bg-base))'
                      : 'color-mix(in srgb, var(--color-text-primary) 18%, transparent)',
                  }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 leading-relaxed">{ex.text}</span>
                <ChevronRight />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
