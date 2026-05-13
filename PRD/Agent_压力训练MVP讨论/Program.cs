using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using DW = DocumentFormat.OpenXml.Drawing.Wordprocessing;
using A = DocumentFormat.OpenXml.Drawing;
using PIC = DocumentFormat.OpenXml.Drawing.Pictures;

namespace Docx;

public static class Program
{
    private static class Colors
    {
        public const string Primary = "1B2A4A";
        public const string Secondary = "3D5A80";
        public const string Accent = "EE6C4D";
        public const string Dark = "293241";
        public const string Mid = "5C7A99";
        public const string Light = "98C1D9";
        public const string TableHeader = "E8EEF4";
        public const string Border = "C5D5E4";
    }

    private const int A4W = 11906;
    private const int A4H = 16838;
    private const long A4WE = 7560000L;
    private const long A4HE = 10692000L;

    public static void Main(string[] args)
    {
        string outputPath = args.Length > 0 ? args[0] : "/mnt/agents/output/压力测试引擎_决策记录与详细PRD.docx";
        string bgDir = "/mnt/agents/output/bg";
        Generate(outputPath, bgDir);
    }

    public static void Generate(string outputPath, string bgDir)
    {
        using var doc = WordprocessingDocument.Create(outputPath, WordprocessingDocumentType.Document);
        var mainPart = doc.AddMainDocumentPart();
        mainPart.Document = new Document(new Body());
        var body = mainPart.Document.Body!;

        AddStyles(mainPart);
        AddNumbering(mainPart);

        var coverBgId = AddImage(mainPart, Path.Combine(bgDir, "cover_bg.png"));
        var backBgId = AddImage(mainPart, Path.Combine(bgDir, "backcover_bg.png"));

        uint prId = 1;
        AddCoverSection(body, coverBgId, ref prId);
        AddTocSection(body);
        AddDecisionRecordSection(body);
        AddDetailedPRDSection(doc, body, mainPart, ref prId);
        AddBackcoverSection(body, backBgId, ref prId);

        SetUpdateFieldsOnOpen(mainPart);
        doc.Save();
    }

    private static void AddStyles(MainDocumentPart mainPart)
    {
        var sp = mainPart.AddNewPart<StyleDefinitionsPart>();
        sp.Styles = new Styles();

        sp.Styles.Append(new Style(
            new StyleName { Val = "Normal" },
            new StyleParagraphProperties(
                new SpacingBetweenLines { After = "160", Line = "360", LineRule = LineSpacingRuleValues.Auto },
                new Indentation { FirstLine = "480" }
            ),
            new StyleRunProperties(
                new RunFonts { Ascii = "Calibri", HighAnsi = "Calibri", EastAsia = "Microsoft YaHei" },
                new FontSize { Val = "21" },
                new Color { Val = Colors.Dark }
            )
        ) { Type = StyleValues.Paragraph, StyleId = "Normal", Default = true });

        sp.Styles.Append(MkH("Heading1", "heading 1", 0, "36", Colors.Primary, "480", "240"));
        sp.Styles.Append(MkH("Heading2", "heading 2", 1, "28", Colors.Secondary, "360", "160"));
        sp.Styles.Append(MkH("Heading3", "heading 3", 2, "24", Colors.Mid, "280", "120"));

        sp.Styles.Append(new Style(
            new StyleName { Val = "Caption" }, new BasedOn { Val = "Normal" },
            new StyleParagraphProperties(
                new Justification { Val = JustificationValues.Center },
                new Indentation { FirstLine = "0" },
                new SpacingBetweenLines { Before = "60", After = "320" }),
            new StyleRunProperties(new Color { Val = Colors.Light }, new FontSize { Val = "20" },
                new RunFonts { Ascii = "Calibri", HighAnsi = "Calibri", EastAsia = "Microsoft YaHei" })
        ) { Type = StyleValues.Paragraph, StyleId = "Caption" });

        sp.Styles.Append(MkToc("TOC1", "toc 1", true, "0", "240"));
        sp.Styles.Append(MkToc("TOC2", "toc 2", false, "360", "60"));
        sp.Styles.Append(MkToc("TOC3", "toc 3", false, "720", "40"));

        sp.Styles.Append(new Style(
            new StyleName { Val = "Code" }, new BasedOn { Val = "Normal" },
            new StyleParagraphProperties(
                new SpacingBetweenLines { Before = "80", After = "80", Line = "300", LineRule = LineSpacingRuleValues.Auto },
                new Indentation { Left = "360", FirstLine = "0" },
                new Shading { Val = ShadingPatternValues.Clear, Fill = "F5F7FA" }),
            new StyleRunProperties(
                new RunFonts { Ascii = "Consolas", HighAnsi = "Consolas", EastAsia = "Microsoft YaHei" },
                new FontSize { Val = "18" }, new Color { Val = Colors.Dark })
        ) { Type = StyleValues.Paragraph, StyleId = "Code" });
    }

    private static Style MkH(string id, string name, int lvl, string sz, string color, string before, string after)
    {
        return new Style(
            new StyleName { Val = name }, new BasedOn { Val = "Normal" },
            new StyleParagraphProperties(
                new KeepNext(), new KeepLines(),
                new SpacingBetweenLines { Before = before, After = after },
                new Indentation { FirstLine = "0" },
                new OutlineLevel { Val = lvl }),
            new StyleRunProperties(new Bold(), new FontSize { Val = sz },
                new RunFonts { Ascii = "Calibri", HighAnsi = "Calibri", EastAsia = "Microsoft YaHei" },
                new Color { Val = color })
        ) { Type = StyleValues.Paragraph, StyleId = id };
    }

    private static Style MkToc(string id, string name, bool bold, string indent, string before)
    {
        var rpr = new StyleRunProperties(
            new Color { Val = bold ? Colors.Dark : Colors.Mid },
            new RunFonts { Ascii = "Calibri", HighAnsi = "Calibri", EastAsia = "Microsoft YaHei" });
        if (bold) rpr.Append(new Bold());
        return new Style(
            new StyleName { Val = name }, new BasedOn { Val = "Normal" },
            new StyleParagraphProperties(
                new Tabs(new TabStop { Val = TabStopValues.Right, Leader = TabStopLeaderCharValues.Dot, Position = 9350 }),
                new SpacingBetweenLines { Before = before, After = "60" },
                new Indentation { Left = indent, FirstLine = "0" }),
            rpr
        ) { Type = StyleValues.Paragraph, StyleId = id };
    }

    private static void AddCoverSection(Body body, string coverBgId, ref uint prId)
    {
        body.Append(new Paragraph(new Run(CreateFloatingBackground(coverBgId, prId++, "CoverBg"))));
        body.Append(new Paragraph(new ParagraphProperties(new SpacingBetweenLines { Before = "4800" }), new Run()));

        body.Append(new Paragraph(
            new ParagraphProperties(
                new Indentation { Left = "1200", Right = "1200" },
                new SpacingBetweenLines { After = "200" }),
            new Run(new RunProperties(
                    new FontSize { Val = "72" }, new Bold(),
                    new RunFonts { Ascii = "Calibri", HighAnsi = "Calibri", EastAsia = "Microsoft YaHei" },
                    new Color { Val = "FFFFFF" },
                    new Spacing { Val = 30 }),
                new Text("压力测试引擎"))));

        body.Append(new Paragraph(
            new ParagraphProperties(
                new Indentation { Left = "1200", Right = "1200" },
                new SpacingBetweenLines { After = "600" }),
            new Run(new RunProperties(
                    new FontSize { Val = "32" },
                    new RunFonts { Ascii = "Calibri", HighAnsi = "Calibri", EastAsia = "Microsoft YaHei" },
                    new Color { Val = Colors.Light },
                    new Spacing { Val = 15 }),
                new Text("决策记录与详细产品需求文档"))));

        body.Append(new Paragraph(
            new ParagraphProperties(new Indentation { Left = "1200" }),
            new Run(new RunProperties(new Color { Val = Colors.Accent }),
                new Text("----------"))));

        body.Append(new Paragraph(
            new ParagraphProperties(
                new Indentation { Left = "1200" },
                new SpacingBetweenLines { Before = "2400" }),
            new Run(new RunProperties(new FontSize { Val = "20" },
                    new RunFonts { Ascii = "Calibri", HighAnsi = "Calibri", EastAsia = "Microsoft YaHei" },
                    new Color { Val = Colors.Light }),
                new Text("思维训练工作台 | 练 · 学 · 看"))));

        body.Append(new Paragraph(
            new ParagraphProperties(new Indentation { Left = "1200" }),
            new Run(new RunProperties(new FontSize { Val = "20" },
                    new RunFonts { Ascii = "Calibri", HighAnsi = "Calibri", EastAsia = "Microsoft YaHei" },
                    new Color { Val = Colors.Light }),
                new Text("2026年5月 | v2.0"))));

        body.Append(new Paragraph(new ParagraphProperties(new SectionProperties(
            new TitlePage(),
            new SectionType { Val = SectionMarkValues.NextPage },
            new PageSize { Width = (UInt32Value)(uint)A4W, Height = (UInt32Value)(uint)A4H },
            new PageMargin { Top = 0, Right = 0, Bottom = 0, Left = 0, Header = 0, Footer = 0 }))));
    }

