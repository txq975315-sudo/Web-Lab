import { useMemo } from 'react'
import { useLab } from '../context/LabContext'
import { loadSkillProgress } from '../utils/growthCoachStore'
import { METHODOLOGY_ORDER, METHODOLOGY_CONFIG } from '../config/methodology'

export default function DashboardHome() {
  const { projectTree, activeProjectId, setActiveProject, switchLabMode, createProject } = useLab()

  const skill = useMemo(() => loadSkillProgress(), [])

  const activeProject = projectTree.find((p) => p.id === activeProjectId) || projectTree[0]

  const dimensionsPreview = METHODOLOGY_ORDER.map((id) => ({
    id,
    name: METHODOLOGY_CONFIG[id]?.name || id,
    score: skill.dimensions[id] ?? 0,
  }))

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-8 pb-16">
        <p className="font-display text-xs uppercase tracking-wider text-lab-muted">Thinking Lab</p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-lab-ink">成长仪表盘</h1>
        <p className="mt-2 text-sm text-lab-muted">练 · 学 · 看 — 刻意练习闭环从这儿开始</p>

        <section className="mt-8 rounded-2xl border border-lab-border-subtle bg-lab-overlay p-6 shadow-card">
          <h2 className="font-display text-sm font-semibold text-lab-ink">今日方法论</h2>
          <p className="mt-2 text-sm leading-relaxed text-lab-muted">
            每日推送与行业拆解将放在此处（PRD：独立入口）。请先进入「学 · 成长教练」体验完整练习闭环。
          </p>
          <button
            type="button"
            onClick={() => switchLabMode('coach')}
            className="mt-4 rounded-lab bg-lab-accent px-4 py-2.5 text-sm font-medium text-[color:var(--color-text-inverted)] transition-opacity hover:opacity-95"
          >
            进入成长教练
          </button>
        </section>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-lab-border-subtle bg-lab-raised p-5 shadow-card">
            <h2 className="font-display text-sm font-semibold text-lab-ink">能力雷达（方法论维度）</h2>
            <ul className="mt-4 space-y-3">
              {dimensionsPreview.map((d) => (
                <li key={d.id}>
                  <div className="flex items-center justify-between text-xs text-lab-muted">
                    <span className="text-lab-ink">{d.name}</span>
                    <span>{Math.round(d.score)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-lab-overlay">
                    <div
                      className="h-full rounded-full bg-lab-accent transition-[width]"
                      style={{ width: `${Math.min(100, d.score)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-lab-border-subtle bg-lab-raised p-5 shadow-card">
            <h2 className="font-display text-sm font-semibold text-lab-ink">下一步推荐</h2>
            <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-lab-muted">
              <li>进入「练」对当前想法做压力测试</li>
              <li>在「学」中完成模板练习并写入项目树</li>
              <li>用「看」整理对话并归档知识资产</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => switchLabMode('live')}
                className="rounded-lab border border-lab-border-subtle bg-lab-overlay px-3 py-2 text-xs font-medium text-lab-ink hover:bg-lab-accent-dim"
              >
                练 · 压力测试
              </button>
              <button
                type="button"
                onClick={() => switchLabMode('archaeology')}
                className="rounded-lab border border-lab-border-subtle bg-lab-overlay px-3 py-2 text-xs font-medium text-lab-ink hover:bg-lab-accent-dim"
              >
                看 · 对话考古
              </button>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-lab-border-subtle bg-lab-overlay p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-sm font-semibold text-lab-ink">进行中的项目</h2>
            <button
              type="button"
              onClick={() => {
                const name = window.prompt('新项目名称', '')
                if (name?.trim()) createProject(name.trim())
              }}
              className="rounded-lab border border-lab-border-subtle px-3 py-1.5 text-xs font-medium text-lab-ink hover:bg-lab-accent-dim"
            >
              + 新建项目
            </button>
          </div>
          <ul className="mt-4 space-y-2">
            {projectTree.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveProject(p.id)
                    switchLabMode('coach')
                  }}
                  className={`flex w-full items-center justify-between rounded-lab border px-4 py-3 text-left text-sm transition-colors ${
                    p.id === activeProjectId
                      ? 'border-lab-accent bg-lab-accent-dim text-lab-ink'
                      : 'border-lab-border-subtle bg-lab-raised text-lab-ink hover:bg-lab-accent-dim/60'
                  }`}
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs text-lab-muted">{p.id === activeProjectId ? '当前' : '切换并训练'}</span>
                </button>
              </li>
            ))}
          </ul>
          {activeProject && (
            <p className="mt-4 text-xs text-lab-muted">
              当前激活：<span className="text-lab-ink">{activeProject.name}</span> — 打开「项目与文档」侧栏可浏览文档树
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
