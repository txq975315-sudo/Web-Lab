/**
 * 压力测试引擎 — Prompt 资产（PRD/Agent_压力训练MVP讨论 Markdown 对齐）
 * @see docs/DATA_CONTRACT.md §4.6
 */

/** 与 `PRESSURE_PROMPT_CHANGELOG` 最新条一致；会话落库 `promptsVersion` 便于评测追溯 */
export const PRESSURE_TEST_PROMPTS_VERSION = '1.0.1-mvp'

/**
 * Prompt 版本变更（运维/回归对照用；不替代 Git 历史）
 * @type {readonly { version: string, date: string, summary: string }[]}
 */
export const PRESSURE_PROMPT_CHANGELOG = Object.freeze([
  {
    version: '1.0.1-mvp',
    date: '2026-05-13',
    summary: '阶段6：评测日志键、Layer2 抽检占位、回归用例；SessionStatus 收敛为 MVP 三态',
  },
  { version: '1.0.0-mvp', date: '2026-05', summary: '初始 MVP：系统角色、拆解、链式追问尾部、增量更新、盲区报告 user 模板' },
])

/** Layer2 异步抽检抽样率（仅写日志占位，不阻塞用户；测试环境见 pressureEvalLog） */
export const PRESSURE_LAYER2_SAMPLE_RATE = 0.1

export const PRESSURE_TEST_DEPTH_STORAGE_KEY = 'thinking-lab-pressure-depth'

/** 生产级系统角色（完整 Prompt 文本精简自 PRD，语义保留） */
export const PRESSURE_SYSTEM_PROMPT = `你是一位有12年经验的产品合伙人，参与过20+产品的从0到1。你的团队里有人提交了一个新想法，你需要帮他把这个想法想得更深、更扎实。你的风格极为严肃和严格。你对"大概""可能""我觉得"这类词零容忍。每一个观点都必须有依据，每一个假设都必须被验证。你不是在否定对方，你是在保护团队不做错误的事。你的挑剔是对产品的尊重。你不开玩笑，不闲聊，不鼓励。你只说与这个想法有关的话。

【追问原则 / 4条铁律】
1. 引用原则：每个追问必须引用对方的idea描述或之前的回答。不要凭空发问。
2. 具体原则：追问要让对方无法泛泛而谈，无法绕开核心矛盾。
3. 嵌套原则：每个追问本身就包含对上文点评（指出矛盾、模糊、过度乐观）。
4. 递进原则：追问越来越深，同一维度的问题不能平行重复。

【语气体系 / 3轮递进】
- 第1轮（严肃了解）：直接、不留情面地指出模糊点。句式："你说X——X的定义是什么？"
- 第2轮（严格挑刺）：直指矛盾，不给对方留退路。句式："你说X——如果大厂做呢？"
- 第3轮（冷酷拷问）：高压、逼到墙角。句式："你凭什么认为...？你有数据支撑吗？"

【禁忌黑名单】绝对禁止：鼓励性评价（"很好""不错""有创意"）、闲聊、寒暄、客套话。

【思考框架 / 生成追问前的4步思考】
步骤1：引用提取——对方上文中哪个词/哪句话是模糊的？
步骤2：盲区定位——这个模糊点属于哪个维度？
步骤3：追问设计——用当前轮次的语气，设计让对方无法绕开的追问。
步骤4：自我检查——是否引用上文？是否够具体？是否符合当前轮次？
思考过程不要输出，只输出最终 JSON。

【Few-shot示例】
示例1（第1轮）：对方说"我想做一个帮助人专注的App" → 追问："帮助人专注——你解决的是'开始专注'的问题，还是'维持专注'的问题？这两个问题对应的产品形态完全不同。你先回答这个，我们再往下聊。"
示例2（第2轮）：对方说"差异化是建筑感空间" → 追问："你说'建筑感空间'——Forest已经做了8年，用户心智里'种树=专注'已经固化。你凭什么认为用户会放弃一棵种了8年的树，去拥抱一个不知道是什么的'建筑'？"
示例3（第3轮）：对方说"大学生月付19块没问题" → 追问："你说月付19块没问题——请给我一个数据。你调研过多少大学生？他们的月均App支出是多少？19块占他们可支配收入的百分之几？不要告诉我你觉得没问题，告诉我数字。"

【校准检查清单】每次生成追问后检查：是否引用了上文具体内容？是否让对方无法搪塞？语气是否符合当前轮次？是否包含禁忌语？如有不通过，重新生成。`

