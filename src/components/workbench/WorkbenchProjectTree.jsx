import { useState, useEffect, useRef } from 'react'
import { useLab } from '../../context/LabContext'
import { AnimatePresence, motion } from 'framer-motion'

function ChevTree({ expanded }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 opacity-55"
      style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.18s ease' }}
      aria-hidden
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[var(--color-accent-orange)]" aria-hidden>
      <path
        d="M7 11V8a5 5 0 0110 0v3M6 11h12v10H6V11z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconFolder() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[var(--color-accent-orange)]" aria-hidden>
      <path
        d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconFile() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 opacity-80" style={{ color: 'var(--wb-text)' }} aria-hidden>
      <path
        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinejoin="round"
      />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.45" strokeLinejoin="round" />
    </svg>
  )
}

function treeChildKey(parentNode, child, index) {
  if (child?.id != null && String(child.id) !== '') return String(child.id)
  return `wb-tree-${parentNode?.id || 'root'}-${index}-${child?.name || ''}`
}

function TreeRow({ node, level, selectedDocId }) {
  const { selectDocument, toggleTreeNode } = useLab()
  const isExpanded = node.expanded
  const isSelected = selectedDocId === node.id
  const isDocument = node.type === 'document'
  const isConstitution =
    node.categoryType === 'constitution' || (node.name && node.name.includes('宪法'))

  const handleClick = () => {
    if (isDocument) selectDocument(node.id)
    else toggleTreeNode(node.id)
  }

  return (
    <div className="select-none">
      <button
        type="button"
        onClick={handleClick}
        className="flex w-full items-center gap-1.5 rounded-lg py-1.5 pr-1 text-left text-[13px] transition-colors hover:bg-[rgba(255,255,255,0.35)]"
        style={{
          paddingLeft: `${10 + level * 14}px`,
          color: 'var(--wb-text)',
          fontWeight: level === 0 ? 600 : 500,
          background: isSelected ? 'rgba(255,255,255,0.5)' : undefined,
          boxShadow: isSelected ? 'inset 0 0 0 1px rgba(0,170,255,0.22)' : undefined,
        }}
      >
        {!isDocument ? <ChevTree expanded={isExpanded} /> : <span className="w-3 shrink-0" />}
        {!isDocument ? (
          isConstitution ? (
            <IconLock />
          ) : (
            <IconFolder />
          )
        ) : (
          <IconFile />
        )}
        <span className="min-w-0 flex-1 truncate">{node.name}</span>
      </button>

      {node.children && node.children.length > 0 && isExpanded && (
        <div className="relative border-l border-[rgba(20,20,19,0.12)] pl-2" style={{ marginLeft: `${18 + level * 14}px` }}>
          {node.children.map((child, index) => (
            <TreeRow key={treeChildKey(node, child, index)} node={child} level={level + 1} selectedDocId={selectedDocId} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * 压力测试工作台中间列：项目树（无底纹，叠在 wb-shell 云底上）
 */
export default function WorkbenchProjectTree() {
  const { projects, activeProjectId, setActiveProject, createProject, currentProject, activeDocId } = useLab()
  const [open, setOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const dropdownRef = useRef(null)

  const active = projects.find((p) => p.id === activeProjectId)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const handleCreate = (e) => {
    e.preventDefault()
    const n = nameDraft.trim()
    if (!n) return
    createProject(n)
    setNameDraft('')
    setShowCreate(false)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--wb-muted)' }}>
        项目树
      </p>

      <button
        type="button"
        onClick={() => setShowCreate((v) => !v)}
        className="mb-2 w-full rounded-full px-3 py-2.5 text-xs font-semibold transition-opacity hover:opacity-95"
        style={{
          background: 'color-mix(in srgb, var(--color-accent-orange) 88%, #0f172a)',
          color: 'var(--color-text-inverted)',
          boxShadow: '0 2px 12px rgba(0, 170, 255, 0.2)',
        }}
      >
        + 创建新的项目
      </button>

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-3 rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(20,20,19,0.08)' }}>
          <input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            placeholder="项目名称"
            className="mb-2 w-full rounded-lg border px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-orange)]"
            style={{ borderColor: 'rgba(20,20,19,0.12)', background: 'rgba(255,255,255,0.9)' }}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-lg py-1.5 text-xs font-semibold text-white"
              style={{ background: 'var(--color-accent-orange)' }}
            >
              创建
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreate(false)
                setNameDraft('')
              }}
              className="flex-1 rounded-lg py-1.5 text-xs"
              style={{ color: 'var(--wb-muted)' }}
            >
              取消
            </button>
          </div>
        </form>
      )}

      <div className="relative mb-3" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-[rgba(255,255,255,0.4)]"
          style={{
            background: 'rgba(255, 255, 255, 0.55)',
            border: '1px solid rgba(20, 20, 19, 0.08)',
            color: 'var(--wb-text)',
            boxShadow: '0 1px 4px rgba(20, 20, 19, 0.04)',
          }}
        >
          <span className="truncate">{active?.name || '选择项目'}</span>
          <ChevTree expanded={open} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-xl py-1 shadow-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.92)',
                border: '1px solid rgba(20, 20, 19, 0.08)',
                backdropFilter: 'blur(12px)',
              }}
            >
              {projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setActiveProject(p.id)
                    setOpen(false)
                  }}
                  className="flex w-full px-3 py-2 text-left text-sm transition-colors hover:bg-[rgba(0,170,255,0.08)]"
                  style={{
                    color: p.id === activeProjectId ? 'var(--color-accent-orange)' : 'var(--wb-text)',
                    fontWeight: p.id === activeProjectId ? 600 : 400,
                  }}
                >
                  {p.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1">
        {currentProject?.children?.map((cat, i) => (
          <TreeRow
            key={cat?.id != null ? String(cat.id) : `cat-${i}`}
            node={cat}
            level={0}
            selectedDocId={activeDocId}
          />
        ))}
        {!currentProject?.children?.length && (
          <p className="py-6 text-center text-xs" style={{ color: 'var(--wb-muted)' }}>
            暂无分类节点
          </p>
        )}
      </div>
    </div>
  )
}
