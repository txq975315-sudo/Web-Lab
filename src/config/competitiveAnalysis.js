/**
 * 竞品分析模板 · 静态教学内容（L1–L4）
 * 与 PRD「竞品分析模板_完整PRD」对齐；练习层仍用 templates.competitive_analysis 的 $APPEALS 字段。
 */

export const COMPETITIVE_ANALYSIS = {
  key: 'competitive_analysis',
  name: '竞品分析',
  primaryMethodology: { key: 'multi_dimensional', name: '多维拆解法' },
  secondaryMethodology: { key: 'game_theory', name: '推演博弈法' },
  dimensions: [
    { id: 'targetUser', name: '目标用户', shortName: '用户' },
    { id: 'coreFunction', name: '核心功能', shortName: '功能' },
    { id: 'pricing', name: '定价策略', shortName: '定价' },
    { id: 'growth', name: '增长策略', shortName: '增长' },
    { id: 'ux', name: '用户体验', shortName: '体验' },
    { id: 'tech', name: '技术架构', shortName: '技术' },
    { id: 'business', name: '商业模式', shortName: '商业' },
    { id: 'differentiation', name: '差异化优势', shortName: '差异' },
  ],
  L1: {
    oneSentence:
      '竞品分析不是「把竞品功能列个表格」，而是「我的问题是什么 → 找谁学了 → 学到了什么 → 我能做什么不同」。',
    whyItMatters: '因为你以为的差异化可能只是幻觉。系统拆解才能验证。',
    analogy:
      '就像挑手机——你不是只看「拍照好不好」，而是同时想「贵不贵？充电快不快？用久了卡不卡？保修怎么样？」竞品分析 = 用同样的多维视角，系统性地看你的产品所处的竞争环境。',
    threePurposes: [
      { name: '找标准', desc: '头部竞品划底线', output: '知道赛道天花板在哪' },
      { name: '找对标', desc: '直接竞品打差异化', output: '找到自己的超越点' },
      { name: '找灵感', desc: '参考竞品抄亮点', output: '可借鉴的体验/功能/模式' },
    ],
  },
  L2: {
    selfTest: {
      title: '1分钟自测',
      question: '请说出四视角是哪四个？分别看什么？',
      answerReveal:
        '用户视角层→谁在用？产品功能层→做了什么？用户体验层→路径与痛点？业务视角层→怎么赚钱？',
    },
    myySteps: [
      {
        title: 'Step 1：明确目的',
        core: '我现在处于哪个阶段？要解决什么问题？',
        detail:
          '立项阶段看定位；需求调研看用户与缺口；产品设计看迭代与趋势。不同阶段，竞品分析的产出物不同。',
      },
      {
        title: 'Step 2：确定对象',
        core: '选谁分析：头部 / 直接 / 参考各是谁？',
        detail: '头部划底线，直接打差异化，参考抄体验。不要一次选太多（建议 ≤4 个有效分析对象）。',
      },
      {
        title: 'Step 3：主观分析',
        core: '竞品做了什么？为什么这样做？',
        detail: '功能拆解 + 业务逻辑挖掘。注意：小功能往往对应深层需求；隐藏逻辑要结合多渠道信息。',
      },
      {
        title: 'Step 4：客观验证',
        core: '我的判断是否站得住脚？',
        detail: '用公开数据、评价与报道支撑主观判断；区分「事实」与「推断」。',
      },
      {
        title: 'Step 5：输出建议',
        core: '结合自身产品输出方案',
        detail: '我能学什么、避什么、差异化落在哪里——分析必须能回到行动。',
      },
    ],
    competitorSelection: [
      { type: '头部竞品', count: '1–2 个', purpose: '找标准、划底线', how: '行业第一、第二' },
      {
        type: '直接竞品',
        count: '1–2 个',
        purpose: '对标、打差异化',
        how: '用户相同度高 + 核心功能相同 + 优化后能否争取其用户',
      },
      { type: '参考竞品', count: '0–1 个', purpose: '抄亮点、抄体验', how: '某个点特别强的产品' },
    ],
    fourLayers: [
      {
        layer: '用户视角层',
        look: '对象与价值',
        question: '谁在用？帮用户做了什么？认可度？',
        output: '用户画像 + 口碑线索',
      },
      {
        layer: '产品功能层',
        look: '功能与差异',
        question: '主流程？标配/亮点/缺失？',
        output: '功能对比矩阵',
      },
      {
        layer: '用户体验层',
        look: '路径与痛点',
        question: '几步完成核心任务？卡在哪？',
        output: '体验路径 + 评价词云线索',
      },
      {
        layer: '业务视角层',
        look: '商业化与运营',
        question: '怎么赚钱？策略是什么？',
        output: '收入与增长线索',
      },
    ],
    memoryHook: '就像挑手机：贵不贵、好不好买、用久了卡不卡——多维一起看才公平。',
    auxiliaryTip:
      '分析完多个维度后，多问一步：「如果竞品明天推出了你的核心功能，你的壁垒在哪？」——这是推演博弈法的应用。',
  },
  L3: {
    steps: [
      {
        id: 'scope',
        title: '明确竞品范围',
        tool: '应用商店 / 行业榜单 / 公开报道',
        actions: [
          '列出头部、直接、参考各是谁（各 0–2 个即可）',
          '直接竞品用三问自检：用户同频？功能同核？优化后能抢用户吗？',
        ],
        coachTip: '不要一次选太多；第 3–5 名「小而美」有时比第一名更有差异化启发。',
        pitfalls: { bad: '只选第一名巨头，忽略细分赛道创新者', good: '头部 + 直接 + 必要时一个参考亮点' },
      },
      {
        id: 'experience',
        title: '走核心路径',
        tool: '真机 / Web / 小程序',
        actions: ['注册或游客路径各走一遍', '记录主流程步数与卡点', '截图或笔记关键屏'],
        coachTip: '只看不注册，往往会漏掉「激活与付费」关键摩擦。',
        pitfalls: { bad: '只看营销页，不跑主任务', good: '从打开 App 到完成一次核心任务完整走通' },
      },
      {
        id: 'evidence',
        title: '收集公开信息',
        tool: '商店评价、官网、社交媒体、行业稿',
        actions: ['整理好评/差评高频词', '记录定价与版本说明', '标注信息来源类型（事实 / 推断）'],
        coachTip: '不确定的数据写「未公开」或「待核实」，不要硬编精确百分比。',
        pitfalls: { bad: '只看星级不看评论', good: '评论里常有真实场景与付费动机' },
      },
      {
        id: 'matrix',
        title: '填多维对比',
        tool: '表格（本练习表单即 $APPEALS 拆解）',
        actions: [
          '按价格、易用、性能等维度对齐写',
          '区分行业标配 vs 差异化亮点',
          '写清「对手强 / 弱」与「我方机会」',
        ],
        coachTip: '维度之间要能互相印证，避免各写各的「孤岛段落」。',
        pitfalls: { bad: '罗列功能没有对比结论', good: '每个维度有一句「对己方的启发」' },
      },
      {
        id: 'synthesis',
        title: '提炼结论',
        tool: '一页纸结构：概述 → 对比 → 发现 → 建议 → 差异化',
        actions: [
          '头部划的底线是什么',
          '直接竞品的薄弱是什么',
          '参考可抄什么',
          '我方一句差异化',
        ],
        coachTip: '结论要能回答：「所以我下周该验证什么？」',
        pitfalls: { bad: '分析完不行动', good: '每条大结论挂钩一个验证动作' },
      },
    ],
  },
  L4: {
    product: { name: 'Forest', subtitle: '专注森林 · 付费专注类 App 代表案例' },
    coachIntro:
      '下面用「多维拆解 + 四视角」带你看一遍 Forest。每一维都有：我怎么想 → 容易漏什么 → 对你有什么启发。',
    byDimension: [
      {
        id: 'targetUser',
        coachQuestion:
          '你觉得 Forest 的用户除了学生还有谁？——想想购买者与使用者可能不同。打开 App Store 看看评论，除了「考研党狂喜」，还有谁在给好评？',
        coach:
          '从商店评论与公开定位看：学生、备考族是显层用户；也常见家长陪孩子种树的叙述——用户不只是「单人自习」，还有「陪伴与外部激励」场景。',
        miss: '容易把用户窄化成「只要专注的学生」，忽略家长与礼物化、仪式感场景。',
        takeaway: '你的专注产品：用户是独处为主，还是需要同伴/监督？这会直接影响功能优先级。',
      },
      {
        id: 'coreFunction',
        coachQuestion:
          'Forest 的核心机制是什么？「种树」这个设计为什么能比普通番茄钟更有效地留住用户？——想想情感驱动 vs 功能驱动。',
        coach:
          '核心机制是番茄钟 + 种树游戏化：专注时段内离开 App 会「杀死」树苗，用损失厌恶强化专注。真树种植计划把行为与公益情感绑定。',
        miss: '容易只写「能计时」，漏掉「情感与意义感」这条护城河叙事。',
        takeaway: '竞品在卖「功能」还是卖「意义」？你更该打哪一条？',
      },
      {
        id: 'pricing',
        coachQuestion:
          'Forest 是怎么定价的？一次性付费 vs 订阅制分别对用户心理和产品 LTV 有什么影响？',
        coach:
          '中国区常见形态为一次性付费（具体价格以商店当前展示为准）；与订阅制专注 App 形成对比。可思考：一次性付费对 LTV 与持续研发意味着什么。',
        miss: '容易忽略地域与平台差异；出海时必须分别查各区域商店说明。',
        takeaway: '定价不只是数字，是「用户如何理解自己买到的权利」：买断 vs 订阅 vs 免费增值。',
      },
      {
        id: 'growth',
        coachQuestion:
          'Forest 是怎么获取用户的？它是不是主要靠投广告？——想想它有什么「不花钱也能被讨论」的传播机制。',
        coach:
          '增长侧常依赖口碑、高评分与「种树」话题传播；可结合公开报道看其跨界合作与节日活动（以可查信息为准）。',
        miss: '把增长只写成「投广告」，忽略产品与情绪自带的传播点。',
        takeaway: '你的产品有没有「不花钱也能被讨论」的机制？',
      },
      {
        id: 'ux',
        coachQuestion:
          'Forest 的体验有什么主动取舍？「不能暂停」这个设计是缺陷还是策略？——想想它筛掉了谁，留住了谁。',
        coach:
          '路径极短：开始专注 → 种树 → 结束反馈。争议点包括「不可暂停」：对自律是利器，对新手是门槛——这是体验上的主动取舍。',
        miss: '只夸简洁，不讨论「严格规则」带来的流失与口碑两极。',
        takeaway: '你要「温柔引导」还是「硬规则」？没有标准答案，但要和核心用户匹配。',
      },
      {
        id: 'tech',
        coachQuestion:
          '专注类 App 的技术壁垒在哪儿？——不是「能不能计时」，而是跨端同步、Widget、系统权限这些工程细节。你觉得这些对用户体验有多大影响？',
        coach:
          '专注类 App 技术壁垒往往不在「计时」本身，而在跨端同步、Widget、系统权限与反作弊等工程体验（结合产品实际查阅版本说明）。',
        miss: '技术章节抄成「用了某某语言」，与产品论证脱节。',
        takeaway: '写技术要回答：「这如何支撑差异化或降低成本？」',
      },
      {
        id: 'business',
        coachQuestion:
          'Forest 靠什么赚钱？一次性付费 + 皮肤内购 + 公益种树，这个组合的逻辑是什么？——用户觉得自己在为什么付钱？',
        coach:
          '收入结构需以商店内购项与官方说明为准：常见组合是一次性解锁 + 皮肤/扩展；公益种树可增强品牌与付费动机。',
        miss: '把「公益」只当公关，不讨论与核心循环是否咬合。',
        takeaway: '商业模式要和用户感知一致：用户觉得自己在为什么付钱？',
      },
      {
        id: 'differentiation',
        coachQuestion:
          '如果番茄ToDo也做了种树功能，Forest 的差异化还在吗？——想想什么是「别人做不了」的护城河。',
        coach:
          'Forest 的强叙事是情感 + 轻游戏化 + 公益；弱侧可能是社交协作、企业场景等（视你的赛道而定）。对比番茄类、自习室类产品找空位。',
        miss: '差异化写成「我比别人好」，没有「好在哪里、对谁、在什么场景」。',
        takeaway: '用一句话：「我不做 X（对手的取舍），我做 Y（我的取舍）」。',
      },
    ],
    // 新增：SWOT 完整数据结构（P0 必须实现）
    swot: {
      quadrants: [
        {
          id: 'strength',
          name: 'S 优势',
          coachQuestion:
            '你觉得 Forest 的护城河是什么？哪些是竞品短期内难以复制的？——从品牌认知、情感驱动、口碑壁垒这几个角度想想。',
          coachAnswer:
            'Forest 的强叙事是情感 + 轻游戏化 + 公益组合。品牌认知度、「种树」这个 IP、10 万+好评的口碑、真树种植的公益合作资源——这些是短期内很难复制的。',
          miss: '容易只列功能优势，漏掉「品牌认知」和「口碑传播」这两条无形护城河。',
          takeaway: '你的产品有没有类似的情感锚点？不一定是公益，可以是身份认同、社群归属等。',
        },
        {
          id: 'weakness',
          name: 'W 劣势',
          coachQuestion:
            'Forest 有什么明显的短板或用户体验缺陷？——想想它失去了哪些用户，因为什么。',
          coachAnswer:
            '社交功能弱、不能暂停对新手太严格、一次性付费收入单一。从产品功能看：缺少社交协作功能；从用户体验看：不能暂停是硬门槛；从业务视角看：没有订阅收入，长期 LTV 受限。',
          miss: '容易忽略「一次性付费」对持续研发和用户留存的长远影响。',
          takeaway: '竞品的弱点往往就是你的切入机会。但要注意：有些弱点是主动取舍，不一定是缺陷。',
        },
        {
          id: 'opportunity',
          name: 'O 机会',
          coachQuestion:
            'Forest 没覆盖哪些用户群或使用场景？——除了学生，还有谁需要专注？',
          coachAnswer:
            '职场白领、企业团队协作专注、下沉市场学生（Forest ¥25 定价偏高）。从用户视角看：Forest 主要覆盖学生和家长；从场景看：远程办公陪伴、团队专注竞赛等领域还是空白。',
          miss: '容易只看「用户群」，忽略「场景延伸」如远程办公陪伴。',
          takeaway: '找空白市场时，先问「谁在用 Forest 时感到不满？」而不是「谁还没用 Forest？」',
        },
        {
          id: 'threat',
          name: 'T 威胁',
          coachQuestion:
            '如果竞品（如番茄ToDo）也做了种树功能，Forest 的壁垒还在吗？——想想哪些东西是「功能可以抄，但积累抄不了」的。',
          coachAnswer:
            '品牌认知度、10 万+好评的口碑、真树种植的公益合作资源。如果 Forest 明天加了好友一起种树和自习室，我们还有什么差异化空间？大厂（字节/腾讯）如果进入专注赛道，竞争格局会怎样变化？',
          miss: '容易只列「竞品也可能做」，不思考「做了又怎样」的差异化纵深。',
          takeaway: '好产品不怕被抄，怕的是自己没有持续的差异化引擎。',
        },
      ],
      strategyOptions: [
        {
          id: 'SO',
          name: 'SO 策略',
          fullName: '利用优势抓机会',
          color: 'blue',
          description: '用社交化专注优势打职场白领空白市场',
        },
        {
          id: 'WO',
          name: 'WO 策略',
          fullName: '弥补劣势抓机会',
          color: 'green',
          description: '先补社交短板再抢企业场景',
        },
        {
          id: 'ST',
          name: 'ST 策略',
          fullName: '利用优势防威胁',
          color: 'orange',
          description: '用品牌护城河和公益资源抵御竞品模仿',
        },
        {
          id: 'WT',
          name: 'WT 策略',
          fullName: '防守型策略',
          color: 'red',
          description: '避开 Forest 的强项，找细分领域切入',
        },
      ],
    },
  },
}

