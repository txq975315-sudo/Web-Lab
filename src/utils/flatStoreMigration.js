/**
 * 将早期扁平结构 LEGACY_FLAT_DATA（store._getData）合并进 projectTree 的辅助函数。
 * 实际挂载由 LabContext.migrateLegacyFlatStore 调用 createProject / createDocument 完成。
 */

import { TEMPLATES } from '../config/templates'

/**
 * @param {{ projects?: unknown[], documents?: Record<string, unknown[]> }} data
 */
export function summarizeLegacyFlat(data) {
  if (!data || !Array.isArray(data.projects)) {
    return { projectCount: 0, docCount: 0 }
  }
  let docCount = 0
  for (const p of data.projects) {
    if (!p || typeof p.id !== 'string') continue
    const docs = data.documents?.[p.id] || []
    docCount += Array.isArray(docs) ? docs.length : 0
  }
  return { projectCount: data.projects.length, docCount }
}

/** 扁平文档上的模板 key → 有效模板 key（无效则落默认） */
export function normalizeFlatDocType(docType) {
  const dt = docType && typeof docType === 'string' ? docType.trim() : ''
  if (dt && TEMPLATES[dt]) return dt
  return 'value_proposition'
}
