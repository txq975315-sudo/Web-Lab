import { getTemplateFields, getTemplateLabel, getTemplateIcon } from '../config/templates'
import { useLab } from '../context/LabContext'

function PersonaRenderer({ fields, docId }) {
  const items = [
    { label: '价值主张', value: fields.valueProposition, span: 'full', key: 'valueProposition' },
    { label: '目标客户', value: fields.targetCustomer, span: 'half', key: 'targetCustomer' },
    { label: '核心指标', value: fields.keyMetrics, span: 'half', key: 'keyMetrics' },
    { label: '收入来源', value: fields.revenueStreams, span: 'half', key: 'revenueStreams' },
    { label: '成本结构', value: fields.costStructure, span: 'half', key: 'costStructure' },
    { label: '关键资源', value: fields.keyResources, span: 'full', key: 'keyResources' }
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(item => (
        <div
          key={item.key}
          id={`field-${docId}-${item.key}`}
          className={item.span === 'full' ? 'col-span-2' : 'col-span-1'}
          style={{
            padding: '12px 14px',
            borderRadius: '10px',
            backgroundColor: '#FAFAFA',
            border: '1px solid #F3F4F6'
          }}
        >
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">{item.label}</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {item.value || <span className="text-gray-300">暂无</span>}
          </p>
        </div>
      ))}
    </div>
  )
}

function CanvasRenderer({ fields, docId }) {
  const cells = [
    { label: '价值主张', value: fields.valueProposition, color: '#EFF6FF', borderColor: '#BFDBFE', key: 'valueProposition' },
    { label: '客户细分', value: fields.customerSegments, color: '#F5F3FF', borderColor: '#DDD6FE', key: 'customerSegments' },
    { label: '渠道通路', value: fields.channels, color: '#FEF2F2', borderColor: '#FECACA', key: 'channels' },
    { label: '客户关系', value: fields.customerRelationships, color: '#FFF7ED', borderColor: '#FED7AA', key: 'customerRelationships' },
    { label: '收入来源', value: fields.revenueStreams, color: '#F0FDF4', borderColor: '#BBF7D0', key: 'revenueStreams' },
    { label: '核心资源', value: fields.keyResources, color: '#FEFCE8', borderColor: '#FEF08A', key: 'keyResources' },
    { label: '关键业务', value: fields.keyActivities, color: '#FDF2F8', borderColor: '#FBCFE8', key: 'keyActivities' },
    { label: '重要伙伴', value: fields.keyPartners, color: '#F0F9FF', borderColor: '#BAE6FD', key: 'keyPartners' },
    { label: '成本结构', value: fields.costStructure, color: '#F9FAFB', borderColor: '#E5E7EB', key: 'costStructure' }
  ]

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {cells.map(cell => (
        <div
          key={cell.key}
          id={`field-${docId}-${cell.key}`}
          className="col-span-1 rounded-lg p-3"
          style={{
            backgroundColor: cell.color,
            border: `1px solid ${cell.borderColor}`
          }}
        >
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{cell.label}</p>
          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
            {cell.value || <span className="text-gray-300">—</span>}
          </p>
        </div>
      ))}
    </div>
  )
}

function PRDRenderer({ fields, docId }) {
  const priorityColor = {
    'P0': { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
    'P1': { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' },
    'P2': { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' }
  }

  const items = [
    { label: '背景', value: fields.background, key: 'background' },
    { label: '目标', value: fields.goal, key: 'goal' },
    { label: '功能描述', value: fields.functionalDescription, key: 'functionalDescription' },
    { label: '验收标准', value: fields.acceptanceCriteria, key: 'acceptanceCriteria' },
    { label: '技术风险', value: fields.technicalRisk, key: 'technicalRisk' }
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">优先级</span>
        {fields.priority ? (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
            style={{
              backgroundColor: priorityColor[fields.priority]?.bg || '#F3F4F6',
              color: priorityColor[fields.priority]?.text || '#6B7280',
              border: `1px solid ${priorityColor[fields.priority]?.border || '#E5E7EB'}`
            }}
          >
            {fields.priority}
          </span>
        ) : (
          <span className="text-xs text-gray-300">未设置</span>
        )}
      </div>

      {items.map(item => (
        <div key={item.key} id={`field-${docId}-${item.key}`}>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {item.value || <span className="text-gray-300">暂无</span>}
          </p>
        </div>
      ))}
    </div>
  )
}

function DecisionRenderer({ fields, docId }) {
  const confidenceColor = {
    '高': { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
    '中': { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' },
    '低': { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4" id={`field-${docId}-decisionContent`}>
        <div className="flex-1">
          <p className="text-base font-semibold text-gray-800 leading-relaxed whitespace-pre-line">
            {fields.decisionContent || <span className="text-gray-300 font-normal">暂无决策内容</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          {fields.confidence && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{
                backgroundColor: confidenceColor[fields.confidence]?.bg || '#F3F4F6',
                color: confidenceColor[fields.confidence]?.text || '#6B7280',
                border: `1px solid ${confidenceColor[fields.confidence]?.border || '#E5E7EB'}`
              }}
            >
              置信度 {fields.confidence}
            </span>
          )}
          {fields.decisionDate && (
            <span className="text-[10px] text-gray-400">{fields.decisionDate}</span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div id={`field-${docId}-decisionBasis`}>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">决策依据</p>
          <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">
            {fields.decisionBasis || <span className="text-gray-300">暂无</span>}
          </p>
        </div>
        <div id={`field-${docId}-alternatives`}>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">替代方案</p>
          <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">
            {fields.alternatives || <span className="text-gray-300">暂无</span>}
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
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-colors ml-1"
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
  const textContent = typeof content === 'object' ? content.text : content
  const sources = typeof content === 'object' && content.sources ? content.sources : []
  
  if (!textContent && sources.length === 0) {
    return <p className="text-sm text-gray-300">暂无内容</p>
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
            <h3 key={i} id={`heading-${docId}-${slugify(text)}`} className="text-sm font-semibold text-gray-800 mt-5 mb-2 pb-1 border-b border-gray-100">
              {text}
            </h3>
          )
        }

        const h3Match = line.match(/^###\s+(.+)/)
        if (h3Match) {
          const text = h3Match[1]
          return (
            <h4 key={i} id={`heading-${docId}-${slugify(text)}`} className="text-xs font-semibold text-gray-700 mt-3 mb-1">
              {text}
            </h4>
          )
        }

        if (line.startsWith('- ')) {
          return (
            <li key={i} className="text-sm text-gray-600 ml-4 leading-relaxed">
              {line.replace(/^-\s*/, '')}
            </li>
          )
        }

        return (
          <p key={i} className="text-sm leading-relaxed text-gray-600">
            {line}
          </p>
        )
      })}
      
      {sources.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-1">
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
  const templateType = doc.docType || doc.typeKey || 'blank'
  const docId = doc.id

  if (templateType === 'blank' || !templateType || templateType === 'document') {
    return <BlankRenderer content={doc.content} docId={docId} jumpToSource={jumpToSource} />
  }

  const fields = doc.fields || {}

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
      return <BlankRenderer content={doc.content} docId={docId} jumpToSource={jumpToSource} />
  }
}
