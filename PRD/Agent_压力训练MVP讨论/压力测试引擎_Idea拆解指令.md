# 压力测试引擎：Idea 拆解指令

> 配套系统角色 Prompt + 链式追问生成 Prompt 使用  
> 版本：v1.0  
> 日期：2026年5月

---

## 一、设计决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 拆解模式 | **迭代拆解** | 每轮追问后更新，用户补充的新信息被结构化 |
| 推断策略 | **混合策略** | 用户明确提到的 + 品类常识高置信度推断 |
| Fallback | **重试1次 → 降级** | 保证追问链不中断 |

---

## 二、迭代拆解流程

```
用户输入 idea
  → 【初始拆解】生成初始 JSON
  → 第1轮追问（基于初始拆解）
  → 用户回答（补充新信息）
  → 【增量更新】更新拆解 JSON（补充/修正）
  → 第2轮追问（基于更新后拆解）
  → 用户回答
  → 【增量更新】更新拆解 JSON
  → 第3轮追问
  → 用户回答
  → 【增量更新】生成最终拆解 JSON
  → 盲区快照基于最终拆解生成
```

### 2.1 更新时机

- **每轮结束后更新1次**，不是每问结束后更新
- 共 3 次更新（R1后、R2后、R3后）
- 更新是**增量更新**，不是重新拆解

### 2.2 更新策略

AI 收到：
1. 当前拆解 JSON（上一版本）
2. 本轮 3 个问答对（逐字）
3. 更新指令

AI 执行：
- 补充：用户新提及的信息（之前未明确的维度现在明确了）
- 修正：之前推断错误的字段（用户回答纠正了推断）
- 验证：用户回答中提供了依据的假设，标记为"已验证"
- 新增：用户回答中暴露的新假设、新风险

---

## 三、初始拆解 Prompt

```markdown
【任务】从用户的自然语言描述中提取以下 9 个维度的信息，输出严格的 JSON。

【9个维度】
1. targetUser（目标用户）：具体人群 + 细分场景。如果只有大类（如"大学生"）而无场景 → "未明确"
2. painPoint（核心痛点）：用户在什么场景下遇到了什么问题。如果只有笼统描述 → "未明确"
3. valueProposition（价值主张）：解决痛点后给用户带来什么改变。缺失时从 solution 推断，推断不成立 → "未明确"
4. solution（解决方案）：产品/服务形态。如果只是"App"而无具体功能 → "未明确"
5. differentiation（差异化声明）：用户声称的与竞品不同之处。缺失 → "未明确"
6. businessModel（商业模式线索）：如何赚钱。完全未提及 → "未明确"
7. keyAssumptions（关键假设）：用户认为"显然成立"但未经证实的前提。主动识别，至少2个最多5个
8. potentialCompetitors（潜在竞品）：用户提到的 + 品类常识推断（见推断规则）
9. riskSignals（风险信号）：自相矛盾、过度乐观、逻辑跳跃。主动识别，至少1个最多5个

【"未明确"的判断标准】
- 完全未提及 → "未明确"
- 被提及但过于笼统（只有一个词无具体定义） → 标注该词 + 在 riskSignals 中标注"XX定义过于笼统"
- 被提及但缺乏依据（"我觉得""可能""大概"） → 标注该描述 + 在 riskSignals 中标注"XX缺乏实证支撑"

【关键假设提取规则】
- 寻找因果关系："因为A所以B" → A 可能是假设
- 寻找无数据支撑的判断："用户会...""市场会..." → 这些都是假设
- 至少2个，最多5个

【风险信号识别规则】
- 自相矛盾：前后描述不匹配
- 过度乐观："肯定""一定""没问题"等绝对化表述
- 缺失环节：从痛点到解决方案的逻辑跳跃
- 至少1个，最多5个

【潜在竞品推断规则——混合策略】
- 用户明确提到的竞品 → 优先使用
- 用户未提到但属于品类常识的头部竞品 → 高置信度推断
- 品类不确定或竞品范围太广 → 不推断，标注"需进一步确认"
- 推断的竞品在追问中用疑问句式验证，不直接当作事实

【高置信度推断清单】（品类→必提竞品）
- 专注类App → Forest、番茄ToDo
- 社交类App → 微信、小红书
- 电商类 → 淘宝、拼多多、京东
- 笔记/文档 → Notion、飞书文档
- 音乐类 → 网易云音乐、QQ音乐
- 健身类 → Keep
- 出行类 → 滴滴、高德
- 品类不明确 → 不推断

【输出格式】严格的 JSON，不输出任何其他文本：

{
  "targetUser": "描述或'未明确'",
  "painPoint": "描述或'未明确'",
  "valueProposition": "描述或'未明确'",
  "solution": "描述或'未明确'",
  "differentiation": "描述或'未明确'",
  "businessModel": "描述或'未明确'",
  "keyAssumptions": ["假设1", "假设2"],
  "potentialCompetitors": ["竞品1", "竞品2"],
  "riskSignals": ["风险1", "风险2"]
}
```

