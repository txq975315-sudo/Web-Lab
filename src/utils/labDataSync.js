/**
 * Thinking Lab — 跨环境同步 localStorage（Chrome / Trae 内嵌预览等互不共享存储）
 */

export const LAB_LOCAL_STORAGE_KEYS = [
  'kairos-lab-data',
  'kairos-lab-settings',
  'kairos-active-lab-tab',
  'kairos-active-project',
  'kairos-project-tree',
  'kairos-constitution',
  'kairos-recent-documents',
  'kairos-lab-mode',
  'kairos-archaeology-sessions',
  'kairos-active-archaeology-id',
  'kairos-expert-mode',
  'kairos-all-history-messages',
  'kairos-current-session-id',
  'kairos-project-memories',
  'kairos-ai-config'
]

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
  for (const key of LAB_LOCAL_STORAGE_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(entries, key)) continue
    const val = entries[key]
    if (val === null || val === undefined) continue
    window.localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val))
  }

  return { ok: true }
}
