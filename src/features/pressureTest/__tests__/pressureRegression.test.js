import { describe, it, expect, beforeEach } from 'vitest'
import { extractJsonObject } from '../pressureApi.js'
import { evaluateQuestionAuto, hasForbiddenWords, looksLikeQuestion } from '../pressureQuestionQC.js'
import { validateDeconstruction, getDefaultDeconstruction } from '../pressureTypes.js'
import { appendPressureEvalRecord, readPressureEvalLog } from '../pressureEvalLog.js'
import { STORAGE_KEYS } from '../../../config/storageKeys.js'
import { PRESSURE_PROMPT_CHANGELOG, PRESSURE_TEST_PROMPTS_VERSION } from '../../../config/pressureTestPrompts.js'

describe('extractJsonObject', () => {
  it('parses raw JSON object', () => {
    expect(extractJsonObject('{"a":1}')).toEqual({ a: 1 })
  })

  it('parses fenced json', () => {
    const t = 'Here\n```json\n{"q":"hello?","blindSpotMarker":null}\n```'
    const o = extractJsonObject(t)
    expect(o?.q).toBe('hello?')
  })
})

describe('evaluateQuestionAuto', () => {
  it('fails forbidden praise', () => {
    const r = evaluateQuestionAuto({
      question: '这个想法很好，请问你的用户到底是谁？',
      userLastAnswer: '我想做番茄钟',
      previousQuestions: [],
      roundIndex: 1,
    })
    expect(r.passed).toBe(false)
    expect(r.failedChecks).toContain('forbidden')
  })

  it('passes strict plausible question with reference', () => {
    const prev = '我想做大学生兼职匹配'
    const q =
      '你说「大学生兼职匹配」——平台如何避免双边冷启动时刷单假需求？如果学校已有微信群在撮合，你的增量价值是什么？'
    const r = evaluateQuestionAuto({
      question: q,
      userLastAnswer: prev,
      previousQuestions: [],
      roundIndex: 1,
    })
    expect(r.passed).toBe(true)
  })
})

describe('validateDeconstruction', () => {
  it('accepts getDefaultDeconstruction', () => {
    expect(validateDeconstruction(getDefaultDeconstruction('x'))).toBe(true)
  })

  it('rejects empty', () => {
    expect(validateDeconstruction(null)).toBe(false)
  })
})

describe('pressureEvalLog', () => {
  beforeEach(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.PRESSURE_ENGINE_EVAL_LOG)
    } catch {
      /* ignore */
    }
  })

  it('appends and reads with promptsVersion', () => {
    appendPressureEvalRecord({ type: 'layer1_qc', sessionId: 's1', strictLayer1Passed: true })
    const rows = readPressureEvalLog()
    expect(rows.length).toBe(1)
    expect(rows[0].promptsVersion).toBe(PRESSURE_TEST_PROMPTS_VERSION)
    expect(rows[0].type).toBe('layer1_qc')
  })
})

describe('PRESSURE_PROMPT_CHANGELOG', () => {
  it('has monotonic version entries for traceability', () => {
    expect(PRESSURE_PROMPT_CHANGELOG.length).toBeGreaterThanOrEqual(1)
    expect(PRESSURE_PROMPT_CHANGELOG[0].version).toBe(PRESSURE_TEST_PROMPTS_VERSION)
  })
})

describe('looksLikeQuestion / hasForbiddenWords', () => {
  it('detects question shape', () => {
    expect(looksLikeQuestion('你是谁')).toBe(false)
    expect(looksLikeQuestion('你的目标用户是谁？')).toBe(true)
  })

  it('flags forbidden', () => {
    expect(hasForbiddenWords('很棒的想法')).toBe(true)
  })
})
