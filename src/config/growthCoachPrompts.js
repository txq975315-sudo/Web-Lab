/**
 * 成长教练 P0：competitive_analysis + 多维拆解法
 */

import { STRUCTURED_OUTPUT_RULES_ZH } from './structuredTextSpec.js'
import { COMPETITIVE_L5_FIELD_ORDER } from './hintLevels.js'

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
2. 在 fields.competitorName 中填写**该真实竞品的正式名称**；各维度**不预填任何内容**，所有字段返回空字符串，让用户独立完成。
3. 字段 keys 必须与下列一致：
competitorName, price, availability, packaging, performance, easeOfUse, assurance, lifeCycle, social, ourAdvantage

结构：
\`\`\`json
{
  "scenario": "场景段落",
  "prefillHint": "给用户的一句指引（可选，可为空字符串）",
  "fields": {
    "competitorName": "",
    "price": "",
    "...": ""
  }
}
\`\`\`

方法论强调：${methodologyName}`
}

export function buildScoreExercisePrompt(scenario, fieldsJson, methodologyName, hintCountsByField) {
  const hintLines =
    hintCountsByField && typeof hintCountsByField === 'object'
      ? COMPETITIVE_L5_FIELD_ORDER.map((k) => `${k}: ${Math.min(3, Math.max(0, Number(hintCountsByField[k]) || 0))}`).join('；')
      : ''
  const hintBlock = hintLines
    ? `
【各字段「给点提示」点击次数（每字段 0–3）】
${hintLines}
说明：请在「四维度完整性」「回答深度」相关 rubricComments 中**适度**体现提示依赖度——多次依赖提示可能表示仍在摸索框架，但若最终作答事实充分、结构完整，则不应仅因提示次数高而机械压分；可点名 1～2 个「高提示次数且仍薄」的 $APPEALS 字段作建设性提醒。`
    : ''

  return `你是资深产品经理面试官。用户对「竞品分析」模板提交了如下练习（字段为 $APPEALS 拆解项）。请**不要**再按每个 APPEALS 字段单独打分；改用下面**唯一**的三分项量表，总分 0–10（整数）。
${hintBlock}

【三分项量表（须严格遵守分值上限）】
1) **fourDimensionsCompleteness（0–4）四维度分析完整性**  
   综合用户全部作答，判断是否覆盖商业拆解的四个视角（不要求逐字出现小标题，看实质内容）：  
   · **用户视角层**：谁在用、价值、口碑/评价线索  
   · **产品功能层**：功能对比、差异、性能/包装等硬对比  
   · **用户体验层**：易用、路径、生命周期、可获得性等体验侧  
   · **业务视角层**：定价、增长/获客、商业模式、社会接受度等  
   0=几乎未覆盖；1=仅覆盖其中 1 层且浅；2=覆盖 2 层或多层但很浅；3=覆盖 3 层且有一定论据；4=四层都有合理展开与论据。

2) **answerDepth（0–4）任务回答深度**  
   场景若提出了具体问题（如体验差异、商业化、机会风险等），看用户是否在作答中**落到具体产品事实、可核对线索或清晰逻辑链**，而非空泛观点。  
   0=未回应或跑题；1=有观点几乎无事实；2=部分问题有事实、整体偏浅；3=多数要点有事实或合理推断；4=各要点均有具体事实/对比支撑，逻辑完整。

3) **differentiationInsight（0–2）差异化洞察**  
   0=未体现差异或仅罗列功能；1=有差异思考但不够深或未落到策略；2=指出可执行的机会点/风险与己方定位的关联。

【总分】overallScore 必须等于三项分数之和（0–10 的整数），不得与三项之和不一致。

${PUBLIC_REALITY_BLOCK}
${STRUCTURED_OUTPUT_RULES_ZH}
- 三条 rubricComments 须**引用用户作答中的具体字句或观点**（可短摘），再写评价；禁止空泛套话。
- blindSpot、methodologyBind、followUpHints：仍须体现**现实操盘**与诚实边界；禁止捏造内部数据与虚假来源。
- rubricComments、blindSpot、methodologyBind：每条至少用 \\n\\n 分段，优先「## 简评」+ 列表；禁止只有一两句无结构的通段。

场景：
${scenario}

用户填写（JSON）：
${fieldsJson}

方法论：${methodologyName}

只输出一个 JSON 代码块，结构：
\`\`\`json
{
  "overallScore": 8,
  "rubricScores": {
    "fourDimensionsCompleteness": 3,
    "answerDepth": 3,
    "differentiationInsight": 2
  },
  "rubricComments": {
    "fourDimensionsCompleteness": "## 简评\\n- **亮点**：…（引用用户原文）\\n- **缺口**：…",
    "answerDepth": "…",
    "differentiationInsight": "…"
  },
  "weakestAspects": ["answerDepth"],
  "blindSpot": "## 最大盲区\\n- **问题**：…\\n- **为何重要**：…",
  "methodologyBind": "## 方法论对齐\\n- **主方法论**：…\\n- **辅方法论**：…",
  "followUpHints": ["给模拟追问用的要点1", "要点2"]
}
\`\`\`

weakestAspects：从 rubricScores 三项 key 中选分数最低的 1–2 个（并列低则都列出）：\`fourDimensionsCompleteness\` | \`answerDepth\` | \`differentiationInsight\`。`
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

/**
 * 内嵌模拟追问 · 首轮：基于评分产出第一个追问（严格 JSON）
 */
export function buildMockInterviewOpenPrompt({
  projectName,
  scenario,
  fieldsJson,
  overallScore,
  weakestAspects,
  blindSpot,
  followUpHints,
}) {
  const wa = Array.isArray(weakestAspects) ? weakestAspects.join('、') : String(weakestAspects || '')
  const fh = Array.isArray(followUpHints) ? followUpHints.join('\n- ') : String(followUpHints || '')
  return `你是「严格的合伙人」，与用户共同对练习结果负责；语气探究、不挑衅，不给现成答案。
${PUBLIC_REALITY_BLOCK}
${STRUCTURED_OUTPUT_RULES_ZH}

【任务】用户刚完成竞品分析练习并得到 AI 评分。请基于评分薄弱项与盲区，提出**第一轮**苏格拉底式追问（一个问题即可，可含 1～2 个小子问）。

项目：${projectName || '当前项目'}
场景（摘要）：${(scenario || '').slice(0, 600)}${(scenario || '').length > 600 ? '…' : ''}
用户作答（JSON）：${fieldsJson}
总分：${overallScore}
分项薄弱（weakestAspects）：${wa || '—'}
盲区摘要：${(blindSpot || '').slice(0, 400)}
追问线索（followUpHints）：${fh || '—'}

只输出一个 JSON 代码块：
\`\`\`json
{
  "openingQuestion": "string，Markdown，1～3 段，直接对用户说话",
  "focusLabel": "本轮聚焦（中文短标签，如：定价与壁垒）"
}
\`\`\``
}

/**
 * 内嵌模拟追问 · 后续轮：根据用户回答继续或收尾
 */
export function buildMockInterviewTurnPrompt({ transcript, userAnswer, round, maxRounds }) {
  return `你是「严格的合伙人」，探究但不挑衅；用户已回答你的追问。
${PUBLIC_REALITY_BLOCK}
${STRUCTURED_OUTPUT_RULES_ZH}

【当前轮次】用户第 ${round} 轮回答（最多用户答 ${maxRounds} 轮后应收尾）。

【已发生对话（Markdown）】
${transcript}

【用户本轮回答】
${userAnswer}

只输出一个 JSON 代码块：
\`\`\`json
{
  "coachMessage": "string，Markdown：先简短反馈用户本轮要点，再决定是否继续追问",
  "followUpQuestion": "string 或 null — 若还需追问则给出下一问；若收尾则为 null",
  "done": "boolean",
  "closingSummary": "string，Markdown — done 为 true 时必填：2～4 句收束 + 一条下一步行动建议；否则空字符串"
}
\`\`\`

规则：
- 若用户回答已足够扎实，或已达信息边界，设 done=true 且 followUpQuestion=null。
- 若 round>=${maxRounds}，必须 done=true 并给出 closingSummary。
- 不要编造内部数据；不确定写「待核实」。`
}
