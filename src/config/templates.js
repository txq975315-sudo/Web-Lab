/**
 * Kairos Thinking Lab - 权威模板库
 * 来源：经原始文献验证的业界标准框架
 */

const TEMPLATES = {
  constraint: {
    label: '硬性约束条目',
    icon: '🔒',
    source: 'ADR (Architecture Decision Records) - Michael Nygard / Martin Fowler',
    module: '01 项目宪法',
    fields: [
      { key: 'content', label: '约束内容', type: 'textarea', required: true, placeholder: '如：Android 8.0+ 最低版本、12专注位不可改、零社交功能' },
      { key: 'rationale', label: '约束理由', type: 'textarea', placeholder: '为什么这条不可动摇？涉及的技术/商业/用户原因' },
      { key: 'consequences', label: '约束影响', type: 'textarea', placeholder: '遵守此约束会限制哪些选择？带来哪些副作用？' },
      { key: 'status', label: '约束状态', type: 'select', options: ['proposed', 'active', 'deprecated'], required: true },
      { key: 'proposedAt', label: '提出时间', type: 'date' }
    ]
  },
  graveyard: {
    label: '否决墓地',
    icon: '⚰️',
    source: '自研（基于 ADR Superseded 状态延伸）',
    module: '01 项目宪法',
    fields: [
      { key: 'idea', label: '被否决的想法', type: 'text', required: true, placeholder: '一句话描述这个想法' },
      { key: 'reason', label: '否决原因', type: 'textarea', required: true, placeholder: '为什么这个想法被否决？' },
      { key: 'vetoedAt', label: '否决时间', type: 'date' },
      { key: 'revivalCondition', label: '复活条件（可选）', type: 'textarea', placeholder: '什么情况下可以重新考虑这个想法？' }
    ]
  },
  persona: {
    label: '用户画像',
    icon: '👤',
    source: 'Alan Cooper - The Inmates Are Running the Asylum (1998)',
    module: '02 市场与用户洞察',
    fields: [
      { key: 'name', label: 'Persona 名称', type: 'text', required: true, placeholder: '如：焦虑的互联网产品经理李明' },
      { key: 'demographics', label: '人口统计学信息', type: 'textarea', placeholder: '年龄、职业、收入、地域、教育背景' },
      { key: 'behaviors', label: '典型行为', type: 'textarea', placeholder: '典型的一天如何使用相关产品？' },
      { key: 'goals', label: '目标与动机', type: 'textarea', placeholder: '使用产品的核心驱动力是什么？（体验目标/终极目标/生活目标）' },
      { key: 'painPoints', label: '痛点与挫折', type: 'textarea', placeholder: '当前替代方案哪里让他们最痛苦？' },
      { key: 'scenarios', label: '典型场景', type: 'textarea', placeholder: '描述一个具体的使用场景（来源：Cooper et al., About Face, 2002）' }
    ]
  },
  journey_map: {
    label: '用户旅程地图',
    icon: '🗺️',
    source: '用户旅程地图 - 服务设计标准工具 (Nielsen Norman Group)',
    module: '02 市场与用户洞察',
    fields: [
      { key: 'persona', label: '对应用户画像', type: 'text', placeholder: '关联的 Persona 名称' },
      { key: 'stage', label: '旅程阶段', type: 'text', required: true, placeholder: '如：认知 → 考虑 → 注册 → 首次使用 → 留存 → 推荐' },
      { key: 'touchpoints', label: '触点清单', type: 'textarea', placeholder: '用户在该阶段接触到的产品/渠道/人员' },
      { key: 'userActions', label: '用户行为', type: 'textarea', placeholder: '用户在该阶段做什么？' },
      { key: 'painPoints', label: '痛点', type: 'textarea', placeholder: '该阶段的摩擦、困惑、放弃原因' },
      { key: 'emotions', label: '情绪曲线', type: 'textarea', placeholder: '用户在该阶段的情绪状态（沮丧/困惑/满意/兴奋）' },
      { key: 'opportunities', label: '改进机会', type: 'textarea', placeholder: '针对该痛点的潜在产品机会' }
    ]
  },
  value_proposition: {
    label: '价值主张画布',
    icon: '🎯',
    source: 'Alexander Osterwalder - Value Proposition Design (2014)',
    module: '02 市场与用户洞察',
    fields: [
      { key: 'slogan', label: '一句话宣言', type: 'text', required: true, placeholder: '如：为Android重度用户打造的12区建筑感专注空间' },
      { key: 'productService', label: '产品与服务', type: 'textarea', placeholder: '你提供什么？功能、特性、服务' },
      { key: 'painRelievers', label: '痛点消除', type: 'textarea', placeholder: '你消除了客户哪些痛点？' },
      { key: 'gainCreators', label: '收益创造', type: 'textarea', placeholder: '你为客户创造了哪些收益？' },
      { key: 'targetCustomer', label: '目标客户任务', type: 'textarea', placeholder: '客户要完成什么任务？（Customer Jobs）' },
      { key: 'customerPains', label: '客户痛点', type: 'textarea', placeholder: '客户在完成任务时遇到哪些障碍和风险？' },
      { key: 'customerGains', label: '客户期望收益', type: 'textarea', placeholder: '客户期望获得什么结果？' }
    ]
  },
  canvas: {
    label: '商业画布',
    icon: '🧩',
    source: 'Alexander Osterwalder - Business Model Generation (2010)',
    module: '02 市场与用户洞察',
    fields: [
      { key: 'customerSegments', label: '客户细分 (Customer Segments)', type: 'textarea' },
      { key: 'valuePropositions', label: '价值主张 (Value Propositions)', type: 'textarea' },
      { key: 'channels', label: '渠道通路 (Channels)', type: 'textarea' },
      { key: 'customerRelationships', label: '客户关系 (Customer Relationships)', type: 'textarea' },
      { key: 'revenueStreams', label: '收入来源 (Revenue Streams)', type: 'textarea' },
      { key: 'keyResources', label: '核心资源 (Key Resources)', type: 'textarea' },
      { key: 'keyActivities', label: '关键业务 (Key Activities)', type: 'textarea' },
      { key: 'keyPartnerships', label: '重要伙伴 (Key Partnerships)', type: 'textarea' },
      { key: 'costStructure', label: '成本结构 (Cost Structure)', type: 'textarea' }
    ]
  },
  competitive_analysis: {
    label: '竞品分析',
    icon: '⚔️',
    source: 'IBM $APPEALS - Integrated Product Development',
    module: '02 市场与用户洞察',
    fields: [
      { key: 'competitorName', label: '竞品名称', type: 'text', required: true },
      { key: 'price', label: '$ 价格 (Price)', type: 'textarea', placeholder: '定价策略、付费模式、性价比感知' },
      { key: 'availability', label: 'A 可获得性 (Availability)', type: 'textarea', placeholder: '渠道、地域覆盖、购买便利性' },
      { key: 'packaging', label: 'P 包装 (Packaging)', type: 'textarea', placeholder: '视觉设计、品牌感知、UI/UX 第一印象' },
      { key: 'performance', label: 'P 性能 (Performance)', type: 'textarea', placeholder: '功能完备度、速度、稳定性' },
      { key: 'easeOfUse', label: 'E 易用性 (Ease of Use)', type: 'textarea', placeholder: '学习成本、操作路径、认知负荷' },
      { key: 'assurance', label: 'A 保证 (Assurance)', type: 'textarea', placeholder: '安全性、隐私保护、售后支持' },
      { key: 'lifeCycle', label: 'L 生命周期成本 (Life Cycle)', type: 'textarea', placeholder: '长期维护成本、迁移成本、隐性费用' },
      { key: 'social', label: 'S 社会接受度 (Social)', type: 'textarea', placeholder: '口碑、推荐意愿、社群活跃度' },
      { key: 'ourAdvantage', label: '我们的差异化切入点', type: 'textarea', placeholder: '基于以上8个维度，我们最锋利的差异化在哪？' }
    ]
  },
  market_sizing: {
    label: '市场规模',
    icon: '📈',
    source: 'TAM/SAM/SOM - 标准市场分析框架',
    module: '02 市场与用户洞察',
    fields: [
      { key: 'tam', label: 'TAM 总可及市场', type: 'textarea', placeholder: '全球/全国理论上需要此产品的人群规模' },
      { key: 'sam', label: 'SAM 可服务市场', type: 'textarea', placeholder: '你能触达的目标细分市场' },
      { key: 'som', label: 'SOM 可获得市场', type: 'textarea', placeholder: '第一年实际能转化用户数（建议用 bottom-up 法：用户数 x ARPU）' },
      { key: 'bottomUpCalc', label: 'Bottom-up 计算过程', type: 'textarea', placeholder: '目标用户数量 x 每用户平均收入 = ?' },
      { key: 'drivers', label: '市场驱动因子', type: 'textarea', placeholder: '技术趋势、社会变化、政策因素' }
    ]
  },
  prd: {
    label: 'PRD 规格',
    icon: '📋',
    source: '标准产品需求文档 (Amazon PR/FAQ, Google, Atlassian)',
    module: '03 策略与增长',
    fields: [
      { key: 'background', label: '背景与目标', type: 'textarea', required: true, placeholder: '解决什么问题？为谁？为什么现在做？' },
      { key: 'featureList', label: '功能需求列表', type: 'textarea', placeholder: '逐条列出，标注优先级 P0(阻塞发布)/P1(重要)/P2(锦上添花)' },
      { key: 'acceptanceCriteria', label: '验收标准', type: 'textarea', placeholder: '如何定义这个功能做完了？（Given-When-Then 格式）' },
      { key: 'nonFunctional', label: '非功能需求', type: 'textarea', placeholder: '性能、安全、兼容性、可访问性' },
      { key: 'techRisks', label: '技术风险与边界', type: 'textarea', placeholder: 'Android 版本兼容、Widget 限制等' },
      { key: 'openQuestions', label: '开放问题与决策', type: 'textarea', placeholder: '尚未确定的事项、负责人、潜在影响' },
      { key: 'analytics', label: '数据埋点需求', type: 'textarea', placeholder: '需要追踪哪些用户行为事件？' }
    ]
  },
  gtm: {
    label: 'GTM 计划',
    icon: '🚀',
    source: 'Go-to-Market 标准框架 (Bain Analyze-Design-Deliver)',
    module: '03 策略与增长',
    fields: [
      { key: 'targetMarket', label: '目标市场定义', type: 'textarea', placeholder: '细分市场、首批种子用户画像' },
      { key: 'valueProposition', label: '价值主张与核心信息', type: 'textarea', placeholder: '一句话推广语、核心卖点' },
      { key: 'channels', label: '渠道通路', type: 'textarea', placeholder: '应用商店、社交媒体、KOL、社群' },
      { key: 'pricing', label: '定价与包装策略', type: 'textarea', placeholder: '定价模型、付费层级、试用期设计' },
      { key: 'funnel', label: 'AARRR 漏斗', type: 'textarea', placeholder: '获客(Acquisition)→激活(Activation)→留存(Retention)→变现(Revenue)→推荐(Referral)' },
      { key: 'launchPlan', label: '启动计划', type: 'textarea', placeholder: '关键节点、时间线、资源投入' },
      { key: 'successMetrics', label: '成功指标', type: 'textarea', placeholder: '初期跟踪的关键指标及目标值' }
    ]
  },
  growth_loop: {
    label: '增长飞轮',
    icon: '🔄',
    source: 'Jim Collins - Good to Great (2001) / Amplitude Flywheel Playbook (2020)',
    module: '03 策略与增长',
    fields: [
      { key: 'wheelName', label: '飞轮名称', type: 'text', placeholder: '如：专注-完成-满足-分享飞轮' },
      { key: 'elements', label: '飞轮节点（逐条）', type: 'textarea', placeholder: '飞轮的每个节点是什么？' },
      { key: 'causalChain', label: '增强回路', type: 'textarea', placeholder: '每个旋转周期对前期工作的复利式积累：A增强B→B增强C→C反过来加速A' },
      { key: 'frictionPoints', label: '摩擦点', type: 'textarea', placeholder: '飞轮在哪个环节可能卡住？如何润滑？' }
    ]
  },
  north_star: {
    label: '北极星指标',
    icon: '⭐',
    source: 'Sean Ellis (OMTM) / Amplitude North Star Playbook (2017)',
    module: '03 策略与增长',
    fields: [
      { key: 'metricName', label: '指标名称', type: 'text', required: true, placeholder: '如：日均高质量专注次数' },
      { key: 'indicatorType', label: '指标类型', type: 'select', options: ['leading (领先指标)', 'lagging (滞后指标)'], placeholder: '必须选择领先指标——收入和利润都是滞后指标，不能作为北极星' },
      { key: 'definition', label: '指标定义与计算公式', type: 'textarea', placeholder: '如何精确定义和计算？' },
      { key: 'standard', label: '衡量标准', type: 'textarea', placeholder: '提升到什么数值算成功？' },
      { key: 'inputMetrics', label: '输入指标（子指标分解）', type: 'textarea', placeholder: '支撑北极星的驱动因素（如：日活、单次专注时长、完成率）' }
    ]
  },
  unit_economics: {
    label: '单位经济学',
    icon: '💰',
    source: 'LTV/CAC - SaaS Metrics (Bessemer Venture Partners)',
    module: '03 策略与增长',
    fields: [
      { key: 'ltv', label: 'LTV 用户生命周期价值', type: 'textarea', placeholder: '公式：ARPA × 毛利率 × (1/流失率)' },
      { key: 'cac', label: 'CAC 获客成本（全加载）', type: 'textarea', placeholder: '包含薪资、佣金、工具、活动的完全加载成本，不只是广告费' },
      { key: 'ltvCacRatio', label: 'LTV:CAC 比值', type: 'text', placeholder: '健康基准 ≥ 3:1（顶级 4-6:1，中位数 ~3.5:1）' },
      { key: 'paybackPeriod', label: 'CAC 回收期（月）', type: 'text', placeholder: '健康基准 < 12个月（顶级 < 8-10个月）' },
      { key: 'costStructure', label: '成本结构', type: 'textarea', placeholder: 'API Token、服务器、人力、设计的月度/年度成本' }
    ]
  },
  decision_log: {
    label: '决策日志',
    icon: '⚖️',
    source: 'ADR (Architecture Decision Records) - Michael Nygard / Martin Fowler',
    module: '04 决策链图谱',
    fields: [
      { key: 'title', label: '决策标题', type: 'text', required: true, placeholder: '编号 + 清晰的动作描述，如：[001] 选择 Flutter 作为跨端方案' },
      { key: 'context', label: '问题背景与约束', type: 'textarea', placeholder: '我们面临什么问题？有哪些约束条件？' },
      { key: 'optionsConsidered', label: '备选方案分析', type: 'textarea', placeholder: '考虑过哪些方案？各自的优劣？为什么放弃？' },
      { key: 'decision', label: '决策内容', type: 'textarea', required: true, placeholder: '最终决定做什么？' },
      { key: 'consequences', label: '决策后果', type: 'textarea', placeholder: '正面影响和负面影响分别是什么？' },
      { key: 'status', label: '决策状态', type: 'select', options: ['proposed', 'accepted', 'deprecated', 'superseded'], required: true },
      { key: 'confidence', label: '决策置信度', type: 'select', options: ['high', 'medium', 'low'] },
      { key: 'linkedAIChat', label: '关联 AI 对话', type: 'text', placeholder: '哪次对话推动了这项决策？' }
    ]
  },
  decision_review: {
    label: '决策回顾',
    icon: '🔄',
    source: '自研（基于 ADR Superseded 状态的周期性复盘）',
    module: '04 决策链图谱',
    fields: [
      { key: 'reviewPeriod', label: '回顾周期', type: 'text', placeholder: '如：2026 Q1 决策回顾' },
      { key: 'decisionsReviewed', label: '本次回顾的决策清单', type: 'textarea', placeholder: '列出本次回顾涉及的所有决策编号' },
      { key: 'outcomeVsExpectation', label: '实际结果 vs 预期', type: 'textarea', placeholder: '决策的实际效果如何？与预期一致吗？' },
      { key: 'lessonsLearned', label: '经验教训', type: 'textarea', placeholder: '如果重来，会做不同的选择吗？' },
      { key: 'actions', label: '后续行动', type: 'textarea', placeholder: '需要修正哪些决策？需要新增哪些决策？' }
    ]
  },
  premortem: {
    label: '死亡预测',
    icon: '💀',
    source: 'Gary Klein - Performing a Project Premortem, HBR (2007)',
    module: '05 反脆弱审计',
    fields: [
      { key: 'failureScenario', label: '假设项目已完全失败', type: 'textarea', required: true, placeholder: 'Imagine this project has completely failed one year from now. What is the most likely reason?' },
      { key: 'cause1', label: '死因 1（最致命）', type: 'textarea', placeholder: '最致命的失败原因及详细场景' },
      { key: 'cause2', label: '死因 2（次致命）', type: 'textarea', placeholder: '第二个可能的失败原因' },
      { key: 'cause3', label: '死因 3（潜在风险）', type: 'textarea', placeholder: '第三个可能的失败原因' },
      { key: 'prevention', label: '预防与缓解措施', type: 'textarea', placeholder: '针对以上死因，现在能做什么？' },
      { key: 'earlyWarnings', label: '早期预警信号', type: 'textarea', placeholder: '哪些信号出现时，说明我们正在走向失败？' }
    ]
  },
  moat: {
    label: '壁垒建设',
    icon: '🏰',
    source: 'Warren Buffett / Morningstar Economic Moat Rating System',
    module: '05 反脆弱审计',
    fields: [
      { key: 'moatType', label: '壁垒类型', type: 'select', options: [
        'network_effect (网络效应)',
        'intangible_assets (无形资产/品牌/专利)',
        'cost_advantage (成本优势)',
        'switching_costs (转换成本)',
        'efficient_scale (有效规模/利基市场壁垒)'
      ]},
      { key: 'currentStatus', label: '现状评估', type: 'select', options: ['wide (宽护城河)', 'narrow (窄护城河)', 'none (无护城河)'], placeholder: '当前护城河有多宽？预计能持续多久？' },
      { key: 'buildPlan', label: '建设计划', type: 'textarea', placeholder: '如何加宽护城河？具体动作和时间线' }
    ]
  },
  dependency_risk: {
    label: '外部依赖',
    icon: '🔗',
    source: '企业风险管理 (ERM) / ISO 31000',
    module: '05 反脆弱审计',
    fields: [
      { key: 'dependency', label: '关键第三方', type: 'text', required: true, placeholder: '如：Google Widget API、DeepSeek API' },
      { key: 'riskLevel', label: '风险等级', type: 'select', options: ['high', 'medium', 'low'] },
      { key: 'impactAssessment', label: '影响评估', type: 'textarea', placeholder: '如果该第三方停止服务，核心业务中断多久？数据丢失风险？' },
      { key: 'monitoringTrigger', label: '监控触发器', type: 'textarea', placeholder: '哪些信号出现时应启动 Plan B？（如：API响应超时、可用性<99.9%、涨价>20%）' },
      { key: 'planB', label: '备选方案 (Plan B)', type: 'textarea', placeholder: '如果该第三方停止服务或涨价，怎么办？切换成本和时间？' }
    ]
  },
  mvp_scope: {
    label: 'MVP 范围',
    icon: '✂️',
    source: 'Eric Ries - The Lean Startup (2011)',
    module: '06 执行路线图',
    fields: [
      { key: 'coreHypothesis', label: '核心假设（信仰飞跃）', type: 'textarea', required: true, placeholder: '这个 MVP 要验证的最重要的假设是什么？如：用户愿为建筑感支付溢价' },
      { key: 'scope', label: 'V1.0 精确范围', type: 'textarea', required: true, placeholder: '第一版必须包含什么？（MVP 不是最小产品，是最大验证学习的容器）' },
      { key: 'cutFeatures', label: '明确砍掉的功能', type: 'textarea', placeholder: '为了速度，第一版主动放弃什么？' },
      { key: 'cutReason', label: '砍掉原因', type: 'textarea', placeholder: '为什么这些功能现在不做？（不在核心假设验证路径上）' }
    ]
  },
  milestones: {
    label: '里程碑',
    icon: '🚩',
    source: '敏捷开发里程碑 (Scrum Sprint Goals)',
    module: '06 执行路线图',
    fields: [
      { key: 'milestoneList', label: '关键里程碑', type: 'textarea', placeholder: '日期 | 目标 | 交付物 | 验证假设 | 完成定义 (Definition of Done)' },
      { key: 'sprintDuration', label: '冲刺周期', type: 'text', placeholder: '如：2周/4周' },
      { key: 'retrospectiveActions', label: '迭代改进项', type: 'textarea', placeholder: '每个里程碑结束后的流程改进（Kaizen）' }
    ]
  },
  hypothesis_tracker: {
    label: '假设验证',
    icon: '🧪',
    source: '精益创业假设驱动开发 / Strategyzer Test Card',
    module: '06 执行路线图',
    fields: [
      { key: 'hypothesis', label: '核心假设', type: 'textarea', required: true, placeholder: '我们相信 [假设内容]' },
      { key: 'experiment', label: '验证实验', type: 'textarea', placeholder: '为了验证，我们将 [实验方法]' },
      { key: 'metricSignal', label: '衡量信号', type: 'textarea', placeholder: '并且测量 [指标] — 可证伪的量化信号' },
      { key: 'successCriteria', label: '成功标准', type: 'textarea', placeholder: '我们是对的，如果 [达到什么数值算验证通过？]' },
      { key: 'timebox', label: '实验时限', type: 'text', placeholder: '如：7天/14天（所有假设都应在限定时间内验证）' }
    ]
  },
  analytics_plan: {
    label: '数据方案',
    icon: '📊',
    source: 'Mixpanel/Amplitude/Segment 标准埋点规范',
    module: '06 执行路线图',
    fields: [
      { key: 'metrics', label: '核心指标清单', type: 'textarea', placeholder: '事件命名规范：object_action，过去时态，snake_case（如：video_watched）' },
      { key: 'events', label: '埋点事件清单', type: 'textarea', placeholder: '事件名 | 触发时机 | 属性 | 示例值 | 实现状态 | 业务目标' },
      { key: 'feedback', label: '用户反馈机制', type: 'textarea', placeholder: '主动反馈（问卷/访谈）+ 被动信号（行为数据推断）的收集方式' }
    ]
  },
  resource_plan: {
    label: '资源预算',
    icon: '👥',
    source: 'PMI PMBOK 项目管理标准',
    module: '06 执行路线图',
    fields: [
      { key: 'humanResource', label: '人力投入', type: 'textarea' },
      { key: 'cost', label: '成本预算', type: 'textarea' },
      { key: 'riskReserve', label: '风险储备（10-15%）', type: 'text', placeholder: '建议预留总预算的 10-15% 作为风险应对储备' },
      { key: 'timeline', label: '时间线', type: 'textarea' }
    ]
  },
  action_items: {
    label: '待办行动',
    icon: '☑️',
    source: '标准任务管理实践',
    module: '06 执行路线图',
    fields: [
      { key: 'tasks', label: '待办清单', type: 'textarea', placeholder: '具体动作，逐条列出' },
      { key: 'owner', label: '负责人', type: 'text', placeholder: '没有责任人的待办只是愿望清单' },
      { key: 'dueDate', label: '截止日期', type: 'date' }
    ]
  },
  blank: {
    label: '空白文档',
    icon: '📝',
    source: '通用',
    module: null,
    fields: []
  },
  manifesto: {
    label: '核心定位',
    icon: '🎯',
    source: '项目宪法核心',
    module: '01 项目宪法',
    fields: [
      { key: 'slogan', label: '一句话宣言', type: 'text', placeholder: '一句话描述你的产品' },
      { key: 'description', label: '产品描述', type: 'textarea', placeholder: '详细描述产品是什么' },
      { key: 'targetUser', label: '目标用户', type: 'textarea', placeholder: '你的目标用户是谁' },
      { key: 'differentiation', label: '差异化', type: 'textarea', placeholder: '你的产品有什么不同' },
      { key: 'vibe', label: '产品气质', type: 'text', placeholder: '描述产品的气质和调性' },
      { key: 'antiWhat', label: '反对什么', type: 'textarea', placeholder: '明确你的产品反对什么' }
    ]
  }
}

