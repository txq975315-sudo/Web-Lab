import { STORAGE_KEYS } from '../../config/storageKeys.js'
import { HYPOTHESIS_PROMPTS_VERSION } from '../../config/businessHypothesisPrompts.js'
import { createEmptyRounds } from './hypothesisTypes.js'

const BUCKET_VERSION = 1

/**
 * @typedef {{ version: number, items: import('./hypothesisTypes.js').HypothesisSession[] }} HypothesisSessionBucket
 */

function readBucket() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HYPOTHESIS_ENGINE_SESSIONS)
    if (!raw) return { version: BUCKET_VERSION, items: [] }
    const data = JSON.parse(raw)
    if (!data || data.version !== BUCKET_VERSION || !Array.isArray(data.items)) {
      return { version: BUCKET_VERSION, items: [] }
    }
    return /** @type {HypothesisSessionBucket} */ (data)
  } catch {
    return { version: BUCKET_VERSION, items: [] }
  }
}

function writeBucket(bucket) {
  localStorage.setItem(STORAGE_KEYS.HYPOTHESIS_ENGINE_SESSIONS, JSON.stringify(bucket))
  try {
    window.dispatchEvent(new CustomEvent('thinking-lab-hypothesis-sessions-changed'))
  } catch {
    /* ignore */
  }
}

/**
 * @param {string} idea
 * @returns {string} session id
 */
export function createHypothesisSession(idea) {
  const trimmed = idea.trim()
  const id = `hs_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  /** @type {import('./hypothesisTypes.js').HypothesisSession} */
  const session = {
    id,
    name: trimmed.length > 28 ? `${trimmed.slice(0, 28)}…` : trimmed || '未命名会话',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    originalIdea: trimmed,
    rounds: createEmptyRounds(),
    canvas: null,
    status: 'ideating',
    promptsVersion: HYPOTHESIS_PROMPTS_VERSION,
  }
  const bucket = readBucket()
  bucket.items.unshift(session)
  writeBucket(bucket)
  return id
}

/**
 * @param {string} id
 * @returns {import('./hypothesisTypes.js').HypothesisSession|null}
 */
export function getHypothesisSession(id) {
  const bucket = readBucket()
  return bucket.items.find((s) => s.id === id) ?? null
}

/**
 * @param {import('./hypothesisTypes.js').HypothesisSession} session
 */
export function saveHypothesisSession(session) {
  const bucket = readBucket()
  const idx = bucket.items.findIndex((s) => s.id === session.id)
  const next = { ...session, updatedAt: Date.now() }
  if (idx === -1) bucket.items.unshift(next)
  else bucket.items[idx] = next
  writeBucket(bucket)
}

/**
 * @param {string} id
 */
export function deleteHypothesisSession(id) {
  const bucket = readBucket()
  bucket.items = bucket.items.filter((s) => s.id !== id)
  writeBucket(bucket)
}

/**
 * @returns {import('./hypothesisTypes.js').HypothesisSession[]}
 */
export function listHypothesisSessions() {
  return readBucket().items
}