    private static void AddTocSection(Body body)
    {
        body.Append(H1("目录", "_Toc000"));

        body.Append(new Paragraph(
            new ParagraphProperties(new SpacingBetweenLines { After = "300" }),
            new Run(new RunProperties(new Color { Val = Colors.Light }, new FontSize { Val = "18" },
                new RunFonts { Ascii = "Calibri", HighAnsi = "Calibri", EastAsia = "Microsoft YaHei" }),
                new Text("右键目录，选择\"更新域\"刷新页码"))));

        body.Append(new Paragraph(
            new Run(new FieldChar { FieldCharType = FieldCharValues.Begin }),
            new Run(new FieldCode(" TOC \\o \"1-3\" \\h \\z \\u ") { Space = SpaceProcessingModeValues.Preserve }),
            new Run(new FieldChar { FieldCharType = FieldCharValues.Separate })));

        string[,] toc = {
            { "第一部分：决策记录", "1", "3" },
            { "一、模块定位与边界", "2", "3" },
            { "二、核心设计决策", "2", "4" },
            { "三、交互模式决策", "2", "5" },
            { "四、追问质量决策", "2", "5" },
            { "五、终止条件与判定", "2", "6" },
            { "第二部分：详细PRD", "1", "7" },
            { "一、功能定义", "2", "7" },
            { "二、用户交互流程", "2", "8" },
            { "三、AI Prompt体系设计", "2", "9" },
            { "四、追问交互模式", "2", "12" },
            { "五、尖锐度控制策略", "2", "13" },
            { "六、轮内递进设计", "2", "14" },
            { "七、上下文管理策略", "2", "15" },
            { "八、数据模型定义", "2", "16" },
            { "九、会话状态机", "2", "18" },
            { "十、盲区快照面板", "2", "19" },
            { "十一、判定逻辑", "2", "20" },
            { "十二、历史记录设计", "2", "20" },
            { "十三、系统角色 Prompt", "2", "21" },
            { "十四、链式追问生成 Prompt", "2", "22" },
            { "十五、Idea 拆解指令", "2", "23" },
            { "十六、盲区快照生成 Prompt", "2", "24" },
            { "十七、追问质量评测体系", "2", "25" },
        };
        for (int i = 0; i < toc.GetLength(0); i++)
            body.Append(new Paragraph(
                new ParagraphProperties(new ParagraphStyleId { Val = $"TOC{toc[i, 1]}" }),
                new Run(new Text(toc[i, 0])), new Run(new TabChar()), new Run(new Text(toc[i, 2]))));

        body.Append(new Paragraph(new Run(new FieldChar { FieldCharType = FieldCharValues.End })));

        body.Append(new Paragraph(new ParagraphProperties(new SectionProperties(
            new SectionType { Val = SectionMarkValues.NextPage },
            new PageSize { Width = (UInt32Value)(uint)A4W, Height = (UInt32Value)(uint)A4H },
            new PageMargin { Top = 1800, Right = 1440, Bottom = 1440, Left = 1440, Header = 720, Footer = 720 }))));
    }

    private static void AddDecisionRecordSection(Body body)
    {
        body.Append(H1("第一部分：决策记录", "_Toc001"));
        body.Append(P("本部分记录压力测试引擎模块的所有设计决策，包括讨论过程中的备选方案、最终选择及其理由。这些决策构成了从PRD到开发落地的关键桥梁。"));

        body.Append(H2("一、模块定位与边界"));
        body.Append(DecisionTbl(new string[,] {
            { "追问框架", "定位→竞争→可行性 三轮递进", "这是产品思维经典三角，递进关系有逻辑强制性：定位不成立则后续追问无意义", "MVP核心" },
            { "追问数量", "每轮2-3个核心追问，全程共9问", "抓住80%盲区即可，保留追问精准度，避免用户疑惑", "MVP核心" },
            { "深度档位", "MVP只做标准档（每轮3问）", "快速/标准/深度三档是体验优化，非核心验证，放到后续迭代", "P1迭代" },
            { "归档功能", "MVP不做一键归档", "归档是\"看\"的环节，MVP先完成\"练\"的核心体验", "P1迭代" },
            { "项目树", "MVP不做结构化项目树", "纯对话即可，MVP结束即会话结束", "P2迭代" },
            { "历史记录", "MVP必须保留", "用户需要回顾和续会，是基础能力", "MVP核心" },
        }));

        body.Append(H2("二、核心设计决策"));
        body.Append(DecisionTbl(new string[,] {
            { "追问生成策略", "先完整拆解Idea，再基于拆解结果追问", "追问精准命中用户描述中的模糊点，不浪费用户时间", "MVP核心" },
            { "拆解结果展示", "最终环节结束后展示", "作为盲区报告的\"AI理解快照\"，帮助用户看到AI如何理解他的idea", "MVP核心" },
            { "追问反馈风格", "追问中嵌套反馈", "每个追问本身就是对用户上文的引用和挑战，最自然的体验", "MVP核心" },
            { "上下文管理", "完整模式（全部对话历史）", "链式递进需要完整上下文，9轮对话内全覆盖最保险；后期再优化", "MVP核心" },
            { "终止判定", "严格判定", "根据盲区数量和严重程度给出判定，更像面试，有压力感", "MVP核心" },
        }));

        body.Append(H2("三、交互模式决策"));
        body.Append(DecisionTbl(new string[,] {
            { "追问交互模式", "逐题追问（A方案）", "一问一答，与大厂面试最一致，前端实现最轻，一个对话流组件即可承载", "已确认" },
            { "备选：批量卡片", "已否决", "全局视野好但面试感弱，用户可能觉得在\"看问卷\"", "已否决" },
            { "备选：半结构化", "已否决（放到P1）", "体验最好但复杂度高，MVP先验证核心价值", "P1迭代" },
        }));

        body.Append(H2("四、追问质量决策"));
        body.Append(DecisionTbl(new string[,] {
            { "尖锐度控制", "逐轮递增", "第1轮温和探究→第2轮直接挑战→第3轮压力测试，真实还原大厂面试节奏", "已确认" },
            { "轮内递进", "链式追问", "每轮3问形成链式：打开→深入→逼到边界，第2问基于第1问回答深入", "已确认" },
        }));

        body.Append(H2("五、终止条件与判定"));
        body.Append(DecisionTbl(new string[,] {
            { "判定类型", "严格判定", "根据盲区数量和严重程度给出判定，而非\"都答了就算通过\"", "已确认" },
            { "判定结果", "建议深入思考 / 基本可行", "两档结果，简洁明了，不做多级评分", "已确认" },
            { "备选：不设通过标准", "已否决", "只展示盲区清单太温和，严格判定更能激发用户成长动力", "已否决" },
            { "备选：宽松判定", "已否决", "\"都答了所以通过了\"没有信息量，比较鸡肋", "已否决" },
        }));
    }

