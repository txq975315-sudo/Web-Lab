/**
 * Thinking Lab — 跨环境同步 localStorage（Chrome / Trae 内嵌预览等互不共享存储）
 *
 * 【维护约定】以下键须覆盖应用实际读写的全部 thinking-lab-* 持久化项：
 * - LabContext.jsx → useLocalStorage(STORAGE_KEYS.*)
 * - SettingsModal / aiApi → STORAGE_KEYS.AI_CONFIG
 * - dataStore → LEGACY_FLAT_DATA、LEGACY_SETTINGS、ARCHAEOLOGY_SESSIONS
 *
 * 新增 localStorage 键时：在 config/storageKeys.js 定义 → 追加本文件 LAB_LOCAL_STORAGE_KEYS → 更新 docs/DATA_CONTRACT.md；
 * 若需兼容旧备份 JSON，在 migrateLegacyStorageKeys.js 的 MIGRATION_PAIRS / LEGACY_IMPORT_ALIASES 中登记。
 */

import { STORAGE_KEYS } from '../config/storageKeys.js'
import { LEGACY_IMPORT_ALIASES } from './migrateLegacyStorageKeys.js'

/** @type {readonly string[]} */
export const LAB_LOCAL_STORAGE_KEYS = Object.freeze([
  STORAGE_KEYS.LEGACY_FLAT_DATA,
  STORAGE_KEYS.LEGACY_SETTINGS,
  STORAGE_KEYS.ARCHAEOLOGY_SESSIONS,
  STORAGE_KEYS.ACTIVE_LAB_TAB,
  STORAGE_KEYS.ACTIVE_PROJECT,
  STORAGE_KEYS.PROJECT_TREE,
  STORAGE_KEYS.CONSTITUTION,
  STORAGE_KEYS.RECENT_DOCUMENTS,
  STORAGE_KEYS.LAB_MODE,
  STORAGE_KEYS.ACTIVE_ARCHAEOLOGY_ID,
  STORAGE_KEYS.EXPERT_MODE,
  STORAGE_KEYS.ALL_HISTORY_MESSAGES,
  STORAGE_KEYS.CHAT_SESSIONS,
  STORAGE_KEYS.CURRENT_SESSION_ID,
  STORAGE_KEYS.PROJECT_MEMORIES,
  STORAGE_KEYS.AI_CONFIG,
  STORAGE_KEYS.GROWTH_SKILL_PROGRESS,
  STORAGE_KEYS.ARCHIVES,
  STORAGE_KEYS.ARCHAELOGY,
  STORAGE_KEYS.PRESSURE_ENGINE_SESSIONS
])

const EXPORT_MARK = 'thinkingLabExport'
const EXPORT_VERSION = 1

export function collectLabStorageSnapshot() {
  const entries = {}
  for (const key of LAB_LOCAL_STORAGE_KEYS) {
    const v = window.localStorage.getItem(key)
    if (v !== null) entries[key] = v
  }
  return entries
}

export function exportLabDataBlob() {
  const payload = {
    [EXPORT_MARK]: true,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    entries: collectLabStorageSnapshot()
  }
  return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
}

export function downloadLabDataExport() {
  const blob = exportLabDataBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `thinking-lab-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * @param {string} jsonText
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
export function importLabDataFromJson(jsonText) {
  let data
  try {
    data = JSON.parse(jsonText)
  } catch {
    return { ok: false, error: '文件不是有效的 JSON' }
  }

  if (!data || data[EXPORT_MARK] !== true || typeof data.entries !== 'object') {
    return { ok: false, error: '不是 Thinking Lab 导出文件（缺少标记或 entries）' }
  }

  const entries = data.entries
  for (const key of LAB_LOCAL_STORAGE_KEYS) {
    window.localStorage.removeItem(key)
  }
  for (const rawKey of Object.keys(entries)) {
    const key = LEGACY_IMPORT_ALIASES[rawKey] ?? rawKey
    if (!LAB_LOCAL_STORAGE_KEYS.includes(key)) continue
    const val = entries[rawKey]
    if (val === null || val === undefined) continue
    window.localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val))
  }

  return { ok: true }
}
