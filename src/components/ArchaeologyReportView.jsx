import { useState } from 'react'
import { useLab } from '../context/LabContext'
import {
  createDefaultFields,
  getProjectCategoryParentId,
  resolveArchaeologyDocTypeHint
} from '../config/templates'

export default function ArchaeologyReportView({ session, onBack, onRefresh, variant = 'page' }) {
  const [archiving, setArchiving] = useState({})
  const {
    projectTree,
    activeProjectId,
    createProject,
    createDocument,
    openDocument,
    switchLabMode
  } = useLab()

  function generateReportContent() {
    let content = `# ${session.name}\n\n`
    content += `## 项目演进时间轴\n\n`

    session.analysis?.timeline?.filter(i => i.status === 'confirmed').forEach(item => {
      content += `- **${item.stage}** (${item.date}): ${item.decision}\n`
    })

    content += `\n## 关键决策链\n\n`
    session.analysis?.turningPoints?.filter(i => i.status === 'confirmed').forEach(item => {
      content += `- **${item.name}**\n`
      content += `  - 触发: ${item.trigger}\n`
      content += `  - 最终选择: ${item.finalChoice}\n`
    })

    content += `\n## 认知盲区\n\n`
    session.analysis?.blindSpots?.filter(i => i.status === 'confirmed').forEach(item => {
      content += `- **${item.question}**\n`
      content += `  - 重要性: ${item.importance}\n`
      content += `  - 建议: ${item.suggestion}\n`
    })

    content += `\n## 未经证实的假设\n\n`
    session.analysis?.assumptions?.filter(i => i.status === 'confirmed').forEach(item => {
      content += `- **${item.assumption}**\n`
      content += `  - 风险: ${item.risk}\n`
    })

    content += `\n## 知识资产\n\n`
    session.analysis?.assets?.filter(i => i.status === 'confirmed').forEach(item => {
      content += `- ${item.content}\n`
    })

    return content
  }

  const handleArchiveAsset = async (asset) => {
    setArchiving(prev => ({ ...prev, [asset.id]: true }))
    try {
      let projectId = activeProjectId
      if (!projectTree?.length) {
        projectId = createProject('决策复盘项目')
      } else if (!projectId || !projectTree.some((p) => p.id === projectId)) {
        projectId = projectTree[0].id
      }

      const docType = resolveArchaeologyDocTypeHint(asset.suggestedTemplate)
      const titleSlice = (asset.content || '').slice(0, 36)
      const name = `[考古] ${titleSlice}${(asset.content || '').length > 36 ? '…' : ''}`
      const meta =
        `来源：考古会话「${session.name}」\n会话 ID：${session.id}\n资产类型：${asset.type || '—'}\n建议模板：${asset.suggestedTemplate || docType}\n\n---\n\n`
      const body = typeof asset.content === 'string' ? asset.content : JSON.stringify(asset.content, null, 2)

      const parentId = getProjectCategoryParentId(projectId, docType)
      const docId = createDocument(
        parentId,
        {
          name,
          docType,
          typeKey: docType,
          fields: createDefaultFields(docType),
          content: meta + body
        },
        { trustParentId: true }
      )

      switchLabMode('live')
      openDocument(docId)

      alert('已归档到当前项目树（左侧栏可见）')
      onRefresh?.()
    } catch (e) {
      console.error('归档失败:', e)
      alert('归档失败: ' + (e.message || String(e)))
    } finally {
      setArchiving(prev => ({ ...prev, [asset.id]: false }))
    }
  }

  const handleExportMarkdown = () => {
    const content = generateReportContent()
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${session.name}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const confirmedAssets = session.analysis?.assets?.filter(i => i.status === 'confirmed') || []

  const isPanel = variant === 'panel'

  return (
    <div className={`flex flex-col overflow-hidden bg-lab-base ${isPanel ? 'h-full min-h-0' : 'flex-1'}`}>
      <div
        className={`flex flex-shrink-0 items-center justify-between border-b border-lab-border-subtle bg-lab-overlay ${
          isPanel ? 'px-3 py-2.5' : 'px-6 py-4'
        }`}
      >
        <div className="flex min-w-0 items-center gap-2">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="shrink-0 rounded border border-lab-border-subtle bg-lab-raised px-2.5 py-1 text-xs text-lab-ink hover:bg-lab-accent-dim"
            >
              ← 返回
            </button>
          ) : null}
          <h2 className="truncate font-display text-sm font-semibold text-lab-ink md:text-base">
            {isPanel ? '报告与归档' : '决策复盘报告'}
          </h2>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={handleExportMarkdown}
            className="lab-btn-primary px-2.5 py-1.5 text-[11px] !shadow-none md:px-3 md:text-xs"
          >
            导出 MD
          </button>
        </div>
      </div>

      <div className={`min-h-0 flex-1 overflow-auto ${isPanel ? 'p-3' : 'p-6'}`}>
        <div className={`grid gap-6 ${isPanel ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
          <div>
            <h3 className="mb-2 font-display text-xs font-semibold text-lab-ink md:text-sm">报告预览</h3>
            <div className="rounded-lg border border-lab-border-subtle bg-lab-overlay p-3 shadow-card md:p-4">
              <pre className="whitespace-pre-wrap font-mono text-[11px] text-lab-ink md:text-xs">
                {generateReportContent()}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-display text-xs font-semibold text-lab-ink md:text-sm">
              知识资产归档 ({confirmedAssets.length})
            </h3>
            <p className="text-xs text-lab-muted mb-3">
              归档写入左侧「项目树」（当前活跃项目）。若无项目会自动新建「决策复盘项目」。
            </p>

            {confirmedAssets.length === 0 ? (
              <div className="text-center py-8 text-lab-muted text-sm border border-dashed border-lab-border-subtle rounded-lg">
                还没有确认的知识资产，请先确认一些条目
              </div>
            ) : (
              <div className="space-y-3">
                {confirmedAssets.map(asset => (
                  <div key={asset.id} className="bg-lab-overlay border border-lab-border-subtle rounded-lg p-3 shadow-card">
                    <p className="text-sm text-lab-ink mb-2">{asset.content}</p>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs text-lab-muted min-w-0">
                        {asset.type && <span className="mr-2">类型: {asset.type}</span>}
                        {asset.suggestedTemplate && <span>建议归档到: {asset.suggestedTemplate}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleArchiveAsset(asset)}
                        disabled={archiving[asset.id]}
                        className="flex-shrink-0 px-3 py-1 bg-lab-success text-white rounded text-xs hover:opacity-92 disabled:opacity-50"
                      >
                        {archiving[asset.id] ? '归档中...' : '归档'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
