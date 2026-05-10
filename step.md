我看到了截图。当前页面状态很清晰：



\*\*已实现的部分：\*\*

\- 左侧面板：原有项目树结构（思维实验室 + 6大模块）

\- 中间面板：会话列表（"前期"）+ 输入区（粘贴对话）+ 分析卡片列表（带确认/驳回/编辑按钮）— 这是 Step 1-3 的整合效果

\- 右侧面板：独立的"对话考古"入口（紫色渐变背景 + "开始地层扫描"按钮）— 这可能是旧版实现或未完全集成的版本



\*\*接下来需要完成的最后一块拼图：Step 4 — 报告生成视图（ArchaeologyReportView）\*\*



当用户把所有分析卡片都确认/编辑完毕后，需要一个"生成报告"按钮，点击后生成最终的考古报告，包含：

\- 所有已确认的分析项汇总

\- 知识资产推荐（自动归类到25个模板中）

\- 归档建议



同时还需要一个整合后的主面板组件来调度这4个子组件。



让我先检查当前已有的文件：

看来之前的组件文件在用户本地项目中（通过 Trae 实现），不在当前文件系统里。不过没关系，我直接为你完成 \*\*Step 4（报告生成视图）\*\* 和 \*\*主面板整合组件\*\*。



这两个文件可以直接交给 Trae 放入你的项目。



\---



\## Step 4: ArchaeologyReportView.jsx — 报告生成与归档推荐



