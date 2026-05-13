import { describe, it, expect } from 'vitest'
import {
  findNodeById,
  collectDocuments,
  findProjectForDoc,
  updateNodeInTree,
  addNodeToParent,
  removeNodeFromTree,
} from '../projectTreeOps.js'

const sampleTree = [
  {
    id: 'p1',
    name: 'P',
    type: 'project',
    children: [
      {
        id: 'c1',
        name: 'Cat',
        type: 'category',
        children: [
          { id: 'd1', name: 'Doc', type: 'document', docType: 'prd' },
        ],
      },
    ],
  },
]

describe('projectTreeOps', () => {
  it('findNodeById finds nested document', () => {
    expect(findNodeById(sampleTree, 'd1')?.id).toBe('d1')
    expect(findNodeById(sampleTree, 'missing')).toBeNull()
  })

  it('collectDocuments returns only document nodes', () => {
    const docs = collectDocuments(sampleTree)
    expect(docs.map((d) => d.id)).toEqual(['d1'])
  })

  it('findProjectForDoc resolves project id', () => {
    expect(findProjectForDoc(sampleTree, 'd1')).toBe('p1')
  })

  it('updateNodeInTree updates shallow node', () => {
    const next = updateNodeInTree(sampleTree, 'd1', (n) => ({ ...n, name: 'X' }))
    expect(findNodeById(next, 'd1')?.name).toBe('X')
  })

  it('addNodeToParent appends child', () => {
    const node = { id: 'd2', name: 'N', type: 'document' }
    const next = addNodeToParent(sampleTree, 'c1', node)
    expect(findNodeById(next, 'd2')?.id).toBe('d2')
  })

  it('removeNodeFromTree removes by id', () => {
    const next = removeNodeFromTree(sampleTree, 'd1')
    expect(findNodeById(next, 'd1')).toBeNull()
  })
})
