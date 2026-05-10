# 修复数据层断裂 — 统一到 dataStore（TDD 驱动）

## 摘要

当前项目存在两套并行的数据持久化层：
- **LabContext + useReducer + useLocalStorage** → 读写 `kairos-project-tree`（树形结构）
- **dataStore.js 的 store** → 读写 `kairos-lab-data`（扁平结构）

导致 `ArchaeologyReportView` 归档时写入 `kairos-lab-data`，但 Context 从 `kairos-project-tree` 读取，归档数据不可见。

**方案**：将 `dataStore.js` 改造为唯一的持久化层（读写 `kairos-project-tree`），LabContext reducer 保持不变作为状态管理层，通过 useEffect 同步到 dataStore。组件统一通过 Context 访问数据，禁止直接调用 store。

---

## 当前状态分析

### 数据结构差异

| 维度 | dataStore (`store`) | LabContext (reducer) |
|------|---------------------|---------------------|
| localStorage Key | `kairos-lab-data` | `kairos-project-tree` |
| 数据结构 | 扁平：`projects[]` + `documents{}` | 树形：`projectTree[]`（嵌套 category → document） |
| 额外逻辑 | 无 | backlinks 同步、outline 自动生成、references 提取 |

### 直接绕过 Context 的组件

| 组件 | 直接调用的 Store 方法 | 影响 |
|------|---------------------|------|
| `ArchaeologyReportView.jsx` | `store.getProjects()`, `store.createProject()`, `store.createDocument()` | 归档数据写入错误 key |
| `ArchaeologySessionList.jsx` | `archaeologyStore.getAllSessions()`, `.createSession()`, `.deleteSession()` | 绕过 Context 状态管理 |
| `ArchaeologyInputArea.jsx` | `archaeologyStore.addConversationChunk()`, `.getMergedConversation()`, `.updateAnalysis()` | 绕过 Context 状态管理 |

### 测试基础设施

当前项目**无任何测试框架**，需从零搭建（Vitest + React Testing Library）。

---

## 实施计划

### Phase 0：搭建测试基础设施

**目标**：安装 Vitest + RTL，确保能运行测试。

**改动文件**：
- `package.json` — 添加 vitest、@testing-library/react、@testing-library/jest-dom、jsdom 依赖
- `vite.config.js` — 添加 test 配置
- `src/test/setup.js` — 测试初始化文件（新建）
- `src/test/testUtils.jsx` — 自定义 renderWithProvider 工具函数（新建）

**验证**：运行 `npx vitest run`，一个空测试通过。

---

### Phase 1：改造 dataStore.js 为纯持久化层（TDD）

**目标**：让 `dataStore.js` 操作树形 `projectTree` 结构（与 Context 一致），替代当前的扁平结构。

**TDD 循环**：每个方法先写测试 → 看红 → 写实现 → 看绿 → 重构。

#### Step 1.1：重写 store 的核心读写方法

**测试文件**：`src/utils/__tests__/dataStore.test.js`

**测试用例**（按 TDD 顺序）：

```
RED 1: store.saveProjectTree(tree) 能将树形结构写入 localStorage
RED 2: store.loadProjectTree() 能从 localStorage 读取树形结构
RED 3: store.loadProjectTree() 在 localStorage 为空时返回 null
RED 4: store.saveActiveProjectId(id) 能写入活跃项目 ID
RED 5: store.loadActiveProjectId() 能读取活跃项目 ID
RED 6: store.saveExpertMode(mode) 能写入专家模式
RED 7: store.loadExpertMode() 能读取专家模式
```

**实现**：在 `dataStore.js` 中新增方法，操作 `kairos-project-tree` key：

```javascript
// 新增的 store 方法
store.saveProjectTree = (tree) => { ... }   // 写入 kairos-project-tree
store.loadProjectTree = () => { ... }        // 读取 kairos-project-tree
store.saveActiveProjectId = (id) => { ... }  // 写入 kairos-active-project
store.loadActiveProjectId = () => { ... }    // 读取 kairos-active-project
store.saveExpertMode = (mode) => { ... }     // 写入 kairos-expert-mode
store.loadExpertMode = () => { ... }         // 读取 kairos-expert-mode
```

