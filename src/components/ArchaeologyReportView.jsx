import { useState } from 'react'
import { archaeologyStore, store } from '../utils/dataStore'

export default function ArchaeologyReportView({ session, onBack, onRefresh }) {
  const [archiving, setArchiving] = useState({})

  // 生成报告内容
  const generateReportContent = () => {
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

  // 归档单个知识资产
  const handleArchiveAsset = async (asset) => {
    setArchiving(prev => ({ ...prev, [asset.id]: true }))
    try {
      // 获取第一个项目，如果没有则创建
      let projects = store.getProjects()
      let projectId
      
      if (projects.length === 0) {
        const newProject = store.createProject('决策复盘项目', '从考古对话中提取的项目')
        projectId = newProject.id
      } else {
        projectId = projects[0].id
      }

      // 根据建议的模板选择合适的模板
      let templateKey = 'value_proposition' // 默认
      if (asset.suggestedTemplate) {
        const lower = asset.suggestedTemplate.toLowerCase()
        if (lower.includes('persona')) templateKey = 'persona'
        else if (lower.includes('value')) templateKey = 'value_proposition'
        else if (lower.includes('canvas')) templateKey = 'lean_canvas'
      }

      // 创建文档
      const docData = {
        content: asset.content,
        type: asset.type || 'insight',
        source: '考古对话',
        sourceSession: session.id
      }

      store.createDocument(projectId, templateKey, docData, `[考古] ${asset.content.slice(0, 30)}...`)
      
      alert('归档成功！')
      onRefresh?.()
    } catch (e) {
      console.error('归档失败:', e)
      alert('归档失败: ' + e.message)
    } finally {
      setArchiving(prev => ({ ...prev, [asset.id]: false }))
    }
  }

  // 导出为Markdown
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
          >
            ← 返回审阅
          </button>
          <h2 className="text-lg font-semibold text-gray-800">决策复盘报告</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportMarkdown}
            className="px-3 py-1.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          >
            导出 MD
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：报告预览 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">报告预览</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <pre className="text-xs whitespace-pre-wrap text-gray-700" style={{ fontFamily: 'monospace' }}>
                {generateReportContent()}
              </pre>
            </div>
          </div>

          {/* 右侧：知识资产归档 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              知识资产归档 ({confirmedAssets.length})
            </h3>
            
            {confirmedAssets.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                还没有确认的知识资产，请先确认一些条目
              </div>
            ) : (
              <div className="space-y-3">
                {confirmedAssets.map(asset => (
                  <div key={asset.id} className="bg-white border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-800 mb-2">{asset.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {asset.type && <span className="mr-2">类型: {asset.type}</span>}
                        {asset.suggestedTemplate && <span>建议归档到: {asset.suggestedTemplate}</span>}
                      </div>
                      <button
                        onClick={() => handleArchiveAsset(asset)}
                        disabled={archiving[asset.id]}
                        className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:opacity-50"
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
