/**
 * 商业假设构建器 — AI API 管线
 *
 * 与压力测试 API 的不同：
 * - 无初始 AI 拆解步骤（直接进入 R1Q1）
 * - 8 问生成（4轮x2问）
 * - 画布生成代替盲区报告
 */
import { chatComplete } from '../../utils/aiApi.js'
import {
  HYPOTHESIS_SYSTEM_PROMPT,
  buildQuestionGenerationUserPrompt,
  buildQuestionRetryUserPrompt,
  buildCanvasGenerationUserPrompt,
  FALLBACK_QUESTIONS,
} from '../../config/businessHypothesisPrompts.js'
import {
  allQuestionsAnswered,
  findAwaitingAnswerSlot,
  collectAllAnswers,
  collectAllQuestionTexts,
} from './hypothesisTypes.js'
import { getHypothesisSession, saveHypothesisSession } from './hypothesisStore.js'
import {
  evaluateHypothesisQuestion,
  buildRetryHint,
  templateFallbackQuestion,
} from './hypothesisQC.js'
import { augmentSystemPromptWithTerminology } from '../../utils/aiTerminologyPreference.js'
import { appendHypothesisEvalRecord, maybeAppendLayer2SampleRecord } from './hypothesisEvalLog.js'

function hypothesisSystemPrompt() {
  return augmentSystemPromptWithTerminology(HYPOTHESIS_SYSTEM_PROMPT)
}

/**
 * 收集当前会话中的先前问答转录，用于 messages 链
 * @param {import('./hypothesisTypes.js').HypothesisSession} session
 * @param {number} roundIdx 0..3
 * @param {number} qIdx 0..1
 * @returns {{role:string,content:string}[]}
 */
function collectPriorTranscriptMessages(session, roundIdx, qIdx) {
  const msgs = []
  for (let r = 0; r < session.rounds.length; r++) {
    const limit = r < roundIdx ? 2 : r === roundIdx ? qIdx : 0
    for (let q = 0; q < limit; q++) {
      const it = session.rounds[r].questions[q]
      if (it.questionText && it.answerText) {
        msgs.push({ role: 'assistant', content: it.questionText })
        msgs.push({ role: 'user', content: it.answerText })
      }
    }
    if (r >= roundIdx) break
  }
  return msgs
}

/**
 * 获取用户上一个回答（用于质检引用检查）
 */
function getUserLastAnswerForQC(session, roundIdx, qIdx) {
  if (qIdx > 0) {
    return session.rounds[roundIdx].questions[qIdx - 1].answerText || ''
  }
  if (roundIdx > 0) {
    const prev = session.rounds[roundIdx - 1].questions[1]
    return prev.answerText || ''
  }
  return ''
}

/**
 * 生成单个追问（第 round 轮第 question 问）
 * @param {string} sessionId
 * @param {number} roundIdx 0..3
 * @param {number} qIdx 0..1
 */
export async function generateHypothesisQuestion(sessionId, roundIdx, qIdx) {
  const session = getHypothesisSession(sessionId)
  if (!session) throw new Error('会话不存在')

  const baseUser = buildQuestionGenerationUserPrompt(roundIdx + 1, qIdx + 1, {
    originalIdea: session.originalIdea,
  })

  const transcript = collectPriorTranscriptMessages(session, roundIdx, qIdx)
  const baseMessages = [
    { role: 'system', content: hypothesisSystemPrompt() },
    { role: 'user', content: session.originalIdea },
    ...transcript,
    { role: 'user', content: baseUser },
  ]

  const previousQuestions = collectAllQuestionTexts(session)
  const userLast = getUserLastAnswerForQC(session, roundIdx, qIdx)

  const runAndValidate = async (messages) => {
    const raw = await chatComplete(messages)
    const text = (raw || '').trim()
    return { question: text }
  }

  let payload = await runAndValidate(baseMessages)
  let qc = payload
    ? evaluateHypothesisQuestion({
        question: payload.question,
        userLastAnswer: userLast,
        previousQuestions,
        roundIndex: roundIdx + 1,
      })
    : { passed: false, failedChecks: ['parse'] }

  if (!qc.passed && payload) {
    const hint = buildRetryHint(qc.failedChecks)
    const retryUser = buildQuestionRetryUserPrompt(baseUser, hint)
    const retryMessages = [
      { role: 'system', content: hypothesisSystemPrompt() },
      { role: 'user', content: session.originalIdea },
      ...transcript,
      { role: 'user', content: retryUser },
    ]
    payload = await runAndValidate(retryMessages)
    qc = payload
      ? evaluateHypothesisQuestion({
          question: payload.question,
          userLastAnswer: userLast,
          previousQuestions,
          roundIndex: roundIdx + 1,
        })
      : { passed: false, failedChecks: ['parse'] }
  }

  const strictLayer1Passed = qc.passed && !!payload
  let usedTemplateFallback = false

  if (!qc.passed || !payload) {
    usedTemplateFallback = true
    const keywordSource = userLast || session.originalIdea
    const fallback = templateFallbackQuestion(roundIdx + 1, keywordSource)
    payload = { question: fallback }
  }

  session.rounds[roundIdx].questions[qIdx].questionText = payload.question
  saveHypothesisSession(session)

  appendHypothesisEvalRecord({
    type: 'layer1_qc',
    sessionId,
    roundIdx,
    qIdx,
    strictLayer1Passed,
    failedChecks: [...qc.failedChecks],
    usedTemplateFallback,
  })
  maybeAppendLayer2SampleRecord({ sessionId, roundIdx, qIdx })
}

