/**
 * Thinking Lab — 记忆层 & 数据层
 * 
 * 职责：
 *   1. localStorage 持久化（项目、文档、设置）
 *   2. 模块-模板映射（与 documentGenerators.js 对齐）
 *   3. CRUD：项目、文档、设置
 *   4. 工具函数：模块查询、文档大纲生成
 * 
 * 使用方式：
 *   import { MODULE_MAP, TEMPLATE_LIST } from './dataStore.js';
 *   文档与项目请以 LabContext 的 projectTree 为唯一真相（createProject / createDocument）。
 *   扁平结构 store.* CRUD 已废弃写入；完整约定见 ../../docs/DATA_CONTRACT.md。
 *   开发模式下若仍调用 store 的写入方法，将在控制台输出契约告警。
 */

import { STORAGE_KEYS } from '../config/storageKeys.js'
import { migrateLegacyLocalStorageKeys } from './migrateLegacyStorageKeys.js'

// ============================================================
// 1. 模块-模板映射（与 documentGenerators.js 严格对齐）
// ============================================================

const MODULE_ORDER = [
  '01 项目宪法',
  '02 市场与用户洞察',
  '03 策略与增长',
  '04 决策链图谱',
  '05 反脆弱审计',
  '06 执行路线图'
];

const MODULE_MAP = {
  '01 项目宪法': {
    color: '#8B5CF6',
    templates: ['constraint', 'graveyard']
  },
  '02 市场与用户洞察': {
    color: '#3B82F6',
    templates: ['persona', 'journey_map', 'value_proposition', 'canvas', 'competitive_analysis', 'market_sizing']
  },
  '03 策略与增长': {
    color: '#F59E0B',
    templates: ['prd', 'gtm', 'growth_loop', 'north_star', 'unit_economics']
  },
  '04 决策链图谱': {
    color: '#10B981',
    templates: ['decision_log', 'decision_review']
  },
  '05 反脆弱审计': {
    color: '#EF4444',
    templates: ['premortem', 'moat', 'dependency_risk']
  },
  '06 执行路线图': {
    color: '#6B7280',
    templates: ['mvp_scope', 'milestones', 'hypothesis_tracker', 'analytics_plan', 'resource_plan', 'action_items']
  }
};

// 反向查询：模板 key → 模块名
const TEMPLATE_MODULE_MAP = {};
for (const [moduleName, config] of Object.entries(MODULE_MAP)) {
  for (const tmplKey of config.templates) {
    TEMPLATE_MODULE_MAP[tmplKey] = moduleName;
  }
}

// 全部 25 个模板 key 列表
const TEMPLATE_LIST = Object.values(MODULE_MAP).flatMap(m => m.templates);

function getModuleByTemplateType(type) {
  return TEMPLATE_MODULE_MAP[type] || null;
}

function getTemplatesByModule(moduleId) {
  return MODULE_MAP[moduleId]?.templates || [];
}

function getModuleColor(moduleId) {
  return MODULE_MAP[moduleId]?.color || '#9CA3AF';
}

// ============================================================
// 2. localStorage 读写
// ============================================================

const STORAGE_KEY = STORAGE_KEYS.LEGACY_FLAT_DATA
const SETTINGS_KEY = STORAGE_KEYS.LEGACY_SETTINGS

/** 开发态：对仍写入扁平旧库的路径发出一次契约提醒（见 docs/DATA_CONTRACT.md） */
function warnDeprecatedFlatStoreWrite(operation) {
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    console.warn(
      `[Thinking Lab][数据契约] store.${operation} 会写入 ${STORAGE_KEY}（扁平旧库），新功能已废弃此路径。请使用 LabContext：createProject / createDocument / saveDocument 等。详见 docs/DATA_CONTRACT.md`
    )
  }
}

function _readStorage(key, fallback = {}) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function _writeStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('[dataStore] localStorage write failed:', e);
    return false;
  }
}

// ============================================================
// 3. 数据模型 & CRUD
// ============================================================

function _generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function _now() {
  return new Date().toISOString();
}

// 项目工厂
function _createProject(name, description = '') {
  return {
    id: _generateId('proj'),
    name,
    description,
    status: 'active',
    createdAt: _now(),
    constitution: {
      constraints: [],
      graveyard: []
    }
  };
}