export const INITIAL_DECONSTRUCT_USER = `【任务】从用户的自然语言描述中提取以下 9 个维度的信息，输出严格的 JSON（不要输出任何其他文本）。

【9个维度】
1. targetUser（目标用户）：具体人群 + 细分场景。如果只有大类而无场景 → "未明确"
2. painPoint（核心痛点）：用户在什么场景下遇到了什么问题
3. valueProposition（价值主张）：解决痛点后带来什么改变
4. solution（解决方案）：产品/服务形态
5. differentiation（差异化声明）：与竞品不同之处
6. businessModel（商业模式线索）：如何赚钱
7. keyAssumptions（关键假设）：至少2个最多5个
8. potentialCompetitors（潜在竞品）：用户提到的 + 品类常识高置信推断（专注类→Forest、番茄ToDo；社交→微信、小红书；电商→淘宝、拼多多、京东；笔记→Notion、飞书文档；音乐→网易云、QQ音乐；健身→Keep；出行→滴滴、高德；品类不明→不推断写"需进一步确认"）
9. riskSignals（风险信号）：至少1个最多5个

【输出格式】仅一个 JSON 对象：
{"targetUser":"...","painPoint":"...","valueProposition":"...","solution":"...","differentiation":"...","businessModel":"...","keyAssumptions":[],"potentialCompetitors":[],"riskSignals":[]}

用户 idea：
`

/**
 * @param {string} currentJson
 * @param {string} qaBlock
 */
export function buildIncrementalUpdateUser(currentJson, qaBlock) {
  return `【任务】根据用户在本轮回答中提供的新信息，更新拆解 JSON。

【当前拆解 JSON】
${currentJson}

【本轮问答】
${qaBlock}

【更新规则】
1. 补充：用户回答中明确的新信息 → 更新对应字段
2. 修正：用户回答纠正了之前的推断 → 修正对应字段
3. 验证：用户回答为某个假设提供了依据 → 在 keyAssumptions 中该条追加标记"[已验证]"（若尚未出现则保留原句并追加标记）
4. 新增：新假设、新风险 → 追加到 keyAssumptions / riskSignals
5. 保留：未被本轮影响的字段保持不变
6. keyAssumptions 最多5条，riskSignals 最多5条

【输出】仅输出完整更新后的 JSON，不要其他文本。`
}

/**
 * @param {Record<string, unknown>} d
 */
export function unclearDimensionsFromDeconstruction(d) {
  const keys = [
    ['targetUser', '目标用户'],
    ['painPoint', '核心痛点'],
    ['valueProposition', '价值主张'],
    ['solution', '解决方案'],
    ['differentiation', '差异化'],
    ['businessModel', '商业模式'],
  ]
  return keys.filter(([k]) => d[k] === '未明确').map(([, label]) => label)
}

/**
 * @param {object} p
 * @param {Record<string, unknown>} p.deconstruction
 * @param {string} p.originalIdea
 * @param {number} p.round 1..3
 * @param {number} p.question 1..3
 * @param {{ question: string, answer: string }[]} p.currentRoundQA
 * @param {{ round: number, question: string, answer: string }[]} p.priorFlat
 */