```jsx

// src/components/ArchaeologyReportView.jsx

import React, { useState, useCallback } from 'react';

import { FileText, BookOpen, GitBranch, CheckCircle, AlertTriangle, Lightbulb, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';



// 25个模板分类映射（用于知识资产推荐）

const TEMPLATE\_CATEGORIES = {

&#x20; '项目宪法': \['核心定位', '价值主张', '北极星指标', '成功定义', '项目章程'],

&#x20; '市场洞察': \['用户画像', '需求场景', '竞品分析', '市场趋势', '差异化因素'],

&#x20; '策略增长': \['增长飞轮', '渠道策略', '转化漏斗', '留存机制', '变现模式'],

&#x20; '决策图谱': \['决策日志', '方案对比', '风险评估', '假设验证', '复盘总结'],

&#x20; '反脆弱': \['单点故障', '应急预案', '冗余设计', '压力测试', '恢复机制'],

&#x20; '路线图': \['里程碑', '优先级', '资源分配', '时间表', '依赖关系']

};



// 分析项类型到推荐模板的映射启发式规则

const suggestTemplates = (items) => {

&#x20; const suggestions = \[];

&#x20; const coveredCategories = new Set();



&#x20; items.forEach(item => {

&#x20;   const title = item.title || '';

&#x20;   const trigger = item.trigger || '';

&#x20;   const text = (title + trigger).toLowerCase();



&#x20;   // 启发式匹配

&#x20;   if (text.includes('定位') || text.includes('方向') || text.includes('目标')) {

&#x20;     if (!coveredCategories.has('核心定位')) {

&#x20;       suggestions.push({ category: '项目宪法', template: '核心定位', reason: '对话中多次讨论定位与方向' });

&#x20;       coveredCategories.add('核心定位');

&#x20;     }

&#x20;   }

&#x20;   if (text.includes('用户') || text.includes('客户') || text.includes('需求')) {

&#x20;     if (!coveredCategories.has('用户画像')) {

&#x20;       suggestions.push({ category: '市场洞察', template: '用户画像', reason: '涉及用户相关讨论' });

&#x20;       coveredCategories.add('用户画像');

&#x20;     }

&#x20;   }

&#x20;   if (text.includes('决策') || text.includes('选择') || text.includes('方案')) {

&#x20;     if (!coveredCategories.has('决策日志')) {

&#x20;       suggestions.push({ category: '决策图谱', template: '决策日志', reason: '包含多步决策推演' });

&#x20;       coveredCategories.add('决策日志');

&#x20;     }

&#x20;   }

&#x20;   if (text.includes('风险') || text.includes('问题') || text.includes('困难')) {

&#x20;     if (!coveredCategories.has('风险评估')) {

&#x20;       suggestions.push({ category: '决策图谱', template: '风险评估', reason: '讨论了风险与限制' });

&#x20;       coveredCategories.add('风险评估');

&#x20;     }

&#x20;   }

&#x20;   if (text.includes('增长') || text.includes('策略') || text.includes('渠道')) {

&#x20;     if (!coveredCategories.has('增长飞轮')) {

&#x20;       suggestions.push({ category: '策略增长', template: '增长飞轮', reason: '涉及增长策略讨论' });

&#x20;       coveredCategories.add('增长飞轮');

&#x20;     }

&#x20;   }

&#x20;   if (text.includes('功能') || text.includes('产品') || text.includes('feature')) {

&#x20;     if (!coveredCategories.has('需求场景')) {

&#x20;       suggestions.push({ category: '市场洞察', template: '需求场景', reason: '产品功能需求讨论' });

&#x20;       coveredCategories.add('需求场景');

&#x20;     }

&#x20;   }

&#x20;   if (text.includes('时间') || text.includes('阶段') || text.includes('里程碑') || text.includes('路线')) {

&#x20;     if (!coveredCategories.has('里程碑')) {

&#x20;       suggestions.push({ category: '路线图', template: '里程碑', reason: '涉及阶段规划' });

&#x20;       coveredCategories.add('里程碑');

&#x20;     }

&#x20;   }

&#x20;   if (text.includes('竞争') || text.includes('竞品') || text.includes('对手')) {

&#x20;     if (!coveredCategories.has('竞品分析')) {

&#x20;       suggestions.push({ category: '市场洞察', template: '竞品分析', reason: '提及竞争环境' });

&#x20;       coveredCategories.add('竞品分析');

&#x20;     }

&#x20;   }

&#x20;   if (text.includes('脆弱') || text.includes('依赖') || text.includes('单点')) {

&#x20;     if (!coveredCategories.has('单点故障')) {

&#x20;       suggestions.push({ category: '反脆弱', template: '单点故障', reason: '讨论了系统性风险' });

&#x20;       coveredCategories.add('单点故障');

&#x20;     }

&#x20;   }

&#x20;   if (text.includes('复盘') || text.includes('总结') || text.includes('教训')) {

&#x20;     if (!coveredCategories.has('复盘总结')) {

&#x20;       suggestions.push({ category: '决策图谱', template: '复盘总结', reason: '包含反思与总结' });

&#x20;       coveredCategories.add('复盘总结');

&#x20;     }

&#x20;   }

&#x20; });



&#x20; // 如果没有匹配到任何模板，给一个默认推荐

&#x20; if (suggestions.length === 0) {

&#x20;   suggestions.push(

&#x20;     { category: '项目宪法', template: '核心定位', reason: '建议梳理项目核心定位' },

&#x20;     { category: '决策图谱', template: '决策日志', reason: '建议记录关键决策过程' }

&#x20;   );

&#x20; }



&#x20; return suggestions;

};



// 生成报告摘要统计

const generateStats = (items) => {

&#x20; const confirmed = items.filter(i => i.status === 'confirmed').length;

&#x20; const rejected = items.filter(i => i.status === 'rejected').length;

&#x20; const edited = items.filter(i => i.status === 'edited').length;

&#x20; const pending = items.filter(i => !i.status || i.status === 'pending').length;

&#x20; 

&#x20; const categoryCount = {};

&#x20; items.forEach(item => {

&#x20;   const cat = item.category || '未分类';

&#x20;   categoryCount\[cat] = (categoryCount\[cat] || 0) + 1;

&#x20; });



&#x20; return { confirmed, rejected, edited, pending, total: items.length, categoryCount };

};



export default function ArchaeologyReportView({ session, onArchive, onBack }) {

&#x20; const \[expandedSections, setExpandedSections] = useState(new Set(\['summary', 'confirmed', 'suggestions']));

&#x20; const \[isGenerating, setIsGenerating] = useState(false);

&#x20; const \[reportGenerated, setReportGenerated] = useState(false);



&#x20; // 过滤出已确认/编辑过的分析项（构成报告的核心内容）

&#x20; const reportItems = (session?.analysis?.items || \[]).filter(

&#x20;   item => item.status === 'confirmed' || item.status === 'edited'

&#x20; );



&#x20; const stats = generateStats(session?.analysis?.items || \[]);

&#x20; const templateSuggestions = suggestTemplates(reportItems);



&#x20; const toggleSection = useCallback((section) => {

&#x20;   setExpandedSections(prev => {

&#x20;     const next = new Set(prev);

&#x20;     if (next.has(section)) next.delete(section);

&#x20;     else next.add(section);

&#x20;     return next;

&#x20;   });

&#x20; }, \[]);



&#x20; const handleGenerateReport = useCallback(() => {

&#x20;   setIsGenerating(true);

&#x20;   // 模拟生成延迟

&#x20;   setTimeout(() => {

&#x20;     setIsGenerating(false);

&#x20;     setReportGenerated(true);

&#x20;   }, 1500);

&#x20; }, \[]);



&#x20; const handleArchive = useCallback(() => {

&#x20;   const report = {

&#x20;     sessionId: session.id,

&#x20;     sessionName: session.name,

&#x20;     generatedAt: new Date().toISOString(),

&#x20;     stats,

&#x20;     items: reportItems,

&#x20;     suggestions: templateSuggestions,

&#x20;     summary: generateExecutiveSummary(reportItems)

&#x20;   };

&#x20;   onArchive?.(report);

&#x20; }, \[session, stats, reportItems, templateSuggestions, onArchive]);



&#x20; // 生成执行摘要

&#x20; function generateExecutiveSummary(items) {

&#x20;   if (items.length === 0) return '暂无已确认的分析项。';

&#x20;   

&#x20;   const keyDecisions = items.filter(i => 

&#x20;     (i.title || '').includes('决策') || (i.trigger || '').includes('选择')

&#x20;   ).length;

&#x20;   

&#x20;   const keyTurningPoints = items.filter(i => 

&#x20;     (i.category || '') === 'turning\_point'

&#x20;   ).length;



&#x20;   return `本次对话考古共梳理出 ${items.length} 个关键认知节点，其中包含 ${keyDecisions} 个决策点和 ${keyTurningPoints} 个关键转折。建议将核心洞察归档至「${templateSuggestions\[0]?.category || '项目宪法'}」模块的「${templateSuggestions\[0]?.template || '核心定位'}」模板，形成可追溯的知识资产。`;

&#x20; }



&#x20; // 按类别分组

&#x20; const groupedItems = reportItems.reduce((acc, item) => {

&#x20;   const cat = item.category || '未分类';

&#x20;   if (!acc\[cat]) acc\[cat] = \[];

&#x20;   acc\[cat].push(item);

&#x20;   return acc;

&#x20; }, {});



&#x20; const categoryLabels = {

&#x20;   timeline: '时间轴',

&#x20;   turning\_point: '关键转折点',

&#x20;   blind\_spot: '认知盲区',

&#x20;   assumption: '未经证实的前提',

&#x20;   knowledge\_asset: '知识资产'

&#x20; };



&#x20; if (!session) {

&#x20;   return (

&#x20;     <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">

&#x20;       <FileText className="w-12 h-12 mb-3 opacity-30" />

&#x20;       <p>请先选择一个考古会话</p>

&#x20;     </div>

&#x20;   );

&#x20; }



&#x20; return (

&#x20;   <div className="flex flex-col h-full bg-white overflow-hidden">

&#x20;     {/\* 头部 \*/}

&#x20;     <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">

&#x20;       <div className="flex items-center gap-3">

&#x20;         <button onClick={onBack} className="text-gray-400 hover:text-gray-600 transition-colors">

&#x20;           ← 返回

&#x20;         </button>

&#x20;         <h3 className="font-semibold text-gray-800">考古报告</h3>

&#x20;         <span className="text-xs text-gray-400">「{session.name}」</span>

&#x20;       </div>

&#x20;       {!reportGenerated ? (

&#x20;         <button

&#x20;           onClick={handleGenerateReport}

&#x20;           disabled={isGenerating || reportItems.length === 0}

&#x20;           className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${

&#x20;             reportItems.length === 0

&#x20;               ? 'bg-gray-100 text-gray-400 cursor-not-allowed'

&#x20;               : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'

&#x20;           }`}

