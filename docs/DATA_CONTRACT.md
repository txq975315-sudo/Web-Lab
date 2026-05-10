# 数据层契约（Thinking Lab）

本文约定「单一真相」与允许的数据入口，**新功能开发前请先读一遍**。实现细节以代码为准，冲突时以本文 + `LabContext` 行为为准。

---

## 1. 单一真相：项目与文档

| 内容 | 唯一写入方式 | 持久化（概念） |
|------|----------------|----------------|
| 项目树、分类、文档节点与内容 | **`LabContext` 提供的方法** | `localStorage` 键 **`kairos-project-tree`**（`STORAGE_KEYS.PROJECT_TREE`） |

**必须使用的 API 示例（非穷举）：**

- 项目：`createProject`、在 reducer 中维护的 `projectTree` 相关 action  
- 文档：`createDocument(parentId, payload, options?)`、`saveDocument`、`deleteDocument`、拖拽归档等已在 Context 内封装的逻辑  

**禁止：** 在新业务代码中调用 **`store.createProject` / `store.createDocument` / `store.updateDocument`** 等面向 **`kairos-lab-data`**（扁平旧库）的写入接口。这些接口仅保留给历史兼容或迁移；开发模式下写入会触发控制台告警。

---

## 2. 考古会话（对话考古）

| 内容 | 写入方式 | 持久化 |
|------|----------|--------|
| 考古会话、片段、五维分析、报告草稿 | **`archaeologyStore`**（定义于 `src/utils/dataStore.js`） | `kairos-archaeology-sessions` 等（由 `archaeologyStore` 内部封装） |

归档到「当前项目树」时：**必须通过 `LabContext` 的 `createDocument`（及模板解析 helper）**，不得再把归档目标写成扁平 `store` 文档。

---

## 3. 扁平旧库 `kairos-lab-data`（`store`）

- **角色：** 早期原型遗留结构；与侧边栏 **六模块项目树** 平行存在会造成「归档了却看不见」等产品问题。  
- **读取：** 可按需保留（如迁移脚本读旧数据）。  
- **写入：** **对新功能关闭**；仅在明确迁移/兼容路径中使用，且应计划淘汰。  
- **初始化：** `initStore()` 不再向该键注入与项目树冲突的种子数据。

---

## 4. 应用设置与 AI 配置

- 当前 **API 与模型** 以 **设置弹窗** 写入的 **`kairos-ai-config`** 为准（与 `SettingsModal` 一致）。  
- `dataStore` 内若仍有 **`settingsStore` / `kairos-lab-settings`** 等遗留，**新功能不要依赖**；若与 `kairos-ai-config` 重复，以设置页为准。

---

## 5. 全站备份 / 导入

- **导出/导入** 由 `src/utils/labDataSync.js` 对一组 **`LAB_LOCAL_STORAGE_KEYS`** 做快照。  
- 增删与项目树、考古、设置相关的 **新 localStorage 键** 时，**须同步更新** `LAB_LOCAL_STORAGE_KEYS`，否则备份会漏数据。

---

## 6. 修改本契约的流程

- 若需增加新的「唯一真相」存储或改键名：先改本文与相关模块头注释，再改代码。  
- 大型迁移（如合并 `kairos-lab-data` → `projectTree`）应单独写迁移说明与回滚方式，不在此展开。

---

*最后更新：与「锁契约」任务同步；后续迭代请随 PR 更新本文。*
