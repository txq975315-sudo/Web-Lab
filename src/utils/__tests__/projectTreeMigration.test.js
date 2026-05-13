import { describe, it, expect } from 'vitest'
import {
  migrateProjectTreeIfNeeded,
  LEGACY_DEMO_CONSTITUTION_CONSTRAINTS,
} from '../projectTreeMigration.js'

describe('migrateProjectTreeIfNeeded — 演示性宪法约束清理', () => {
  it('清空与旧种子完全一致的 constraints', () => {
    const tree = [
      {
        id: 'proj-1',
        name: 'Kairos App',
        type: 'project',
        expanded: true,
        constitution: {
          constraints: [...LEGACY_DEMO_CONSTITUTION_CONSTRAINTS],
          manifesto: { fields: {}, version: 1, versionHistory: [] },
          manifestoDocId: 'x',
        },
        children: [],
      },
    ]
    const { tree: out, didMigrate } = migrateProjectTreeIfNeeded(tree)
    expect(didMigrate).toBe(true)
    expect(out[0].constitution.constraints).toEqual([])
  })

  it('不改动用户自定义的 constraints', () => {
    const tree = [
      {
        id: 'p2',
        name: '我的项目',
        type: 'project',
        constitution: { constraints: ['仅支持 Web'], manifesto: { fields: {} } },
        children: [],
      },
    ]
    const { tree: out, didMigrate } = migrateProjectTreeIfNeeded(tree)
    expect(didMigrate).toBe(false)
    expect(out[0].constitution.constraints).toEqual(['仅支持 Web'])
  })
})
