# 数据层契约（Thinking Lab）

本文约定「单一真相」与允许的数据入口，**新功能开发前请先读一遍**。实现细节以代码为准，冲突时以本文 + `LabContext` 行为为准。

**统一键名：** 所有当前版 `localStorage` 键在 `src/config/storageKeys.js` 的 **`STORAGE_KEYS`** 中定义，前缀为 **`thinking-lab-`**。浏览器中若仍存在旧前缀键，启动时由 `migrateLegacyLocalStorageKeys()` 一次性迁移至新键（见 `src/utils/migrateLegacyStorageKeys.js`）。

---

## 1. 单一真相：项目与文档

| 内容 | 唯一写入方式 | 持久化（概念） |
|------|----------------|----------------|
| 项目树、分类、文档节点与内容 | **`LabContext` 提供的方法** | `localStorage` 键 **`thinking-lab-project-tree`**（`STORAGE_KEYS.PROJECT_TREE`） |

**必须使用的 API 示例（非穷举）：**

- 项目：`createProject`、在 reducer 中维护的 `projectTree` 相关 action  
- 文档：`createDocument(parentId, payload, options?)`、`saveDocument`、`deleteDocument`、拖拽归档等已在 Context 内封装的逻辑  

**禁止：** 在新业务代码中调用 **`store.createProject` / `store.createDocument` / `store.updateDocument`** 等面向 **`thinking-lab-legacy-flat-data`**（扁平旧库）的写入接口。这些接口仅保留给历史兼容或迁移；开发模式下写入会触发控制台告警。

---

## 2. 考古会话（对话考古）

| 内容 | 写入方式 | 持久化 |
|------|----------|--------|
| 考古会话、片段、五维分析、报告草稿 | **`archaeologyStore`**（定义于 `src/utils/dataStore.js`） | **`thinking-lab-archaeology-sessions`**（由 `archaeologyStore` 内部封装） |

归档到「当前项目树」时：**必须通过 `LabContext` 的 `createDocument`（及模板解析 helper）**，不得再把归档目标写成扁平 `store` 文档。

---

## 3. 扁平旧库 `thinking-lab-legacy-flat-data`（`store`）

- **角色：** 早期原型遗留结构；与侧边栏 **六模块项目树** 平行存在会造成「归档了却看不见」等产品问题。  
- **合并进树：** 设置 → **「合并旧版扁平库…」** 会调用 `migrateLegacyFlatStore`，将扁平库中的项目/文档 **追加** 到 `projectTree`（按模板归类）。可多次执行，可能产生重复文档，合并前请自行备份。  
- **写入：** **对新功能关闭**；开发模式下调用 `store` 的写入方法会告警。日常不再需要主动写入该键。  
- **初始化：** `initStore()` 不再向该键注入与项目树冲突的种子数据。

---

## 4. 应用设置与 AI 配置

- 当前 **API 与模型** 以 **设置弹窗** 写入的 **`thinking-lab-ai-config`**（`STORAGE_KEYS.AI_CONFIG`）为准（与 `SettingsModal` 一致）。  
- 可选字段 **`explainProfessionalTerms`**（布尔）：为 `false` 时不在 system 提示中追加「专业术语须括号详细解释」规则；缺省或未设置时视为 **开启**（便于阅读 CAC、LTV 等缩写）。  
- **`settingsStore`（`thinking-lab-legacy-settings`）已废弃**：保留导出仅为兼容极端旧数据；调用 `set` 时开发环境会告警。**禁止在新代码中读写该键。**

---

## 4.5 成长教练技能进度

| 内容 | 写入方式 | 持久化 |
|------|----------|--------|
| 方法论维度分数、各模板练习次数 | **`src/utils/growthCoachStore.js`** | **`thinking-lab-growth-skill-progress`**（`STORAGE_KEYS.GROWTH_SKILL_PROGRESS`） |

---

## 4.6 压力测试引擎（模块边界）

| 约定 | 说明 |
|------|------|
| **代码根目录** | **`src/features/pressureTest/`** — 压力测试工作台 UI 与后续会话引擎、状态机实现均归此目录（或由其再拆子目录）。 |
| **薄适配** | `src/components/workbench/PressureTestWorkbench.jsx` 可为对 feature 的 **re-export**，便于旧路径兼容；新代码优先 `import … from '../features/pressureTest'`。 |
| **Prompt 占位** | 模板与版本号草案放在 **`src/config/pressureTestPrompts.js`**，与 `buildLiveLabSystemPrompt` 等现有调用解耦后再逐步接线。 |
| **本地键** | 追问深度等仍使用现有 **`thinking-lab-pressure-depth`** 等键；**结构化压力会话列表** 使用 **`thinking-lab-pressure-engine-sessions`**（`STORAGE_KEYS.PRESSURE_ENGINE_SESSIONS`）；**Layer1/Layer2 抽检与运维日志**（环形 JSON）使用 **`thinking-lab-pressure-engine-eval-log`**（`STORAGE_KEYS.PRESSURE_ENGINE_EVAL_LOG`），实现见 **`src/features/pressureTest/pressureEvalLog.js`**。新增键须同步 **`storageKeys.js`**、**`labDataSync.js`** 与本节。 |
| **Prompt 版本** | 会话对象可含 **`promptsVersion`**（创建时写入）；人读变更记录见 **`src/config/pressureTestPrompts.js`** 内 **`PRESSURE_PROMPT_CHANGELOG`** / **`PRESSURE_TEST_PROMPTS_VERSION`**。 |
| **与项目树** | 会话与文档归档策略以 PRD 为准；**当前**工作台演练消息仍走 Live Lab 与 `LabContext` 项目绑定，不在本节重复实现。 |

---

## 5. 全站备份 / 导入

- **导出/导入** 由 `src/utils/labDataSync.js` 对 **`LAB_LOCAL_STORAGE_KEYS`** 做快照；导入时若条目使用旧版键名，会经 **`LEGACY_IMPORT_ALIASES`** 映射到当前键。  
- 在 **`LabContext`**、**`SettingsModal`**、**`dataStore`** 等处 **新增 `localStorage` 键名** 时，**必须**在 **`src/config/storageKeys.js`**、**`labDataSync.js` 中的数组**、必要时 **`migrateLegacyStorageKeys.js`** 与本文档中同步更新，否则导出会漏键、导入无法清空旧键。

---

## 6. 修改本契约的流程

- 若需增加新的「唯一真相」存储或改键名：先改本文与相关模块头注释，再改代码。  
- 扁平库合并逻辑变更时：同步更新 `flatStoreMigration.js` / `LabContext.migrateLegacyFlatStore` 与本节描述。

---

## 7. 仓库卫生（非运行时）

若曾将 **含个人隐私的备份 JSON** 推送到**公开**远程仓库，仅靠删除当前提交不够；需考虑 **`git filter-repo` 清理历史**、轮换 API Key，或至少不再扩大泄露面。此处不替代法律/合规审查。

---

*最后更新：4.6 压力测试模块边界（含评测日志键、promptsVersion）；`thinking-lab-*` 键名与旧键迁移。后续迭代请随 PR 更新本文。*
