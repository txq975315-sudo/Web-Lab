import { chatComplete } from '../../utils/aiApi.js'
import {
  PRESSURE_SYSTEM_PROMPT,
  INITIAL_DECONSTRUCT_USER,
  buildIncrementalUpdateUser,
  buildQuestionGenerationUserPrompt,
  buildQuestionRetryUserPrompt,
  buildBlindSpotReportUser,
} from '../../config/pressureTestPrompts.js'
import {
  validateDeconstruction,
  getDefaultDeconstruction,
  getVerdictFromMarkers,
  accumulateBlindSpotMarkers,
  allQuestionsAnswered,
  findAwaitingAnswerSlot,
} from './pressureTypes.js'
import { getPressureSession, savePressureSession, applyDeconstructionOrDefault } from './pressureSessionStore.js'
import {
  evaluateQuestionAuto,
  buildRetryHint,
  templateFallbackQuestion,
} from './pressureQuestionQC.js'
import { augmentSystemPromptWithTerminology } from '../../utils/aiTerminologyPreference.js'
import { appendPressureEvalRecord, maybeAppendLayer2SampleRecord } from './pressureEvalLog.js'

function pressureSystemPrompt() {
  return augmentSystemPromptWithTerminology(PRESSURE_SYSTEM_PROMPT)
}

/**
 * @param {string} text
 * @returns {object|null}
 */
export function extractJsonObject(text) {
  if (!text || typeof text !== 'string') return null
  const trimmed = text.trim()
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fence ? fence[1].trim() : trimmed
  const start = candidate.indexOf('{')
  if (start === -1) return null
  let depth = 0
  for (let i = start; i < candidate.length; i++) {
    const c = candidate[i]
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) {
        const slice = candidate.slice(start, i + 1)
        try {
          return JSON.parse(slice)
        } catch {
          return null
        }
      }
    }
  }
  return null
}

/**
 * @param {import('./pressureTypes.js').PressureSession} session
 * @param {number} roundIdx
 * @param {number} qIdx
 */
function computePromptContext(session, roundIdx, qIdx) {
  const priorFlat = []
  for (let r = 0; r < session.rounds.length; r++) {
    const limit = r < roundIdx ? 3 : qIdx
    for (let q = 0; q < limit; q++) {
      const it = session.rounds[r].questions[q]
      if (it.questionText && it.answerText) {
        priorFlat.push({
          round: r + 1,
          question: it.questionText,
          answer: it.answerText,
        })
      }
    }
    if (r >= roundIdx) break
  }

  const currentRoundQA = []
  for (let q = 0; q < qIdx; q++) {
    const it = session.rounds[roundIdx].questions[q]
    currentRoundQA.push({
      question: it.questionText,
      answer: it.answerText,
    })
  }

  return { priorFlat, currentRoundQA }
}

/**
 * @param {import('./pressureTypes.js').PressureSession} session
 * @param {number} roundIdx
 * @param {number} qIdx
 */