**注意**：旧的 `store` 方法（`createProject`、`createDocument` 等）暂时保留但标记 `@deprecated`，待所有组件迁移完毕后再删除。

#### Step 1.2：保留 archaeologyStore 不变

`archaeologyStore` 操作的是 `kairos-archaeology-sessions`，与 projectTree 无关，不需要改动。但组件必须通过 Context 访问它（Phase 3 处理）。

#### Step 1.3：保留 settingsStore 不变

`settingsStore` 操作的是 `kairos-lab-settings`，与项目数据无关，不需要改动。

**验证**：所有 dataStore 测试通过。

---

### Phase 2：改造 LabContext 的持久化机制（TDD）

**目标**：LabContext 初始化时从 dataStore 读取数据，dispatch 后同步到 dataStore，替代当前的 useLocalStorage。

**测试文件**：`src/context/__tests__/LabContext.test.jsx`

#### Step 2.1：初始化从 dataStore 读取

**测试用例**：

```
RED 1: LabProvider 初始化时，如果 dataStore 有 projectTree 数据，应使用该数据
RED 2: LabProvider 初始化时，如果 dataStore 为空，应使用 DEFAULT_PROJECT_TREE
RED 3: LabProvider 初始化时，应从 dataStore 读取 activeProjectId
RED 4: LabProvider 初始化时，应从 dataStore 读取 expertMode
```

**改动**：`src/context/LabContext.jsx`

```javascript
// 改前：从 useLocalStorage 读取
const [storedProjectTree, setStoredProjectTree] = useLocalStorage(STORAGE_KEYS.PROJECT_TREE, DEFAULT_PROJECT_TREE)

// 改后：从 dataStore 读取
const [storedProjectTree] = useState(() => store.loadProjectTree() || DEFAULT_PROJECT_TREE)
```

#### Step 2.2：dispatch 后同步到 dataStore

**测试用例**：

```
RED 5: dispatch CREATE_PROJECT 后，dataStore.saveProjectTree 应被调用
RED 6: dispatch SAVE_DOCUMENT 后，dataStore.saveProjectTree 应被调用
RED 7: dispatch SET_ACTIVE_PROJECT 后，dataStore.saveActiveProjectId 应被调用
RED 8: dispatch SET_EXPERT_MODE 后，dataStore.saveExpertMode 应被调用
```

**改动**：`src/context/LabContext.jsx`

```javascript
// 改前：通过 useLocalStorage 的 setter 同步
useEffect(() => { setStoredProjectTree(state.projectTree) }, [state.projectTree])

// 改后：通过 dataStore 同步
useEffect(() => { store.saveProjectTree(state.projectTree) }, [state.projectTree])
useEffect(() => { store.saveActiveProjectId(state.activeProjectId) }, [state.activeProjectId])
useEffect(() => { store.saveExpertMode(state.expertMode) }, [state.expertMode])
```

#### Step 2.3：迁移 initStore 逻辑

**测试用例**：

```
RED 9: initStore() 在 dataStore 无数据时，应写入 DEFAULT_PROJECT_TREE
RED 10: initStore() 在 dataStore 已有数据时，不应覆盖
```

**改动**：`src/utils/dataStore.js` 的 `initStore()` 函数

```javascript
// 改前：创建扁平结构项目
function initStore() { ... 写入 kairos-lab-data ... }

// 改后：创建树形结构项目
function initStore() {
  if (!store.loadProjectTree()) {
    store.saveProjectTree(DEFAULT_PROJECT_TREE)
    store.saveActiveProjectId('proj-1')
  }
}
```

**改动**：`src/App.jsx` — `initStore()` 调用保持不变，但内部逻辑已更新。

**验证**：所有 LabContext 测试通过 + 手动启动应用确认数据正常加载。

---