---

## 四、增量更新 Prompt（每轮后）

```markdown
【任务】根据用户在本轮回答中提供的新信息，更新拆解 JSON。

【当前拆解 JSON】
{currentDeconstructionJSON}

【本轮问答】
Q1: {question1} / A1: {answer1}
Q2: {question2} / A2: {answer2}
Q3: {question3} / A3: {answer3}

【更新规则】
1. 补充：用户回答中明确的新信息（之前"未明确"的维度现在明确了）→ 更新对应字段
2. 修正：用户回答纠正了之前的推断 → 修正对应字段
3. 验证：用户回答为某个假设提供了依据 → 在 keyAssumptions 中标记为"[已验证]"
4. 新增：用户回答中暴露的新假设、新风险 → 添加到 keyAssumptions / riskSignals
5. 保留：未被本轮回答影响的字段 → 保持不变

【注意】
- 只更新被本轮回答影响过的字段
- 不要删除之前的合理推断（除非被用户明确否定）
- keyAssumptions 最多5个，riskSignals 最多5个，超出时保留最优先的
- 输出完整的更新后 JSON

【输出格式】完整的更新后 JSON，不输出任何其他文本。
```

---

## 五、代码层实现参考

### 5.1 拆解服务接口

```typescript
interface DeconstructionService {
  // 初始拆解
  initialDeconstruct(idea: string): Promise<IdeaDeconstruction>;
  
  // 增量更新（每轮后调用）
  incrementalUpdate(
    current: IdeaDeconstruction,
    roundQAs: QuestionAnswerPair[]
  ): Promise<IdeaDeconstruction>;
  
  // 获取最终拆解（R3后）
  getFinalDeconstruction(): IdeaDeconstruction;
}
```

### 5.2 主流程伪代码

```typescript
async function runPressureTest(userIdea: string): Promise<PressureSession> {
  // 1. 初始拆解
  let deconstruction = await deconstructionService.initialDeconstruct(userIdea);
  
  // 2. 三轮追问
  for (let round = 1; round <= 3; round++) {
    const roundQAs: QuestionAnswerPair[] = [];
    
    for (let q = 1; q <= 3; q++) {
      // 生成追问（基于当前拆解 + 全部对话历史）
      const question = await generateQuestion(round, q, deconstruction, session.history);
      
      // 展示追问，等待用户回答
      const answer = await waitForUserAnswer(question);
      roundQAs.push({ question, answer });
    }
    
    // 3. 每轮结束后增量更新拆解
    deconstruction = await deconstructionService.incrementalUpdate(deconstruction, roundQAs);
  }
  
  // 4. 最终拆解用于盲区快照
  return generateBlindSpotReport(deconstruction, session.history);
}
```

### 5.3 Fallback 降级方案

```typescript
async function initialDeconstructWithFallback(idea: string): Promise<IdeaDeconstruction> {
  // 第1次尝试
  let result = await callAIForDeconstruction(idea);
  
  // 校验
  if (validateDeconstruction(result)) {
    return result;
  }
  
  // 第2次尝试（重试）
  result = await callAIForDeconstruction(idea, { retry: true });
  
  if (validateDeconstruction(result)) {
    return result;
  }
  
  // 降级：使用默认值
  return getDefaultDeconstruction(idea);
}

function getDefaultDeconstruction(idea: string): IdeaDeconstruction {
  return {
    targetUser: "未明确",
    painPoint: "未明确",
    valueProposition: "未明确",
    solution: "未明确",
    differentiation: "未明确",
    businessModel: "未明确",
    keyAssumptions: [
      "用户需求存在且未被满足",
      "目标用户愿意为解决方案付费"
    ],
    potentialCompetitors: ["需进一步确认"],
    riskSignals: ["缺乏数据支撑"]
  };
}
```

---

## 六、Token 估算

| 调用时机 | 上下文内容 | 估算Token |
|---------|-----------|----------|
| 初始拆解 | system + 拆解Prompt + 用户idea | ~800 |
| R1后更新 | system + 更新Prompt + 当前JSON + 3个QA | ~1200 |
| R2后更新 | system + 更新Prompt + 当前JSON + 6个QA | ~1800 |
| R3后更新 | system + 更新Prompt + 当前JSON + 9个QA | ~2400 |

> 共 4 次拆解相关调用，总计 ~6200 token，在可控范围内。

---

## 七、决策记录

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 拆解模式 | 迭代拆解 | 用户补充的新信息被结构化，追问越来越精准 |
| 更新时机 | 每轮后1次 | 平衡更新频率和token消耗 |
| 更新策略 | 增量更新 | 不重新拆解，只更新被影响字段 |
| 推断策略 | 混合策略 | 用户提到的 + 品类常识推断 |
| 推断边界 | 品类明确时推断头部竞品 | 避免推断错误导致追问跑偏 |
| Fallback | 重试1次 → 默认值降级 | 保证追问链不中断 |
| 降级默认值 | 通用假设 + "未明确"填充 | 追问仍能继续，只是精准度降低 |
