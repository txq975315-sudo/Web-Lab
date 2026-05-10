import CoachFormattedText from './CoachFormattedText'

/** 与练习/评分标准对齐的固定三条（不再由 AI 生成，避免与场景职责混淆） */
const PRACTICE_RUBRIC = [
  { k: '覆盖率', t: '八维里是否都写到了？有没有漏掉对当前战局关键的一两条？' },
  { k: '真实性', t: '各维度的判断能否说清依据是公开信息还是合理推断？' },
  { k: '可行动性', t: '结论能否自然推出 1～2 条「接下来做什么」？' }
]

/**
 * 成长教练 · 知识卡片（竞品分析 P0）— Level 1～3 由 AI 生成；练习标准固定为三条
 */
export default function KnowledgeCard({ data, loading, error, onContinue, ownProductName }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-2/3 rounded bg-gray-200" />
          <div className="h-16 rounded bg-gray-100" />
          <div className="h-24 rounded bg-gray-100" />
        </div>
        <p className="mt-4 text-xs text-gray-500">正在生成知识卡片…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {error}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="flex max-h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm" style={{ maxWidth: 480 }}>
      <div className="flex-1 overflow-y-auto p-5">
        <h2 className="text-lg font-semibold" style={{ color: '#1a5f6e' }}>
          {data.title || '竞品分析'}
        </h2>

        <section className="mt-4">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-400">Level 1 · 一句话</div>
          <div className="mt-1 text-sm text-gray-800">
            <CoachFormattedText text={data.level1_one_liner} />
          </div>
        </section>

        <section className="mt-5">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-400">Level 2 · 案例</div>
          <div
            className="mt-2 rounded-lg border-l-[3px] p-3 text-sm leading-relaxed text-gray-800"
            style={{ backgroundColor: '#f5f5f0', borderLeftColor: '#c9a962' }}
          >
            <div className="font-medium text-gray-900">{data.level2_case?.title}</div>
            <div className="mt-2 text-sm">
              <CoachFormattedText text={data.level2_case?.body} />
            </div>
          </div>
        </section>

        <section className="mt-5">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-400">Level 3 · 方法论</div>
          <div
            className="relative mt-2 rounded-lg p-4 pl-6 text-sm text-gray-800"
            style={{ backgroundColor: '#e8f0f2', borderLeft: '3px solid #1a5f6e' }}
          >
            <CoachFormattedText text={data.level3_methodology} />
          </div>
        </section>

        <section className="mt-5">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-400">练习标准 · 三条</div>
          <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-600">
            下面三条是**等你在下一屏填表/被评分时**的标尺，与上面案例无冲突。练的是「
            <strong className="text-gray-800">{ownProductName || '当前项目'}</strong>
            」与场景里点名的真实竞品，不是再改 Level 2 的示范对局。
          </p>
          <ul className="mt-3 list-none space-y-2 text-sm text-gray-700">
            {PRACTICE_RUBRIC.map(({ k, t }) => (
              <li key={k} className="flex gap-2 rounded-md border border-gray-100 bg-white px-2 py-1.5">
                <span className="shrink-0 font-medium text-gray-800">{k}</span>
                <span className="leading-relaxed text-gray-600">{t}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="flex-shrink-0 space-y-2 border-t border-gray-100 p-4">
        <p className="text-center text-[11px] leading-snug text-gray-500">
          下一步：生成场景题，请你填写「
          <strong className="text-gray-700">{ownProductName || '当前项目'}</strong>
          」vs 题目里的<strong>真实竞品</strong>（场景正文会与左侧项目名对齐）。
        </p>
        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-lg py-2.5 text-sm font-medium text-white transition hover:opacity-95"
          style={{ backgroundColor: '#1a5f6e' }}
        >
          概念清楚了，开始练习 →
        </button>
      </div>
    </div>
  )
}
