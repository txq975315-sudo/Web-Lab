import { TEMPLATES } from '../../config/templates'
import CoachFormattedText from './CoachFormattedText'

const KEYS = [
  'competitorName',
  'price',
  'availability',
  'packaging',
  'performance',
  'easeOfUse',
  'assurance',
  'lifeCycle',
  'social',
  'ourAdvantage'
]

/**
 * 竞品分析 · 练习表单（读取 templates 字段标签）
 */
export default function ExerciseForm({
  scenario,
  prefillHint,
  values,
  onChange,
  onSubmit,
  disabled,
  attemptNumber,
  ownProductName
}) {
  const tmpl = TEMPLATES.competitive_analysis
  const fieldMap = {}
  for (const f of tmpl.fields) {
    fieldMap[f.key] = f
  }

  return (
    <div className="flex max-h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm" style={{ maxWidth: 480 }}>
      <div className="flex-shrink-0 border-b border-gray-100 bg-gray-50 px-4 py-3">
        <p className="rounded-md bg-white/80 px-2 py-1.5 text-[11px] leading-relaxed text-gray-600 ring-1 ring-gray-200/80">
          <span className="font-medium text-gray-700">谁在和谁比：</span>
          己方应为左侧项目「<strong className="text-gray-800">{ownProductName || '当前项目'}</strong>
          」（场景正文须直呼其名）；竞品为<strong>真实品牌</strong>，写在题干与「竞品名称」字段——这样己方哪怕是早期概念也能对标公开资料充足的对手，练的是拆解框架。
          若场景里出现的己方名字与左侧不一致，请点击下方「重新生成场景」。
        </p>
        <div className="mt-2 text-xs text-gray-500">
          练习次数：第 {attemptNumber + 1} 次
          {attemptNumber === 0 && '（预填约 50%）'}
          {attemptNumber === 1 && '（预填约 20%）'}
          {attemptNumber >= 2 && '（独立完成）'}
        </div>
        <div className="coach-md--surface mt-2 text-sm">
          <CoachFormattedText text={scenario} />
        </div>
        {prefillHint && (
          <div className="mt-2 text-xs text-gray-500">
            <CoachFormattedText text={prefillHint} />
          </div>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {KEYS.map(key => {
          const f = fieldMap[key]
          if (!f) return null
          const val = values[key] ?? ''
          return (
            <label key={key} className="block">
              <span className="text-xs font-medium text-gray-600">{f.label}</span>
              <textarea
                className="mt-1 w-full resize-y rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                rows={key === 'competitorName' ? 2 : 3}
                value={val}
                placeholder={f.placeholder || ''}
                onChange={e => onChange(key, e.target.value)}
              />
            </label>
          )
        })}
      </div>

      <div className="flex-shrink-0 border-t border-gray-100 p-4">
        <button
          type="button"
          disabled={disabled}
          onClick={onSubmit}
          className="w-full rounded-lg py-2.5 text-sm font-medium text-white disabled:opacity-50"
          style={{ backgroundColor: '#1a5f6e' }}
        >
          {disabled ? '评分中…' : '提交练习'}
        </button>
      </div>
    </div>
  )
}