    private static void AddDetailedPRDSection(WordprocessingDocument doc, Body body, MainDocumentPart mainPart, ref uint prId)
    {
        body.Append(new Paragraph(new ParagraphProperties(new SectionProperties(
            new SectionType { Val = SectionMarkValues.NextPage },
            new PageSize { Width = (UInt32Value)(uint)A4W, Height = (UInt32Value)(uint)A4H },
            new PageMargin { Top = 1800, Right = 1440, Bottom = 1440, Left = 1440, Header = 720, Footer = 720 }))));

        var headerPart = mainPart.AddNewPart<HeaderPart>();
        var headerId = mainPart.GetIdOfPart(headerPart);
        headerPart.Header = new Header(new Paragraph(
            new ParagraphProperties(new Justification { Val = JustificationValues.Right }),
            new Run(new RunProperties(new FontSize { Val = "18" }, new Color { Val = Colors.Light },
                new RunFonts { Ascii = "Calibri", HighAnsi = "Calibri", EastAsia = "Microsoft YaHei" }),
                new Text("压力测试引擎 | 详细PRD"))));

        var footerPart = mainPart.AddNewPart<FooterPart>();
        var footerId = mainPart.GetIdOfPart(footerPart);
        var fp = new Paragraph(new ParagraphProperties(new Justification { Val = JustificationValues.Center }));
        fp.Append(MkFRun("第 "));
        fp.Append(MkFRunField(FieldCodeVal: " PAGE "));
        fp.Append(MkFRun(" 页 / 共 "));
        fp.Append(MkFRunField(FieldCodeVal: " NUMPAGES "));
        fp.Append(MkFRun(" 页"));
        footerPart.Footer = new Footer(fp);

        body.Append(H1("第二部分：详细PRD", "_Toc002"));

        // 一、功能定义
        body.Append(H2("一、功能定义"));
        body.Append(H3("1.1 产品定位"));
        body.Append(P("压力测试引擎是一个模拟大厂PM面试官追问逻辑的AI引擎，对用户输入的任何商业idea进行多轮致命追问，暴露思维盲区。训练结果自动归档为结构化项目树，形成个人知识资产。"));

        body.Append(H3("1.2 输入"));
        body.Append(Bullet("用户用自然语言描述一个商业idea（可以很简略，如\"我想做一个帮助人专注的App\"）"));
        body.Append(Bullet("MVP不支持追问深度选择，默认标准档（每轮3问，共9问）"));

        body.Append(H3("1.3 输出"));
        body.Append(Bullet("AI三轮致命追问：每轮不同维度，逐层加深"));
        body.Append(Bullet("思维盲区快照：AI对Idea的结构化拆解 + 关键漏洞清单"));
        body.Append(Bullet("严格判定结果：\"建议深入思考\"或\"基本可行\""));

        // 二、用户交互流程
        body.Append(H2("二、用户交互流程"));
        body.Append(FlowTbl(new string[,] {
            { "1", "用户描述idea", "输入框，支持自然语言，可很简略" },
            { "2", "AI拆解Idea", "用户不可见，生成结构化拆解JSON" },
            { "3", "第1轮追问（定位）", "温和探究，3个链式追问：打开→深入→逼到边界" },
            { "4", "第2轮追问（竞争）", "直接挑战，3个链式追问：差异化→壁垒→短板" },
            { "5", "第3轮追问（可行性）", "压力测试，3个链式追问：商业模式→定价→Plan B" },
            { "6", "盲区快照", "展示AI理解 + 盲区清单 + 严格判定" },
            { "7", "历史记录", "自动保存，支持查看和续会" },
        }));

        // 三、AI Prompt体系设计
        body.Append(H2("三、AI Prompt体系设计"));
        body.Append(P("Prompt体系分为四层，每层承担不同职责："));

        body.Append(H3("3.1 第一层：系统角色设定（全局常伴）"));
        body.Append(Code("你是一个模拟大厂产品经理面试官的AI追问引擎。你的目标不是友善地鼓励用户，而是通过精准、锐利的追问，暴露用户商业idea中的思维盲区。"));
        body.Append(Code("追问原则：每个追问必须引用用户的上文内容或拆解结果；追问要具体到让用户无法泛泛而谈；追问中自然嵌套对用户上文的点评。"));

        body.Append(H3("3.2 第二层：Idea拆解指令（第一轮追问前触发一次）"));
        body.Append(Code("任务：从以下维度拆解用户的商业idea：目标用户、核心痛点、价值主张、解决方案、差异化声明、商业模式线索、关键假设、潜在竞品、风险信号。输出严格的JSON格式。"));

        body.Append(H3("3.3 第三层：轮次追问模板"));
        body.Append(P("每轮追问有独立的锚点约束和递进规则："));
        body.Append(PromptTbl());

        body.Append(H3("3.4 第四层：格式约束"));
        body.Append(Code("输出格式要求：只输出追问文本，不输出分析过程；追问长度控制在50-100字（中文）；如果是本轮最后一题，自然过渡到下一轮预告。"));

        // 四、追问交互模式
        body.Append(H2("四、追问交互模式"));
        body.Append(H3("4.1 逐题追问流程"));
        body.Append(FlowTbl(new string[,] {
            { "Step 1", "用户输入idea", "自然语言描述，无格式要求" },
            { "Step 2", "AI生成拆解JSON", "用户不可见，作为后续追问的素材库" },
            { "Step 3", "第1轮第1问发出", "引用拆解JSON，语气=温和，打开话题" },
            { "Step 4", "用户回答", "等待用户输入" },
            { "Step 5", "第1轮第2问发出", "引用用户上一次回答，深入追问" },
            { "Step 6", "用户回答", "..." },
            { "Step 7", "第1轮第3问发出", "引用前两次回答，逼到边界" },
            { "Step 8", "轮次过渡小结", "\"定位问题先到这里，接下来看看竞争层面\"" },
            { "Step 9-16", "第2轮和第3轮", "同理，语气逐轮递增" },
            { "Step 17", "展示盲区快照", "拆解快照 + 盲区清单 + 判定结果" },
        }));

        body.Append(H3("4.2 轮次过渡语"));
        body.Append(Code("定位的问题先到这里。现在进入竞争追问——我们聊聊你的差异化和壁垒。"));
        body.Append(Code("竞争层面的探讨结束了。最后我们看看可行性——你的商业模式和应对风险的Plan B。"));
        body.Append(Code("三轮追问结束。接下来我为你生成一份思维盲区总结..."));

        // 五、尖锐度控制策略
        body.Append(H2("五、尖锐度控制策略"));
        body.Append(SharpTbl());

        // 六、轮内递进设计
        body.Append(H2("六、轮内递进设计"));
        body.Append(P("每轮3个问题形成链式追问，不是独立的问题集："));

        body.Append(H3("6.1 第1轮（定位）链式递进示例"));
        body.Append(ChainTbl(new string[,] {
            { "第1问", "打开", "你想做一个帮助专注的App——能先说你的目标用户是谁吗？" },
            { "第2问", "深入", "你说是大学生——这个判断是基于你周围5个朋友的反馈，还是你自己的观察？" },
            { "第3问", "逼到边界", "如果是后者（自己的观察），你有没有想过，你自己可能不是典型用户？" },
        }));

        body.Append(H3("6.2 第2轮（竞争）链式递进示例"));
        body.Append(ChainTbl(new string[,] {
            { "第1问", "打开", "你说你的差异化是'建筑感空间'——和Forest的'种树机制'相比，这个差异究竟给用户带来了什么不同体验？" },
            { "第2问", "深入", "你说带来了'空间沉浸感'——如果Forest明天加一个'虚拟书房'功能，你的用户会流失吗？" },
            { "第3问", "逼到边界", "如果会流失，那你现在的什么能力是Forest花6个月也复制不了的？" },
        }));

        body.Append(H3("6.3 第3轮（可行性）链式递进示例"));
        body.Append(ChainTbl(new string[,] {
            { "第1问", "打开", "这个App你打算怎么收费？免费+增值，还是订阅制？" },
            { "第2问", "深入", "你说订阅制——大学生月均可支配收入约1500元，你凭什么让他们每月为你付19块而不是9块？" },
            { "第3问", "逼到边界", "如果6个月后付费转化率不到3%，你是降价、换人群，还是放弃这个项目？" },
        }));

        // 七、上下文管理策略
        body.Append(H2("七、上下文管理策略"));
        body.Append(H3("7.1 完整模式上下文组装"));
        body.Append(Code("messages: [\n  { role: \"system\", content: \"系统角色设定\" },\n  { role: \"user\", content: \"用户输入的idea\" },\n  { role: \"assistant\", content: \"拆解结果JSON\" },\n  { role: \"assistant\", content: \"第1轮第1问\" },\n  { role: \"user\", content: \"用户回答1\" },\n  ...\n]"));

        body.Append(H3("7.2 关键设计点"));
        body.Append(Bullet("拆解结果JSON作为上下文的一部分，始终伴随后续所有追问"));
        body.Append(Bullet("每次追问都能精准引用拆解中的具体字段"));
        body.Append(Bullet("9轮对话内完整覆盖，确保链式递进不断裂"));
        body.Append(Bullet("后期扩展到12-18问时再优化上下文裁剪策略"));

        // 八、数据模型定义
        body.Append(H2("八、数据模型定义"));
        body.Append(H3("8.1 PressureSession（会话根实体）"));
        body.Append(Code("interface PressureSession {\n  id: string;                    // 唯一标识\n  name: string;                  // 会话名称\n  createdAt: number;             // 创建时间戳\n  updatedAt: number;             // 最后更新时间\n  originalIdea: string;          // 用户原始idea\n  deconstruction: IdeaDeconstruction;\n  rounds: QuestionRound[];       // 长度固定为3\n  status: SessionStatus;         // 会话状态\n  blindSpotReport?: BlindSpotReport;\n}"));

        body.Append(H3("8.2 IdeaDeconstruction（AI拆解结果）"));
        body.Append(Code("interface IdeaDeconstruction {\n  targetUser: string;            // 目标用户\n  painPoint: string;             // 痛点\n  valueProposition: string;      // 价值主张\n  solution: string;              // 解决方案\n  differentiation: string;       // 差异化\n  businessModel: string;         // 商业模式\n  keyAssumptions: string[];      // 关键假设\n  potentialCompetitors: string[];// 潜在竞品\n  riskSignals: string[];         // 风险信号\n}"));

        body.Append(H3("8.3 QuestionRound（单轮追问）"));
        body.Append(Code("interface QuestionRound {\n  roundIndex: number;            // 1=定位, 2=竞争, 3=可行性\n  roundName: string;             // \"定位追问\" / \"竞争追问\" / \"可行性追问\"\n  tone: ToneLevel;               // mild / direct / pressure\n  questions: QuestionItem[];     // MVP固定3题\n  startTime?: number;\n  endTime?: number;\n  isCompleted: boolean;\n}"));

        body.Append(H3("8.4 QuestionItem（单个问答对）"));
        body.Append(Code("interface QuestionItem {\n  questionIndex: number;         // 1, 2, 3\n  questionText: string;          // AI追问文本\n  answerText?: string;           // 用户回答\n  references?: string[];         // 引用的历史片段\n  timestamp: number;\n  answeredAt?: number;\n}"));

        body.Append(H3("8.5 状态与判定类型"));
        body.Append(Code("type ToneLevel = 'mild' | 'direct' | 'pressure';\n\ntype SessionStatus =\n  | 'idle'              // 等待输入idea\n  | 'deconstructing'    // AI拆解中\n  | 'questioning'       // 追问进行中\n  | 'round_transition'  // 轮次过渡\n  | 'completed';        // 全部完成"));

        // 九、会话状态机
        body.Append(H2("九、会话状态机"));
        body.Append(StateTbl());

        // 十、盲区快照面板
        body.Append(H2("十、盲区快照面板"));
        body.Append(P("全部9问结束后，展示给用户的终端界面："));
        body.Append(H3("10.1 面板结构"));
        body.Append(Bullet("用户原始Idea展示"));
        body.Append(Bullet("AI理解 vs 用户回答对比表格（维度 × 用户声明 × AI追问发现）"));
        body.Append(Bullet("核心盲区清单（按严重程度分级：高/中/低）"));
        body.Append(Bullet("严格判定结果"));
        body.Append(Bullet("操作按钮：再来一次 / 去成长教练 / 复制报告"));

        body.Append(H3("10.2 快照示例"));
        body.Append(SnapshotTbl());

        // 十一、判定逻辑
        body.Append(H2("十一、判定逻辑"));
        body.Append(H3("11.1 判定规则"));
        body.Append(Code("function getVerdict(blindSpots): 'needs_rethink' | 'basically_viable' {\n  const highRisk = blindSpots.filter(s => s.severity === 'high').length;\n  const mediumRisk = blindSpots.filter(s => s.severity === 'medium').length;\n\n  if (highRisk >= 2) return 'needs_rethink';\n  if (highRisk >= 1 && mediumRisk >= 2) return 'needs_rethink';\n  return 'basically_viable';\n}"));

        body.Append(H3("11.2 判定标准"));
        body.Append(VerdictTbl());

        // 十二、历史记录设计
        body.Append(H2("十二、历史记录设计"));
        body.Append(H3("12.1 数据结构"));
        body.Append(Code("interface SessionHistoryItem {\n  id: string;\n  name: string;                  // 会话名称\n  ideaPreview: string;           // idea前30字预览\n  status: SessionStatus;         // 会话状态\n  createdAt: number;\n  completedAt?: number;\n  blindSpotCount?: number;       // 盲区数量\n  totalQuestions: number;        // 总问答数（MVP=9）\n  answeredQuestions: number;     // 已回答数\n}"));

        body.Append(H3("12.2 列表展示"));
        body.Append(HistoryTbl());

        body.Append(H3("12.3 排序规则"));
        body.Append(P("按最近更新时间倒序排列，最近更新的会话排在最前面。"));

        // 十三、系统角色 Prompt（严肃合伙人版）
        body.Append(H2("十三、系统角色 Prompt"));
        body.Append(P("角色定位：严肃的产品合伙人。对\"大概\"\"可能\"\"我觉得\"零容忍，每一个观点都必须有依据，每一个假设都必须被验证。"));

        body.Append(H3("13.1 追问原则 / 4条铁律"));
        body.Append(P("铁律1 引用原则：每个追问必须引用对方的idea描述或之前的回答。不要凭空发问。"));
        body.Append(P("铁律2 具体原则：追问要让对方无法泛泛而谈，无法绕开核心矛盾。"));
        body.Append(P("铁律3 嵌套原则：每个追问本身就包含对上文点评（指出矛盾、模糊、过度乐观）。"));
        body.Append(P("铁律4 递进原则：追问越来越深，同一维度的问题不能平行重复。"));

        body.Append(H3("13.2 语气体系 / 3轮递进"));
        body.Append(SharpTbl());

        body.Append(H3("13.3 禁忌黑名单"));
        body.Append(Bullet("绝对禁止：\"这个想法很好/不错/有创意\"、\"你的思路很清晰\"、任何鼓励性评价"));
        body.Append(Bullet("替代说法：\"XX的逻辑通顺，但YY没有说服我\"、\"我不关心你是否相信，我关心的是你是否能证明\""));

        body.Append(H3("13.4 思考框架（隐藏输出）"));
        body.Append(Code("[步骤1：引用提取] 对方上文中哪个词/哪句话是模糊的？\n[步骤2：盲区定位] 这个模糊点属于哪个维度？\n[步骤3：追问设计] 用当前轮次的语气，设计让对方无法绕开的追问\n[步骤4：自我检查] 是否引用上文？是否够具体？是否符合当前轮次？\n思考过程不输出，只输出追问文本。"));

        body.Append(H3("13.5 Few-shot 示例"));
        body.Append(P("示例1（第1轮）：对方说\"我想做一个帮助人专注的App\" → 追问：\"帮助人专注——你解决的是'开始专注'的问题，还是'维持专注'的问题？这两个问题对应的产品形态完全不同。你先回答这个，我们再往下聊。\""));
        body.Append(P("示例2（第2轮）：对方说\"差异化是建筑感空间\" → 追问：\"你说'建筑感空间'——Forest已经做了8年，用户心智里'种树=专注'已经固化。你凭什么认为用户会放弃一棵种了8年的树，去拥抱一个不知道是什么的'建筑'？\""));
        body.Append(P("示例3（第3轮）：对方说\"大学生月付19块没问题\" → 追问：\"你说月付19块没问题——请给我一个数据。你调研过多少大学生？他们的月均App支出是多少？19块占他们可支配收入的百分之几？不要告诉我你觉得没问题，告诉我数字。\""));

        // 十四、链式追问生成 Prompt
        body.Append(H2("十四、链式追问生成 Prompt"));
        body.Append(P("每次调用AI生成追问时，messages中包含完整的对话历史（逐字注入），以及当前追问的生成指令。"));

        body.Append(H3("14.1 架构"));
        body.Append(Code("messages = [\n  { role: \"system\", content: systemPrompt },\n  { role: \"user\", content: userOriginalIdea },\n  { role: \"assistant\", content: deconstructionJSON },\n  { role: \"assistant\", content: \"R1-Q1追问\" },\n  { role: \"user\", content: \"R1-Q1回答\" },\n  ... // 全部对话逐字注入\n  { role: \"user\", content: currentQuestionPrompt } // 当前追问指令\n]"));

        body.Append(H3("14.2 Fallback 策略"));
        body.Append(P("质量检查：引用检查（是否含用户上文≥3字）、长度检查（30-120字）、禁忌检查、重复检查、语气检查。"));
        body.Append(Code("调用AI生成追问\n  → 质量检查（5项）\n    ├─ 全部通过 → 展示 ✅\n    └─ 不通过 → 重试（附加修正指令）\n         ├─ 通过 → 展示 ✅\n         └─ 仍不通过 → 预设模板追问 ✅"));

        body.Append(H3("14.3 Token 估算"));
        body.Append(TokenTbl());

        body.Append(H3("14.4 决策记录"));
        body.Append(DecisionTbl2());

        // 十五、Idea 拆解指令
        body.Append(H2("十五、Idea 拆解指令"));
        body.Append(P("从用户的自然语言描述中提取9个维度的结构化信息，并支持迭代更新。"));

        body.Append(H3("15.1 迭代拆解流程"));
        body.Append(Code("用户输入idea\n  → 【初始拆解】生成初始JSON\n  → 第1轮追问（基于初始拆解）\n  → 用户回答\n  → 【增量更新】更新拆解JSON\n  → 第2轮追问（基于更新后拆解）\n  → 用户回答\n  → 【增量更新】更新拆解JSON\n  → 第3轮追问\n  → 【增量更新】生成最终拆解JSON\n  → 盲区快照基于最终拆解生成"));

        body.Append(H3("15.2 9个拆解维度"));
        body.Append(Bullet("targetUser（目标用户）：具体人群 + 细分场景"));
        body.Append(Bullet("painPoint（核心痛点）：用户在什么场景下遇到了什么问题"));
        body.Append(Bullet("valueProposition（价值主张）：解决痛点后带来什么改变"));
        body.Append(Bullet("solution（解决方案）：产品/服务形态"));
        body.Append(Bullet("differentiation（差异化声明）：与竞品不同之处"));
        body.Append(Bullet("businessModel（商业模式线索）：如何赚钱"));
        body.Append(Bullet("keyAssumptions（关键假设）：未经证实但idea依赖的前提，至少2个"));
        body.Append(Bullet("potentialCompetitors（潜在竞品）：用户提到的 + 品类常识推断"));
        body.Append(Bullet("riskSignals（风险信号）：自相矛盾、过度乐观，至少1个"));

        body.Append(H3("15.3 未明确的判断标准"));
        body.Append(DecisionTbl3());

        body.Append(H3("15.4 高置信度推断清单"));
        body.Append(HighConfTbl());

        body.Append(H3("15.5 增量更新规则"));
        body.Append(Bullet("补充：用户回答中明确的新信息 → 更新对应字段"));
        body.Append(Bullet("修正：用户回答纠正了推断 → 修正对应字段"));
        body.Append(Bullet("验证：用户回答为假设提供依据 → 标记为[已验证]"));
        body.Append(Bullet("新增：回答中暴露的新假设/风险 → 添加"));
        body.Append(Bullet("保留：未被影响的字段 → 保持不变"));

        body.Append(H3("15.6 Fallback 降级方案"));
        body.Append(FallbackTbl2());

        body.Append(H3("15.7 决策记录"));
        body.Append(DecisionTbl4());

        // 十六、盲区快照生成 Prompt
        body.Append(H2("十六、盲区快照生成 Prompt"));
        body.Append(P("盲区快照是压力测试的终端交付物。用户在完成9轮追问后看到的一份结构化思维诊断报告。"));

        body.Append(H3("16.1 盲区分析逻辑"));
        body.Append(P("盲区 = 拆解盲区（维度缺失）+ 对话盲区（回答暴露）+ 假设盲区（未验证前提）"));
        body.Append(Code("追问过程中实时积累：\n  R1-Q1 → 用户回答模糊 → 标记：targetUser定义不清\n  R1-Q2 → 用户承认是观察 → 标记：缺乏用户调研\n  R2-Q1 → 用户无法回答差异点 → 标记：差异化站不住\n  ...（每轮追问中持续积累）\n\n快照阶段：\n  → 汇总所有已标记的盲区\n  → 去重、分级、组织\n  → 生成最终报告"));

        body.Append(H3("16.2 严重程度判定"));
        body.Append(SeverityTbl());

        body.Append(H3("16.3 判定逻辑"));
        body.Append(Code("function getVerdict(blindSpots): 'needs_rethink' | 'basically_viable' {\n  const highRisk = blindSpots.filter(s => s.severity === 'high').length;\n  const mediumRisk = blindSpots.filter(s => s.severity === 'medium').length;\n  \n  if (highRisk >= 2) return 'needs_rethink';\n  if (highRisk >= 1 && mediumRisk >= 2) return 'needs_rethink';\n  return 'basically_viable';\n}"));

        body.Append(H3("16.4 快照生成 Prompt"));
        body.Append(P("基于追问过程中积累的盲区标记列表 + 最终拆解JSON，生成结构化报告。"));
        body.Append(Code("生成步骤：\n步骤1：汇总——按维度归类、去重合并\n步骤2：分级——确认high/medium/low\n步骤3：判定——计算high和medium数量\n步骤4：输出——拆解快照表格 + 盲区清单 + 判定结果"));

        body.Append(H3("16.5 快照展示格式"));
        body.Append(P("拆解快照表格：维度 × 用户描述 × AI追问发现（✅通过 / ⚠️有盲区 / ❌高风险）"));
        body.Append(P("盲区清单：按严重程度排序（🔴高 → 🟡中 → 🟢低），含修复建议"));
        body.Append(P("判定结果：🔴建议深入思考 或 🟢基本可行 + 一句话解释"));
        body.Append(P("操作按钮：[再来一次] / [去成长教练] / [复制报告]"));

        body.Append(H3("16.6 追问过程中的盲区标记"));
        body.Append(P("每问生成时同步返回盲区标记（JSON格式），不展示给用户，后台实时积累。"));
        body.Append(Code("interface QuestionGenerationResult {\n  questionText: string;       // 追问文本\n  blindSpotMarker?: {         // 盲区标记（后台积累）\n    dimension: string;\n    description: string;\n    severity: 'high' | 'medium' | 'low';\n  };\n}"));

        body.Append(H3("16.7 决策记录"));
        body.Append(DecisionTbl5());

        // 十七、追问质量评测体系
        body.Append(H2("十七、追问质量评测体系"));
        body.Append(P("系统性测试9个追问质量的3层评测体系 + Prompt版本管理系统。"));

        body.Append(H3("17.1 5维度评分模型"));
        body.Append(Code("总分 = 引用质量×30% + 语气准确性×25% + 问题深度×25% + 文本质量×10% + 独特性×10%\n通过线：总分 ≥ 60分，且每个维度 ≥ 2分"));

        body.Append(H3("17.2 维度定义"));
        body.Append(Bullet("引用质量（30%）：是否精准引用用户上文，引用是否自然嵌入"));
        body.Append(Bullet("语气准确性（25%）：是否符合当前轮次的语气要求"));
        body.Append(Bullet("问题深度（25%）：是否让对方无法泛泛而谈"));
        body.Append(Bullet("文本质量（10%）：长度、违禁词、语病、完整性"));
        body.Append(Bullet("独特性（10%）：是否与之前的问题不重复"));

        body.Append(H3("17.3 3层评测体系"));
        body.Append(Code("Layer 1：自动化评测（程序层）→ 快速筛选，零延迟\nLayer 2：AI评测（10%抽样）→ 质量评分，后台异步\nLayer 3：人工评测（专家抽样）→ 最终校准，持续优化"));

        body.Append(H3("17.4 自动化硬性检查"));
        body.Append(Bullet("长度：30-120字，不通过触发Fallback"));
        body.Append(Bullet("违禁词：包含黑名单词汇触发Fallback"));
        body.Append(Bullet("重复：与之前问题相似度>60%触发Fallback"));
        body.Append(Bullet("引用检测：是否包含用户上文关键词"));

        body.Append(H3("17.5 测试用例设计"));
        body.Append(Bullet("品类覆盖：8个品类（专注/社交/电商/笔记/音乐/健身/出行/模糊）"));
        body.Append(Bullet("描述长度：极简/中等/详细3种"));
        body.Append(Bullet("用户类型：学生/转行/初级PM"));
        body.Append(Bullet("边界情况：空白/乱码/英文/超长/竞品对比式5种"));

        body.Append(H3("17.6 Prompt 版本管理系统"));
        body.Append(Code("发现低分追问模式\n  → 分析共同原因\n  → 修改对应Prompt\n  → 用测试用例集重新评测\n  → 对比基线分数\n    ├─ 分数提升≥5分 → 发布新版本 ✅\n    ├─ 分数持平 → 观察一周\n    └─ 分数下降 → 回滚 ❌"));

        body.Append(H3("17.7 决策记录"));
        body.Append(DecisionTbl6());

        body.Append(new Paragraph(new ParagraphProperties(new SectionProperties(
            new HeaderReference { Type = HeaderFooterValues.Default, Id = headerId },
            new FooterReference { Type = HeaderFooterValues.Default, Id = footerId },
            new PageSize { Width = (UInt32Value)(uint)A4W, Height = (UInt32Value)(uint)A4H },
            new PageMargin { Top = 1800, Right = 1440, Bottom = 1440, Left = 1440, Header = 720, Footer = 720 }))));
    }

