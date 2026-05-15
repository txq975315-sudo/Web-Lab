/**
 * 商业假设构建器 — 数据契约与纯函数。
 * 对齐 PRD/Agent_压力训练MVP讨论/压力测试引擎_商业假设构建器版.md
 */

/**
 * @typedef {'ideating'|'questioning'|'completed'} HypothesisSessionStatus
 */

/**
 * @typedef {Object} HypothesisQuestion
 * @property {number} questionIndex — 1..2
 * @property {string} questionText
 * @property {string} [answerText]
 * @property {number} [answeredAt]
 */

/**
 * @typedef {Object} HypothesisRound
 * @property {number} roundIndex — 1..4
 * @property {string} roundName
 * @property {HypothesisQuestion[]} questions — 每轮 2 问
 * @property {boolean} isCompleted
 */

/**
 * @typedef {Object} BusinessCanvasSection
 * @property {string} targetUser
 * @property {string} scenario
 * @property {string} painPoint
 */

/**
 * @typedef {Object} SolutionSection
 * @property {string} coreFunction
 * @property {string} differentiation
 * @property {string} usageFlow
 */

/**
 * @typedef {Object} BusinessModelSection
 * @property {string} pricing
 * @property {string} acquisition
 * @property {string} revenuePrediction
 */

/**
 * @typedef {Object} VerificationItem
 * @property {string} assumption
 * @property {string} method
 * @property {string} timeline
 * @property {string} successCriterion
 */

/**
 * @typedef {Object} BusinessCanvas
 * @property {BusinessCanvasSection} userHypothesis
 * @property {SolutionSection} solutionHypothesis
 * @property {BusinessModelSection} businessModelHypothesis
 * @property {{ p0: VerificationItem, p1: VerificationItem, p2: VerificationItem }} verificationPlan
 * @property {string} nextAction — 本周最高优先级行动
 * @property {string} rawMarkdown — AI 返回的原始 Markdown 文本
 */

/**
 * @typedef {Object} HypothesisSession
 * @property {string} id
 * @property {string} name
 * @property {number} createdAt
 * @property {number} updatedAt
 * @property {string} originalIdea
 * @property {HypothesisRound[]} rounds — 4 轮 × 2 问
 * @property {BusinessCanvas|null} canvas
 * @property {HypothesisSessionStatus} status
 * @property {string} [promptsVersion]
 */

export const ROUND_META = Object.freeze([
  { roundIndex: 1, roundName: '用户与痛点' },
  { roundIndex: 2, roundName: '解决方案' },
  { roundIndex: 3, roundName: '商业模式' },
  { roundIndex: 4, roundName: '验证计划' },
])

/**
 * @returns {HypothesisRound[]}
 */
export function createEmptyRounds() {
  return ROUND_META.map((meta) => ({
    roundIndex: meta.roundIndex,
    roundName: meta.roundName,
    isCompleted: false,
    questions: [1, 2].map((i) => ({
      questionIndex: i,
      questionText: '',
      answerText: '',
    })),
  }))
}

/**
 * @param {HypothesisSession} session
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
 * @param {HypothesisSession} session
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
 * @param {HypothesisSession} session
 * @returns {boolean}
 */
export function allQuestionsAnswered(session) {
  return findAwaitingAnswerSlot(session) === null && findNextEmptyQuestionSlot(session) === null
}

/**
 * 收集会话中所有已回答的 QA 对，用于画布生成 Prompt 的上下文。
 * @param {HypothesisSession} session
 * @returns {{ round: number, question: string, answer: string }[]}
 */
export function collectAllAnswers(session) {
  const out = []
  for (const r of session.rounds) {
    for (const q of r.questions) {
      if (q.questionText && q.answerText) {
        out.push({ round: r.roundIndex, question: q.questionText, answer: q.answerText })
      }
    }
  }
  return out
}

/**
 * 收集所有已生成的问题文本（用于质检去重）。
 * @param {HypothesisSession} session
 * @returns {string[]}
 */
export function collectAllQuestionTexts(session) {
  const out = []
  for (const r of session.rounds) {
    for (const q of r.questions) {
      if (q.questionText) out.push(q.questionText)
    }
  }
  return out
}
