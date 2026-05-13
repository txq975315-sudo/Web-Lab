/**
 * 压力测试引擎 — 数据契约与纯函数（对齐 PRD/Agent_压力训练MVP讨论）。
 * @see docs/DATA_CONTRACT.md §4.6
 */

/**
 * MVP 实际运行三态。完整 PRD 中的 idle、round_transition 等可在壳外扩展后再纳入类型。
 * @typedef {'deconstructing'|'questioning'|'completed'} SessionStatus
 */

/** @typedef {'mild'|'direct'|'pressure'} ToneLevel */

/**
 * @typedef {Object} IdeaDeconstruction
 * @property {string} targetUser
 * @property {string} painPoint
 * @property {string} valueProposition
 * @property {string} solution
 * @property {string} differentiation
 * @property {string} businessModel
 * @property {string[]} keyAssumptions
 * @property {string[]} potentialCompetitors
 * @property {string[]} riskSignals
 */

/**
 * @typedef {Object} BlindSpotMarker
 * @property {string} dimension
 * @property {string} description
 * @property {'high'|'medium'|'low'} severity
 */

/**
 * @typedef {Object} QuestionItem
 * @property {number} questionIndex
 * @property {string} questionText
 * @property {string} [answerText]
 * @property {BlindSpotMarker|null} [blindSpotMarker]
 * @property {number} [answeredAt]
 */

/**
 * @typedef {Object} QuestionRound
 * @property {number} roundIndex
 * @property {string} roundName
 * @property {ToneLevel} tone
 * @property {QuestionItem[]} questions
 * @property {boolean} isCompleted
 */

/**
 * @typedef {Object} BlindSpotReport
 * @property {{ dimension: string, userClaim: string, aiFinding: string }[]} deconstructionSnapshot
 * @property {{ dimension: string, description: string, severity: 'high'|'medium'|'low', suggestion: string }[]} blindSpots
 * @property {'needs_rethink'|'basically_viable'} verdict
 * @property {string} verdictText
 * @property {number} totalHigh
 * @property {number} totalMedium
 * @property {number} totalLow
 */

/**
 * @typedef {Object} PressureSession
 * @property {string} id
 * @property {string} name
 * @property {number} createdAt
 * @property {number} updatedAt
 * @property {string} originalIdea
 * @property {IdeaDeconstruction|null} deconstruction
 * @property {QuestionRound[]} rounds
 * @property {BlindSpotMarker[]} blindSpotMarkers
 * @property {BlindSpotReport|null} blindSpotReport
 * @property {SessionStatus} status
 * @property {string} [promptsVersion] 创建会话时 Prompt 包版本（评测与回归对照）
 */

const SEVERITY_RANK = { low: 1, medium: 2, high: 3 }

export const ROUND_META = Object.freeze([
  { roundIndex: 1, roundName: '定位追问', tone: /** @type {const} */ ('mild') },
  { roundIndex: 2, roundName: '竞争追问', tone: /** @type {const} */ ('direct') },
  { roundIndex: 3, roundName: '可行性追问', tone: /** @type {const} */ ('pressure') },
])

/**
 * @param {string} idea
 * @returns {IdeaDeconstruction}
 */
export function getDefaultDeconstruction(idea) {
  return {
    targetUser: '未明确',
    painPoint: '未明确',
    valueProposition: '未明确',
    solution: '未明确',
    differentiation: '未明确',
    businessModel: '未明确',
    keyAssumptions: ['用户需求存在且未被满足', '目标用户愿意为解决方案付费'],
    potentialCompetitors: ['需进一步确认'],
    riskSignals: ['缺乏数据支撑'],
  }
}

/**
 * @param {unknown} v
 * @returns {v is IdeaDeconstruction}
 */
