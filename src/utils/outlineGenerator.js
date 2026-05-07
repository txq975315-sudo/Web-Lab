import { TEMPLATE_FIELDS } from '../config/templates'

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function autoGenerateOutline(doc, templates = TEMPLATE_FIELDS) {
  const { docType, content = '', fields = {} } = doc
  
  if (docType === 'blank') {
    return parseMarkdownOutline(content)
  }
  
  const templateFields = templates[docType]
  if (templateFields && Array.isArray(templateFields)) {
    return generateFromTemplateFields(templateFields, fields)
  }
  
  return parseMarkdownOutline(content)
}

function parseMarkdownOutline(content) {
  const outline = []
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  let match
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = slugify(text)
    
    outline.push({
      level,
      text,
      id
    })
  }
  
  return outline
}

function generateFromTemplateFields(templateFields, docFields) {
  const outline = []
  
  for (const field of templateFields) {
    const fieldValue = docFields[field.key] || ''
    
    const item = {
      level: 2,
      text: field.label,
      id: field.key,
      fieldKey: field.key
    }
    outline.push(item)
    
    if (field.type === 'textarea' && fieldValue.length > 100) {
      const firstLine = fieldValue.split('\n')[0]?.trim()
      if (firstLine && firstLine.length > 0) {
        const subItem = {
          level: 3,
          text: firstLine.length > 30 ? firstLine.slice(0, 30) + '...' : firstLine,
          id: `${field.key}-preview`,
          fieldKey: field.key
        }
        outline.push(subItem)
      }
    }
  }
  
  return outline
}

export function generateHeadingId(docId, headingId) {
  return `heading-${docId}-${headingId}`
}

export function generateFieldId(docId, fieldKey) {
  return `field-${docId}-${fieldKey}`
}