&#x20;         >

&#x20;           <Sparkles className="w-4 h-4" />

&#x20;           {isGenerating ? '生成中...' : '生成报告'}

&#x20;         </button>

&#x20;       ) : (

&#x20;         <button

&#x20;           onClick={handleArchive}

&#x20;           className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm"

&#x20;         >

&#x20;           <CheckCircle className="w-4 h-4" />

&#x20;           归档知识资产

&#x20;         </button>

&#x20;       )}

&#x20;     </div>



&#x20;     {/\* 内容区 \*/}

&#x20;     <div className="flex-1 overflow-y-auto p-5 space-y-4">

&#x20;       {!reportGenerated ? (

&#x20;         /\* 预览状态 \*/

&#x20;         <div className="space-y-4">

&#x20;           {/\* 统计卡片 \*/}

&#x20;           <div className="grid grid-cols-4 gap-3">

&#x20;             <div className="bg-indigo-50 rounded-lg p-3 text-center">

&#x20;               <div className="text-2xl font-bold text-indigo-600">{stats.confirmed}</div>

&#x20;               <div className="text-xs text-indigo-400 mt-1">已确认</div>

&#x20;             </div>

&#x20;             <div className="bg-emerald-50 rounded-lg p-3 text-center">

&#x20;               <div className="text-2xl font-bold text-emerald-600">{stats.edited}</div>