const TEMPLATE_TYPES = TEMPLATES

const TEMPLATE_FIELDS = {}
Object.entries(TEMPLATES).forEach(([key, template]) => {
  TEMPLATE_FIELDS[key] = template.fields
})

const MODULE_TO_CATEGORY_MAP = {
  '01 项目宪法': 'constitution',
  '02 市场与用户洞察': 'market',
  '03 策略与增长': 'strategy',
  '04 决策链图谱': 'decision',
  '05 反脆弱审计': 'antifragile',
  '06 执行路线图': 'roadmap'
}

function getModuleByTemplateType(type) {
  const tmpl = TEMPLATES[type]
  return tmpl ? tmpl.module : null
}

function getTemplatesByModule(moduleId) {
  return Object.entries(TEMPLATES)
    .filter(([, tmpl]) => tmpl.module === moduleId)
    .map(([key]) => key)
}

function getAllModules() {
  return [...new Set(Object.values(TEMPLATES).map(t => t.module).filter(Boolean))]
}

function getTemplatesGroupedByModule() {
  const groups = {}
  for (const [key, tmpl] of Object.entries(TEMPLATES)) {
    if (tmpl.module) {
      if (!groups[tmpl.module]) {
        groups[tmpl.module] = []
      }
      groups[tmpl.module].push({
        key,
        label: tmpl.label,
        icon: tmpl.icon,
        source: tmpl.source
      })
    }
  }
  return groups
}

