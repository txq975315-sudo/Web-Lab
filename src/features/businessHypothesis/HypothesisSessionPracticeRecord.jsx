/**
 * 商业假设构建器 — 练习记录回放组件
 */
import { ROUND_META } from './hypothesisTypes.js'

/**
 * @param {object} props
 * @param {import('./hypothesisTypes.js').HypothesisSession|null|undefined} props.session
 */
export function HypothesisPracticeRecordSection({ session }) {
  if (!session?.rounds?.length) return null
  const rounds = session.rounds.filter((r) =>
    (r.questions || []).some((q) => (q.questionText || '').trim()),
  )
  if (rounds.length === 0) return null

  return (
    <section className="rounded-xl border px-3 py-3 md:px-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--wb-muted)' }}>
        练习记录
      </p>
      {session.originalIdea ? (
        <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--wb-text)' }}>
          <span className="font-medium">原始想法：</span>
          <span className="whitespace-pre-wrap">{session.originalIdea}</span>
        </p>
      ) : null}
      <div className="mt-3 max-h-[min(40vh,22rem)] space-y-4 overflow-y-auto pr-1">
        {rounds.map((r) => (
          <div key={r.roundIndex}>
            <p className="text-xs font-semibold" style={{ color: 'var(--wb-text)' }}>
              第 {r.roundIndex} 轮 · {r.roundName}
            </p>
            <ul className="mt-2 space-y-3">
              {(r.questions || []).map((q, qi) => {
                if (!(q.questionText || '').trim()) return null
                const answered = Boolean((q.answerText || '').trim())
                return (
                  <li
                    key={`${r.roundIndex}-${q.questionIndex ?? qi}`}
                    className="rounded-lg border px-3 py-2 text-xs leading-relaxed"
                    style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--wb-text)' }}
                  >
                    <p className="font-medium" style={{ color: 'var(--wb-muted)' }}>
                      问{q.questionIndex ?? qi + 1}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">{q.questionText}</p>
                    <p className="mt-2 border-t pt-2 text-[11px]" style={{ borderColor: 'var(--color-border-subtle)' }}>
                      <span className="font-medium" style={{ color: 'var(--wb-muted)' }}>
                        答：
                      </span>
                      {answered ? (
                        <span className="whitespace-pre-wrap">{q.answerText}</span>
                      ) : (
                        <span className="italic opacity-70">（尚未作答）</span>
                      )}
                    </p>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
