/**
 * 成长教练 P0：competitive_analysis + 多维拆解法
 */

import { STRUCTURED_OUTPUT_RULES_ZH } from './structuredTextSpec.js'

/** 所有生成环节：强调公开信息锚点 + 成败案例 + 禁止捏造来源（模型无实时联网，用语须诚实） */
const PUBLIC_REALITY_BLOCK = `
【公开信息与真实案例（硬性）】
- 内容必须**站在可查证的公开信息**上展开：例如上市公司财报/招股书摘要、监管或交易所公示、产品发布公告与改版说明、权威媒体报道、投融资新闻、咨询机构或数据机构对赛道的**概括性结论**（如艾瑞、QuestMobile、Gartner 等对某领域的公开观点摘要）。不要虚构「某报告第 xx 页」、不要捏造具体财务数字或内部操盘细节。
- **成败都要能落地到真实品牌**：在 level2_case.body 中除对比两家（或多家）产品外，须包含一小节 **「现实锚点」**（可用 ### 现实锚点）：用 2～4 条要点，写清「哪些判断来自公开报道/行业共识」「哪些是合理的业内推断」；并尽量点到至少一条**可查的成败线索**（例如：某产品关停/收缩/逆袭份额的**公开层面原因**，与 $APPEALS 某一两条维度挂钩）。成功与失败不限，重在**现实操作里能学到的因果**，而非寓言。
- 严格区分：**事实**（有公开出处类型，如「据财报披露」「多家媒体报道」）与**推断**（须标注「通常认为」「可能」「有待验证」）。不确定则弱化表述，不要装成内部知情。
`

export const SYSTEM_JSON_PUBLIC_GROUNDING = `你是 Thinking Lab 成长教练，只输出用户要求的 JSON 代码块，不要输出其它文字。
写作须锚定公开可查的商业事实与行业共识；可概括媒体报道、公告、投融资与行业报告类结论。禁止捏造财报原文、虚假报告名称或页码、以及任何声称「内部数据」的内容。`

export function buildKnowledgeCardPrompt(projectName, methodologyName) {
  return `你是 Thinking Lab 成长教练。请为模板「竞品分析（$APPEALS）」生成一张知识卡片的 JSON，方法论：${methodologyName}。
${PUBLIC_REALITY_BLOCK}
要求：
${STRUCTURED_OUTPUT_RULES_ZH}
- 用口语，少堆术语；第三层「方法论总结」要自然点出「多维拆解 / 多维度对比」的用法。
- **Level 2 案例必须是「真实世界」对打**（这是硬性要求，不是可选）：
  · level2_case.title 与 body 中须出现**真实**的产品/公司/品牌全名或通行简称（如：Notion、飞书、钉钉、印象笔记、WPS、Figma、Canva、美团、滴滴 等），**禁止**使用「App A / App B」「产品甲/乙」「某笔记应用」「竞品X」等匿名或虚拟占位。
  · 若当前项目名能判断大致赛道，优先选**同赛道**里公众熟知的一对真实对手；若无法判断，则任选**广为人知**的一对真实产品做 $APPEALS 对比（仍须指名道姓）。
  · 各维度分析应基于**公开可得**的信息（官网定价/功能定位/行业常识/公开报道），不要编造内部数据；拿不准的用「偏…」「更偏…」等谨慎表述。
- **排版（字符串内支持 Markdown，不要用 HTML）**：以下字段请写出清晰层次——level1_one_liner、level2_case.body、level3_methodology 各项字符串均可使用：
  · 标题层级：行首 \`# \` 一级、\`## \` 二级、\`### \` 三级（递进纲要）。
  · 强调：\`**关键词**\`。
  · 无序列表：行首 \`- \` 或 \`* \`（每条一行）；有序列表：行首 \`1. \` \`2. \`（英文句点后空格）。
  · 引用：行首 \`> \`；分段用空行（JSON 里写 \`\\n\\n\`）；可加 \`---\` 分隔。
  · 若不用 Markdown，也至少用 \`\\n\` / \`\\n\\n\` 换行分段。
- 知识卡片**不再生成「自检清单」字段**（界面用固定三条标准即可，避免与练习场景混淆）。
- 只输出一个 JSON 代码块，不要其他文字。

JSON 结构严格如下（只有四个顶层字段，勿添加 level4_checklist）：
\`\`\`json
{
  "title": "短标题",
  "level1_one_liner": "## 核心\\n一句话解释竞品分析在干什么，可加 **关键词**。",
  "level2_case": { "title": "真实案例：Notion vs 飞书文档（示例，请按项目换真实对局）", "body": "## 对比概要\\n…\\n\\n### 现实锚点\\n- **公开事实**：…\\n- **业内推断**：…\\n- **成败线索**：某真实事件的公开层面解读…\\n\\n### 小结\\n一句收束。" },
  "level3_methodology": "## 怎么用\\n正文段落……\\n\\n### 注意\\n1. 要点一\\n2. 要点二"
}
\`\`\`

当前项目名：${projectName || '未命名项目'}`
}

