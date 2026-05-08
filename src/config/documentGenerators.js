/**
 * Thinking Lab — AI 文档生成配置
 * 每个模板对应一套 AI 提示词 + 输出格式
 */

const GENERATORS = {
  constraint: {
    label: '硬性约束',
    systemPrompt: `你是一位严谨的产品架构审计官。基于用户提供的约束信息，生成一份结构清晰、论证充分的《项目硬性约束文档》。
每条约束必须说明"不可动摇的底层原因"和对后续决策的影响范围。
语气：冷静、精确、不容置疑。禁止模糊表述，所有约束必须可验证。`,
    buildPrompt: (fields) => `请基于以下信息生成《硬性约束文档》：

【约束内容】${fields.content || '（未填写）'}
【约束理由】${fields.rationale || '（未填写）'}
【约束影响】${fields.consequences || '（未填写）'}
【约束状态】${fields.status || 'proposed'}`,
    outputTemplate: `# 硬性约束条目

> **状态**: {{status}}

## 约束陈述
{{content}}

## 不可动摇的底层原因
{{rationale}}

## 对后续决策的影响范围
{{consequences}}

---

## 约束影响检查清单
- [ ] PRD 设计是否违反此约束？
- [ ] 技术选型是否违反此约束？
- [ ] 第三方依赖是否违反此约束？
- [ ] 未来扩展是否受此约束限制？`
  },

  graveyard: {
    label: '否决墓地',
    systemPrompt: `你是一位项目历史档案管理员。基于用户提供的被否决方案信息，生成一份《否决墓地记录》。
客观记录被否决的想法，不带情绪，清晰说明否决的理性依据。`,
    buildPrompt: (fields) => `请基于以下信息生成《否决墓地记录》：

【被否决的想法】${fields.idea || '（未填写）'}
【否决原因】${fields.reason || '（未填写）'}
【否决时间】${fields.vetoedAt || '（未填写）'}
【复活条件】${fields.revivalCondition || '（未提供）'}`,
    outputTemplate: `# 否决墓地记录

> **否决时间**: {{vetoedAt}}

## 被否决的想法
{{idea}}

## 否决依据
{{reason}}

## 复活条件评估
{{revivalCondition}}`
  },

  persona: {
    label: '用户画像',
    systemPrompt: `你是一位资深用户研究员。基于用户提供的画像信息，生成一份结构化、可用于设计决策的《用户画像档案》。
采用 Goal-Directed Design 框架，区分体验目标、终极目标和生活目标。
场景描述必须具体到可触发设计决策的程度。`,
    buildPrompt: (fields) => `请基于以下信息生成《用户画像档案》：

【Persona 名称】${fields.name || '（未填写）'}
【人口统计学信息】${fields.demographics || '（未填写）'}
【典型行为】${fields.behaviors || '（未填写）'}
【目标与动机】${fields.goals || '（未填写）'}
【痛点与挫折】${fields.painPoints || '（未填写）'}
【典型场景】${fields.scenarios || '（未填写）'}`,
    outputTemplate: `# 用户画像: {{name}}

## 1. 基本信息
{{demographics}}

## 2. 典型行为模式
{{behaviors}}

## 3. 目标层级分析
### 体验目标（Experience Goals）
### 终极目标（End Goals）
### 生活目标（Life Goals）
{{goals}}

## 4. 痛点与挫折
{{painPoints}}

## 5. 典型场景
{{scenarios}}

---

## 设计决策启示
| 痛点 | 设计回应 |
|------|---------|`
  },

  value_proposition: {
    label: '价值主张画布',
    systemPrompt: `你是一位商业模式设计师。基于用户提供的价值主张信息，生成一份可直接用于产品定位沟通和市场验证的《价值主张画布文档》。
严格遵循 Value Proposition Design 框架，区分"产品/服务"侧与"客户"侧。`,
    buildPrompt: (fields) => `请基于以下信息生成《价值主张画布文档》：

【一句话宣言】${fields.slogan || '（未填写）'}
【产品与服务】${fields.productService || '（未填写）'}
【痛点消除】${fields.painRelievers || '（未填写）'}
【收益创造】${fields.gainCreators || '（未填写）'}
【目标客户任务】${fields.targetCustomer || '（未填写）'}
【客户痛点】${fields.customerPains || '（未填写）'}
【客户期望收益】${fields.customerGains || '（未填写）'}`,
    outputTemplate: `# 价值主张画布

> **一句话宣言**: "{{slogan}}"

---

## 客户画像（Customer Profile）

### 客户任务（Customer Jobs）
{{targetCustomer}}

### 客户痛点（Pains）
{{customerPains}}

### 客户期望收益（Gains）
{{customerGains}}

---

## 价值图（Value Map）

### 产品与服务
{{productService}}

### 痛点消除（Pain Relievers）
{{painRelievers}}

### 收益创造（Gain Creators）
{{gainCreators}}

---

## 契合度检查
| 客户痛点 | 我们的痛点消除 | 契合度 |
|---------|---------------|--------|
| | | |

| 客户期望收益 | 我们的收益创造 | 契合度 |
|-------------|---------------|--------|`
  },

  canvas: {
    label: '商业画布',
    systemPrompt: `你是一位商业战略顾问。基于用户提供的商业画布信息，生成一份可直接用于商业模式分析的《商业模式画布文档》。
严格遵循 Business Model Canvas 框架（9 模块），每个模块之间必须体现逻辑关联。`,
    buildPrompt: (fields) => `请基于以下信息生成《商业模式画布文档》：

【客户细分】${fields.customerSegments || '（未填写）'}
【价值主张】${fields.valuePropositions || '（未填写）'}
【渠道通路】${fields.channels || '（未填写）'}
【客户关系】${fields.customerRelationships || '（未填写）'}
【收入来源】${fields.revenueStreams || '（未填写）'}
【核心资源】${fields.keyResources || '（未填写）'}
【关键业务】${fields.keyActivities || '（未填写）'}
【重要伙伴】${fields.keyPartnerships || '（未填写）'}
【成本结构】${fields.costStructure || '（未填写）'}`,
    outputTemplate: `# 商业模式画布

---

## 模块详解

### 1. 客户细分（Customer Segments）
{{customerSegments}}

### 2. 价值主张（Value Propositions）
{{valuePropositions}}

### 3. 渠道通路（Channels）
{{channels}}

### 4. 客户关系（Customer Relationships）
{{customerRelationships}}

### 5. 收入来源（Revenue Streams）
{{revenueStreams}}

### 6. 核心资源（Key Resources）
{{keyResources}}

### 7. 关键业务（Key Activities）
{{keyActivities}}

### 8. 重要伙伴（Key Partnerships）
{{keyPartnerships}}

### 9. 成本结构（Cost Structure）
{{costStructure}}

---

## 逻辑一致性检查
- [ ] 价值主张是否匹配客户痛点？
- [ ] 渠道是否触达目标客户？
- [ ] 收入是否覆盖核心成本？
- [ ] 关键活动是否有资源支撑？`
  },

  competitive_analysis: {
    label: '竞品分析',
    systemPrompt: `你是一位战略咨询顾问。基于用户提供的竞品分析信息，生成一份可直接用于战略决策的《竞品分析报告》。
严格遵循 IBM $APPEALS 框架的 8 个分析维度。`,
    buildPrompt: (fields) => `请基于以下信息生成《竞品分析报告》：

【竞品名称】${fields.competitorName || '（未填写）'}
【价格】${fields.price || '（未填写）'}
【可获得性】${fields.availability || '（未填写）'}
【包装】${fields.packaging || '（未填写）'}
【性能】${fields.performance || '（未填写）'}
【易用性】${fields.easeOfUse || '（未填写）'}
【保证】${fields.assurance || '（未填写）'}
【生命周期成本】${fields.lifeCycle || '（未填写）'}
【社会接受度】${fields.social || '（未填写）'}
【差异化切入点】${fields.ourAdvantage || '（未填写）'}`,
    outputTemplate: `# 竞品分析报告: {{competitorName}}

> **分析框架**: IBM $APPEALS

---

## 竞品基本信息
**竞品名称**: {{competitorName}}

---

## $APPEALS 八维分析

### $ — 价格
{{price}}

### A — 可获得性
{{availability}}

### P — 包装
{{packaging}}

### P — 性能
{{performance}}

### E — 易用性
{{easeOfUse}}

### A — 保证
{{assurance}}

### L — 生命周期成本
{{lifeCycle}}

### S — 社会接受度
{{social}}

---

## 差异化切入点分析
{{ourAdvantage}}`
  },

  market_sizing: {
    label: '市场规模',
    systemPrompt: `你是一位风险投资分析师。基于用户提供的市场规模信息，生成一份投资人级别的《市场规模分析报告》。
必须同时展示 Top-Down 和 Bottom-Up 两种计算路径。`,
    buildPrompt: (fields) => `请基于以下信息生成《市场规模分析报告》：

【TAM】${fields.tam || '（未填写）'}
【SAM】${fields.sam || '（未填写）'}
【SOM】${fields.som || '（未填写）'}
【Bottom-up 计算】${fields.bottomUpCalc || '（未填写）'}
【市场驱动因子】${fields.drivers || '（未填写）'}`,
    outputTemplate: `# 市场规模分析

> **分析框架**: TAM / SAM / SOM

---

## 三层市场漏斗
- **TAM**: {{tam}}
- **SAM**: {{sam}}
- **SOM**: {{som}}

---

## Bottom-Up 计算路径
{{bottomUpCalc}}

---

## 市场驱动因子
{{drivers}}`
  },

  prd: {
    label: 'PRD 规格',
    systemPrompt: `你是一位硅谷产品总监。基于用户提供的 PRD 字段信息，生成一份可直接进入开发排期的《产品需求文档》。
功能需求必须标注优先级 P0/P1/P2，验收标准采用 Given-When-Then 格式。`,
    buildPrompt: (fields) => `请基于以下信息生成《PRD》：

【背景与目标】${fields.background || '（未填写）'}
【功能需求列表】${fields.featureList || '（未填写）'}
【验收标准】${fields.acceptanceCriteria || '（未填写）'}
【非功能需求】${fields.nonFunctional || '（未填写）'}
【技术风险】${fields.techRisks || '（未填写）'}
【开放问题】${fields.openQuestions || '（未填写）'}
【数据埋点需求】${fields.analytics || '（未填写）'}`,
    outputTemplate: `# 产品需求文档 (PRD)

---

## 1. 背景与目标
{{background}}

## 2. 功能需求
{{featureList}}

## 3. 验收标准
{{acceptanceCriteria}}

## 4. 非功能需求
{{nonFunctional}}

## 5. 技术风险
{{techRisks}}

## 6. 数据埋点需求
{{analytics}}`
  },

  gtm: {
    label: 'GTM 计划',
    systemPrompt: `你是一位上市策略总监。基于用户提供的 GTM 信息，生成一份可直接执行的《Go-to-Market 上市计划》。`,
    buildPrompt: (fields) => `请基于以下信息生成《GTM 上市计划》：

【目标市场】${fields.targetMarket || '（未填写）'}
【价值主张】${fields.valueProposition || '（未填写）'}
【渠道通路】${fields.channels || '（未填写）'}
【定价策略】${fields.pricing || '（未填写）'}
【AARRR 漏斗】${fields.funnel || '（未填写）'}
【启动计划】${fields.launchPlan || '（未填写）'}
【成功指标】${fields.successMetrics || '（未填写）'}`,
    outputTemplate: `# Go-to-Market 上市计划

---

## 1. 目标市场
{{targetMarket}}

## 2. 价值主张
{{valueProposition}}

## 3. 渠道通路
{{channels}}

## 4. 定价策略
{{pricing}}

## 5. AARRR 增长漏斗
{{funnel}}

## 6. 启动计划
{{launchPlan}}

## 7. 成功指标
{{successMetrics}}`
  },

  growth_loop: {
    label: '增长飞轮',
    systemPrompt: `你是一位增长策略师。基于用户提供的增长飞轮信息，生成一份可用于团队对齐的《增长飞轮战略文档》。`,
    buildPrompt: (fields) => `请基于以下信息生成《增长飞轮战略文档》：

【飞轮名称】${fields.wheelName || '（未填写）'}
【飞轮节点】${fields.elements || '（未填写）'}
【增强回路】${fields.causalChain || '（未填写）'}
【摩擦点】${fields.frictionPoints || '（未填写）'}`,
    outputTemplate: `# 增长飞轮战略: {{wheelName}}

---

## 飞轮节点
{{elements}}

## 增强回路
{{causalChain}}

## 摩擦点与润滑措施
{{frictionPoints}}`
  },

  north_star: {
    label: '北极星指标',
    systemPrompt: `你是一位增长产品负责人。基于用户提供的北极星指标信息，生成一份可用于团队对齐的《北极星指标定义文档》。
指标必须是领先指标（leading），不能是滞后指标。`,
    buildPrompt: (fields) => `请基于以下信息生成《北极星指标定义文档》：

【指标名称】${fields.metricName || '（未填写）'}
【指标类型】${fields.indicatorType || '（未填写）'}
【计算公式】${fields.definition || '（未填写）'}
【衡量标准】${fields.standard || '（未填写）'}
【输入指标】${fields.inputMetrics || '（未填写）'}`,
    outputTemplate: `# 北极星指标定义: {{metricName}}

> **指标类型**: {{indicatorType}}

---

## 1. 指标定义
**计算公式**: {{definition}}
**衡量标准**: {{standard}}

## 2. 输入指标
{{inputMetrics}}`
  },

  unit_economics: {
    label: '单位经济学',
    systemPrompt: `你是一位 VC 财务分析师。基于用户提供的单位经济学信息，生成一份投资人级别的《单位经济学分析报告》。
必须包含行业标准基准对比（LTV:CAC ≥ 3:1）。`,
    buildPrompt: (fields) => `请基于以下信息生成《单位经济学分析报告》：

【LTV】${fields.ltv || '（未填写）'}
【CAC】${fields.cac || '（未填写）'}
【LTV:CAC 比值】${fields.ltvCacRatio || '（未填写）'}
【回收期】${fields.paybackPeriod || '（未填写）'}
【成本结构】${fields.costStructure || '（未填写）'}`,
    outputTemplate: `# 单位经济学分析

---

## 核心指标
| 指标 | 数值 | 健康基准 |
|------|------|---------|
| LTV | {{ltv}} | >$500 |
| CAC | {{cac}} | 越低越好 |
| LTV:CAC | {{ltvCacRatio}} | ≥ 3:1 |
| 回收期 | {{paybackPeriod}} | < 12 个月 |

## 成本结构
{{costStructure}}`
  },

  decision_log: {
    label: '决策日志',
    systemPrompt: `你是一位决策档案管理员。基于用户提供的决策信息，生成一份符合 ADR 标准的《决策日志条目》。`,
    buildPrompt: (fields) => `请基于以下信息生成《决策日志》：

【决策标题】${fields.title || '（未填写）'}
【问题背景】${fields.context || '（未填写）'}
【备选方案】${fields.optionsConsidered || '（未填写）'}
【决策内容】${fields.decision || '（未填写）'}
【决策后果】${fields.consequences || '（未填写）'}`,
    outputTemplate: `# {{title}}

> **状态**: {{status}}

---

## 背景
{{context}}

## 备选方案分析
{{optionsConsidered}}

## 决策
{{decision}}

## 后果
{{consequences}}`
  },

  decision_review: {
    label: '决策回顾',
    systemPrompt: `你是一位项目复盘 facilitator。基于用户提供的决策回顾信息，生成一份促进团队学习的《决策回顾报告》。`,
    buildPrompt: (fields) => `请基于以下信息生成《决策回顾报告》：

【回顾周期】${fields.reviewPeriod || '（未填写）'}
【决策清单】${fields.decisionsReviewed || '（未填写）'}
【实际结果】${fields.outcomeVsExpectation || '（未填写）'}
【经验教训】${fields.lessonsLearned || '（未填写）'}`,
    outputTemplate: `# 决策回顾: {{reviewPeriod}}

---

## 回顾范围
{{decisionsReviewed}}

## 结果评估
{{outcomeVsExpectation}}

## 经验教训
{{lessonsLearned}}`
  },

  premortem: {
    label: '死亡预测',
    systemPrompt: `你是一位风险管理专家。基于用户提供的 Pre-Mortem 信息，生成一份可直接用于风险预防的《项目死亡预测报告》。
每个死因必须有具体的触发场景。`,
    buildPrompt: (fields) => `请基于以下信息生成《死亡预测报告》：

【失败假设】${fields.failureScenario || '（未填写）'}
【死因 1】${fields.cause1 || '（未填写）'}
【死因 2】${fields.cause2 || '（未填写）'}
【死因 3】${fields.cause3 || '（未填写）'}
【预防措施】${fields.prevention || '（未填写）'}
【预警信号】${fields.earlyWarnings || '（未填写）'}`,
    outputTemplate: `# 项目死亡预测 (Pre-Mortem)

---

## 失败假设
{{failureScenario}}

## 死因分析
### 死因 1: 最致命
{{cause1}}

### 死因 2: 次致命
{{cause2}}

### 死因 3: 潜在风险
{{cause3}}

## 预防措施
{{prevention}}

## 早期预警信号
{{earlyWarnings}}`
  },

  moat: {
    label: '壁垒建设',
    systemPrompt: `你是一位竞争战略分析师。基于用户提供的护城河信息，生成一份投资人级别的《竞争壁垒评估报告》。`,
    buildPrompt: (fields) => `请基于以下信息生成《竞争壁垒评估报告》：

【壁垒类型】${fields.moatType || '（未填写）'}
【现状评估】${fields.currentStatus || '（未填写）'}
【建设计划】${fields.buildPlan || '（未填写）'}`,
    outputTemplate: `# 竞争壁垒评估

> **当前壁垒**: {{currentStatus}}

---

## 壁垒类型分析
{{moatType}}

## 现状评估
{{currentStatus}}

## 建设计划
{{buildPlan}}`
  },

  dependency_risk: {
    label: '外部依赖',
    systemPrompt: `你是一位企业风险管理专家。基于用户提供的外部依赖信息，生成一份《外部依赖风险评估报告》。`,
    buildPrompt: (fields) => `请基于以下信息生成《外部依赖风险评估报告》：

【关键第三方】${fields.dependency || '（未填写）'}
【风险等级】${fields.riskLevel || '（未填写）'}
【影响评估】${fields.impactAssessment || '（未填写）'}
【监控触发器】${fields.monitoringTrigger || '（未填写）'}
【备选方案】${fields.planB || '（未填写）'}`,
    outputTemplate: `# 外部依赖风险评估: {{dependency}}

> **风险等级**: {{riskLevel}}

---

## 影响评估
{{impactAssessment}}

## 监控触发器
{{monitoringTrigger}}

## 备选方案 (Plan B)
{{planB}}`
  },

  mvp_scope: {
    label: 'MVP 范围',
    systemPrompt: `你是一位精益创业教练。基于用户提供的 MVP 信息，生成一份《MVP 范围定义文档》。
核心假设必须是可证伪的。`,
    buildPrompt: (fields) => `请基于以下信息生成《MVP 范围定义文档》：

【核心假设】${fields.coreHypothesis || '（未填写）'}
【V1.0 范围】${fields.scope || '（未填写）'}
【砍掉的功能】${fields.cutFeatures || '（未填写）'}
【砍掉原因】${fields.cutReason || '（未填写）'}`,
    outputTemplate: `# MVP 范围定义

---

## 核心假设
{{coreHypothesis}}

## V1.0 精确范围
{{scope}}

## 砍掉的功能
{{cutFeatures}}

## 砍掉原因
{{cutReason}}`
  },

  milestones: {
    label: '里程碑',
    systemPrompt: `你是一位敏捷项目管理专家。基于用户提供的里程碑信息，生成一份《里程碑计划》。`,
    buildPrompt: (fields) => `请基于以下信息生成《里程碑计划》：

【里程碑清单】${fields.milestoneList || '（未填写）'}
【冲刺周期】${fields.sprintDuration || '（未填写）'}
【迭代改进】${fields.retrospectiveActions || '（未填写）'}`,
    outputTemplate: `# 里程碑计划

---

## 里程碑总览
{{milestoneList}}

## 冲刺配置
**冲刺周期**: {{sprintDuration}}

## 迭代改进
{{retrospectiveActions}}`
  },

  hypothesis_tracker: {
    label: '假设验证',
    systemPrompt: `你是一位精益实验设计师。基于用户提供的假设验证信息，生成一份《假设验证实验报告》。
假设必须是可证伪的，实验必须在限定时间内完成。`,
    buildPrompt: (fields) => `请基于以下信息生成《假设验证实验报告》：

【核心假设】${fields.hypothesis || '（未填写）'}
【验证实验】${fields.experiment || '（未填写）'}
【衡量信号】${fields.metricSignal || '（未填写）'}
【成功标准】${fields.successCriteria || '（未填写）'}
【实验时限】${fields.timebox || '（未填写）'}`,
    outputTemplate: `# 假设验证实验报告

---

## 假设陈述
{{hypothesis}}

## 实验设计
{{experiment}}

## 衡量信号
{{metricSignal}}

## 成功标准
{{successCriteria}}

## 时间盒
{{timebox}}`
  },

  analytics_plan: {
    label: '数据方案',
    systemPrompt: `你是一位数据产品经理。基于用户提供的数据方案信息，生成一份《数据分析与埋点方案》。`,
    buildPrompt: (fields) => `请基于以下信息生成《数据分析与埋点方案》：

【核心指标】${fields.metrics || '（未填写）'}
【埋点事件】${fields.events || '（未填写）'}
【反馈机制】${fields.feedback || '（未填写）'}`,
    outputTemplate: `# 数据分析与埋点方案

---

## 核心指标
{{metrics}}

## 埋点事件
{{events}}

## 用户反馈机制
{{feedback}}`
  },

  resource_plan: {
    label: '资源预算',
    systemPrompt: `你是一位项目管理专家。基于用户提供的资源信息，生成一份《资源预算计划》。
风险储备必须是总预算的 10-15%。`,
    buildPrompt: (fields) => `请基于以下信息生成《资源预算计划》：

【人力投入】${fields.humanResource || '（未填写）'}
【成本预算】${fields.cost || '（未填写）'}
【风险储备】${fields.riskReserve || '（未填写）'}
【时间线】${fields.timeline || '（未填写）'}`,
    outputTemplate: `# 资源预算计划

---

## 人力投入
{{humanResource}}

## 成本预算
{{cost}}

## 风险储备
{{riskReserve}}

## 时间线
{{timeline}}`
  },

  action_items: {
    label: '待办行动',
    systemPrompt: `你是一位执行教练。基于用户提供的待办信息，生成一份可直接用于每日站会的《行动清单》。
每个行动必须有 Owner 和 Deadline。`,
    buildPrompt: (fields) => `请基于以下信息生成《行动清单》：

【待办清单】${fields.tasks || '（未填写）'}
【负责人】${fields.owner || '（未填写）'}
【截止日期】${fields.dueDate || '（未填写）'}`,
    outputTemplate: `# 行动清单

---

## 行动项
{{tasks}}

## 负责人与截止
- **负责人**: {{owner}}
- **截止日期**: {{dueDate}}

---

> **每日站会三问**:
> 1. 昨天完成了什么？
> 2. 今天计划做什么？
> 3. 有什么阻塞？`
  },

  manifesto: {
    label: '核心定位',
    systemPrompt: `你是一位品牌定位专家。基于用户提供的核心定位信息，生成一份完整的《产品宣言与核心定位文档》。
宣言必须简洁有力，差异化必须清晰。`,
    buildPrompt: (fields) => `请基于以下信息生成《核心定位文档》：

【一句话宣言】${fields.slogan || '（未填写）'}
【产品描述】${fields.description || '（未填写）'}
【目标用户】${fields.targetUser || '（未填写）'}
【差异化】${fields.differentiation || '（未填写）'}
【产品气质】${fields.vibe || '（未填写）'}
【反对什么】${fields.antiWhat || '（未填写）'}`,
    questionsPrompt: (fields) => {
      const questions = [];
      
      if (fields.targetUser) {
        if (fields.targetUser.match(/重度|频繁|多/)) {
          questions.push('你说目标用户是"重度用户"——每天解锁100次以上算重度，还是每天使用4小时以上算重度？这两个人群的需求差异很大。');
        }
        if (!fields.targetUser.match(/学生|上班族|自由职业|职场/)) {
          questions.push('你的目标用户具体是学生、上班族、还是自由职业者？不同人群使用场景差异大。');
        }
      }
      
      if (fields.differentiation) {
        if (!fields.differentiation.match(/竞品|对比|不同/)) {
          questions.push('你的差异化是"' + (fields.differentiation.length > 20 ? fields.differentiation.slice(0, 20) + '...' : fields.differentiation) + '"——这个差异化是比什么产品？好在什么地方？');
        }
      }
      
      if (fields.vibe) {
        if (fields.vibe.match(/简约|简单|极简/)) {
          questions.push('你说产品气质是"简约"——你指的是界面只有单色系，还是可以有少量强调色？');
        }
        if (fields.vibe.match(/建筑|空间/)) {
          questions.push('你说"建筑感"——你指的是类似纪念碑谷的几何美学，还是类似真实建筑的物理空间隐喻（如房间/楼层）？');
        }
      }
      
      if (fields.antiWhat) {
        if (fields.antiWhat.match(/游戏|化|gamification|积分|排行榜/)) {
          questions.push('你反对"gamification"——你是反对积分/排行榜这种外在激励，还是连Forest种树那种视觉反馈也反对？');
        }
      }
      
      if (fields.slogan && fields.slogan.length < 10) {
        questions.push('你的一句话宣言"' + fields.slogan + '"比较简短——这个宣言是给用户看的，还是给投资人看的？角度不同写法不同。');
      }
      
      return questions;
    },
    outputTemplate: `# 产品核心定位

---

## 🎯 一句话宣言
{{slogan}}

## 📝 产品描述
{{description}}

## 👥 目标用户
{{targetUser}}

## 💎 差异化
{{differentiation}}

## ✨ 产品气质
{{vibe}}

## 🚫 明确反对
{{antiWhat}}`
  }
};

