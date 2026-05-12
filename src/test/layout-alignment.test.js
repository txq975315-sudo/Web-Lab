/**
 * Figma 布局对齐 — 回归测试
 * 验证关键布局类名与 Figma 原型一致
 */
import { describe, it, expect, beforeEach } from 'vitest'
import React from 'react'

function injectTokens() {
  document.documentElement.innerHTML = `
    <style>
      :root {
        --radius-card: 36px;
        --wb-shadow-card: 0 4px 32px rgba(0,0,0,0.05);
        --wb-rail-width: 64px;
        --color-bg-raised: #FFFFFF;
        --color-text-secondary: #848484;
        --wb-primary-muted: rgba(0,0,0,0.06);
        --wb-text: #1E1E1E;
        --wb-muted: #848484;
        --color-accent-orange: #00AAFF;
        --color-text-primary: #1E1E1E;
      }
    </style>
  `
}

describe('Figma 布局对齐', () => {
  beforeEach(() => { injectTokens() })

  it('图标栏应使用 wb-rail-w 与 --wb-rail-width', async () => {
    const mod = await import('../components/workbench/WorkbenchIconRail')
    const { LabProvider } = await import('../context/LabContext')
    const { render } = await import('@testing-library/react')
    const { container } = render(
      React.createElement(
        LabProvider,
        null,
        React.createElement(mod.default, { activeTool: null, onToolChange: () => {}, onSettingsClick: () => {} })
      )
    )
    const nav = container.querySelector('nav')
    expect(nav).toBeTruthy()
    expect(nav.className).toContain('wb-rail-w')
  })

  it('底部工具栏应存在', async () => {
    const mod = await import('../components/workbench/BottomToolbar')
    const { render } = await import('@testing-library/react')
    const { container } = render(React.createElement(mod.default))
    const toolbar = container.querySelector('.wb-bottom-toolbar')
    expect(toolbar).toBeTruthy()
  })
})
