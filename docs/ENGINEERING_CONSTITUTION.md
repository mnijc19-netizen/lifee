# Lifee Permanent Engineering Constitution (单一事实源工程宪法)

**MANDATORY FOR ALL CODING AGENTS, ALL SESSIONS, AND ALL BATCHES**

本文件为 Lifee 项目的**永久单一事实源工程宪法**。所有 Coding Agent 在执行任何开发任务前必须先读取本文件。规则编号具有永久不可变性，严禁削弱已设立的规则。

---

## 一、核心原则与真实性铁律 (RULE-01 ~ RULE-24)

### RULE-01 严禁语义偷换 (No Semantic Substitution)
* 需求必须按照产品实际含义实现，严禁选择技术上最容易满足字面描述的伪实现。
* "实时数据接入 (Live Data)" 必须实际获取、解析并持久化目标业务数据，绝不等于 "URL HTTP 200"、"HEAD 成功" 或 "官网可打开"。
* "监控政策变化" 必须比较两次采集的实际业务字段并产生结构化变更事件，绝不等于每天 ping 官网。

### RULE-02 真实状态字典 (Strict Status Vocabulary)
所有数据源、页面及条目状态必须严格使用以下法定字典，严禁模糊表述：
* `LIVE_DATA`: 真实获取、解析并保存业务数据。
* `REACHABLE`: 仅确认端点网络可达 (HTTP 200/300)，无字段级动态解析器。
* `CACHED`: 历史获取并经过核验的基准快照。
* `STATIC`: 代码内置标准分类字典。
* `MANUAL`: 人工核验导入信标。
* `BLOCKED`: 外部拦截 (如 Cloudflare 403 / 反爬验证)。
* `FAILED`: 网络超时、5xx 或 DNS 失败。
* `FAILED_PARSER`: 端点连通但结构化解析器失败，**严禁冒充 LIVE_DATA**。
* `STALE`: 超过有效期 SLA。
* `UNKNOWN`: 无法确认。

### RULE-03 密钥存储透明性 (Transparent BYOK API Key Storage)
* 本地 LocalStorage 存储的 API Key 必须如实标注为 "本地明文持久化存储"，严禁虚构 "已加密存储" 或假想加密能力。

### RULE-04 严禁虚构链接与凭证 (Zero Fabricated Links & Citations)
* 所有外链必须为官方真实存在之页面，严禁捏造虚假 URL。

---

## 二、解析器与数据管线规则 (RULE-25 ~ RULE-44)

### RULE-25 Parser 输出不得来自预写业务常量
* 任何声明为 Parser / Extractor / Live Data Adapter 的模块，输出的最终事实必须来自本次抓取得到的实际 source payload。
* 严禁在代码中写 `if (html.includes("AEWV")) return { wage: 31.61 }` 等硬编码映射。

### RULE-26 事实提取必须存在真实源码抽取逻辑
* 必须使用正则、DOM 或流式解析从实际文本中抽取字段，严禁静态常数字典回退。

### RULE-27 突变敏感性验证 (Mutation Sensitivity)
* 测试中修改 HTML 输入数值，Parser 输出必须相应改变。若输入变化而输出不变，证明存在硬编码常数，测试立即判定失败。

### RULE-28 解析器五类固定测试用例
每个 Parser 必须具备以下 5 类测试：
1. 正向用例 (Positive / Captured Official)
2. 突变用例 (Synthetic Mutation)
3. 缺失字段用例 (Missing-field)
4. 畸形/网关错误用例 (Malformed / 502 Bad Gateway)
5. 矛盾/非法格式用例 (Contradictory / Invalid Format)

### RULE-29 快照与差异对比引擎 (Snapshot & Semantic Diff Engine)
* 数据入库必须保存版本化快照 (`v1`, `v2`, ...)。
* 两次快照对比若数值发生实质变动，必须标记为 `POLICY_CHANGE`；若无变动必须标记为 `NO_MEANINGFUL_CHANGE`；无基准时标记为 `UNKNOWN`。

### RULE-30 完整出处追踪 (Full Provenance Tracking)
* 所有提取事实必须附带 Provenance 元数据：`sourceUrl`, `sourceTitle`, `fetchedAt`, `sourcePublishedAt`, `effectiveAt`, `evidenceExcerpt`。

### RULE-31 结构化规范事实模型 (Normalized Facts Model)
* 提取数据必须进入统一 schema，保留数值、单位、生效日期及出处引用。

### RULE-32 发布日期严禁脑补 (No Date Hallucination)
* 官方来源未标明发布日期的，`sourcePublishedAt` 必须返回 `null`，严禁伪造当天时间。

### RULE-39 新西兰 AEWV 政策概念隔离
* 法定最低时薪、市场公允薪资 (Market Rate)、技术移民专用中位数时薪必须严格隔离。中位数时薪仅用于 SMC 打分与绿名单，非一般 AEWV 工签门槛。

### RULE-40 劳动力紧缺不等于工签资格 (Shortage != Visa Eligibility)
* JSA 紧缺职业数据必须四分类拆解：
  1. `labour_market_status` (本土劳动力紧缺现状)
  2. `visa_relevance` (签证关联性，明确非自动获签)
  3. `qualification_requirements` (技能评估门槛)
  4. `migration_pathway_status` (移民通道现状)

### RULE-41 职业分类标准版本锁定
* 职业代码必须标明版本（如 ANZSCO Version 1.3 / 2022-2023）。新西兰叉车工官方代码为 `721311`，严禁使用过时废弃代码 `721211`。

---

## 三、个人决策情报与新鲜度引擎 (RULE-45 ~ RULE-72)