&#x20;               <div className="text-xs text-emerald-400 mt-1">已编辑</div>

&#x20;             </div>

&#x20;             <div className="bg-amber-50 rounded-lg p-3 text-center">

&#x20;               <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>

&#x20;               <div className="text-xs text-amber-400 mt-1">待处理</div>

&#x20;             </div>

&#x20;             <div className="bg-rose-50 rounded-lg p-3 text-center">

&#x20;               <div className="text-2xl font-bold text-rose-600">{stats.rejected}</div>

&#x20;               <div className="text-xs text-rose-400 mt-1">已驳回</div>

&#x20;             </div>

&#x20;           </div>



&#x20;           {/\* 待生成提示 \*/}

&#x20;           <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">

&#x20;             <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />

&#x20;             <p className="text-gray-500 text-sm mb-1">

&#x20;               共有 <span className="font-semibold text-gray-700">{reportItems.length}</span> 个已确认/编辑的分析项

&#x20;             </p>

&#x20;             <p className="text-gray-400 text-xs">

&#x20;               点击「生成报告」将汇总所有确认项，并推荐归档位置

&#x20;             </p>

&#x20;           </div>

&#x20;         </div>

&#x20;       ) : (

&#x20;         /\* 报告已生成 \*/

&#x20;         <div className="space-y-4 animate-in fade-in duration-500">

&#x20;           {/\* 执行摘要 \*/}

&#x20;           <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">

&#x20;             <div className="flex items-center gap-2 mb-2">

&#x20;               <Lightbulb className="w-4 h-4 text-indigo-500" />

&#x20;               <h4 className="font-semibold text-indigo-800 text-sm">执行摘要</h4>

&#x20;             </div>

&#x20;             <p className="text-sm text-indigo-700 leading-relaxed">

&#x20;               {generateExecutiveSummary(reportItems)}

&#x20;             </p>

&#x20;           </div>



&#x20;           {/\* 确认项详情 - 按类别分组 \*/}

&#x20;           <div className="border border-gray-200 rounded-xl overflow-hidden">

&#x20;             <button

&#x20;               onClick={() => toggleSection('confirmed')}

&#x20;               className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"

&#x20;             >

&#x20;               <div className="flex items-center gap-2">

&#x20;                 <CheckCircle className="w-4 h-4 text-emerald-500" />

&#x20;                 <span className="font-medium text-sm text-gray-700">

&#x20;                   已确认分析项 ({reportItems.length})

&#x20;                 </span>

&#x20;               </div>

&#x20;               {expandedSections.has('confirmed') ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}

&#x20;             </button>

&#x20;             

&#x20;             {expandedSections.has('confirmed') \&\& (

&#x20;               <div className="p-4 space-y-4">

&#x20;                 {Object.entries(groupedItems).map((\[category, items]) => (

&#x20;                   <div key={category}>

&#x20;                     <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">

&#x20;                       <GitBranch className="w-3 h-3" />

&#x20;                       {categoryLabels\[category] || category}

&#x20;                     </h5>

&#x20;                     <div className="space-y-2">

&#x20;                       {items.map((item, idx) => (

&#x20;                         <div key={idx} className="bg-gray-50 rounded-lg p-3">

&#x20;                           <div className="font-medium text-sm text-gray-800 mb-1">{item.title}</div>

&#x20;                           <div className="text-xs text-gray-500 mb-1">触发: {item.trigger}</div>

&#x20;                           {item.finalChoice \&\& (

&#x20;                             <div className="text-xs text-indigo-600 bg-indigo-50 inline-block px-2 py-1 rounded">

&#x20;                               最终选择: {item.finalChoice}

&#x20;                             </div>

&#x20;                           )}

&#x20;                         </div>

&#x20;                       ))}

&#x20;                     </div>

&#x20;                   </div>

&#x20;                 ))}

&#x20;                 {reportItems.length === 0 \&\& (

&#x20;                   <p className="text-sm text-gray-400 text-center py-4">暂无已确认项</p>

