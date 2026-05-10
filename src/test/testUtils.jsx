import React from 'react'
import { render } from '@testing-library/react'
import { LabProvider } from '../context/LabContext'

/**
 * 自定义 render：自动包裹 LabProvider
 */
export function renderWithProvider(ui, { providerProps = {}, ...options } = {}) {
  return render(
    <LabProvider {...providerProps}>
      {ui}
    </LabProvider>,
    options
  )
}

/**
 * 创建一个最小的测试用项目树
 */
export function createTestProjectTree(overrides = {}) {
  return [
    {
      id: 'proj-test-1',
      name: '测试项目',
      type: 'project',
      expanded: true,
      constitution: {
        constraints: ['约束1'],
        manifesto: {
          fields: { slogan: '测试口号', description: '测试描述', targetUser: '测试用户', differentiation: '测试差异化', vibe: '测试情绪', antiWhat: '测试反对' },
          version: 1,
          versionHistory: [],
        },
        manifestoDocId: 'proj-test-1-cat-constitution-doc-manifesto',
      },
      children: [
        {
          id: 'proj-test-1-cat-constitution',
          name: '01 项目宪法',
          type: 'category',
          categoryType: 'constitution',
          expanded: true,
          children: [
            {
              id: 'proj-test-1-cat-constitution-doc-manifesto',
              name: '核心定位',
              type: 'document',
              docType: 'manifesto',
              typeKey: 'manifesto',
              parentId: 'proj-test-1-cat-constitution',
              fields: { slogan: '测试口号', description: '测试描述', targetUser: '测试用户', differentiation: '测试差异化', vibe: '测试情绪', antiWhat: '测试反对' },
              content: '',
              version: 1,
              versionHistory: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        },
        {
          id: 'proj-test-1-cat-market',
          name: '02 市场与用户洞察',
          type: 'category',
          categoryType: 'market',
          expanded: false,
          children: [],
        },
        {
          id: 'proj-test-1-cat-strategy',
          name: '03 策略与增长',
          type: 'category',
          categoryType: 'strategy',
          expanded: false,
          children: [],
        },
        {
          id: 'proj-test-1-cat-decision',
          name: '04 决策链图谱',
          type: 'category',
          categoryType: 'decision',
          expanded: false,
          isSpecial: true,
          children: [],
        },
        {
          id: 'proj-test-1-cat-antifragile',
          name: '05 反脆弱审计',
          type: 'category',
          categoryType: 'antifragile',
          expanded: false,
          children: [],
        },
        {
          id: 'proj-test-1-cat-roadmap',
          name: '06 执行路线图',
          type: 'category',
          categoryType: 'roadmap',
          expanded: false,
          children: [],
        },
      ],
      ...overrides,
    },
  ]
}
