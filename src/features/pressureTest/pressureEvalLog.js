import { STORAGE_KEYS } from '../../config/storageKeys.js'
import { PRESSURE_TEST_PROMPTS_VERSION, PRESSURE_LAYER2_SAMPLE_RATE } from '../../config/pressureTestPrompts.js'

const MAX_ENTRIES = 200

/**
 * 测试环境不写 Layer2 抽检，避免随机性影响断言
 */
function allowLayer2Sampling() {
  return typeof import.meta !== 'undefined' && import.meta.env?.MODE !== 'test'
}

/**
 * 追加一条压力引擎评测/运维日志（环形缓冲，仅存本机）
 * @param {object} record
 * @param {string} record.type — 如 layer1_qc | layer2_sample | blind_spot_report
 */
export function appendPressureEvalRecord(record) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRESSURE_ENGINE_EVAL_LOG)
    let arr = []
    if (raw) {
      const p = JSON.parse(raw)
      arr = Array.isArray(p) ? p : []
    }
    arr.push({
      ts: Date.now(),
      promptsVersion: PRESSURE_TEST_PROMPTS_VERSION,
      ...record,
    })
    if (arr.length > MAX_ENTRIES) arr = arr.slice(-MAX_ENTRIES)
    localStorage.setItem(STORAGE_KEYS.PRESSURE_ENGINE_EVAL_LOG, JSON.stringify(arr))
  } catch {
    /* ignore */
  }
}

/**
 * @returns {object[]}
 */
export function readPressureEvalLog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRESSURE_ENGINE_EVAL_LOG)
    const p = raw ? JSON.parse(raw) : []
    return Array.isArray(p) ? p : []
  } catch {
    return []
  }
}

/**
 * PRD 阶段 6 Layer2：异步抽检占位（不阻塞、不调模型）
 * @param {object} payload
 * @param {string} payload.sessionId
 * @param {number} payload.roundIdx
 * @param {number} payload.qIdx
 */
export function maybeAppendLayer2SampleRecord(payload) {
  if (!allowLayer2Sampling()) return
  if (typeof window === 'undefined') return
  if (Math.random() >= PRESSURE_LAYER2_SAMPLE_RATE) return
  appendPressureEvalRecord({
    ...payload,
    type: 'layer2_sample',
    layer2Status: 'stub_no_model',
    note: '占位：未调用评测模型；可替换为队列/离线打分',
  })
}
