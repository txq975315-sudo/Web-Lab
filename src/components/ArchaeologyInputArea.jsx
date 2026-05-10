import { useState } from 'react'
import { archaeologyStore } from '../utils/dataStore'
import { chatComplete as callAI } from '../utils/aiApi'

// 考古分析 Prompt（五维分析）
const ARCHAEOLOGY_V2_PROMPT = `你是一位资深产品决策分析师。分析以下对话记录，进行五维分析。

## 五维分析

1. timeline（项目演进时间轴）：提取关键时间节点
   { "date": "日期或阶段N", "stage": "阶段名", "decision": "关键决策" }

2. turningPoints（关键转折点）：至少5个
   { "name": "名称", "trigger": "触发原因", "basis": "决策依据", "alternatives": ["替代方案"], "finalChoice": "最终选择" }

3. blindSpots（认知盲区）：对话中没想清楚但重要的问题
   { "question": "问题", "importance": "为什么重要", "suggestion": "建议" }

4. assumptions（未经证实的假设）
   { "assumption": "假设", "evidence": "证据或'无'", "risk": "风险", "validation": "验证方法" }

5. assets（知识资产）：可归档的洞察
   { "content": "洞察内容", "type": "insight|decision|positioning|feature_cut", "suggestedTemplate": "建议模板" }

## 输出格式（严格 JSON，不要其他文字）
{ "timeline": [...], "turningPoints": [...], "blindSpots": [...], "assumptions": [...], "assets": [...] }`

export default function ArchaeologyInputArea({ sessionId, onAnalysisComplete }) {
  const [inputText, setInputText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAddAndAnalyze = async () => {
    if (!inputText.trim() || !sessionId) {
      alert('请先粘贴对话内容，并选择一个考古会话')
      return
    }

    archaeologyStore.addConversationChunk(sessionId, inputText)
    setInputText('')
    setIsAnalyzing(true)

    try {
      const mergedText = archaeologyStore.getMergedConversation(sessionId)

      console.log('[考古] 开始分析，对话长度:', mergedText.length)

      const messages = [
        { role: 'system', content: ARCHAEOLOGY_V2_PROMPT },
        { role: 'user', content: mergedText }
      ]

      const response = await callAI(messages)
      console.log('[考古] AI 返回:', response.slice(0, 200))

      let analysis
      try {
        analysis = JSON.parse(response)
      } catch (e) {
        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('无法解析 AI 返回的 JSON')
        }
      }

      const addIds = (items) => (items || []).map((item, idx) => ({
        ...item,
        id: `item_${Date.now()}_${idx}`,
        status: 'pending'
      }))

      if (analysis.timeline) {
        archaeologyStore.updateAnalysis(sessionId, 'timeline', addIds(analysis.timeline))
      }
      if (analysis.turningPoints) {
        archaeologyStore.updateAnalysis(sessionId, 'turningPoints', addIds(analysis.turningPoints))
      }
      if (analysis.blindSpots) {
        archaeologyStore.updateAnalysis(sessionId, 'blindSpots', addIds(analysis.blindSpots))
      }
      if (analysis.assumptions) {
        archaeologyStore.updateAnalysis(sessionId, 'assumptions', addIds(analysis.assumptions))
      }
      if (analysis.assets) {
        archaeologyStore.updateAnalysis(sessionId, 'assets', addIds(analysis.assets))
      }

      if (onAnalysisComplete) {
        onAnalysisComplete()
      }

      console.log('[考古] 分析完成')
    } catch (e) {
      console.error('[考古] 分析失败:', e)
      alert('分析失败：' + e.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="border-b border-lab-border-subtle bg-lab-base px-6 py-3 md:px-8">
      <div className="mb-2 text-sm font-medium font-display text-lab-ink">
        粘贴对话内容（可多次追加）：
      </div>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder={'在这里粘贴你和 AI 的对话记录...\n可以多次追加，AI 会合并分析'}
        className="w-full min-h-[120px] px-2 py-2 text-sm rounded-md border border-lab-border-subtle bg-lab-overlay text-lab-ink placeholder:text-lab-faint resize-y outline-none focus:border-lab-accent focus:ring-2 focus:ring-lab-accent/25"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleAddAndAnalyze}
          disabled={isAnalyzing || !sessionId}
          className="lab-btn-primary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
        >
          {isAnalyzing ? '🔍 分析中...' : '➕ 追加并分析'}
        </button>
        {isAnalyzing && (
          <span className="text-sm text-lab-muted">
            正在分析对话内容，请稍候...
          </span>
        )}
      </div>
    </div>
  )
}
