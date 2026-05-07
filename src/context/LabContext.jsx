import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useLocalStorage, STORAGE_KEYS } from '../hooks/useLocalStorage'
import { syncAllBacklinks, extractReferencedIds } from '../utils/linkParser'
import { getForcedCategory } from '../config/templates'
import { autoGenerateOutline } from '../utils/outlineGenerator'

const LabContext = createContext(null)

const PRD_PROMPTS = {
  framework: `你是一位资深产品经理。请将以下内容按照 [PRD 核心规格] 模板进行标准化整理，输出结构化的 PRD 文档：

【模板结构】
1. 需求背景与目标
2. 目标用户画像
3. 核心功能描述
4. 非功能性需求
5. 验收标准

请保持专业、简洁，用中文输出。`,

  research: `你是一位用户研究专家。请将以下内容按照 [PRD 核心规格] 模板进行标准化整理，输出结构化的研究报告：

【模板结构】
1. 研究目标与方法
2. 关键发现
3. 用户痛点与需求
4. 竞品分析摘要
5. 行动建议

请保持专业、简洁，用中文输出。`,

  report: `你是一位商业分析师。请将以下内容按照 [PRD 核心规格] 模板进行标准化整理，输出结构化的分析报告：

【模板结构】
1. 分析范围与目的
2. 市场环境概述
3. 核心数据与洞察
4. 风险评估
5. 战略建议

请保持专业、简洁，用中文输出。`,

  document: `你是一位技术文档工程师。请将以下内容按照 [PRD 核心规格] 模板进行标准化整理，输出结构化的技术文档：

【模板结构】
1. 文档目的与范围
2. 核心概念定义
3. 详细说明
4. 使用场景与示例
5. 注意事项

请保持专业、简洁，用中文输出。`,

  analysis: `你是一位数据分析师。请将以下内容按照 [PRD 核心规格] 模板进行标准化整理，输出结构化的分析文档：

【模板结构】
1. 分析背景与目标
2. 数据来源与方法论
3. 核心发现
4. 趋势解读
5. 决策建议

请保持专业、简洁，用中文输出。`,

  default: `你是一位资深产品经理。请将以下内容按照 [PRD 核心规格] 模板进行标准化整理，输出结构化的文档：

【模板结构】
1. 背景与目标
2. 核心内容
3. 关键要点
4. 实施建议
5. 验收标准

请保持专业、简洁，用中文输出。`
}

function simulateAIResponse(text, templateType) {
  const lines = text.split(/[。！？\n]/).filter(Boolean)
  const keyPoints = lines.slice(0, 3).map(l => l.trim()).filter(Boolean)

  const templates = {
    framework: `## 1. 需求背景与目标
基于「${keyPoints[0] || text.slice(0, 30)}」的分析，本需求旨在系统化梳理商业模式核心要素，为产品决策提供结构化依据。

## 2. 目标用户画像
- 主要用户：产品经理、商业分析师
- 使用场景：战略规划会议、产品评审
- 核心诉求：快速理解商业逻辑全貌

## 3. 核心功能描述
${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

## 4. 非功能性需求
- 可维护性：模板支持自定义扩展
- 可读性：结构化输出，层次分明
- 可追溯性：保留原始版本记录

## 5. 验收标准
- [ ] 文档包含完整的五大模块
- [ ] 每个模块有实质性内容
- [ ] 语言专业、简洁、无歧义`,

    research: `## 1. 研究目标与方法
针对「${keyPoints[0] || text.slice(0, 30)}」进行系统性用户研究，采用定性访谈与定量问卷相结合的方法。

## 2. 关键发现
${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

## 3. 用户痛点与需求
- 信息碎片化，缺乏系统整理
- 决策依据不够充分
- 需要可复用的分析框架

## 4. 竞品分析摘要
- 市场上已有类似工具但缺乏定制化
- 差异化机会在于行业垂直深度

## 5. 行动建议
- 建立标准化研究流程
- 沉淀可复用的分析模板
- 定期更新用户画像数据`,

    report: `## 1. 分析范围与目的
本报告围绕「${keyPoints[0] || text.slice(0, 30)}」展开系统性市场分析，为战略决策提供数据支撑。

## 2. 市场环境概述
- 行业趋势：数字化转型加速
- 竞争格局：头部集中，长尾分散
- 政策环境：鼓励创新，规范发展

## 3. 核心数据与洞察
${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

## 4. 风险评估
- 市场风险：需求波动
- 竞争风险：新进入者威胁
- 执行风险：资源与时间约束

## 5. 战略建议
- 聚焦核心差异化能力
- 建立快速迭代机制
- 强化数据驱动决策文化`,

    document: `## 1. 文档目的与范围
本文档旨在系统化阐述「${keyPoints[0] || text.slice(0, 30)}」的核心概念与实践方法。

## 2. 核心概念定义
${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

## 3. 详细说明
以上各概念之间存在内在关联，共同构成完整的知识体系。建议按顺序阅读以建立系统性理解。

## 4. 使用场景与示例
- 场景一：新人入职培训材料
- 场景二：跨部门协作对齐
- 场景三：项目复盘参考

## 5. 注意事项
- 本文档为动态更新版本
- 具体实施需结合业务上下文
- 建议定期评审与迭代`,

    analysis: `## 1. 分析背景与目标
基于「${keyPoints[0] || text.slice(0, 30)}」进行深度分析，旨在发现关键洞察并指导后续行动。

## 2. 数据来源与方法论
- 数据来源：内部业务数据 + 外部行业报告
- 分析方法：定量统计 + 定性归纳
- 时间范围：近12个月滚动数据

## 3. 核心发现
${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

## 4. 趋势解读
当前数据表明行业正经历结构性变化，建议关注以下趋势信号并提前布局。

## 5. 决策建议
- 短期（1-3月）：验证核心假设
- 中期（3-6月）：规模化复制
- 长期（6-12月）：建立护城河`
  }

  return templates[templateType] || templates.framework
}

