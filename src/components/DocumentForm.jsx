import { useState, useEffect } from 'react'
import { getTemplateFields, getTemplateLabel, getTemplateIcon, createDefaultFields } from '../config/templates'
import { generateDocumentConfig } from '../config/documentGenerators'

const FOCUS_BORDER = 'var(--color-accent-orange)'
const BLUR_BORDER = 'var(--color-border-default)'

function FieldInput({ field, value, onChange }) {
  const baseInputClass = 'w-full text-sm text-lab-ink py-2 transition-colors font-body'
  const underlineStyle = {
    border: 'none',
    borderBottom: `1px solid ${BLUR_BORDER}`,
    borderRadius: 0,
    backgroundColor: 'transparent',
    outline: 'none',
  }

  if (field.type === 'textarea') {
    return (
      <textarea
        value={value || ''}
        onChange={(e) => onChange(field.key, e.target.value)}
        placeholder={field.placeholder}
        className={`${baseInputClass} resize-y min-h-[60px]`}
        style={underlineStyle}
        onFocus={(e) => {
          e.target.style.borderBottomColor = FOCUS_BORDER
        }}
        onBlur={(e) => {
          e.target.style.borderBottomColor = BLUR_BORDER
        }}
      />
    )
  }

  if (field.type === 'select') {
    return (
      <select
        value={value || ''}
        onChange={(e) => onChange(field.key, e.target.value)}
        className={`${baseInputClass} cursor-pointer`}
        style={{ ...underlineStyle, appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'8\' height=\'5\' viewBox=\'0 0 8 5\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1L4 4L7 1\' stroke=\'%239B9890\' stroke-width=\'1.2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center', paddingRight: '20px' }}
      >
        <option value="">{field.placeholder || '请选择...'}</option>
        {(field.options || []).map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    )
  }

  if (field.type === 'date') {
    return (
      <input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(field.key, e.target.value)}
        className={baseInputClass}
        style={underlineStyle}
        onFocus={(e) => {
          e.target.style.borderBottomColor = FOCUS_BORDER
        }}
        onBlur={(e) => {
          e.target.style.borderBottomColor = BLUR_BORDER
        }}
      />
    )
  }

  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(field.key, e.target.value)}
      placeholder={field.placeholder}
      className={baseInputClass}
      style={underlineStyle}
      onFocus={(e) => {
        e.target.style.borderBottomColor = FOCUS_BORDER
      }}
      onBlur={(e) => {
        e.target.style.borderBottomColor = BLUR_BORDER
      }}
    />
  )
}

