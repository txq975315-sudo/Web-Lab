/**
 * 将旧版「Insight / Archive / Decision」三栏项目树迁移为
 * 标准「01–06 模块」结构，避免 Trae 等内嵌浏览器沿用旧 localStorage 时侧栏与新版不一致。
 */
import { getForcedCategory } from '../config/templates'

const EXPECTED = [
  '01 项目宪法',
  '02 市场与用户洞察',
  '03 策略与增长',
  '04 决策链图谱',
  '05 反脆弱审计',
  '06 执行路线图'
]

export function hasModernSixModules(project) {
  const c = project?.children
  if (!c || c.length !== 6) return false
  for (let i = 0; i < 6; i++) {
    if (c[i]?.name !== EXPECTED[i]) return false
  }
  return c.every(ch => ch?.type === 'category')
}

function legacyFolderKey(name) {
  const n = (name || '').trim().toLowerCase()
  if (n === 'insight' || n.includes('洞察')) return 'insight'
  if (n === 'archive' || n.includes('归档')) return 'archive'
  if (n === 'decision' || n.includes('决策')) return 'decision'
  return null
}

export function isLegacyThreeColumnProject(project) {
  const ch = project?.children
  if (!ch || ch.length !== 3) return false
  const keys = ch.map(c => legacyFolderKey(c.name))
  if (!keys.every(Boolean)) return false
  return new Set(keys).size === 3
}

function collectDocumentsUnderCategories(project) {
  const rows = []
  for (const root of project.children || []) {
    function walk(node) {
      if (node.type === 'document') {
        rows.push({ doc: JSON.parse(JSON.stringify(node)), legacyRoot: root.name })
      }
      if (node.children?.length) {
        for (const child of node.children) walk(child)
      }
    }
    if (root.children?.length) {
      for (const child of root.children) walk(child)
    }
  }
  return rows
}

function buildModernCategoryChildren(projectId, manifestoFields) {
  const manifestoDocId = `${projectId}-cat-constitution-doc-manifesto`
  return [
    {
      id: `${projectId}-cat-constitution`,
      name: '01 项目宪法',
      type: 'category',
      categoryType: 'constitution',
      expanded: true,
      children: [
        {
          id: manifestoDocId,
          name: '核心定位',
          type: 'document',
          docType: 'manifesto',
          typeKey: 'manifesto',
          parentId: `${projectId}-cat-constitution`,
          fields: { ...manifestoFields },
          content: '',
          version: 1,
          versionHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    },
    {
      id: `${projectId}-cat-market`,
      name: '02 市场与用户洞察',
      type: 'category',
      categoryType: 'market',
      expanded: true,
      children: []
    },
    {
      id: `${projectId}-cat-strategy`,
      name: '03 策略与增长',
      type: 'category',
      categoryType: 'strategy',
      expanded: true,
      children: []
    },
    {
      id: `${projectId}-cat-decision`,
      name: '04 决策链图谱',
      type: 'category',
      categoryType: 'decision',
      expanded: true,
      isSpecial: true,
      children: []
    },
    {
      id: `${projectId}-cat-antifragile`,
      name: '05 反脆弱审计',
      type: 'category',
      categoryType: 'antifragile',
      expanded: false,
      children: []
    },
    {
      id: `${projectId}-cat-roadmap`,
      name: '06 执行路线图',
      type: 'category',
      categoryType: 'roadmap',
      expanded: false,
      children: []
    }
  ]
}

function categoryIdByLegacyRoot(projectId, legacyRootName) {
  const k = legacyFolderKey(legacyRootName)
  if (k === 'insight') return `${projectId}-cat-market`
  if (k === 'archive') return `${projectId}-cat-strategy`
  if (k === 'decision') return `${projectId}-cat-decision`
  return `${projectId}-cat-market`
}

function findCategoryById(children, id) {
  return children.find(c => c.id === id)
}

function convertLegacyProjectToModern(project) {
  const projectId = project.id
  const prevConst = project.constitution || {}
  const manifestoFields = prevConst.manifesto?.fields || {}

  const children = buildModernCategoryChildren(projectId, manifestoFields)
  const manifestoDocId = `${projectId}-cat-constitution-doc-manifesto`

  const constitution = {
    ...prevConst,
    manifesto: {
      ...(prevConst.manifesto || {}),
      fields: { ...manifestoFields },
      version: prevConst.manifesto?.version || 1,
      versionHistory: prevConst.manifesto?.versionHistory || []
    },
    manifestoDocId
  }

  const rows = collectDocumentsUnderCategories(project)
  const manifestoCategory = findCategoryById(children, `${projectId}-cat-constitution`)

  for (const { doc, legacyRoot } of rows) {
    if (doc.docType === 'manifesto' || doc.typeKey === 'manifesto') {
      manifestoCategory.children[0] = {
        ...manifestoCategory.children[0],
        fields: { ...manifestoCategory.children[0].fields, ...doc.fields },
        content: doc.content || manifestoCategory.children[0].content,
        updatedAt: new Date().toISOString()
      }
      continue
    }

    let parentId = getForcedCategory(doc.docType, children)
    if (!parentId) {
      parentId = categoryIdByLegacyRoot(projectId, legacyRoot)
    }

    const parent = findCategoryById(children, parentId)
    if (!parent) continue

    const moved = {
      ...doc,
      parentId
    }
    if (!parent.children) parent.children = []
    parent.children.push(moved)
  }

  return {
    ...project,
    expanded: true,
    constitution,
    children
  }
}

/**
 * @param {unknown} tree
 * @returns {{ tree: any[], didMigrate: boolean }}
 */
export function migrateProjectTreeIfNeeded(tree) {
  if (!Array.isArray(tree)) {
    return { tree: [], didMigrate: false }
  }

  let didMigrate = false
  const next = tree.map(project => {
    if (project?.type !== 'project') return project
    if (hasModernSixModules(project)) return project
    if (!isLegacyThreeColumnProject(project)) return project
    didMigrate = true
    return convertLegacyProjectToModern(project)
  })

  return { tree: next, didMigrate }
}
