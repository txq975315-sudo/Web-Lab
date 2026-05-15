import { STORAGE_KEYS } from '../../config/storageKeys.js'
import { HYPOTHESIS_PROMPTS_VERSION, HYPOTHESIS_LAYER2_SAMPLE_RATE } from '../../config/businessHypothesisPrompts.js'

const MAX_ENTRIES = 200

function allowLayer2Sampling() {
  return typeof import.meta !== 'undefined' && import.meta.env?.MODE !== 'test'
}

/**
 * 追加一条假设构建器评测日志（环形缓冲）
 * @param {object} record
 * @param {string} record.type
 */
export function appendHypothesisEvalRecord(record) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HYPOTHESIS_ENGINE_EVAL_LOG)
    let arr = []
    if (raw) {
      const p = JSON.parse(raw)
      arr = Array.isArray(p) ? p : []
    }
    arr.push({
      ts: Date.now(),
      promptsVersion: HYPOTHESIS_PROMPTS_VERSION,
      ...record,
    })
    if (arr.length > MAX_ENTRIES) arr = arr.slice(-MAX_ENTRIES)
    localStorage.setItem(STORAGE_KEYS.HYPOTHESIS_ENGINE_EVAL_LOG, JSON.stringify(arr))
  } catch {
    /* ignore */
  }
}

/**
 * @returns {object[]}
 */
export function readHypothesisEvalLog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HYPOTHESIS_ENGINE_EVAL_LOG)
    const p = raw ? JSON.parse(raw) : []
    return Array.isArray(p) ? p : []
  } catch {
    return []
  }
}

/**
 * Layer2 异步抽检占位
 * @param {object} payload
 * @param {string} payload.sessionId
 * @param {number} payload.roundIdx
 * @param {number} payload.qIdx
 */
export function maybeAppendLayer2SampleRecord(payload) {
  if (!allowLayer2Sampling()) return
  if (typeof window === 'undefined') return
  if (Math.random() >= HYPOTHESIS_LAYER2_SAMPLE_RATE) return
  appendHypothesisEvalRecord({
    ...payload,
    type: 'layer2_sample',
    layer2Status: 'stub_no_model',
    note: '占位：未调用评测模型；可替换为队列/离线打分',
  })
}