### Phase 3：组件统一通过 Context 访问数据（TDD）

**目标**：消除组件对 store / archaeologyStore 的直接引用。

#### Step 3.1：修复 ArchaeologyReportView.jsx

**测试文件**：`src/components/__tests__/ArchaeologyReportView.test.jsx`

**测试用例**：

```
RED 1: handleArchiveAsset 归档资产时，应调用 Context 的 addDocumentToCategory 而非 store.createDocument
RED 2: handleArchiveAsset 在无项目时，应调用 Context 的 createProject 而非 store.createProject
RED 3: 归档成功后，新文档应出现在 projectTree 中（可通过 findNodeById 找到）
```

**改动**：`src/components/ArchaeologyReportView.jsx`

```javascript
// 改前
import { store, archaeologyStore } from '../utils/dataStore'
const projects = store.getProjects()
store.createProject('决策复盘项目', ...)
store.createDocument(projectId, templateKey, docData, title)

// 改后
import { useLab } from '../context/LabContext'
const { projects, createProject, addDocumentToCategory } = useLab()
createProject('决策复盘项目', ...)
addDocumentToCategory(projectId, category, { name, content, docType, fields })
```

#### Step 3.2：修复 ArchaeologySessionList.jsx

**测试文件**：`src/components/__tests__/ArchaeologySessionList.test.jsx`

**测试用例**：

```
RED 1: 创建会话应调用 Context 的 createArchaeologySessionV2
RED 2: 删除会话应调用 Context 的 deleteArchaeologySession
RED 3: 会话列表应从 Context 的 archaeologySessions 读取
```

**改动**：`src/components/ArchaeologySessionList.jsx`

```javascript
// 改前
import { archaeologyStore } from '../utils/dataStore'
archaeologyStore.createSession(name)
archaeologyStore.deleteSession(id)

// 改后
import { useLab } from '../context/LabContext'
const { createArchaeologySessionV2, deleteArchaeologySession, archaeologySessions } = useLab()
createArchaeologySessionV2(name)
deleteArchaeologySession(id)
```

#### Step 3.3：修复 ArchaeologyInputArea.jsx

**测试文件**：`src/components/__tests__/ArchaeologyInputArea.test.jsx`

**测试用例**：

```
RED 1: 追加对话应调用 Context 的 addConversationChunk
RED 2: 获取合并对话应调用 Context 的 getMergedConversation
RED 3: 更新分析结果应调用 Context 的 updateAnalysis
```

**改动**：`src/components/ArchaeologyInputArea.jsx`

```javascript
// 改前
import { archaeologyStore } from '../utils/dataStore'
archaeologyStore.addConversationChunk(sessionId, inputText)
archaeologyStore.getMergedConversation(sessionId)
archaeologyStore.updateAnalysis(sessionId, dimension, items)

// 改后
import { useLab } from '../context/LabContext'
const { addConversationChunk, getMergedConversation, updateAnalysis } = useLab()
addConversationChunk(sessionId, inputText)
getMergedConversation(sessionId)
updateAnalysis(sessionId, dimension, items)
```

**验证**：所有组件测试通过 + 手动测试归档流程。

---

### Phase 4：数据迁移 + 清理（TDD）

**目标**：处理已有用户的旧数据迁移，清理废弃代码。

#### Step 4.1：旧数据迁移

**测试文件**：`src/utils/__tests__/dataMigration.test.js`

**测试用例**：

```
RED 1: 如果 localStorage 中存在旧的 kairos-lab-data，迁移脚本应将其转换为树形结构并写入 kairos-project-tree
RED 2: 迁移完成后，应删除旧的 kairos-lab-data key
RED 3: 如果不存在旧数据，迁移脚本应不做任何操作
```

**改动**：`src/utils/dataStore.js` 新增 `migrateFromLegacyStore()` 函数，在 `initStore()` 中调用。

#### Step 4.2：清理废弃代码

