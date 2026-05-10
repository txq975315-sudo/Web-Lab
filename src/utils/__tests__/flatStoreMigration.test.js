import { describe, it, expect } from 'vitest'
import { summarizeLegacyFlat, normalizeFlatDocType } from '../flatStoreMigration'

describe('summarizeLegacyFlat', () => {
  it('空数据返回 0', () => {
    expect(summarizeLegacyFlat(null)).toEqual({ projectCount: 0, docCount: 0 })
    expect(summarizeLegacyFlat({})).toEqual({ projectCount: 0, docCount: 0 })
  })

  it('统计项目与文档数', () => {
    const data = {
      projects: [{ id: 'p1', name: 'A' }],
      documents: {
        p1: [{ docType: 'prd' }, { docType: 'canvas' }]
      }
    }
    expect(summarizeLegacyFlat(data)).toEqual({ projectCount: 1, docCount: 2 })
  })
})

describe('normalizeFlatDocType', () => {
  it('未知类型回退到 value_proposition', () => {
    expect(normalizeFlatDocType('not-a-real-template')).toBe('value_proposition')
  })

  it('合法模板保留', () => {
    expect(normalizeFlatDocType('prd')).toBe('prd')
  })
})