/**
 * 四视角映射表：将 $APPEALS 10 字段分组归入四视角
 * 保持字段键名不变（兼容 useExercise hook 和 sessionStorage 草稿）
 */
export const PERSPECTIVE_MAPPING = {
  user: {
    name: '用户视角层',
    description: '对象与价值',
    color: 'var(--color-perspective-user, #3b82f6)',
    fields: [
      { key: 'competitorName', label: '竞品名称' },
      { key: 'social', label: '社会接受度' },
    ],
  },
  function: {
    name: '产品功能层',
    description: '功能与差异',
    color: 'var(--color-perspective-function, #8b5cf6)',
    fields: [
      { key: 'packaging', label: '包装' },
      { key: 'performance', label: '性能' },
    ],
  },
  experience: {
    name: '用户体验层',
    description: '路径与痛点',
    color: 'var(--color-perspective-experience, #f59e0b)',
    fields: [
      { key: 'easeOfUse', label: '易用性' },
      { key: 'assurance', label: '保证' },
      { key: 'availability', label: '可获得性' },
    ],
  },
  business: {
    name: '业务视角层',
    description: '商业化与运营',
    color: 'var(--color-perspective-business, #10b981)',
    fields: [
      { key: 'price', label: '价格' },
      { key: 'lifeCycle', label: '生命周期成本' },
      { key: 'ourAdvantage', label: '我们的差异化' },
    ],
  },
}

