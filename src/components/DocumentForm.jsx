import { useState, useEffect } from 'react'
import { getTemplateFields, getTemplateLabel, getTemplateIcon, createDefaultFields } from '../config/templates'

function FieldInput({ field, value, onChange }) {
  const baseInputClass = "w-full text-sm text-gray-700 py-2 transition-colors"
  const underlineStyle = {
    border: 'none',
    borderBottom: '1px solid #E5E7EB',
    borderRadius: 0,
    backgroundColor: 'transparent',
    outline: 'none'
  }
  const focusStyle = { borderBottomColor: '#A855F7' }

  if (field.type === 'textarea') {
    return (
      <textarea
        value={value || ''}
        onChange={(e) => onChange(field.key, e.target.value)}
        placeholder={field.placeholder}
        className={`${baseInputClass} resize-y min-h-[60px]`}
        style={underlineStyle}
        onFocus={(e) => { e.target.style.borderBottomColor = '#A855F7' }}
        onBlur={(e) => { e.target.style.borderBottomColor = '#E5E7EB' }}
      />
    )
  }

  if (field.type === 'select') {
    return (
      <select
        value={value || ''}
        onChange={(e) => onChange(field.key, e.target.value)}
        className={`${baseInputClass} cursor-pointer`}
        style={{ ...underlineStyle, appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'8\' height=\'5\' viewBox=\'0 0 8 5\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1L4 4L7 1\' stroke=\'%239CA3AF\' stroke-width=\'1.2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center', paddingRight: '20px' }}
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
        onFocus={(e) => { e.target.style.borderBottomColor = '#A855F7' }}
        onBlur={(e) => { e.target.style.borderBottomColor = '#E5E7EB' }}
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
      onFocus={(e) => { e.target.style.borderBottomColor = '#A855F7' }}
      onBlur={(e) => { e.target.style.borderBottomColor = '#E5E7EB' }}
    />
  )
}

export default function DocumentForm({ doc, onSave, onCancel }) {
  const templateType = doc.docType || doc.typeKey || 'blank'
  const fields = getTemplateFields(templateType)
  const isBlank = templateType === 'blank'

  const [title, setTitle] = useState(doc.name || doc.title || '')
  const [formFields, setFormFields] = useState(() => {
    if (doc.fields && Object.keys(doc.fields).length > 0) {
      return { ...doc.fields }
    }
    return createDefaultFields(templateType)
  })
  const [blankContent, setBlankContent] = useState(doc.content || '')

  const handleFieldChange = (key, value) => {
    setFormFields(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isBlank) {
      onSave({
        name: title || '未命名文档',
        content: blankContent,
        fields: {},
        docType: 'blank'
      })
    } else {
      onSave({
        name: title || '未命名文档',
        content: '',
        fields: formFields,
        docType: templateType
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="未命名文档"
          className="flex-1 text-base font-semibold text-gray-800 py-1"
          style={{
            border: 'none',
            borderBottom: '1px solid #E5E7EB',
            borderRadius: 0,
            backgroundColor: 'transparent',
            outline: 'none'
          }}
          onFocus={(e) => { e.target.style.borderBottomColor = '#A855F7' }}
          onBlur={(e) => { e.target.style.borderBottomColor = '#E5E7EB' }}
        />
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 flex items-center gap-1"
          style={{
            backgroundColor: '#F3F4F6',
            color: '#6B7280',
            border: '1px solid #E5E7EB'
          }}
        >
          <span>{getTemplateIcon(templateType)}</span>
          <span>{getTemplateLabel(templateType)}</span>
        </span>
      </div>

      <div className="flex-1 overflow-auto space-y-4 pr-1">
        {isBlank ? (
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">
              内容
            </label>
            <textarea
              value={blankContent}
              onChange={(e) => setBlankContent(e.target.value)}
              placeholder="输入内容... 输入 [[ 可引用其他文档"
              className="w-full min-h-[200px] text-sm leading-relaxed text-gray-700 p-3 rounded-lg resize-y"
              style={{
                backgroundColor: '#FAFAFA',
                border: '1px solid #E5E7EB',
                fontFamily: 'inherit',
                outline: 'none'
              }}
              onFocus={(e) => { e.target.style.borderColor = '#A855F7' }}
              onBlur={(e) => { e.target.style.borderColor = '#E5E7EB' }}
            />
          </div>
        ) : (
          fields.map(field => (
            <div key={field.key}>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">
                {field.label}
              </label>
              <FieldInput
                field={field}
                value={formFields[field.key]}
                onChange={handleFieldChange}
              />
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 pt-4 mt-2 border-t border-gray-100">
        <button
          type="submit"
          className="text-xs px-4 py-2 rounded-lg font-medium text-white transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: '#8B5CF6' }}
        >
          保存
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs px-4 py-2 rounded-lg font-medium text-gray-500 hover:bg-gray-100 transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  )
}
