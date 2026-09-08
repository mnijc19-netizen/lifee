import { MiniExperiment } from '../types';

export const MINI_EXPERIMENTS: MiniExperiment[] = [
  {
    id: 'exp-7d-blender-speed',
    title: '【7天微验证】AI 辅助 3D 资产整理测速与实际时薪评估',
    durationDays: 7,
    goal: '测算在保证质量的前提下，利用简单自动化脚本或 AI 工具辅助清理 3D 资产耗时，计算真实的有效小时收益。',
    maxBudgetRmb: 0,
    actionSteps: [
      '第 1~2 天：记录未加自动化前，整理 2 个标准 3D 模型的实际耗时与注意力消耗。',
      '第 3~4 天：使用 Blender 常用快捷流程或让 AI 生成简单批处理脚本，清理材质命名与多余节点。',
      '第 5~7 天：测试新流程完成 3 个模型，计算实际单价 ÷ 耗费小时 = 真实到手时薪。'
    ],
    successMetric: '单件耗时明显压缩，真实折算时薪达到心目中的底线要求。',
    stopLossCriteria: '若优化后真实时薪依然明显低于预期，说明当前细分任务性价比过低，建议微调交付方向或转向更具复用价值的资产库制作。',
    killCriteria: '若优化后真实时薪依然明显低于预期，说明当前细分任务性价比过低，建议微调交付方向。',
    linkedCareerId: 'occ-ai-3d-asset',
    linkedPathwayId: 'path-ai-remote',
    reflectionQuestions: [
      '这项技能制作过程中，我是感到沉浸还是极度厌倦？',
      '计算出的真实净时薪是否足以支撑当前的月度收支平衡？',
      '如果继续投入，是否有边际效率递增的复用空间？'
    ]
  },
  {
    id: 'exp-14d-upwork-probe',
    title: '【14天微验证】线上接单平台真实需求观察与试探',
    durationDays: 14,
    goal: '无需完全准备好再行动，验证现有的 3D 技能 + 翻译辅助工具，能否看懂实际商业需求并形成有效沟通。',
    maxBudgetRmb: 0,
    actionSteps: [
      '第 1~3 天：浏览国际自由职业平台相关分类，挑选 3 套贴近真实需求的 3D 渲染图作为展示材料。',
      '第 4~8 天：检索 3D asset、game asset 等关键词，收集 10 个近期发布的真实需求，记录客户关心的交付规格与预算。',
      '第 9~14 天：尝试针对具体需求撰写 3~5 份客观答复草稿，检验自己能否清晰表达交付周期与交付格式。'
    ],
    successMetric: '能准确读懂客户需求细节并产出结构化提案草稿。',
    stopLossCriteria: '若发现自身当前技术栈与海外实际买家需求差距较大，暂缓广泛投递，先针对缺漏的具体格式（如 Unity/Unreal 规范）做单点补充。',
    killCriteria: '若发现当前技能与海外实际买家需求差距较大，暂缓盲目投递，先针对缺漏技能做单点补充。',
    linkedCareerId: 'occ-ai-3d-asset',
    linkedPathwayId: 'path-ai-remote',
    reflectionQuestions: [
      '海外客户最常提到的痛点是什么？我现有的工具能否直接满足？',
      '语言交流主要卡在专业术语还是日常沟通？AI 辅助是否顺畅？'
    ]
  },
  {
    id: 'exp-30d-german-habit',
    title: '【30天微验证】德语基础学习节奏感知：评估真实时间精力投入',
    durationDays: 30,
    goal: '以最小时间成本亲身体验德语语法和发音逻辑，评估自己是否愿意为双元制路线投入 6~12 个月的系统语言周期。',
    maxBudgetRmb: 0,
    actionSteps: [
      '第 1~7 天：利用公开免费音视频或背词应用，完成德语发音字母表与基础拼读感知。',
      '第 8~20 天：每天投入 15~20 分钟学习 10~15 个基础词汇，了解基础名词性数概念（der/die/das）。',
      '第 21~30 天：尝试阅读一份歌德学院 A1 级别的公开样卷简单短文，感受语言掌握进度。'
    ],
    successMetric: '在 30 天内能保持相对稳定的练习习惯，对基础发音和简单日常词汇建立感觉。',
    stopLossCriteria: '若在 30 天中感到阻力极大且难以维持哪怕 15 分钟日常练习，说明纯德语环境当前心理负荷过高，可从容转向英语跳板路线，不必强行施压。',
    killCriteria: '若在 30 天中感到阻力极大且难以维持练习，建议从容转向英语跳板路线，不必强行施压。',
    linkedCareerId: 'occ-german-ausbildung-tech',
    linkedPathwayId: 'path-de-ausbildung',
    reflectionQuestions: [
      '每天 15~20 分钟的德语练习，对我的日常生活精力造成了怎样的影响？',
      '比起英语，德语语法规则是否让我感到挫败还是有逻辑成就感？',
      '如果在德语和专业技能之间分配时间，哪个更适合我当下的节奏？'
    ]
  }
];
