import { useLab } from '../context/LabContext'

/** 商业画布九格：用品牌 Token 的淡色区隔，避免蓝紫粉「通用 AI 风」 */
const CANVAS_CELLS = [
  { key: 'valueProposition', label: '价值主张', bg: 'rgba(106, 155, 204, 0.12)', border: 'rgba(106, 155, 204, 0.35)' },
  { key: 'customerSegments', label: '客户细分', bg: 'rgba(201, 100, 66, 0.1)', border: 'rgba(201, 100, 66, 0.3)' },
  { key: 'channels', label: '渠道通路', bg: 'rgba(192, 69, 58, 0.1)', border: 'rgba(192, 69, 58, 0.28)' },
  { key: 'customerRelationships', label: '客户关系', bg: 'rgba(201, 148, 58, 0.12)', border: 'rgba(201, 148, 58, 0.32)' },
  { key: 'revenueStreams', label: '收入来源', bg: 'rgba(120, 140, 93, 0.12)', border: 'rgba(120, 140, 93, 0.32)' },
  { key: 'keyResources', label: '核心资源', bg: 'rgba(196, 185, 154, 0.2)', border: 'rgba(196, 185, 154, 0.45)' },
  { key: 'keyActivities', label: '关键业务', bg: 'rgba(217, 119, 87, 0.1)', border: 'rgba(217, 119, 87, 0.3)' },
  { key: 'keyPartners', label: '重要伙伴', bg: 'rgba(90, 137, 184, 0.1)', border: 'rgba(90, 137, 184, 0.3)' },
  { key: 'costStructure', label: '成本结构', bg: 'rgba(245, 243, 236, 0.9)', border: 'rgba(216, 213, 204, 0.9)' },
]

function PersonaRenderer({ fields, docId }) {
  const safeFields = fields || {}
  const items = [
    { label: '价值主张', value: safeFields.valueProposition, span: 'full', key: 'valueProposition' },
    { label: '目标客户', value: safeFields.targetCustomer, span: 'half', key: 'targetCustomer' },
    { label: '核心指标', value: safeFields.keyMetrics, span: 'half', key: 'keyMetrics' },
    { label: '收入来源', value: safeFields.revenueStreams, span: 'half', key: 'revenueStreams' },
    { label: '成本结构', value: safeFields.costStructure, span: 'half', key: 'costStructure' },
    { label: '关键资源', value: safeFields.keyResources, span: 'full', key: 'keyResources' }
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(item => (
        <div
          key={item.key}
          id={`field-${docId}-${item.key}`}
          className={`${item.span === 'full' ? 'col-span-2' : 'col-span-1'} rounded-[10px] border border-lab-border-subtle bg-lab-raised p-3`}
        >
          <p className="text-[10px] text-lab-faint uppercase tracking-wider mb-1.5">{item.label}</p>
          <p className="text-sm text-lab-ink leading-relaxed whitespace-pre-line font-body">
            {item.value || <span className="text-lab-faint">暂无</span>}
          </p>
        </div>
      ))}
    </div>
  )
}

function CanvasRenderer({ fields, docId }) {
  const safeFields = fields || {}

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {CANVAS_CELLS.map((cell) => (
        <div
          key={cell.key}
          id={`field-${docId}-${cell.key}`}
          className="col-span-1 rounded-lg p-3"
          style={{
            backgroundColor: cell.bg,
            border: `1px solid ${cell.border}`,
          }}
        >
          <p className="text-[10px] text-lab-muted uppercase tracking-wider mb-1">{cell.label}</p>
          <p className="text-xs text-lab-ink leading-relaxed whitespace-pre-line font-body">
            {safeFields[cell.key] || <span className="text-lab-faint">—</span>}
          </p>
        </div>
      ))}
    </div>
  )
}

