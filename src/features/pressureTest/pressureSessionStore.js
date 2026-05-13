import { STORAGE_KEYS } from '../../config/storageKeys.js'
import { createEmptyRounds, getDefaultDeconstruction, validateDeconstruction } from './pressureTypes.js'

const BUCKET_VERSION = 1

/**
 * @typedef {{ version: number, items: import('./pressureTypes.js').PressureSession[] }} PressureSessionBucket
 */

function readBucket() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRESSURE_ENGINE_SESSIONS)
    if (!raw) return { version: BUCKET_VERSION, items: [] }
    const data = JSON.parse(raw)
    if (!data || data.version !== BUCKET_VERSION || !Array.isArray(data.items)) {
      return { version: BUCKET_VERSION, items: [] }
    }
    return /** @type {PressureSessionBucket} */ (data)
  } catch {
    return { version: BUCKET_VERSION, items: [] }
  }
}

function writeBucket(bucket) {
  localStorage.setItem(STORAGE_KEYS.PRESSURE_ENGINE_SESSIONS, JSON.stringify(bucket))
  try {
    window.dispatchEvent(new CustomEvent('thinking-lab-pressure-sessions-changed'))
  } catch {
    /* ignore */
  }
}

/**
 * @param {string} idea
 * @returns {string} session id
 */
export function createPressureSession(idea) {
  const trimmed = idea.trim()
  const id = `ps_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  /** @type {import('./pressureTypes.js').PressureSession} */
  const session = {
    id,
    name: trimmed.length > 28 ? `${trimmed.slice(0, 28)}…` : trimmed || '未命名会话',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    originalIdea: trimmed,
    deconstruction: null,
    rounds: createEmptyRounds(),
    blindSpotMarkers: [],
    blindSpotReport: null,
    status: 'deconstructing',
  }
  const bucket = readBucket()
  bucket.items.unshift(session)
  writeBucket(bucket)
  return id
}

/**
 * @param {string} id
 * @returns {import('./pressureTypes.js').PressureSession|null}
 */
export function getPressureSession(id) {
  const bucket = readBucket()
  return bucket.items.find((s) => s.id === id) ?? null
}

/**
 * @param {import('./pressureTypes.js').PressureSession} session
 */
export function savePressureSession(session) {
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
export function deletePressureSession(id) {
  const bucket = readBucket()
  bucket.items = bucket.items.filter((s) => s.id !== id)
  writeBucket(bucket)
}

/**
 * @returns {import('./pressureTypes.js').PressureSession[]}
 */
export function listPressureSessions() {
  return readBucket().items
}

/**
 * @param {string} id
 * @param {import('./pressureTypes.js').IdeaDeconstruction|null} dec
 */
export function applyDeconstructionOrDefault(id, dec) {
  const session = getPressureSession(id)
  if (!session) return
  const ok = dec && validateDeconstruction(dec)
  session.deconstruction = ok
    ? /** @type {import('./pressureTypes.js').IdeaDeconstruction} */ (dec)
    : getDefaultDeconstruction(session.originalIdea)
  session.status = 'questioning'
  savePressureSession(session)
}
