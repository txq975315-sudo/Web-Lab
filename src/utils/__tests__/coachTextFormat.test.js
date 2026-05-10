import { describe, it, expect } from 'vitest'
import { chunkCoachText, looksStructuredMarkdown, prepareCoachMarkdownSource } from '../coachTextFormat'

describe('chunkCoachText', () => {
  it('respects double newlines as paragraphs', () => {
    const r = chunkCoachText('第一段。\n\n第二段。')
    expect(r.length).toBe(2)
    expect(r[0].join('')).toContain('第一段')
    expect(r[1].join('')).toContain('第二段')
  })

  it('splits single-line Chinese by sentence endings', () => {
    const r = chunkCoachText('这是第一句。这是第二句！第三句？')
    expect(r.length).toBe(1)
    expect(r[0].length).toBe(3)
  })

  it('handles explicit single newlines inside a section', () => {
    const r = chunkCoachText('行一\n行二')
    expect(r.length).toBe(1)
    expect(r[0]).toEqual(['行一', '行二'])
  })
})

describe('looksStructuredMarkdown', () => {
  it('detects headings and lists', () => {
    expect(looksStructuredMarkdown('# 标题')).toBe(true)
    expect(looksStructuredMarkdown('- 列表项')).toBe(true)
    expect(looksStructuredMarkdown('**粗**')).toBe(true)
    expect(looksStructuredMarkdown('纯文本一句。')).toBe(false)
  })
})

describe('prepareCoachMarkdownSource', () => {
  it('passes through markdown-ish content unchanged', () => {
    const md = '## 标题\n- a\n- b'
    expect(prepareCoachMarkdownSource(md)).toBe(md)
  })

  it('chunks plain text into paragraphs', () => {
    const src = prepareCoachMarkdownSource('第一句。第二句。')
    expect(src).toContain('\n')
    expect(src).toContain('第一句')
  })
})
