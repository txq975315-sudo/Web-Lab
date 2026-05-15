/**
 * 项目树与文档的单一真相入口（持久化：`STORAGE_KEYS.PROJECT_TREE` → thinking-lab-project-tree）。
 * 数据读写契约见仓库根目录 docs/DATA_CONTRACT.md — 新业务禁止写入 dataStore 扁平 store。
 */
import React, { createContext, useContext, useReducer, useEffect, useState, useCallback, useRef } from 'react'
import { useLocalStorage, STORAGE_KEYS } from '../hooks/useLocalStorage'
import { syncAllBacklinks, extractReferencedIds } from '../utils/linkParser'
import { getForcedCategory, getProjectCategoryParentId, TEMPLATES } from '../config/templates'
import { autoGenerateOutline } from '../utils/outlineGenerator'
import { migrateProjectTreeIfNeeded } from '../utils/projectTreeMigration'
import { archaeologyStore, store } from '../utils/dataStore'
import { summarizeLegacyFlat, normalizeFlatDocType } from '../utils/flatStoreMigration'
import {
  findNodeById,
  collectDocuments,
  findProjectForDoc,
  extractAllTextForReferences,
  updateNodeInTree,
  addNodeToParent,
  removeNodeFromTree,
} from '../utils/projectTreeOps.js'

const LabContext = createContext(null)

/** 右栏 Lab 模式；localStorage 若被写成旧值或非字符串，统一回落避免白屏 */
const VALID_LAB_MODES = new Set(['landing', 'dashboard', 'live', 'coach', 'archaeology'])

// Module 到分类节点 ID 的映射表
const MODULE_TO_CATEGORY_ID = {
  '01 项目宪法': 'cat-constitution',
  '02 市场与用户洞察': 'cat-market',
  '03 策略与增长': 'cat-strategy',
  '04 决策链图谱': 'cat-decision',
  '05 反脆弱审计': 'cat-antifragile',
  '06 执行路线图': 'cat-roadmap'
}

// 生成唯一ID的简单函数
function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// Action Types
const ActionTypes = {
  CREATE_PROJECT: 'CREATE_PROJECT',
  CREATE_DOCUMENT: 'CREATE_DOCUMENT',
  SAVE_DOCUMENT: 'SAVE_DOCUMENT',
  SELECT_DOCUMENT: 'SELECT_DOCUMENT',
  DELETE_DOCUMENT: 'DELETE_DOCUMENT',
  SET_EXPERT_MODE: 'SET_EXPERT_MODE',
  SET_ACTIVE_PROJECT: 'SET_ACTIVE_PROJECT',
  TOGGLE_TREE_NODE: 'TOGGLE_TREE_NODE',
  UPDATE_MANIFESTO: 'UPDATE_MANIFESTO',
  SET_PROJECT_TREE: 'SET_PROJECT_TREE'
}

