const EXAMPLES = [
  {
    text: '我想做一款帮助职场人专注的番茄钟 App，和 Forest 差异化在社群打卡。',
    done: true,
  },
  {
    text: '做一个面向大学生的兼职匹配平台，抽佣模式。',
    done: true,
  },
  {
    text: '为中小餐厅做扫码点餐 + 会员沉淀的 SaaS。',
    done: false,
  },
  {
    text: '用 AI 帮独立开发者写上架文案和 ASO 的产品。',
    done: false,
  },
]

export const STORAGE_DEPTH = 'thinking-lab-pressure-depth'

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 opacity-45" aria-hidden>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function PressureTestWorkbench({ draftValue, setDraftValue, onSubmit, disabled }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4 px-6 md:px-8">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-[0_1px_8px_rgba(20,20,19,0.06)]"
          style={{
            background: 'color-mix(in srgb, var(--color-brand-blue) 14%, var(--color-bg-raised))',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: 'var(--color-brand-blue)' }}>
            <path
              d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
              stroke="currentColor"
              strokeWidth="1.65"
              strokeLinejoin="round"
              fill="color-mix(in srgb, var(--color-brand-blue) 22%, transparent)"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold tracking-tight" style={{ color: 'var(--wb-text)' }}>
            你好，Allison
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight md:text-xl" style={{ color: 'var(--wb-text)' }}>
            有什么想法需要我帮你压力测试吗？
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--wb-muted)' }}>
            尽量写清用户、痛点与差异化；引擎将按 PRD 执行 <strong className="font-medium">3 轮 × 3 问</strong> 链式追问，并在结束后给出盲区快照。
          </p>
        </div>
      </div>

      <div className="wb-card p-6 md:p-8" style={{ borderRadius: 'var(--wb-radius-lg)' }}>
        <h2 className="text-base font-semibold" style={{ color: 'var(--wb-text)' }}>
          开始压力测试
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
          下方「实时演练」仍可使用旧版 Live Lab 追问格式；本入口进入的是<strong className="font-medium">新版结构化引擎</strong>（拆解 JSON、质检与盲区报告）。
        </p>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            disabled={disabled || !draftValue?.trim()}
            onClick={onSubmit}
            className="wb-btn-primary px-8 py-3 text-sm"
            style={{ borderRadius: 'var(--wb-radius-btn, 20px)' }}
          >
            开始测试
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
