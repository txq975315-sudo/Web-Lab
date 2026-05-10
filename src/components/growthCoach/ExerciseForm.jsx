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
  'ourAdvantage',
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
  ownProductName,
}) {
  const tmpl = TEMPLATES.competitive_analysis
  const fieldMap = {}
  for (const f of tmpl.fields) {
    fieldMap[f.key] = f
  }

  return (
    <div className="flex max-h-full w-full flex-col overflow-hidden rounded-xl border border-lab-border-subtle bg-lab-overlay shadow-card">
      <div className="flex-shrink-0 border-b border-lab-border-subtle bg-lab-raised px-4 py-3">
        <p className="rounded-md bg-lab-overlay px-2 py-1.5 text-[11px] leading-relaxed text-lab-muted ring-1 ring-lab-border-subtle font-body">
          <span className="font-medium text-lab-ink">谁在和谁比：</span>
          己方应为左侧项目「<strong className="text-lab-ink">{ownProductName || '当前项目'}</strong>
          」（场景正文须直呼其名）；竞品为<strong>真实品牌</strong>，写在题干与「竞品名称」字段——这样己方哪怕是早期概念也能对标公开资料充足的对手，练的是拆解框架。
          若场景里出现的己方名字与左侧不一致，请点击下方「重新生成场景」。
        </p>
        <div className="mt-2 text-xs text-lab-muted">
          练习次数：第 {attemptNumber + 1} 次
          {attemptNumber === 0 && '（预填约 50%）'}
          {attemptNumber === 1 && '（预填约 20%）'}
          {attemptNumber >= 2 && '（独立完成）'}
        </div>
        <div className="coach-md--surface mt-2 text-sm">
          <CoachFormattedText text={scenario} />
        </div>
        {prefillHint && (
          <div className="mt-2 text-xs text-lab-muted">
            <CoachFormattedText text={prefillHint} />
          </div>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {KEYS.map((key) => {
          const f = fieldMap[key]
          if (!f) return null
          const val = values[key] ?? ''
          return (
            <label key={key} className="block">
              <span className="text-xs font-medium text-lab-muted">{f.label}</span>
              <textarea
                className="mt-1 w-full resize-y rounded-lg border border-lab-border bg-lab-overlay px-2 py-1.5 text-sm text-lab-ink placeholder:text-lab-faint focus:border-lab-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-lab-accent focus-visible:ring-offset-2 focus-visible:ring-offset-lab-overlay font-body"
                rows={key === 'competitorName' ? 2 : 3}
                value={val}
                placeholder={f.placeholder || ''}
                onChange={(e) => onChange(key, e.target.value)}
              />
            </label>
          )
        })}
      </div>

      <div className="flex-shrink-0 border-t border-lab-border-subtle p-4">
        <button
          type="button"
          disabled={disabled}
          onClick={onSubmit}
          className="w-full rounded-lab py-2.5 text-sm font-medium lab-btn-primary font-sans disabled:opacity-50"
        >
          {disabled ? '评分中…' : '提交练习'}
        </button>
      </div>
    </div>
  )
}
