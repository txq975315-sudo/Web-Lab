/**
 * 将浏览器里旧版 localStorage 键一次性复制到新键名并删除旧键。
 * 旧键字符串仅在本文件出现（迁移所需）。
 */
import { STORAGE_KEYS } from '../config/storageKeys.js'

const MIGRATION_PAIRS = [
  ['kairos-project-tree', STORAGE_KEYS.PROJECT_TREE],
  ['kairos-active-project', STORAGE_KEYS.ACTIVE_PROJECT],
  ['kairos-active-lab-tab', STORAGE_KEYS.ACTIVE_LAB_TAB],
  ['kairos-recent-documents', STORAGE_KEYS.RECENT_DOCUMENTS],
  ['kairos-lab-mode', STORAGE_KEYS.LAB_MODE],
  ['kairos-active-archaeology-id', STORAGE_KEYS.ACTIVE_ARCHAEOLOGY_ID],
  ['kairos-expert-mode', STORAGE_KEYS.EXPERT_MODE],
  ['kairos-all-history-messages', STORAGE_KEYS.ALL_HISTORY_MESSAGES],
  ['kairos-chat-sessions', STORAGE_KEYS.CHAT_SESSIONS],
  ['kairos-current-session-id', STORAGE_KEYS.CURRENT_SESSION_ID],
  ['kairos-project-memories', STORAGE_KEYS.PROJECT_MEMORIES],
  ['kairos-ai-config', STORAGE_KEYS.AI_CONFIG],
  ['kairos-lab-data', STORAGE_KEYS.LEGACY_FLAT_DATA],
  ['kairos-lab-settings', STORAGE_KEYS.LEGACY_SETTINGS],
  ['kairos-archaeology-sessions', STORAGE_KEYS.ARCHAEOLOGY_SESSIONS],
  ['kairos-constitution', STORAGE_KEYS.CONSTITUTION],
  ['kairos-archives', STORAGE_KEYS.ARCHIVES],
  ['kairos-archaeology', STORAGE_KEYS.ARCHAELOGY],
  ['kairos-growth-skill-progress', STORAGE_KEYS.GROWTH_SKILL_PROGRESS]
]

/** 导入旧版备份 JSON 时：条目键名 → 当前键名 */
export const LEGACY_IMPORT_ALIASES = Object.freeze(Object.fromEntries(MIGRATION_PAIRS))

export function migrateLegacyLocalStorageKeys() {
  if (typeof window === 'undefined' || !window.localStorage) return
  for (const [legacyKey, newKey] of MIGRATION_PAIRS) {
    try {
      if (window.localStorage.getItem(newKey) != null) continue
      const legacyVal = window.localStorage.getItem(legacyKey)
      if (legacyVal === null) continue
      window.localStorage.setItem(newKey, legacyVal)
      window.localStorage.removeItem(legacyKey)
    } catch (e) {
      console.warn('[Thinking Lab] localStorage 迁移跳过:', legacyKey, e)
    }
  }
}