export function buildQuestionGenerationUserPrompt(p) {
  const { deconstruction, originalIdea, round, question, currentRoundQA, priorFlat } = p
  const dStr = JSON.stringify(deconstruction, null, 0)
  const tone =
    round === 1 ? '严肃了解' : round === 2 ? '严格挑刺' : '冷酷拷问'
  const pos = question === 1 ? '打开' : question === 2 ? '深入' : '逼到边界'
  const unc = unclearDimensionsFromDeconstruction(deconstruction).join('、') || '（无，则选最弱的已填维度追问）'

  let block = `【当前轮次】第 ${round} 轮（共3轮），语气：${tone}。第 ${question} 题（共3题），位置：${pos}。
【用户原始 idea】
${originalIdea}
【拆解结果 JSON】
${dStr}
`
  if (priorFlat.length) {
    block += `【前序轮次问答（逐字）】\n`
    for (const x of priorFlat) {
      block += `R${x.round}-Q?: ${x.question}\n用户：${x.answer}\n`
    }
  }
  if (currentRoundQA.length) {
    block += `【本轮已完成问答（逐字）】\n`
    for (let i = 0; i < currentRoundQA.length; i++) {
      block += `第${i + 1}问：${currentRoundQA[i].question}\n用户：${currentRoundQA[i].answer}\n`
    }
  }

  const tail =
    round === 1 && question === 1
      ? `【生成要求】从拆解中优先选择标注为"未明确"的维度切入：${unc}。指出该维度在描述中的模糊性，让对方无法一个词打发；结尾暗示后面还有更多问题。输出 50–80 字左右的追问。`
      : round === 1 && question === 2
        ? `【生成要求】引用用户第1问回答中的具体词句；检验真实性（观察还是调研、假设还是验证）；指出脆弱点。50–80 字。`
        : round === 1 && question === 3
          ? `【生成要求】综合前两问回答，指出对方未意识到的假设或偏差；结尾自然过渡到下一轮：「定位的问题先到这里。现在进入竞争追问——我们聊聊你的差异化和壁垒。」80–100 字。`
          : round === 2 && question === 1
            ? `【生成要求】结合差异化「${deconstruction.differentiation}」与竞品「${(deconstruction.potentialCompetitors || []).join('、')}」；用「你说X——Y已经在做Z，你的X和Y的Z本质有什么不同？」类句式；50–80 字。`
            : round === 2 && question === 2
              ? `【生成要求】引用用户对差异化的回答；挑战壁垒：大厂复制后用户为何不回流；不接受空泛「体验更好」。50–80 字。`
              : round === 2 && question === 3
                ? `【生成要求】基于前两问逼出竞争短板；结尾过渡：「竞争层面的探讨结束了。最后我们看看可行性——你的商业模式和应对风险的Plan B。」80–100 字。`
                : round === 3 && question === 1
                  ? `【生成要求】围绕商业模式「${deconstruction.businessModel}」与关键假设；若未提商业模式则直接问怎么赚钱；语气更冷酷直接。50–80 字。`
                  : round === 3 && question === 2
                    ? `【生成要求】引用用户对商业模式/定价的回答；挑战合理性，要求数据，不接受「我觉得没问题」。50–80 字。`
                    : `【生成要求】基于前两问逼出风险场景或 Plan B；结尾：「三轮追问结束。接下来我为你生成一份思维盲区总结…」80–120 字。`

  block += `${tail}

【盲区标记】若根据「本轮最后一则用户回答」能判断暴露了新盲区，设置 blindSpotMarker 为对象，否则 null：
{"dimension":"目标用户|痛点|差异化|商业模式|关键假设|其他","description":"简短","severity":"high|medium|low"}

【输出格式】仅输出一个 JSON 对象（不要 markdown 围栏）：
{"question":"追问正文","blindSpotMarker":null 或对象}`

  return block
}

/**
 * @param {string} failedHint
 */
export function buildQuestionRetryUserPrompt(baseUserContent, failedHint) {
  return `${baseUserContent}

【修正要求】上一轮 JSON 不合格，原因：${failedHint}。请重新生成，只输出 JSON，字段同上。`
}

/**
 * @param {string} finalJson
 * @param {string} markersJson
 */
export function buildBlindSpotReportUser(finalJson, markersJson) {
  return `【任务】基于追问过程中积累的盲区标记与最终拆解，生成思维盲区快照。

【最终拆解 JSON】
${finalJson}

【累积盲区标记 JSON 数组】
${markersJson}

【步骤】汇总去重分级 → 生成 deconstructionSnapshot 表格行 → blindSpots 含 suggestion → verdict 仅填 needs_rethink 或 basically_viable，并写 verdictText。

【输出】仅输出一个 JSON：
{"deconstructionSnapshot":[{"dimension":"...","userClaim":"...","aiFinding":"..."}],"blindSpots":[{"dimension":"...","description":"...","severity":"high|medium|low","suggestion":"..."}],"verdict":"needs_rethink|basically_viable","verdictText":"...","totalHigh":0,"totalMedium":0,"totalLow":0}`
}
