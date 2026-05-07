export const TEMPLATE_TYPES = {
  blank: { id: 'blank', label: '空白文档', icon: '📄', category: '通用', forcedCategory: null },
  manifesto: { id: 'manifesto', label: '核心定位', icon: '🎯', category: '宪法', forcedCategory: 'cat-constitution' },
  persona: { id: 'persona', label: '用户画像', icon: '👤', category: 'Insight', forcedCategory: 'cat-insight' },
  canvas: { id: 'canvas', label: '商业画布', icon: '🧩', category: 'Insight', forcedCategory: 'cat-insight' },
  prd: { id: 'prd', label: 'PRD 规格', icon: '📋', category: 'Archive', forcedCategory: 'cat-archive' },
  decision: { id: 'decision', label: '决策记录', icon: '✅', category: 'Decision', forcedCategory: 'cat-decision' }
}

export function getForcedCategory(templateType) {
  return TEMPLATE_TYPES[templateType]?.forcedCategory || null
}

export const TEMPLATE_FIELDS = {
  blank: [],

  manifesto: [
    { key: 'slogan', label: '一句话宣言', type: 'text', maxLength: 30, required: true, placeholder: '用一句话概括你的产品核心定位（最多30字）' },
    { key: 'description', label: '完整定位描述', type: 'textarea', maxLength: 200, placeholder: '详细描述产品的定位、愿景和使命...' },
    { key: 'targetUser', label: '目标用户', type: 'text', placeholder: '描述目标用户群体特征...' },
    { key: 'differentiation', label: '差异化价值', type: 'textarea', placeholder: '与竞品相比，你的独特价值是什么？' },
    { key: 'vibe', label: '产品情绪', type: 'text', placeholder: '如：建筑感、秩序、反焦虑、极简主义...' },
    { key: 'antiWhat', label: '明确反对', type: 'textarea', placeholder: '你明确反对什么？如：反对信息过载、反对社交压力...' }
  ],

  persona: [
    { key: 'valueProposition', label: '价值主张', type: 'textarea', placeholder: '描述你的产品/服务为用户创造的核心价值...' },
    { key: 'targetCustomer', label: '目标客户', type: 'text', placeholder: '描述你的目标客户群体...' },
    { key: 'revenueStreams', label: '收入来源', type: 'textarea', placeholder: '列出主要的收入来源和定价策略...' },
    { key: 'costStructure', label: '成本结构', type: 'textarea', placeholder: '列出主要的成本构成...' },
    { key: 'keyResources', label: '关键资源', type: 'textarea', placeholder: '列出实现价值主张所需的关键资源...' },
    { key: 'keyMetrics', label: '核心指标', type: 'text', placeholder: '定义衡量成功的关键指标...' }
  ],

  canvas: [
    { key: 'valueProposition', label: '价值主张', type: 'textarea', placeholder: '我们为客户创造什么价值？' },
    { key: 'customerSegments', label: '客户细分', type: 'text', placeholder: '我们为谁创造价值？' },
    { key: 'channels', label: '渠道通路', type: 'text', placeholder: '如何触达客户？' },
    { key: 'customerRelationships', label: '客户关系', type: 'text', placeholder: '建立什么样的客户关系？' },
    { key: 'revenueStreams', label: '收入来源', type: 'textarea', placeholder: '客户为什么付费？如何付费？' },
    { key: 'keyResources', label: '核心资源', type: 'textarea', placeholder: '需要哪些关键资源？' },
    { key: 'keyActivities', label: '关键业务', type: 'textarea', placeholder: '需要执行哪些关键活动？' },
    { key: 'keyPartners', label: '重要伙伴', type: 'textarea', placeholder: '谁是关键合作伙伴？' },
    { key: 'costStructure', label: '成本结构', type: 'textarea', placeholder: '最重要的成本是什么？' }
  ],

  prd: [
    { key: 'background', label: '背景', type: 'textarea', placeholder: '描述需求产生的背景和上下文...' },
    { key: 'goal', label: '目标', type: 'text', placeholder: '明确本次需求要达成的目标...' },
    { key: 'functionalDescription', label: '功能描述', type: 'textarea', placeholder: '详细描述功能需求...' },
    { key: 'acceptanceCriteria', label: '验收标准', type: 'textarea', placeholder: '列出可量化的验收标准...' },
    { key: 'technicalRisk', label: '技术风险', type: 'textarea', placeholder: '识别潜在的技术风险和应对方案...' },
    { key: 'priority', label: '优先级', type: 'select', options: ['P0', 'P1', 'P2'], placeholder: '选择优先级' }
  ],

  decision: [
    { key: 'decisionContent', label: '决策内容', type: 'textarea', placeholder: '描述需要做出的决策...' },
    { key: 'decisionBasis', label: '决策依据', type: 'textarea', placeholder: '列出支持该决策的理由和数据...' },
    { key: 'alternatives', label: '替代方案', type: 'textarea', placeholder: '列出考虑过的替代方案及其优劣...' },
    { key: 'confidence', label: '置信度', type: 'select', options: ['高', '中', '低'], placeholder: '选择置信度' },
    { key: 'decisionDate', label: '决策日期', type: 'date', placeholder: '' }
  ]
}

export function getTemplateFields(templateType) {
  return TEMPLATE_FIELDS[templateType] || TEMPLATE_FIELDS.blank
}

export function getTemplateLabel(templateType) {
  return TEMPLATE_TYPES[templateType]?.label || '未知模板'
}

export function getTemplateIcon(templateType) {
  return TEMPLATE_TYPES[templateType]?.icon || '📄'
}

export function createDefaultFields(templateType) {
  const fields = getTemplateFields(templateType)
  const defaults = {}
  for (const field of fields) {
    defaults[field.key] = ''
  }
  return defaults
}