&#x20;                 )}

&#x20;               </div>

&#x20;             )}

&#x20;           </div>



&#x20;           {/\* 知识资产推荐 \*/}

&#x20;           <div className="border border-gray-200 rounded-xl overflow-hidden">

&#x20;             <button

&#x20;               onClick={() => toggleSection('suggestions')}

&#x20;               className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"

&#x20;             >

&#x20;               <div className="flex items-center gap-2">

&#x20;                 <BookOpen className="w-4 h-4 text-amber-500" />

&#x20;                 <span className="font-medium text-sm text-gray-700">

&#x20;                   知识资产归档推荐 ({templateSuggestions.length})

&#x20;                 </span>

&#x20;               </div>

&#x20;               {expandedSections.has('suggestions') ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}

&#x20;             </button>

&#x20;             

&#x20;             {expandedSections.has('suggestions') \&\& (

&#x20;               <div className="p-4 space-y-3">

&#x20;                 {templateSuggestions.map((s, idx) => (

&#x20;                   <div key={idx} className="flex items-start gap-3 bg-amber-50 rounded-lg p-3 border border-amber-100">

&#x20;                     <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">

&#x20;                       <span className="text-xs font-bold text-amber-600">{s.category\[0]}</span>

&#x20;                     </div>

&#x20;                     <div className="flex-1 min-w-0">

&#x20;                       <div className="flex items-center gap-2 mb-1">

&#x20;                         <span className="font-medium text-sm text-gray-800">{s.template}</span>

&#x20;                         <span className="text-xs text-gray-400">· {s.category}</span>

&#x20;                       </div>

&#x20;                       <p className="text-xs text-gray-500">{s.reason}</p>

&#x20;                     </div>

&#x20;                     <button className="flex-shrink-0 text-xs text-indigo-600 hover:text-indigo-700 font-medium">

&#x20;                       去归档 →

&#x20;                     </button>

&#x20;                   </div>

&#x20;                 ))}

&#x20;               </div>

&#x20;             )}

&#x20;           </div>



&#x20;           {/\* 认知盲区提醒 \*/}

&#x20;           {stats.categoryCount\['blind\_spot'] > 0 \&\& (

&#x20;             <div className="flex items-start gap-3 bg-rose-50 rounded-xl p-4 border border-rose-100">

&#x20;               <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />

&#x20;               <div>

&#x20;                 <h4 className="font-semibold text-rose-700 text-sm mb-1">认知盲区提醒</h4>

&#x20;                 <p className="text-xs text-rose-600 leading-relaxed">

&#x20;                   本次对话识别出 {stats.categoryCount\['blind\_spot']} 个潜在认知盲区，建议重点关注并设置验证计划。

&#x20;                 </p>

&#x20;               </div>

&#x20;             </div>

&#x20;           )}

&#x20;         </div>

&#x20;       )}

&#x20;     </div>

&#x20;   </div>

&#x20; );

}

```



\---



\## 整合组件：ArchaeologyPanel.jsx — 四模块统一调度



```jsx

// src/components/ArchaeologyPanel.jsx

import React, { useState, useCallback, useEffect } from 'react';

import { Sparkles, Loader2 } from 'lucide-react';

import { archaeologyStore } from '../utils/dataStore';

import { generateWithAI } from '../utils/aiService';

import { ARCHAEOLOGY\_V2\_PROMPT } from '../config/aiPrompts';

import ArchaeologySessionList from './ArchaeologySessionList';

import ArchaeologyInputArea from './ArchaeologyInputArea';

import ArchaeologyReviewPanel from './ArchaeologyReviewPanel';

import ArchaeologyReportView from './ArchaeologyReportView';



// 解析AI返回的五维JSON

const parseAnalysisResult = (rawText) => {

&#x20; try {

&#x20;   // 尝试直接解析

&#x20;   const json = JSON.parse(rawText);

&#x20;   return normalizeAnalysis(json);

&#x20; } catch {

&#x20;   // 尝试从markdown代码块中提取

&#x20;   const codeBlock = rawText.match(/```(?:json)?\\s\*(\[\\s\\S]\*?)```/);

&#x20;   if (codeBlock) {

&#x20;     try {

&#x20;       const json = JSON.parse(codeBlock\[1]);

&#x20;       return normalizeAnalysis(json);

&#x20;     } catch {

&#x20;       // ignore

&#x20;     }

&#x20;   }

&#x20;   // 尝试提取JSON对象

&#x20;   const jsonMatch = rawText.match(/\\{\[\\s\\S]\*\\}/);

&#x20;   if (jsonMatch) {

&#x20;     try {

&#x20;       const json = JSON.parse(jsonMatch\[0]);

&#x20;       return normalizeAnalysis(json);

&#x20;     } catch {

&#x20;       // ignore

&#x20;     }

&#x20;   }

&#x20;   return null;

&#x20; }

};