function collectPriorTranscriptMessages(session, roundIdx, qIdx) {
  /** @type {{role:string,content:string}[]} */
  const msgs = []
  for (let r = 0; r < session.rounds.length; r++) {
    const limit = r < roundIdx ? 3 : r === roundIdx ? qIdx : 0
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
 * @param {import('./pressureTypes.js').PressureSession} session
 */
function collectAllQuestionTexts(session) {
  const out = []
  for (const r of session.rounds) {
    for (const it of r.questions) {
      if (it.questionText) out.push(it.questionText)
    }
  }
  return out
}

/**
 * @param {import('./pressureTypes.js').PressureSession} session
 * @param {number} roundIdx
 * @param {number} qIdx
 */
function getUserLastAnswerForQC(session, roundIdx, qIdx) {
  if (qIdx > 0) {
    return session.rounds[roundIdx].questions[qIdx - 1].answerText || ''
  }
  if (roundIdx > 0) {
    const prev = session.rounds[roundIdx - 1].questions[2]
    return prev.answerText || ''
  }
  return ''
}

/**
 * @param {string} sessionId
 * @returns {Promise<import('./pressureTypes.js').IdeaDeconstruction>}
 */
export async function runInitialDeconstruction(sessionId) {
  const session = getPressureSession(sessionId)
  if (!session) throw new Error('会话不存在')

  const tryOnce = async () => {
    const raw = await chatComplete([
      { role: 'system', content: pressureSystemPrompt() },
      { role: 'user', content: `${INITIAL_DECONSTRUCT_USER}${session.originalIdea}` },
    ])
    return extractJsonObject(raw)
  }

  let parsed = await tryOnce()
  if (!parsed || !validateDeconstruction(parsed)) {
    parsed = await tryOnce()
  }
  if (!parsed || !validateDeconstruction(parsed)) {
    parsed = getDefaultDeconstruction(session.originalIdea)
  }

  applyDeconstructionOrDefault(sessionId, /** @type {import('./pressureTypes.js').IdeaDeconstruction} */ (parsed))
  const s2 = getPressureSession(sessionId)
  if (!s2?.deconstruction) throw new Error('拆解失败')
  return s2.deconstruction
}

/**
 * @param {string} sessionId
 * @param {number} roundIdx 0..2
 */
export async function runIncrementalUpdateAfterRound(sessionId, roundIdx) {
  const session = getPressureSession(sessionId)
  if (!session || !session.deconstruction) return

  const round = session.rounds[roundIdx]
  const qaBlock = round.questions
    .map((it, i) => `Q${i + 1}: ${it.questionText} / A${i + 1}: ${it.answerText}`)
    .join('\n')

  const currentJson = JSON.stringify(session.deconstruction)
  const userContent = buildIncrementalUpdateUser(currentJson, qaBlock)

  const tryOnce = async () => {
    const raw = await chatComplete([
      { role: 'system', content: pressureSystemPrompt() },
      { role: 'user', content: userContent },
    ])
    return extractJsonObject(raw)
  }

  let parsed = await tryOnce()
  if (!parsed || !validateDeconstruction(parsed)) {
    parsed = await tryOnce()
  }
  if (!parsed || !validateDeconstruction(parsed)) {
    return
  }

  session.deconstruction = /** @type {import('./pressureTypes.js').IdeaDeconstruction} */ (parsed)
  round.isCompleted = true
  savePressureSession(session)
}

/**
 * @param {string} sessionId
 * @param {number} roundIdx
 * @param {number} qIdx
 */
export async function generateQuestionForSlot(sessionId, roundIdx, qIdx) {
  const session = getPressureSession(sessionId)
  if (!session || !session.deconstruction) throw new Error('会话未就绪')

  const { priorFlat, currentRoundQA } = computePromptContext(session, roundIdx, qIdx)
  const baseUser = buildQuestionGenerationUserPrompt({
    deconstruction: session.deconstruction,
    originalIdea: session.originalIdea,
    round: roundIdx + 1,
    question: qIdx + 1,
    currentRoundQA,
    priorFlat,
  })

  const transcript = collectPriorTranscriptMessages(session, roundIdx, qIdx)
  const baseMessages = [
    { role: 'system', content: pressureSystemPrompt() },
    { role: 'user', content: session.originalIdea },
    { role: 'assistant', content: JSON.stringify(session.deconstruction) },
    ...transcript,
    { role: 'user', content: baseUser },
  ]

  const previousQuestions = collectAllQuestionTexts(session)
  const userLast = getUserLastAnswerForQC(session, roundIdx, qIdx)

  const parseQuestionPayload = (raw) => {
    const obj = extractJsonObject(raw)
    if (!obj || typeof obj.question !== 'string') return null
    const marker =
      obj.blindSpotMarker &&
      typeof obj.blindSpotMarker === 'object' &&
      obj.blindSpotMarker.dimension
        ? {
            dimension: String(obj.blindSpotMarker.dimension),
            description: String(obj.blindSpotMarker.description || ''),
            severity:
              obj.blindSpotMarker.severity === 'high' ||
              obj.blindSpotMarker.severity === 'medium' ||
              obj.blindSpotMarker.severity === 'low'
                ? obj.blindSpotMarker.severity
                : 'medium',
          }
        : null
    return { question: obj.question.trim(), blindSpotMarker: marker }
  }

  const runAndValidate = async (messages) => {
    const raw = await chatComplete(messages)
    return parseQuestionPayload(raw)
  }

  let payload = await runAndValidate(baseMessages)
  let qc = payload
    ? evaluateQuestionAuto({
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
      { role: 'system', content: pressureSystemPrompt() },
      { role: 'user', content: session.originalIdea },
      { role: 'assistant', content: JSON.stringify(session.deconstruction) },
      ...transcript,
      { role: 'user', content: retryUser },
    ]
    payload = await runAndValidate(retryMessages)
    qc = payload
      ? evaluateQuestionAuto({
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
    payload = { question: fallback, blindSpotMarker: null }
  }

  session.rounds[roundIdx].questions[qIdx].questionText = payload.question
  session.rounds[roundIdx].questions[qIdx].blindSpotMarker = payload.blindSpotMarker
  if (payload.blindSpotMarker) {
    session.blindSpotMarkers = accumulateBlindSpotMarkers(session.blindSpotMarkers, payload.blindSpotMarker)
  }
  savePressureSession(session)

  appendPressureEvalRecord({
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
 * @param {string} sessionId
 */
export async function runBlindSpotReport(sessionId) {
  const session = getPressureSession(sessionId)
  if (!session || !session.deconstruction) return

  const finalJson = JSON.stringify(session.deconstruction)
  const markersJson = JSON.stringify(session.blindSpotMarkers)

  const raw = await chatComplete([
    { role: 'system', content: pressureSystemPrompt() },
    {
      role: 'user',
      content: buildBlindSpotReportUser(finalJson, markersJson),
    },
  ])

  let report = extractJsonObject(raw)
  const codeVerdict = getVerdictFromMarkers(session.blindSpotMarkers)
  const reportFromModel = !!(report && typeof report === 'object')

  if (!report || typeof report !== 'object') {
    report = {
      deconstructionSnapshot: [],
      blindSpots: session.blindSpotMarkers.map((m) => ({
        dimension: m.dimension,
        description: m.description,
        severity: m.severity,
        suggestion: '结合业务做一次验证或访谈',
      })),
      verdict: codeVerdict,
      verdictText:
        codeVerdict === 'needs_rethink'
          ? '关键维度存在未验证假设，建议补强后再评估。'
          : '核心逻辑相对通顺，仍有优化空间，建议针对盲区持续迭代。',
      totalHigh: session.blindSpotMarkers.filter((x) => x.severity === 'high').length,
      totalMedium: session.blindSpotMarkers.filter((x) => x.severity === 'medium').length,
      totalLow: session.blindSpotMarkers.filter((x) => x.severity === 'low').length,
    }
  } else {
    report.verdict = codeVerdict
  }

  session.blindSpotReport = /** @type {import('./pressureTypes.js').BlindSpotReport} */ (report)
  session.status = 'completed'
  savePressureSession(session)

  appendPressureEvalRecord({
    type: 'blind_spot_report',
    sessionId,
    reportFromModel,
    verdict: session.blindSpotReport.verdict,
  })
}

/**
 * 首次进入会话：拆解 + 生成第 1 问
 * @param {string} sessionId
 */
export async function bootstrapPressureSession(sessionId) {
  await runInitialDeconstruction(sessionId)
  await generateQuestionForSlot(sessionId, 0, 0)
}

/**
 * 写入用户回答并推进：生成下一问或增量更新或报告
 * @param {string} sessionId
 * @param {string} answerText
 */
export async function submitPressureAnswer(sessionId, answerText) {
  const session = getPressureSession(sessionId)
  if (!session) throw new Error('会话不存在')

  const awaiting = findAwaitingAnswerSlot(session)
  if (!awaiting) throw new Error('没有待答问题')

  const { roundIdx, qIdx } = awaiting
  const prev = session.rounds[roundIdx].questions[qIdx]
  if (!prev.questionText) throw new Error('问题尚未生成')

  prev.answerText = answerText.trim()
  prev.answeredAt = Date.now()
  savePressureSession(session)

  const s2 = getPressureSession(sessionId)
  if (!s2) return

  if (qIdx < 2) {
    await generateQuestionForSlot(sessionId, roundIdx, qIdx + 1)
    return
  }

  await runIncrementalUpdateAfterRound(sessionId, roundIdx)

  if (roundIdx < 2) {
    await generateQuestionForSlot(sessionId, roundIdx + 1, 0)
    return
  }

  const s3 = getPressureSession(sessionId)
  if (s3 && allQuestionsAnswered(s3)) {
    await runBlindSpotReport(sessionId)
  }
}