export function validateDeconstruction(v) {
  if (!v || typeof v !== 'object') return false
  const o = /** @type {Record<string, unknown>} */ (v)
  const str = (k) => typeof o[k] === 'string'
  const arr = (k) => Array.isArray(o[k]) && o[k].every((x) => typeof x === 'string')
  if (
    !str('targetUser') ||
    !str('painPoint') ||
    !str('valueProposition') ||
    !str('solution') ||
    !str('differentiation') ||
    !str('businessModel')
  ) {
    return false
  }
  if (!arr('keyAssumptions') || !arr('potentialCompetitors') || !arr('riskSignals')) return false
  const ka = /** @type {string[]} */ (o.keyAssumptions)
  const rs = /** @type {string[]} */ (o.riskSignals)
  if (ka.length < 2 || ka.length > 5) return false
  if (rs.length < 1 || rs.length > 5) return false
  return true
}

/**
 * @param {BlindSpotMarker[]} blindSpots
 * @returns {'needs_rethink'|'basically_viable'}
 */
export function getVerdictFromMarkers(blindSpots) {
  const highRiskCount = blindSpots.filter((s) => s.severity === 'high').length
  const mediumRiskCount = blindSpots.filter((s) => s.severity === 'medium').length
  if (highRiskCount >= 2) return 'needs_rethink'
  if (highRiskCount >= 1 && mediumRiskCount >= 2) return 'needs_rethink'
  return 'basically_viable'
}

/**
 * @param {BlindSpotMarker} a
 * @param {BlindSpotMarker} b
 * @returns {BlindSpotMarker}
 */
export function mergeBlindSpotSameDimension(a, b) {
  const sev =
    SEVERITY_RANK[a.severity] >= SEVERITY_RANK[b.severity] ? a.severity : b.severity
  const desc =
    a.description === b.description
      ? a.description
      : `${a.description}；${b.description}`
  return { dimension: a.dimension, description: desc, severity: sev }
}

/**
 * @param {BlindSpotMarker[]} list
 * @param {BlindSpotMarker|null|undefined} incoming
 * @returns {BlindSpotMarker[]}
 */
export function accumulateBlindSpotMarkers(list, incoming) {
  if (!incoming || !incoming.dimension) return list
  const next = [...list]
  const idx = next.findIndex((m) => m.dimension === incoming.dimension)
  if (idx === -1) {
    next.push({ ...incoming })
    return next
  }
  next[idx] = mergeBlindSpotSameDimension(next[idx], incoming)
  return next
}

/**
 * @returns {QuestionRound[]}
 */
export function createEmptyRounds() {
  return ROUND_META.map((meta) => ({
    roundIndex: meta.roundIndex,
    roundName: meta.roundName,
    tone: meta.tone,
    isCompleted: false,
    questions: [1, 2, 3].map((i) => ({
      questionIndex: i,
      questionText: '',
      answerText: '',
      blindSpotMarker: null,
    })),
  }))
}

/**
 * @param {PressureSession} session
 * @returns {{ roundIdx: number, qIdx: number } | null}
 */
export function findAwaitingAnswerSlot(session) {
  for (let r = 0; r < session.rounds.length; r++) {
    for (let q = 0; q < session.rounds[r].questions.length; q++) {
      const it = session.rounds[r].questions[q]
      if (it.questionText && !it.answerText) return { roundIdx: r, qIdx: q }
    }
  }
  return null
}

/**
 * @param {PressureSession} session
 * @returns {{ roundIdx: number, qIdx: number } | null}
 */
export function findNextEmptyQuestionSlot(session) {
  for (let r = 0; r < session.rounds.length; r++) {
    for (let q = 0; q < session.rounds[r].questions.length; q++) {
      const it = session.rounds[r].questions[q]
      if (!it.questionText) return { roundIdx: r, qIdx: q }
    }
  }
  return null
}

/**
 * @param {PressureSession} session
 * @returns {boolean}
 */
export function allQuestionsAnswered(session) {
  return findAwaitingAnswerSlot(session) === null && findNextEmptyQuestionSlot(session) === null
}
