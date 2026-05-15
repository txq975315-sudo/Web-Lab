/**
 * 统一布局与滑动切换 — TDD 测试
 *
 * RED 阶段：所有测试应因功能尚未实现而失败
 * GREEN 阶段：实现后全部通过
 */
import { describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'

// 在 import 组件前设置 localStorage 状态
beforeEach(() => {
  window.localStorage.setItem(
    'thinking-lab-project-tree',
    JSON.stringify([
      {
        id: 'proj-1',
        name: '测试项目',
        type: 'project',
        expanded: true,
        constitution: {
          constraints: [],
          manifesto: { fields: {}, version: 1, versionHistory: [] },
          manifestoDocId: 'proj-1-cat-constitution-doc-manifesto',
        },
        children: [
          { id: 'proj-1-cat-constitution', name: '01 项目宪法', type: 'category', categoryType: 'constitution', expanded: true, children: [] },
        ],
      },
    ])
  )
  window.localStorage.setItem('thinking-lab-lab-mode', JSON.stringify('live'))
  window.localStorage.setItem('thinking-lab-active-project', JSON.stringify('proj-1'))
})

/**
 * 测试 1: 页面外壳一致性
 * 所有非 landing 模式应渲染相同的 wb-shell 外壳
 */
describe('统一布局 - 页面外壳一致性', () => {
  it('wb-shell 容器对所有非 landing 模式一致渲染', async () => {
    const App = (await import('../App.jsx')).default
    const { container } = render(React.createElement(App))

    // wb-shell 外壳应当始终存在
    const shells = container.querySelectorAll('.wb-shell')
    expect(shells.length).toBe(1)

    // WorkbenchIconRail 容器（.wb-rail-w）应当存在
    const rail = container.querySelector('.wb-rail-w')
    expect(rail).toBeTruthy()

    // wb-workbench-row 应当存在
    const row = container.querySelector('.wb-workbench-row')
    expect(row).toBeTruthy()
  })
})

/**
 * 测试 2: 模块切换保留外壳
 * 切换 labMode 时，页面框架元素不变
 */
describe('统一布局 - 模式切换外壳稳定', () => {
  it('切换至 coach 模式时外壳元素不变', async () => {
    window.localStorage.setItem('thinking-lab-lab-mode', JSON.stringify('coach'))
    const App = (await import('../App.jsx')).default
    const { container } = render(React.createElement(App))

    expect(container.querySelectorAll('.wb-shell').length).toBe(1)
    expect(container.querySelector('.wb-rail-w')).toBeTruthy()
    expect(container.querySelector('.wb-workbench-row')).toBeTruthy()
  })

  it('切换至 archaeology 模式时外壳元素不变', async () => {
    window.localStorage.setItem('thinking-lab-lab-mode', JSON.stringify('archaeology'))
    const App = (await import('../App.jsx')).default
    const { container } = render(React.createElement(App))

    expect(container.querySelectorAll('.wb-shell').length).toBe(1)
    expect(container.querySelector('.wb-rail-w')).toBeTruthy()
    expect(container.querySelector('.wb-workbench-row')).toBeTruthy()
  })
})

/**
 * 测试 3: 对话框内 ModuleSegmentedControl（dialog variant）始终存在
 */
describe('统一布局 - 对话框内模式切换', () => {
  it('live 模式下存在 wb-module-segment--dialog', async () => {
    window.localStorage.setItem('thinking-lab-lab-mode', JSON.stringify('live'))
    const App = (await import('../App.jsx')).default
    const { container } = render(React.createElement(App))

    const dialogSeg = container.querySelector('.wb-module-segment--dialog')
    expect(dialogSeg).toBeTruthy()
  })

  it('coach 模式下存在 wb-module-segment--dialog', async () => {
    window.localStorage.setItem('thinking-lab-lab-mode', JSON.stringify('coach'))
    const App = (await import('../App.jsx')).default
    const { container } = render(React.createElement(App))

    const dialogSeg = container.querySelector('.wb-module-segment--dialog')
    expect(dialogSeg).toBeTruthy()
  })

  it('archaeology 模式下存在 wb-module-segment--dialog', async () => {
    window.localStorage.setItem('thinking-lab-lab-mode', JSON.stringify('archaeology'))
    const App = (await import('../App.jsx')).default
    const { container } = render(React.createElement(App))

    const dialogSeg = container.querySelector('.wb-module-segment--dialog')
    expect(dialogSeg).toBeTruthy()
  })
})

/**
 * 测试 4: 滑动容器存在
 * 统一布局后，对话框内应包含滑动容器用于模式切换过渡
 */
describe('统一布局 - 滑动切换容器', () => {
  it('live 模式下存在 wb-slide-container', async () => {
    window.localStorage.setItem('thinking-lab-lab-mode', JSON.stringify('live'))
    const App = (await import('../App.jsx')).default
    const { container } = render(React.createElement(App))

    const slideContainer = container.querySelector('.wb-slide-container')
    expect(slideContainer).toBeTruthy()
  })

  it('coach 模式下存在 wb-slide-container', async () => {
    window.localStorage.setItem('thinking-lab-lab-mode', JSON.stringify('coach'))
    const App = (await import('../App.jsx')).default
    const { container } = render(React.createElement(App))

    const slideContainer = container.querySelector('.wb-slide-container')
    expect(slideContainer).toBeTruthy()
  })

  it('archaeology 模式下存在 wb-slide-container', async () => {
    window.localStorage.setItem('thinking-lab-lab-mode', JSON.stringify('archaeology'))
    const App = (await import('../App.jsx')).default
    const { container } = render(React.createElement(App))

    const slideContainer = container.querySelector('.wb-slide-container')
    expect(slideContainer).toBeTruthy()
  })
})

/**
 * 测试 5: 三模式不出现顶部 wb-top-header
 * 统一布局后，所有非 landing 模式不应再渲染独立的顶部 header
 */
describe('统一布局 - 无顶部独立 header', () => {
  it('live 模式下不应有 wb-top-header', async () => {
    window.localStorage.setItem('thinking-lab-lab-mode', JSON.stringify('live'))
    const App = (await import('../App.jsx')).default
    const { container } = render(React.createElement(App))

    const header = container.querySelector('.wb-top-header')
    expect(header).toBeFalsy()
  })

  it('coach 模式下不应有 wb-top-header', async () => {
    window.localStorage.setItem('thinking-lab-lab-mode', JSON.stringify('coach'))
    const App = (await import('../App.jsx')).default
    const { container } = render(React.createElement(App))

    const header = container.querySelector('.wb-top-header')
    expect(header).toBeFalsy()
  })

  it('archaeology 模式下不应有 wb-top-header', async () => {
    window.localStorage.setItem('thinking-lab-lab-mode', JSON.stringify('archaeology'))
    const App = (await import('../App.jsx')).default
    const { container } = render(React.createElement(App))

    const header = container.querySelector('.wb-top-header')
    expect(header).toBeFalsy()
  })
})

/**
 * 测试 6: wb-pressure-dialog 容器对三模式都存在
 */
describe('统一布局 - 共享压力对话框容器', () => {
  it('live 模式下 wb-pressure-dialog 存在', async () => {
    window.localStorage.setItem('thinking-lab-lab-mode', JSON.stringify('live'))
    const App = (await import('../App.jsx')).default
    const { container } = render(React.createElement(App))

    expect(container.querySelector('.wb-pressure-dialog')).toBeTruthy()
  })

  it('coach 模式下 wb-pressure-dialog 存在', async () => {
    window.localStorage.setItem('thinking-lab-lab-mode', JSON.stringify('coach'))
    const App = (await import('../App.jsx')).default
    const { container } = render(React.createElement(App))

    expect(container.querySelector('.wb-pressure-dialog')).toBeTruthy()
  })

  it('archaeology 模式下 wb-pressure-dialog 存在', async () => {
    window.localStorage.setItem('thinking-lab-lab-mode', JSON.stringify('archaeology'))
    const App = (await import('../App.jsx')).default
    const { container } = render(React.createElement(App))

    expect(container.querySelector('.wb-pressure-dialog')).toBeTruthy()
  })
})
