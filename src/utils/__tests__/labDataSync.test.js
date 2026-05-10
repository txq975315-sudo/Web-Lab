import { describe, it, expect } from 'vitest'
import { LAB_LOCAL_STORAGE_KEYS } from '../labDataSync'
import { STORAGE_KEYS } from '../../config/storageKeys.js'

describe('LAB_LOCAL_STORAGE_KEYS', () => {
  it('无重复键', () => {
    const set = new Set(LAB_LOCAL_STORAGE_KEYS)
    expect(set.size).toBe(LAB_LOCAL_STORAGE_KEYS.length)
  })

  it('包含 LabContext 使用的会话键', () => {
    expect(LAB_LOCAL_STORAGE_KEYS).toContain(STORAGE_KEYS.CHAT_SESSIONS)
  })

  it('包含 AI 与项目树相关核心键', () => {
    for (const k of [
      STORAGE_KEYS.PROJECT_TREE,
      STORAGE_KEYS.AI_CONFIG,
      STORAGE_KEYS.ARCHAEOLOGY_SESSIONS,
      STORAGE_KEYS.GROWTH_SKILL_PROGRESS
    ]) {
      expect(LAB_LOCAL_STORAGE_KEYS).toContain(k)
    }
  })
})
