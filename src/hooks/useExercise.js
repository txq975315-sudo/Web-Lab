import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  COMPETITIVE_L5_FIELD_ORDER,
  getHintsForField,
} from '../config/hintLevels'

function emptyAnswers() {
  return Object.fromEntries(COMPETITIVE_L5_FIELD_ORDER.map((k) => [k, '']))
}

function emptyHintsUsed() {
  return Object.fromEntries(COMPETITIVE_L5_FIELD_ORDER.map((k) => [k, 0]))
}

export function growthCoachL5StorageKey(projectId) {
  return `thinking-lab-growth-l5-draft-${projectId || 'default'}`
}

/**
 * L5 竞品练习：逐字段状态、渐进提示次数、sessionStorage 草稿
 * @param {object} opts
 * @param {string} opts.storageKey — sessionStorage 键
 * @param {string} opts.scenarioKey — 场景变化时重置/匹配草稿（用完整 scenario 字符串即可）
 * @param {Record<string, string>} opts.initialAnswers — AI 预填或与父状态同步的初值
 * @param {number} [opts.maxHintsPerField=3]
 */
export function useExercise({ storageKey, scenarioKey, initialAnswers, maxHintsPerField = 3 }) {
  const initialRef = useRef(initialAnswers)
  initialRef.current = initialAnswers

  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState(() => ({
    ...emptyAnswers(),
    ...initialAnswers,
  }))
  const [hintCounts, setHintCounts] = useState(emptyHintsUsed)
  const [draftSavedAt, setDraftSavedAt] = useState(null)

  const currentKey = COMPETITIVE_L5_FIELD_ORDER[index] ?? COMPETITIVE_L5_FIELD_ORDER[0]

  const persist = useCallback(() => {
    if (typeof sessionStorage === 'undefined') return
    const sk = (scenarioKey || '').trim()
    if (!sk) return
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          scenarioKey: sk,
          answers,
          hintsUsed: hintCounts,
          currentIndex: index,
          savedAt: Date.now(),
        })
      )
      setDraftSavedAt(Date.now())
    } catch {
      /* quota / private mode */
    }
  }, [storageKey, scenarioKey, answers, hintCounts, index])

  useEffect(() => {
    const sk = (scenarioKey || '').trim()
    if (!sk) {
      setAnswers({ ...emptyAnswers(), ...initialRef.current })
      setHintCounts(emptyHintsUsed())
      setIndex(0)
      return
    }

    let restored = false
    try {
      const raw = sessionStorage.getItem(storageKey)
      if (raw) {
        const d = JSON.parse(raw)
        if (d.scenarioKey === sk && d.answers && typeof d.currentIndex === 'number') {
          setAnswers({ ...emptyAnswers(), ...d.answers })
          setHintCounts({ ...emptyHintsUsed(), ...d.hintsUsed })
          setIndex(
            Math.max(0, Math.min(COMPETITIVE_L5_FIELD_ORDER.length - 1, d.currentIndex))
          )
          restored = true
        }
      }
    } catch {
      /* ignore */
    }

    if (!restored) {
      setAnswers({ ...emptyAnswers(), ...initialRef.current })
      setHintCounts(emptyHintsUsed())
      setIndex(0)
    }
  }, [scenarioKey, storageKey])

  useEffect(() => {
    const sk = (scenarioKey || '').trim()
    if (!sk) return
    const t = window.setTimeout(persist, 400)
    return () => window.clearTimeout(t)
  }, [answers, hintCounts, index, scenarioKey, persist])

  const updateAnswer = useCallback((key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }, [])

  const requestHint = useCallback(() => {
    setHintCounts((prev) => {
      const n = prev[currentKey] || 0
      if (n >= maxHintsPerField) return prev
      return { ...prev, [currentKey]: n + 1 }
    })
  }, [currentKey, maxHintsPerField])

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(COMPETITIVE_L5_FIELD_ORDER.length - 1, i + 1))
  }, [])

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1))
  }, [])

  const setFieldIndex = useCallback((i) => {
    setIndex(Math.max(0, Math.min(COMPETITIVE_L5_FIELD_ORDER.length - 1, i)))
  }, [])

  const filledCount = useMemo(
    () => COMPETITIVE_L5_FIELD_ORDER.filter((k) => (answers[k] || '').trim().length > 0).length,
    [answers]
  )

  const revealedHints = useMemo(() => {
    const n = hintCounts[currentKey] || 0
    const list = getHintsForField(currentKey)
    return list.slice(0, n)
  }, [currentKey, hintCounts])

  const flushDraft = useCallback(() => {
    persist()
  }, [persist])

  const clearDraft = useCallback(() => {
    try {
      sessionStorage.removeItem(storageKey)
    } catch {
      /* ignore */
    }
    setDraftSavedAt(null)
  }, [storageKey])

  const getAnswers = useCallback(() => ({ ...answers }), [answers])

  const getHintCounts = useCallback(() => ({ ...hintCounts }), [hintCounts])

  return {
    fieldOrder: COMPETITIVE_L5_FIELD_ORDER,
    currentKey,
    currentIndex: index,
    answers,
    hintsUsed: hintCounts[currentKey] || 0,
    maxHintsPerField,
    revealedHints,
    updateAnswer,
    requestHint,
    goNext,
    goPrev,
    setFieldIndex,
    filledCount,
    getAnswers,
    getHintCounts,
    flushDraft,
    clearDraft,
    draftSavedAt,
  }
}