function getTemplateLabel(type) {
  const tmpl = TEMPLATES[type]
  return tmpl ? tmpl.label : '空白文档'
}

function getTemplateIcon(type) {
  const tmpl = TEMPLATES[type]
  return tmpl ? tmpl.icon : '📝'
}

function getTemplateFields(type) {
  const tmpl = TEMPLATES[type]
  return tmpl ? tmpl.fields : []
}

function createDefaultFields(type) {
  const tmpl = TEMPLATES[type]
  if (!tmpl || !tmpl.fields) return {}
  
  const fields = {}
  tmpl.fields.forEach(field => {
    fields[field.key] = ''
  })
  return fields
}

function getForcedCategory(docType, projectChildren = []) {
  const tmpl = TEMPLATES[docType]
  if (!tmpl || !tmpl.module) return null
  
  const categoryType = MODULE_TO_CATEGORY_MAP[tmpl.module]
  if (!categoryType) return null
  
  const category = projectChildren.find(child => 
    child.categoryType === categoryType ||
    child.id?.includes(categoryType) ||
    child.name?.includes(tmpl.module?.replace(/^\d+\s*/, ''))
  )
  
  return category ? category.id : null
}

const MODULE_ORDER = [
  '01 项目宪法',
  '02 市场与用户洞察',
  '03 策略与增长',
  '04 决策链图谱',
  '05 反脆弱审计',
  '06 执行路线图'
]

export {
  TEMPLATES,
  TEMPLATE_TYPES,
  TEMPLATE_FIELDS,
  getModuleByTemplateType,
  getTemplatesByModule,
  getAllModules,
  getTemplatesGroupedByModule,
  getTemplateLabel,
  getTemplateIcon,
  getTemplateFields,
  createDefaultFields,
  getForcedCategory,
  MODULE_ORDER
}

export default TEMPLATES

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TEMPLATES,
    TEMPLATE_TYPES,
    TEMPLATE_FIELDS,
    getModuleByTemplateType,
    getTemplatesByModule,
    getAllModules,
    getTemplatesGroupedByModule,
    getTemplateLabel,
    getTemplateIcon,
    getTemplateFields,
    createDefaultFields,
    getForcedCategory,
    MODULE_ORDER
  }
}