function parseOutlineFromContent(content) {
  if (!content) return []
  const headings = []
  const lines = content.split('\n')
  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)/)
    if (h2Match) {
      headings.push({ level: 2, id: 'h-' + Math.random().toString(36).slice(2, 8), text: h2Match[1].trim() })
      continue
    }
    const h3Match = line.match(/^###\s+(.+)/)
    if (h3Match) {
      headings.push({ level: 3, id: 'h-' + Math.random().toString(36).slice(2, 8), text: h3Match[1].trim() })
    }
  }
  return headings
}

function parseOutlineFromFields(fields) {
  if (!fields) return []
  const headings = []
  const fieldLabels = {
    valueProposition: '价值主张', targetCustomer: '目标客户', revenueStreams: '收入来源',
    costStructure: '成本结构', keyResources: '关键资源', keyMetrics: '核心指标',
    customerSegments: '客户细分', channels: '渠道通路', customerRelationships: '客户关系',
    keyActivities: '关键业务', keyPartners: '重要伙伴',
    background: '背景', goal: '目标', functionalDescription: '功能描述',
    acceptanceCriteria: '验收标准', technicalRisk: '技术风险', priority: '优先级',
    decisionContent: '决策内容', decisionBasis: '决策依据', alternatives: '替代方案',
    confidence: '置信度', decisionDate: '决策日期'
  }
  for (const [key, value] of Object.entries(fields)) {
    if (value && value.trim()) {
      headings.push({
        level: 2,
        id: 'h-' + Math.random().toString(36).slice(2, 8),
        text: fieldLabels[key] || key
      })
    }
  }
  return headings
}

function extractAllTextForReferences(doc) {
  const parts = []
  if (doc.content) parts.push(doc.content)
  if (doc.fields) {
    for (const v of Object.values(doc.fields)) {
      if (v && typeof v === 'string') parts.push(v)
    }
  }
  return parts.join('\n')
}

function makeDoc(data) {
  const doc = {
    type: 'document',
    standardized: false,
    references: [],
    backlinks: [],
    docType: 'blank',
    fields: {},
    status: 'exploring',
    ...data
  }
  doc.outline = autoGenerateOutline(doc)
  return doc
}

