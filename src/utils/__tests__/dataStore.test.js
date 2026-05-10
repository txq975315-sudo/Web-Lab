/**
 * Phase 1 测试：dataStore 新增的树形结构持久化方法
 *
 * TDD RED 阶段：先写测试，看红，再写实现
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { store } from '../dataStore'
import { STORAGE_KEYS } from '../../config/storageKeys.js'

describe('store.saveProjectTree / store.loadProjectTree', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('saveProjectTree 能将树形结构写入 localStorage', () => {
    const tree = [{ id: 'proj-1', name: '测试项目', type: 'project', children: [] }]
    store.saveProjectTree(tree)

    const raw = localStorage.getItem(STORAGE_KEYS.PROJECT_TREE)
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw)
    expect(parsed).toEqual(tree)
  })

  it('loadProjectTree 能从 localStorage 读取树形结构', () => {
    const tree = [{ id: 'proj-1', name: '测试项目', type: 'project', children: [] }]
    localStorage.setItem(STORAGE_KEYS.PROJECT_TREE, JSON.stringify(tree))

    const result = store.loadProjectTree()
    expect(result).toEqual(tree)
  })

  it('loadProjectTree 在 localStorage 为空时返回 null', () => {
    const result = store.loadProjectTree()
    expect(result).toBeNull()
  })

  it('loadProjectTree 在 JSON 解析失败时返回 null', () => {
    localStorage.setItem(STORAGE_KEYS.PROJECT_TREE, 'invalid-json')

    const result = store.loadProjectTree()
    expect(result).toBeNull()
  })
})

describe('store.saveActiveProjectId / store.loadActiveProjectId', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('saveActiveProjectId 能写入活跃项目 ID', () => {
    store.saveActiveProjectId('proj-1')

    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT)
    expect(raw).toBe('"proj-1"')
  })

  it('loadActiveProjectId 能读取活跃项目 ID', () => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT, JSON.stringify('proj-1'))

    const result = store.loadActiveProjectId()
    expect(result).toBe('proj-1')
  })

  it('loadActiveProjectId 在 localStorage 为空时返回 null', () => {
    const result = store.loadActiveProjectId()
    expect(result).toBeNull()
  })
})

describe('store.saveExpertMode / store.loadExpertMode', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('saveExpertMode 能写入专家模式', () => {
    store.saveExpertMode('pressure')

    const raw = localStorage.getItem(STORAGE_KEYS.EXPERT_MODE)
    expect(raw).toBe('"pressure"')
  })

  it('loadExpertMode 能读取专家模式', () => {
    localStorage.setItem(STORAGE_KEYS.EXPERT_MODE, JSON.stringify('guided'))

    const result = store.loadExpertMode()
    expect(result).toBe('guided')
  })

  it('loadExpertMode 在 localStorage 为空时返回 null', () => {
    const result = store.loadExpertMode()
    expect(result).toBeNull()
  })
})