// 文档工厂
function _createDocument(docType, fields = {}, title = '') {
  const moduleName = getModuleByTemplateType(docType);
  const tmplLabel = _getTemplateLabel(docType);
  return {
    id: _generateId('doc'),
    type: 'document',
    docType,
    module: moduleName,
    title: title || `${tmplLabel} (${_formatDate(_now())})`,
    fields,
    content: '',           // AI 生成后的 Markdown 内容
    aiGenerated: false,    // 是否已由 AI 生成
    createdAt: _now(),
    updatedAt: _now()
  };
}

function _getTemplateLabel(docType) {
  const labels = {
    constraint: '硬性约束',
    graveyard: '否决墓地',
    persona: '用户画像',
    journey_map: '用户旅程',
    value_proposition: '价值主张',
    canvas: '商业画布',
    competitive_analysis: '竞品分析',
    market_sizing: '市场规模',
    prd: 'PRD 规格',
    gtm: 'GTM 计划',
    growth_loop: '增长飞轮',
    north_star: '北极星指标',
    unit_economics: '单位经济学',
    decision_log: '决策日志',
    decision_review: '决策回顾',
    premortem: '死亡预测',
    moat: '壁垒建设',
    dependency_risk: '外部依赖',
    mvp_scope: 'MVP 范围',
    milestones: '里程碑',
    hypothesis_tracker: '假设验证',
    analytics_plan: '数据方案',
    resource_plan: '资源预算',
    action_items: '待办行动'
  };
  return labels[docType] || docType;
}

function _formatDate(iso) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// ============================================================
// 3.5 树形结构持久化（统一数据层）
// ============================================================

const PROJECT_TREE_KEY = STORAGE_KEYS.PROJECT_TREE
const ACTIVE_PROJECT_KEY = STORAGE_KEYS.ACTIVE_PROJECT
const EXPERT_MODE_KEY = STORAGE_KEYS.EXPERT_MODE

// ============================================================
// 4. Store API
// ============================================================