const DEFAULT_PROJECT_TREE = [
  {
    id: 'proj-1',
    name: 'Kairos App',
    type: 'project',
    expanded: true,
    constitution: {
      constraints: ['专注位不可改', 'Android Only', '用户隐私优先', '数据可移植性', '渐进式交付']
    },
    children: [
      {
        id: 'cat-insight',
        name: 'Insight',
        type: 'category',
        categoryType: 'insight',
        expanded: true,
        children: [
          makeDoc({
            id: 'doc-1',
            name: '用户画像',
            docType: 'blank',
            typeKey: 'document',
            fields: {},
            content: '目标用户为25-35岁的互联网从业者，他们关注效率工具，愿意为提升工作效率的产品付费。核心使用场景包括：日常工作中的信息整理、项目复盘时的经验沉淀、团队协作中的知识共享。'
          }),
          makeDoc({
            id: 'doc-2',
            name: '痛点地图',
            docType: 'blank',
            typeKey: 'research',
            fields: {},
            content: '用户在商业化思考过程中面临三大痛点：信息碎片化导致无法系统思考、缺乏结构化框架使得分析浮于表面、团队协作时知识难以对齐和复用。'
          }),
          makeDoc({
            id: 'doc-3',
            name: '突发奇想',
            docType: 'blank',
            typeKey: 'document',
            fields: {},
            content: '是否可以将AI作为商业教练，实时对用户的商业分析进行点评和引导？类似一个永远在线的商业顾问，帮助用户发现思维盲区。'
          })
        ]
      },
      {
        id: 'cat-archive',
        name: 'Archive',
        type: 'category',
        categoryType: 'archive',
        expanded: true,
        children: [
          makeDoc({
            id: 'doc-4',
            name: 'PRD 核心规格',
            docType: 'blank',
            typeKey: 'framework',
            fields: {},
            content: '我们需要梳理当前产品的商业模式，包括价值主张、客户细分、渠道通路、收入来源和成本结构等九大模块。当前阶段的核心挑战在于如何平衡免费用户转化与付费用户体验。'
          }),
          makeDoc({
            id: 'doc-5',
            name: '技术架构',
            docType: 'blank',
            typeKey: 'document',
            fields: {},
            content: '前端采用React + TailwindCSS，后端使用Node.js + PostgreSQL。核心模块包括：实时协作引擎、AI分析管道、知识图谱构建器。'
          }),
          makeDoc({
            id: 'doc-6',
            name: '项目宪法',
            docType: 'blank',
            typeKey: 'document',
            fields: {},
            content: '本项目遵循以下核心原则：1. 用户隐私优先 2. 数据可移植性 3. 渐进式功能交付 4. 文档即代码 5. AI辅助而非替代人类决策。'
          })
        ]
      },
      {
        id: 'cat-decision',
        name: 'Decision',
        type: 'category',
        categoryType: 'decision',
        expanded: false,
        children: [
          makeDoc({
            id: 'doc-7',
            name: '已否决：自建ML平台',
            docType: 'blank',
            typeKey: 'analysis',
            fields: {},
            content: '方案：自建机器学习平台用于用户行为预测。否决原因：投入产出比不足，建议优先使用第三方API，待用户量达到10万后再评估。'
          }),
          makeDoc({
            id: 'doc-8',
            name: '已通过：Freemium定价',
            docType: 'blank',
            typeKey: 'analysis',
            fields: {},
            content: '决策：采用Freemium定价模式。基础功能免费，高级分析按$29/月收费，团队版$49/月/席位。预计首年转化率3-5%。'
          })
        ]
      }
    ]
  },
  {
    id: 'proj-2',
    name: '个人博客',
    type: 'project',
    expanded: false,
    constitution: {
      constraints: ['每周至少一篇', '技术深度优先']
    },
    children: [
      {
        id: 'cat-insight-2',
        name: 'Insight',
        type: 'category',
        categoryType: 'insight',
        expanded: true,
        children: []
      },
      {
        id: 'cat-archive-2',
        name: 'Archive',
        type: 'category',
        categoryType: 'archive',
        expanded: true,
        children: []
      },
      {
        id: 'cat-decision-2',
        name: 'Decision',
        type: 'category',
        categoryType: 'decision',
        expanded: false,
        children: []
      }
    ]
  }
]