function PRDRenderer({ fields, docId }) {
  const safeFields = fields || {}
  const priorityColor = {
    P0: { bg: 'var(--color-error-dim)', text: 'var(--color-error)', border: 'color-mix(in srgb, var(--color-error) 35%, transparent)' },
    P1: { bg: 'var(--color-warning-dim)', text: 'var(--color-warning)', border: 'color-mix(in srgb, var(--color-warning) 35%, transparent)' },
    P2: { bg: 'var(--color-success-dim)', text: 'var(--color-success)', border: 'color-mix(in srgb, var(--color-success) 35%, transparent)' },
  }

  const items = [
    { label: '背景', value: safeFields.background, key: 'background' },
    { label: '目标', value: safeFields.goal, key: 'goal' },
    { label: '功能描述', value: safeFields.functionalDescription, key: 'functionalDescription' },
    { label: '验收标准', value: safeFields.acceptanceCriteria, key: 'acceptanceCriteria' },
    { label: '技术风险', value: safeFields.technicalRisk, key: 'technicalRisk' }
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] text-lab-faint uppercase tracking-wider">优先级</span>
        {safeFields.priority ? (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold font-sans"
            style={{
              backgroundColor: priorityColor[safeFields.priority]?.bg || 'var(--color-bg-raised)',
              color: priorityColor[safeFields.priority]?.text || 'var(--color-text-muted)',
              border: `1px solid ${priorityColor[safeFields.priority]?.border || 'var(--color-border-subtle)'}`,
            }}
          >
            {safeFields.priority}
          </span>
        ) : (
          <span className="text-xs text-lab-faint">未设置</span>
        )}
      </div>

      {items.map(item => (
        <div key={item.key} id={`field-${docId}-${item.key}`}>
          <p className="text-[10px] text-lab-faint uppercase tracking-wider mb-1">{item.label}</p>
          <p className="text-sm text-lab-ink leading-relaxed whitespace-pre-line font-body">
            {item.value || <span className="text-lab-faint">暂无</span>}
          </p>
        </div>
      ))}
    </div>
  )
}

function DecisionRenderer({ fields, docId }) {
  const safeFields = fields || {}
  const confidenceColor = {
    高: { bg: 'var(--color-success-dim)', text: 'var(--color-success)', border: 'color-mix(in srgb, var(--color-success) 35%, transparent)' },
    中: { bg: 'var(--color-warning-dim)', text: 'var(--color-warning)', border: 'color-mix(in srgb, var(--color-warning) 35%, transparent)' },
    低: { bg: 'var(--color-error-dim)', text: 'var(--color-error)', border: 'color-mix(in srgb, var(--color-error) 35%, transparent)' },
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4" id={`field-${docId}-decisionContent`}>
        <div className="flex-1">
          <p className="text-base font-semibold font-display text-lab-ink leading-relaxed whitespace-pre-line">
            {safeFields.decisionContent || <span className="text-lab-faint font-normal font-sans">暂无决策内容</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          {safeFields.confidence && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{
                backgroundColor: confidenceColor[safeFields.confidence]?.bg || 'var(--color-bg-raised)',
                color: confidenceColor[safeFields.confidence]?.text || 'var(--color-text-muted)',
                border: `1px solid ${confidenceColor[safeFields.confidence]?.border || 'var(--color-border-subtle)'}`,
              }}
            >
              置信度 {safeFields.confidence}
            </span>
          )}
          {safeFields.decisionDate && (
            <span className="text-[10px] text-lab-faint">{safeFields.decisionDate}</span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div id={`field-${docId}-decisionBasis`}>
          <p className="text-[10px] text-lab-faint uppercase tracking-wider mb-1">决策依据</p>
          <p className="text-sm text-lab-muted leading-relaxed whitespace-pre-line font-body">
            {safeFields.decisionBasis || <span className="text-lab-faint">暂无</span>}
          </p>
        </div>
        <div id={`field-${docId}-alternatives`}>
          <p className="text-[10px] text-lab-faint uppercase tracking-wider mb-1">替代方案</p>
          <p className="text-sm text-lab-muted leading-relaxed whitespace-pre-line font-body">
            {safeFields.alternatives || <span className="text-lab-faint">暂无</span>}
          </p>
        </div>
      </div>
    </div>
  )
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '')
}

