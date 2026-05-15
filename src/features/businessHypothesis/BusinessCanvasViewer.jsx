/**
 * 商业假设画布展示组件
 * 优先从 session.canvas（结构化）渲染；若只有 rawMarkdown 则用 ReactMarkdown 渲染
 */
import { useMemo } from 'react'

/**
 * @param {object} props
 * @param {import('./hypothesisTypes.js').HypothesisSession|null|undefined} props.session
 */
export default function BusinessCanvasViewer({ session }) {
  const markdown = session?.canvas?.rawMarkdown || ''

  const rendered = useMemo(() => {
    if (!markdown) return null
    // 简单分段：将 Markdown 拆为章节渲染
    const sections = parseSections(markdown)
    return sections
  }, [markdown])

  if (!session?.canvas) return null

  return (
    <div className="space-y-4">
      {rendered ? (
        rendered
      ) : (
        <pre className="whitespace-pre-wrap rounded-xl border p-4 text-xs leading-relaxed" style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--wb-text)' }}>
          {markdown}
        </pre>
      )}
    </div>
  )
}

/**
 * 简单解析 Markdown 章节，渲染为结构化卡片
 */
function parseSections(md) {
  if (!md) return null

  const sections = []
  let currentSection = null
  let currentLines = []

  for (const line of md.split('\n')) {
    const hMatch = line.match(/^###\s+(.+)$/)
    if (hMatch) {
      if (currentSection && currentLines.length > 0) {
        currentSection.content = currentLines.join('\n')
        sections.push(currentSection)
      }
      currentSection = { title: hMatch[1].trim(), content: '', lines: [] }
      currentLines = []
      continue
    }
    // 不显式匹配小节时，检查 if it's a h2 separator
    if (currentSection) {
      currentLines.push(line)
    }
  }
  // 最后一段
  if (currentSection && currentLines.length > 0) {
    currentSection.content = currentLines.join('\n')
    sections.push(currentSection)
  }

  if (sections.length === 0) return null

  return sections.map((s, i) => (
    <div
      key={i}
      className="rounded-xl border px-4 py-3"
      style={{ borderColor: 'var(--color-border-subtle)', background: 'var(--color-bg-raised)' }}
    >
      <p className="mb-2 text-xs font-semibold" style={{ color: 'var(--wb-text)' }}>
        {s.title}
      </p>
      <div
        className="text-xs leading-relaxed whitespace-pre-wrap"
        style={{ color: 'var(--wb-muted)' }}
        dangerouslySetInnerHTML={{ __html: renderCanvasMdContent(s.content) }}
      />
    </div>
  ))
}

/**
 * 将 Markdown 段落转为简单的 HTML（支持表格、列表）
 */
function renderCanvasMdContent(content) {
  if (!content) return ''

  const lines = content.trim().split('\n')
  const htmlParts = []
  let inTable = false
  let tableRows = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // 跳过空行
    if (!trimmed) {
      if (inTable && tableRows.length > 0) {
        htmlParts.push(buildTableHtml(tableRows))
        tableRows = []
        inTable = false
      }
      continue
    }

    // 表格行
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed.split('|').filter(Boolean).map((c) => c.trim())
      // 跳过表头分隔行 (|---|)
      if (cells.some((c) => /^-+\s*-*$/.test(c))) continue
      if (!inTable) inTable = true
      tableRows.push(cells)
      continue
    }

    // 如果之前有未结束的表格
    if (inTable && tableRows.length > 0) {
      htmlParts.push(buildTableHtml(tableRows))
      tableRows = []
      inTable = false
    }

    // 列表项
    if (trimmed.startsWith('- ')) {
      htmlParts.push(`<li class="ml-3 list-disc">${escapeHtml(trimmed.slice(2))}</li>`)
      continue
    }

    // 普通段落
    htmlParts.push(`<p class="mb-1">${escapeHtml(trimmed)}</p>`)
  }

  // 收尾表格
  if (inTable && tableRows.length > 0) {
    htmlParts.push(buildTableHtml(tableRows))
  }

  return htmlParts.join('\n')
}

function buildTableHtml(rows) {
  const thead = rows[0]
  const tbody = rows.slice(1)
  let html = '<table class="w-full text-left text-xs border-collapse mb-2">'
  html += '<thead><tr>'
  for (const cell of thead) {
    html += `<th class="px-2 py-1.5 border-b font-medium" style="border-color:var(--color-border-subtle)">${escapeHtml(cell.replace(/[🔴🟡🟢]/g, '').trim())}</th>`
  }
  html += '</tr></thead><tbody>'
  for (const row of tbody) {
    html += '<tr>'
    for (const cell of row) {
      const withEmoji = cell.match(/[🔴🟡🟢]/) ? cell : cell
      html += `<td class="px-2 py-1.5 border-b" style="border-color:var(--color-border-subtle)">${escapeHtml(withEmoji)}</td>`
    }
    html += '</tr>'
  }
  html += '</tbody></table>'
  return html
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