export function buildExerciseScenarioPrompt(projectName, methodologyName, attemptNumber) {
  const fillRatio = attemptNumber <= 0 ? 0.5 : attemptNumber === 1 ? 0.2 : 0
  const pn = projectName || '当前项目'
  return `你是商业演练出题助手。请生成一道「竞品分析」练习题。
${PUBLIC_REALITY_BLOCK}

【己方产品必须与左侧项目一致（硬性，此前易错）】
· scenario 里「我方 / 自家 / 你负责的产品 / 产品经理所代表的品牌」**必须直接就是左侧当前项目「${pn}」**：正文里要**写出「${pn}」这个名字**，用它来指代己方；**禁止**再编造另一个虚构品牌名当主角（例如另起一个与「${pn}」无关的「东方玉容」类化名）；用户填写 fields 也是在拆解 **「${pn}」vs 真实竞品**。
· 场景的行业背景应尽量与「${pn}」可合理联想的产品形态一致（若项目名像 App/工具，就不要无故写成护肤品除非你在首句明确说明这是沙盘且仍用「${pn}」作为练习代号）。
· **意义说明**：己方可以是早期概念名（未上市也行），竞品选**真实品牌**，是为了在**公开材料充分**的一侧练拆解；练的是框架与叙事，不要求己方已是成熟公司。

要求：
${STRUCTURED_OUTPUT_RULES_ZH}
1. 给一个 100-180 字的中文**场景**：情节可虚构，但**竞品与矛盾必须锚定真实公司与公开叙事**（例如：围绕某次公开报道的价格战、某产品官宣下架、某财报披露的收入结构等——用概括表述，不要编造具体链接）。**必须点明一个真实存在的竞品**（全名/通行品牌名），**禁止**「竞品A」「某产品」等匿名。scenario 支持 Markdown 并用 \\n / \\n\\n 分段；可用一行说明「本题涉及的公开信息类型」（媒体报道/公告/行业共识等）。**第一或第二句必须出现「${pn}」作为己方主体。**
2. 在 fields.competitorName 中填写**该真实竞品的正式名称**；各维度预填须与场景中的公开叙事一致，用**可查或合理推断**的表述，禁止编造内部指标与机密数据。八维度对比的主体始终是 **「${pn}」vs competitorName**。
3. prefillRatio=${fillRatio}：请在 fields 里对约 ${Math.round(fillRatio * 100)}% 的维度给出较详细的示例填法（作为预填），其余用空字符串或一句提示让用户补全。
4. 只输出 JSON 代码块。

字段 keys 必须与下列一致：
competitorName, price, availability, packaging, performance, easeOfUse, assurance, lifeCycle, social, ourAdvantage

结构：
\`\`\`json
{
  "scenario": "场景段落",
  "prefillHint": "给用户的一句指引",
  "fields": {
    "competitorName": "",
    "price": "",
    "...": ""
  }
}
\`\`\`

方法论强调：${methodologyName}`
}

export function buildScoreExercisePrompt(scenario, fieldsJson, methodologyName) {
  return `你是资深产品经理面试官。用户对「竞品分析」模板提交了如下练习，请按 $APPEALS 相关维度逐项 1-5 分打分（整数），并给出口语化短评。
${PUBLIC_REALITY_BLOCK}
${STRUCTURED_OUTPUT_RULES_ZH}
- 点评与 blindSpot、followUpHints 应体现**现实操盘**：可点到同类真实产品在公开层面的成败教训（一句话类比即可），不要把点评写成纯空话；仍禁止捏造内部数据与虚假来源。
- dimensionComments、blindSpot、methodologyBind：每条须含清晰层次——至少用 \\n\\n 分段，优先用「## 简评」+ 列表写维度点评；禁止各字段只有一两句无标题、无列表的通段文字。

场景：
${scenario}

用户填写（JSON）：
${fieldsJson}

方法论：${methodologyName}

只输出一个 JSON 代码块，结构：
\`\`\`json
{
  "overallScore": 1,
  "dimensionScores": {
    "price": 3,
    "availability": 3,
    "packaging": 3,
    "performance": 3,
    "easeOfUse": 3,
    "assurance": 3,
    "lifeCycle": 3,
    "social": 3,
    "ourAdvantage": 3
  },
  "dimensionComments": {
    "price": "## 简评\\n- **亮点**：…\\n- **缺口**：…",
    "availability": "同上结构",
    "packaging": "…",
    "performance": "…",
    "easeOfUse": "…",
    "assurance": "…",
    "lifeCycle": "…",
    "social": "…",
    "ourAdvantage": "…"
  },
  "weakestDimensions": ["easeOfUse", "social"],
  "blindSpot": "## 最大盲区\\n- **问题**：…\\n- **为何重要**：…",
  "methodologyBind": "## 方法论对齐\\n- **主方法论**：…\\n- **辅方法论**：…",
  "followUpHints": ["给模拟追问用的要点1", "要点2"]
}
\`\`\`

weakestDimensions 取评分最低的 1-2 个 key（来自 dimensionScores）。overallScore 为 1-5 的总括（可与单项平均略有出入）。`
}

export function buildCoachHandoffMessage({ projectName, scenario, userFieldsSummary, feedbackSummary }) {
  return `【成长教练 · 模拟追问环节】
我刚在 Thinking Lab 里完成了「竞品分析（$APPEALS）」练习。
项目：${projectName || '当前项目'}
场景摘要：${scenario.slice(0, 400)}${scenario.length > 400 ? '…' : ''}

我的作答要点：
${userFieldsSummary}

AI 初步反馈：${feedbackSummary}

请你扮演温和、探究型的面试官。**追问请尽量贴近真实商业现实**：可引用同类公开成败案例作类比（一句话），帮助我把分析与落地动作联系起来；不要编造内部数据。针对我最薄弱的 1～2 个维度各提一个追问；若我回复「不知道」，请给引导提示而非直接给答案。`
}