### RULE-45 Freshness 是事实的一部分
* 任何时效性事实必须具备 Freshness 状态：`FRESH`、`AGING`、`STALE`、`EXPIRED`、`UNKNOWN`。

### RULE-46 分类新鲜度 SLA (Fact-Specific Freshness SLAs)
* 核心移民门槛 (CRITICAL_IMMIGRATION): 72h aging / 168h stale
* 宏观劳动力统计 (MACRO_STATS): 168h aging / 720h stale
* 职业紧缺清单 (OCCUPATION_SHORTAGE_LIST): 168h aging / 720h stale
* 行业与社区信号 (INDUSTRY_SIGNAL): 720h aging / 2160h stale

### RULE-47 分级采集调度 (Tiered Scheduling)
* Tier 1 (24h/高频): 汇率实盘、核心移民门槛。
* Tier 2 (72h/中频): 职业紧缺清单、就业银行。
* Tier 3 (168h/低频): 行业白皮书、宏观统计。

### RULE-50 对用户行动的影响转换 ("What this changes for me")
* 任何情报事件必须计算对用户个人的实际影响（如自保金折合人民币增加多少、每月收支差额变动等）。

### RULE-56 动态生存跑道计算 (Dynamic Runway Recalculation)
* 基于用户储蓄、目标国生活成本与实时汇率，动态重新计算生存现金流周数/月数。

### RULE-57 每日行动引擎 (Action Engine: Top 3 Actions)
* 首页必须聚焦展示当前对用户个人最重要的 3 项具体行动。

### RULE-58 止损条件明确化 (Explicit Kill Criteria)
* 路线卡片必须提供清晰的止损或放弃触发条件。

### RULE-60 双模式分离 (Explore Mode vs Execute Mode)
* 探索模式用于全景筛选；执行模式用于聚焦单一路线的每日推进与清单打卡。

### RULE-62 移动端基准适配 (Mobile-First Viewport Benchmark)
* 必须在 iPhone 16 Pro (390x844) 视口下完整渲染，零布局断裂，零控制台报错。

### RULE-63 过期关键事实不得驱动首选推荐
* 包含 `STALE` 事实的路线必须降级为 `PROVISIONAL` 并在排名中被拥有 `FRESH` 事实的路线超越；包含 `EXPIRED` 事实的路线得分封顶 30 分。

### RULE-64 独立评审准入门槛 (Independent Review Gate)
* 任何 Batch 完成后，Builder 只能标注 `Awaiting independent review`。只有获得独立 Reviewer 的 `APPROVED` 结论后，方可进入下一 Batch。

### RULE-65 测试必须执行生产代码 (Tests Must Execute Production Code)
* 测试套件必须直接引用 `src/` 中的生产逻辑，严禁在测试文件中复制重写一套平行算法。

---

## 四、真实性收口与自治防御规则 (RULE-73 ~ RULE-85)

### RULE-73 长工程指令完整性门禁 (Prompt Completeness Gate)
* 长工程指令必须同时包含 `PROMPT_ID`、`VERSION`、`START` 与 `END` 标记。缺少任一项立即中止并返回 `INCOMPLETE_PROMPT`。

### RULE-74 历史纠偏事实必须回归锁定 (Previously Corrected Facts Locked)
* 经审计纠偏的事实（如叉车工 ANZSCO 721311）必须编写专用回归测试锁定，再次引入错误常数必须立刻构建报错。

### RULE-75 测试通过不等于事实真实 (Tests Do Not Prove Truth)
* 测试夹具必须携带完整 Provenance 元数据；人工生成的变体必须明确标注 `syntheticMutation: true`。

### RULE-76 Builder 自行判定不构成独立批准
* Builder 报告中的 `SAFE_TO_KEEP`、`PASS` 等标签仅代表自测，非独立 Reviewer 验收结论。

### RULE-77 出处证据文本可验证性 (Provenance Excerpt Verifiability)
* `evidenceExcerpt` 必须是原始抓取载荷中的字面子串。仅填 `sourceUrl` 不算 Provenance。

### RULE-78 缺失证据严格返回 UNKNOWN/null
* 未提取到证据必须标记 `null` 或 `UNKNOWN`，严禁从无否定句推导为 true 或从无肯定句推导为 false。

### RULE-79 单一来源领域边界与专用适配器
* 一个官网页面只证明其自身内容。德国机会卡与双元制、新西兰最低时薪与移民中位数时薪必须分专用 Adapter 提取，再由 Aggregator 汇聚。

### RULE-80 人工夹具显式标识
* 人工合成夹具必须声明 `fixtureType: 'SYNTHETIC_MUTATION'` 与 `syntheticMutation: true`，严禁伪装为 `CAPTURED_OFFICIAL`。

### RULE-81 官方现行来源绝对优先
* 当夹具与官方最新政策冲突时，官方最新来源绝对优先，夹具必须更新（如新西兰最低时薪 $23.95、中位数时薪 $35.00）。

### RULE-82 管线全面清除平行硬编码常数字典
* 采集器、评分及展示层必须消费 Parser 提取的动态事实，彻底清除平行的旧常数（如 23.15, 31.61, 1150, 免自保金）。

### RULE-83 发布信息真实性门禁 (Release Authenticity Gate)
* 数据集发布年份、机构名称必须核验真实存在。严禁捏造未发布的版本（如提前虚构 2026 JSA OSL）。

### RULE-84 聚合层保留原子事实出处
* 汇聚多个页面事实时，必须完整保留各原子事实的独立 sourceId、url 及 evidenceExcerpt。

### RULE-85 缺失字段严禁业务假定兜底
* 字段缺失时必须返回 null 或报错，严禁在业务逻辑中脑补默认值（如默认 3 年工作经验）。
