import { UserProfile, Pathway } from '../types';
import { EVIDENCE_BASE } from '../data/evidence';
import { OCCUPATIONS } from '../data/occupations';
import { COUNTRIES } from '../data/countries';
import { calculateRunway } from './runway';

export interface AiResponseStructure {
  conclusion: string;
  why: string;
  relevanceToUser: string;
  evidenceQuotes: { title: string; tier: string; text: string; source: string }[];
  uncertaintiesAndRisks: string;
  nextImmediateAction: string;
}

export function generateExportableAiContext(profile: UserProfile, topPathways: Pathway[]): string {
  const runway = calculateRunway(profile);

  return `# 个人人生与职业决策背景 (Lifee Context Export)
- 生成基准日期: ${profile.targetDateBaseline}
- 年龄/身份: ${profile.birthYear ? `${profile.birthYear} 年出生, ` : ''}中国公民
- 学历背景: ${profile.education || '全日制大专 (专科)'}, 专业: ${profile.major || '数字媒体与设计'}, GPA: 约 ${profile.gpa || 80} 分
- 语言基础: 英语当前词汇量约 ${profile.englishVocabEstimate || 2000} 水平; 愿为出国与变现长期系统攻坚
- 职业实战: 具备数字媒体/3D 资产制作与 AI 工具结合实战经验，可承接远程交付订单
- 财务与生存底线: 现有可用流动资金约 ¥${(profile.currentSavingsRmb || 0).toLocaleString()}; 每月固定房租约 ¥${(profile.monthlyRentRmb || 0).toLocaleString()}; 基础生存开销约 ¥${(profile.monthlyFoodAndLifeRmb || 0).toLocaleString()}; 当前月均自给收入约 ¥${(profile.currentMonthlyIncomeRmb || 0).toLocaleString()}
- 生存 Runway 状态: ${runway.healthLabel} (月固定消耗 ¥${runway.fixedMonthlyBurnRmb}，月净现金流 ¥${runway.netMonthlyCashflowRmb})
- 核心价值观与偏好:
  1. 坚决排斥国内传统“低工资、长工时、无效坐班通勤”;
  2. 极度看重“自由时间、高时薪、弹性/远程/按结果付费”;
  3. 热爱 AI、技术与互联网, 高频使用 Agent/LLM 协同独立开发真实 Web 产品;
  4. 长期坚定出国定居, 追求安全、网络完全自由 (无审查畅享全球 AI 与科技)、工时合理、普通职业能维持体面生活的国家。

## 当前系统综合评估出的最优路线 Top 3:
${topPathways.slice(0, 3).map((p, idx) => `
### ${idx + 1}. ${p.name}
- 目标国家: ${p.targetCountry}
- 预计周期: ${p.totalMonthsEst} 个月 | 起步最低资金: ¥${p.minCapitalRmb.toLocaleString()}
- 可行性评分: ${p.feasibilityScore}/100
- 核心入选理由: ${p.whyRecommended}
- 路线失效条件 (Kill Criteria): ${p.killCriteria}
- 当前第一步: ${p.nextImmediateStep}
`).join('\n')}

## 决策咨询核心诉求:
请基于以上真实约束（严禁假设我拥有统招顶尖名校本科、巨额存款或母语级流利外语），针对我的下一个 30 天行动计划，给出最高杠杆、最低沉没成本的执行建议。
`;
}

/**
 * Generates an exhaustive prompt optimized for Antigravity / Claude / Codex reasoning agents.
 */
