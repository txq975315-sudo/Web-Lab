/**
 * Thinking Lab — localStorage 键名（前缀 `thinking-lab-`）。
 * 单一真相与读写约定见 docs/DATA_CONTRACT.md
 */
export const STORAGE_KEYS = Object.freeze({
  PROJECT_TREE: 'thinking-lab-project-tree',
  ACTIVE_PROJECT: 'thinking-lab-active-project',
  ACTIVE_LAB_TAB: 'thinking-lab-active-lab-tab',
  RECENT_DOCUMENTS: 'thinking-lab-recent-documents',
  LAB_MODE: 'thinking-lab-lab-mode',
  ACTIVE_ARCHAEOLOGY_ID: 'thinking-lab-active-archaeology-id',
  EXPERT_MODE: 'thinking-lab-expert-mode',
  ALL_HISTORY_MESSAGES: 'thinking-lab-all-history-messages',
  CHAT_SESSIONS: 'thinking-lab-chat-sessions',
  CURRENT_SESSION_ID: 'thinking-lab-current-session-id',
  PROJECT_MEMORIES: 'thinking-lab-project-memories',
  AI_CONFIG: 'thinking-lab-ai-config',
  /** 早期扁平结构项目/文档（迁移用，勿在新业务写入） */
  LEGACY_FLAT_DATA: 'thinking-lab-legacy-flat-data',
  /** 已废弃的设置快照 */
  LEGACY_SETTINGS: 'thinking-lab-legacy-settings',
  ARCHAEOLOGY_SESSIONS: 'thinking-lab-archaeology-sessions',
  CONSTITUTION: 'thinking-lab-constitution',
  ARCHIVES: 'thinking-lab-archives',
  ARCHAELOGY: 'thinking-lab-archaeology',
  GROWTH_SKILL_PROGRESS: 'thinking-lab-growth-skill-progress',
  /** 压力测试引擎：结构化会话（9 问 + 拆解 + 盲区快照） */
  PRESSURE_ENGINE_SESSIONS: 'thinking-lab-pressure-engine-sessions',
  /** 压力引擎 Layer1/Layer2 抽检与运维日志（环形 JSON 数组，见 pressureEvalLog.js） */
  PRESSURE_ENGINE_EVAL_LOG: 'thinking-lab-pressure-engine-eval-log'
})