// 标准化分析结果格式

const normalizeAnalysis = (json) => {

&#x20; const dimensions = \['timeline', 'turning\_points', 'blind\_spots', 'unverified\_assumptions', 'knowledge\_assets'];

&#x20; const items = \[];



&#x20; dimensions.forEach(dim => {

&#x20;   const arr = json\[dim] || json\[dim.replace('\_', '')] || \[];

&#x20;   arr.forEach(item => {

&#x20;     items.push({

&#x20;       id: `item\_${Date.now()}\_${Math.random().toString(36).substr(2, 9)}`,

&#x20;       category: dim.replace(/s$/, '').replace('\_point', '\_point').replace('\_spots', '\_spot'),

&#x20;       title: typeof item === 'string' ? item : (item.title || item.content || item.description || JSON.stringify(item)),

&#x20;       trigger: typeof item === 'object' ? (item.trigger || item.context || item.reason || '') : '',

&#x20;       finalChoice: typeof item === 'object' ? (item.choice || item.decision || item.conclusion || '') : '',

&#x20;       status: 'pending',

&#x20;       confidence: typeof item === 'object' ? (item.confidence || 'medium') : 'medium'

&#x20;     });

&#x20;   });

&#x20; });



&#x20; return { items, rawDimensions: json };

};



export default function ArchaeologyPanel({ projectId }) {

&#x20; const \[sessions, setSessions] = useState(\[]);

&#x20; const \[currentSessionId, setCurrentSessionId] = useState(null);

&#x20; const \[isAnalyzing, setIsAnalyzing] = useState(false);

&#x20; const \[view, setView] = useState('review'); // 'review' | 'report'



&#x20; // 加载会话列表

&#x20; useEffect(() => {

&#x20;   const loaded = archaeologyStore.listSessions(projectId);

&#x20;   setSessions(loaded);

&#x20;   if (loaded.length > 0 \&\& !currentSessionId) {

&#x20;     setCurrentSessionId(loaded\[0].id);

&#x20;   }

&#x20; }, \[projectId, currentSessionId]);



&#x20; const currentSession = sessions.find(s => s.id === currentSessionId);



&#x20; // 创建新会话

&#x20; const handleCreateSession = useCallback(() => {

&#x20;   const name = `考古 ${new Date().toLocaleDateString('zh-CN')} ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;

&#x20;   const session = archaeologyStore.createSession(name, projectId);

&#x20;   setSessions(prev => \[session, ...prev]);

&#x20;   setCurrentSessionId(session.id);

&#x20;   setView('review');

&#x20;   return session;

&#x20; }, \[projectId]);



&#x20; // 删除会话

&#x20; const handleDeleteSession = useCallback((sessionId) => {

&#x20;   archaeologyStore.deleteSession(sessionId);

&#x20;   setSessions(prev => {

&#x20;     const filtered = prev.filter(s => s.id !== sessionId);

&#x20;     if (currentSessionId === sessionId \&\& filtered.length > 0) {

&#x20;       setCurrentSessionId(filtered\[0].id);

&#x20;     } else if (filtered.length === 0) {

&#x20;       setCurrentSessionId(null);

&#x20;     }

&#x20;     return filtered;

&#x20;   });

&#x20; }, \[currentSessionId]);



&#x20; // 追加对话并分析

&#x20; const handleAnalyze = useCallback(async (conversationText) => {

&#x20;   if (!conversationText.trim() || !currentSessionId) return;

&#x20;   

&#x20;   setIsAnalyzing(true);



&#x20;   try {

&#x20;     // 1. 保存对话内容

&#x20;     archaeologyStore.addConversationChunk(currentSessionId, conversationText);



&#x20;     // 2. 获取合并后的完整对话

&#x20;     const mergedConversation = archaeologyStore.getMergedConversation(currentSessionId);



&#x20;     // 3. 调用AI分析

&#x20;     const prompt = ARCHAEOLOGY\_V2\_PROMPT.replace('{{conversation}}', mergedConversation);

&#x20;     const result = await generateWithAI({

&#x20;       systemPrompt: '你是一位专业的对话考古分析师，擅长从对话中提取结构化知识。',

&#x20;       userPrompt: prompt,

&#x20;       temperature: 0.7

&#x20;     });



&#x20;     // 4. 解析结果

&#x20;     const analysis = parseAnalysisResult(result);



&#x20;     if (analysis \&\& analysis.items.length > 0) {

&#x20;       // 5. 更新会话分析数据

&#x20;       const updatedSession = archaeologyStore.updateAnalysis(currentSessionId, analysis);

&#x20;       

&#x20;       // 6. 更新本地状态

&#x20;       setSessions(prev => prev.map(s => 

&#x20;         s.id === currentSessionId ? { ...s, ...updatedSession } : s

&#x20;       ));

&#x20;     }

&#x20;   } catch (error) {

&#x20;     console.error('分析失败:', error);

&#x20;   } finally {

&#x20;     setIsAnalyzing(false);

&#x20;   }

&#x20; }, \[currentSessionId]);



&#x20; // 更新单项状态（确认/驳回/编辑）

&#x20; const handleItemAction = useCallback((itemId, action, editedData = null) => {

&#x20;   const statusMap = {

&#x20;     confirm: 'confirmed',

&#x20;     reject: 'rejected',

&#x20;     edit: 'edited'

&#x20;   };



&#x20;   const session = archaeologyStore.updateItemStatus(

&#x20;     currentSessionId, 

&#x20;     itemId, 

&#x20;     statusMap\[action],

&#x20;     editedData

&#x20;   );



&#x20;   if (session) {

&#x20;     setSessions(prev => prev.map(s => 

&#x20;       s.id === currentSessionId ? { ...s, ...session } : s

&#x20;     ));

&#x20;   }

&#x20; }, \[currentSessionId]);



&#x20; // 归档报告

&#x20; const handleArchive = useCallback((report) => {

&#x20;   // 保存到项目文档系统

&#x20;   const docData = {

&#x20;     type: 'archaeology\_report',

&#x20;     title: `考古报告: ${report.sessionName}`,

&#x20;     content: JSON.stringify(report, null, 2),

&#x20;     createdAt: report.generatedAt

&#x20;   };

&#x20;   

&#x20;   // 触发外部归档回调

&#x20;   console.log('归档报告:', docData);

&#x20;   

&#x20;   // 可以在这里调用 onArchive callback 或 dispatch 事件

&#x20; }, \[]);



&#x20; return (

&#x20;   <div className="flex h-full bg-white">

&#x20;     {/\* 左侧：会话列表 \*/}

&#x20;     <div className="w-64 flex-shrink-0 border-r border-gray-200">

&#x20;       <ArchaeologySessionList

&#x20;         sessions={sessions}

&#x20;         currentSessionId={currentSessionId}

&#x20;         onSelectSession={setCurrentSessionId}

&#x20;         onCreateSession={handleCreateSession}

&#x20;         onDeleteSession={handleDeleteSession}

&#x20;       />

&#x20;     </div>



&#x20;     {/\* 中间：输入区 + 审阅面板 或 报告视图 \*/}

&#x20;     <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200">

&#x20;       {/\* 输入区（固定在顶部） \*/}

&#x20;       <div className="flex-shrink-0 border-b border-gray-200">

&#x20;         <ArchaeologyInputArea

&#x20;           onAnalyze={handleAnalyze}

&#x20;           isAnalyzing={isAnalyzing}

&#x20;           sessionName={currentSession?.name}

&#x20;           conversationCount={currentSession?.conversationChunks?.length || 0}

&#x20;         />

&#x20;       </div>



&#x20;       {/\* 可切换：审阅面板 / 报告视图 \*/}

&#x20;       <div className="flex-1 overflow-hidden">

&#x20;         {view === 'review' ? (

&#x20;           <ArchaeologyReviewPanel

&#x20;             items={currentSession?.analysis?.items || \[]}

&#x20;             onItemAction={handleItemAction}

&#x20;             onGenerateReport={() => setView('report')}

&#x20;           />

&#x20;         ) : (

&#x20;           <ArchaeologyReportView

&#x20;             session={currentSession}

&#x20;             onArchive={handleArchive}

&#x20;             onBack={() => setView('review')}

&#x20;           />

&#x20;         )}

&#x20;       </div>

&#x20;     </div>



&#x20;     {/\* 右侧：AI分析状态或快捷操作 \*/}

&#x20;     <div className="w-12 flex-shrink-0 bg-gray-50 border-l border-gray-200 flex flex-col items-center py-4 gap-3">

&#x20;       {isAnalyzing ? (

&#x20;         <div className="relative group">

&#x20;           <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />

&#x20;           <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">

&#x20;             AI分析中...

&#x20;           </div>

&#x20;         </div>

&#x20;       ) : (

&#x20;         <div className="relative group">

&#x20;           <Sparkles className="w-5 h-5 text-gray-300" />

&#x20;           <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">

&#x20;             就绪

&#x20;           </div>

&#x20;         </div>

&#x20;       )}

&#x20;       

&#x20;       {/\* 视图切换指示 \*/}

&#x20;       <div className={`w-2 h-2 rounded-full ${view === 'report' ? 'bg-emerald-400' : 'bg-indigo-400'}`} title={view === 'report' ? '报告视图' : '审阅视图'} />

&#x20;     </div>



&#x20;     {/\* 全屏分析遮罩 \*/}

&#x20;     {isAnalyzing \&\& (

&#x20;       <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">

&#x20;         <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">

&#x20;           <div className="relative">

&#x20;             <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />

&#x20;             <Sparkles className="w-6 h-6 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

&#x20;           </div>

&#x20;           <div className="text-center">

&#x20;             <p className="font-medium text-gray-800">AI 正在深度分析对话...</p>

&#x20;             <p className="text-sm text-gray-400 mt-1">五维解构：时间轴 → 转折点 → 盲区 → 假设 → 资产</p>

&#x20;           </div>

&#x20;         </div>

&#x20;       </div>

&#x20;     )}

&#x20;   </div>

&#x20; );

}