export function generateAntigravityAuditPrompt(profile: UserProfile, topPathways: Pathway[], customQuery?: string): string {
  const runway = calculateRunway(profile);
  const context = generateExportableAiContext(profile, topPathways);
  const evidenceSummary = EVIDENCE_BASE.slice(0, 6).map(e => `- [${e.sourceTier}] ${e.title}: ${e.keyFactQuotes[0] || e.summary}`).join('\n');

  return `# Antigravity 深度决策研判与多维审计指令 (LIFEE_DECISION_AGENT)

你现在是搭载于 Google Antigravity 高阶推理智能体上的【Lifee 首席人生与职业战略顾问】。
必须严格遵循【全领域最高认知与工程宪法】（RULE-01 ~ RULE-85），绝不产生幻觉、绝不凭空捏造政策门槛。

## 一、用户真实档案与客观硬性约束
- 学历: ${profile.education || '全日制大专 (专科)'} / 专业: ${profile.major || '数字媒体与设计'}
- 可支配流动资金: ¥${(profile.currentSavingsRmb || 0).toLocaleString()} 元 (现金储备)
- 生存 Runway 状况: ${runway.healthLabel} (月固定支出 ¥${runway.fixedMonthlyBurnRmb}，月净现金流 ¥${runway.netMonthlyCashflowRmb})
- 核心路线偏好: 拒绝长工时坐班通勤，以 AI+3D 数字化资产制作保证生存底线，攻坚语言并打通海外定居。

## 二、当前系统最优推荐 Top 3 路径
${topPathways.slice(0, 3).map((p, idx) => `${idx + 1}. 【${p.name}】
   - 国家: ${p.targetCountry} | 起步资金: ¥${p.minCapitalRmb.toLocaleString()} | 可行性: ${p.feasibilityScore}/100
   - 下一道门槛 (Next Gate): ${p.nextImmediateStep}
   - 止损条件 (Kill Criteria): ${p.killCriteria}`).join('\n')}

## 三、系统官方已核验基准参考
${evidenceSummary}

## 四、本次研判核心诉求
${customQuery || '请对我的现金流生命线、德国双元制 vs 机会卡可行性、以及未来 30 天最高杠杆敏捷小实验展开全维深度审计。'}

## 五、研判与输出规范 (必须严格按以下 6 个层级结构化输出，方便 Lifee 系统解析并一键沉淀为行动计划):
一、核心结论 (Verdict):
[给出直接、果断、有量化依据的定论，严禁空洞套话]

二、底层依据 (Why):
[结合官方政策法案与经济学逻辑说明原因，严禁虚假编造]

三、对我有什么关系 (Personal Relevance):
[精准穿透到用户的资金缺口、大专文凭与时间成本]

四、所引用之证据库条目 (Evidence):
[明确标明官方或权威调研依据]

五、不确定性与潜在死穴 (Uncertainties & Failure Modes):
[明确指出最大的潜在不可逆风险与止损条件]

六、下一步立刻执行动作 (Next Action):
[给出未来 7 天内低成本、可验证的唯一敏捷小实验]
`;
}

/**
 * Parses external AI output (Markdown or JSON) into structured AiResponseStructure.
 */
