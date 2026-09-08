import { UserProfile, Occupation, Pathway, ScoreExplanation, FreshnessStatus } from '../types';
import { evaluatePathwayFreshnessGate } from './freshnessEngine';

export function calculateOccupationMatchScore(occupation: Occupation, profile: UserProfile): number {
  let score = 55;

  // 1. Entry Degree
  if (occupation.entryDegree === '大专可入' || occupation.entryDegree === '无需学历') {
    score += 12;
  } else if (occupation.entryDegree === '本科优先') {
    score -= 8;
  } else if (occupation.entryDegree === '必须本科及以上') {
    score -= 25;
  }

  // 2. Remote & Free time preference
  const freeTimeWeight = profile.preferences?.weights?.freeTimeWeight ?? profile.weights?.freeTimeWeight ?? 8;
  if (occupation.remotePossibility === '全远程') {
    score += 15 * (freeTimeWeight / 10);
  } else if (occupation.remotePossibility === '混合远程') {
    score += 8 * (freeTimeWeight / 10);
  } else {
    score -= 6;
  }

  // 3. Qualification friction
  if (occupation.qualificationFriction === 'Low') {
    score += 12;
  } else if (occupation.qualificationFriction === 'Medium') {
    score += 4;
  } else if (occupation.qualificationFriction === 'High') {
    score -= 12;
  } else if (occupation.qualificationFriction === 'Very High') {
    score -= 25;
  }

  // 4. Learning cost & startup capital friction
  const cashflowWeight = profile.preferences?.weights?.cashflowWeight ?? profile.weights?.cashflowWeight ?? 8;
  if (occupation.learningCostRmb <= 2000) {
    score += 10 * (cashflowWeight / 10);
  } else if (occupation.learningCostRmb > 20000) {
    score -= 16 * (cashflowWeight / 10);
  }

  // 5. English & 2nd language burden
  const learningCostWeight = profile.preferences?.weights?.learningCostWeight ?? profile.weights?.learningCostWeight ?? 8;
  if (occupation.englishRequirement.includes('1500') || occupation.englishRequirement.includes('无要求') || occupation.englishRequirement.includes('翻译工具')) {
    score += 6;
  } else if (occupation.englishRequirement.includes('6.0') || occupation.englishRequirement.includes('6.5')) {
    score -= 10 * (learningCostWeight / 10);
  }

  // 6. Global mobility & PR
  const prWeight = profile.preferences?.weights?.prWeight ?? profile.weights?.prWeight ?? 8;
  if (occupation.prCorrelation === '高') {
    score += 10 * (prWeight / 10);
  } else if (occupation.prCorrelation === '无直接可能') {
    score -= 12;
  }

  // 7. Background affinity
  if (occupation.category === 'Digital & 3D') {
    score += 8;
  } else if (occupation.category === 'AI & Software') {
    score += 6;
  }

  return Math.min(95, Math.max(15, Math.round(score)));
}

export interface PathwayScoringDetails {
  score: number;
  explanation: ScoreExplanation;
  freshnessStatus: FreshnessStatus;
  isProvisional: boolean;
  excludeFromTop: boolean;
  profileConditionalStatement: string;
}

/**
 * Multi-vector calibrated pathway feasibility scoring.
 * Separates 4 core dimensions:
 * 1. preferenceScore (0~100)
 * 2. readinessScore (0~100)
 * 3. qualificationStatus (NOW_ELIGIBLE | CONDITIONAL | INFO_INSUFFICIENT | NOT_CURRENTLY_SUITABLE)
 * 4. evidenceCompleteness (0~100)
 */
