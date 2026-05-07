import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useLocalStorage, STORAGE_KEYS } from '../hooks/useLocalStorage'
import { syncAllBacklinks, extractReferencedIds } from '../utils/linkParser'
import { getForcedCategory } from '../config/templates'
import { autoGenerateOutline } from '../utils/outlineGenerator'
import { buildAuditPrompt, buildSummonMentorMessage } from '../config/aiPrompts'

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

function parseAIMetadata(content) {
  try {
    const lastBraceIndex = content.lastIndexOf('```json')
    if (lastBraceIndex === -1) return null
    
    const jsonStart = content.indexOf('{', lastBraceIndex)
    const jsonEnd = content.lastIndexOf('}') + 1
    
    if (jsonStart === -1 || jsonEnd === -1) return null
    
    const jsonString = content.slice(jsonStart, jsonEnd)
    return JSON.parse(jsonString)
  } catch {
    return null
  }
}

function extractDecisionsFromMetadata(metadata) {
  const decisions = []
  
  if (metadata?.key_assumptions) {
    for (const assumption of metadata.key_assumptions) {
      if (assumption.decision || assumption.confidence) {
        decisions.push({
          type: 'assumption',
          content: assumption.text || assumption,
          confidence: assumption.confidence,
          rationale: assumption.rationale
        })
      }
    }
  }
  
  if (metadata?.action_items) {
    for (const action of metadata.action_items) {
      decisions.push({
        type: 'action',
        content: action.text || action,
        owner: action.owner,
        deadline: action.deadline
      })
    }
  }
  
  if (metadata?.fatal_risks) {
    for (const risk of metadata.fatal_risks) {
      decisions.push({
        type: 'risk',
        content: risk.text || risk,
        impact: risk.impact,
        mitigation: risk.mitigation
      })
    }
  }
  
  return decisions
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
  const [allHistoryMessages, setAllHistoryMessages] = useLocalStorage('kairos-all-history-messages', {})
  const [currentSessionId, setCurrentSessionId] = useLocalStorage('kairos-current-session-id', null)
  const [viewingHistorySessionId, setViewingHistorySessionId] = useState(null)
  const [expertMode, setExpertMode] = useLocalStorage('kairos-expert-mode', 'pressure')
  const [documentConflicts, setDocumentConflicts] = useState({})
  const [labMessageToSend, setLabMessageToSend] = useState(null)
  const [autoSendLabMessage, setAutoSendLabMessage] = useState(false)
  const [projectMemories, setProjectMemories] = useLocalStorage('kairos-project-memories', {})

  useEffect(() => {
    if (!currentSessionId) {
      const newSessionId = `session_${Date.now()}`
      setCurrentSessionId(newSessionId)
    }
  }, [])

  useEffect(() => {
    const migrated = migrateMisplacedDocuments(projectTree)
    if (migrated.migratedCount > 0) {
      setProjectTree(migrated.tree)
    }
  }, [])

  // 数据迁移：为缺少 manifesto 文档的项目自动创建
  useEffect(() => {
    if (!projectTree || projectTree.length === 0) return

    let hasChanges = false
    let updatedTree = [...projectTree]

    updatedTree = updatedTree.map(project => {
      // 检查项目是否已有 manifesto 文档
      const hasManifestoDoc = project.children?.some(category =>
        category.children?.some(doc =>
          doc.docType === 'manifesto' || doc.typeKey === 'manifesto'
        )
      )

      if (!hasManifestoDoc) {
        console.log(`🔄 项目 "${project.name}" 缺少核心定位文档，正在创建...`)

        const constitutionCategory = project.children?.find(cat =>
          cat.categoryType === 'constitution' || cat.id.includes('cat-constitution')
        )

        if (constitutionCategory) {
          hasChanges = true

          const manifestoDocId = `${project.id}-doc-manifesto`
          const newManifestoDoc = {
            id: manifestoDocId,
            name: '核心定位',
            type: 'document',
            docType: 'manifesto',
            typeKey: 'manifesto',
            parentId: constitutionCategory.id,
            fields: project.constitution?.manifesto?.fields || {
              slogan: '',
              description: '',
              targetUser: '',
              differentiation: '',
              vibe: '',
              antiWhat: ''
            },
            content: '',
            version: project.constitution?.manifesto?.version || 1,
            versionHistory: project.constitution?.manifesto?.versionHistory || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          return {
            ...project,
            children: project.children.map(cat =>
              cat.id === constitutionCategory.id
                ? { ...cat, children: [...(cat.children || []), newManifestoDoc] }
                : cat
            ),
            constitution: {
              ...project.constitution,
              manifestoDocId: manifestoDocId
            },
            updatedAt: new Date().toISOString()
          }
        }
      }

      return project
    })

    if (hasChanges) {
      console.log('✅ 数据迁移完成：已为所有项目创建核心定位文档')
      setProjectTree(updatedTree)
    }
  }, [projectTree.length]) // 只在项目数量变化时执行一次

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

  const updateManifesto = useCallback((projectId, newFields, changeReason = '', metadata = {}) => {
    console.log('🎯 更新核心定位 (Manifesto)', { projectId, changeReason, metadata })

    setProjectTree(prev => {
      const project = prev.find(p => p.id === projectId)
      if (!project) {
        console.warn('项目未找到:', projectId)
        return prev
      }

      const oldFields = project.constitution?.manifesto?.fields || {}
      
      // 检测关键字段变化
      const keyFieldsChanged = {
        slogan: oldFields.slogan !== newFields.slogan,
        differentiation: oldFields.differentiation !== newFields.differentiation,
        antiWhat: oldFields.antiWhat !== newFields.antiWhat
      }

      const hasSignificantChange = Object.values(keyFieldsChanged).some(v => v)

      // 1. 保存新字段并记录版本历史
      const newVersion = (project.constitution?.manifesto?.version || 0) + 1
      const versionRecord = {
        version: newVersion,
        timestamp: new Date().toISOString(),
        fields: { ...newFields },
        changeReason: changeReason || '手动更新',
        changedFields: Object.keys(newFields).filter(key => oldFields[key] !== newFields[key])
      }

      const updatedHistory = [
        ...(project.constitution?.manifesto?.versionHistory || []),
        versionRecord
      ].slice(-20) // 只保留最近20个版本

      let updated = prev.map(p => {
        if (p.id !== projectId) return p

        return {
          ...p,
          constitution: {
            ...p.constitution,
            manifesto: {
              ...(p.constitution?.manifesto || {}),
              fields: newFields,
              version: newVersion,
              versionHistory: updatedHistory,
              lastUpdated: new Date().toISOString(),
              ...metadata
            },
            corePositioning: newFields.slogan || p.constitution?.corePositioning
          },
          updatedAt: new Date().toISOString()
        }
      })

      // 2. 如果有关键字段变化，自动触发审计
      if (hasSignificantChange) {
        console.log('🔍 检测到关键定位变化，准备触发审计...')
        
        // 延迟执行审计，确保状态已更新
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('manifesto:changed', {
              detail: {
                projectId,
                oldFields,
                newFields,
                changedFields: keyFieldsChanged,
                changeReason
              }
            }))
          }
        }, 100)
      }

      // 3. 同步反链和引用
      updated = syncAllBacklinks(updated)

      return updated
    })
  }, [setProjectTree])

  const appendContentToDocument = useCallback((docId, content, fieldKey = null, polish = false, source = null) => {
    setProjectTree(prev => {
      let updated = updateNodeInTree(prev, docId, node => {
        const result = { ...node }
        
        const contentWithSource = source ? {
          text: content,
          source: {
            projectId: source.projectId,
            sessionId: source.sessionId,
            messageId: source.messageId,
            timestamp: source.timestamp
          }
        } : content
        
        if (fieldKey && result.fields) {
          const currentValue = result.fields[fieldKey] || ''
          result.fields = {
            ...result.fields,
            [fieldKey]: typeof currentValue === 'string' 
              ? { text: currentValue, sources: [] }
              : currentValue
          }
          if (source) {
            result.fields[fieldKey].sources = [
              ...(result.fields[fieldKey].sources || []),
              { text: content, ...source }
            ]
          } else {
            result.fields[fieldKey].text += '\n\n' + content
          }
        } else {
          if (typeof result.content === 'string') {
            result.content = {
              text: result.content || '',
              sources: source ? [{ text: content, ...source }] : []
            }
          } else {
            result.content = result.content || { text: '', sources: [] }
            if (source) {
              result.content.sources.push({ text: content, ...source })
            } else {
              result.content.text += '\n\n' + content
            }
          }
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

  const saveMessageToHistory = useCallback((projectId, message) => {
    setAllHistoryMessages(prev => {
      const projectHistory = prev[projectId] || {}
      const sessionHistory = projectHistory[currentSessionId] || []

      const newSessionHistory = [...sessionHistory, message]

      return {
        ...prev,
        [projectId]: {
          ...projectHistory,
          [currentSessionId]: newSessionHistory
        }
      }
    })

    if (message.type === 'assistant') {
      const metadata = parseAIMetadata(message.content)
      if (metadata) {
        const decisions = extractDecisionsFromMetadata(metadata)
        if (decisions.length > 0) {
          decisions.forEach(decision => {
            autoCreateDecisionDoc(projectId, decision)
          })
        }
      }

      updateProjectMemory(projectId, message.content)
    }

    if (message.type === 'user') {
      updateProjectMemory(projectId, message.content, 'user')
    }
  }, [currentSessionId])

  const startNewSession = useCallback(() => {
    const newSessionId = `session_${Date.now()}`
    setCurrentSessionId(newSessionId)
    setViewingHistorySessionId(null)
  }, [])

  const extractKeyInsights = (text) => {
    const insights = []

    const insightPatterns = [
      /(?:关键洞察|核心发现|洞察|insight)[:：]\s*(.+)/gi,
      /(?:值得注意的是|值得关注|重点是)[:：]\s*(.+)/gi,
      /(?:用户痛点|用户需求|用户行为)[:：]\s*(.+)/gi,
      /(?:竞争优势|differentiation|差异化)[:：]\s*(.+)/gi,
      /(?:风险|risk|威胁)[:：]\s*(.+)/gi,
      /(?:机会|opportunity|切入点)[:：]\s*(.+)/gi,
    ]

    for (const pattern of insightPatterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        insights.push(match[1].trim())
      }
    }

    if (text.length > 20 && insights.length === 0) {
      const sentences = text.split(/[.。!！?？]/).filter(s => s.trim().length > 10)
      if (sentences.length > 0) {
        insights.push(sentences[0].trim())
      }
    }

    return insights.slice(0, 3)
  }

  const updateProjectMemory = useCallback((projectId, content, role = 'assistant') => {
    const insights = extractKeyInsights(content)
    const timestamp = new Date().toISOString()

    setProjectMemories(prev => {
      const projectMemory = prev[projectId] || {
        lastUpdated: null,
        totalInteractions: 0,
        insights: [],
        discussionTopics: [],
        userInputs: [],
        assistantResponses: []
      }

      const newMemory = {
        ...projectMemory,
        lastUpdated: timestamp,
        totalInteractions: projectMemory.totalInteractions + 1
      }

      if (role === 'user' && content.trim()) {
        newMemory.userInputs = [
          ...projectMemory.userInputs.slice(-19),
          { content: content.slice(0, 200), timestamp }
        ]
        newMemory.discussionTopics = [
          ...projectMemory.discussionTopics.filter(t => t !== content.slice(0, 50)),
          content.slice(0, 50)
        ].slice(-10)
      }

      if (role === 'assistant' && insights.length > 0) {
        const existingInsightTexts = projectMemory.insights.map(i => i.text)
        for (const insight of insights) {
          if (!existingInsightTexts.includes(insight)) {
            newMemory.insights = [
              ...projectMemory.insights,
              { text: insight, timestamp, source: 'ai' }
            ].slice(-20)
          }
        }
      }

      if (role === 'assistant' && content.trim()) {
        newMemory.assistantResponses = [
          ...projectMemory.assistantResponses.slice(-9),
          { content: content.slice(0, 150), timestamp }
        ]
      }

      return {
        ...prev,
        [projectId]: newMemory
      }
    })
  }, [])

  const getProjectMemory = useCallback((projectId) => {
    return projectMemories[projectId] || null
  }, [projectMemories])

  const clearProjectMemory = useCallback((projectId) => {
    setProjectMemories(prev => {
      const newMemories = { ...prev }
      delete newMemories[projectId]
      return newMemories
    })
  }, [])

  const getMemorySummary = useCallback((projectId) => {
    const memory = projectMemories[projectId]
    if (!memory) return null

    return {
      totalInteractions: memory.totalInteractions,
      lastUpdated: memory.lastUpdated,
      insightCount: memory.insights.length,
      recentTopics: memory.discussionTopics.slice(-5),
      recentInsight: memory.insights[memory.insights.length - 1]?.text || null
    }
  }, [projectMemories])

  const autoCreateDecisionDoc = useCallback((projectId, decision) => {
    const newDocId = `doc-${Date.now()}`
    const typeLabels = {
      assumption: '假设',
      action: '行动',
      risk: '风险'
    }
    
    const newDoc = makeDoc({
      id: newDocId,
      name: `${typeLabels[decision.type] || '决策'}: ${decision.content.slice(0, 30)}${decision.content.length > 30 ? '...' : ''}`,
      docType: 'decision',
      fields: {
        decisionContent: decision.content,
        decisionBasis: decision.rationale || decision.mitigation || '',
        alternatives: decision.type === 'assumption' ? '待验证' : '',
        confidence: decision.confidence || '中',
        decisionDate: new Date().toISOString().split('T')[0]
      },
      status: 'exploring'
    })

    setProjectTree(prev => {
      return updateNodeInTree(prev, projectId, projectNode => {
        const decisionCategory = projectNode.children?.find(c => 
          c.type === 'category' && c.categoryType === 'decision'
        )
        
        if (decisionCategory) {
          return {
            ...projectNode,
            expanded: true,
            children: projectNode.children.map(c =>
              c.id === decisionCategory.id
                ? { ...c, expanded: true, children: [...(c.children || []), newDoc] }
                : c
            )
          }
        }
        
        return projectNode
      })
    })

    console.log(`自动创建决策文档: ${newDoc.name}`)
  }, [])

  const jumpToSource = useCallback((source) => {
    if (!source) return
    
    setActiveProjectId(source.projectId)
    setLabMode('live')
    setViewingHistorySessionId(source.sessionId)
    
    setTimeout(() => {
      const messageEl = document.querySelector(`[data-message-id="${source.messageId}"]`)
      if (messageEl) {
        messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        messageEl.classList.add('highlight-pulse')
        setTimeout(() => messageEl.classList.remove('highlight-pulse'), 2000)
      }
    }, 300)
  }, [setActiveProjectId, setLabMode])

  const switchExpertMode = useCallback((mode) => {
    setExpertMode(mode)
  }, [])

  const getExpertModePrompt = useCallback(() => {
    if (expertMode === 'guided') {
      return `
你是 Kairos 思维实验室的深度引导教练。
你的任务不是给出答案，而是通过精准的追问，帮助对话者自己发现盲区、理清逻辑、形成洞察。

规则：
1. 永远不要直接说出结论——用问题引导对方自己抵达
2. 当对方给出一个主张，追问其前提假设
3. 当对方回避一个方向，温和地重新打开那个方向
4. 当对方形成洞察，要求其清晰表述并记录
5. 每轮结束不追问，而是询问"你现在怎么理解这个问题？"

禁止：直接评价（包括正面评价）、直接建议、直接给出答案
      `.trim()
    }
    
    return `
你是 Kairos 专家评审团，由顶级投资人、资深产品经理、行业分析师组成。
你的任务是对用户的商业想法进行深度压力测试。

规则：
1. 绕过表面的赞美，直接进行深度压力测试
2. 从商业漏洞、产品逻辑、社会心理、落地可行性四个维度进行审计
3. 每一轮回复必须以一个"致命追问"结束
4. 输出格式：先给出你的分析，然后在末尾用 JSON 格式输出关键信息，包含 action_items、key_assumptions、fatal_risks

输出格式示例：
你的分析内容...

\`\`\`json
{
  "action_items": [{"text": "xxx", "owner": "xxx", "deadline": "xxx"}],
  "key_assumptions": [{"text": "xxx", "confidence": "高/中/低", "rationale": "xxx"}],
  "fatal_risks": [{"text": "xxx", "impact": "高/中/低", "mitigation": "xxx"}]
}
\`\`\`
      `.trim()
  }, [expertMode])

  const auditConstitutionVsPRD = useCallback(async (projectId, prdDocId) => {
    const project = projectTree.find(p => p.id === projectId)
    if (!project) return null

    const constitution = project.constitution || {}
    const constraints = constitution.constraints || []
    
    if (constraints.length === 0) {
      setDocumentConflicts(prev => ({ ...prev, [prdDocId]: { hasConflict: false, conflicts: [], summary: '项目宪法中没有定义硬性约束' } }))
      return { hasConflict: false, conflicts: [], summary: '项目宪法中没有定义硬性约束' }
    }

    const prdDoc = findNodeById(projectTree, prdDocId)
    if (!prdDoc) {
      setDocumentConflicts(prev => ({ ...prev, [prdDocId]: { hasConflict: false, conflicts: [], summary: '未找到 PRD 文档' } }))
      return { hasConflict: false, conflicts: [], summary: '未找到 PRD 文档' }
    }

    const prdContent = prdDoc.content?.text || prdDoc.content || ''
    const prdFields = prdDoc.fields || {}
    const prdFullContent = prdContent + '\n\n' + JSON.stringify(prdFields, null, 2)

    const constitutionText = constraints.map((c, i) => `${i + 1}. ${c}`).join('\n')
    
    const prompt = buildAuditPrompt(constitutionText, prdFullContent)
    
    const mockResult = {
      hasConflict: false,
      conflicts: [],
      summary: '未发现冲突'
    }
    
    if (prdContent.toLowerCase().includes('ios') && constraints.some(c => c.toLowerCase().includes('android'))) {
      mockResult.hasConflict = true
      mockResult.conflicts = [{
        constraintIndex: constraints.findIndex(c => c.toLowerCase().includes('android')),
        constraintText: constraints.find(c => c.toLowerCase().includes('android')) || '',
        prdViolation: 'PRD 内容中提到了 iOS 相关功能',
        severity: 'high'
      }]
      mockResult.summary = `发现 ${mockResult.conflicts.length} 处冲突：PRD 中提到的 iOS 功能违反了约束。`
    }

    setDocumentConflicts(prev => ({ ...prev, [prdDocId]: mockResult }))
    return mockResult
  }, [projectTree])

  const getDocumentConflicts = useCallback((docId) => {
    return documentConflicts[docId] || null
  }, [documentConflicts])

  const clearDocumentConflicts = useCallback((docId) => {
    setDocumentConflicts(prev => {
      const newConflicts = { ...prev }
      delete newConflicts[docId]
      return newConflicts
    })
  }, [])

  const auditFullProject = useCallback((projectId) => {
    const project = projectTree.find(p => p.id === projectId)
    if (!project) return null

    const issues = []
    let score = 100

    const constitution = project.constitution || {}
    const constraints = constitution.constraints || []
    
    if (constraints.length === 0) {
      issues.push({ type: 'warning', message: '项目宪法中没有定义硬性约束', severity: 'medium' })
      score -= 10
    }

    const prdDocs = collectDocuments([project]).filter(d => d.docType === 'prd')
    if (prdDocs.length === 0) {
      issues.push({ type: 'info', message: '尚未创建 PRD 文档', severity: 'low' })
      score -= 5
    } else {
      for (const prd of prdDocs) {
        const conflicts = documentConflicts[prd.id]
        if (conflicts?.hasConflict) {
          issues.push({ 
            type: 'error', 
            message: `PRD "${prd.name}" 存在宪法冲突`, 
            severity: 'high',
            docId: prd.id,
            conflicts: conflicts.conflicts
          })
          score -= conflicts.conflicts.length * 15
        }
      }
    }

    const decisionDocs = collectDocuments([project]).filter(d => d.docType === 'decision')
    const incompleteDecisions = decisionDocs.filter(d => !d.fields?.decisionBasis || !d.fields?.decisionContent)
    if (incompleteDecisions.length > 0) {
      issues.push({ 
        type: 'warning', 
        message: `${incompleteDecisions.length} 个决策文档内容不完整`, 
        severity: 'medium' 
      })
      score -= incompleteDecisions.length * 5
    }

    const personaDocs = collectDocuments([project]).filter(d => d.docType === 'persona')
    if (personaDocs.length === 0) {
      issues.push({ type: 'info', message: '尚未创建用户画像文档', severity: 'low' })
      score -= 5
    }

    return {
      score: Math.max(0, score),
      issues,
      summary: {
        totalDocs: collectDocuments([project]).length,
        decisionCount: decisionDocs.length,
        prdCount: prdDocs.length,
        personaCount: personaDocs.length
      }
    }
  }, [projectTree, documentConflicts])

  const summonMentor = useCallback((docId) => {
    const doc = findNodeById(projectTree, docId)
    if (!doc) return

    const project = projectTree.find(p => p.id === activeProjectId)
    if (!project) return

    const constitution = project.constitution || {}
    const constraints = (constitution.constraints || []).join('\n')
    const decisions = (constitution.decisions || []).map(d => `- ${d}`).join('\n')
    const vetoes = (constitution.vetoes || []).map(v => `- ${v}`).join('\n')

    let constitutionText = ''
    if (constraints) constitutionText += `【硬性约束】\n${constraints}\n`
    if (decisions) constitutionText += `【已做决策】\n${decisions}\n`
    if (vetoes) constitutionText += `【否决墓地】\n${vetoes}\n`

    const memory = projectMemories[activeProjectId]
    let memoryContext = ''
    if (memory && memory.insights.length > 0) {
      memoryContext = `\n\n【历史讨论洞察】\n`
      const recentInsights = memory.insights.slice(-5)
      recentInsights.forEach((insight, i) => {
        memoryContext += `${i + 1}. ${insight.text}\n`
      })
    }

    const moduleName = doc.name
    let docContent = ''

    if (doc.content?.text) {
      docContent = doc.content.text
    } else if (doc.content) {
      docContent = doc.content
    } else if (doc.fields) {
      docContent = Object.entries(doc.fields)
        .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
        .join('\n')
    }

    if (!docContent.trim()) {
      docContent = '(文档暂无内容)'
    }

    const message = buildSummonMentorMessage(moduleName, docContent, {
      constitution: constitutionText,
      memory: memoryContext
    })

    setLabMessageToSend(message)
    setAutoSendLabMessage(true)
    setExpertMode('guided')

    setTimeout(() => {
      setLabMessageToSend(null)
      setAutoSendLabMessage(false)
    }, 5000)
  }, [projectTree, activeProjectId, projectMemories])

  const addDocumentToCategory = useCallback((projectId, categoryType, docData) => {
    const newDocId = `doc-${Date.now()}`
    const newDoc = makeDoc({
      id: newDocId,
      ...docData
    })

    let parentCategoryId = null
    setProjectTree(prev => {
      return updateNodeInTree(prev, projectId, projectNode => {
        const categoryNode = projectNode.children?.find(c => 
          c.type === 'category' && c.categoryType === categoryType
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
    })

    return { newDocId, parentCategoryId, wasProjectSwitch: false }
  }, [])

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

  const createProject = useCallback((name, constitutionData = null) => {
    const projectId = `proj-${Date.now()}`

    const defaultConstitution = constitutionData || {
      corePositioning: '未设置核心定位',
      constraints: [],
      manifesto: {
        fields: {
          slogan: '',
          description: '',
          targetUser: '',
          differentiation: '',
          vibe: '',
          antiWhat: ''
        },
        version: 1,
        versionHistory: []
      },
      manifestoDocId: null // 将在创建文档后填充
    }

    // 自动生成核心定位文档
    const manifestoDocId = `${projectId}-doc-manifesto`

    // 填充 manifestoDocId 到 constitution
    defaultConstitution.manifestoDocId = manifestoDocId

    const newProject = {
      id: projectId,
      name: name || '新项目',
      type: 'project',
      expanded: true,
      constitution: defaultConstitution,
      children: [
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
              fields: defaultConstitution.manifesto?.fields || {},
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
          categoryType: 'market-insight',
          expanded: false,
          children: []
        },
        {
          id: `${projectId}-cat-product`,
          name: '03 产品与商业策略',
          type: 'category',
          categoryType: 'product-strategy',
          expanded: false,
          children: []
        },
        {
          id: `${projectId}-cat-decision-chain`,
          name: '04 决策链图谱',
          type: 'category',
          categoryType: 'decision-chain',
          expanded: false,
          isSpecial: true,
          children: []
        },
        {
          id: `${projectId}-cat-audit`,
          name: '05 反脆弱审计',
          type: 'category',
          categoryType: 'anti-fragile-audit',
          expanded: false,
          children: []
        },
        {
          id: `${projectId}-cat-execution`,
          name: '06 执行路线图',
          type: 'category',
          categoryType: 'execution-roadmap',
          expanded: false,
          children: []
        }
      ]
    }

    setProjectTree(prev => [...prev, newProject])
    setActiveProjectId(projectId)

    console.log(`✅ 项目已创建: ${name || '新项目'}`, { projectId, manifestoDocId })

    return projectId
  }, [setProjectTree, setActiveProjectId])

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
    updateManifesto,
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
    createProject,
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
    allHistoryMessages,
    currentSessionId,
    viewingHistorySessionId,
    setViewingHistorySessionId,
    saveMessageToHistory,
    startNewSession,
    jumpToSource,
    addDocumentToCategory,
    expertMode,
    switchExpertMode,
    getExpertModePrompt,
    auditConstitutionVsPRD,
    getDocumentConflicts,
    clearDocumentConflicts,
    auditFullProject,
    documentConflicts,
    summonMentor,
    labMessageToSend,
    autoSendLabMessage,
    projectMemories,
    getProjectMemory,
    clearProjectMemory,
    getMemorySummary,
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
