/**
 * 追问程序层质检（Layer 1）+ 模板 Fallback（链式追问 PRD §5）
 */

const FORBIDDEN_SUBSTRINGS = [
  '这个想法很好',
  '这个想法不错',
  '有创意',
  '你的思路很清晰',
  '值得一试',
  '你有潜力',
  '很棒',
  '非常好',
]

/**
 * @param {string} question
 * @param {string} [userLastAnswer]
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
 */
export function hasForbiddenWords(question) {
  return FORBIDDEN_SUBSTRINGS.some((w) => question.includes(w))
}

/**
 * @param {string} question
 */
export function looksLikeQuestion(question) {
  const t = question.trim()
  if (t.length < 8) return false
  return /[?？]|吗$|什么|哪些|如何|怎么|是不是|凭什么|多少|哪/.test(t)
}

/**
 * @param {string} a
 * @param {string} b
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
 * @param {number} roundIndex 1..3
 * @param {string} userLastAnswer
 */
export function templateFallbackQuestion(roundIndex, userLastAnswer) {
  const keyword = extractUserKeyword(userLastAnswer)
  if (roundIndex === 1) {
    return `你刚才说「${keyword}」——能具体解释一下这个词在你项目中的含义吗？`
  }
  if (roundIndex === 2) {
    return `你说「${keyword}」——如果市场上最大的竞争对手明天做这个，你怎么办？`
  }
  return `你刚才提到了「${keyword}」——这个数字或判断的依据是什么？`
}

/**
 * @param {string} text
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
export function evaluateQuestionAuto({ question, userLastAnswer, previousQuestions, roundIndex }) {
  void roundIndex
  const q = (question || '').trim()
  const failed = /** @type {string[]} */ ([])

  if (q.length < 30 || q.length > 120) failed.push('length')
  if (hasForbiddenWords(q)) failed.push('forbidden')
  if (!looksLikeQuestion(q)) failed.push('not_question')
  if (!hasUserReference(q, userLastAnswer)) failed.push('reference')
  if (isDuplicateQuestion(q, previousQuestions)) failed.push('duplicate')

  return {
    passed: failed.length === 0,
    failedChecks: failed,
  }
}

/**
 * @param {string[]} failedChecks
 */
export function buildRetryHint(failedChecks) {
  const parts = []
  if (failedChecks.includes('length')) parts.push('长度须在 30–120 字（中文）')
  if (failedChecks.includes('forbidden')) parts.push('禁止使用鼓励性、夸奖用语')
  if (failedChecks.includes('not_question')) parts.push('必须是完整追问句，包含疑问语气')
  if (failedChecks.includes('reference')) parts.push('必须引用用户上文至少连续 3 个相同字符的词句')
  if (failedChecks.includes('duplicate')) parts.push('不能与之前任一追问高度相似')
  return parts.join('；')
}