    private static void AddBackcoverSection(Body body, string backBgId, ref uint prId)
    {
        body.Append(new Paragraph(new Run(CreateFloatingBackground(backBgId, prId++, "BackBg"))));
        body.Append(new Paragraph(
            new ParagraphProperties(new SpacingBetweenLines { Before = "7000" },
                new Justification { Val = JustificationValues.Center }),
            new Run(new RunProperties(new FontSize { Val = "48" }, new Bold(),
                new RunFonts { Ascii = "Calibri", HighAnsi = "Calibri", EastAsia = "Microsoft YaHei" },
                new Color { Val = Colors.Primary }),
                new Text("练 · 学 · 看"))));
        body.Append(new Paragraph(
            new ParagraphProperties(new SpacingBetweenLines { Before = "400" },
                new Justification { Val = JustificationValues.Center }),
            new Run(new RunProperties(new FontSize { Val = "24" },
                new RunFonts { Ascii = "Calibri", HighAnsi = "Calibri", EastAsia = "Microsoft YaHei" },
                new Color { Val = Colors.Mid }),
                new Text("完整思维训练闭环"))));
        body.Append(new Paragraph(
            new ParagraphProperties(new SpacingBetweenLines { Before = "3000" },
                new Justification { Val = JustificationValues.Center }),
            new Run(new RunProperties(new FontSize { Val = "20" },
                new RunFonts { Ascii = "Calibri", HighAnsi = "Calibri", EastAsia = "Microsoft YaHei" },
                new Color { Val = Colors.Light }),
                new Text("Web思维训练工作台 | 2026"))));
        body.Append(new SectionProperties(
            new PageSize { Width = (UInt32Value)(uint)A4W, Height = (UInt32Value)(uint)A4H },
            new PageMargin { Top = 0, Right = 0, Bottom = 0, Left = 0, Header = 0, Footer = 0 }));
    }