export default function DocumentForm({ doc, onSave, onCancel }) {
  const templateType = doc.docType || doc.typeKey || 'blank'
  const fields = getTemplateFields(templateType)
  const isBlank = templateType === 'blank'
  const isExistingDoc = !!doc.id && doc.content

  const [title, setTitle] = useState(doc.name || doc.title || '')
  const [formFields, setFormFields] = useState(() => {
    if (doc.fields && Object.keys(doc.fields).length > 0) {
      return { ...doc.fields }
    }
    return createDefaultFields(templateType)
  })
  const [blankContent, setBlankContent] = useState(doc.content || '')
  const [aiGeneratedContent, setAiGeneratedContent] = useState(doc.content || '')
  const [isLoading, setIsLoading] = useState(false)
  const [questions, setQuestions] = useState([]) // 新增：追问列表
  const [questionAnswers, setQuestionAnswers] = useState({}) // 新增：追问回答

  const handleFieldChange = (key, value) => {
    setFormFields(prev => ({ ...prev, [key]: value }))
  }

  // ============================================================
  // 【新增】追问处理函数
  // ============================================================
  const handleAskQuestions = () => {
    const aiConfig = generateDocumentConfig(templateType, formFields, 'questions');
    const questions = aiConfig.questions || [];
    console.log('[追问] 生成的问题:', questions);
    
    if (questions.length > 0) {
      setQuestions(questions);
      alert('AI 追问生成成功！')
    } else {
      alert('没有需要追问的问题，你的字段已经填写得很清晰了！')
    }
  }

  // ============================================================
  // 【新增】追问回答处理
  // ============================================================
  const handleQuestionAnswerChange = (idx, value) => {
    setQuestionAnswers(prev => ({ ...prev, [idx]: value }))
  }

  const handleRegenerateAI = async () => {
    setIsLoading(true)
    try {
      const aiConfig = generateDocumentConfig(templateType, formFields);
      
      // 如果有追问回答，拼接到 userPrompt 中
      let userPrompt = aiConfig.userPrompt
      if (Object.keys(questionAnswers).length > 0) {
        const answersText = Object.entries(questionAnswers)
          .map(([idx, ans]) => ans ? `补充回答 ${parseInt(idx)+1}: ${ans}` : '')
          .filter(t => t.length > 0)
          .join('\n')
        if (answersText) {
          userPrompt += '\n\n【用户补充回答】\n' + answersText
        }
      }
      
      const { chatComplete } = await import('../utils/aiApi');
      const aiContent = await chatComplete([
        { role: 'system', content: aiConfig.systemPrompt },
        { role: 'user', content: userPrompt }
      ]);
      console.log('[AI生成] 成功，内容长度:', aiContent.length);
      setAiGeneratedContent(aiContent || '')
      setQuestions([]) // 生成后自动收起追问面板
      alert('AI 生成成功！')
    } catch (err) {
      console.error('[AI生成] 失败:', err.message);
      alert('AI 生成失败: ' + err.message);
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLoading) return
    
    setIsLoading(true)
    try {
      if (isBlank) {
        onSave({
          name: title || '未命名文档',
          content: blankContent,
          fields: {},
          docType: 'blank'
        })
      } else {
        // 保存当前的 AI 内容（无论是新生成的还是用户编辑的）
        onSave({
          name: title || '未命名文档',
          content: aiGeneratedContent || '',
          fields: formFields,
          docType: templateType
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-lab-border-subtle">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="未命名文档"
          className="flex-1 text-base font-semibold font-display text-lab-ink py-1"
          style={{
            border: 'none',
            borderBottom: `1px solid ${BLUR_BORDER}`,
            borderRadius: 0,
            backgroundColor: 'transparent',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.target.style.borderBottomColor = FOCUS_BORDER
          }}
          onBlur={(e) => {
            e.target.style.borderBottomColor = BLUR_BORDER
          }}
        />
        <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 flex items-center gap-1 bg-lab-raised text-lab-muted border border-lab-border-subtle">
          <span>{getTemplateIcon(templateType)}</span>
          <span>{getTemplateLabel(templateType)}</span>
        </span>
      </div>

      <div className="flex-1 overflow-auto space-y-4 pr-1">
        {isBlank ? (
          <div>
            <label className="text-xs text-lab-muted uppercase tracking-wider block mb-1.5">
              内容
            </label>
            <textarea
              value={blankContent}
              onChange={(e) => setBlankContent(e.target.value)}
              placeholder="输入内容... 输入 [[ 可引用其他文档"
              className="w-full min-h-[200px] text-sm leading-relaxed text-lab-ink p-3 rounded-lg resize-y font-body bg-lab-raised border border-lab-border-subtle"
              style={{
                fontFamily: 'inherit',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = FOCUS_BORDER
              }}
              onBlur={(e) => {
                e.target.style.borderColor = BLUR_BORDER
              }}
            />
          </div>
        ) : (
          <>
            {/* AI 生成内容编辑区（如果已有内容） */}
            <div className="p-4 rounded-xl border border-lab-border-subtle bg-lab-accent-dim">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs text-lab-accent-warm uppercase tracking-wider font-semibold font-sans">
                  ✨ AI 生成内容（可编辑）
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAskQuestions}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-white disabled:opacity-60"
                    style={{
                      backgroundColor: 'var(--color-success)',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        追问中...
                      </span>
                    ) : (
                      <span>🔍 追问</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerateAI}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-[var(--color-text-inverted)] disabled:opacity-60 lab-btn-primary !shadow-none !py-1.5 !px-3"
                    style={{
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        生成中...
                      </span>
                    ) : (
                      <span>🔄 重新生成 AI</span>
                    )}
                  </button>
                </div>
              </div>
              <textarea
                value={aiGeneratedContent}
                onChange={(e) => setAiGeneratedContent(e.target.value)}
                placeholder="AI 生成的内容会显示在这里，你可以直接编辑..."
                className="w-full min-h-[200px] text-sm leading-relaxed text-lab-ink p-3 rounded-lg resize-y font-body bg-lab-overlay border border-lab-border"
                style={{
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = FOCUS_BORDER
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = BLUR_BORDER
                }}
              />
            </div>

            {/* ============================================================
                【新增】AI 追问显示区域
                ============================================================ */}
            {questions.length > 0 && (
              <div className="p-4 rounded-xl mt-4 border border-lab-border-subtle bg-[var(--color-success-dim)]">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs text-lab-success uppercase tracking-wider font-semibold font-sans">
                    🤔 AI 追问 — 请确认以下问题
                  </label>
                  <button
                    type="button"
                    onClick={() => setQuestions([])}
                    className="px-2 py-1 text-xs font-medium rounded-lg transition-colors bg-lab-overlay text-lab-success border border-lab-border-subtle hover:bg-lab-raised"
                    style={{
                      cursor: 'pointer',
                    }}
                  >
                    隐藏追问
                  </button>
                </div>
                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="mb-3 p-2.5 rounded-lg bg-lab-overlay border border-lab-border-subtle"
                  >
                    <p className="mb-2 font-medium text-lab-success text-[13px]">
                      {idx + 1}. {q}
                    </p>
                    <input
                      type="text"
                      data-question={idx}
                      value={questionAnswers[idx] || ''}
                      onChange={(e) => handleQuestionAnswerChange(idx, e.target.value)}
                      placeholder="（可选）补充你的想法..."
                      className="w-full px-2.5 py-2 text-[13px] rounded-md border border-lab-border bg-lab-overlay text-lab-ink outline-none focus-visible:ring-2 focus-visible:ring-lab-accent font-body"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 原始表单字段 */}
            <div className="mt-4">
              <div className="text-xs text-lab-faint uppercase tracking-wider mb-3 pb-2 border-b border-lab-border-subtle">
                📝 {isExistingDoc ? '原始字段' : '字段输入'}
              </div>
              {fields.map(field => (
                <div key={field.key} className="mb-3">
                  <label className="text-xs text-lab-muted uppercase tracking-wider block mb-1.5">
                    {field.label}
                  </label>
                  <FieldInput
                    field={field}
                    value={formFields[field.key]}
                    onChange={handleFieldChange}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 pt-4 mt-2 border-t border-lab-border-subtle">
        <button
          type="submit"
          disabled={isLoading}
          className="text-xs px-4 py-2 rounded-lg font-medium lab-btn-primary font-sans disabled:opacity-60 disabled:!transform-none"
        >
          {isLoading ? (
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              处理中...
            </span>
          ) : (
            <span>保存</span>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="text-xs px-4 py-2 rounded-lg font-medium text-lab-muted hover:bg-lab-accent-dim hover:text-lab-accent-warm transition-colors"
          style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
        >
          取消
        </button>
      </div>
    </form>
  )
}