function findNodeById(tree, id) {
  for (const node of tree) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

function validateMountPoint(docType, targetCategoryId, projectTree) {
  const forcedCategory = getForcedCategory(docType)
  if (forcedCategory && forcedCategory !== targetCategoryId) {
    console.warn(`模板 ${docType} 强制分类为 ${forcedCategory}，修正挂载点`)
    return forcedCategory
  }
  return targetCategoryId
}

function findParentNodeId(tree, nodeId) {
  for (const node of tree) {
    if (node.children?.some(child => child.id === nodeId)) {
      return node.id
    }
    if (node.children) {
      const found = findParentNodeId(node.children, nodeId)
      if (found) return found
    }
  }
  return null
}

function findCategoryNodeByType(tree, categoryType) {
  for (const node of tree) {
    if (node.type === 'category' && node.categoryType === categoryType) {
      return node.id
    }
    if (node.children) {
      const found = findCategoryNodeByType(node.children, categoryType)
      if (found) return found
    }
  }
  return null
}

function moveDocumentInTree(tree, docId, newParentId) {
  let docToMove = null
  const removeDoc = (nodes) => {
    return nodes.filter(node => {
      if (node.id === docId) {
        docToMove = node
        return false
      }
      if (node.children) {
        node.children = removeDoc(node.children)
      }
      return true
    })
  }
  
  let cleaned = removeDoc([...tree])
  if (docToMove) {
    cleaned = addNodeToParent(cleaned, newParentId, docToMove)
  }
  return cleaned
}

function migrateMisplacedDocuments(tree) {
  const migrations = []
  
  function checkAndCollect(nodes, parentId) {
    for (const node of nodes) {
      if (node.type === 'document' && node.docType) {
        const forcedCategory = getForcedCategory(node.docType)
        if (forcedCategory) {
          const parentNode = findNodeById(tree, parentId)
          if (parentNode && parentNode.id !== forcedCategory) {
            migrations.push({
              docId: node.id,
              docName: node.name,
              docType: node.docType,
              currentParent: parentNode.id,
              expectedParent: forcedCategory
            })
          }
        }
      }
      if (node.children) {
        checkAndCollect(node.children, node.id)
      }
    }
  }
  
  checkAndCollect(tree, null)
  
  if (migrations.length > 0) {
    console.log('=== 数据迁移日志 ===')
    console.log(`发现 ${migrations.length} 个位置错误的文档需要迁移:`)
    migrations.forEach(m => {
      console.log(`  - "${m.docName}" (${m.docType}): ${m.currentParent} -> ${m.expectedParent}`)
    })
  }
  
  let updatedTree = [...tree]
  migrations.forEach(m => {
    updatedTree = moveDocumentInTree(updatedTree, m.docId, m.expectedParent)
  })
  
  if (migrations.length > 0) {
    console.log(`已完成 ${migrations.length} 个文档的迁移`)
    console.log('=== 迁移完成 ===')
  }
  
  return { tree: updatedTree, migratedCount: migrations.length }
}

function updateNodeInTree(tree, id, updater) {
  return tree.map(node => {
    if (node.id === id) {
      return updater(node)
    }
    if (node.children) {
      return { ...node, children: updateNodeInTree(node.children, id, updater) }
    }
    return node
  })
}

function addNodeToParent(tree, parentId, newNode) {
  return tree.map(node => {
    if (node.id === parentId) {
      return { ...node, children: [...(node.children || []), newNode] }
    }
    if (node.children) {
      return { ...node, children: addNodeToParent(node.children, parentId, newNode) }
    }
    return node
  })
}

function removeNodeFromTree(tree, nodeId) {
  return tree
    .filter(node => node.id !== nodeId)
    .map(node => {
      if (node.children) {
        return { ...node, children: removeNodeFromTree(node.children, nodeId) }
      }
      return node
    })
}

function collectDocuments(tree) {
  const docs = []
  function walk(nodes) {
    for (const node of nodes) {
      if (node.type === 'document') {
        docs.push(node)
      }
      if (node.children) {
        walk(node.children)
      }
    }
  }
  walk(tree)
  return docs
}

function expandAllNodesInTree(tree) {
  return tree.map(node => ({
    ...node,
    expanded: true,
    children: node.children ? expandAllNodesInTree(node.children) : node.children
  }))
}

function findProjectForDoc(tree, docId) {
  for (const project of tree) {
    if (findNodeById([project], docId)) return project.id
  }
  return null
}

export function LabProvider({ children }) {
  const [activeLabTab, setActiveLabTab] = useLocalStorage('kairos-active-lab-tab', 'practice')
  const [activeProjectId, setActiveProjectId] = useLocalStorage('kairos-active-project', 'proj-1')
  const [projectTree, setProjectTree] = useLocalStorage(STORAGE_KEYS.PROJECT_TREE, DEFAULT_PROJECT_TREE)
  const [constitution, setConstitution] = useLocalStorage(STORAGE_KEYS.CONSTITUTION, '')
  const [standardizingIds, setStandardizingIds] = useState([])
  const [activeDocId, setActiveDocId] = useState(null)
  const [activeHeadingId, setActiveHeadingId] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [highlightedDocId, setHighlightedDocId] = useState(null)
  const [archivedMessageId, setArchivedMessageId] = useState(null)
  const [recentDocuments, setRecentDocuments] = useLocalStorage('kairos-recent-documents', [])
  const [labMode, setLabMode] = useLocalStorage('kairos-lab-mode', 'live')
  const [archaeologySessions, setArchaeologySessions] = useLocalStorage('kairos-archaeology-sessions', [])
  const [activeArchaeologyId, setActiveArchaeologyId] = useLocalStorage('kairos-active-archaeology-id', null)
  const [previousProjectId, setPreviousProjectId] = useState(null)

  useEffect(() => {
    const migrated = migrateMisplacedDocuments(projectTree)
    if (migrated.migratedCount > 0) {
      setProjectTree(migrated.tree)
    }
  }, [])

  const activeProject = projectTree.find(p => p.id === activeProjectId) || projectTree[0]

  const allDocuments = collectDocuments(activeProject ? [activeProject] : [])

  const standardizeContent = useCallback(async (text, templateType) => {
    await new Promise(resolve => setTimeout(resolve, 1200))
    const result = simulateAIResponse(text, templateType)
    return result
  }, [])

  const toggleTreeNode = useCallback((nodeId) => {
    setProjectTree(prev =>
      updateNodeInTree(prev, nodeId, node => ({ ...node, expanded: !node.expanded }))
    )
  }, [setProjectTree])

  const updateDocument = useCallback((docId, updates) => {
    setProjectTree(prev => {
      let updated = updateNodeInTree(prev, docId, node => {
        const result = { ...node, ...updates }
        const allText = extractAllTextForReferences(result)
        result.references = extractReferencedIds(allText)
        result.outline = autoGenerateOutline(result)
        return result
      })
      updated = syncAllBacklinks(updated)
      return updated
    })
  }, [setProjectTree])

  const appendContentToDocument = useCallback((docId, content, fieldKey = null, polish = false) => {
    setProjectTree(prev => {
      let updated = updateNodeInTree(prev, docId, node => {
        const result = { ...node }
        
        if (fieldKey && result.fields) {
          const currentValue = result.fields[fieldKey] || ''
          result.fields = {
            ...result.fields,
            [fieldKey]: currentValue + '\n\n' + content
          }
        } else {
          result.content = (result.content || '') + '\n\n' + content
        }
        
        const allText = extractAllTextForReferences(result)
        result.references = extractReferencedIds(allText)
        result.outline = autoGenerateOutline(result)
        
        return result
      })
      updated = syncAllBacklinks(updated)
      return updated
    })
  }, [setProjectTree])

  const addDocument = useCallback((parentId, doc) => {
    const validatedParentId = validateMountPoint(doc.docType, parentId, projectTree)
    
    const newDoc = makeDoc({
      ...doc,
      outline: doc.fields && Object.keys(doc.fields).length > 0
        ? parseOutlineFromFields(doc.fields)
        : parseOutlineFromContent(doc.content || ''),
      references: extractReferencedIds(extractAllTextForReferences(doc))
    })
    setProjectTree(prev => {
      let updated = addNodeToParent(prev, validatedParentId, newDoc)
      updated = syncAllBacklinks(updated)
      return updated
    })
    return newDoc.id
  }, [setProjectTree, projectTree])

  const deleteDocument = useCallback((docId) => {
    setProjectTree(prev => {
      let cleaned = updateNodeInTree(prev, docId, () => null)
      cleaned = removeNodeFromTree(cleaned, docId)
      cleaned = syncAllBacklinks(cleaned)
      return cleaned
    })
    if (activeDocId === docId) {
      setActiveDocId(null)
    }
  }, [setProjectTree, activeDocId])

  const dropToCreateDocument = useCallback((projectId, parentNodeId, dragData) => {
    const now = new Date()
    const timeStr = now.toLocaleDateString('zh-CN') + ' ' + now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    const title = dragData.text.slice(0, 15) + (dragData.text.length > 15 ? '...' : '')

    let categoryType = 'insight'
    let docTypeKey = 'document'
    const parentNode = findNodeById(projectTree, parentNodeId)
    if (parentNode) {
      if (parentNode.categoryType === 'archive') {
        categoryType = 'archive'
        docTypeKey = 'archive'
      } else if (parentNode.categoryType === 'decision') {
        categoryType = 'decision'
        docTypeKey = 'decision'
      } else if (parentNode.categoryType === 'insight') {
        docTypeKey = 'insight'
      }
    }

    const typeLabels = { insight: '灵感', archive: '文档', decision: '决策' }

    const newDoc = makeDoc({
      id: `doc-${Date.now()}`,
      name: title,
      docType: 'blank',
      typeKey: docTypeKey,
      type: typeLabels[categoryType] || '灵感',
      content: dragData.text + `\n\n---\n来源：实时演练 - ${timeStr}`,
      fields: {},
      references: [],
      backlinks: []
    })

    const validatedParentId = validateMountPoint('blank', parentNodeId, projectTree)

    setProjectTree(prev => {
      let updated = addNodeToParent(prev, validatedParentId, newDoc)
      updated = syncAllBacklinks(updated)
      return updated
    })

    setHighlightedDocId(newDoc.id)
    setTimeout(() => setHighlightedDocId(null), 2000)

    if (dragData.messageId) {
      setArchivedMessageId(dragData.messageId)
      setTimeout(() => setArchivedMessageId(null), 300)
    }

    return newDoc.id
  }, [projectTree, setProjectTree])

  const expandProjectNodes = useCallback((projectId) => {
    setProjectTree(prev =>
      updateNodeInTree(prev, projectId, node => ({
        ...node,
        expanded: true,
        children: expandAllNodesInTree(node.children || [])
      }))
    )
  }, [setProjectTree])

  const expandAllProjects = useCallback(() => {
    setProjectTree(prev =>
      prev.map(project => ({
        ...project,
        expanded: true,
        children: expandAllNodesInTree(project.children || [])
      }))
    )
  }, [setProjectTree])

  const navigateToDoc = useCallback((docId) => {
    const projectId = findProjectForDoc(projectTree, docId)
    if (projectId && projectId !== activeProjectId) {
      setActiveProjectId(projectId)
    }
    setTimeout(() => {
      setActiveDocId(docId)
      setActiveHeadingId(null)
      const el = document.getElementById(`section-${docId}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }, [projectTree, activeProjectId, setActiveProjectId])

  const openDocument = useCallback((docId) => {
    navigateToDoc(docId)
    setRecentDocuments(prev => {
      const filtered = prev.filter(id => id !== docId)
      return [docId, ...filtered].slice(0, 10)
    })
  }, [navigateToDoc, setRecentDocuments])

  const switchProject = useCallback((projectId) => {
    setActiveProjectId(projectId)
    setActiveDocId(null)
    setActiveHeadingId(null)
  }, [setActiveProjectId])

  const toggleDecisionStatus = useCallback((nodeId) => {
    setProjectTree(prev =>
      updateNodeInTree(prev, nodeId, node => {
        const statusCycle = { exploring: 'locked', locked: 'rejected', rejected: 'exploring' }
        return { ...node, status: statusCycle[node.status] || 'exploring' }
      })
    )
  }, [setProjectTree])

  const getProjectHealth = useCallback((projectId) => {
    const project = projectTree.find(p => p.id === projectId)
    if (!project) return { total: 0, locked: 0, percentage: 0 }

    let total = 0
    let locked = 0

    function walk(nodes) {
      for (const node of nodes) {
        if (node.type === 'document' && node.docType === 'decision') {
          total++
          if (node.status === 'locked') locked++
        }
        if (node.children) walk(node.children)
      }
    }

    walk([project])
    return {
      total,
      locked,
      percentage: total > 0 ? Math.round((locked / total) * 100) : 0
    }
  }, [projectTree])

  const switchLabMode = useCallback((mode) => {
    if (mode === 'archaeology' && labMode === 'live') {
      setPreviousProjectId(activeProjectId)
    }
    if (mode === 'live' && labMode === 'archaeology') {
      if (previousProjectId) {
        setActiveProjectId(previousProjectId)
        setPreviousProjectId(null)
      }
      setActiveArchaeologyId(null)
    }
    setLabMode(mode)
  }, [labMode, activeProjectId, previousProjectId, setActiveProjectId])

  const createArchaeologySession = useCallback((rawText, title) => {
    const session = {
      id: `arch-${Date.now()}`,
      title: title || rawText.slice(0, 20).replace(/\n/g, ' '),
      rawText,
      analyzedAt: new Date().toISOString(),
      timeline: [],
      decisions: [],
      blindSpots: [],
      actionItems: []
    }
    setArchaeologySessions(prev => [session, ...prev])
    setActiveArchaeologyId(session.id)
    return session
  }, [setArchaeologySessions])

  const updateArchaeologySession = useCallback((sessionId, updates) => {
    setArchaeologySessions(prev =>
      prev.map(s => s.id === sessionId ? { ...s, ...updates } : s)
    )
  }, [setArchaeologySessions])

  const deleteArchaeologySession = useCallback((sessionId) => {
    setArchaeologySessions(prev => prev.filter(s => s.id !== sessionId))
    if (activeArchaeologyId === sessionId) {
      setActiveArchaeologyId(null)
    }
  }, [setArchaeologySessions, activeArchaeologyId])

  const archiveToProject = useCallback((sessionId, item, targetProjectId, targetCategoryType) => {
    const session = archaeologySessions.find(s => s.id === sessionId)
    if (!session) return { newDocId: null, parentCategoryId: null, wasProjectSwitch: false }

    const wasProjectSwitch = targetProjectId !== activeProjectId
    if (wasProjectSwitch) {
      setActiveProjectId(targetProjectId)
    }

    const newDocId = `doc-${Date.now()}`
    const newDoc = makeDoc({
      id: newDocId,
      name: item.title || item.text?.slice(0, 30) || '未命名',
      content: item.text || item.summary || '',
      docType: targetCategoryType === 'decision' ? 'decision' : targetCategoryType === 'insight' ? 'insight' : 'archive',
      fields: item.fields || {},
      status: 'exploring'
    })

    let parentCategoryId = null
    setProjectTree(prev =>
      updateNodeInTree(prev, targetProjectId, projectNode => {
        const categoryNode = projectNode.children?.find(c =>
          c.type === 'category' && c.categoryType === targetCategoryType
        )
        if (categoryNode) {
          parentCategoryId = categoryNode.id
          return {
            ...projectNode,
            expanded: true,
            children: projectNode.children.map(c =>
              c.id === categoryNode.id
                ? { ...c, expanded: true, children: [...(c.children || []), newDoc] }
                : c
            )
          }
        }
        return projectNode
      })
    )

    return { newDocId, parentCategoryId, wasProjectSwitch }
  }, [archaeologySessions, activeProjectId, setProjectTree, setActiveProjectId])

  const highlightNodeAfterRender = useCallback((docId, callback) => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const node = document.querySelector(`[data-node-id="${docId}"]`)
        if (node) {
          node.scrollIntoView({ behavior: 'smooth', block: 'center' })
          node.classList.add('highlight-pulse')
          setTimeout(() => node.classList.remove('highlight-pulse'), 2000)
          if (callback) callback()
        }
      }, 100)
    })
  }, [])

  const value = {
    activeLabTab,
    setActiveLabTab,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    projectTree,
    setProjectTree,
    allDocuments,
    activeDocId,
    setActiveDocId,
    activeHeadingId,
    setActiveHeadingId,
    constitution,
    setConstitution,
    standardizeContent,
    standardizingIds,
    setStandardizingIds,
    toggleTreeNode,
    updateDocument,
    addDocument,
    deleteDocument,
    dropToCreateDocument,
    expandProjectNodes,
    expandAllProjects,
    navigateToDoc,
    openDocument,
    switchProject,
    toggleDecisionStatus,
    getProjectHealth,
    labMode,
    switchLabMode,
    archaeologySessions,
    activeArchaeologyId,
    setActiveArchaeologyId,
    createArchaeologySession,
    updateArchaeologySession,
    deleteArchaeologySession,
    archiveToProject,
    highlightNodeAfterRender,
    appendContentToDocument,
    sidebarCollapsed,
    setSidebarCollapsed,
    highlightedDocId,
    setHighlightedDocId,
    archivedMessageId,
    recentDocuments,
    findNodeById: (id) => findNodeById(projectTree, id)
  }

  return (
    <LabContext.Provider value={value}>
      {children}
    </LabContext.Provider>
  )
}

export function useLab() {
  const context = useContext(LabContext)
  if (!context) {
    throw new Error('useLab must be used within a LabProvider')
  }
  return context
}
