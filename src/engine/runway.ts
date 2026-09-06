import { UserProfile, Pathway } from '../types';

export interface RunwayAnalysis {
  fixedMonthlyBurnRmb: number;
  netMonthlyCashflowRmb: number;
  survivalMonths: number;
  isSelfSustaining: boolean;
  healthLevel: 'Critical' | 'Warning' | 'Healthy' | 'Surplus';
  healthLabel: string;
  emergencyFundDeficitRmb: number;
}

export function calculateRunway(profile: UserProfile): RunwayAnalysis {
  const fixedMonthlyBurnRmb = (profile.monthlyRentRmb || 0) + (profile.monthlyFoodAndLifeRmb || 0);
  const netMonthlyCashflowRmb = (profile.currentMonthlyIncomeRmb || 0) - fixedMonthlyBurnRmb;
  const currentSavings = profile.currentSavingsRmb || 0;

  if (netMonthlyCashflowRmb >= 0) {
    return {
      fixedMonthlyBurnRmb,
      netMonthlyCashflowRmb,
      survivalMonths: 999,
      isSelfSustaining: true,
      healthLevel: 'Surplus',
      healthLabel: '现金流持续净流入 (自给自足)',
      emergencyFundDeficitRmb: Math.max(0, fixedMonthlyBurnRmb * 3 - currentSavings)
    };
  }

  const burnRate = Math.abs(netMonthlyCashflowRmb);
  const survivalMonths = burnRate > 0 ? Number((currentSavings / burnRate).toFixed(1)) : 0;

  let healthLevel: 'Critical' | 'Warning' | 'Healthy' = 'Healthy';
  let healthLabel = '较为平稳 (可支撑 6 个月以上)';

  if (survivalMonths < 2) {
    healthLevel = 'Critical';
    healthLabel = '极度危险 (生存缓冲不足 2 个月)';
  } else if (survivalMonths < 6) {
    healthLevel = 'Warning';
    healthLabel = '警戒状态 (仅能支撑 2~6 个月)';
  }

  return {
    fixedMonthlyBurnRmb,
    netMonthlyCashflowRmb,
    survivalMonths,
    isSelfSustaining: false,
    healthLevel,
    healthLabel,
    emergencyFundDeficitRmb: Math.max(0, fixedMonthlyBurnRmb * 3 - currentSavings)
  };
}

export function evaluatePathwayRunwayGating(pathway: Pathway, profile: UserProfile): {
  isBlocked: boolean;
  requiredCapital: number;
  currentCapital: number;
  gapRmb: number;
  reason: string;
} {
  const currentSavings = profile.currentSavingsRmb || 0;
  const gapRmb = Math.max(0, pathway.minCapitalRmb - currentSavings);
  const isBlocked = gapRmb > 15000 && pathway.nodes.some(n => n.cashflowType === '重度资本消耗');

  return {
    isBlocked,
    requiredCapital: pathway.minCapitalRmb,
    currentCapital: currentSavings,
    gapRmb,
    reason: isBlocked
      ? `该路线启动资金门槛为 ¥${pathway.minCapitalRmb.toLocaleString()}，你当前储蓄为 ¥${currentSavings.toLocaleString()}，存在 ¥${gapRmb.toLocaleString()} 缺口。在未完成第一阶段资金蓄水前不可贸然脱产启动。`
      : '资金门槛在可承受或可分段自给自足范围内。'
  };
}