/**
 * 获取字段所属的视角 ID
 */
export function getPerspectiveForField(fieldKey) {
  for (const [pid, p] of Object.entries(PERSPECTIVE_MAPPING)) {
    if (p.fields.some((f) => f.key === fieldKey)) return pid
  }
  return null
}

/**
 * 获取字段的视角标签（如 "【用户视角层】竞品名称"）
 */
export function getFieldPerspectiveLabel(fieldKey) {
  for (const [, p] of Object.entries(PERSPECTIVE_MAPPING)) {
    const field = p.fields.find((f) => f.key === fieldKey)
    if (field) return { perspectiveName: p.name, fieldLabel: field.label }
  }
  return null
}

/**
 * 案例库数据（30+ 真实产品组合）
 * 用于独立训练模式
 */
export const CASE_LIBRARY = [
  // 协同办公
  { id: 'feishu', name: '飞书', desc: '字节跳动旗下协同办公平台', category: '协同办公' },
  { id: 'notion', name: 'Notion', desc: '全能笔记与协作工具', category: '协同办公' },
  { id: 'dingtalk', name: '钉钉', desc: '阿里旗下企业协作平台', category: '协同办公' },
  { id: 'tencent_docs', name: '腾讯文档', desc: '腾讯旗下在线文档协作工具', category: '协同办公' },
  { id: 'shimo', name: '石墨文档', desc: '国产在线文档协作工具', category: '协同办公' },
  // 内容社区
  { id: 'xiaohongshu', name: '小红书', desc: '生活方式分享社区', category: '内容社区' },
  { id: 'douyin', name: '抖音', desc: '短视频社交平台', category: '内容社区' },
  { id: 'zhihu', name: '知乎', desc: '知识问答社区', category: '内容社区' },
  { id: 'bilibili', name: 'B站', desc: '年轻世代视频社区', category: '内容社区' },
  { id: 'kuaishou', name: '快手', desc: '普惠短视频社区', category: '内容社区' },
  // 电商
  { id: 'pinduoduo', name: '拼多多', desc: '社交电商平台', category: '电商' },
  { id: 'taobao', name: '淘宝', desc: '综合电商平台', category: '电商' },
  { id: 'jd', name: '京东', desc: '自营式电商平台', category: '电商' },
  { id: 'douyin_ecom', name: '抖音电商', desc: '短视频电商平台', category: '电商' },
  // 效率工具
  { id: 'forest', name: 'Forest', desc: '专注森林App', category: '效率工具' },
  { id: 'tomato_todo', name: '番茄ToDo', desc: '番茄钟专注App', category: '效率工具' },
  { id: 'costudy', name: 'CoStudy', desc: '虚拟自习室App', category: '效率工具' },
  { id: 'notion_note', name: 'Notion', desc: '全能笔记工具', category: '效率工具' },
  { id: 'obsidian', name: 'Obsidian', desc: '本地优先的笔记工具', category: '效率工具' },
  // 搜索
  { id: 'baidu', name: '百度搜索', desc: '传统搜索引擎', category: '搜索' },
  { id: 'douyin_search', name: '抖音搜索', desc: '短视频搜索', category: '搜索' },
  { id: 'quark', name: '夸克', desc: '智能搜索App', category: '搜索' },
  { id: 'wechat_search', name: '微信搜一搜', desc: '社交生态搜索', category: '搜索' },
  // 社交
  { id: 'wechat', name: '微信', desc: '综合社交平台', category: '社交' },
  { id: 'soul', name: 'Soul', desc: '兴趣社交App', category: '社交' },
  { id: 'momo', name: '陌陌', desc: '陌生人社交App', category: '社交' },
  // 出行
  { id: 'amap', name: '高德地图', desc: '综合出行服务平台', category: '出行' },
  { id: 'baidu_map', name: '百度地图', desc: '百度旗下地图服务', category: '出行' },
  { id: 'tencent_map', name: '腾讯地图', desc: '腾讯旗下地图服务', category: '出行' },
  // 运动健康
  { id: 'keep', name: 'Keep', desc: '运动健身社区App', category: '运动健康' },
  { id: 'bohe_health', name: '薄荷健康', desc: '健康管理App', category: '运动健康' },
  // AI 工具
  { id: 'chatgpt', name: 'ChatGPT', desc: 'OpenAI对话AI', category: 'AI工具' },
  { id: 'wenxin', name: '文心一言', desc: '百度大语言模型', category: 'AI工具' },
  { id: 'kimi', name: 'Kimi', desc: '月之暗面AI助手', category: 'AI工具' },
  // 音乐
  { id: 'netease_music', name: '网易云音乐', desc: '音乐社交平台', category: '音乐' },
  { id: 'qq_music', name: 'QQ音乐', desc: '腾讯旗下音乐平台', category: '音乐' },
  // 外卖
  { id: 'meituan', name: '美团', desc: '生活服务与外卖平台', category: '外卖' },
  { id: 'eleme', name: '饿了么', desc: '阿里旗下外卖平台', category: '外卖' },
  // 支付
  { id: 'alipay', name: '支付宝', desc: '蚂蚁集团支付平台', category: '支付' },
  { id: 'wechat_pay', name: '微信支付', desc: '腾讯旗下支付服务', category: '支付' },
]