    // ========================================================================
    // Factory helpers
    // ========================================================================
    private static int _bookmarkId = 0;

    private static Paragraph H1(string text, string bookmarkName)
    {
        int id = ++_bookmarkId;
        return new Paragraph(
            new ParagraphProperties(new ParagraphStyleId { Val = "Heading1" }),
            new BookmarkStart { Id = id.ToString(), Name = bookmarkName },
            new Run(new Text(text)),
            new BookmarkEnd { Id = id.ToString() });
    }

    private static Paragraph H2(string text) => new Paragraph(
        new ParagraphProperties(new ParagraphStyleId { Val = "Heading2" }),
        new Run(new Text(text)));

    private static Paragraph H3(string text) => new Paragraph(
        new ParagraphProperties(new ParagraphStyleId { Val = "Heading3" }),
        new Run(new Text(text)));

    private static Paragraph P(string text) => new Paragraph(new Run(new Text(text)));

    private static Paragraph Bullet(string text) => new Paragraph(
        new ParagraphProperties(
            new NumberingProperties(new NumberingLevelReference { Val = 0 }, new NumberingId { Val = 1 }),
            new Indentation { FirstLine = "0" }),
        new Run(new Text(text)));

    private static Paragraph Code(string text) => new Paragraph(
        new ParagraphProperties(new ParagraphStyleId { Val = "Code" }),
        new Run(new Text(text) { Space = SpaceProcessingModeValues.Preserve }));

