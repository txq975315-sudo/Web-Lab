# Thinking Lab — 超级完整需求文档 (PRD V2.0)

> **版本**：V2.0 重构版  
> **日期**：2026-05-08  
> **状态**：数据核心重写中，三栏联动重构中  
> **目标读者**：Trae AI 开发助手、产品负责人、未来接手开发者  

---

## 目录

1. [文档概述](#1-文档概述)
2. [产品定位与目标](#2-产品定位与目标)
3. [三种启动与输入模式](#3-三种启动与输入模式)
4. [逻辑架构](#4-逻辑架构)
5. [基础架构](#5-基础架构)
6. [数据模型](#6-数据模型)
7. [权威模板库](#7-权威模板库)
8. [功能需求](#8-功能需求)
9. [数据流转](#9-数据流转)
10. [非功能需求](#10-非功能需求)
11. [已知问题与风险](#11-已知问题与风险)
12. [开发优先级与路线图](#12-开发优先级与路线图)
13. [附录](#13-附录)

---

## 1. 文档概述

### 1.1 项目背景
用户为了转行找工作，尝试完成 **Kairos App**（Android 端，12 专注位、task与essay功能共存的、反焦虑工具）的 PRD 与 Figma 原型。在开发 App 之前，需要一个 **Web 端的思维工作台** 来承载商业推演、产品复盘和决策管理。因此想开发一个帮助自己提升商业洞察能力和产品思维的web工具，且我希望该工具可以帮我进行一些个人idea的商业推演、产品开发和决策管理等等让我熟悉商业化与产品化的流程和提高能力，最后希望能每日给我推送一些行业报告等让我学习熟悉了解行业动态，学会拆解一些商业案例让我提升能力等。帮助我找到工作。

### 1.2 文档目的
本文档是 Thinking Lab 的**唯一权威需求源**。任何功能开发、代码重构或 Bug 修复都应回归此文档。

### 1.3 术语表

| 术语 | 定义 |
|------|------|
| **Lab** | 右侧对话/实验区，AI 交互主入口 |
| **Archive** | 中间资产沉淀区，文档详情/列表展示 |
| **Sidebar** | 左侧导航栏，动态项目树 + 仪表盘 |
| **IPO 链路** | Input（输入）→ Process（处理）→ Output（输出） |
| **宪法锚点** | Sidebar 顶部固定的项目核心定位摘要（只读） |
| **证据链** | 挂载在文档/决策下的外部对话片段，带立场标记 |
| **对话考古** | 对历史 AI 对话进行结构化萃取分析 |
| **项目空间** | 多项目隔离机制，每个项目独立数据容器 |
| **模式 A/B** | 项目初始化方式：文档导入 / Idea 探索 |
| **证据汇入** | 项目运行中持续补充外部对话/笔记 |

---

## 2. 产品定位与目标

### 2.1 一句话定位
> **"基于 LLM 的个人产品决策辅助系统，将碎片化思考转化为可追溯、可审计、可归档的结构化决策资产。"**

### 2.2 核心目标

| 目标 | 衡量标准 |
|------|---------|
| **思维工程化** | 每个灵感必须经过 AI 四维压力测试才能归档 |
| **决策可追溯** | 每个决策能追溯到起源、被推翻的旧方案、关联证据 |
| **认知资产化** | 跨平台 AI 对话、笔记、灵感能汇入统一项目树 |
| **闭环管理** | 从"灵感"→"压力测试"→"审计"→"开发任务单"全链路打通 |

### 2.3 用户画像

- **主要用户**：独立 PM / 创业者 / 独立开发者
- **使用场景**：一个人管理一个产品从 0 到 1 的全部决策过程
- **痛点**：
  - 和多个 AI 对话后，结论散落在各处
  - 做决策时忘记之前为什么否决了某个方案
  - 写简历时无法证明"我的思考是严谨的"

---

## 3. 三种启动与输入模式

**三种模式覆盖项目的三个生命周期阶段，缺一不可。**

### 3.1 模式 A：文档导入（Document-Driven）

**适用场景**：已有 PRD、市场分析、竞品报告、Axure 原型说明。

**目标**：不是把文档"存"进去，而是让 AI **瞬间读懂背景，建立项目宪法，并立刻进入高压推演**。

**流程**：
1. 新建项目时选择"从文档起步"
2. 粘贴/上传 `.md` / `.txt` 文档
3. AI 结构化提取：
   - 约束/假设 → 项目宪法
   - 用户描述 → 用户画像初稿
   - 功能列表 → PRD 初稿
   - 竞品提及 → 竞品分析初稿
4. 标记"待验证"项
5. 自动进入压力测试模式

**核心价值**：降低启动门槛，已有资产不浪费。

### 3.2 模式 B：Idea 探索（Exploration-Driven）

**适用场景**：脑中只有一个模糊概念，如"我想做一个反焦虑的 Android 专注工具"。

**目标**：通过**苏格拉底式引导**，把 idea 从一个种子浇灌成一棵结构化的树。

**流程**：
1. 新建项目时选择"从想法探索"
2. 输入一句话 idea
3. AI 第一轮追问："你想解决谁的什么焦虑？现在的替代方案是什么？"
4. 每 3 轮追问后自动阶段性收敛：
   > "到目前为止，我们确定了：目标用户是 XXX；核心痛点是 YYY；初步差异点是 ZZZ。请确认是否要锁定这些点？"
5. 用户确认后，内容自动沉淀到 01/02 模块
6. 当宪法初步成型（至少包含"核心定位"+1条"硬性约束"），提示：
   > "现在可以开启压力测试模式，我来攻击你目前的框架。"

**核心价值**：降低思考门槛，从零开始不焦虑。

### 3.3 模式 C：证据链汇入（Evidence Ingestion）

**适用场景**：项目运行中，和 Claude/Kimi/真人/自己笔记的讨论碎片。

**目标**：把"我和别人聊过什么"转化为"这些对话对项目决策是支持还是挑战"。

**流程**：
1. 右侧 Lab 增加第三 Tab："证据汇入"
2. 多源输入：Claude / ChatGPT / Kimi / 真人 / 自己笔记 / 其他
3. 预处理：清洗（去除礼貌用语/时间戳/发言者前缀）→ 分块 → 摘要
4. 立场分析：supports / challenges / neutral / question
5. 项目关联度匹配：自动建议归入哪个模块/哪个决策节点
6. 智能归档建议 UI：显示摘要/立场/关联文档/建议操作
7. 归入后更新决策平衡度（支持 vs 挑战比例）

**核心价值**：降低管理门槛，跨平台讨论不丢失。

### 3.4 三种模式的关系

```
项目诞生
    │
    ├─→ 模式 A（文档导入）──→ AI 解析文档 ──→ 自动生成项目骨架
    ├─→ 模式 B（Idea 探索）──→ 苏格拉底引导 ──→ 逐步确认项目骨架
    │                              │
    └──────────────────────────────┘
                    │
                    ▼
            项目进入"运行态"
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   实时演练     对话考古     证据链汇入
   （AI压力测试） （事后分析）  （持续补充）
        │           │           │
        └───────────┴───────────┘
                    │
                    ▼
            决策链持续更新
            （支持/挑战/回应）
                    │
                    ▼
            项目健康度动态计算
```

---

## 4. 逻辑架构

### 4.1 三栏物理架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Header: 项目切换器 + 视图切换 + 设置 + Cmd+K                          │
├────────────────────┬────────────────────────┬───────────────────────────┤
│  左侧 Sidebar       │  中间 ArchivePanel      │  右侧 LabPanel            │
│  (导航/仪表盘/锚点) │  (资产内容区)            │  (对话/实验区)             │
├────────────────────┼────────────────────────┼───────────────────────────┤
│ • 项目仪表盘        │ • 单文档详情视图         │ • 实时演练模式            │
│ • 宪法锚点          │ • 模块概览列表           │ • 对话考古模式            │
│ • 六大模块动态树     │ • 决策链时间轴           │ • 证据汇入模式            │
│ • 拖拽接收区        │ • 模板化表单渲染         │                           │
└────────────────────┴────────────────────────┴───────────────────────────┘
```

### 4.2 双模式上下文隔离

| 维度 | 实时演练 (Live Lab) | 对话考古 (Archaeology) |
|------|---------------------|------------------------|
| **数据源** | 当前项目的对话历史 | 独立的 `archaeologySessions` |
| **Sidebar** | 项目树（六大模块） | 考古来源列表 |
| **Archive** | 当前项目文档详情/列表 | 认知地层时间轴 + 三列提取卡片 |
| **Lab** | 对话输入框 + AI 回复流 | 粘贴区 + "开始扫描"按钮 |
| **归档目标** | 当前项目 | 需手动选择目标项目 + 分类 |
| **数据隔离** | 考古数据绝不混入项目树 | 只有通过"归档到项目"才迁移 |

### 4.3 动态导航栏规则

**核心原则：导航栏只显示"真实存在的资产"，模板退居后台。**

```
Sidebar 渲染规则：
- 模块下有文档 → 显示该模块，展开显示文档
- 模块下无文档 → 折叠为灰色小字"05 反脆弱审计（空）"，或完全隐藏（可选配置）
- 每个模块标题右侧 hover 显示 [+] 按钮，点击弹出模板选择面板
- 顶部全局 [+ 新建文档] 按钮，点击后选择模板 + 选择目标模块
```

### 4.4 核心定位联动架构

```
核心定位（Manifesto）是项目的"根节点"
    │
    ├─→ 修改 slogan / differentiation / antiWhat
    │       │
    │       ▼
    │   自动触发一致性审计
    │       │
    │       ▼
    │   扫描所有历史文档
    │   检测与新定位的兼容性
    │       │
    │       ▼
    │   生成影响报告（哪些决策需复审）
    │       │
    │       ▼
    │   决策链追加"定位演进"节点
    │
    ├─→ 实时同步宪法锚点（Sidebar 顶部）
    │
    └─→ 实时同步 AI System Prompt（每次对话注入最新定位）
```

---

## 5. 基础架构

### 5.1 技术栈选型

| 层级 | 技术 | 版本 | 选型理由 |
|------|------|------|---------|
| **构建工具** | Vite | 5.x | 冷启动 < 1s，HMR 极速 |
| **前端框架** | React | 18.2 | 生态成熟，AI 生成代码质量高 |
| **样式方案** | Tailwind CSS | 3.4 | 原子化类名，与 AI 协作精准 |
| **状态管理** | React Context + useReducer | - | 本项目复杂度无需 Redux |
| **持久化** | localStorage | - | 零后端成本，刷新不丢数据 |
| **AI 调用** | 前端直连 OpenRouter/DeepSeek | - | Key 存 localStorage |
| **Markdown 渲染** | react-markdown + remark-gfm | - | 完美渲染 AI 输出 |
| **图标** | lucide-react | - | 与建筑极简风契合 |
| **动画** | framer-motion | 12.x | 折叠/展开/联动动画 |
| **代理** | Vite Dev Server Proxy | - | 绕过 DeepSeek CORS |

### 5.2 文件结构

```
kairos-lab/
├── public/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── config/
│   │   ├── aiPrompts.js           # System Prompt 配置
│   │   └── templates.js           # 权威模板定义
│   ├── context/
│   │   └── LabContext.jsx         # 全局状态（重写中）
│   ├── hooks/
│   │   ├── useLocalStorage.js
│   │   └── useSelection.js
│   ├── utils/
│   │   ├── aiApi.js               # AI API 封装
│   │   ├── outlineGenerator.js
│   │   ├── backlinkParser.js
│   │   ├── constitutionCheck.js
│   │   ├── evidenceProcessor.js   # 证据清洗/分块/立场分析
│   │   └── evidenceMatcher.js     # 项目关联度匹配
│   └── components/
│       ├── Header.jsx
│       ├── Sidebar.jsx            # 动态导航栏（重写中）
│       ├── ConstitutionAnchor.jsx
│       ├── ProjectDashboard.jsx
│       ├── ProjectNavigator.jsx
│       ├── TreeItem.jsx
│       ├── ArchivePanel.jsx       # 资产内容区（重写中）
│       ├── ModuleOverview.jsx
│       ├── DocumentDetail.jsx
│       ├── ManifestoDetail.jsx    # 核心定位特殊视图
│       ├── DocumentForm.jsx
│       ├── DocumentRenderer.jsx
│       ├── DocumentEditor.jsx
│       ├── LabPanel.jsx
│       ├── LiveLabPanel.jsx
│       ├── ArchaeologyPanel.jsx
│       ├── ArchaeologySidebar.jsx
│       ├── ArchaeologyTimeline.jsx
│       ├── EvidencePanel.jsx      # 证据汇入面板
│       ├── SelectionMenu.jsx
│       ├── TemplateSelector.jsx   # 新建文档模板选择
│       ├── BacklinkSelector.jsx
│       ├── BacklinkSection.jsx
│       ├── EvidenceSection.jsx    # 证据链展示
│       ├── HealthIndicator.jsx
│       ├── CommandPalette.jsx
│       ├── ExportButton.jsx
│       ├── DevHandoffModal.jsx
│       ├── SettingsModal.jsx
│       └── Toast.jsx
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

---

## 6. 数据模型

### 6.1 LabContext State 结构（重写版）

```typescript
interface LabState {
  // 项目列表
  projects: Project[];

  // 当前活跃项目
  activeProjectId: string | null;

  // 文档存储（按项目分组，key 为 projectId）
  documents: Record<string, Document[]>;

  // 当前选中文档
  selectedDocId: string | null;

  // 当前编辑中的文档（与 selectedDocId 配合）
  editingDocId: string | null;

  // 专家模式
  expertMode: 'pressure' | 'guided' | 'deep';

  // Lab 模式
  labMode: 'live' | 'archaeology' | 'evidence';

  // 考古会话
  archaeologySessions: ArchaeologySession[];
  activeSessionId: string | null;
}
```

### 6.2 项目对象 (Project)

```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'archived';
  createdAt: string;
  source: 'blank' | 'import' | 'exploration';  // 项目诞生方式

  // 项目宪法
  constitution: {
    manifesto: ManifestoDoc;
    constraints: ConstraintItem[];
    lockedDecisions: DecisionItem[];
    graveyard: GraveyardItem[];
  };

  // 模块树（动态生成，只包含有文档的模块）
  tree: TreeNode[];
}
```

### 6.3 核心定位文档 (ManifestoDoc)

```typescript
interface ManifestoDoc {
  id: string;
  type: 'document';
  docType: 'manifesto';
  version: number;
  lastModified: string;

  fields: {
    slogan: string;          // 30字以内，顶部锚点显示
    description: string;     // 200字以内
    targetUser: string;
    differentiation: string;
    vibe: string;
    antiWhat: string;
  };

  versionHistory: Array<{
    version: number;
    changedAt: string;
    changedBy: 'user' | 'ai';
    diff: Partial<ManifestoFields>;
    reason: string;
  }>;

  cascadeImpact: {
    affectedDecisions: string[];
    auditedAt: string | null;
  };
}
```

### 6.4 标准文档 (Document)

```typescript
interface Document {
  id: string;
  type: 'document';
  docType: 'blank' | 'persona' | 'canvas' | 'competitive_analysis' | 
           'market_sizing' | 'prd' | 'gtm' | 'growth_loop' | 'north_star' | 
           'unit_economics' | 'decision' | 'premortem' | 'moat' | 
           'dependency_risk' | 'mvp_scope' | 'milestones' | 'hypothesis_tracker' | 
           'analytics_plan' | 'resource_plan' | 'action_items' | 'manifesto' | 
           'constraint' | 'graveyard';
  title: string;
  fields: Record<string, string>;
  content?: string;

  // 双向链接
  references: string[];
  backlinks: string[];

  // 证据链
  evidence?: EvidenceItem[];
  evidenceStats?: {
    supports: number;
    challenges: number;
    neutral: number;
    questions: number;
    lastUpdated: string;
  };

  // 决策专用
  status?: 'exploring' | 'locked' | 'rejected';

  // 自动大纲
  outline: OutlineNode[];

  createdAt: string;
  updatedAt: string;
}
```

### 6.5 证据项 (EvidenceItem)

```typescript
interface EvidenceItem {
  id: string;
  source: 'claude' | 'chatgpt' | 'kimi' | 'human' | 'self' | 'other';
  sourceName?: string;
  role: 'ai_assistant' | 'tech_expert' | 'investor' | 'user_researcher' | 'pm' | 'self';
  rawText: string;
  summary: string;
  stance: 'supports' | 'challenges' | 'neutral' | 'question';
  confidence: number;
  attachedAt: string;
  attachedBy: string;
  attachedTo: {
    nodeId: string;
    nodeTitle: string;
    nodeType: string;
  };
}
```

### 6.6 考古会话 (ArchaeologySession)

```typescript
interface ArchaeologySession {
  id: string;
  title: string;
  rawText: string;
  analyzedAt: string;
  projectId?: string;
  timeline: TimelineNode[];
  decisions: ArchaeologyDecision[];
  blindSpots: BlindSpot[];
  actionItems: ActionItem[];
}
```

### 6.7 localStorage 持久化结构

```javascript
// 主键：kairos-lab-state
{
  projects: Project[],
  activeProjectId: string,
  documents: Record<string, Document[]>,
  selectedDocId: string | null,
  editingDocId: string | null,
  expertMode: 'pressure' | 'guided' | 'deep',
  labMode: 'live' | 'archaeology' | 'evidence'
}

// 主键：kairos-archaeology-sessions
{
  sessions: ArchaeologySession[],
  activeSessionId: string | null
}

// 主键：kairos-ai-config
{
  apiProvider: 'openrouter' | 'deepseek' | 'openai',
  apiKey: string,
  baseUrl: string,
  model: string
}

// 主键：kairos-settings
{
  recentDocuments: string[],
  dashboardCollapsed: boolean,
  lastUsedCategory: string
}
```

---

## 7. 权威模板库

**所有模板均标注权威来源，22 个模板覆盖六大模块。**

### 7.1 模板清单

| 模板 ID | 显示名称 | 权威来源 | 所属模块 | 字段数 |
|---------|---------|---------|---------|--------|
| `manifesto` | 核心定位 | Kairos 自研 | 01 项目宪法 | 6 |
| `constraint` | 硬性约束条目 | Kairos 自研 | 01 项目宪法 | 3 |
| `graveyard` | 否决方案条目 | Kairos 自研 | 01 项目宪法 | 4 |
| `persona` | 用户画像 | Alan Cooper | 02 市场洞察 | 6 |
| `canvas` | 商业画布 | Osterwalder BMC | 02 市场洞察 | 9 |
| `competitive_analysis` | 竞品分析 | IBM $APPEALS | 02 市场洞察 | 10 |
| `market_sizing` | 市场规模 | TAM/SAM/SOM | 02 市场洞察 | 4 |
| `prd` | PRD 规格 | 标准 PRD | 03 策略增长 | 6 |
| `gtm` | GTM 计划 | Go-to-Market | 03 策略增长 | 5 |
| `growth_loop` | 增长飞轮 | Jim Collins | 03 策略增长 | 4 |
| `north_star` | 北极星指标 | Sean Ellis | 03 策略增长 | 4 |
| `unit_economics` | 财务模型 | LTV/CAC | 03 策略增长 | 5 |
| `decision` | 决策记录 | Kairos 自研 | 04 决策链 | 6 |
| `premortem` | 死亡预测 | Gary Klein | 05 反脆弱 | 6 |
| `moat` | 壁垒建设 | 竞争战略 | 05 反脆弱 | 3 |
| `dependency_risk` | 外部依赖 | 风险管理 | 05 反脆弱 | 3 |
| `mvp_scope` | MVP 范围 | 精益创业 | 06 路线图 | 3 |
| `milestones` | 里程碑 | 敏捷开发 | 06 路线图 | 1 |
| `hypothesis_tracker` | 假设验证 | 假设驱动 | 06 路线图 | 3 |
| `analytics_plan` | 衡量方案 | 数据驱动 | 06 路线图 | 3 |
| `resource_plan` | 资源预算 | 项目管理 | 06 路线图 | 3 |
| `action_items` | 待办行动 | 任务管理 | 06 路线图 | 1 |

### 7.2 关键模板字段示例

**竞品分析 (IBM $APPEALS)**：
- `$ 价格 (Price)` / `A 可获得性 (Availability)` / `P 包装 (Packaging)` / `P 性能 (Performance)` / `E 易用性 (Ease of Use)` / `A 保证 (Assurances)` / `L 生命周期成本 (Life Cycle)` / `S 社会接受度 (Social)` / `我们的差异化切入点`

**死亡预测 (Gary Klein Pre-Mortem)**：
- `假设项目完全失败` / `失败原因 1/2/3` / `预防与缓解措施` / `早期预警信号`

**增长飞轮 (Jim Collins)**：
- `飞轮名称` / `关键要素` / `增强回路` / `摩擦点`

---

## 8. 功能需求

### 8.1 P0 核心功能（已完成/必须完成）

| 编号 | 功能 | 状态 |
|------|------|------|
| F1 | 多项目空间管理 | ✅ |
| F2 | 项目宪法（Manifesto + 约束 + 决策 + 墓地） | ✅ |
| F3 | 实时演练 AI 对话（四维压力测试 + 强制 JSON） | ✅ |
| F4 | 划选语义提取（约束/决策/墓地/灵感/规格） | ✅ |
| F5 | 模板引擎（22 种权威模板） | ✅ |
| F6 | 动态大纲自动生成 | ✅ |
| F7 | 决策状态灯（探索中/已确定/已否决） | ✅ |
| F8 | API 配置与流式调用 | ✅ |
| F9 | 项目健康度进度指示 | ✅ |
| F10 | 归档后三栏联动动画 | ✅ |

### 8.2 P1 增强功能（进行中）

| 编号 | 功能 | 状态 |
|------|------|------|
| F11 | 对话考古（5 维萃取 + 时间轴 + 归档联动） | 🔄 |
| F12 | 跨项目仪表盘 | 🔄 |
| F13 | 召唤导师（上下文注入器） | 🔄 |
| F14 | 逻辑审计员（宪法 vs PRD 一致性） | 🔄 |
| F15 | 全局命令面板 Cmd+K | 🔄 |
| F16 | 致命追问浮窗 + 冲突解决流程 | 🔄 |
| F17 | 影子竞品官 Skill | 🔄 |
| F18 | 划选归档的关联影响分析 | 🔄 |

### 8.3 P2 高级功能（待规划）

| 编号 | 功能 |
|------|------|
| F19 | 证据链汇入系统（多源输入 / 立场分析 / 关联匹配） |
| F20 | 双向链接与反链聚合 |
| F21 | 宪法冲突检测 |
| F22 | 模块化 AI 补全（"AI 预填此模块"） |
| F23 | 健康度自检（一致性终审报告） |
| F24 | 一键导出商业计划书 |

### 8.4 P3 未来功能

| 编号 | 功能 |
|------|------|
| F25 | 多用户协作 |
| F26 | 数据迁移到 IndexedDB / 后端 |
| F27 | 插件系统（自定义模板 / Skill） |
| F28 | 移动端适配 |

---

## 9. 数据流转

### 9.1 实时演练模式

```
用户输入想法
    │
    ▼
构建 System Prompt（注入宪法 + 局部上下文 + 历史洞察）
    │
    ▼
调用 AI API（流式）
    │
    ▼
流式渲染 → 划选提取 / 一键归档 → 更新项目树 → localStorage
```

### 9.2 对话考古模式

```
粘贴历史对话文本
    │
    ▼
调用考古 System Prompt（5 维萃取）
    │
    ▼
解析 JSON（timeline / decisions / blindSpots / actionItems）
    │
    ▼
渲染时间轴 + 三列卡片 → 归档到项目 → 三栏联动动画 → localStorage
```

### 9.3 核心定位修改级联反应

```
修改 slogan / differentiation / antiWhat
    │
    ▼
保存新版本（version++ / versionHistory）
    │
    ▼
实时同步宪法锚点 + AI System Prompt
    │
    ▼
触发一致性审计（扫描历史文档兼容性）
    │
    ▼
生成影响报告 + 决策链追加定位演进节点
```

### 9.4 证据链汇入（未来）

```
多源输入（Claude/ChatGPT/Kimi/真人/笔记）
    │
    ▼
预处理（清洗 / 分块 / 摘要）
    │
    ▼
立场分析（supports / challenges / neutral / question）
    │
    ▼
项目关联度匹配（自动建议归档位置）
    │
    ▼
智能归档确认 → 更新 evidence 数组 → 更新 evidenceStats
    │
    ▼
触发 Sidebar 徽章重新渲染 + 决策平衡度更新
```

---

## 10. 非功能需求

| 编号 | 需求 | 说明 |
|------|------|------|
| NF1 | 零后端依赖 | 全部数据存在 localStorage |
| NF2 | 数据持久化 | 刷新页面不丢失，多项目隔离 |
| NF3 | 视觉一致性 | 圆角 9px，配色与 Figma 对齐 |
| NF4 | 响应速度 | 冷启动 < 1s，交互反馈 < 100ms |
| NF5 | AI 可切换 | 支持 OpenRouter / DeepSeek / OpenAI |
| NF6 | 可部署 | 支持 Vercel 一键部署 |
| NF7 | 隐私优先 | API Key 仅存 localStorage |
| NF8 | 离线可用 | 除 AI 对话外，查看/编辑/归档离线可用 |

---

## 11. 已知问题与风险

### 11.1 当前问题

| 编号 | 问题 | 影响 | 状态 |
|------|------|------|------|
| Q1 | 导航栏与 ArchivePanel 联动断层 | 点击 Sidebar 中部不显示文档详情 | 🔴 数据核心重写中 |
| Q2 | 顶部宪法锚点显示"未设置核心定位" | 无法点击编辑核心定位 | 🔴 数据核心重写中 |
| Q3 | 空模块完全隐藏 | 用户无法在这些模块下新建文档 | 🔴 导航栏重构中 |
| Q4 | 大纲假动态 | 已修复 | ✅ |
| Q5 | Decision 语义混乱 | 已修复 | ✅ |
| Q6 | 归档后无联动 | 已修复 | ✅ |

### 11.2 潜在风险

| 编号 | 风险 | 缓解措施 |
|------|------|---------|
| R1 | localStorage 容量限制（~5MB） | 后期迁移 IndexedDB |
| R2 | AI API 费用累积 | 提供本地模型选项（Ollama） |
| R3 | 跨项目数据误操作 | 归档时强制二次确认 |
| R4 | AI 回复格式不稳定 | temperature 0.3 + 前端格式校验 |

---

## 12. 开发优先级与路线图

### 12.1 当前任务板

#### P0：立即修复（今天）
- [ ] **P0.1** 重写 LabContext 数据核心（支持三种输入模式 + 文档按项目分组）
- [ ] **P0.2** 重写 Sidebar（动态导航 + 宪法锚点实时同步 + 空模块处理）
- [ ] **P0.3** 重写 ArchivePanel（条件渲染：空状态/阅读视图/编辑视图）
- [ ] **P0.4** 验证 API 流式输出稳定性

#### P1：本周完成
- [ ] **P1.1** 对话考古模式完整接入
- [ ] **P1.2** 召唤导师（上下文注入器）
- [ ] **P1.3** 逻辑审计员（宪法 vs PRD 一致性）
- [ ] **P1.4** 全局命令面板 Cmd+K

#### P2：两周内完成
- [ ] **P2.1** 证据链汇入系统（多源输入 / 立场分析 / 关联匹配）
- [ ] **P2.2** 双向链接与反链聚合
- [ ] **P2.3** 健康度自检（一致性终审）
- [ ] **P2.4** 一键导出商业计划书

### 12.2 里程碑

| 里程碑 | 交付物 | 验收标准 |
|--------|--------|---------|
| **M1：可运行** | P0 全部完成 | 能新建项目 → 填入宪法 → AI 对话 → 划选归档 → 查看文档详情 |
| **M2：可积累** | P1 全部完成 | 能导入历史对话 → 考古萃取 → 归档到项目 → 决策链显示时间轴 |
| **M3：可审计** | P2 全部完成 | 能运行健康度自检 → 发现冲突 → 导出完整商业计划书 |
| **M4：可展示** | P3 部分完成 | 能部署到 Vercel → 获得在线链接 → 写进简历 |

---

## 13. 附录

### 13.1 实时演练 System Prompt（完整版）

```markdown
你是 Kairos 产品思维实验室的核心人工智能专家组...

【项目当前定位】
一句话：{{manifesto.slogan}}
完整描述：{{manifesto.description}}
目标用户：{{manifesto.targetUser}}
差异化：{{manifesto.differentiation}}
产品情绪：{{manifesto.vibe}}
明确反对：{{manifesto.antiWhat}}

【硬性约束】
{{constitution.constraints}}

【已做决策】
{{constitution.lockedDecisions}}

输出格式（严格执行）：
### 1. 商业漏洞挑战
### 2. 产品逻辑审计
### 3. 社会心理透镜
### 4. MVP 绿色通道

约束：
- 语气冷静、专业、克制
- 禁止"太棒了"等废话
- 每轮以 `**致命追问：**` 结束
- 最后附加 JSON 代码块
```

### 13.2 对话考古 System Prompt（完整版）

```markdown
你是一位资深的产品对话考古学家...

分析流程：
1. 地层清洗
2. 思维路径重构（时间轴）
3. 决策节点提取
4. 认知盲区图谱
5. 知识增量与待办考古

输出格式：严格 JSON
{ meta, timeline, decisions, blind_spots, action_items }
```

### 13.3 简历包装话术

> **Kairos 决策支持实验室 (Web)**
>
> 独立设计并开发基于 LLM 的个人产品决策辅助系统...
>
> **核心亮点**：
> - **多项目组合决策系统**：支持多项目并行的 AI 决策工作流...
> - **AI 深度挖掘引擎**：设计"四维压力测试"+"逻辑审计员"双引擎...
> - **对话考古学**：首创"认知地层扫描"算法...
> - **闭环管理**：构建从"灵感输入"→"压力测试"→"一致性审计"→"开发任务单"的全链路...
> - **自驱动开发**：利用 AI 协作工具在 48 小时内完成...

---

*文档结束*
