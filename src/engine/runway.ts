import { UserProfile, Pathway } from '../types';

export interface RunwayAnalysis {
  fixedMonthlyBurnRmb: number;
  netMonthlyCashflowRmb: number;
  survivalMonths: number;
  isSelfSustaining: boolean;
  healthLevel: 'Critical' | 'Warning' | 'Healthy' | 'Surplus' | 'Unspecified';
  healthLabel: string;
  emergencyFundDeficitRmb: number;
  survivalMonthsDisplay: string;
  statusKind: 'DEFICIT' | 'BALANCED' | 'SURPLUS' | 'UNRECORDED';
}

export function calculateRunway(profile: UserProfile): RunwayAnalysis {
  const rent = Math.max(0, profile.monthlyRentRmb || 0);
  const foodAndLife = Math.max(0, profile.monthlyFoodAndLifeRmb || 0);
  const income = Math.max(0, profile.currentMonthlyIncomeRmb || 0);
  const savings = Math.max(0, profile.currentSavingsRmb || 0);

  const fixedMonthlyBurnRmb = rent + foodAndLife;
  const netMonthlyCashflowRmb = income - fixedMonthlyBurnRmb;

  // 1. Unrecorded state
  if (fixedMonthlyBurnRmb === 0 && income === 0) {
    return {
      fixedMonthlyBurnRmb: 0,
      netMonthlyCashflowRmb: 0,
      survivalMonths: 0,
      isSelfSustaining: false,
      healthLevel: 'Unspecified',
      healthLabel: '收支待完善 (请填写入住城市与基础月开销)',
      emergencyFundDeficitRmb: 0,
      survivalMonthsDisplay: '待输入数据',
      statusKind: 'UNRECORDED'
    };
  }

  // 2. Surplus state (Net positive)
  if (netMonthlyCashflowRmb > 0) {
    return {
      fixedMonthlyBurnRmb,
      netMonthlyCashflowRmb,
      survivalMonths: 999,
      isSelfSustaining: true,
      healthLevel: 'Surplus',
      healthLabel: `每月稳定结余 +¥${netMonthlyCashflowRmb.toLocaleString()} (自给自足)`,
      emergencyFundDeficitRmb: Math.max(0, fixedMonthlyBurnRmb * 3 - savings),
      survivalMonthsDisplay: '持续自给自足',
      statusKind: 'SURPLUS'
    };
  }

  // 3. Balanced state (Net exactly 0)
  if (netMonthlyCashflowRmb === 0) {
    return {
      fixedMonthlyBurnRmb,
      netMonthlyCashflowRmb: 0,
      survivalMonths: savings > 0 && fixedMonthlyBurnRmb > 0 ? Number((savings / fixedMonthlyBurnRmb).toFixed(1)) : 0,
      isSelfSustaining: true,
      healthLevel: savings >= fixedMonthlyBurnRmb * 3 ? 'Healthy' : 'Warning',
      healthLabel: savings >= fixedMonthlyBurnRmb * 3
        ? '收支平衡 · 具备 3 个月以上应急储备'
        : '收支相抵 · 净现金流为零，建议控制额外支出',
      emergencyFundDeficitRmb: Math.max(0, fixedMonthlyBurnRmb * 3 - savings),
      survivalMonthsDisplay: savings > 0 ? `${(savings / (fixedMonthlyBurnRmb || 1)).toFixed(1)} 个月应急` : '无结余与应急',
      statusKind: 'BALANCED'
    };
  }

  // 4. Deficit state (Net negative)
  const burnRate = Math.abs(netMonthlyCashflowRmb);
  const survivalMonths = savings > 0 ? Number((savings / burnRate).toFixed(1)) : 0;

  let healthLevel: 'Critical' | 'Warning' | 'Healthy' = 'Healthy';
  let healthLabel = `较为平稳 (当前储蓄可支撑约 ${survivalMonths} 个月)`;

  if (savings <= 0) {
    healthLevel = 'Critical';
    healthLabel = '月度入不敷出且零储蓄，需优先稳固最低生存底盘';
  } else if (survivalMonths < 2) {
    healthLevel = 'Critical';
    healthLabel = `生存缓冲不足 2 个月 (仅剩约 ${survivalMonths} 个月)`;
  } else if (survivalMonths < 6) {
    healthLevel = 'Warning';
    healthLabel = `缓冲期有限 (可支撑约 ${survivalMonths} 个月)`;
  }

  return {
    fixedMonthlyBurnRmb,
    netMonthlyCashflowRmb,
    survivalMonths,
    isSelfSustaining: false,
    healthLevel,
    healthLabel,
    emergencyFundDeficitRmb: Math.max(0, fixedMonthlyBurnRmb * 3 - savings),
    survivalMonthsDisplay: `${survivalMonths} 个月`,
    statusKind: 'DEFICIT'
  };
}

export function evaluatePathwayRunwayGating(pathway: Pathway, profile: UserProfile): {
  isBlocked: boolean;
  requiredCapital: number;
  currentCapital: number;
  gapRmb: number;
  reason: string;
} {
  const currentSavings = Math.max(0, profile.currentSavingsRmb || 0);
  const gapRmb = Math.max(0, pathway.minCapitalRmb - currentSavings);
  const isBlocked = gapRmb > 15000 && pathway.nodes.some(n => n.cashflowType === '重度资本消耗');

  return {
    isBlocked,
    requiredCapital: pathway.minCapitalRmb,
    currentCapital: currentSavings,
    gapRmb,
    reason: isBlocked
      ? `该路线启动资金参考为 ¥${pathway.minCapitalRmb.toLocaleString()}，你当前储蓄为 ¥${currentSavings.toLocaleString()}，尚存 ¥${gapRmb.toLocaleString()} 缺口。建议先通过前期轻量任务建立资金蓄水池，避免过早面临资金压力。`
      : '资金门槛处于可逐步筹备或自给自足区间。'
  };
}