export function calculateDynamicPathwayFeasibilityDetailed(
  pathway: Pathway, 
  profile: UserProfile,
  latestSnapshotOverride?: any,
  asOfTimeMs?: number
): PathwayScoringDetails {
  const positiveDrivers: string[] = [];
  const negativeDrivers: string[] = [];
  const hardConstraintFailures: string[] = [];

  // 1. Extract Profile Constraints & Preferences
  const savings = profile.hardConstraints?.currentSavingsRmb ?? profile.currentSavingsRmb ?? 0;
  const education = profile.hardConstraints?.education ?? profile.education ?? '全日制大专 (专科)';
  const birthYear = profile.hardConstraints?.birthYear ?? profile.birthYear ?? 2002;
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthYear;
  const englishVocab = profile.hardConstraints?.englishVocabEstimate ?? profile.englishVocabEstimate ?? 2000;
  const monthlyRent = profile.hardConstraints?.monthlyRentRmb ?? profile.monthlyRentRmb ?? 0;
  const monthlyLiving = profile.hardConstraints?.monthlyFoodAndLifeRmb ?? profile.monthlyFoodAndLifeRmb ?? 0;
  const monthlyIncome = profile.hardConstraints?.currentMonthlyIncomeRmb ?? profile.currentMonthlyIncomeRmb ?? 0;

  const cashflowWeight = profile.preferences?.weights?.cashflowWeight ?? profile.weights?.cashflowWeight ?? 8;
  const freeTimeWeight = profile.preferences?.weights?.freeTimeWeight ?? profile.weights?.freeTimeWeight ?? 8;
  const mobilityWeight = profile.preferences?.weights?.mobilityWeight ?? profile.weights?.mobilityWeight ?? 8;
  const prWeight = profile.preferences?.weights?.prWeight ?? profile.weights?.prWeight ?? 8;

  // 2. Hard Constraints Validation
  // Age check for WHV
  if (pathway.id === 'path-nz-whv' && (currentAge < 18 || currentAge > 30)) {
    hardConstraintFailures.push(`新西兰 WHV 签证法定年龄严格限制在 18-30 周岁（当前计算年龄：${currentAge} 岁）`);
    negativeDrivers.push(`年龄超出 WHV 法定申请窗口 (-40)`);
  }

  // Capital deficit calculation
  const capitalGap = Math.max(0, pathway.minCapitalRmb - savings);
  if (capitalGap > 0) {
    hardConstraintFailures.push(`资金储备缺口：当前可用储蓄 ¥${savings.toLocaleString()} 低于启动门槛 ¥${pathway.minCapitalRmb.toLocaleString()} (尚缺 ¥${capitalGap.toLocaleString()})`);
    negativeDrivers.push(`可用储蓄低于启动资金门槛 (缺口 ¥${capitalGap.toLocaleString()})`);
  } else if (savings >= pathway.minCapitalRmb * 2) {
    positiveDrivers.push(`储蓄充裕，超过最低启动资金 2 倍 (+5)`);
  }

  // Runway Cashflow buffer
  const monthlyBurn = monthlyRent + monthlyLiving - monthlyIncome;
  if (monthlyBurn > 0) {
    const runwayMonths = monthlyBurn > 0 ? savings / monthlyBurn : 999;
    if (runwayMonths < 3) {
      negativeDrivers.push(`当前月度净现金流为负且可支配生存缓冲不足 3 个月 (-6)`);
    }
  } else {
    positiveDrivers.push(`当前每月收支自给自足，具备平稳打持久战底盘 (+5)`);
  }

  // 3. Compute 4 Distinct Dimensions
  // A. Preference Score (0~100)
  let prefScore = 70;
  if (pathway.category === 'Dual Vocational / Ausbildung') {
    if (education.includes('大专') || education.includes('专科')) {
      prefScore += 8;
      positiveDrivers.push(`专科学历在德国双元制职业培训体系中受认可 (+8)`);
    }
    if (prWeight >= 7) {
      prefScore += 6;
      positiveDrivers.push(`偏好海外长期居留：德国双元制后续工作居留路径清晰 (+6)`);
    }
    if (mobilityWeight >= 7) {
      prefScore += 5;
    }
  } else if (pathway.category === 'AI & Remote Launch') {
    if (freeTimeWeight >= 7) {
      prefScore += 10;
      positiveDrivers.push(`偏好自主时间与弹性：本土居家远程极大降低通勤与坐班损耗 (+10)`);
    }
    if (cashflowWeight >= 7 && savings < 30000) {
      prefScore += 8;
      positiveDrivers.push(`重视现金流安全：在低启动本金阶段极低前期沉没成本 (+8)`);
    }
  } else if (pathway.category === 'Stepping Stone') {
    if (englishVocab >= 2000) {
      prefScore += 5;
      positiveDrivers.push(`词汇量具备基础商业英文交流底子 (+5)`);
    }
    if (mobilityWeight >= 7) {
      prefScore += 6;
    }
  } else if (pathway.category === 'Working Holiday') {
    if (mobilityWeight >= 8) {
      prefScore += 6;
    }
  }

  // Capital empowerment bonus for overseas transitions
  if (savings >= pathway.minCapitalRmb * 2 && pathway.targetCountry !== '中国 (远程/自由职业)') {
    prefScore += 6;
    positiveDrivers.push(`资金储备充裕，已完全跨越本路线启动壁垒 (+6)`);
  }

  const preferenceScore = Math.min(95, Math.max(30, prefScore));

  // B. Readiness Score (0~100)
  let capitalReadiness = 100;
  if (capitalGap > 0) {
    const deficitRatio = capitalGap / Math.max(1, pathway.minCapitalRmb);
    capitalReadiness = Math.max(15, Math.round(100 - deficitRatio * 65));
  } else if (savings >= pathway.minCapitalRmb * 2) {
    capitalReadiness = 100;
  }

  let languageReadiness = 80;
  if (pathway.targetCountry === '德国') {
    // Requires German B1 from scratch; ample savings unlocks dedicated professional language prep
    languageReadiness = savings >= 50000 ? 75 : 55;
  } else if (pathway.targetCountry === '日本') {
    languageReadiness = savings >= 50000 ? 80 : 65; // Kanji advantage for N4
  } else if (pathway.targetCountry === '新西兰') {
    languageReadiness = englishVocab >= 3000 ? 80 : 60;
  } else if (pathway.targetCountry === '中国 (远程/自由职业)') {
    languageReadiness = 95;
  }

  const readinessScore = Math.min(98, Math.max(15, Math.round(capitalReadiness * 0.7 + languageReadiness * 0.3)));

  // C. Qualification Status
  let qualificationStatus: ScoreExplanation['qualificationStatus'] = 'NOW_ELIGIBLE';
  let qualificationStatusLabel = '现在可开始规划尝试';

  if (hardConstraintFailures.some(f => f.includes('年龄'))) {
    qualificationStatus = 'NOT_CURRENTLY_SUITABLE';
    qualificationStatusLabel = '超出法定申请年龄窗口';
  } else if (capitalGap > 0) {
    qualificationStatus = 'CONDITIONAL';
    qualificationStatusLabel = `资金尚存缺口 ¥${capitalGap.toLocaleString()}`;
  } else if (pathway.targetCountry === '德国' && languageReadiness < 70) {
    qualificationStatus = 'CONDITIONAL';
    qualificationStatusLabel = '需前置系统备战德语 B1';
  }

  // D. Evidence Completeness (Freshness Engine)
  const freshnessGate = evaluatePathwayFreshnessGate(pathway, latestSnapshotOverride, profile, asOfTimeMs);
  let evidenceCompleteness = 90;
  let freshnessGatePassed = freshnessGate.gatePassed;
  let isProvisional = freshnessGate.isProvisional;
  let excludeFromTop = freshnessGate.excludeFromTop;
  let confidenceLabel: 'HIGH' | 'PROVISIONAL' | 'EXCLUDED' = 'HIGH';

  if (freshnessGate.freshnessStatus === 'EXPIRED') {
    confidenceLabel = 'EXCLUDED';
    excludeFromTop = true;
    evidenceCompleteness = 25;
    negativeDrivers.push(`[RULE-46] 核心政策事实已超期失效 (${freshnessGate.ageHours}h)，降级并从主推荐中排除`);
  } else if (freshnessGate.freshnessStatus === 'STALE') {
    confidenceLabel = 'PROVISIONAL';
    isProvisional = true;
    evidenceCompleteness = 55;
    negativeDrivers.push(`[RULE-50] 核心官方事实进入 STALE 观察期 (${freshnessGate.ageHours}h)，降为 PROVISIONAL 临时研判`);
  } else if (freshnessGate.freshnessStatus === 'AGING') {
    evidenceCompleteness = 80;
    positiveDrivers.push(`官方政策处于正常生命周期 (${freshnessGate.ageHours}h)`);
  } else if (freshnessGate.freshnessStatus === 'FRESH') {
    evidenceCompleteness = 95;
    positiveDrivers.push(`官方政策一手核验新鲜`);
  }

  if (hardConstraintFailures.length > 0) {
    confidenceLabel = 'PROVISIONAL';
  }

  // E. Calibrated Weighted Composite Score (0~100)
  // 35% Preference + 50% Readiness + 15% Evidence Completeness
  let composite = Math.round(preferenceScore * 0.35 + readinessScore * 0.50 + evidenceCompleteness * 0.15);

  if (excludeFromTop) {
    composite = Math.min(composite, 30);
  } else if (isProvisional && hardConstraintFailures.length > 0) {
    composite = Math.min(composite, 78);
  }

  const finalScore = Math.min(96, Math.max(15, composite));

  const profileConditionSummary = `画像基准：${education} · 储蓄 ¥${savings.toLocaleString()} · 词汇量约 ${englishVocab}`;
  const profileConditionalStatement = `基于${profileConditionSummary}与当前已核验政策，该路线综合匹配分为 ${finalScore} / 100 (${qualificationStatusLabel})。`;

  const explanation: ScoreExplanation = {
    baseScore: pathway.feasibilityScore,
    finalScore,
    preferenceScore,
    readinessScore,
    qualificationStatus,
    qualificationStatusLabel,
    evidenceCompleteness,
    capitalGapRmb: capitalGap,
    freshnessGatePassed,
    freshnessStatus: freshnessGate.freshnessStatus,
    isProvisional,
    confidenceLabel,
    positiveDrivers,
    negativeDrivers,
    hardConstraintsPassed: hardConstraintFailures.length === 0,
    hardConstraintFailures: hardConstraintFailures.length > 0 ? hardConstraintFailures : undefined,
    profileConditionSummary
  };

  return {
    score: finalScore,
    explanation,
    freshnessStatus: freshnessGate.freshnessStatus,
    isProvisional,
    excludeFromTop,
    profileConditionalStatement
  };
}

