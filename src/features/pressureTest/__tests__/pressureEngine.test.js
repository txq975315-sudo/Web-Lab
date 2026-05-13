import { describe, it, expect } from 'vitest'
import { getVerdictFromMarkers, accumulateBlindSpotMarkers } from '../pressureTypes.js'

describe('getVerdictFromMarkers', () => {
  it('returns basically_viable when no high risks', () => {
    expect(getVerdictFromMarkers([{ severity: 'medium', dimension: 'x', description: 'a' }])).toBe(
      'basically_viable',
    )
  })

  it('needs_rethink when high >= 2', () => {
    expect(
      getVerdictFromMarkers([
        { severity: 'high', dimension: 'a', description: '1' },
        { severity: 'high', dimension: 'b', description: '2' },
      ]),
    ).toBe('needs_rethink')
  })

  it('needs_rethink when 1 high and 2 medium', () => {
    expect(
      getVerdictFromMarkers([
        { severity: 'high', dimension: 'a', description: '1' },
        { severity: 'medium', dimension: 'b', description: '2' },
        { severity: 'medium', dimension: 'c', description: '3' },
      ]),
    ).toBe('needs_rethink')
  })
})

describe('accumulateBlindSpotMarkers', () => {
  it('merges same dimension with higher severity', () => {
    const a = { dimension: '商业模式', description: '定价', severity: /** @type {const} */ ('low') }
    const b = { dimension: '商业模式', description: '无依据', severity: /** @type {const} */ ('high') }
    const out = accumulateBlindSpotMarkers([a], b)
    expect(out).toHaveLength(1)
    expect(out[0].severity).toBe('high')
  })
})
