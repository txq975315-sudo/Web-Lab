/**
 * 成长教练 · 本地技能进度（P0：雷达维度增量 + 模板练习次数）
 * 键名须列入 labDataSync LAB_LOCAL_STORAGE_KEYS
 */

import { METHODOLOGY_ORDER } from '../config/methodology'

import { STORAGE_KEYS } from '../config/storageKeys.js'

export const GROWTH_SKILL_STORAGE_KEY = STORAGE_KEYS.GROWTH_SKILL_PROGRESS

function defaultDimensions() {
  const o = {}
  for (const id of METHODOLOGY_ORDER) {
    o[id] = 0
  }
  return o
}

export function getDefaultSkillProgress() {
  return {
    version: 1,
    dimensions: defaultDimensions(),
    /** @type {Record<string, { attempts: number, lastOverall?: number, lastAt?: string }>} */
    byTemplate: {}
  }
}

export function loadSkillProgress() {
  try {
    const raw = localStorage.getItem(GROWTH_SKILL_STORAGE_KEY)
    if (!raw) return getDefaultSkillProgress()
    const data = JSON.parse(raw)
    const merged = getDefaultSkillProgress()
    merged.dimensions = { ...merged.dimensions, ...(data.dimensions || {}) }
    merged.byTemplate = { ...(data.byTemplate || {}) }
    return merged
  } catch {
    return getDefaultSkillProgress()
  }
}

export function saveSkillProgress(progress) {
  try {
    localStorage.setItem(GROWTH_SKILL_STORAGE_KEY, JSON.stringify(progress))
  } catch (e) {
    console.error('[growthCoachStore]', e)
  }
}

/**
 * 完成一轮练习后记分：方法论维度 +1（满分感知）、模板统计
 * @param {object} [options]
 * @param {5|10} [options.maxScore=10] — 总分制；达到满分的 60% 才给方法论维度加分（5 分制时即 ≥3，10 分制时即 ≥6）
 */
export function recordCoachSession(templateKey, methodologyId, overallScore, options = {}) {
  const maxScore = options.maxScore === 5 ? 5 : 10
  const score = Number(overallScore) || 0
  const passThreshold = maxScore * 0.6
  const p = loadSkillProgress()
  const prev = p.byTemplate[templateKey] || { attempts: 0 }
  p.byTemplate[templateKey] = {
    attempts: prev.attempts + 1,
    lastOverall: score,
    lastAt: new Date().toISOString()
  }
  if (methodologyId && p.dimensions[methodologyId] != null && score >= passThreshold) {
    p.dimensions[methodologyId] = Math.min(100, (p.dimensions[methodologyId] || 0) + 4)
  }
  saveSkillProgress(p)
  return p
}

export function getTemplateAttempts(templateKey) {
  const p = loadSkillProgress()
  return p.byTemplate[templateKey]?.attempts ?? 0
}