// 默认项目树结构
const DEFAULT_PROJECT_TREE = [
  {
    id: 'proj-1',
    name: 'Kairos App',
    type: 'project',
    expanded: true,
    constitution: {
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
      manifestoDocId: 'proj-1-cat-constitution-doc-manifesto'
    },
    children: [
      {
        id: 'proj-1-cat-constitution',
        name: '01 项目宪法',
        type: 'category',
        categoryType: 'constitution',
        expanded: true,
        children: [
          {
            id: 'proj-1-cat-constitution-doc-manifesto',
            name: '核心定位',
            type: 'document',
            docType: 'manifesto',
            typeKey: 'manifesto',
            parentId: 'proj-1-cat-constitution',
            fields: {
              slogan: '',
              description: '',
              targetUser: '',
              differentiation: '',
              vibe: '',
              antiWhat: ''
            },
            content: '',
            version: 1,
            versionHistory: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      },
      {
        id: 'proj-1-cat-market',
        name: '02 市场与用户洞察',
        type: 'category',
        categoryType: 'market',
        expanded: false,
        children: []
      },
      {
        id: 'proj-1-cat-strategy',
        name: '03 策略与增长',
        type: 'category',
        categoryType: 'strategy',
        expanded: false,
        children: []
      },
      {
        id: 'proj-1-cat-decision',
        name: '04 决策链图谱',
        type: 'category',
        categoryType: 'decision',
        expanded: false,
        isSpecial: true,
        children: []
      },
      {
        id: 'proj-1-cat-antifragile',
        name: '05 反脆弱审计',
        type: 'category',
        categoryType: 'antifragile',
        expanded: false,
        children: []
      },
      {
        id: 'proj-1-cat-roadmap',
        name: '06 执行路线图',
        type: 'category',
        categoryType: 'roadmap',
        expanded: false,
        children: []
      }
    ]
  }
]

// 纯函数 reducer
function labReducer(state, action) {
  switch (action.type) {
    case ActionTypes.CREATE_PROJECT: {
      const { name, constitutionData, projectId: presetProjectId } = action.payload
      const projectId = presetProjectId || generateId('proj')
      
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
        manifestoDocId: null
      }

      const manifestoDocId = `${projectId}-cat-constitution-doc-manifesto`
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
            categoryType: 'market',
            expanded: false,
            children: []
          },
          {
            id: `${projectId}-cat-strategy`,
            name: '03 策略与增长',
            type: 'category',
            categoryType: 'strategy',
            expanded: false,
            children: []
          },
          {
            id: `${projectId}-cat-decision`,
            name: '04 决策链图谱',
            type: 'category',
            categoryType: 'decision',
            expanded: false,
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

      return {
        ...state,
        projectTree: [...state.projectTree, newProject],
        activeProjectId: projectId
      }
    }

    case ActionTypes.CREATE_DOCUMENT: {
      const { parentId, document } = action.payload
      
      const updatedTree = addNodeToParent(state.projectTree, parentId, document)
      const syncedTree = syncAllBacklinks(updatedTree)

      return {
        ...state,
        projectTree: syncedTree,
        activeDocId: document.id
      }
    }

    case ActionTypes.SAVE_DOCUMENT: {
      const { docId, updates } = action.payload
      
      const updatedTree = updateNodeInTree(state.projectTree, docId, node => {
        const updatedNode = { ...node, ...updates, updatedAt: new Date().toISOString() }
        const allText = extractAllTextForReferences(updatedNode)
        updatedNode.references = extractReferencedIds(allText)
        updatedNode.outline = autoGenerateOutline(updatedNode)
        return updatedNode
      })
      const syncedTree = syncAllBacklinks(updatedTree)

      return {
        ...state,
        projectTree: syncedTree
      }
    }

    case ActionTypes.SELECT_DOCUMENT: {
      return {
        ...state,
        activeDocId: action.payload.docId,
        activeHeadingId: null
      }
    }

    case ActionTypes.DELETE_DOCUMENT: {
      const { docId } = action.payload
      
      const updatedTree = removeNodeFromTree(state.projectTree, docId)
      const syncedTree = syncAllBacklinks(updatedTree)

      return {
        ...state,
        projectTree: syncedTree,
        activeDocId: state.activeDocId === docId ? null : state.activeDocId
      }
    }

    case ActionTypes.SET_EXPERT_MODE: {
      return {
        ...state,
        expertMode: action.payload.mode
      }
    }

    case ActionTypes.SET_ACTIVE_PROJECT: {
      return {
        ...state,
        activeProjectId: action.payload.projectId,
        activeDocId: null
      }
    }

    case ActionTypes.TOGGLE_TREE_NODE: {
      const { nodeId } = action.payload
      
      const updatedTree = updateNodeInTree(state.projectTree, nodeId, node => {
        return { ...node, expanded: !node.expanded }
      })

      return {
        ...state,
        projectTree: updatedTree
      }
    }

    case ActionTypes.UPDATE_MANIFESTO: {
      const { projectId, newFields, changeReason, metadata } = action.payload
      
      const updatedTree = updateNodeInTree(state.projectTree, projectId, project => {
        const oldFields = project.constitution?.manifesto?.fields || {}
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
        ].slice(-20)

        const updatedProject = {
          ...project,
          constitution: {
            ...project.constitution,
            manifesto: {
              ...(project.constitution?.manifesto || {}),
              fields: newFields,
              version: newVersion,
              versionHistory: updatedHistory,
              lastUpdated: new Date().toISOString(),
              ...metadata
            },
            corePositioning: newFields.slogan || project.constitution?.corePositioning
          },
          updatedAt: new Date().toISOString()
        }

        // 同时更新项目中的 manifesto 文档
        if (updatedProject.children) {
          updatedProject.children = updatedProject.children.map(cat => {
            if (cat.categoryType === 'constitution' || cat.id.includes('constitution')) {
              return {
                ...cat,
                children: (cat.children || []).map(doc => {
                  if (doc.docType === 'manifesto' || doc.typeKey === 'manifesto') {
                    return {
                      ...doc,
                      fields: newFields,
                      updatedAt: new Date().toISOString()
                    }
                  }
                  return doc
                })
              }
            }
            return cat
          })
        }

        return updatedProject
      })

      const syncedTree = syncAllBacklinks(updatedTree)

      return {
        ...state,
        projectTree: syncedTree
      }
    }

    case ActionTypes.SET_PROJECT_TREE: {
      return {
        ...state,
        projectTree: action.payload.tree
      }
    }

    default:
      return state
  }
}

