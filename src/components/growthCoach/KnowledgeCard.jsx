import CoachFormattedText from './CoachFormattedText'

/** 与练习/评分标准对齐的固定三条（不再由 AI 生成，避免与场景职责混淆） */
const PRACTICE_RUBRIC = [
  { k: '覆盖率', t: '八维里是否都写到了？有没有漏掉对当前战局关键的一两条？' },
  { k: '真实性', t: '各维度的判断能否说清依据是公开信息还是合理推断？' },
  { k: '可行动性', t: '结论能否自然推出 1～2 条「接下来做什么」？' },
]

/**
 * 成长教练 · 知识卡片（竞品分析 P0）— Level 1～3 由 AI 生成；练习标准固定为三条
 */
export default function KnowledgeCard({ data, loading, error, onContinue, ownProductName }) {
  if (loading) {
    return (
      <div className="w-full rounded-xl border border-lab-border-subtle bg-lab-overlay p-6 shadow-card">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-2/3 rounded bg-lab-border-subtle" />
          <div className="h-16 rounded bg-lab-raised" />
          <div className="h-24 rounded bg-lab-raised" />
        </div>
        <p className="mt-4 text-xs text-lab-muted">正在生成知识卡片…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-lab-error/40 p-4 text-sm text-lab-error bg-[var(--color-error-dim)]">
        {error}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="flex max-h-full w-full flex-col rounded-xl border border-lab-border-subtle bg-lab-overlay shadow-card">
      <div className="flex-1 overflow-y-auto p-5">
        <h2 className="text-lg font-semibold font-display" style={{ color: 'var(--color-accent-blue)' }}>
          {data.title || '竞品分析'}
        </h2>

        <section className="mt-4">
          <div className="text-xs font-medium uppercase tracking-wide text-lab-faint">Level 1 · 一句话</div>
          <div className="mt-1 text-sm text-lab-ink">
            <CoachFormattedText text={data.level1_one_liner} />
          </div>
        </section>

        <section className="mt-5">
          <div className="text-xs font-medium uppercase tracking-wide text-lab-faint">Level 2 · 案例</div>
          <div
            className="mt-2 rounded-lg border-l-[3px] p-3 text-sm leading-relaxed text-lab-ink font-body"
            style={{
              backgroundColor: 'var(--color-bg-raised)',
              borderLeftColor: 'var(--color-accent-sand)',
            }}
          >
            <div className="font-medium text-lab-ink">{data.level2_case?.title}</div>
            <div className="mt-2 text-sm">
              <CoachFormattedText text={data.level2_case?.body} />
            </div>
          </div>
        </section>

        <section className="mt-5">
          <div className="text-xs font-medium uppercase tracking-wide text-lab-faint">Level 3 · 方法论</div>
          <div
            className="relative mt-2 rounded-lg p-4 pl-6 text-sm text-lab-ink font-body"
            style={{
              backgroundColor: 'var(--color-accent-dim)',
              borderLeft: '3px solid var(--color-accent-blue)',
            }}
          >
            <CoachFormattedText text={data.level3_methodology} />
          </div>
        </section>

        <section className="mt-5">
          <div className="text-xs font-medium uppercase tracking-wide text-lab-faint">练习标准 · 三条</div>
          <p className="mt-2 rounded-lg bg-lab-raised border border-lab-border-subtle px-3 py-2 text-xs leading-relaxed text-lab-muted font-body">
            下面三条是**等你在下一屏填表/被评分时**的标尺，与上面案例无冲突。练的是「
            <strong className="text-lab-ink">{ownProductName || '当前项目'}</strong>
            」与场景里点名的真实竞品，不是再改 Level 2 的示范对局。
          </p>
          <ul className="mt-3 list-none space-y-2 text-sm text-lab-ink">
            {PRACTICE_RUBRIC.map(({ k, t }) => (
              <li key={k} className="flex gap-2 rounded-md border border-lab-border-subtle bg-lab-overlay px-2 py-1.5">
                <span className="shrink-0 font-medium text-lab-ink">{k}</span>
                <span className="leading-relaxed text-lab-muted">{t}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="flex-shrink-0 space-y-2 border-t border-lab-border-subtle p-4">
        <p className="text-center text-[11px] leading-snug text-lab-muted">
          下一步：生成场景题，请你填写「
          <strong className="text-lab-ink">{ownProductName || '当前项目'}</strong>
          」vs 题目里的<strong>真实竞品</strong>（场景正文会与左侧项目名对齐）。
        </p>
        <button type="button" onClick={onContinue} className="w-full rounded-lab py-2.5 text-sm font-medium lab-btn-primary font-sans">
          概念清楚了，开始练习 →
        </button>
      </div>
    </div>
  )
}
