import { useState } from 'react';
import { archaeologyStore } from '../utils/dataStore';
import { chatComplete as callAI } from '../utils/aiApi';

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
{ "timeline": [...], "turningPoints": [...], "blindSpots": [...], "assumptions": [...], "assets": [...] }`;

export default function ArchaeologyInputArea({ sessionId, onAnalysisComplete }) {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAddAndAnalyze = async () => {
    if (!inputText.trim() || !sessionId) {
      alert('请先粘贴对话内容，并选择一个考古会话');
      return;
    }

    // 1. 保存对话片段
    archaeologyStore.addConversationChunk(sessionId, inputText);
    const currentText = inputText;
    setInputText('');
    setIsAnalyzing(true);

    try {
      // 2. 获取合并后的完整对话
      const mergedText = archaeologyStore.getMergedConversation(sessionId);

      // 3. 调用 AI 分析
      console.log('[考古] 开始分析，对话长度:', mergedText.length);
      
      const messages = [
        { role: 'system', content: ARCHAEOLOGY_V2_PROMPT },
        { role: 'user', content: mergedText }
      ];
      
      const response = await callAI(messages);
      console.log('[考古] AI 返回:', response.slice(0, 200));

      // 4. 解析 JSON
      let analysis;
      try {
        analysis = JSON.parse(response);
      } catch (e) {
        // 如果解析失败，尝试提取 JSON 部分
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('无法解析 AI 返回的 JSON');
        }
      }

      // 5. 给每个条目添加 id
      const addIds = (items) => (items || []).map((item, idx) => ({
        ...item,
        id: `item_${Date.now()}_${idx}`,
        status: 'pending'
      }));

      // 6. 更新分析结果（保留已确认，新增待确认）
      if (analysis.timeline) {
        archaeologyStore.updateAnalysis(sessionId, 'timeline', addIds(analysis.timeline));
      }
      if (analysis.turningPoints) {
        archaeologyStore.updateAnalysis(sessionId, 'turningPoints', addIds(analysis.turningPoints));
      }
      if (analysis.blindSpots) {
        archaeologyStore.updateAnalysis(sessionId, 'blindSpots', addIds(analysis.blindSpots));
      }
      if (analysis.assumptions) {
        archaeologyStore.updateAnalysis(sessionId, 'assumptions', addIds(analysis.assumptions));
      }
      if (analysis.assets) {
        archaeologyStore.updateAnalysis(sessionId, 'assets', addIds(analysis.assets));
      }

      // 7. 通知父组件刷新
      if (onAnalysisComplete) {
        onAnalysisComplete();
      }

      console.log('[考古] 分析完成');
    } catch (e) {
      console.error('[考古] 分析失败:', e);
      alert('分析失败：' + e.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ padding: 12, borderBottom: '1px solid #eee' }}>
      <div style={{ marginBottom: 8, fontWeight: 500 }}>
        粘贴对话内容（可多次追加）：
      </div>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="在这里粘贴你和 AI 的对话记录...&#10;可以多次追加，AI 会合并分析"
        style={{
          width: '100%',
          minHeight: 120,
          padding: 8,
          border: '1px solid #d1d5db',
          borderRadius: 4,
          fontSize: 14,
          resize: 'vertical'
        }}
      />
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <button
          onClick={handleAddAndAnalyze}
          disabled={isAnalyzing || !sessionId}
          style={{
            padding: '8px 16px',
            background: isAnalyzing ? '#9ca3af' : '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: isAnalyzing ? 'not-allowed' : 'pointer',
            fontSize: 14
          }}
        >
          {isAnalyzing ? '🔍 分析中...' : '➕ 追加并分析'}
        </button>
        {isAnalyzing && (
          <span style={{ color: '#666', fontSize: 14, lineHeight: '32px' }}>
            正在分析对话内容，请稍候...
          </span>
        )}
      </div>
    </div>
  );
}
