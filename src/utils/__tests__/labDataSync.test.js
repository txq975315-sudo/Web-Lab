import { describe, it, expect } from 'vitest'
import { LAB_LOCAL_STORAGE_KEYS } from '../labDataSync'

describe('LAB_LOCAL_STORAGE_KEYS', () => {
  it('无重复键', () => {
    const set = new Set(LAB_LOCAL_STORAGE_KEYS)
    expect(set.size).toBe(LAB_LOCAL_STORAGE_KEYS.length)
  })

  it('包含 LabContext 使用的会话键 kairos-chat-sessions', () => {
    expect(LAB_LOCAL_STORAGE_KEYS).toContain('kairos-chat-sessions')
  })

  it('包含 AI 与项目树相关核心键', () => {
    for (const k of [
      'kairos-project-tree',
      'kairos-ai-config',
      'kairos-archaeology-sessions'
    ]) {
      expect(LAB_LOCAL_STORAGE_KEYS).toContain(k)
    }
  })
})