**改动文件**：
- `src/utils/dataStore.js` — 删除旧的 `store.createProject`、`store.createDocument` 等扁平结构方法；删除 `MODULE_MAP`、`_getTemplateLabel` 等不再需要的配置
- `src/hooks/useLocalStorage.js` — `STORAGE_KEYS.PROJECT_TREE` 不再需要（但其他 key 仍需保留）
- `src/utils/labDataSync.js` — 更新 `LAB_LOCAL_STORAGE_KEYS` 列表，移除 `kairos-lab-data`，确保 `kairos-project-tree` 在列表中

**验证**：所有测试通过 + 手动测试应用启动、文档创建、归档、导出/导入。

---

## 假设与决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 数据结构以谁为准 | **树形结构（Context reducer 的格式）** | reducer 有 backlinks、outline 等增值逻辑，扁平结构无这些能力 |
| dataStore 的角色 | **纯持久化层**（save/load） | 保持 reducer 作为唯一状态管理层，职责清晰 |
| archaeologyStore | **保持独立** | 考古数据与 projectTree 无关，但组件必须通过 Context 访问 |
| 旧数据迁移 | **自动迁移 + 删除旧 key** | 避免用户数据丢失，同时避免两套数据长期并存 |
| 旧 store 方法 | **Phase 1 保留标记 deprecated，Phase 4 删除** | 保证迁移过程中 ArchaeologyReportView 仍可工作 |
| 测试框架 | **Vitest + React Testing Library** | 与 Vite 生态一致，配置简单 |

---

## 验证步骤

1. **Phase 0 验证**：`npx vitest run` 通过空测试
2. **Phase 1 验证**：dataStore 新方法的单元测试全部通过
3. **Phase 2 验证**：LabContext 集成测试通过 + 应用启动后数据正常加载
4. **Phase 3 验证**：组件测试通过 + 手动测试归档流程（考古 → 归档到项目树 → 文档可见）
5. **Phase 4 验证**：迁移测试通过 + 手动测试旧数据迁移 + 导出/导入功能正常
6. **最终验证**：`npx vitest run` 全部通过 + `npm run build` 无错误

---

## 改动文件汇总

| 文件 | Phase | 改动类型 | 改动量 |
|------|-------|---------|--------|
| `package.json` | 0 | 新增测试依赖 | 小 |
| `vite.config.js` | 0 | 添加 test 配置 | 小 |
| `src/test/setup.js` | 0 | 新建 | 小 |
| `src/test/testUtils.jsx` | 0 | 新建 | 小 |
| `src/utils/dataStore.js` | 1+4 | 重构：新增树形读写方法 + 迁移函数 + 删除旧方法 | 大 |
| `src/context/LabContext.jsx` | 2 | 重构：持久化机制从 useLocalStorage 改为 dataStore | 中 |
| `src/App.jsx` | 2 | 适配 initStore 新逻辑 | 小 |
| `src/components/ArchaeologyReportView.jsx` | 3 | 改为通过 Context 访问数据 | 中 |
| `src/components/ArchaeologySessionList.jsx` | 3 | 改为通过 Context 访问数据 | 小 |
| `src/components/ArchaeologyInputArea.jsx` | 3 | 改为通过 Context 访问数据 | 中 |
| `src/utils/labDataSync.js` | 4 | 更新 localStorage key 列表 | 小 |
| `src/hooks/useLocalStorage.js` | 4 | 清理废弃 STORAGE_KEY | 小 |
| `src/utils/__tests__/dataStore.test.js` | 1+4 | 新建 | 中 |
| `src/utils/__tests__/dataMigration.test.js` | 4 | 新建 | 小 |
| `src/context/__tests__/LabContext.test.jsx` | 2 | 新建 | 中 |
| `src/components/__tests__/ArchaeologyReportView.test.jsx` | 3 | 新建 | 中 |
| `src/components/__tests__/ArchaeologySessionList.test.jsx` | 3 | 新建 | 小 |
| `src/components/__tests__/ArchaeologyInputArea.test.jsx` | 3 | 新建 | 小 |