    private static Run MkFRun(string text) => new Run(
        new RunProperties(new FontSize { Val = "18" }, new Color { Val = Colors.Light },
            new RunFonts { Ascii = "Calibri", HighAnsi = "Calibri", EastAsia = "Microsoft YaHei" }),
        new Text(text) { Space = SpaceProcessingModeValues.Preserve });

    private static Run MkFRunField(string FieldCodeVal) => new Run(
        new RunProperties(new FontSize { Val = "18" }, new Color { Val = Colors.Light },
            new RunFonts { Ascii = "Calibri", HighAnsi = "Calibri", EastAsia = "Microsoft YaHei" }),
        new FieldChar { FieldCharType = FieldCharValues.Begin },
        new FieldCode(FieldCodeVal) { Space = SpaceProcessingModeValues.Preserve },
        new FieldChar { FieldCharType = FieldCharValues.Separate },
        new Text("1"),
        new FieldChar { FieldCharType = FieldCharValues.End });

    // ========================================================================
    // Table builders
    // ========================================================================
    private static Table MkTbl(int[] widths, string[] headers, string[][] rows)
    {
        var tbl = new Table(new TableProperties(
            new TableWidth { Width = "5000", Type = TableWidthUnitValues.Pct },
            new TableBorders(
                new TopBorder { Val = BorderValues.Single, Size = 12, Color = Colors.Primary },
                new BottomBorder { Val = BorderValues.Single, Size = 12, Color = Colors.Primary },
                new LeftBorder { Val = BorderValues.Nil }, new RightBorder { Val = BorderValues.Nil },
                new InsideHorizontalBorder { Val = BorderValues.Single, Size = 4, Color = Colors.Border },
                new InsideVerticalBorder { Val = BorderValues.Nil })),
            new TableGrid(widths.Select(w => new GridColumn { Width = w.ToString() }).ToArray()));

        tbl.Append(MkHdrRow(widths, headers));
        foreach (var row in rows)
            tbl.Append(MkDataRow(widths, row));
        return tbl;
    }

    private static TableRow MkHdrRow(int[] widths, string[] cells)
    {
        var row = new TableRow();
        row.Append(new TableRowProperties(new TableHeader()));
        for (int i = 0; i < cells.Length; i++)
        {
            var tcp = new TableCellProperties(
                new TableCellWidth { Width = widths[i].ToString(), Type = TableWidthUnitValues.Dxa },
                new Shading { Val = ShadingPatternValues.Clear, Fill = Colors.TableHeader },
                new TableCellBorders(new BottomBorder { Val = BorderValues.Single, Size = 6, Color = Colors.Primary }));
            var rpr = new RunProperties(
                new RunFonts { Ascii = "Calibri", HighAnsi = "Calibri", EastAsia = "Microsoft YaHei" },
                new FontSize { Val = "20" }, new Bold(), new Color { Val = Colors.Dark });
            row.Append(new TableCell(tcp, new Paragraph(
                new ParagraphProperties(new Justification { Val = JustificationValues.Center },
                    new Indentation { FirstLine = "0" }, new SpacingBetweenLines { Before = "60", After = "60" }),
                new Run(rpr, new Text(cells[i])))));
        }
        return row;
    }

