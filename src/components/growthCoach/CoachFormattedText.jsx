import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import { prepareCoachMarkdownSource } from '../../utils/coachTextFormat'

function mdComponents(compact, indentParagraphs) {
  const body = compact ? 'text-xs' : 'text-[0.9375rem]'
  const hTop = compact ? 'text-base' : 'text-lg'
  const hMid = compact ? 'text-sm' : 'text-base'
  const hLow = compact ? 'text-xs' : 'text-sm'
  const ind = indentParagraphs ? 'indent-[2em]' : ''

  const ink = 'text-lab-ink'

  return {
    h1: ({ children }) => (
      <h4
        className={`${hTop} mb-2 mt-6 font-bold font-display leading-snug ${ink} first:mt-0`}
        style={{ textIndent: 0 }}
      >
        {children}
      </h4>
    ),
    h2: ({ children }) => (
      <h5
        className={`${hMid} mb-2 mt-5 font-semibold font-display leading-snug ${ink} first:mt-0 ${compact ? '' : 'border-b border-lab-border-subtle pb-1.5'}`}
        style={{ textIndent: 0 }}
      >
        {children}
      </h5>
    ),
    h3: ({ children }) => (
      <h6
        className={`${hLow} mb-2 mt-4 font-semibold font-display leading-snug text-lab-ink`}
        style={{ textIndent: 0 }}
      >
        {children}
      </h6>
    ),
    h4: ({ children }) => (
      <div
        className={`${hLow} mb-1 mt-2 font-semibold leading-snug text-lab-ink`}
        style={{ textIndent: 0 }}
        role="heading"
        aria-level={4}
      >
        {children}
      </div>
    ),
    h5: ({ children }) => (
      <div
        className={`${compact ? 'text-[11px]' : 'text-xs'} mb-1 mt-2 font-medium leading-snug text-lab-ink`}
        style={{ textIndent: 0 }}
        role="heading"
        aria-level={5}
      >
        {children}
      </div>
    ),
    h6: ({ children }) => (
      <div
        className={`${compact ? 'text-[11px]' : 'text-xs'} mb-1 mt-1.5 font-medium leading-snug text-lab-muted`}
        style={{ textIndent: 0 }}
        role="heading"
        aria-level={6}
      >
        {children}
      </div>
    ),
    p: ({ children }) => (
      <p className={`${body} mb-3 ${ind} leading-relaxed ${ink} font-body last:mb-0`}>{children}</p>
    ),
    ul: ({ children }) => (
      <ul
        className={`${body} my-3 list-disc space-y-2.5 pl-5 leading-relaxed ${ink} font-body marker:text-lab-muted`}
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        className={`${body} my-3 list-decimal space-y-2.5 pl-5 leading-relaxed ${ink} font-body marker:font-semibold marker:text-lab-muted`}
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
    em: ({ children }) => <em className="italic text-lab-ink">{children}</em>,
    blockquote: ({ children }) => (
      <blockquote className="my-2 border-l-[3px] border-lab-accent py-0.5 pl-3 text-lab-muted [&_p]:indent-0 font-body">
        {children}
      </blockquote>
    ),
    code: ({ className, children, ...props }) => {
      const inline = !className
      if (inline) {
        return (
          <code className="rounded bg-lab-raised px-1 py-0.5 font-mono text-[0.85em] text-lab-ink border border-lab-border-subtle" {...props}>
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
      <pre className="my-2 overflow-x-auto rounded-lg bg-lab-raised border border-lab-border-subtle p-3 text-lab-ink">{children}</pre>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="break-all text-lab-accent-warm underline decoration-lab-border underline-offset-2 hover:text-lab-accent"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    hr: () => <hr className="my-3 border-0 border-t border-lab-border-subtle" />,
  }
}

export default function CoachFormattedText({
  text,
  className = '',
  compact = false,
  indentParagraphs = true,
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
