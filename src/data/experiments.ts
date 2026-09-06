import { MiniExperiment } from '../types';

export const MINI_EXPERIMENTS: MiniExperiment[] = [
  {
    id: 'exp-7d-blender-speed',
    title: '【7天验证】AI 辅助 3D 资产拆分极限测速与真实时薪测算',
    durationDays: 7,
    goal: '测算在保持高质量的前提下，利用 AI 工具将 3D 资产拆分单件交付时间压缩至极限，计算真实的“净小时收益”。',
    actionSteps: [
      '第 1~2 天：记录未加自动化前，拆分 3 个标准 3D 资产的实际耗时与疲劳度。',
      '第 3~4 天：编写或让 AI 生成一个 Blender Python 批处理脚本，自动化清理命名层级与多余材质。',
      '第 5~7 天：测试新工作流交付 5 个资产，计算实际单价 ÷ 耗费小时 = 真实到手时薪。'
    ],
    successMetric: '真实时薪达到预期基准以上，且交付通过率 100%。',
    killCriteria: '如果优化后时薪仍低于基础收益线，说明该外包单价性价比过低，需在 30 天内开拓新渠道。',
    linkedCareerId: 'occ-ai-3d-asset'
  },
  {
    id: 'exp-14d-upwork-probe',
    title: '【14天验证】海外自由职业平台 (Upwork) 真实水温与提案穿透测试',
    durationDays: 14,
    goal: '不用等到英语流利，验证以你现有的 3D + 基础英语 + AI 实时翻译，能否在国际市场上获得有效商业询盘。',
    actionSteps: [
      '第 1~3 天：注册 Upwork 自由职业者账号，上传 3 套最惊艳的 3D 资产渲染图作为 Portfolio。',
      '第 4~8 天：搜索 "3D asset", "low poly", "game asset", "Blender" 关键词，筛选 10 个发布在 24 小时以内的优质需求。',
      '第 9~14 天：使用 AI 协助润色，针对客户具体痛点定制投递 8~10 份专业提案（Cover Letter）。'
    ],
    successMetric: '获得至少 1 次海外客户的官方私信回复或邀约面试。',
    killCriteria: '投递 15 份有效提案 0 任何阅读反馈，则暂停盲目投递，重新复盘作品集质量。',
    linkedCareerId: 'occ-ai-3d-asset'
  },
  {
    id: 'exp-30d-german-habit',
    title: '【30天验证】德语学习敏捷试错：我到底适不适合学德语？',
    durationDays: 30,
    goal: '用最小时间成本验证自己是否有意志力和语言学习能力拿下德语 B1，不给未来后悔留借口。',
    actionSteps: [
      '第 1~7 天：利用 B站 免费《新求精德语初级》或多邻国完成德语发音字母表与基础发音规则打卡。',
      '第 8~20 天：每天雷打不动背诵 20 个 A1 核心词汇，完成基础名词词性（der/die/das）变格认知。',
      '第 21~30 天：尝试看懂歌德学院官网 A1 级别模拟试卷的第 1 部分阅读题。'
    ],
    successMetric: '连续 30 天打卡率超过 85%，并在 A1 基础测试中答对 60% 以上题目。',
    killCriteria: '如果在 30 天内感到极度痛苦、中途放弃打卡超 7 天，则立刻 Kill 德国双元制路线，全身心投入全英文跳板路线！',
    linkedCareerId: 'occ-german-ausbildung-tech'
  }
];