// ============================================================
// 工具函数
// ============================================================

function generateDocumentConfig(docType, fields = {}, mode = 'generate') {
  const generator = GENERATORS[docType];
  if (!generator) {
    return { systemPrompt: '', userPrompt: '', label: docType };
  }
  
  if (mode === 'questions' && generator.questionsPrompt) {
    const questions = generator.questionsPrompt(fields);
    return {
      label: generator.label,
      questions: questions
    };
  }
  
  return {
    label: generator.label,
    systemPrompt: generator.systemPrompt,
    userPrompt: generator.buildPrompt(fields),
    outputTemplate: generator.outputTemplate
  };
}

function getModuleByTemplateType(type) {
  const map = {
    constraint: '01 项目宪法',
    graveyard: '01 项目宪法',
    persona: '02 市场与用户洞察',
    journey_map: '02 市场与用户洞察',
    value_proposition: '02 市场与用户洞察',
    canvas: '02 市场与用户洞察',
    competitive_analysis: '02 市场与用户洞察',
    market_sizing: '02 市场与用户洞察',
    prd: '03 策略与增长',
    gtm: '03 策略与增长',
    growth_loop: '03 策略与增长',
    north_star: '03 策略与增长',
    unit_economics: '03 策略与增长',
    decision_log: '04 决策链图谱',
    decision_review: '04 决策链图谱',
    premortem: '05 反脆弱审计',
    moat: '05 反脆弱审计',
    dependency_risk: '05 反脆弱审计',
    mvp_scope: '06 执行路线图',
    milestones: '06 执行路线图',
    hypothesis_tracker: '06 执行路线图',
    analytics_plan: '06 执行路线图',
    resource_plan: '06 执行路线图',
    action_items: '06 执行路线图'
  };
  return map[type] || null;
}

function getTemplatesByModule(moduleId) {
  const all = Object.entries(GENERATORS).map(([key, gen]) => ({ key, label: gen.label, module: getModuleByTemplateType(key) }));
  return all.filter(t => t.module === moduleId).map(t => t.key);
}

// CommonJS 兼容
export { GENERATORS, generateDocumentConfig, getModuleByTemplateType, getTemplatesByModule };
export default GENERATORS;