    private static TableRow MkDataRow(int[] widths, string[] cells)
    {
        var row = new TableRow();
        for (int i = 0; i < cells.Length; i++)
        {
            var tcp = new TableCellProperties(new TableCellWidth { Width = widths[i].ToString(), Type = TableWidthUnitValues.Dxa });
            var rpr = new RunProperties(
                new RunFonts { Ascii = "Calibri", HighAnsi = "Calibri", EastAsia = "Microsoft YaHei" },
                new FontSize { Val = "20" }, new Color { Val = Colors.Dark });
            row.Append(new TableCell(tcp, new Paragraph(
                new ParagraphProperties(new Indentation { FirstLine = "0" },
                    new SpacingBetweenLines { Before = "40", After = "40" }),
                new Run(rpr, new Text(cells[i])))));
        }
        return row;
    }

    private static Table DecisionTbl(string[,] data)
    {
        int n = data.GetLength(0);
        var rows = new string[n][];
        for (int i = 0; i < n; i++)
            rows[i] = new[] { data[i, 0], data[i, 1], data[i, 2], data[i, 3] };
        return MkTbl(new[] { 2200, 3000, 3200, 1200 },
            new[] { "决策点", "最终选择", "理由", "优先级" }, rows);
    }

    private static Table FlowTbl(string[,] data)
    {
        int n = data.GetLength(0);
        var rows = new string[n][];
        for (int i = 0; i < n; i++)
            rows[i] = new[] { data[i, 0], data[i, 1], data[i, 2] };
        return MkTbl(new[] { 1200, 2800, 5600 },
            new[] { "步骤", "动作", "说明" }, rows);
    }

    private static Table PromptTbl()
    {
        return MkTbl(new[] { 1400, 1800, 6400 },
            new[] { "轮次", "锚点", "递进规则" },
            new[] {
                new[] { "第1轮", "用户/痛点/价值", "第1问：请用户澄清目标用户定义 → 第2问：引用第1问回答，检验真实性 → 第3问：基于前两问回答，指出未意识到的偏差" },
                new[] { "第2轮", "差异化/壁垒", "第1问：请用户澄清差异化定义 → 第2问：引用差异化定义，挑战壁垒 → 第3问：基于前两问，逼出无法回避的竞争短板" },
                new[] { "第3轮", "商业模式/风险", "第1问：请用户澄清商业模式 → 第2问：引用定价/模式，挑战合理性 → 第3问：基于前两问，逼出未想过的风险场景和Plan B" },
            });
    }

    private static Table SharpTbl()
    {
        return MkTbl(new[] { 1400, 1400, 3800, 3000 },
            new[] { "轮次", "语气基调", "追问句式特征", "心理感受" },
            new[] {
                new[] { "第1轮", "温和探究", "\"你能多说一点...吗？\" \"我想确认一下...\"", "被倾听，愿意展开" },
                new[] { "第2轮", "直接挑战", "\"你说X——但如果Y呢？\" \"这里有一个矛盾...\"", "被挑战，需要思考" },
                new[] { "第3轮", "压力测试", "\"你凭什么认为...？\" \"如果X不成立，整个项目还站得住吗？\"", "高压下暴露真实盲区" },
            });
    }

    private static Table ChainTbl(string[,] data)
    {
        int n = data.GetLength(0);
        var rows = new string[n][];
        for (int i = 0; i < n; i++)
            rows[i] = new[] { data[i, 0], data[i, 1], data[i, 2] };
        return MkTbl(new[] { 1200, 1400, 7000 },
            new[] { "题号", "递进关系", "示例" }, rows);
    }

    private static Table StateTbl()
    {
        return MkTbl(new[] { 2200, 4000, 3400 },
            new[] { "状态", "触发条件", "下一状态" },
            new[] {
                new[] { "idle", "用户创建会话，等待输入idea", "deconstructing" },
                new[] { "deconstructing", "用户提交idea后，AI拆解中", "questioning" },
                new[] { "questioning", "追问进行中，等待用户回答", "round_transition（本轮结束时）" },
                new[] { "round_transition", "本轮全部答完，展示过渡小结", "questioning（下一轮）或 completed" },
                new[] { "completed", "全部9问答完，展示盲区快照", "终端状态" },
            });
    }

    private static Table SnapshotTbl()
    {
        return MkTbl(new[] { 2000, 3000, 4600 },
            new[] { "维度", "用户的声明", "AI的追问发现" },
            new[] {
                new[] { "目标用户", "大学生", "⚠️ 场景未细分（备考/社交/求职）" },
                new[] { "痛点", "专注力被碎片化App毁掉", "⚠️ 未验证是观察还是调研" },
                new[] { "差异化", "建筑感空间", "✅ 有独特定义" },
                new[] { "商业模式", "订阅制", "❌ 定价逻辑不充分" },
                new[] { "关键假设", "大学生愿意为专注付费", "❌ 未考虑支付能力" },
            });
    }

    private static Table VerdictTbl()
    {
        return MkTbl(new[] { 3000, 6600 },
            new[] { "判定结果", "触发条件" },
            new[] {
                new[] { "🔴 建议深入思考", "高风险盲区≥2个，或 1高+2中风险" },
                new[] { "🟢 基本可行", "不满足以上任何一条" },
            });
    }

    private static Table HistoryTbl()
    {
        return MkTbl(new[] { 2000, 7600 },
            new[] { "字段", "展示方式" },
            new[] {
                new[] { "会话名称", "主标题，点击可进入继续/查看" },
                new[] { "Idea预览", "副标题，前30字 + \"...\"" },
                new[] { "状态标签", "进行中（蓝色）/ 已完成（绿色）" },
                new[] { "创建时间", "\"5月12日 14:30\" 格式" },
                new[] { "盲区数量", "完成后显示 \"发现3个盲区\"" },
                new[] { "操作按钮", "继续追问 / 查看报告 / 删除" },
            });
    }

    private static Table TokenTbl()
    {
        return MkTbl(new[] { 2400, 3600, 3600 },
            new[] { "追问进度", "上下文内容", "估算Token" },
            new[] {
                new[] { "R1-Q1", "system + idea + 拆解JSON + 指令", "~1500" },
                new[] { "R1-Q2", "上述 + R1-Q1问答", "~1800" },
                new[] { "R1-Q3", "上述 + R1-Q2问答", "~2100" },
                new[] { "R2-Q1", "上述 + R1-Q3问答", "~2400" },
                new[] { "R2-Q2", "上述 + R2-Q1问答", "~2700" },
                new[] { "R2-Q3", "上述 + R2-Q2问答", "~3000" },
                new[] { "R3-Q1", "上述 + R2-Q3问答", "~3300" },
                new[] { "R3-Q2", "上述 + R3-Q1问答", "~3600" },
                new[] { "R3-Q3", "上述 + R3-Q2问答", "~3900" },
            });
    }

    private static Table DecisionTbl2()
    {
        return MkTbl(new[] { 2400, 2400, 3600, 1200 },
            new[] { "决策点", "最终选择", "备选", "理由" },
            new[] {
                new[] { "指令组织", "9个独立指令", "统一模板+动态参数", "独立指令可精细调优，追问质量高" },
                new[] { "对话历史注入", "逐字注入", "摘要注入", "链式追问需要精准引用，逐字最可靠" },
                new[] { "Fallback策略", "L1重试→L2模板", "仅用模板 / 跳过", "重试给AI一次机会，避免模板化追问" },
                new[] { "追问长度", "50-80字（边界80-120）", "统一长度", "打开/深入简洁，逼到边界可稍长" },
                new[] { "思考过程输出", "完全隐藏", "输出到日志", "MVP简洁优先，调试模式单独记录" },
            });
    }

    private static Table DecisionTbl3()
    {
        return MkTbl(new[] { 2800, 3400, 3400 },
            new[] { "情况", "处理方式", "附带操作" },
            new[] {
                new[] { "完全未提及", "标注'未明确'", "无" },
                new[] { "提及但过于笼统", "标注该词", "在riskSignals中标注'XX定义过于笼统'" },
                new[] { "提及但缺乏依据", "标注该描述", "在riskSignals中标注'XX缺乏实证支撑'" },
            });
    }

