/**
 * 商业假设构建器 — 追问程序层质检（Layer 1）+ 模板 Fallback
 * 质检维度：长度、违禁词、问句完整性、共建语气、引用、重复度
 */

import { QC_RULES } from '../../config/businessHypothesisPrompts.js'

const FORBIDDEN_SUBSTRINGS = QC_RULES.FORBIDDEN_WORDS
const CO_BUILD_KEYWORDS = QC_RULES.CO_BUILD_KEYWORDS

/**
 * @param {string} question
 * @param {string} [userLastAnswer]
 * @returns {boolean}
 */
export function hasUserReference(question, userLastAnswer) {
  if (!userLastAnswer || userLastAnswer.trim().length < 2) return true
  const q = question.replace(/\s/g, '')
  const u = userLastAnswer.replace(/\s/g, '')
  if (u.length < 3) return true
  for (let i = 0; i <= u.length - 3; i++) {
    const sub = u.slice(i, i + 3)
    if (sub && q.includes(sub)) return true
  }
  return false
}

/**
 * @param {string} question
 * @returns {boolean}
 */
export function hasForbiddenWords(question) {
  return FORBIDDEN_SUBSTRINGS.some((w) => question.includes(w))
}

/**
 * @param {string} question
 * @returns {boolean}
 */
export function looksLikeQuestion(question) {
  const t = question.trim()
  if (t.length < 8) return false
  return /[?？]|吗$|什么|哪些|如何|怎么|是不是|多少|哪/.test(t)
}

/**
 * 检查共建语气：是否包含"我们""一起""来"等共建议词汇
 * @param {string} question
 * @returns {boolean}
 */
export function hasCoBuildTone(question) {
  return CO_BUILD_KEYWORDS.some((kw) => question.includes(kw))
}

/**
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function charBigramSimilarity(a, b) {
  const x = a.replace(/\s/g, '')
  const y = b.replace(/\s/g, '')
  if (!x.length || !y.length) return 0
  let common = 0
  for (let i = 0; i < x.length - 1; i++) {
    const bg = x.slice(i, i + 2)
    if (y.includes(bg)) common++
  }
  const denom = Math.max(1, x.length - 1 + y.length - 1)
  return (2 * common) / denom
}

/**
 * @param {string} question
 * @param {string[]} previousQuestions
 * @returns {boolean}
 */
export function isDuplicateQuestion(question, previousQuestions) {
  const t = question.trim()
  for (const p of previousQuestions) {
    if (!p) continue
    if (p.trim() === t) return true
    if (charBigramSimilarity(p, t) > 0.82) return true
  }
  return false
}

/**
 * @param {number} roundIndex 1..4
 * @param {string} userLastAnswer
 * @returns {string}
 */
export function templateFallbackQuestion(roundIndex, userLastAnswer) {
  const keyword = extractUserKeyword(userLastAnswer)
  const templates = [
    // R1
    `你刚才说「${keyword}」——能多分享一些这方面的信息吗？我们一起来把这个维度写清楚。`,
    // R2
    `你说「${keyword}」——这个功能如果要做出来，核心解决的问题是……？我们继续往下想。`,
    // R3
    `关于「${keyword}」——你觉得什么样的方式最适合你的目标用户？`,
    // R4
    `基于你说到的「${keyword}」——我们想想怎么用最小成本验证这个假设。`,
  ]
  const idx = Math.min(roundIndex, 4) - 1
  return templates[idx]
}

/**
 * @param {string} text
 * @returns {string}
 */
export function extractUserKeyword(text) {
  const parts = text
    .split(/[，,。.\n;；、]/)
    .map((s) => s.trim())
    .filter(Boolean)
  let best = parts[0] || text.trim().slice(0, 12) || '这一点'
  for (const p of parts) {
    if (p.length > best.length && p.length <= 32) best = p
  }
  if (best.length > 24) best = best.slice(0, 24)
  return best || '这一点'
}

/**
 * @param {object} params
 * @param {string} params.question
 * @param {string} [params.userLastAnswer]
 * @param {string[]} params.previousQuestions
 * @param {number} params.roundIndex
 */
export function evaluateHypothesisQuestion({ question, userLastAnswer, previousQuestions, roundIndex }) {
  void roundIndex
  const q = (question || '').trim()
  const failed = /** @type {string[]} */ ([])

  if (q.length < QC_RULES.MIN_LENGTH || q.length > QC_RULES.MAX_LENGTH) failed.push('length')
  if (hasForbiddenWords(q)) failed.push('forbidden')
  if (!looksLikeQuestion(q)) failed.push('not_question')
  if (!hasCoBuildTone(q)) failed.push('co_build_tone')
  if (!hasUserReference(q, userLastAnswer)) failed.push('reference')
  if (isDuplicateQuestion(q, previousQuestions)) failed.push('duplicate')

  return {
    passed: failed.length === 0,
    failedChecks: failed,
  }
}

/**
 * @param {string[]} failedChecks
 * @returns {string}
 */
export function buildRetryHint(failedChecks) {
  const parts = []
  if (failedChecks.includes('length')) parts.push('长度须在 30–120 字（中文）')
  if (failedChecks.includes('forbidden')) parts.push('禁止使用打压否定性用语')
  if (failedChecks.includes('not_question')) parts.push('必须是完整追问句，包含疑问语气')
  if (failedChecks.includes('co_build_tone')) parts.push('应为共建语气，包含"我们""一起"等词语')
  if (failedChecks.includes('reference')) parts.push('必须引用用户上文至少连续 3 个相同字符的词句')
  if (failedChecks.includes('duplicate')) parts.push('不能与之前任一追问高度相似')
  return parts.join('；')
}