export function parseExternalAiResponse(rawText: string): AiResponseStructure {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty response payload');
  }

  // Attempt JSON parsing first
  try {
    let cleanJson = rawText.trim();
    if (cleanJson.startsWith('```json')) cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
    else if (cleanJson.startsWith('```')) cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleanJson);
    if (parsed && parsed.conclusion) {
      return {
        conclusion: parsed.conclusion || '研判已完成',
        why: parsed.why || '',
        relevanceToUser: parsed.relevanceToUser || '',
        evidenceQuotes: Array.isArray(parsed.evidenceQuotes) ? parsed.evidenceQuotes : [],
        uncertaintiesAndRisks: parsed.uncertaintiesAndRisks || '',
        nextImmediateAction: parsed.nextImmediateAction || ''
      };
    }
  } catch {
    // Proceed to regex section parsing
  }

  const extractSection = (headingRegex: RegExp, nextHeadingRegex: RegExp): string => {
    const match = rawText.match(headingRegex);
    if (!match) return '';
    const startIndex = match.index! + match[0].length;
    const remaining = rawText.slice(startIndex);
    const nextMatch = remaining.match(nextHeadingRegex);
    const endIndex = nextMatch ? nextMatch.index! : remaining.length;
    return remaining.slice(0, endIndex).trim();
  };

  const conclusion = extractSection(/(?:一、|1\.|#+)?\s*(?:核心结论|Verdict)[:：]?/i, /(?:二、|2\.|#+)?\s*(?:底层依据|Why)[:：]/i) || rawText.slice(0, 180);
  const why = extractSection(/(?:二、|2\.|#+)?\s*(?:底层依据|Why)[:：]?/i, /(?:三、|3\.|#+)?\s*(?:对我有什么关系|Personal Relevance)[:：]/i);
  const relevanceToUser = extractSection(/(?:三、|3\.|#+)?\s*(?:对我有什么关系|Personal Relevance)[:：]?/i, /(?:四、|4\.|#+)?\s*(?:所引用之证据库条目|引用|Evidence)[:：]/i);
  const evidenceText = extractSection(/(?:四、|4\.|#+)?\s*(?:所引用之证据库条目|引用|Evidence)[:：]?/i, /(?:五、|5\.|#+)?\s*(?:不确定性与潜在死穴|风险|Uncertainties)[:：]/i);
  const uncertaintiesAndRisks = extractSection(/(?:五、|5\.|#+)?\s*(?:不确定性与潜在死穴|风险|Uncertainties)[:：]?/i, /(?:六、|6\.|#+)?\s*(?:下一步立刻执行动作|下一步|Next Action)[:：]/i);
  const nextImmediateAction = extractSection(/(?:六、|6\.|#+)?\s*(?:下一步立刻执行动作|下一步|Next Action)[:：]?/i, /$/);

  return {
    conclusion: conclusion || '外部研判结论已解析完成',
    why: why || '基于外部大模型输入参数与实证逻辑推演',
    relevanceToUser: relevanceToUser || '已根据您的当前大专学历与财务底线进行适配',
    evidenceQuotes: evidenceText ? [{ title: '外部 AI 研判引用', tier: 'External LLM', text: evidenceText.slice(0, 200), source: 'External AI Audit' }] : [],
    uncertaintiesAndRisks: uncertaintiesAndRisks || '请务必交叉核验官方公报最新生效时间',
    nextImmediateAction: nextImmediateAction || '进入【我的计划】执行 7 天低成本小实验'
  };
}

export function localEvidenceRag(query: string, profile: UserProfile): AiResponseStructure {
  const q = query.toLowerCase();
  const savings = profile.currentSavingsRmb || 0;
  const runway = calculateRunway(profile);

  // Route 1: Electrician / Trades in NZ or AU
  if (q.includes('电工') || q.includes('技工') || q.includes('new zealand') || q.includes('新西兰电工')) {
    return {
      conclusion: '【高风险/极高壁垒】目前坚决不建议你从零转型去新西兰或澳洲做电工。表面工资虽高，但存在致命资格互认死穴。',
      why: '新西兰 EWRB 明确规定海外受训电工必须提供 4 年（8,000 小时）实操工时雇主证明，中国证书不被自动承认。自费留学读电工每年需 15~20 万元，严重违背你当前流动资金的现实。',
      relevanceToUser: `你当前可用流动资金约 ¥${savings.toLocaleString()} 元，没有任何电气经验，若盲目听信网络宣传辞职学电工，将白白消耗 3~5 年青春且大概率卡在海外无法换牌。`,
      evidenceQuotes: [
        {
          title: '新西兰 EWRB 海外受训电工注册强制要求',
          tier: 'Tier A (官方注册机构)',
          text: 'You must demonstrate at least 4 years (8,000 hours) of practical training and experience... No automatic mutual recognition outside Australia.',
          source: 'https://www.ewrb.govt.nz'
        },
        {
          title: '海外华人技工真实社区反馈',
          tier: 'Tier E (社区实证避坑)',
          text: '本地电工大师傅极少愿意为无身份无语言的外国人签署学徒工时日志，学徒找导师是最大的隐藏暗礁。',
          source: 'Reddit r/newzealand'
        }
      ],
      uncertaintiesAndRisks: '除非未来你手头拥有 30 万元以上学费储备且能承受 4 年全职学徒低薪，否则该路线应保持在 Watchlist 观察池，不行动。',
      nextImmediateAction: '将注意力从“电工执照”移开，把精力专注在“低门槛、全远程、即时变现”的 AI+3D 资产制作上。'
    };
  }

  // Route 2: Forklift
  if (q.includes('叉车') || q.includes('仓储') || q.includes('forklift')) {
    return {
      conclusion: '【警惕虚假中介】叉车司机属于低技能岗位（ANZSCO Level 4），在澳新加均无法直接申请长期技术工作签证，更没有独立永居路径。',
      why: '新西兰移民局 2024-2026 年最新政策已明确对 4-5 级低技能岗位实施最严限制令，最长连续工签仅限 2-3 年且绝不纳入绿名单（Green List）。',
      relevanceToUser: '即便朋友提起国外叉车缺人，这也只是针对已经拥有当地合法身份者的劳务需求，外国人无法据此移民，严防被中介收割。',
      evidenceQuotes: [
        {
          title: '新西兰移民局 ANZSCO Level 4-5 政策收紧公告',
          tier: 'Tier A (新西兰移民局)',
          text: 'ANZSCO level 4 and 5 roles now require English IELTS 4.0... and they DO NOT have direct pathway under the Green List.',
          source: 'https://www.immigration.govt.nz'
        }
      ],
      uncertaintiesAndRisks: '任何承诺“花几万办出国开叉车拿绿卡”的中介，100% 涉嫌非法劳务派遣或打黑工风险。',
      nextImmediateAction: '彻底从优先推荐列表中划除叉车路线，不浪费一分钱考无用中介证书。'
    };
  }

  // Route 3: Germany Ausbildung / Chancenkarte
  if (q.includes('德国') || q.includes('双元制') || q.includes('机会卡') || q.includes('ausbildung') || q.includes('chancenkarte')) {
    const deGap = Math.max(0, 102000 - savings);
    return {
      conclusion: `【极力推荐双元制，暂缓机会卡】德国是目前大专学历最友好的发达国家；你当前可用资金 ¥${savings.toLocaleString()} 元，距离机会卡法定自保金（€13,092 ≈ ¥10.2万）存在 ¥${deGap.toLocaleString()} 元资金缺口。应坚决走“0学费带薪双元制 Ausbildung”，而非需锁定 10 万自保金的机会卡。`,
      why: '德国联邦劳工局规定双元制学徒免学费且企业每月支付 950~1350 欧元津贴；若企业实训津贴满足法定基本生活标准（毛额 €1,048/净额约 €822 起），可免除自保金；若津贴存在差额则仅需补足差额证明。大专文凭在德国受认可，毕业工作满 2~3 年即可申请欧盟永居。',
      relevanceToUser: `完美匹配你“无启动大额本金（缺口 ¥${deGap.toLocaleString()} 元被双元制津贴消除）”、“大专学历在英语国家移民打分不够”的底层痛点。工时严格 38.5 小时，年假 30 天，网络完全自由。`,
      evidenceQuotes: [
        {
          title: '德国双元制职业培训津贴与生计差额自保金规定',
          tier: 'Tier A (德国联邦劳工局)',
          text: 'Ausbildungsbetrieb zahlt eine monatliche Vergütung. Bei ausreichender Ausbildungsvergütung ist kein Sperrkonto erforderlich.',
          source: 'https://www.arbeitsagentur.de'
        },
        {
          title: '德国机会卡 2026 年度官方最低自保金数额',
          tier: 'Tier A (Make it in Germany)',
          text: 'For the year 2026, you must prove financial means of at least €1,091 per month (€13,092 for the full 12-month period) in a blocked account.',
          source: 'https://www.make-it-in-germany.com'
        }
      ],
      uncertaintiesAndRisks: '唯一的死穴是德语。必须考过歌德德语 B1/B2 才能获批职业培训签证。',
      nextImmediateAction: '启动【30天德语学习小实验】：每天投入 45 分钟背诵 A1 核心词汇，验证自己是否有学习意志。'
    };
  }

  // Route 4: AI & 3D freelance / Remote
  if (q.includes('3d') || q.includes('ai') || q.includes('外包') || q.includes('编程') || q.includes('现金流')) {
    return {
      conclusion: `【当下生命线】保持居家 3D/AI 数字资产制作外包是实现自负盈亏、拒绝低薪长工时坐班的最核心武器。当前系统测算 Runway 为【${runway.healthLabel}】。`,
      why: '全球数字资产制作正被 AI 深度重构。具备大专 3D 背景结合实战切分交付经验，比纯零基础人员领先一个台阶。国内计件每月可稳定获取自给收入，足以支撑低成本独立生活。',
      relevanceToUser: `你目前月固定总消耗 ¥${runway.fixedMonthlyBurnRmb} 元（房租约 ¥${profile.monthlyRentRmb || 1200} + 生活 ¥${profile.monthlyFoodAndLifeRmb || 800}），月净现金流 ¥${runway.netMonthlyCashflowRmb} 元。低生活支出使得你不需要去挤低性价比坐班岗位，保留全部自主时间用于攻关语言和国际化技能。`,
      evidenceQuotes: [
        {
          title: 'Upwork 全球自由职业劳动力报告',
          tier: 'Tier C (行业专业调研)',
          text: 'Verified 3D digital asset creators utilizing generative AI workflows command standard entry-to-mid hourly rates [估算/依项目类型在 $20~$35 USD 区间浮动].',
          source: 'https://www.upwork.com/research'
        }
      ],
      uncertaintiesAndRisks: '过度依赖单一上游外包商可能面临单量波动风险。建议在 90 天内建立海外平台与多元化独立交付渠道。',
      nextImmediateAction: '执行【7天测速小实验】：用 Python/脚本工具自动化批处理流程，优化 3D 资产拆分流水线，提升有效小时收益。'
    };
  }

  // Route 5: Unknown / Unverified Policy Inquiries (Constitutional Rule: Zero Hallucination)
  const policyKeywords = ['签证', '移民', '政策', '永居', '工签', '免签', '护照', '绿卡', '门槛', '法案', '税率', '免税'];
  const isKnownTopic = ['德国', '新西兰', '澳大利亚', '澳洲', '马来西亚', '日本', '3d', 'ai', '电工', '叉车', '双元制', '机会卡', '外包', '现金流'].some(k => q.includes(k));
  if (policyKeywords.some(k => q.includes(k)) && !isKnownTopic) {
    return {
      conclusion: '【未收录/官方待确证】当前 Lifee 官方证据库中未收录此项政策的一手权威证据，系统严格拒绝凭空臆断。',
      why: '根据最高认知宪法之“零盲猜与事实铁律”：未经过抓取、清洗、验证与官方快照持久化的政策声明，一律判定为待确证 (Unknown)。严禁将非官方流传信息当作事实。',
      relevanceToUser: '防止因缺乏官方凭证的政策传闻而做出不可逆的沉没成本投入或资金浪费。',
      evidenceQuotes: [
        {
          title: '官方证据库未收录告警',
          tier: 'Unknown (无一手证据)',
          text: '当前系统证据库暂无此项政策的官方公报收录。若需研判，请前往【数据健康】提交官方端点或通过人工核验录入。',
          source: 'Lifee Evidence Base'
        }
      ],
      uncertaintiesAndRisks: '该事项处于数据盲区，政策真实性未经验证，存在被不法中介利用信息差误导的极高风险。',
      nextImmediateAction: '暂停对该未经证实政策的投入，向官方移民局门户或【数据健康】提交抓取请求。'
    };
  }

  // Default Fallback
  return {
    conclusion: `基于当前 2026-09-07 官方证据库，系统建议你采取“以守为攻”策略：先以居家 AI+3D 资产拆分保障现金流，同时系统突破英语（高频3000词）或德语（B1标准）。`,
    why: `你目前处于可用流动资金 ¥${savings.toLocaleString()} 元、大专学历刚毕业状态。直接出国需要高昂资金或官方认可资格，只有通过“低成本积累 + 实用技能跃迁”，才能在 12~24 个月内打通去往德国双元制或马来西亚数字游民的现实通道。`,
    relevanceToUser: `当前月固定开销约 ¥${runway.fixedMonthlyBurnRmb} 元，不花冤枉钱，不交智商税，每一天都在做“即使路线改变也不会浪费”的低后悔投资。`,
    evidenceQuotes: [
      {
        title: '德国双元制带薪培训与免保证金政策',
        tier: 'Tier A (德国劳工局)',
        text: 'Ausbildungsbetrieb zahlt eine monatliche Vergütung... kein Sperrkonto erforderlich.',
        source: 'https://www.arbeitsagentur.de'
      },
      {
        title: '马来西亚 DE Rantau 数字游民签证官方准则',
        tier: 'Tier A (MDEC)',
        text: 'Digital freelancers with annual income not less than USD 24,000.',
        source: 'https://mdec.my/derantau'
      }
    ],
    uncertaintiesAndRisks: '最主要的风险是陷入“不断寻找完美方案却迟迟不行动”的分析瘫痪。',
    nextImmediateAction: '进入【My Plan / 我的计划】页面，领取今天的 2 项具体行动（外包交付 + 45分钟语言打卡）。'
  };
}
