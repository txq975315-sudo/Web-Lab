import { STORAGE_KEYS } from '../config/storageKeys.js'

/**
 * 在 AI 输出中对 CAC、LTV 等缩写附加括号解释的说明块（追加在 system prompt 末尾）。
 * 开关存于 `STORAGE_KEYS.AI_CONFIG` 的 `explainProfessionalTerms` 字段。
 */

export const EXPLAIN_PROFESSIONAL_TERMS_INSTRUCTION = `【专业术语解释】
当正文（含追问、分析、报告、表格说明等）中出现商业、增长、投融资、数据与运营等领域的缩写或专有名词时——例如但不限于 CAC、LTV、ARPU、GMV、GTV、ARR、MRR、ACV、TCV、ROI、ROAS、PMF、NPS、DAU、WAU、MAU、留存率、付费转化率、SKU、SEO、SEM、OKR、KPI、SaaS、B2B、B2C、GTM、TAM/SAM/SOM、EBITDA 等——在首次出现时必须紧接中文括号，给出详细解释：说明含义、常见计算或统计口径、在本语境下的理解要点；若一词多义，须按当前讨论场景取最贴切义项。
同一缩写在后文再次出现时不必重复括号，除非含义或口径在本文另一处已发生变化。
若用户原文已自带清晰定义，可在不重复冗长定义的前提下用简短括号呼应（如「沿用上文定义」）。`

/**
 * 未显式关闭时默认开启（与「学习/演练」场景一致）。
 * @returns {boolean}
 */
export function readExplainProfessionalTermsEnabled() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_CONFIG)
    if (!raw) return true
    const c = JSON.parse(raw)
    if (c == null || typeof c !== 'object') return true
    return c.explainProfessionalTerms !== false
  } catch {
    return true
  }
}

/**
 * @param {string} basePrompt
 * @returns {string}
 */
export function augmentSystemPromptWithTerminology(basePrompt) {
  if (!basePrompt || typeof basePrompt !== 'string') return basePrompt
  if (!readExplainProfessionalTermsEnabled()) return basePrompt
  return `${basePrompt.trimEnd()}\n\n${EXPLAIN_PROFESSIONAL_TERMS_INSTRUCTION}`
}