const store = {
  // --- 读取全部数据（旧版扁平结构，@deprecated） ---
  _getData() {
    return _readStorage(STORAGE_KEY, { projects: [], activeProjectId: null, documents: {} });
  },

  _saveData(data) {
    return _writeStorage(STORAGE_KEY, data);
  },

  // --- 树形结构持久化（新版统一数据层） ---
  saveProjectTree(tree) {
    return _writeStorage(PROJECT_TREE_KEY, tree);
  },

  loadProjectTree() {
    try {
      const raw = localStorage.getItem(PROJECT_TREE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  saveActiveProjectId(id) {
    return _writeStorage(ACTIVE_PROJECT_KEY, id);
  },

  loadActiveProjectId() {
    try {
      const raw = localStorage.getItem(ACTIVE_PROJECT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  saveExpertMode(mode) {
    return _writeStorage(EXPERT_MODE_KEY, mode);
  },

  loadExpertMode() {
    try {
      const raw = localStorage.getItem(EXPERT_MODE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // --- 项目 CRUD（旧版扁平结构，@deprecated — 仅用于迁移兼容） ---
  getProjects() {
    return this._getData().projects;
  },

  getActiveProject() {
    const data = this._getData();
    return data.projects.find(p => p.id === data.activeProjectId) || data.projects[0] || null;
  },

  getActiveProjectId() {
    return this._getData().activeProjectId;
  },

  createProject(name, description) {
    warnDeprecatedFlatStoreWrite('createProject')
    const data = this._getData();
    const project = _createProject(name, description);
    data.projects.push(project);
    data.activeProjectId = project.id;
    data.documents[project.id] = data.documents[project.id] || [];
    this._saveData(data);
    return project;
  },

  setActiveProject(projectId) {
    warnDeprecatedFlatStoreWrite('setActiveProject')
    const data = this._getData();
    data.activeProjectId = projectId;
    this._saveData(data);
  },

  // --- 文档 CRUD ---
  getDocuments(projectId) {
    const data = this._getData();
    return data.documents[projectId] || [];
  },

  getDocument(projectId, docId) {
    const docs = this.getDocuments(projectId);
    return docs.find(d => d.id === docId) || null;
  },

  getDocumentsByModule(projectId, moduleId) {
    const docs = this.getDocuments(projectId);
    return docs.filter(d => d.module === moduleId);
  },

  createDocument(projectId, docType, fields = {}, title = '') {
    warnDeprecatedFlatStoreWrite('createDocument')
    const data = this._getData();
    if (!data.documents[projectId]) data.documents[projectId] = [];
    const doc = _createDocument(docType, fields, title);
    data.documents[projectId].push(doc);
    this._saveData(data);
    return doc;
  },

  updateDocument(projectId, docId, updates) {
    warnDeprecatedFlatStoreWrite('updateDocument')
    const data = this._getData();
    const docs = data.documents[projectId] || [];
    const idx = docs.findIndex(d => d.id === docId);
    if (idx === -1) return null;
    docs[idx] = { ...docs[idx], ...updates, updatedAt: _now() };
    this._saveData(data);
    return docs[idx];
  },

  saveAIContent(projectId, docId, content) {
    return this.updateDocument(projectId, docId, { content, aiGenerated: true });
  },

  deleteDocument(projectId, docId) {
    warnDeprecatedFlatStoreWrite('deleteDocument')
    const data = this._getData();
    if (!data.documents[projectId]) return false;
    data.documents[projectId] = data.documents[projectId].filter(d => d.id !== docId);
    this._saveData(data);
    return true;
  },

  // --- 宪法相关 ---
  addConstraint(projectId, content, rationale = '') {
    warnDeprecatedFlatStoreWrite('addConstraint')
    const data = this._getData();
    const proj = data.projects.find(p => p.id === projectId);
    if (!proj) return null;
    const item = { id: _generateId('cst'), content, rationale, createdAt: _now() };
    proj.constitution.constraints.push(item);
    this._saveData(data);
    return item;
  },

  addGraveyardItem(projectId, idea, reason) {
    warnDeprecatedFlatStoreWrite('addGraveyardItem')
    const data = this._getData();
    const proj = data.projects.find(p => p.id === projectId);
    if (!proj) return null;
    const item = { id: _generateId('gvy'), idea, reason, vetoedAt: _now() };
    proj.constitution.graveyard.push(item);
    this._saveData(data);
    return item;
  },

  // --- 统计数据 ---
  getProjectStats(projectId) {
    const docs = this.getDocuments(projectId);
    const stats = {};
    for (const mod of MODULE_ORDER) {
      stats[mod] = docs.filter(d => d.module === mod).length;
    }
    stats.total = docs.length;
    return stats;
  },

  // --- 模块树（用于 Sidebar 渲染） ---
  getModuleTree(projectId) {
    const stats = this.getProjectStats(projectId);
    return MODULE_ORDER.map(moduleName => ({
      module: moduleName,
      color: getModuleColor(moduleName),
      templates: MODULE_MAP[moduleName].templates.map(t => ({
        key: t,
        label: _getTemplateLabel(t)
      })),
      docCount: stats[moduleName] || 0,
      isEmpty: (stats[moduleName] || 0) === 0
    }));
  }
};

// ============================================================
// 5. 设置 API
// ============================================================

/**
 * @deprecated 应用设置以设置页 `STORAGE_KEYS.AI_CONFIG` 为准；仅保留供极端旧数据读取，勿在新代码中调用 set。
 */
const settingsStore = {
  _read() {
    return _readStorage(SETTINGS_KEY, { apiKey: '', apiProvider: 'deepseek', model: '' });
  },
  _write(s) {
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.warn(
        `[Thinking Lab] settingsStore 已废弃（${SETTINGS_KEY}），请使用「设置」中的 ${STORAGE_KEYS.AI_CONFIG}。`
      );
    }
    _writeStorage(SETTINGS_KEY, s);
  },
  get() {
    return this._read();
  },
  set(updates) {
    this._write({ ...this._read(), ...updates });
  }
};

// ============================================================
// 6. 初始化：首次访问创建默认项目
// ============================================================

function initStore() {
  migrateLegacyLocalStorageKeys()
  // 唯一真相：STORAGE_KEYS.PROJECT_TREE（LabContext）。不再向 LEGACY_FLAT_DATA 写入种子数据，避免与侧边栏项目树分裂。
  return store._getData();
}

// 初始化由 App.jsx 在 useEffect 中调用（确保在浏览器环境、React 挂载后执行）

// ============================================================
// 7. 考古会话数据层
// ============================================================

function _createArchaeologySession(name = '未命名考古') {
  return {
    id: _generateId('arch'),
    name,
    status: 'analyzing', // analyzing / reviewing / archived
    createdAt: _now(),
    updatedAt: _now(),
    // 原始对话记录（可追加）
    conversationChunks: [], // [{ id, content, addedAt }, ...]
    // AI 分析结果（分维度，每条目有待确认/已确认/已驳回状态）
    analysis: {
      timeline: [],      // [{ id, date, stage, decision, status: 'pending'|'confirmed'|'rejected', editedContent: '' }]
      turningPoints: [], // [{ id, name, trigger, basis, alternatives, finalChoice, status, editedContent }]
      blindSpots: [],    // [{ id, question, importance, suggestion, status, editedContent }]
      assumptions: [],   // [{ id, assumption, evidence, risk, validation, status, editedContent }]
      assets: []         // [{ id, content, type, suggestedTemplate, status, editedContent }]
    },
    // 最终报告（确认后生成）
    finalReport: null
  };
}

// 考古会话 CRUD
const archaeologyStore = {
  _read() {
    const data = _readStorage(STORAGE_KEYS.ARCHAEOLOGY_SESSIONS, { sessions: [] });
    // 确保 sessions 数组存在
    if (!data || !Array.isArray(data.sessions)) {
      return { sessions: [] };
    }
    return data;
  },
  _write(data) {
    _writeStorage(STORAGE_KEYS.ARCHAEOLOGY_SESSIONS, data);
  },

  createSession(name) {
    const data = this._read();
    const session = _createArchaeologySession(name);
    data.sessions.push(session);
    this._write(data);
    return session;
  },

  getSession(sessionId) {
    return this._read().sessions.find(s => s.id === sessionId) || null;
  },

  getAllSessions() {
    return this._read().sessions;
  },

  // 追加对话片段
  addConversationChunk(sessionId, content) {
    const data = this._read();
    const session = data.sessions.find(s => s.id === sessionId);
    if (!session) return null;
    const chunk = { id: _generateId('chunk'), content, addedAt: _now() };
    session.conversationChunks.push(chunk);
    session.updatedAt = _now();
    this._write(data);
    return chunk;
  },

  // 获取合并后的完整对话文本
  getMergedConversation(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) return '';
    return session.conversationChunks.map(c => c.content).join('\n\n---\n\n');
  },

  // 更新分析结果
  updateAnalysis(sessionId, dimension, items) {
    const data = this._read();
    const session = data.sessions.find(s => s.id === sessionId);
    if (!session) return false;
    // 保留已确认的内容，只更新待确认的内容
    const existing = session.analysis[dimension] || [];
    const confirmed = existing.filter(i => i.status === 'confirmed');
    session.analysis[dimension] = [...confirmed, ...items.map(i => ({ ...i, status: 'pending' }))];
    session.updatedAt = _now();
    this._write(data);
    return true;
  },

  // 确认/驳回/修改单条条目
  updateItemStatus(sessionId, dimension, itemId, status, editedContent = null) {
    const data = this._read();
    const session = data.sessions.find(s => s.id === sessionId);
    if (!session) return false;
    const item = session.analysis[dimension]?.find(i => i.id === itemId);
    if (!item) return false;
    item.status = status;
    if (editedContent !== null) item.editedContent = editedContent;
    session.updatedAt = _now();
    this._write(data);
    return true;
  },

  // 保存最终报告
  saveFinalReport(sessionId, report) {
    const data = this._read();
    const session = data.sessions.find(s => s.id === sessionId);
    if (!session) return false;
    session.finalReport = report;
    session.status = 'reviewing';
    session.updatedAt = _now();
    this._write(data);
    return true;
  },

  deleteSession(sessionId) {
    const data = this._read();
    data.sessions = data.sessions.filter(s => s.id !== sessionId);
    this._write(data);
    return true;
  }
};

// ============================================================
// 8. 导出
// ============================================================

export {
  store,
  settingsStore,
  archaeologyStore,
  MODULE_MAP,
  MODULE_ORDER,
  TEMPLATE_LIST,
  TEMPLATE_MODULE_MAP,
  getModuleByTemplateType,
  getTemplatesByModule,
  getModuleColor,
  initStore
};

export default store;

// CommonJS 兼容
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    store,
    settingsStore,
    archaeologyStore,
    MODULE_MAP,
    MODULE_ORDER,
    TEMPLATE_LIST,
    TEMPLATE_MODULE_MAP,
    getModuleByTemplateType,
    getTemplatesByModule,
    getModuleColor,
    initStore
  };
}
