import { UserProfile, UserPlanTask } from '../types';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: '探路者 (Demo Profile)',
  birthYear: 2002,
  education: '全日制大专 (专科)',
  school: '某高职院校 (样例)',
  major: '数字媒体与设计 (样例)',
  gpa: 80,
  englishVocabEstimate: 2000,
  currentSavingsRmb: 5000,
  monthlyRentRmb: 1200,
  monthlyFoodAndLifeRmb: 1300,
  currentMonthlyIncomeRmb: 4000,
  currentRemoteHoursPerWeek: 25,
  targetDateBaseline: '2026-09-07',
  weights: {
    cashflowWeight: 9.5,
    freeTimeWeight: 9.0,
    hourlyWageWeight: 8.5,
    mobilityWeight: 8.8,
    prWeight: 8.2,
    learningCostWeight: 8.0
  }
};

export const DEFAULT_INITIAL_TASKS: UserPlanTask[] = [
  {
    id: 'task-01',
    title: '锁定居家数字资产制作与设计外包流水，稳定本月现金流',
    period: 'today',
    status: 'in_progress',
    whyNow: '目前处于起步蓄水期，刚性支出需要稳定自给。保住居家远程收入才能买来不被强制坐班绑架的自由学习时间。',
    linkedPathwayId: 'path-de-ausbildung'
  },
  {
    id: 'task-02',
    title: '完成今日 45 分钟实用英语/德语双轨打卡',
    period: 'today',
    status: 'todo',
    whyNow: '外语词汇量是目前所有海外路线（包括出国、外包接单）的通用基础设施，每日 45 分钟属于零后悔高复利投资。'
  },
  {
    id: 'task-03',
    title: '验证 Blender 结合 AI 快速拓扑工具链（执行 7 天小实验）',
    period: 'week',
    status: 'todo',
    whyNow: '提高单件资产制作速度 40%，直接将有效时薪从基础水平拉升至更高收益区间。',
    linkedPathwayId: 'path-cn-remote-studio'
  },
  {
    id: 'task-04',
    title: '在 Upwork/Fiverr 建立 3D 资产展示页面并提交 3 个提案',
    period: '30d',
    status: 'todo',
    whyNow: '验证是否存在直接赚取美元远程订单的真实可能，为后续数字游民或欧洲路线做准备。',
    linkedPathwayId: 'path-my-digital-nomad'
  },
  {
    id: 'task-05',
    title: '完成歌德德语 A1 或日语 N4 基础入门测试评估',
    period: '90d',
    status: 'todo',
    whyNow: '触发 90 天路线 Kill Criteria：根据真实语言学习反馈决定是否全力押注德国双元制或转向其他路线。',
    linkedPathwayId: 'path-de-ausbildung'
  }
];
