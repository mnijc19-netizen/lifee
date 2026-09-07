import { Evidence } from '../types';

export const EVIDENCE_BASE: Evidence[] = [
  {
    id: 'ev-de-chancenkarte-blocked',
    title: '德国机会卡 (Chancenkarte) 2026 年度官方最低自保金数额',
    sourceId: 'src-make-it-germany',
    sourceName: 'Make it in Germany 官方联邦门户',
    sourceTier: 'Tier A',
    url: 'https://www.make-it-in-germany.com/en/visa-residence/types/job-search-opportunity-card',
    publishDate: '2026-01-01',
    fetchDate: '2026-09-07',
    lastCheckDate: '2026-09-07',
    country: '德国',
    isOfficial: true,
    summary: '2026 年度德国机会卡求职签证要求申请人证明有能力自负生活开销，限制性账户（Sperrkonto）法定最低存款标准为每月 1,091 欧元，按一年期计算需足额存入 13,092 欧元（折合人民币约 10.2 万元）。',
    keyFactQuotes: [
      'For the year 2026, you must prove financial means of at least €1,091 per month (€13,092 for the full 12-month period) in a blocked account.',
      'A job offer for part-time work (up to 20 hours/week) can be used to offset or supplement this requirement.'
    ],
    confidence: '高',
    expiredRisk: '有效'
  },
  {
    id: 'ev-de-ausbildung-stipend',
    title: '德国双元制职业培训 (Ausbildung) 津贴与免保证金法条',
    sourceId: 'src-ba-germany',
    sourceName: '德国联邦劳工局 (Bundesagentur für Arbeit)',
    sourceTier: 'Tier A',
    url: 'https://www.arbeitsagentur.de/bildung/ausbildung',
    publishDate: '2026-01-15',
    fetchDate: '2026-09-07',
    lastCheckDate: '2026-09-07',
    country: '德国',
    occupationId: 'occ-german-ausbildung-tech',
    isOfficial: true,
    summary: '双元制职业教育由德国企业全额资助，学生免缴学费，且每月依法领取培训津贴（Ausbildungsvergütung，IT/工业领域通常在 950 ~ 1,350 欧元之间）。只要津贴达到德国基本生活标准，使馆签证时免除限制性自保金（Sperrkonto）证明。',
    keyFactQuotes: [
      'Ausbildungsbetrieb zahlt eine monatliche Vergütung. Bei ausreichender Ausbildungsvergütung ist kein Sperrkonto erforderlich.',
      'Ausländische Bewerber benötigen in der Regel Sprachkenntnisse auf dem Niveau B1 des Gemeinsamen Europäischen Referenzrahmens.'
    ],
    confidence: '高',
    expiredRisk: '有效'
  },
  {
    id: 'ev-ewrb-electrician-friction',
    title: '新西兰 EWRB 海外受训电工注册强制要求与工时审计',
    sourceId: 'src-ewrb-nz',
    sourceName: '新西兰电气工人注册委员会 (EWRB Official)',
    sourceTier: 'Tier A',
    url: 'https://www.ewrb.govt.nz/becoming-registered/overseas-trained/',
    publishDate: '2025-11-20',
    fetchDate: '2026-09-07',
    lastCheckDate: '2026-09-07',
    country: '新西兰',
    occupationId: 'occ-nz-au-electrician',
    isOfficial: true,
    summary: '新西兰不直接认可中国电工职业资格。海外申请人必须提供至少 4 年（8,000 小时）合规强电/建筑布线实操工时雇主证明，提供英文翻译件与公证，通过 EWRB 理论考试与法规考试，并在本地持监督照（Limited License）工作至少 1-2 年方可申请全牌。',
    keyFactQuotes: [
      'You must demonstrate at least 4 years (8,000 hours) of practical training and experience as an electrician.',
      'Must include at least 1 year (2,000 hours) of wiring installation in buildings, switchboards, and earthing testing.',
      'There is no automatic mutual recognition for qualifications outside Australia.'
    ],
    confidence: '高',
    expiredRisk: '有效'
  },
  {
    id: 'ev-nz-forklift-anzsco',
    title: '新西兰移民局 ANZSCO Level 4-5 工种政策收紧与永居排除',
    sourceId: 'src-inz-gov',
    sourceName: 'Immigration New Zealand Policy Announcements',
    sourceTier: 'Tier A',
    url: 'https://www.immigration.govt.nz/about-us/media-centre/news-notifications',
    publishDate: '2026-04-10',
    fetchDate: '2026-09-07',
    lastCheckDate: '2026-09-07',
    country: '新西兰',
    occupationId: 'occ-forklift-logistics',
    isOfficial: true,
    summary: '新西兰 AEWV 政策规定：ANZSCO 721311 叉车驾驶员（基准 Skill Level 4）要求申请人具备至少雅思 4.0 英语能力，工签最长居留年限压缩至 3 年且无绿名单直接永居；仅在雇主 Job Check 要求 3 年经验或 NZQCF Level 4 资格时方可按 Level 3 审理，绝非自动获签或移民。',
    keyFactQuotes: [
      'ANZSCO level 4 and 5 roles now require an English language requirement of at least IELTS 4.0 or equivalent.',
      'The maximum continuous stay on an AEWV for level 4 and 5 roles is limited and they do not have direct pathway under the Green List.'
    ],
    confidence: '高',
    expiredRisk: '有效'
  },
  {
    id: 'ev-jp-ssw-framework',
    title: '日本出入国在留管理厅特定技能（SSW）制度与大专门槛',
    sourceId: 'src-japan-moj',
    sourceName: '日本出入国在留管理厅 (ISA Japan)',
    sourceTier: 'Tier A',
    url: 'https://www.moj.go.jp/isa/applications/ssw/index.html',
    publishDate: '2026-02-01',
    fetchDate: '2026-09-07',
    lastCheckDate: '2026-09-07',
    country: '日本',
    occupationId: 'occ-japan-ssw-caregiver',
    isOfficial: true,
    summary: '特定技能 1 号涵盖介护、机械加工、食品制造等 12 个行业，无统招全日制本科学历限制（中专及大专完全符合），只需通过日语国际能力测试 N4（或 JFT-Basic A2）及特定技能评价考试即可申请，月薪与日本人同酬。',
    keyFactQuotes: [
      '学歴要件は課されず、技能試験及び日本語試験（JLPT N4以上またはJFT-Basic A2）の合格が必要。',
      '日本人が従事する場合に受ける報酬と同等額以上の報酬を受けること。'
    ],
    confidence: '高',
    expiredRisk: '有效'
  },
  {
    id: 'ev-my-derantau-rules',
    title: '马来西亚数字经济机构 MDEC DE Rantau 数字游民签证官方准则',
    sourceId: 'src-my-mdec',
    sourceName: 'Malaysia Digital Economy Corporation (MDEC)',
    sourceTier: 'Tier A',
    url: 'https://mdec.my/derantau',
    publishDate: '2025-10-18',
    fetchDate: '2026-09-07',
    lastCheckDate: '2026-09-07',
    country: '马来西亚',
    isOfficial: true,
    summary: '面向全球数字自由职业者（IT、软件、内容创作、3D设计）开放，年化远程收入需达 24,000 美元（约合 17 万人民币，需银行流水或长期合同证明）。首发 12 个月，可在境内续签 12 个月。',
    keyFactQuotes: [
      'Digital freelancers or remote workers in IT and digital domain with annual income of not less than USD 24,000.',
      'Pass duration is 3 to 12 months, renewable for an additional 12 months.'
    ],
    confidence: '高',
    expiredRisk: '有效'
  },
  {
    id: 'ev-acs-rpl-barrier',
    title: '澳大利亚计算机协会 (ACS) 技能评估大专扣减年限规定',
    sourceId: 'src-homeaffairs-au',
    sourceName: 'Australian Computer Society Migration Skills Assessment',
    sourceTier: 'Tier A',
    url: 'https://www.acs.org.au/msa.html',
    publishDate: '2025-08-30',
    fetchDate: '2026-09-07',
    lastCheckDate: '2026-09-07',
    country: '澳大利亚',
    occupationId: 'occ-fullstack-developer',
    isOfficial: true,
    summary: 'ACS 评估规定，非计算机对口专业的大专学历（Diploma with non-ICT content）必须走 Recognition of Prior Learning (RPL) 途径，且要求至少 5 至 6 年的全职相关工作经验方可扣除以换取技能评估通过，新毕业生无可能通过评估。',
    keyFactQuotes: [
      'Non-ICT Diploma qualifications require 6 years of full-time professional ICT work experience plus an RPL project report.',
      'Work experience must be deemed skilled and post-qualification unless RPL guidelines apply.'
    ],
    confidence: '高',
    expiredRisk: '有效'
  },
  {
    id: 'ev-upwork-3d-market',
    title: 'Upwork 2026 全球自由职业劳动力报告：3D 资产与 AI 自动化中位时薪',
    sourceId: 'src-upwork-index',
    sourceName: 'Upwork Global Economic Research',
    sourceTier: 'Tier C',
    url: 'https://www.upwork.com/research',
    publishDate: '2026-03-01',
    fetchDate: '2026-09-07',
    lastCheckDate: '2026-09-07',
    country: '全球',
    occupationId: 'occ-ai-3d-asset',
    isOfficial: false,
    summary: '调研显示，具备 AI 纹理生成与 Blender 快速拓扑能力的 3D 资产制作师在全球自由职业市场的平均中标时薪为 32 美元，工作流自动化（n8n/Python）顾问的平均时薪为 48 美元。',
    keyFactQuotes: [
      'Median hourly rate for verified 3D digital asset creators utilizing generative AI workflows stands at $32.50 USD.',
      'Clients increasingly favor delivery speed and file compatibility over traditional degree credentials.'
    ],
    confidence: '高',
    expiredRisk: '有效'
  },
  {
    id: 'ev-reddit-trades-warning',
    title: '海外华人技工真实社区反馈：中国非对口跨行学徒踩坑实录',
    sourceId: 'src-community-cases',
    sourceName: 'Reddit r/newzealand & 华人技术移民真实追踪',
    sourceTier: 'Tier E',
    url: 'https://www.reddit.com/r/newzealand',
    publishDate: '2026-05-12',
    fetchDate: '2026-09-07',
    lastCheckDate: '2026-09-07',
    country: '新西兰',
    occupationId: 'occ-nz-au-electrician',
    isOfficial: false,
    summary: '多位自费到澳新从零读 TAFE/Polytechnic 电工的中专大专生反馈：毕业后由于没有本地人脉与全英文流利沟通，本地电工大师傅（Kiwi Master）极少愿意为外国人出具学徒工时签字，导致大量人卡在“完成学业却无法换牌”的死循环中。',
    keyFactQuotes: [
      'Finding a registered master electrician to sponsor your supervised logbook hours as a foreigner is the real wall.',
      'Without an existing network or local residency, you are competing against locals who started high school apprenticeships.'
    ],
    confidence: '中',
    expiredRisk: '有效'
  },
  {
    id: 'ev-es-dnv-smi',
    title: '西班牙初创企业法数字游民居留 (Ley 28/2022) 官方薪酬与学历替代条款',
    sourceId: 'src-eu-eures',
    sourceName: '西班牙国家官方公报 (BOE) & 移民局官方公报',
    sourceTier: 'Tier A',
    url: 'https://prie.comercio.gob.es/es-es/Paginas/Teletrabajadores-caracter-internacional.aspx',
    publishDate: '2026-01-01',
    fetchDate: '2026-09-07',
    lastCheckDate: '2026-09-07',
    country: '西班牙',
    isOfficial: true,
    summary: '根据西班牙第 28/2022 号法律，国际远程工作者需证明拥有至少西班牙最低工资 (SMI) 200% 的稳定月收入（2026 年度基准约每月 2,646 欧元）。申请人若不具备统招大学本科文凭，官方明确允许提供至少 3 年可核验的同行业资深专业从业经验进行替代。',
    keyFactQuotes: [
      'Acreditar ingresos mensuales que superen el 200% del Salario Mínimo Interprofesional (SMI).',
      'Experiencia profesional demostrable de al menos 3 años en el sector relacionada con el puesto remoto.'
    ],
    confidence: '高',
    expiredRisk: '有效'
  },
  {
    id: 'ev-ee-eresidency-official',
    title: '爱沙尼亚官方电子居民 (e-Residency) 设立欧盟法人与资金合规准则',
    sourceId: 'src-eu-eures',
    sourceName: 'Republic of Estonia e-Residency Official Gateway',
    sourceTier: 'Tier A',
    url: 'https://www.e-resident.gov.ee/',
    publishDate: '2026-01-10',
    fetchDate: '2026-09-07',
    lastCheckDate: '2026-09-07',
    country: '爱沙尼亚 / 欧盟',
    isOfficial: true,
    summary: '爱沙尼亚政府为全球自由职业者提供的国家级数字身份，支持 100% 线上注册欧盟有限责任公司 (OÜ) 并接入全球支付网关。官方明确指出该身份不构成税务居民身份，亦不赋予申根签证或欧盟居住权。',
    keyFactQuotes: [
      'e-Residency provides access to Estonia transparent digital business environment.',
      'It does not grant citizenship, tax residency, physical residence or permission to enter Estonia or the EU.'
    ],
    confidence: '高',
    expiredRisk: '有效'
  }
];