export function LabProvider({ children }) {
  // 使用 localStorage 持久化
  const [activeLabTab, setActiveLabTab] = useLocalStorage(STORAGE_KEYS.ACTIVE_LAB_TAB, 'live')
  const [storedActiveProjectId, setStoredActiveProjectId] = useLocalStorage(STORAGE_KEYS.ACTIVE_PROJECT, null)
  const [storedProjectTree, setStoredProjectTree] = useLocalStorage(STORAGE_KEYS.PROJECT_TREE, DEFAULT_PROJECT_TREE)
  const [constitution, setConstitution] = useLocalStorage(STORAGE_KEYS.CONSTITUTION, '')
  const [recentDocuments, setRecentDocuments] = useLocalStorage(STORAGE_KEYS.RECENT_DOCUMENTS, [])
  const [labMode, setLabMode] = useLocalStorage(STORAGE_KEYS.LAB_MODE, 'landing')
  const [archaeologySessions, setArchaeologySessions] = useState([])
  const [activeArchaeologyId, setActiveArchaeologyId] = useLocalStorage(STORAGE_KEYS.ACTIVE_ARCHAEOLOGY_ID, null)
  const [storedExpertMode, setStoredExpertMode] = useLocalStorage(STORAGE_KEYS.EXPERT_MODE, 'pressure')
  const [allHistoryMessages, setAllHistoryMessages] = useLocalStorage(STORAGE_KEYS.ALL_HISTORY_MESSAGES, {})
  const [chatSessions, setChatSessions] = useLocalStorage(STORAGE_KEYS.CHAT_SESSIONS, {})
  const [currentSessionId, setCurrentSessionId] = useLocalStorage(STORAGE_KEYS.CURRENT_SESSION_ID, null)
  const [projectMemories, setProjectMemories] = useLocalStorage(STORAGE_KEYS.PROJECT_MEMORIES, {})

  const [standardizingIds, setStandardizingIds] = useState([])
  const [activeDocId, setActiveDocId] = useState(null)
  const [activeHeadingId, setActiveHeadingId] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [highlightedDocId, setHighlightedDocId] = useState(null)
  const [archivedMessageId, setArchivedMessageId] = useState(null)
  const [previousProjectId, setPreviousProjectId] = useState(null)
  /** 进入压力工作台前的项目 id；在台内未手动选项目时，离开 live 后恢复 */
  const pressureLiveStashedProjectRef = useRef(/** @type {string|null} */ (null))
  /** 从「历史压力练习」打开会话：切到 live 后由 LabPanel 消费 { sessionId, mode } */
  const pressureResumePayloadRef = useRef(/** @type {{ sessionId: string, mode: 'view' | 'practice' } | null} */ (null))
  const [pressureWorkbenchActiveSessionId, setPressureWorkbenchActiveSessionId] = useState(/** @type {string|null} */ (null))
  /** 从「历史假设构建」打开会话 */
  const hypothesisResumePayloadRef = useRef(/** @type {{ sessionId: string, mode: 'view' | 'practice' } | null} */ (null))
  const [hypothesisWorkbenchActiveSessionId, setHypothesisWorkbenchActiveSessionId] = useState(/** @type {string|null} */ (null))
  const [viewingHistorySessionId, setViewingHistorySessionId] = useState(null)
  const [documentConflicts, setDocumentConflicts] = useState({})
  const [labMessageToSend, setLabMessageToSend] = useState(null)
  const [autoSendLabMessage, setAutoSendLabMessage] = useState(false)

  // 首次加载时迁移旧版三栏（Insight/Archive/Decision）→ 标准 01–06 模块，并写入 localStorage
  const [state, dispatch] = useReducer(
    labReducer,
    {
      projectTree: storedProjectTree,
      activeProjectId: storedActiveProjectId,
      expertMode: storedExpertMode
    },
    (args) => {
      const { tree } = migrateProjectTreeIfNeeded(args.projectTree)
      return {
        projectTree: tree,
        activeProjectId: args.activeProjectId,
        activeDocId: null,
        activeHeadingId: null,
        expertMode: args.expertMode
      }
    }
  )

  // 同步到 localStorage
  useEffect(() => {
    setStoredProjectTree(state.projectTree)
  }, [state.projectTree, setStoredProjectTree])

  useEffect(() => {
    setStoredActiveProjectId(state.activeProjectId)
  }, [state.activeProjectId, setStoredActiveProjectId])

  useEffect(() => {
    setStoredExpertMode(state.expertMode)
  }, [state.expertMode, setStoredExpertMode])

  // 初始化 session id
  useEffect(() => {
    if (!currentSessionId) {
      const newSessionId = `session_${Date.now()}`
      setCurrentSessionId(newSessionId)
    }
  }, [currentSessionId, setCurrentSessionId])

  // 从 archaeologyStore 加载考古会话
  useEffect(() => {
    const sessions = archaeologyStore.getAllSessions()
    setArchaeologySessions(sessions)
  }, [])

  // 兼容旧版 practice；非法类型或非允许值时回落为 landing，避免渲染分支异常 / 白屏
  useEffect(() => {
    if (
      labMode === 'practice' ||
      typeof labMode !== 'string' ||
      !VALID_LAB_MODES.has(labMode)
    ) {
      setLabMode('landing')
    }
  }, [labMode, setLabMode])

  useEffect(() => {
    if (
      activeLabTab === 'practice' ||
      typeof activeLabTab !== 'string' ||
      !VALID_LAB_MODES.has(activeLabTab)
    ) {
      setActiveLabTab('live')
    }
  }, [activeLabTab, setActiveLabTab])

  // 辅助函数
  const activeProject =
    state.activeProjectId != null && state.activeProjectId !== ''
      ? state.projectTree.find((p) => p.id === state.activeProjectId) ?? null
      : null
  const allDocuments = activeProject ? collectDocuments([activeProject]) : []

  // 行动创建器
  const createProject = (name, constitutionData) => {
    const projectId = generateId('proj')
    dispatch({
      type: ActionTypes.CREATE_PROJECT,
      payload: { name, constitutionData, projectId }
    })
    return projectId
  }

  const createDocument = (parentId, docData, options = {}) => {
    const { trustParentId = false } = options
    const docId = generateId('doc')
    const document = {
      id: docId,
      type: 'document',
      docType: 'blank',
      typeKey: 'blank',
      parentId,
      fields: {},
      content: '',
      status: 'exploring',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...docData
    }

    let validatedParentId = parentId

    if (!trustParentId) {
      const activeProject = state.projectTree.find(p => p.id === state.activeProjectId)

      if (activeProject && activeProject.children) {
        const forcedCategory = getForcedCategory(document.docType, activeProject.children)
        if (forcedCategory) {
          validatedParentId = forcedCategory
        } else {
          validatedParentId = activeProject.children[0]?.id
        }
      }
    }

    dispatch({
      type: ActionTypes.CREATE_DOCUMENT,
      payload: { parentId: validatedParentId, document }
    })

    return docId
  }

  /**
   * 将早期扁平库（LEGACY_FLAT_DATA）中的项目/文档合并进当前 projectTree（侧栏树）。
   * 同一扁平项目 id 若已存在于树中则文档并入该项目，否则新建「迁移」前缀项目。
   */
  const migrateLegacyFlatStore = useCallback(() => {
    const data = store._getData()
    const summary = summarizeLegacyFlat(data)
    if (summary.projectCount === 0) {
      return { ok: false, message: '早期扁平库中没有任何项目' }
    }
    if (summary.docCount === 0) {
      return { ok: false, message: '扁平库中有项目但没有任何文档可迁移' }
    }

    let projectsCreated = 0
    let documentsMigrated = 0

    for (const fp of data.projects) {
      if (!fp || typeof fp.id !== 'string') continue

      const existing = state.projectTree.find((p) => p.id === fp.id)
      const targetProjectId = existing ? fp.id : (() => {
        projectsCreated += 1
        return createProject(`「迁移」${fp.name || '未命名项目'}`)
      })()

      const docs = data.documents?.[fp.id] || []
      for (const d of docs) {
        if (!d || typeof d !== 'object') continue
        const dt = normalizeFlatDocType(d.docType)
        const parentId = getProjectCategoryParentId(targetProjectId, dt)
        createDocument(
          parentId,
          {
            docType: dt,
            typeKey: dt,
            name: d.title || d.name || '未命名文档',
            content: typeof d.content === 'string' ? d.content : '',
            fields: d.fields && typeof d.fields === 'object' ? d.fields : {},
            status: 'exploring',
            createdAt: d.createdAt || new Date().toISOString(),
            updatedAt: d.updatedAt || new Date().toISOString()
          },
          { trustParentId: true }
        )
        documentsMigrated += 1
      }
    }

    const parts = [`已迁移 ${documentsMigrated} 篇文档`]
    if (projectsCreated > 0) parts.push(`新建 ${projectsCreated} 个项目`)
    return {
      ok: true,
      projectsCreated,
      documentsMigrated,
      message: parts.join('，')
    }
  }, [state.projectTree, createProject, createDocument])

  const saveDocument = (docId, updates) => {
    dispatch({
      type: ActionTypes.SAVE_DOCUMENT,
      payload: { docId, updates }
    })
  }

  const selectDocument = (docId) => {
    dispatch({
      type: ActionTypes.SELECT_DOCUMENT,
      payload: { docId }
    })
  }

  const deleteDocument = (docId) => {
    dispatch({
      type: ActionTypes.DELETE_DOCUMENT,
      payload: { docId }
    })
  }

  const setExpertMode = (mode) => {
    dispatch({
      type: ActionTypes.SET_EXPERT_MODE,
      payload: { mode }
    })
  }

  const setActiveProject = (projectId) => {
    dispatch({
      type: ActionTypes.SET_ACTIVE_PROJECT,
      payload: { projectId }
    })
  }

  const toggleTreeNode = (nodeId) => {
    dispatch({
      type: ActionTypes.TOGGLE_TREE_NODE,
      payload: { nodeId }
    })
  }

  const updateManifesto = (projectId, newFields, changeReason, metadata) => {
    dispatch({
      type: ActionTypes.UPDATE_MANIFESTO,
      payload: { projectId, newFields, changeReason, metadata }
    })
  }

  const setProjectTree = (tree) => {
    dispatch({
      type: ActionTypes.SET_PROJECT_TREE,
      payload: { tree }
    })
  }

  // 额外的方法（保持向后兼容）
  const updateDocument = useCallback((docId, updates) => {
    saveDocument(docId, updates)
  }, [])

  const addDocument = useCallback((parentId, docData) => {
    return createDocument(parentId, docData)
  }, [])

  // 链路 B/C：归档相关方法
  const appendContentToDocument = useCallback(async (docId, text, fieldKey, usePolish, source) => {
    const currentDoc = findNodeById(state.projectTree, docId)
    
    // 处理智能润色
    let finalText = text
    if (usePolish) {
      try {
        const { chatComplete } = await import('../utils/aiApi')
        const polishResult = await chatComplete([
          { 
            role: 'system', 
            content: '你是一个专业的文档润色助手。请对用户提供的内容进行润色，使其更加专业、简洁、有条理。保持原意不变。直接返回润色后的内容，不要添加任何解释。' 
          },
          { role: 'user', content: text }
        ])
        finalText = polishResult || text
      } catch (e) {
        console.warn('润色失败，使用原文:', e)
        finalText = text
      }
    }
    
    const sourceLine = source ? `\n\n> 来源: ${source.timestamp || ''}` : ''
    const appendedContent = finalText + sourceLine
    
    if (fieldKey && currentDoc?.fields) {
      saveDocument(docId, {
        fields: { ...currentDoc.fields, [fieldKey]: finalText },
        content: (currentDoc.content || '') + '\n---\n' + appendedContent
      })
    } else {
      saveDocument(docId, {
        content: (currentDoc.content || '') + '\n---\n' + appendedContent
      })
    }
  }, [saveDocument, state.projectTree])

  const highlightNodeAfterRender = useCallback((docId, callback) => {
    setHighlightedDocId(docId)
    if (callback) setTimeout(callback, 200)
  }, [setHighlightedDocId])

  const addDocumentToCategory = useCallback((projectId, categoryType, docData) => {
    const project = state.projectTree.find(p => p.id === projectId)
    if (!project) return {}
    const category = project.children?.find(c => c.categoryType === categoryType || c.id === categoryType)
    if (!category) {
      // 如果找不到指定的分类，使用第一个分类作为备选
      const fallbackCategory = project.children?.[0]
      if (!fallbackCategory) return {}
      const docId = createDocument(fallbackCategory.id, docData)
      return { newDocId: docId }
    }
    const docId = createDocument(category.id, docData)
    return { newDocId: docId }
  }, [state.projectTree, createDocument])

  const archiveToProject = useCallback((archaeologyId, item, projectId, category) => {
    return addDocumentToCategory(projectId, category, {
      name: item.text || item.summary || '考古归档',
      content: JSON.stringify(item),
      docType: 'blank',
      fields: {}
    })
  }, [addDocumentToCategory])

  const deleteArchaeologySession = useCallback((sessionId) => {
    archaeologyStore.deleteSession(sessionId)
    setArchaeologySessions(archaeologyStore.getAllSessions())
    if (activeArchaeologyId === sessionId) {
      setActiveArchaeologyId(null)
    }
  }, [activeArchaeologyId, setActiveArchaeologyId])

  // 考古会话 V2 方法
  const createArchaeologySessionV2 = useCallback((name) => {
    const session = archaeologyStore.createSession(name)
    setArchaeologySessions(archaeologyStore.getAllSessions())
    setActiveArchaeologyId(session.id)
    return session
  }, [setActiveArchaeologyId])

  const addConversationChunk = useCallback((sessionId, content) => {
    const chunk = archaeologyStore.addConversationChunk(sessionId, content)
    setArchaeologySessions(archaeologyStore.getAllSessions())
    return chunk
  }, [])

  const getMergedConversation = useCallback((sessionId) => {
    return archaeologyStore.getMergedConversation(sessionId)
  }, [])

  const updateAnalysis = useCallback((sessionId, dimension, items) => {
    archaeologyStore.updateAnalysis(sessionId, dimension, items)
    setArchaeologySessions(archaeologyStore.getAllSessions())
  }, [])

  const updateItemStatus = useCallback((sessionId, dimension, itemId, status, editedContent) => {
    archaeologyStore.updateItemStatus(sessionId, dimension, itemId, status, editedContent)
    setArchaeologySessions(archaeologyStore.getAllSessions())
  }, [])

  const saveFinalReport = useCallback((sessionId, report) => {
    archaeologyStore.saveFinalReport(sessionId, report)
    setArchaeologySessions(archaeologyStore.getAllSessions())
  }, [])

  const switchProject = useCallback((projectId) => {
    setActiveProject(projectId)
    setActiveDocId(null)
    setActiveHeadingId(null)
  }, [])

  const openDocument = useCallback((docId) => {
    selectDocument(docId)
    setRecentDocuments(prev => {
      const filtered = prev.filter(id => id !== docId)
      return [docId, ...filtered].slice(0, 10)
    })
  }, [])

  const toggleDecisionStatus = useCallback((nodeId) => {
    setProjectTree(prev =>
      updateNodeInTree(prev, nodeId, node => {
        const statusCycle = { exploring: 'locked', locked: 'rejected', rejected: 'exploring' }
        return { ...node, status: statusCycle[node.status] || 'exploring' }
      })
    )
  }, [])

  const getProjectHealth = useCallback((projectId) => {
    const project = state.projectTree.find(p => p.id === projectId)
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
  }, [state.projectTree])

  const expandProjectNodes = useCallback((projectId) => {
    setProjectTree(prev =>
      updateNodeInTree(prev, projectId, node => ({
        ...node,
        expanded: true,
        children: node.children ? node.children.map(child => ({ ...child, expanded: true })) : []
      }))
    )
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
  }, [setProjectMemories])

  const getMemorySummary = useCallback((projectId) => {
    const memory = projectMemories[projectId]
    if (!memory) return null

    return {
      totalInteractions: memory.totalInteractions,
      lastUpdated: memory.lastUpdated,
      insightCount: memory.insights?.length || 0,
      recentTopics: memory.discussionTopics?.slice(-5) || [],
      recentInsight: memory.insights?.[memory.insights.length - 1]?.text || null
    }
  }, [projectMemories])

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
    const project = state.projectTree.find(p => p.id === projectId)
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
    }

    return {
      score: Math.max(0, score),
      issues,
      summary: {
        totalDocs: collectDocuments([project]).length,
        decisionCount: collectDocuments([project]).filter(d => d.docType === 'decision').length,
        prdCount: prdDocs.length,
        personaCount: collectDocuments([project]).filter(d => d.docType === 'persona').length
      }
    }
  }, [state.projectTree, documentConflicts])

  const switchLabMode = useCallback(
    (mode) => {
      let resolvedActive = state.activeProjectId

      if (labMode === 'archaeology' && mode !== 'archaeology') {
        if (previousProjectId) {
          resolvedActive = previousProjectId
          setActiveProject(previousProjectId)
          setPreviousProjectId(null)
        }
        setActiveArchaeologyId(null)
      }

      if (mode === 'archaeology' && (labMode === 'live' || labMode === 'coach' || labMode === 'dashboard')) {
        if (labMode === 'live') {
          setPreviousProjectId(resolvedActive ?? pressureLiveStashedProjectRef.current ?? null)
          pressureLiveStashedProjectRef.current = null
        } else {
          setPreviousProjectId(resolvedActive ?? null)
        }
      }

      if (labMode === 'live' && mode !== 'live' && mode !== 'archaeology') {
        if (!resolvedActive && pressureLiveStashedProjectRef.current) {
          setActiveProject(pressureLiveStashedProjectRef.current)
        }
        pressureLiveStashedProjectRef.current = null
      }

      if (mode === 'live' && labMode !== 'live') {
        const stash = labMode === 'archaeology' ? resolvedActive : state.activeProjectId
        pressureLiveStashedProjectRef.current = stash ?? null
        setActiveProject(null)
      }

      setLabMode(mode)
    },
    [labMode, previousProjectId, state.activeProjectId, setActiveArchaeologyId, setLabMode]
  )

  const continuePressureSession = useCallback(
    (sessionId) => {
      pressureResumePayloadRef.current = { sessionId, mode: 'practice' }
      switchLabMode('live')
    },
    [switchLabMode]
  )

  const viewPressureSession = useCallback(
    (sessionId) => {
      pressureResumePayloadRef.current = { sessionId, mode: 'view' }
      switchLabMode('live')
    },
    [switchLabMode]
  )

  const consumePressureSessionResume = useCallback(() => {
    const p = pressureResumePayloadRef.current
    pressureResumePayloadRef.current = null
    return p
  }, [])

  const continueHypothesisSession = useCallback(
    (sessionId) => {
      hypothesisResumePayloadRef.current = { sessionId, mode: 'practice' }
      switchLabMode('live')
    },
    [switchLabMode]
  )

  const viewHypothesisSession = useCallback(
    (sessionId) => {
      hypothesisResumePayloadRef.current = { sessionId, mode: 'view' }
      switchLabMode('live')
    },
    [switchLabMode]
  )

  const consumeHypothesisSessionResume = useCallback(() => {
    const p = hypothesisResumePayloadRef.current
    hypothesisResumePayloadRef.current = null
    return p
  }, [])

  // 向后兼容：添加缺失的方法作为空实现
  const createArchaeologySession = useCallback((text) => {
    const session = {
      id: `arch_${Date.now()}`,
      title: text.slice(0, 30) + (text.length > 30 ? '...' : ''),
      rawText: text,
      text,
      createdAt: new Date().toISOString(),
      analyzedAt: null,
      timeline: [],
      decisions: [],
      blindSpots: [],
      actionItems: [],
      summary: null
    }
    setArchaeologySessions(prev => [...prev, session])
    setActiveArchaeologyId(session.id)
    return session
  }, [setArchaeologySessions, setActiveArchaeologyId])

  const updateArchaeologySession = useCallback((sessionId, updates) => {
    setArchaeologySessions(prev => 
      prev.map(s => s.id === sessionId ? { ...s, ...updates } : s)
    )
  }, [setArchaeologySessions])

  const saveMessageToHistory = useCallback((message) => {
    if (!currentSessionId || !state.activeProjectId) return
    
    setAllHistoryMessages(prev => {
      const projectMessages = prev[state.activeProjectId] || {}
      const sessionMessages = projectMessages[currentSessionId] || []
      
      return {
        ...prev,
        [state.activeProjectId]: {
          ...projectMessages,
          [currentSessionId]: [...sessionMessages, message]
        }
      }
    })
    
    setChatSessions(prev => {
      const projectSessions = prev[state.activeProjectId] || []
      const existingSession = projectSessions.find(s => s.id === currentSessionId)
      
      if (existingSession) {
        return {
          ...prev,
          [state.activeProjectId]: projectSessions.map(s => 
            s.id === currentSessionId 
              ? { ...s, messageCount: (s.messageCount || 0) + 1, lastMessageAt: new Date().toISOString() }
              : s
          )
        }
      } else {
        const newSession = {
          id: currentSessionId,
          title: message.content?.slice(0, 30) || '新对话',
          createdAt: new Date().toISOString(),
          lastMessageAt: new Date().toISOString(),
          messageCount: 1
        }
        return {
          ...prev,
          [state.activeProjectId]: [newSession, ...projectSessions]
        }
      }
    })
  }, [currentSessionId, state.activeProjectId, setAllHistoryMessages, setChatSessions])

  const startNewSession = useCallback(() => {
    const newSessionId = `session_${Date.now()}`
    setCurrentSessionId(newSessionId)
    setViewingHistorySessionId(null)
    return newSessionId
  }, [setCurrentSessionId, setViewingHistorySessionId])

  const deleteChatSession = useCallback((sessionId) => {
    if (!state.activeProjectId) return
    
    setChatSessions(prev => {
      const projectSessions = prev[state.activeProjectId] || []
      return {
        ...prev,
        [state.activeProjectId]: projectSessions.filter(s => s.id !== sessionId)
      }
    })
    
    setAllHistoryMessages(prev => {
      const projectMessages = prev[state.activeProjectId] || {}
      const { [sessionId]: _, ...remainingMessages } = projectMessages
      return {
        ...prev,
        [state.activeProjectId]: remainingMessages
      }
    })
    
    if (currentSessionId === sessionId) {
      startNewSession()
    }
  }, [state.activeProjectId, setChatSessions, setAllHistoryMessages, currentSessionId, startNewSession])

  const renameChatSession = useCallback((sessionId, newTitle) => {
    if (!state.activeProjectId) return
    
    setChatSessions(prev => {
      const projectSessions = prev[state.activeProjectId] || []
      return {
        ...prev,
        [state.activeProjectId]: projectSessions.map(s => 
          s.id === sessionId ? { ...s, title: newTitle } : s
        )
      }
    })
  }, [state.activeProjectId, setChatSessions])

  const summonMentor = useCallback((docId) => {
    console.log('summonMentor called for doc:', docId)
  }, [])

  const standardizeContent = useCallback(async (content, type) => {
    console.log('standardizeContent called')
    return content
  }, [])

  const auditConstitutionVsPRD = useCallback((projectId, docId) => {
    console.log('auditConstitutionVsPRD called')
  }, [])

  const navigateToDoc = useCallback((docId) => {
    selectDocument(docId)
  }, [selectDocument])

  const switchExpertMode = useCallback((mode) => {
    setExpertMode(mode)
  }, [setExpertMode])

  const value = {
    // 基础状态
    state,
    projectTree: state.projectTree,
    activeProjectId: state.activeProjectId,
    activeDocId: state.activeDocId || activeDocId,
    activeHeadingId: state.activeHeadingId || activeHeadingId,
    expertMode: state.expertMode,
    
    // 派生状态
    get currentProject() { return activeProject },
    get allDocuments() { return allDocuments },
    projects: state.projectTree,
    
    // 原始上下文的状态
    activeLabTab,
    setActiveLabTab,
    constitution,
    setConstitution,
    standardizingIds,
    setStandardizingIds,
    sidebarCollapsed,
    setSidebarCollapsed,
    highlightedDocId,
    setHighlightedDocId,
    archivedMessageId,
    setArchivedMessageId,
    recentDocuments,
    setRecentDocuments,
    labMode,
    setLabMode,
    archaeologySessions,
    setArchaeologySessions,
    activeArchaeologyId,
    setActiveArchaeologyId,
    previousProjectId,
    allHistoryMessages,
    setAllHistoryMessages,
    chatSessions,
    setChatSessions,
    deleteChatSession,
    renameChatSession,
    currentSessionId,
    setCurrentSessionId,
    viewingHistorySessionId,
    setViewingHistorySessionId,
    documentConflicts,
    setDocumentConflicts,
    labMessageToSend,
    setLabMessageToSend,
    autoSendLabMessage,
    setAutoSendLabMessage,
    projectMemories,
    setProjectMemories,
    
    // Actions
    dispatch,
    createProject,
    createDocument,
    migrateLegacyFlatStore,
    saveDocument,
    selectDocument,
    setActiveDocId: selectDocument, // 向后兼容
    deleteDocument,
    setExpertMode,
    setActiveProject,
    switchProject,
    toggleTreeNode,
    updateManifesto,
    setProjectTree,
    
    // 向后兼容的方法
    updateDocument,
    addDocument,
    openDocument,
    toggleDecisionStatus,
    getProjectHealth,
    expandProjectNodes,
    getProjectMemory,
    clearProjectMemory,
    getMemorySummary,
    getDocumentConflicts,
    clearDocumentConflicts,
    auditFullProject,
    switchLabMode,
    continuePressureSession,
    viewPressureSession,
    consumePressureSessionResume,
    pressureWorkbenchActiveSessionId,
    setPressureWorkbenchActiveSessionId,
    hypothesisWorkbenchActiveSessionId,
    setHypothesisWorkbenchActiveSessionId,
    continueHypothesisSession,
    viewHypothesisSession,
    consumeHypothesisSessionResume,
    setActiveHeadingId,
    
    // 新增的向后兼容方法
    createArchaeologySession,
    updateArchaeologySession,
    saveMessageToHistory,
    startNewSession,
    summonMentor,
    standardizeContent,
    auditConstitutionVsPRD,
    navigateToDoc,
    switchExpertMode,
    
    // 链路 B/C 归档方法
    appendContentToDocument,
    highlightNodeAfterRender,
    addDocumentToCategory,
    archiveToProject,
    deleteArchaeologySession,
    
    // 考古会话 V2 方法
    createArchaeologySessionV2,
    addConversationChunk,
    getMergedConversation,
    updateAnalysis,
    updateItemStatus,
    saveFinalReport,
    
    // Helper functions
    findNodeById: (id) => findNodeById(state.projectTree, id),
    getCurrentProject: () => activeProject,
    collectDocuments,
    findProjectForDoc
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