    private static Table HighConfTbl()
    {
        return MkTbl(new[] { 2800, 6800 },
            new[] { "品类", "高置信度推断竞品" },
            new[] {
                new[] { "专注类App", "Forest、番茄ToDo" },
                new[] { "社交类App", "微信、小红书" },
                new[] { "电商类", "淘宝、拼多多、京东" },
                new[] { "笔记/文档", "Notion、飞书文档" },
                new[] { "音乐类", "网易云音乐、QQ音乐" },
                new[] { "健身类", "Keep" },
                new[] { "出行类", "滴滴、高德" },
                new[] { "品类不明确", "不推断，标注'需进一步确认'" },
            });
    }

    private static Table FallbackTbl2()
    {
        return MkTbl(new[] { 1600, 2000, 5200 },
            new[] { "阶段", "行为", "说明" },
            new[] {
                new[] { "第1次", "调用AI生成", "正常流程" },
                new[] { "校验", "5项检查", "引用/长度/禁忌/重复/语气" },
                new[] { "不通过", "重试1次", "附加修正指令" },
                new[] { "仍不通过", "默认值降级", "通用假设 + '未明确'填充" },
                new[] { "降级默认值", "targetUser='未明确'", "追问仍能继续" },
                new[] { "降级默认值", "keyAssumptions=['用户需求存在']", "通用假设" },
                new[] { "降级默认值", "riskSignals=['缺乏数据支撑']", "通用风险" },
            });
    }

    private static Table DecisionTbl4()
    {
        return MkTbl(new[] { 2800, 2600, 4200 },
            new[] { "决策点", "选择", "理由" },
            new[] {
                new[] { "拆解模式", "迭代拆解", "用户补充的新信息被结构化，追问越来越精准" },
                new[] { "更新时机", "每轮后1次", "平衡更新频率和token消耗" },
                new[] { "更新策略", "增量更新", "不重新拆解，只更新被影响字段" },
                new[] { "推断策略", "混合策略", "用户提到的 + 品类常识推断" },
                new[] { "推断边界", "品类明确时推断头部竞品", "避免推断错误导致追问跑偏" },
                new[] { "Fallback", "重试1次→默认值降级", "保证追问链不中断" },
                new[] { "降级默认值", "通用假设+'未明确'填充", "追问仍能继续，精准度降低" },
            });
    }

    private static Table SeverityTbl()
    {
        return MkTbl(new[] { 1400, 1400, 3600, 3200 },
            new[] { "级别", "图标", "定义", "对用户的影响" },
            new[] {
                new[] { "高", "🔴", "核心维度存在根本性缺陷，idea成立的前提不成立", "必须重新思考该维度" },
                new[] { "中", "🟡", "核心维度有模糊点，但idea仍有讨论空间", "需要补充验证或调整" },
                new[] { "低", "🟢", "非核心维度不够完善，不影响idea整体方向", "建议优化但非必须" },
            });
    }

    private static Table DecisionTbl5()
    {
        return MkTbl(new[] { 2800, 2800, 4000 },
            new[] { "决策点", "选择", "理由" },
            new[] {
                new[] { "盲区分析时机", "追问过程中实时积累", "快照阶段只做汇总，保证一致性" },
                new[] { "严重程度分级", "3级（高/中/低）", "足够区分优先级，不复杂" },
                new[] { "判定结果", "2档（建议深入思考/基本可行）", "简洁明了，不多级评分" },
                new[] { "快照格式", "表格+清单+判定", "结构化展示，一目了然" },
                new[] { "操作按钮", "再来一次/成长教练/复制报告", "形成完整闭环" },
                new[] { "盲区标记时机", "追问生成时同步返回", "不增加额外AI调用" },
            });
    }

    private static Table DecisionTbl6()
    {
        return MkTbl(new[] { 2800, 2600, 4200 },
            new[] { "决策点", "选择", "理由" },
            new[] {
                new[] { "评测方案", "10%抽样AI + 程序层硬性检查", "MVP平衡质量与效率，零额外延迟" },
                new[] { "通过线", "60分，每维度≥2", "平衡质量和效率" },
                new[] { "评测维度", "5维度（引用/语气/深度/文本/独特）", "覆盖追问质量全部关键方面" },
                new[] { "权重分配", "30/25/25/10/10", "引用最重要，文本和独特为辅" },
                new[] { "AI评测时机", "后台异步，不阻塞追问", "用户体验优先" },
                new[] { "人工评测", "每周10% + 低分强制复查 + 版本上线前", "三重保障" },
                new[] { "Prompt版本管理", "独立系统，评测驱动", "每次修改有据可依" },
                new[] { "版本通过标准", "新分≥基线+5才发布", "防止负优化" },
            });
    }

    // ========================================================================
    // Image helpers
    // ========================================================================
    private static string AddImage(MainDocumentPart mp, string path)
    {
        var ip = mp.AddImagePart(ImagePartType.Png);
        using var fs = new FileStream(path, FileMode.Open);
        ip.FeedData(fs); return mp.GetIdOfPart(ip);
    }

    private static Drawing CreateFloatingBackground(string imgId, uint prId, string name)
    {
        return new Drawing(new DW.Anchor(
            new DW.SimplePosition { X = 0, Y = 0 },
            new DW.HorizontalPosition(new DW.PositionOffset("0")) { RelativeFrom = DW.HorizontalRelativePositionValues.Page },
            new DW.VerticalPosition(new DW.PositionOffset("0")) { RelativeFrom = DW.VerticalRelativePositionValues.Page },
            new DW.Extent { Cx = A4WE, Cy = A4HE },
            new DW.EffectExtent { LeftEdge = 0, TopEdge = 0, RightEdge = 0, BottomEdge = 0 },
            new DW.WrapNone(),
            new DW.DocProperties { Id = prId, Name = name },
            new DW.NonVisualGraphicFrameDrawingProperties(new A.GraphicFrameLocks { NoChangeAspect = true }),
            new A.Graphic(new A.GraphicData(
                new PIC.Picture(
                    new PIC.NonVisualPictureProperties(
                        new PIC.NonVisualDrawingProperties { Id = 0, Name = $"{name}.png" },
                        new PIC.NonVisualPictureDrawingProperties()),
                    new PIC.BlipFill(new A.Blip { Embed = imgId }, new A.Stretch(new A.FillRectangle())),
                    new PIC.ShapeProperties(
                        new A.Transform2D(new A.Offset { X = 0, Y = 0 }, new A.Extents { Cx = A4WE, Cy = A4HE }),
                        new A.PresetGeometry { Preset = A.ShapeTypeValues.Rectangle })))
            { Uri = "http://schemas.openxmlformats.org/drawingml/2006/picture" }))
        { DistanceFromTop = 0, DistanceFromBottom = 0, DistanceFromLeft = 0, DistanceFromRight = 0,
          SimplePos = false, RelativeHeight = 251658240, BehindDoc = true,
          Locked = false, LayoutInCell = true, AllowOverlap = true });
    }

    // ========================================================================
    // Settings & Numbering
    // ========================================================================
    private static void SetUpdateFieldsOnOpen(MainDocumentPart mp)
    {
        var sp = mp.DocumentSettingsPart ?? mp.AddNewPart<DocumentSettingsPart>();
        sp.Settings = new Settings(new UpdateFieldsOnOpen { Val = true }, new DisplayBackgroundShape());
    }

    private static void AddNumbering(MainDocumentPart mp)
    {
        var np = mp.AddNewPart<NumberingDefinitionsPart>();
        np.Numbering = new Numbering(
            new AbstractNum(new Level(
                new NumberingFormat { Val = NumberFormatValues.Decimal },
                new LevelText { Val = "%1." },
                new LevelJustification { Val = LevelJustificationValues.Left },
                new ParagraphProperties(new Indentation { Left = "720", Hanging = "360" })
            ) { LevelIndex = 0 }) { AbstractNumberId = 1 },
            new NumberingInstance(new AbstractNumId { Val = 1 }) { NumberID = 1 });
    }
}
