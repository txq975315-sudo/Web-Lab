/**
 * 将成长教练相关的大段纯文本拆成易读的段落/行，避免「通排」一坨。
 * - 尊重模型给出的 \n、\n\n
 * - 对无换行的长中文按句读切分（。！？；）
 * - 若正文不含 Markdown 结构，会先切块再用 \\n\\n 交给 react-markdown，便于段落与层次样式生效。
 */

const CJK_SENT_END = /[。！？；]/

/** 是否已由模型写成 Markdown（标题、列表、粗体、代码块等）——此类文本不再按句硬切，以免打断语法 */
export function looksStructuredMarkdown(s) {
  if (s == null || typeof s !== 'string') return false
  // 标题 / 列表 / 粗体 / 代码块 / 表格行 / 引用
  return /(^#{1,6}\s|^\s*[-*+]\s|^\s*\d+\.\s|\*\*|```|^\||^\s*>)/m.test(s)
}

function splitChineseSentences(text) {
  const out = []
  let buf = ''
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    buf += ch
    if (CJK_SENT_END.test(ch)) {
      const t = buf.trim()
      if (t) out.push(t)
      buf = ''
    }
  }
  if (buf.trim()) out.push(buf.trim())
  return out.length ? out : [text]
}

/**
 * @param {unknown} raw
 * @returns {string[][]} 外层：逻辑段；内层：该段内分行（每行一句或模型换行）
 */
export function chunkCoachText(raw) {
  if (raw == null || raw === '') return []
  const s = String(raw).replace(/\r\n/g, '\n').trim()
  if (!s) return []

  const explicitBlocks = s.split(/\n{2,}/).map(t => t.trim()).filter(Boolean)
  const result = []

  for (const block of explicitBlocks) {
    if (block.includes('\n')) {
      result.push(block.split(/\n/).map(l => l.trim()).filter(Boolean))
      continue
    }
    // 短且无句读：整段一行
    if (block.length <= 72 && !/[。！？；]/.test(block)) {
      result.push([block])
      continue
    }
    const sentences = splitChineseSentences(block)
    result.push(sentences.length ? sentences : [block])
  }
  return result
}

/**
 * 纯文本 → 适合 Markdown 渲染的字符串（块之间 \\n\\n，块内保留 \\n）
 */
export function prepareCoachMarkdownSource(raw) {
  const s = raw == null ? '' : String(raw).replace(/\r\n/g, '\n').trim()
  if (!s) return ''
  if (looksStructuredMarkdown(s)) return s
  const blocks = chunkCoachText(s)
  return blocks.map(lines => lines.join('\n')).join('\n\n')
}