export function calculateDynamicPathwayFeasibility(
  pathway: Pathway, 
  profile: UserProfile,
  latestSnapshotOverride?: any,
  asOfTimeMs?: number
): number {
  return calculateDynamicPathwayFeasibilityDetailed(pathway, profile, latestSnapshotOverride, asOfTimeMs).score;
}

export function rankPathways(
  pathways: Pathway[], 
  profile: UserProfile,
  snapshotOverrides?: Record<string, any>,
  asOfTimeMs?: number
): Pathway[] {
  const scored = pathways.map(p => {
    const override = snapshotOverrides ? snapshotOverrides[p.id] : undefined;
    const details = calculateDynamicPathwayFeasibilityDetailed(p, profile, override, asOfTimeMs);
    
    let adjustedWhyRecommended = p.whyRecommended;
    if (details.isProvisional && !adjustedWhyRecommended.startsWith('【临时研判】')) {
      adjustedWhyRecommended = `【临时研判/数据待复核】` + adjustedWhyRecommended;
    } else if (details.excludeFromTop && !adjustedWhyRecommended.startsWith('【已超期失效】')) {
      adjustedWhyRecommended = `【已超期失效/等待重新核验】` + adjustedWhyRecommended;
    }

    return {
      ...p,
      feasibilityScore: details.score,
      freshnessStatus: details.freshnessStatus,
      isProvisional: details.isProvisional,
      excludeFromTop: details.excludeFromTop,
      scoreExplanation: details.explanation,
      profileConditionalStatement: details.profileConditionalStatement,
      whyRecommended: adjustedWhyRecommended
    };
  });

  // Strict deterministic sorting:
  // 1. Excluded items always sink to bottom
  // 2. Higher composite feasibility score ranks first
  // 3. If scores are close (within 2 points), favor routes with 0 capital gap
  return scored.sort((a, b) => {
    if (a.excludeFromTop && !b.excludeFromTop) return 1;
    if (!a.excludeFromTop && b.excludeFromTop) return -1;

    const diff = b.feasibilityScore - a.feasibilityScore;
    if (Math.abs(diff) <= 2) {
      const aGap = a.scoreExplanation?.capitalGapRmb ?? 0;
      const bGap = b.scoreExplanation?.capitalGapRmb ?? 0;
      if (aGap === 0 && bGap > 0) return -1;
      if (bGap === 0 && aGap > 0) return 1;
    }

    return diff;
  });
}
