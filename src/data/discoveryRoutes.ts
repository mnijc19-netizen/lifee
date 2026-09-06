import { DiscoveryRoute } from '../types';

export const DISCOVERY_ROUTES: DiscoveryRoute[] = [
  {
    id: 'disc-es-digital-nomad',
    title: '西班牙数字游民居留 (Spain DNV) · 远程免统招本科通道',
    targetCountry: '西班牙',
    category: 'Digital Nomad',
    status: 'due_diligence',
    estimatedCostRmb: 22000,
    estimatedMonths: 6,
    summary: '西班牙初创企业法案下的数字游民签证。允许受雇或自雇远程人员居留，官方认可 3 年以上行业实操履历替代本科文凭。',
    whyEmerging: '相较德国需要自保金或特定语言证书，西班牙对具备远程外币订单能力的数字工作者开放度极高，满 5 年可申请欧盟长久居留。',
    unverifiedRisks: [
      '月均远程收入门槛严格挂钩西班牙最低工资（SMI 200% 约 €2,646 / 月，约 ¥20,500 RMB），起步期有门槛压力',
      '自雇社保阶梯前 12 个月享受优惠，但后续刚性税费较高',
      '各地移民局审批周期在 20 ~ 90 天浮动'
    ],
    investigationSteps: [
      '追踪西班牙驻华使领馆最新远程工作者签证官方审核材料清单',
      '测算在海外平台稳定月入 $3,000 USD 的达成概率与连续银行流水证明方式',
      '咨询已获批案例关于大专学历加作品集行业年限证明的公证双认证细节'
    ],
    linkedEvidenceIds: ['ev-upwork-3d-market'],
    lastVerifiedAt: '2026-08-15'
  },
  {
    id: 'disc-jp-ssw2-it',
    title: '日本特定技能 2 号 (SSW 2) 扩大范围 · 免统招本科长期在留跳板',
    targetCountry: '日本',
    category: 'Skilled Trades',
    status: 'due_diligence',
    estimatedCostRmb: 15000,
    estimatedMonths: 12,
    summary: '日本出入国在留管理厅逐步放宽特定技能 2 号领域。2 号无在留期限上限，可携家属，且不要求统招全日制本科文凭。',
    whyEmerging: '传统日本技人国对大专学历审查极为严格，特定技能 2 号凭行业实操考试合格即可跨越文凭门槛。',
    unverifiedRisks: [
      '多数人仍需先持有特定技能 1 号在日本企业工作 1~3 年后参加 2 号评定考试',
      '对应领域实操考试目前多在日本国内设立考点',
      '日语要求依然是硬指标（需 N3~N2 水平日常沟通）'
    ],
    investigationSteps: [
      '核验日本出入国在留管理厅 2026 最新公示的特定技能 2 号认定范围与考纲',
      '对比特定技能与传统赴日 IT 派遣的实际劳动报酬与工时保障',
      '评估先考取日语 N3 证书的时间成本'
    ],
    linkedEvidenceIds: [],
    lastVerifiedAt: '2026-08-15'
  },
  {
    id: 'disc-pt-d8',
    title: '葡萄牙 D8 数字游民居留 (低成本旅居欧洲探索)',
    targetCountry: '葡萄牙',
    category: 'Digital Nomad',
    status: 'unverified',
    estimatedCostRmb: 28000,
    estimatedMonths: 8,
    summary: '面向非欧盟远程工作者的居留许可，要求月收入达到葡萄牙最低工资 4 倍（约 €3,280 / 月）。',
    whyEmerging: '欧洲南部生活成本较低，气候宜人，英语普及度高，满 5 年可申请入籍或长久居留（需 A2 基础葡语）。',
    unverifiedRisks: [
      '葡萄牙移民融合事务署（AIMA）重组后积压严重，换卡预约时间极度漫长',
      '非本科学历必须提供详尽的长期稳定商业合同与银行出海完税证明',
      '里斯本及波尔图租房成本近年来涨幅较大'
    ],
    investigationSteps: [
      '持续观测社区关于 AIMA 实际发卡时效反馈',
      '待个人月度自由职业收入突破 $3,500 美元后再行实质推进'
    ],
    linkedEvidenceIds: [],
    lastVerifiedAt: '2026-08-15'
  },
  {
    id: 'disc-ee-e-residency',
    title: '爱沙尼亚数字居民 (e-Residency) · 欧洲轻资产商业结算闭环',
    targetCountry: '爱沙尼亚 / 欧盟',
    category: 'Global Freelance Infrastructure',
    status: 'validated',
    estimatedCostRmb: 4500,
    estimatedMonths: 1,
    summary: '虽然不直接赋予居住权，但允许中国公民 100% 线上开设合规的欧盟一人有限责任公司，打通 Stripe / Wise 国际收汇通道。',
    whyEmerging: '针对国内居家外包开发者解决“个人承接欧美客户外币支付、提现合规与商业信誉”的最佳轻量级武器。',
    unverifiedRisks: [
      '纯粹是商业法人工具，绝不赋予欧盟签证、申根居留或免签旅行权利',
      '每年需承担约 €500 ~ €1,000 的代理地址与合规做账申报成本',
      '国内个人税务居民身份在将利润汇回国内时需注意个税合规'
    ],
    investigationSteps: [
      '作为海外独立接单年营收突破 10 万元时的备用出海架构',
      '完成个人技术主页的国际支付接口设计'
    ],
    linkedEvidenceIds: ['ev-upwork-3d-market'],
    lastVerifiedAt: '2026-08-15'
  }
];