function SourceAnchor({ source, jumpToSource }) {
  if (!source) return null
  
  return (
    <button
      onClick={() => jumpToSource(source)}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-lab-accent-warm hover:text-lab-accent hover:bg-lab-accent-dim transition-colors ml-1"
      title={`来源: ${source.timestamp}`}
    >
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 10v6M18 12l-5-5-5 5M9 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
      </svg>
      来源
    </button>
  )
}

function BlankRenderer({ content, docId, jumpToSource }) {
  let textContent = content
  let sources = []
  
  if (typeof content === 'object' && !Array.isArray(content)) {
    textContent = content.text || JSON.stringify(content, null, 2)
    sources = content.sources || []
  } else if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content)
      if (typeof parsed === 'object' && parsed.text) {
        textContent = parsed.text
        sources = parsed.sources || []
      } else if (typeof parsed === 'object') {
        textContent = JSON.stringify(parsed, null, 2)
      }
    } catch (e) {
      textContent = content
    }
  }
  
  if (!textContent && sources.length === 0) {
    return <p className="text-sm text-lab-faint font-body">暂无内容</p>
  }

  const lines = (textContent || '').split('\n')
  return (
    <div>
      {lines.map((line, i) => {
        if (line.trim() === '') return <div key={i} className="h-2" />

        const h2Match = line.match(/^##\s+(.+)/)
        if (h2Match) {
          const text = h2Match[1]
          return (
            <h3 key={i} id={`heading-${docId}-${slugify(text)}`} className="text-sm font-semibold font-display text-lab-ink mt-5 mb-2 pb-1 border-b border-lab-border-subtle">
              {text}
            </h3>
          )
        }

        const h3Match = line.match(/^###\s+(.+)/)
        if (h3Match) {
          const text = h3Match[1]
          return (
            <h4 key={i} id={`heading-${docId}-${slugify(text)}`} className="text-xs font-semibold font-display text-lab-ink mt-3 mb-1">
              {text}
            </h4>
          )
        }

        if (line.startsWith('- ')) {
          return (
            <li key={i} className="text-sm text-lab-muted ml-4 leading-relaxed font-body">
              {line.replace(/^-\s*/, '')}
            </li>
          )
        }

        return (
          <p key={i} className="text-sm leading-relaxed text-lab-muted font-body">
            {line}
          </p>
        )
      })}
      
      {sources.length > 0 && (
        <div className="mt-4 pt-3 border-t border-lab-border-subtle flex flex-wrap gap-1">
          {sources.map((src, i) => (
            <SourceAnchor key={i} source={src} jumpToSource={jumpToSource} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function DocumentRenderer({ doc }) {
  const { jumpToSource } = useLab()
  
  // 安全检查
  if (!doc) {
    return <div className="text-lab-muted text-sm font-body">文档不存在</div>
  }
  
  const templateType = doc.docType || doc.typeKey || 'blank'
  const docId = doc.id

  if (templateType === 'blank' || !templateType || templateType === 'document') {
    return <BlankRenderer content={doc.content} docId={docId} jumpToSource={jumpToSource} />
  }

  const fields = doc.fields || {}

  const renderTemplate = () => {
    switch (templateType) {
      case 'persona':
        return <PersonaRenderer fields={fields} docId={docId} />
      case 'canvas':
        return <CanvasRenderer fields={fields} docId={docId} />
      case 'prd':
        return <PRDRenderer fields={fields} docId={docId} />
      case 'decision':
        return <DecisionRenderer fields={fields} docId={docId} />
      default:
        return null
    }
  }

  return (
    <div>
      {doc.content && (
        <div className="mb-6 pb-4 border-b border-lab-border-subtle">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] text-lab-accent-warm uppercase tracking-wider font-semibold font-sans">✨ AI 生成内容</span>
          </div>
          <BlankRenderer content={doc.content} docId={docId} jumpToSource={jumpToSource} />
        </div>
      )}
      {renderTemplate() || (doc.content ? null : <BlankRenderer content={doc.content} docId={docId} jumpToSource={jumpToSource} />)}
    </div>
  )
}
