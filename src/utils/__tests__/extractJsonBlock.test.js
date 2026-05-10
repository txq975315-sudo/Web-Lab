import { describe, it, expect } from 'vitest'
import { extractJsonBlock } from '../extractJsonBlock'

describe('extractJsonBlock', () => {
  it('parses fenced json', () => {
    const text = '说明\n```json\n{"a":1}\n```\n'
    expect(extractJsonBlock(text)).toEqual({ a: 1 })
  })

  it('throws without fence', () => {
    expect(() => extractJsonBlock('{"a":1}')).toThrow()
  })
})
