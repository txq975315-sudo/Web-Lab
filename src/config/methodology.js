/**
 * 模板 → 方法论（成长教练）
 * 六套方法论 id 与专项文档中的命名对齐。
 */

/** @typedef {'multi_dimensional'|'scenario_immersion'|'first_principles'|'game_theory'|'closed_loop_validation'|'indicator_decomposition'} MethodologyId */

/** 全部 24 种归档模板 key → 方法论 id */
export const TEMPLATE_TO_METHODOLOGY = {
  constraint: 'first_principles',
  graveyard: 'first_principles',
  persona: 'scenario_immersion',
  journey_map: 'scenario_immersion',
  value_proposition: 'first_principles',
  canvas: 'first_principles',
  competitive_analysis: 'multi_dimensional',
  market_sizing: 'indicator_decomposition',
  prd: 'closed_loop_validation',
  gtm: 'game_theory',
  growth_loop: 'indicator_decomposition',
  north_star: 'indicator_decomposition',
  unit_economics: 'indicator_decomposition',
  decision_log: 'game_theory',
  decision_review: 'first_principles',
  premortem: 'closed_loop_validation',
  moat: 'game_theory',
  dependency_risk: 'multi_dimensional',
  mvp_scope: 'closed_loop_validation',
  milestones: 'closed_loop_validation',
  hypothesis_tracker: 'closed_loop_validation',
  analytics_plan: 'indicator_decomposition',
  resource_plan: 'game_theory',
  action_items: 'closed_loop_validation'
}

export const METHODOLOGY_ORDER = [
  'multi_dimensional',
  'scenario_immersion',
  'first_principles',
  'game_theory',
  'closed_loop_validation',
  'indicator_decomposition'
]

/** @type {Record<string, { id: MethodologyId, name: string, hook: string, presentation: string, namePosition: 'start'|'middle'|'end'|'climax'|'after_result' }>} */
export const METHODOLOGY_CONFIG = {
  multi_dimensional: {
    id: 'multi_dimensional',
    name: '多维拆解法',
    hook: '同时想多个方面',
    presentation: 'scenario_analogy',
    namePosition: 'start'
  },
  scenario_immersion: {
    id: 'scenario_immersion',
    name: '场景代入法',
    hook: '进入那个场景',
    presentation: 'questioning_guide',
    namePosition: 'middle'
  },
  first_principles: {
    id: 'first_principles',
    name: '第一性推理',
    hook: '追到根上',
    presentation: 'contrast',
    namePosition: 'end'
  },
  game_theory: {
    id: 'game_theory',
    name: '推演博弈法',
    hook: '填完3轮就知道',
    presentation: 'toolkit',
    namePosition: 'when_tool'
  },
  closed_loop_validation: {
    id: 'closed_loop_validation',
    name: '闭环验证法',
    hook: '建一点测一点',
    presentation: 'story',
    namePosition: 'climax'
  },
  indicator_decomposition: {
    id: 'indicator_decomposition',
    name: '指标拆解法',
    hook: '拆开找杠杆',
    presentation: 'toolkit',
    namePosition: 'after_result'
  }
}

export function getMethodologyForTemplate(templateKey) {
  const id = TEMPLATE_TO_METHODOLOGY[templateKey]
  return id ? METHODOLOGY_CONFIG[id] : null
}