/**
 * 生成商业假设画布（8 问全部回答完毕后调用）
 * @param {string} sessionId
 */
export async function runCanvasGeneration(sessionId) {
  const session = getHypothesisSession(sessionId)
  if (!session) return

  const allAnswers = collectAllAnswers(session)
  const answersJson = JSON.stringify(allAnswers)
  const userPrompt = buildCanvasGenerationUserPrompt(answersJson)

  const raw = await chatComplete([
    { role: 'system', content: hypothesisSystemPrompt() },
    { role: 'user', content: userPrompt },
  ])

  const canvasText = (raw || '').trim()

  session.canvas = {
    userHypothesis: { targetUser: '', scenario: '', painPoint: '' },
    solutionHypothesis: { coreFunction: '', differentiation: '', usageFlow: '' },
    businessModelHypothesis: { pricing: '', acquisition: '', revenuePrediction: '' },
    verificationPlan: {
      p0: { assumption: '', method: '', timeline: '', successCriterion: '' },
      p1: { assumption: '', method: '', timeline: '', successCriterion: '' },
      p2: { assumption: '', method: '', timeline: '', successCriterion: '' },
    },
    nextAction: '',
    rawMarkdown: canvasText,
  }
  session.status = 'completed'
  saveHypothesisSession(session)

  appendHypothesisEvalRecord({
    type: 'canvas_generation',
    sessionId,
    canvasLength: canvasText.length,
  })
}

/**
 * 首次进入会话：生成首问
 * @param {string} sessionId
 */
export async function bootstrapHypothesisSession(sessionId) {
  const session = getHypothesisSession(sessionId)
  if (!session) throw new Error('会话不存在')
  session.status = 'questioning'
  saveHypothesisSession(session)
  await generateHypothesisQuestion(sessionId, 0, 0)
}

/**
 * 写入用户回答并推进：生成下一问或画布
 * @param {string} sessionId
 * @param {string} answerText
 */
export async function submitHypothesisAnswer(sessionId, answerText) {
  const session = getHypothesisSession(sessionId)
  if (!session) throw new Error('会话不存在')

  const awaiting = findAwaitingAnswerSlot(session)
  if (!awaiting) throw new Error('没有待答问题')

  const { roundIdx, qIdx } = awaiting
  const prev = session.rounds[roundIdx].questions[qIdx]
  if (!prev.questionText) throw new Error('问题尚未生成')

  prev.answerText = answerText.trim()
  prev.answeredAt = Date.now()
  saveHypothesisSession(session)

  const s2 = getHypothesisSession(sessionId)
  if (!s2) return

  // 本轮还有下一问
  if (qIdx < 1) {
    await generateHypothesisQuestion(sessionId, roundIdx, qIdx + 1)
    return
  }

  // 本轮完成
  s2.rounds[roundIdx].isCompleted = true
  saveHypothesisSession(s2)

  // 还有下一轮
  if (roundIdx < 3) {
    await generateHypothesisQuestion(sessionId, roundIdx + 1, 0)
    return
  }

  // 所有 8 问完成 → 生成画布
  const s3 = getHypothesisSession(sessionId)
  if (s3 && allQuestionsAnswered(s3)) {
    await runCanvasGeneration(sessionId)
  }
}
