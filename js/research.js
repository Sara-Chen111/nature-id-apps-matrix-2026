/* ============================================================
   研究内容层（人工整理，非脚本生成）
   依据：11-交互截图素材 实拍（本页 scripts/contact_sheets.py 接触表逐屏识读）
        + 10-底表/07-D6逐屏实测_PictureThis与Seek时序还原.md
        + 02-板块二_母公司档案/（7 家公司档案）
        + 03-板块三_运营层解剖/02-活动盘点、04-识别反馈方式对照
        + 00-汇报框架/07-补缺_社群运营 + xlsx-9 奖项与机构合作
        + 新增数据_类目TOP3【zcode】/ 公开数字
   ============================================================ */
(function () {
  'use strict';

  /* ============ 交互链路（steps.shot = 实拍截图序号，从 1 起） ============ */
  var CHAINS = {
    "1252497129": { name: "PictureThis", verdict: "激进转化型：先收钱再给体验；同一产品对不同时机给不同价（分时定价）", steps: [
      { t: "协议门", d: "「Botanist in Your Pocket」，无勾选框，点 Continue 即视为同意条款", shot: 1 },
      { t: "价值轮播 ×6", d: "养护→发现→诊断→「6 年准确率第一·密歇根州立大学研究背书」→「1 亿植物爱好者」+ 双商店编辑推荐徽章", shot: 3, shot2: 8 },
      { t: "付费墙 ① 首启即出", d: "Design Your Trial：7 天免费 + $0.99/月档；试用提醒开关默认关", shot: 9, key: true },
      { t: "拍摄教学 Snap Tips", d: "付费墙之后才教怎么拍——先收钱，再教使用", shot: 10 },
      { t: "付费墙 ② 识别前", d: "Choose your plan：PLUS/PRO 双 Tab + 「Pay what you want」滑杆", shot: 11, key: true },
      { t: "相机识别", d: "Place the plant in focus；Identify / 360 identify 双模式", shot: 12 },
      { t: "结果 Triangle ficus", d: "识别结果无遮挡，结论「slightly unhealthy」直接可见", shot: 13, shot2: 14, show: 14 },
      { t: "Overview / Care 档案", d: "毒性（人/宠物）·分布地图·特征·养护难度与条件——信息给足喂养信任", shot: 15, shot2: 18 },
      { t: "How-tos / Explore", d: "浇水施肥修剪·常见问题·Name Story·分享卡片·「有没有用」投票", shot: 19, shot2: 24 },
      { t: "纠错弹窗", d: "「Did you get the right result? No/Yes」——识别后的即时确认", shot: 25 },
      { t: "诊断流程", d: "3 步拍摄教学→光照问卷→「Forming treatment plan 72%」", shot: 26, shot2: 28 },
      { t: "诊断结果（核心锁点）", d: "结论免费、病因 Causes 与建议 Insights 骨架占位锁 Premium（Try for Free）", shot: 29, key: true },
      { t: "补充问诊", d: "换角度拍患处 → 浇水频率 → 所在位置", shot: 30, shot2: 32 },
      { t: "My Garden / 识别记录", d: "收藏 + Add Reminder；「您的 1 次识别即将过期」条提示时效", shot: 33, shot2: 34 },
      { t: "Diagnose + Care Tools", d: "Auto Diagnose + 水量计算器/光照计/换盆检查/Plant Advisor", shot: 35, shot2: 36 },
      { t: "More：书籍 + 9 种 ID", d: "Books「0 books unlocked」（第三收费点）+ 杂草/过敏/毒性/树/年轮/鸟/虫 ID", shot: 37, shot2: 38 },
      { t: "FloraAI 客服", d: "「Hi, I am FloraAI, Ask me anything」——对话式答疑入口", shot: 39 },
      { t: "后置注册", d: "登录入口在设置页 Account，全程未强制——D6 实测推翻「首启注册墙」假设", shot: 41 },
      { t: "For You 内容流", d: "按城市的 Trending / 本地植物索引 / 话题标签——内容化回访", shot: 43, shot2: 45 },
      { t: "付费墙 ③ 定时复弹", d: "24 分钟后回来触发：PLUS $24.99/年（不含试用）vs PRO $39.99/年（分时定价）", shot: 46, shot2: 47, key: true }
    ]},
    "1353224144": { name: "Seek by iNaturalist", verdict: "零墙对照组：首屏即内容、结果全给、留存靠游戏化——用户体验的上限基准", steps: [
      { t: "启动页", d: "无协议门、无轮播，直接进入", shot: 1 },
      { t: "首屏即内容", d: "「附近的物种」定位广州：南美蟛蜞菊/报喜斑粉蝶/珠颈斑鸠", shot: 2, key: true },
      { t: "侧边菜单", d: "首页/成就/挑战/观察记录/iNaturalist/关于", shot: 3 },
      { t: "成就与徽章", d: "物种徽章 + 挑战徽章两套收集体系（留存主引擎）", shot: 4, shot2: 6 },
      { t: "我的观察记录", d: "三角榕等观察 + 按类群计数", shot: 7, shot2: 8 },
      { t: "iNaturalist 关系说明", d: "数据不出设备/社区鉴定/隐私三档说明——信任层", shot: 9, shot2: 13 },
      { t: "挑战列表", d: "进行中/未开始/已完成三态；月度挑战常设机制", shot: 15, shot2: 17 },
      { t: "挑战任务页", d: "冬至挑战：找到任意 10 个物种，进度 0%——任务化目标", shot: 18, shot2: 20 },
      { t: "实时识别（逐级锁定）", d: "镜头对准植物，标签从「属」逐步收敛到「种」（甜瓜?→木鳖属→三角榕）——认到哪级给哪级", shot: 26, shot2: 31, show: 29, key: true },
      { t: "结果 + 区域地图", d: "三角榕：确认时间/区域地图/分类树/季节性曲线/类似物种", shot: 21, shot2: 24 },
      { t: "注意事项弹窗", d: "「Seek 可能并非总是正确」+安全/隐私/儿童陪护提示", shot: 25 },
      { t: "观察完成 → 发布 iNat", d: "日期/地点/隐私选择/发布说明——接公民科学体系", shot: 35, shot2: 39 },
      { t: "鉴定纠错", d: "「这种物种的鉴定有错误？」红/绿双按钮——社区纠错入口", shot: 40 }
    ]},
    "773457673": { name: "Merlin Bird ID", verdict: "7 款中认不准出口最强：实时多候选 + 问答向导兜底；一切内容为公民科学服务", steps: [
      { t: "欢迎 / 邮箱", d: "邮箱可选输入", shot: 1 },
      { t: "位置为什么重要", d: "按位置缩小候选范围——识别质量的第 0 步", shot: 2 },
      { t: "首页信息流", d: "「Merlin 听到一只鸟！」+ 附近常见鸟推荐", shot: 4, shot2: 5 },
      { t: "5 问向导", d: "地点→日期→体型→羽色→行为，答完给候选", shot: 6, shot2: 10 },
      { t: "候选列表（排序即置信）", d: "俗名+学名并列、首位高亮——不给百分比，排序传递确定性", shot: 11, shot2: 13, key: true },
      { t: "物种卡：今日可见性", d: "「今天在广州市不大可能/可能看到」+ 12 月出现频率柱", shot: 14, shot2: 15 },
      { t: "物种页", d: "描述/鸣叫播放/范围地图/Macaulay 策展媒体", shot: 16, shot2: 17 },
      { t: "Sound ID 教学 ×3", d: "「通过声音识别鸟类很难」——先管理预期再教使用", shot: 19, shot2: 21 },
      { t: "录音识别", d: "声谱图实时流 + 候选随听更新；可保存识别片段、回放", shot: 22, shot2: 25, key: true },
      { t: "Photo ID", d: "拍照→放大裁剪→确认地点日期", shot: 26, shot2: 28 },
      { t: "诚实降级", d: "「Merlin doesn't have a suggestion」+ 换角度/换照片/忽略位置建议——绝不硬猜", shot: 29, key: true },
      { t: "探索与筛选", d: "246 种可出现鸟种，按地点/日期/可能性/科组合筛选", shot: 30, shot2: 31 },
      { t: "鸟种清单 Life List", d: "「开始记录您的鸟种清单」→ 保存进入 eBird 公民科学体系", shot: 18, show: 32 },
      { t: "设置（含赞助商页）", d: "离线鸟包/声音识别 v51 设置；施华洛世奇光学 Swarovski Optik 冠名支持", shot: 33, shot2: 36 },
      { t: "Photo ID 第二例", d: "书页照片先「无建议」→ 换角度重拍 → Long-tailed Tit（银喉长尾山雀）识别成功", shot: 37, shot2: 44, show: 44 }
    ]},
    "1297860122": { name: "Flora Incognita", verdict: "学术风：拍摄前引导降低拍废率 + 人工纠错入口 + 公民科学项目矩阵；完全免费", steps: [
      { t: "欢迎页", d: "多种花卉开场 + 「它是如何运作的」引导——学术项目的人格化表达", shot: 1 },
      { t: "拍摄教学 ×3", d: "尽可能近距离拍/避免硬阴影/请不要摘掉任何东西——把「认不准」预防在拍摄前", shot: 2, shot2: 4 },
      { t: "登录（可跳过）", d: "登录 / 创建个人简介 / 以访客身份登录 三选一", shot: 5 },
      { t: "主页", d: "识别植物（中）/ 所有种列表 / 我的观测 三入口", shot: 6 },
      { t: "主题内容流", d: "拍出完美照片的技巧/无法识别的四原因/命名故事文章——科普向内容运营", shot: 7, shot2: 10 },
      { t: "科研项目入口", d: "Alpine Hue Quest/PhänoNetz/GartenDiv/PollenNet/Scent Incognita 等 7 个公民科学项目可报名", shot: 11, shot2: 12, key: true },
      { t: "图鉴浏览", d: "按「在这个国家」+ 类群：真菌和地衣 2,879 / 仙人掌 480 / 藤本 433…", shot: 13, shot2: 16 },
      { t: "物种档案", d: "地图/概述/同物异名/属性/CITES 保护级别/IUCN 红色名录/季节观察柱——学术深度", shot: 17, shot2: 23, key: true },
      { t: "识别流程", d: "拍三角榕 → 95% 结果 → 「观察概述」可追加 1–5 张特征图 → 物种分类/同物异名", shot: 25, shot2: 30, show: 26, key: true },
      { t: "我的观测地图", d: "观察点落图 + 时间轴", shot: 32 },
      { t: "个人页", d: "观测/物种/徽章三计数 + 「为专家提供智能标签」", shot: 33 },
      { t: "徽章系统", d: "公民科学家 2026/连续 10 天/家庭事务/指示植物系列；首个徽章「第一朵花」", shot: 34, shot2: 37 }
    ]},
    "6744193660": { name: "Catchr: Fish Identifier", verdict: "低价周订阅冲量打法（8 档最低 $0.99）；onboarding 用问卷做千人千面 profile", steps: [
      { t: "Onboarding", d: "「150,000+ anglers worldwide」社区规模开场 + 2M 鱼获/50 国/4.7★", shot: 1 },
      { t: "痛点问卷", d: "「钓鱼最烦什么？」——「不知道什么在咬」高亮选项", shot: 2 },
      { t: "经验问卷", d: "Beginner/Intermediate/Expert 三档", shot: 3 },
      { t: "Profile 自动生成", d: "基于回答生成：目标鱼种 Northern Pike…目标成绩 20 lbs", shot: 4 },
      { t: "付费墙", d: "Unlock Catchr Pro：年 $29.99（SAVE 70%）/ 月 $9.99；4.7★ + 170K 用户徽章", shot: 5, key: true }
    ]},
    "477967747": { name: "Fishbrain", verdict: "垂钓超级 App：识别只是日志里的自动字段；精确钓点坐标是核心付费点", steps: [
      { t: "启动", d: "「18M+ 钓友信任」+ App Store「App of the Day」/Editors' Choice 徽章", shot: 1 },
      { t: "数据授权", d: "「分享你的数据来优化每一杆」——数据换个性化", shot: 2 },
      { t: "钓点选择", d: "全球地图选钓鱼区域", shot: 3 },
      { t: "位置推荐 + 付费卡", d: "「Find the best fishing spots in Mukilteo Bay」+ Yearly Pro $79.99（≈$6.67/mo，省 49%）+ 7 天试用", shot: 4, key: true },
      { t: "地图 Pro vs Basic", d: "精确坐标/解锁全部鱼获位置 = 订阅核心卖点；可先看基础地图", shot: 5, shot2: 7, key: true },
      { t: "社区 Feed", d: "关注渔友的鱼获动态（2lb 8oz 大口黑鲈）+ Log a catch", shot: 7 },
      { t: "BiteTime", d: "「今天什么时间最好钓」——选位置给咬钩时段建议", shot: 8 },
      { t: "「+」菜单", d: "Log catches / Add post / Fish ID——识别藏在日志流程里", shot: 9 }
    ]},
    "1546796934": { name: "Rock Identifier: Stone ID", verdict: "硬科学与水晶文化同页混排；收藏集卡闭环最强；估值/真假鉴别做成了付费点", steps: [
      { t: "品牌片", d: "「Rock Silent, yet witnessing all.」——情绪化开场", shot: 1 },
      { t: "拍石演示", d: "手机对准石头即识别", shot: 2 },
      { t: "社会证明", d: "172+ 国家/1930 万用户之选/90,000+ 五星", shot: 3 },
      { t: "个人地质导师", d: "识别信息含 Age/Rarity/Value/Real or Fake/Formation 气泡", shot: 4 },
      { t: "数字收藏", d: "「把我的石头变成数字收藏，方便追踪」", shot: 5 },
      { t: "发现世界", d: "最贵 $70,000/克拉/最轻可浮水/最老如地球般老/极稀有", shot: 6 },
      { t: "付费墙", d: "Design Your Trial：7 天免费 → $39.99/年（≈$3.33/mo）；另有 1 个月 $0.99 档", shot: 7, key: true },
      { t: "首页三工具", d: "Valuation（估价）/Identify/Detector（真假）+ Popular Gems + Books；顶部「7 天 Premium 未领取」提醒", shot: 8, key: true },
      { t: "Real vs Fake 栏目", d: "孔雀石/拉长石/珍珠真假对比 + 鉴定文章——鉴定内容化", shot: 9, shot2: 10 },
      { t: "Diamond 价格页", d: "1 克拉四档零售价：顶级 $12,200–22,000/ct … 一般 $1,000–5,100/ct——「值多少钱」直接给答案", shot: 11 },
      { t: "收藏系统", d: "Collection Board / Album 两种视图（7 款最完整集卡体系）", shot: 12, key: true },
      { t: "识别 + 纠错", d: "拍玛瑙→Agate 结果；「Got the wrong result? Correct the name」纠错入口", shot: 13, shot2: 14, key: true },
      { t: "物种页四 Tab", d: "Basic Info/Value/Care/Culture（星座石/生日石文化内容）+ Caution 安全提示", shot: 15, shot2: 17, key: true }
    ]}
  };

  /* ============ 公司与业务（8 款） ============ */
  var COMPANY = {
    "1252497129": {
      co: "Glority Global Group（杭州睿琪软件）", hq: "中国杭州 · 美国实体 + 东京办公室", nature: "独立商业公司 · bootstrapped 无 VC", size: "50–200 人（媒体口径）",
      biz: ["免费下载 + 订阅（全系无广告、无买断）：PictureThis 年 $39.99/$49.99、月 $7.99、周 $3.99，7 天试用",
        "「AI 应用工厂」：iOS 美区开发者页 6 款，识别类收入占比高；同底座复用（Plant Parent / PlantAI 同价目）",
        "B 端现金牛：官网主推 OCR/图像识别 API（发票/证件/车牌），客户覆盖医院、银行、政府机构"],
      heat: ["iOS 评分数 112 万（108 款第一）· 近期均分 3.26（口碑下滑中）",
        "公开数字：官方累计 1 亿+ 下载、~70 万/月（Appfigures）；营收 ~$900 万净收/月（Appfigures）"],
      feedback: ["品类最大差评主题是付费墙（601 条评论里 143 条 23.8% 排第一）",
        "2026 年近期 1★ 8 条；试用与「免费」理解分歧是高频抱怨（Play 评论 2025-05 案例）"],
      act: ["无官方线下活动；常设 Instagram 内容运营 @picturethisai",
        "有机名人曝光：Arianna Huffington「phone-free walk」使用帖 + Reddit r/gardening 自发推荐（非官方）"],
      partner: ["App Store / Google Play 双 Editor's Choice 徽章（在架）",
        "引导页引用密歇根州立大学 2024 评测（第三方研究背书，非机构合作）"],
      ref: ["启示（母公司档案 §8）：内容给足喂养信任、行动收费；「先给结果再展开资料」的层级 + 拍摄提示可抄；儿童端纠错不应要求输入正确名称"]
    },
    "1353224144": {
      co: "iNaturalist（501(c)(3) 非营利）", hq: "美国旧金山", nature: "非营利 · 2023 年独立", size: "10–50 人（报道口径 12 人团队）",
      biz: ["完全免费：Seek 与 iNaturalist 双端无内购无广告（xlsx-4 双端确认）",
        "资金 = 基金会资助 + 捐赠：Moore Foundation $1,000 万（2023 独立时）+ Google.org $150 万（2025 生成式 AI 项目）",
        "数据经 GBIF 开放供科研（4,000+ 篇论文引用），对机构免费"],
      heat: ["iOS 评分数 30,916 · Play 100 万+ 安装档",
        "公开口径（平台级，非单 App）：注册 500 万 / 月活 600 万（Wikipedia/CBS）"],
      feedback: ["Seek 无付费墙抱怨（免费）；头号差评是端侧模型代价：新机型相机失效（「every phone since 2021」）",
        "重复观察吸引力下降（App Store 用户 Ocean_eli 2025-06）——收集型留存的天然衰减"],
      act: ["City Nature Challenge 2026 官方记录 App（全球城市生物多样性速记，iNat × 加州科学院主办）",
        "应用内月度挑战（monthly challenge）常设机制"],
      partner: ["加州科学院 + 国家地理学会联合支持（hhmi/Tangled Bank 亦有署名）",
        "KID-SAFE 认证、无注册无数据收集——儿童安全是它的结构属性"],
      ref: ["启示：儿童场景不能比 Seek 更挡路（首屏即内容/结果全给）；「分类阶梯诚实降级」（认到哪级给哪级）是最值得抄的儿童端设计"]
    },
    "773457673": {
      co: "Cornell Lab of Ornithology（康奈尔大学）", hq: "美国纽约州 Ithaca", nature: "学术项目 · 大学下属非营利研究单元", size: "Lab 约 250 人；Merlin 单产品 10–50",
      biz: ["Merlin/eBird 完全免费（双端确认无内购）",
        "Lab 层面有付费产品但不在 App：Birds of the World 订阅（~$49/年）、Bird Academy 课程（$29–199）、716 页教材",
        "企业赞助：Pennington 鸟食、SWAROVSKI OPTIK 长期冠名支持 Merlin"],
      heat: ["iOS 评分数 113,931 · Play 1,000 万+ 安装档",
        "公开数字：官方累计 4,200 万下载（BBC）/活跃 1,000 万；无营收（公益）"],
      feedback: ["免费无付费墙抱怨；GBBC 2026 官方总结：Merlin 使用量同比接近 +100%",
        "近期均分 3.54（2026 样本）；识别不准时三重出口（实时候选/照片候选/问答向导）"],
      act: ["Great Backyard Bird Count 2026（与 National Audubon、Birds Canada 联合主办）：全球记录 8,257 物种",
        "Merlin 3.9「Observation Deck」内容流（2026-05）把活动参与日常化"],
      partner: ["Cornell Lab / National Audubon 机构关系（GBIF 鸟类数据源）",
        "Macaulay Library 专家策展内容；Swarovski Optik 赞助（设置页可见）"],
      ref: ["启示：声纹识别是被低估的第二管线（对 4–11 岁孩子「听到→知道」比拍照更本能）；「识别之后沉淀进公民科学」是最强的长期留存叙事"]
    },
    "1297860122": {
      co: "TU Ilmenau + MPI-BGC（学术项目）", hq: "德国 Ilmenau / Jena", nature: "学术项目 · 无商业主体（教授个人账号上架）", size: "10–50 人（研究组规模）",
      biz: ["完全免费、无广告、无内购（iOS 单端确认）；明确定位 non-commercial",
        "资金 = 公共科研资助：德国联邦教育与研究部 BMBF/FONA（2014–2020 立项期）+ 大学经费",
        "「收入」与市场行为完全脱钩——它证明免费可行，但归因要说准：靠科研经费"],
      heat: ["iOS 评分数 599（低于矩阵门槛，特定款单列）· 评分 4.79",
        "官方宣称 98.8% 准确率（2024，厂商自报非独立复核）；31 MB 体积（端侧 + 地域限定换来）",
        "⚠ 旧口径「近期 4.52」无法复核，汇报勿引用"],
      feedback: ["唯一公开邀请用户改结果的款（学名旁编辑铅笔）——学术纠错传统",
        "拍摄前引导（类群 Tab + 「Flower top?」提示）把「认不准」预防在拍摄前"],
      act: ["Flora Incognita++ 公民科学扩展项目（常态科研，TU Ilmenau / MPI）",
        "被德国国家生物多样性监测中心收录为官方监测方法（方法论级背书）"],
      partner: ["TU Ilmenau / MPI-BGC；德国联邦机构（监测中心）",
        "应用内 7 个公民科学项目入口（含 Pl@ntNet 联合体系）"],
      ref: ["启示：限定范围越窄准确率越高（只做欧洲植物 98.8%）——「不该承诺什么都能认」的技术理由；图鉴/徽章/观察地图全套游戏化也能建立在免费之上"]
    },
    "6744193660": {
      co: "Smolworks Inc（App 工作室 / holding company）", hq: "美国纽约都会区（推断）", nature: "独立商业公司 · 创始人自称 bootstrapped", size: "<10 人（工作室模式）",
      biz: ["免费下载 + 订阅：年 $12.99/$19.99/$29.99、月 $0.99/$2.99/$9.99、周 $0.99/$4.99（8 档，无试用）",
        "低价周订阅冲量打法——与 Glority/Next Vision 的 $3.99 周档不同，下探到 $0.99",
        "出身：Georgia Tech 2025 届毕业生 Matthew Steele 的 CREATE-X 创业项目，走红后被 Smolworks 收纳"],
      heat: ["iOS 评分数 5,024",
        "创始人自述：做到 $500K ARR、6.5 万下载、3,500 万社媒曝光（LinkedIn 口径）",
        "母平台报道：约 3.5 万月安装（Georgia Tech 新闻转引）"],
      feedback: ["近期均分无 2026 样本（n=2）；关键流程问题：识别卡住时连保存渔获也受影响（交互分析 ⑦）",
        "结果页给稀有度标签（Common）而非置信度——不给百分比是品类共识"],
      act: ["无官方营销活动；被动媒体报道：Georgia Tech 新闻《学生钓鱼 App 走红全球并被收购》（2026-01-05）"],
      partner: ["无机构合作记录；Play 订阅名 Fishdexx Plus 与包名 com.steelecodes.fishdexx 并存——更名/收购过渡痕迹"],
      ref: ["启示：学生创业项目×游戏化收藏（个人最佳/排行榜）能快速起量；但「识别卡住→连保存都受阻」的流程问题值得引以为戒"]
    },
    "477967747": {
      co: "FishBrain AB", hq: "瑞典斯德哥尔摩", nature: "独立商业公司 · VC 支持最重的样本", size: "50–200 人（60+ 员工/约 71 人口径）",
      biz: ["freemium 订阅 + 广告位 + 交易佣金：Yearly Pro $79.99（促销 $8.67/mo 口径）",
        "累计融资 ~$6,580 万 / 8 轮（Northzone、B Capital、SoftBank；Republic 众筹 $20M SPP）",
        "Meet Fishbrain 广告平台：把 2,000 万钓鱼人社群流量卖给品牌；Aspira 钓鱼证独家合作（北美佣金）"],
      heat: ["iOS 评分数 76,568（B 层相邻样本）",
        "公开数字：用户 2,000 万+（官方）/付费 20 万+（2021）；2021 年 $1,000 万+ 营收、近期估 $100–1000 万/月"],
      feedback: ["垂钓社区自营电商跑不通的教训：2023-09 解散直营 Marketplace，转「广告位+联盟」",
        "识别在其叙事里是隐形基础设施——商店 6 张截图无一展示识别结果页"],
      act: ["科研合作（CEFAS / Ball State / 丹麦技术大学：可持续渔业研究，近 12 个月在续）",
        "ICAST / American Sportfishing Association 新品投票（年度渔具展周期）",
        "Connecticut DEEP 州钓鱼法规内置（2025-12 生效新规免费开放）"],
      partner: ["CEFAS / Ball State University / 丹麦技术大学（科研）· Aspira（独家）· 康涅狄格州 DEEP（政府）",
        "多家渔具品牌合作（IGFA / Rapala / Guy Harvey 提及）+ Keep America Fishing"],
      ref: ["启示：识别作为大场景入口功能（钓点+社区+决策）而非独立产品——YONDOO 最应研究的形态；垂类社区变现 = 广告位+联盟，别自营电商"]
    },
    "1546796934": {
      co: "Next Vision Limited（识别 App 工厂）", hq: "中国香港九龙湾", nature: "独立商业公司 · 公司层信息最不透明", size: "推断 10–50 人（模板化工厂团队）",
      biz: ["全系免费下载 + 订阅（周/月/年三档订阅墙同模板复用）；PictureThis 的 $39.99/年模板与 Picture 鸟/虫/菇共用",
        "2025 年一年上架 11 款的速度——「同底座 × 单类目品牌」工厂模式",
        "本款 Rock Identifier: Stone ID 出品方登记为 Phuong Bui（个人），但品类调研归入 Next Vision 系打法"],
      heat: ["iOS 评分数 82,324（岩石类第一）",
        "公开数字（FluxBuilder 估算）：~80 万下载/月、~$100 万营收/月"],
      feedback: ["近期均分 3.47（样本内偏低）；硬度/化学式硬科学与星座石「水晶能量」软文化同页混排",
        "「值多少钱」做成核心卖点：Valuation 工具 + Diamond 四档价 + Real vs Fake 鉴定栏目"],
      act: ["未发现任何官方活动（四条检索路径均为空）——纯买量 + ASO 打法"],
      partner: ["无机构合作；教育期刊引用与地质学家协会评测为被动背书"],
      ref: ["启示：单类目 × 模板化底座可快速复制（Rock Identifier 月收 ~$100 万估）；「识别结果 → 估价 → 真假鉴定」把内容做成付费闭环"]
    },
    "1527399597": {
      co: "Vortemol Limited", hq: "英国（官方支持页）", nature: "独立商业公司", size: "未披露",
      biz: ["订阅制：年 $29.99、月 $6.99–8.99、周 $19.99/$49.99 未标注周期档；3 天试用",
        "PlantIn 是「后起冲刺」样本：2020 上架，5 年做到 iOS 23 万评分数",
        "广告：Play 侧有广告标记"],
      heat: ["iOS 评分数 230,439（植物第二）· Play 1,000 万+ 安装档",
        "公开数字：官方累计 3,500 万下载（2025-05）；$50–100 万/月 App Store（SensorTower）"],
      feedback: ["付费墙抱怨条数 10/13（占比 77%，样本内最高）——低价周档的代价",
        "混合/表述矛盾的端云口径；识别不准投诉集中于多肉与病害"],
      act: ["无公开活动记录；增长靠买量 + ASO"],
      partner: ["无可查背书（xlsx-9「空档与可争取」：体量已够格申请商店编辑推荐）"],
      ref: ["启示：3 天短试用 + 高抱怨占比——转化激进与口碑维护的平衡是它没解好的题"]
    },
    "1476047194": {
      co: "AIBY Incorporated", hq: "香港（aiby.mobi）", nature: "独立商业公司（App 工厂）", size: "未披露",
      biz: ["订阅制：年 $19.99/$29.99/$34.99/$39.99/$59.99 五档年付 + 月 $1.99/$6.99 + 周 $6.99/$7.99",
        "AIBY 是 Coin ID（钱币识别）等跨品类 App 工厂；Plantum 为植物线主力",
        "广告：有"],
      heat: ["iOS 评分数 119,559 · Play 500 万+ 安装档",
        "公开数字：官方累计 2,000 万下载；$10–50 万/月（SensorTower）"],
      feedback: ["Botsi 2024-12 记录：注册→介绍→订阅选择→才进主列表——先建立转化再给体验",
        "历史首次使用路径前置注册与付费选择，对「马上想知道眼前是什么」的用户增加前置操作"],
      act: ["无公开活动记录；官方使用指南博客做内容 SEO"],
      partner: ["无可查背书"],
      ref: ["启示：五档年付定价带是「价格锚点」打法的样本；内容博客 + SEO 是低成本的常设获客"]
    }
  };

  /* ============ 品类总结（板块五） ============ */
  var SUMMARY = {
    // 实拍截图确认的付费锁点（描述层没写，App 里真实存在的墙）
    locks: [
      { app: "1252497129", name: "PictureThis", locks: ["诊断病因 / 治疗建议（骨架占位）", "Books 书籍（0 unlocked）", "PLUS/PRO 功能表：杂草/毒性/树/鸟/虫 ID、个性化建议、无限诊断"], shot: 29 },
      { app: "1546796934", name: "Rock Identifier", locks: ["估价 Valuation / 真假鉴定 Detector", "Collection 收藏系统（Subscribe Now）", "Gem Guide 等书籍"], shot: 12 },
      { app: "477967747", name: "Fishbrain", locks: ["精确钓点坐标（Unlock all catch locations）", "Pro 地图图层"], shot: 7 },
      { app: "6744193660", name: "Catchr", locks: ["扫描识别、鱼获日志、排行榜、追踪 —— 全部要订阅才能用"], shot: 5 },
      { app: "1353224144", name: "Seek / Merlin / Flora", locks: ["无任何付费墙（机构/学术项目，完全免费）"], shot: 2 }
    ],
    resultAspects: [
      { t: "置信度：没人给百分比", tag: "品类共识", items: [
        "Merlin：用候选列表的排序表达把握，不给数字",
        "Seek：认到哪一级给哪一级，从「属」逐级收敛到「种」",
        "Catchr：给稀有度标签（Common），不给置信度",
        "PictureThis：「98% accuracy」只写在商店描述里，结果页不显示",
        "Flora Incognita：结果页出现过 95%，是唯一接近量化的一款"] },
      { t: "结果页给什么", tag: "信息架构", items: [
        "植物类最厚：名称 + 学名 + 毒性 + 分布地图 + 养护参数 + 病害诊断（PictureThis 四层内容）",
        "鱼类：稀有度 + 尺寸区间",
        "岩石：硬度 / 化学式 + 星座石文化内容",
        "Fishbrain 最浅：识别结果页连展示位都没有"] },
      { t: "识别之后的下一步", tag: "留存闭环", items: [
        "强闭环：PictureThis 养护提醒、Merlin 记入 eBird、Rock Identifier 收藏集卡",
        "中衔接：Catchr 排行榜、Flora 观察地图、Seek 徽章挑战",
        "空白：语音 / 朗读 7 款深度样本全部没有"] }
    ],
    // 识别跑在哪（iNat / Pl@ntNet / BirdNET 等模型与数据已并入下方「给我们的启示 · 素材库与合作方向」）
    models: [
      { t: "端侧 vs 云", d: "云 €0.003–0.005/次、永远最新；端侧 0 边际成本、照片不出设备（儿童隐私一句话讲完），代价 +150–230MB 体积 + 机型适配（Seek 新机型相机失效差评）。", tag: "架构取舍" }
    ],
    types: [
      { t: "植物 43 款（40%）一家独大", d: "红海：39 款收费、年付起步中位 $29.99、付费墙抱怨最密集；也是收入天花板——最近 4 年收入植物一类约占 87%，$1 亿+ 的 2 款（PictureThis、PlantIn）都在植物。" },
      { t: "鸟类 20 款 = 机构主场", d: "Cornell / Audubon 等学术 NGO 占据头部；声音识别 14 款全部在鸟类——听声辨鸟是鸟类板块的准入门槛。" },
      { t: "鱼类 13 款 = 社区玩法", d: "13 款都是钓鱼日志类（B 层）：识别只是入口，排行榜 / 渔获日志 / 钓点地图才是留存；Fishbrain 证明「识别作为超级 App 的一个字段」的形态。" },
      { t: "岩矿 / 昆虫 / 真菌 = 小而美", d: "岩矿 11 款（估价 + 真假鉴定玩法）、昆虫 7、真菌 7；明示儿童可用全库仅 1 款——这几个板块都是低竞争空位。" },
      { t: "综合 7 款 = 全类群赌场", d: "Seek / iNaturalist 等全类群产品靠大模型 + 公民科学体系撑起来；Seek 端侧模型 228MB，体积与机型适配是代价。" }
    ]
  };

  /* ============ 深度样本 6 款（Sara 定的顺序与副标题；Catchr 移出，仍可从积木塔点进看链路） ============ */
  var DEEP = [
    { id: "1252497129", name: "PictureThis", sub: "类目TOP1" },
    { id: "1353224144", name: "Seek", sub: "多品类儿童向｜公益" },
    { id: "773457673", name: "Merlin Bird ID", sub: "鸟类口碑标杆" },
    { id: "1297860122", name: "Flora Incognita", sub: "免费植物识别" },
    { id: "1546796934", name: "Rock Identifier", sub: "矿物识别TOP1" },
    { id: "477967747", name: "Fishbrain", sub: "鱼类+社区玩法" }
  ];

  /* ============ 给我们的启示（总结第三段；收费项的款数由 data.js 实时统计） ============ */
  var INSIGHT = {
    pay: {
      lead: "识别本身大多能免费试，真正收钱的是识别之后的「服务」——每个品类卖的东西不一样",
      cats: [
        { cat: "plant", head: "植物：收「看病 + 养护」", items: [
          "病害诊断 / 治疗方案是写得最多的付费权益之一：PictureThis 诊断结论免费，病因和治疗建议锁在 Premium（实拍确认）",
          "其次是不限次识别、真人植物专家答疑、养护计划与提醒"],
          fix: "比「养护」更准确的说法是「看病 + 养护」：病害诊断比养护提醒更常被写进付费权益" },
        { cat: "fish", head: "鱼类：收「去哪钓、什么时候钓」", items: [
          "钓点地图 / 精确坐标：Fishbrain 的精确钓点锁在 Pro（实拍确认）",
          "咬钩时间 / 天气潮汐预测：描述里写明的款数比钓点还多"],
          fix: "除了定位，「咬钩时间预测」同样是核心付费点" },
        { cat: "rock", head: "矿石：收「值多少钱、是不是真的」", items: [
          "估价、真假鉴定、收藏图鉴：Rock Identifier 三项都在付费墙后（实拍确认）",
          "商店描述层面多只写「不限次识别」"],
          fix: "收藏之外，估价和真假鉴定才是矿石类最独特的付费点" },
        { cat: "insect", head: "昆虫：付费点最薄——「去广告 + 不限次」", items: [
          "描述里写明的主要是去广告、不限次识别",
          "少数加真人专家答疑和图鉴内容（叮咬防护、害虫防治）"] },
        { cat: "bird", head: "鸟类：头部免费，收费款卖「图鉴内容 + 听声识鸟」", items: [
          "口碑头部是机构免费款：Merlin、eBird、Audubon",
          "收费款卖鸟类图鉴 / 鸣声库、声音识别、离线包；另有 3 款是一次买断的鸟类图鉴 / 鸣声 App",
          "还有一条路是硬件：Birdbuddy、Birdfy 的 App 跟着智能喂鸟器卖"] }
      ]
    },
    datasets: {
      lead: "先用能商用的开放数据起步；鸟类照片、矿石、国内图库基本只能走合作",
      groups: [
        { g: "全类群", rows: [
          { n: "iNaturalist 开放数据", who: "iNaturalist（美）· AWS 开放数据", size: "4 亿+ 张照片；Seek 同源模型覆盖 12.5 万类群", lic: "逐张混合 CC0 / CC BY / CC BY-NC，筛掉 NC 后可商用", ok: "mix", get: "AWS 免费下载" },
          { n: "GBIF", who: "全球生物多样性信息机构（丹麦）", size: "35 亿+ 条物种分布记录", lic: "按数据集授权，可按 license 过滤", ok: "mix", get: "网站 / API 批量下载" }
        ]},
        { g: "植物", rows: [
          { n: "Pl@ntNet API", who: "法国 Pl@ntNet 联盟（INRAE 等）", size: "全球植物识别服务", lic: "每天 500 次内免费可商用，超量付费（约 €1,000/年）", ok: "yes", get: "注册 API" },
          { n: "PlantNet-300K", who: "Pl@ntNet（Zenodo）", size: "30.6 万张图 / 1,081 种", lic: "只有 CC BY-SA 子集可商用", ok: "mix", get: "免费下载" },
          { n: "Plant.id", who: "Kindwise（捷克）", size: "3.5 万+ 类群 + 548 种植物健康状态", lic: "商用付费 API（€0.05/次）", ok: "paid", get: "付费 API" }
        ]},
        { g: "鸟类", rows: [
          { n: "eBird + Macaulay Library", who: "康奈尔鸟类学实验室", size: "数千万级照片 + 音频（Merlin 训练源）", lic: "仅限非商业；商用须签许可协议", ok: "deal", get: "申请 / 签约" },
          { n: "xeno-canto", who: "荷兰基金会", size: "100 万+ 条鸟鸣录音", lic: "多为 CC BY-NC-SA，只有非 NC 条目可商用", ok: "mix", get: "网站 / API" },
          { n: "BirdNET", who: "康奈尔鸟类学实验室", size: "3,000+ 鸟种声音模型", lic: "代码可商用，模型权重不可商用", ok: "no", get: "GitHub" }
        ]},
        { g: "鱼类", rows: [
          { n: "OzFish", who: "澳大利亚海洋科学研究所 AIMS", size: "约 8 万张标注图 / 500+ 种", lic: "CC BY 4.0，可商用（署名）", ok: "yes", get: "GitHub" },
          { n: "FishBase", who: "FishBase 联盟", size: "约 3.5 万种鱼类权威库", lic: "CC BY-NC，商用需单独许可", ok: "deal", get: "网站 / API" }
        ]},
        { g: "矿石", rows: [
          { n: "Mindat.org", who: "Hudson 矿物学研究所（美）", size: "全球最大矿物库（全部矿物种 + 标本照片）", lic: "免费 API 仅非商业；另有商业授权可谈", ok: "deal", get: "商业授权" },
          { n: "RRUFF", who: "亚利桑那大学", size: "矿物光谱 + 标本照片全库", lic: "免费下载、需引用；明确授权未核实", ok: "mix", get: "官网下载" }
        ]},
        { g: "昆虫", rows: [
          { n: "iNat 昆虫子集", who: "iNaturalist", size: "从开放数据按「昆虫纲」过滤", lic: "同 iNat：筛掉 NC 后可商用", ok: "mix", get: "AWS 下载" },
          { n: "BugGuide", who: "爱荷华州立大学托管", size: "北美昆虫照片社区库", lic: "多带 NC，需逐图确认或联系摄影师", ok: "deal", get: "网站浏览" }
        ]},
        { g: "国内机构", rows: [
          { n: "中国植物图像库 PPBC / 植物智", who: "中科院植物所", size: "约 2,900 万幅图 / 10.3 万种", lic: "非教学用途需书面授权", ok: "deal", get: "版权页联系" },
          { n: "中国观鸟记录中心", who: "民间平台（中国版 eBird）", size: "1,400+ 鸟种记录", lic: "批量数据需联系授权", ok: "deal", get: "邮件联系" },
          { n: "国家标本资源共享平台 NSII", who: "国家科技基础条件平台", size: "动物标本约 2,400 万号", lic: "批量下载需申请、馆长审批", ok: "deal", get: "申请表" },
          { n: "物种 2000 中国节点", who: "中科院", size: "16.3 万个物种及种下单元（2025）", lic: "名录可下载；商用条款未核实", ok: "mix", get: "注册下载" }
        ]}
      ],
      foot: "授权以官方页面为准（多为 2026-11-07 查证）。「筛选后可商用」= 逐条记录的授权混合、需逐条筛；物种 2000 中国节点等条目的商用条款尚待核实，使用前请以官方页面为准。"
    },
    product: [
      { t: "分类按海外习惯：植物、鸟类、鱼类、矿石、昆虫", items: [
        "108 款里 101 款只做一个类群（植物 43、鸟 20、鱼 13、矿石 11、昆虫 7、真菌 7），综合多类群只有 7 款",
        "海外用户和商店都按类群称呼（plant identifier、bird ID、rock identifier），我们也直接用这五类，不用「动植物」这类泛称",
        "真菌（蘑菇）涉及「能不能吃」，安全风险最高，可以先不放进首批"] },
      { t: "识别结果要带准确度判断，低了就引导「再拍一张」", items: [
        "专业 App 也要求多角度、多张：PictureThis 有拍摄教学 + 360° 多角度识别；Flora Incognita 拍摄前 3 屏教学，结果后还能追加 1–5 张特征图；Merlin 认不出时提示换角度、换照片；Pl@ntNet 直说「给的信息越多越准」",
        "识别本身有天花板：种级正确率约 58%（属级约 76%）；11 种有毒植物里 5 种被至少一款 App 判成「可食用」",
        "我们的做法：内部设置信度门槛，对孩子不报百分比，只说「再拍一张叶子 / 花」",
        "拍到有毒或疑似有毒的植物时，不论置信度高低，都先提示「别摸、别吃、问大人」——作为安全托底"] },
      { t: "社区地图：把「稀有发现」变成探索任务", items: [
        "参考钓鱼 App：Fishbrain 的钓点地图是订阅核心（精确坐标锁在 Pro）；Merlin 有「今天在这里可能看到」，Seek 首屏就是「附近的物种」",
        "做法：孩子发现稀有动植物 → 标记地点 → 进入我们自己的统一物种数据库 → 附近的孩子收到「这里有稀有发现」提醒，引导他们出门探索",
        "孩子的位置要做模糊化（只到街区级），并默认家长可见——这是合规前提"] }
    ],
    biz: [
      { t: "按年收费，价格参考成人 App", items: [
        "成人识别 App 的年付起步价中位数是 $29.99（65 款列了年付价），108 款里 96 款收费——订阅是行业默认",
        "我们按年订阅、价位参照成人档；付费墙是全品类第一差评（601 条评论里占 23.8%），价格要一次说清",
        "宣传上拿成人 App 做对照，讲清差异：「孩子也能用」+「一个 App 认多个品类」——108 款里明示儿童可用的只有 Seek 1 款，综合多类群只有 7 款"] }
    ],
    hardware: {
      t: "后期：成人版硬件有更大的商业空间",
      lead: "成人市场已经证明「识别 + 硬件」能卖：便宜的走量，贵的靠订阅赚后端",
      groups: [
        { g: "植物养护", note: "亚马逊上已有大量硬件，两极分化：便宜传感器靠走量，高端种植机靠 AI 会员订阅", rows: [
          { n: "XLUX 土壤湿度计", p: "$12–19", d: "无源湿度计；土壤仪表类亚马逊销量第 1，6.7 万条评分" },
          { n: "AeroGarden Harvest", p: "$60–115", d: "智能水培种植机，配 App；水培类销量第 4，2 万条评分" },
          { n: "Gardyn Home 4.0", p: "$695–849", d: "双摄像头 AI 养护助手，必须开会员 $22–39/月" }
        ]},
        { g: "观鸟", note: "Kickstarter 上很火的就是 Bird Buddy 系列：AI 识鸟 + 喂鸟器摄像头已被验证", rows: [
          { n: "Bird Buddy · Petal & Wonder Blocks", p: "众筹 $129–149", d: "Kickstarter 2025-04，筹到 $249 万、8,293 人支持；把喂鸟器扩展成「庭院自然观测台」" },
          { n: "Bird Buddy 智能喂鸟器", p: "$219–349", d: "AI 识别 1,000+ 鸟种；基础识别免费，Premium $70–99/年" },
          { n: "Swarovski Optik AX Visio", p: "约 $4,799", d: "AI 望远镜，镜内识别约 9,000 种鸟（基于 Merlin）" }
        ]},
        { g: "钓鱼定位", note: "「精准定位」= GPS + 自建等深线图 + 声呐，$160 到 $2,200 都有人买——我们可以考虑在钓鱼方向做更精准的定位", rows: [
          { n: "Deeper PRO+ 2", p: "$160–290", d: "可抛投声呐 + GPS，岸边就能自建等深线图；地图会员 $39.99/年" },
          { n: "Garmin STRIKER Cast GPS", p: "$180–200", d: "GPS + 自建 1 英尺等深线，App 免费" },
          { n: "Garmin LiveScope Plus", p: "$1,499–2,199", d: "船装实时扫描声呐，旗舰级定位" }
        ]}
      ],
      foot: "价格与体量均为 2026-11-07 联网查询（来源见 docs/启示_成人版硬件参考核查_20261107.md）；亚马逊价格会波动，只看价位带。"
    }
  };

  window.PANO_RESEARCH = { chains: CHAINS, company: COMPANY, summary: SUMMARY, deep: DEEP, insight: INSIGHT };
})();