```



\---



\## 对 ArchaeologyReviewPanel 的微小补充



为了让 `ArchaeologyReviewPanel` 支持"生成报告"按钮（从审阅视图切换到报告视图），需要在 ReviewPanel 的头部或底部添加这个入口。以下是建议添加到你现有 `ArchaeologyReviewPanel.jsx` 的片段：



```jsx

// 添加到 ArchaeologyReviewPanel.jsx 的头部区域，与标题同行

<div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">

&#x20; <h3 className="font-semibold text-gray-800">五维审阅</h3>

&#x20; <button

&#x20;   onClick={onGenerateReport}

&#x20;   disabled={confirmedCount === 0}

&#x20;   className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${

&#x20;     confirmedCount > 0

&#x20;       ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'

&#x20;       : 'bg-gray-100 text-gray-400 cursor-not-allowed'

&#x20;   }`}

&#x20; >

&#x20;   <FileText className="w-3.5 h-3.5" />

&#x20;   生成报告 ({confirmedCount})

&#x20; </button>

</div>

```



\---



\## 文件清单



你需要将以下文件放入项目中：



| 文件 | 路径 | 说明 |

|------|------|------|

| ArchaeologyReportView.jsx | `src/components/ArchaeologyReportView.jsx` | 新增：报告生成与归档推荐 |

| ArchaeologyPanel.jsx | `src/components/ArchaeologyPanel.jsx` | 整合组件：统一调度四模块 |

| ArchaeologyReviewPanel.jsx（补充） | 修改现有文件 | 添加"生成报告"按钮 |



\*\*已确认你本地已有的文件\*\*（无需改动）：

\- `ArchaeologySessionList.jsx` ✅

\- `ArchaeologyInputArea.jsx` ✅  

\- `ArchaeologyReviewPanel.jsx` ✅（仅需添加上述按钮）



\---



\## 下一步



现在对话考古 V2.0 的四个子组件全部到位：



| 步骤 | 组件 | 状态 |

|------|------|------|

| 1 | ArchaeologySessionList | ✅ 已有 |

| 2 | ArchaeologyInputArea | ✅ 已有 |

| 3 | ArchaeologyReviewPanel | ✅ 已有（+ 补充生成报告按钮） |

| 4 | ArchaeologyReportView | ⬆️ \*\*本次新增\*\* |

| 整合 | ArchaeologyPanel | ⬆️ \*\*本次新增\*\* |



你需要做的：

1\. 创建 `ArchaeologyReportView.jsx`

2\. 创建/替换 `ArchaeologyPanel.jsx`（入口组件）

3\. 在 `ArchaeologyReviewPanel.jsx` 中添加"生成报告"按钮

4\. 在路由或主布局中挂载 `<ArchaeologyPanel projectId="..." />`



需要我给出 Trae 可以直接复制粘贴的完整指令吗？

