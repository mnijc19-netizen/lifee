import { IntelligenceEvent } from '../types';

export const INTELLIGENCE_STREAM: IntelligenceEvent[] = [
  {
    id: 'intel-01',
    title: '德国 2026 年度机会卡 (Chancenkarte) 自保金标准上调至 13,092 欧元',
    category: '签证政策',
    impactScore: 9.2,
    country: '德国',
    date: '2026-08-15',
    summary: '德国联邦劳工部调高机会卡月度生活费证明门槛至 1,091 欧元/月，全年需锁定约 10.2 万元人民币。',
    oldFact: '旧规自保金要求为每月约 1,027 欧元（年计 12,324 欧元）。',
    newFact: '现行最新要求为每月 1,091 欧元（年计 13,092 欧元，折合人民币约 102,000 元）。',
    whatToChangeForMe: '明确排除了当前阶段自费申请机会卡求职的可行性（需预先锁定逾 10 万元自保金）；将德国低资金路径聚焦在【免自保金带薪双元制 Ausbildung】上，降低资金沉没成本。',
    evidenceId: 'ev-de-chancenkarte-blocked'
  },
  {
    id: 'intel-02',
    title: '新西兰全面收紧 AEWV 低技能岗位工签：叉车等工种停发长期续签',
    category: '紧缺名单',
    impactScore: 8.8,
    country: '新西兰',
    date: '2026-07-28',
    summary: '新西兰移民局落实对 ANZSCO 4-5 级工种的最严限制令，叉车及普通仓储操作员无法转长期居留。',
    oldFact: '过去部分中介宣称可通过雇主担保让叉车司机工签无限续签并等待政策大赦。',
    newFact: '移民局正式确立此类岗位最高停留 2-3 年且必须考雅思 4.0，绝不纳入 Green List。',
    whatToChangeForMe: '坚决打消“去新西兰开叉车移民”的幻想，严防被不良劳务中介骗走数万元安置费。',
    evidenceId: 'ev-nz-forklift-anzsco'
  },
  {
    id: 'intel-03',
    title: '日本特定技能 2 号（特定技能2号）行业目录全面铺开',
    category: '签证政策',
    impactScore: 8.5,
    country: '日本',
    date: '2026-06-30',
    summary: '日本出入国在留管理厅正式确认，特定技能 1 号工人工作满期后，只要通过上级实技考核，可无限期续签特定技能 2 号并接配偶子女赴日。',
    oldFact: '特定技能 1 号以往被视为最长 5 年的“纯廉价打工过渡”，到期必须离境。',
    newFact: '机械加工、食品制造、外食、造船等行业特定技能 2 号考核常态化，享有事实上永居通道。',
    whatToChangeForMe: '将【日本特定技能】从原先的“纯临时打工”提升为“高确定性保底长期出国路线”，特别是在大专学历匹配的机械加工制造方向。',
    evidenceId: 'ev-jp-ssw-framework'
  },
  {
    id: 'intel-04',
    title: '马来西亚 DE Rantau 数字游民签更新外包流水认定标准',
    category: '签证政策',
    impactScore: 8.0,
    country: '马来西亚',
    date: '2026-06-15',
    summary: 'MDEC 放宽对自由职业平台收入证明的审核，接受近 3 个月的 Upwork/Fiverr 流水与加密提现记录。',
    oldFact: '以往要求提供跨国企业签订的 12 个月固定劳动合同。',
    newFact: '只要过去连续 3 个月平台提现流水折合年化达到 24,000 美元即可通过审核。',
    whatToChangeForMe: '大幅降低了数字游民出境门槛。你只要在国内利用 AI+3D 外包把月流水做到 1.4 万元人民币，即可申请赴马旅居。',
    evidenceId: 'ev-my-derantau-rules'
  },
  {
    id: 'intel-05',
    title: '国内一线游戏与电商大厂收紧 3D 坐班校招，全面转向外部管线外包',
    category: '国内就业信号',
    impactScore: 7.8,
    country: '中国',
    date: '2026-05-20',
    summary: '主流头部互联网与游戏大厂缩减初级 3D 美术全职坐班编制，将资产制作与切分批量转交外部供应商。',
    oldFact: '大专毕业生传统出路是去大城市游戏外包公司高工时坐班当切图工。',
    newFact: '大厂全职坐班岗位竞争激烈且性价比走低，但针对高效外部供应商的计件订单总量稳步增长。',
    whatToChangeForMe: '证明避开低性价比长工时坐班是正确的战术判断。不要去挤死板的初级坐班岗，而要抓住居家承接计件业务的自由度与自研技能时间。',
    evidenceId: 'ev-upwork-3d-market'
  }
];
