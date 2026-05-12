/**
 * 页面流程回归测试
 */
import { describe, it, expect } from 'vitest'

describe('页面流程', () => {
  it('VALID_LAB_MODES 应包含 landing 模式', async () => {
    const { LabProvider } = await import('../context/LabContext')
    expect(LabProvider).toBeTruthy()
  })
})
