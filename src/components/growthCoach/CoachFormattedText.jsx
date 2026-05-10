import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import { prepareCoachMarkdownSource } from '../../utils/coachTextFormat'

function mdComponents(compact, indentParagraphs) {
  const body = compact ? 'text-xs' : 'text-[0.9375rem]'
  const hTop = compact ? 'text-base' : 'text-lg'
  const hMid = compact ? 'text-sm' : 'text-base'
  const hLow = compact ? 'text-xs' : 'text-sm'
  const ind = indentParagraphs ? 'indent-[2em]' : ''

  const ink = 'text-[#1a2a3a]'

  return {
    // Markdown # / ## / ### 映射为卡片内视觉层级（对齐「分层标题 + 列表扫读」，嵌套在面板标题下，避免跳级 h1）
    h1: ({ children }) => (
      <h4
        className={`${hTop} mb-2 mt-6 font-bold leading-snug ${ink} first:mt-0`}
        style={{ textIndent: 0 }}
      >
        {children}
      </h4>
    ),
    h2: ({ children }) => (
      <h5
        className={`${hMid} mb-2 mt-5 font-semibold leading-snug ${ink} first:mt-0 ${compact ? '' : 'border-b border-gray-200/90 pb-1.5'}`}
        style={{ textIndent: 0 }}
      >
        {children}
      </h5>
    ),
    h3: ({ children }) => (
      <h6
        className={`${hLow} mb-2 mt-4 font-semibold leading-snug text-[#1f2937]`}
        style={{ textIndent: 0 }}
      >
        {children}
      </h6>
    ),
    h4: ({ children }) => (
      <div
        className={`${hLow} mb-1 mt-2 font-semibold leading-snug text-gray-800`}
        style={{ textIndent: 0 }}
        role="heading"
        aria-level={4}
      >
        {children}
      </div>
    ),
    h5: ({ children }) => (
      <div
        className={`${compact ? 'text-[11px]' : 'text-xs'} mb-1 mt-2 font-medium leading-snug text-gray-800`}
        style={{ textIndent: 0 }}
        role="heading"
        aria-level={5}
      >
        {children}
      </div>
    ),
    h6: ({ children }) => (
      <div
        className={`${compact ? 'text-[11px]' : 'text-xs'} mb-1 mt-1.5 font-medium leading-snug text-gray-700`}
        style={{ textIndent: 0 }}
        role="heading"
        aria-level={6}
      >
        {children}
      </div>
    ),
    p: ({ children }) => (
      <p className={`${body} mb-3 ${ind} leading-relaxed ${ink} last:mb-0`}>{children}</p>
    ),
    ul: ({ children }) => (
      <ul
        className={`${body} my-3 list-disc space-y-2.5 pl-5 leading-relaxed ${ink} marker:text-[#8a9aaa]`}
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        className={`${body} my-3 list-decimal space-y-2.5 pl-5 leading-relaxed ${ink} marker:font-semibold marker:text-[#6b7280]`}
      >
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li
        className={`leading-relaxed ${ink} [&>p]:my-1.5 [&>p]:indent-0 [&_ol]:mt-2 [&_ul]:mt-2`}
      >
        {children}
      </li>
    ),
    strong: ({ children }) => <strong className={`font-semibold ${ink}`}>{children}</strong>,
    em: ({ children }) => <em className="italic text-gray-800">{children}</em>,
    blockquote: ({ children }) => (
      <blockquote className="my-2 border-l-[3px] border-teal-700/70 py-0.5 pl-3 text-gray-700 [&_p]:indent-0">
        {children}
      </blockquote>
    ),
    code: ({ className, children, ...props }) => {
      const inline = !className
      if (inline) {
        return (
          <code className="rounded bg-gray-100/90 px-1 py-0.5 font-mono text-[0.85em] text-gray-900" {...props}>
            {children}
          </code>
        )
      }
      return (
        <code className={`font-mono ${compact ? 'text-xs' : 'text-sm'}`} {...props}>
          {children}
        </code>
      )
    },
    pre: ({ children }) => (
      <pre className="my-2 overflow-x-auto rounded-lg bg-gray-100/90 p-3 text-gray-900">{children}</pre>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="break-all text-teal-800 underline decoration-teal-700/50 underline-offset-2 hover:text-teal-950"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    hr: () => <hr className="my-3 border-0 border-t border-gray-200" />
  }
}

/**
 * 成长教练长文本：**Markdown**（粗体、多级标题、有序/无序列表、引用、代码）；
 * 纯文本会先按句切段再渲染。正文段落默认 **首行缩进 2em**（可通过 indentParagraphs 关闭，如自检行内）。
 */
export default function CoachFormattedText({
  text,
  className = '',
  compact = false,
  indentParagraphs = true
}) {
  const src = prepareCoachMarkdownSource(text)
  if (!src) return null

  return (
    <div className={`coach-md max-w-none ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkBreaks]} components={mdComponents(compact, indentParagraphs)}>
        {src}
      </ReactMarkdown>
    </div>
  )
}
