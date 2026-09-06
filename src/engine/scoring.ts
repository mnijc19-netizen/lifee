import { UserProfile, Occupation, Pathway, ScoreExplanation, FreshnessStatus } from '../types';
import { evaluatePathwayFreshnessGate } from './freshnessEngine';

export function calculateOccupationMatchScore(occupation: Occupation, profile: UserProfile): number {
  let score = 50;

  // 1. Entry Degree
  if (occupation.entryDegree === '大专可入' || occupation.entryDegree === '无需学历') {
    score += 15;
  } else if (occupation.entryDegree === '本科优先') {
    score -= 10;
  } else if (occupation.entryDegree === '必须本科及以上') {
    score -= 35;
  }

  // 2. Remote & Free time preference
  const freeTimeWeight = profile.preferences?.weights?.freeTimeWeight ?? profile.weights?.freeTimeWeight ?? 8;
  if (occupation.remotePossibility === '全远程') {
    score += 18 * (freeTimeWeight / 10);
  } else if (occupation.remotePossibility === '混合远程') {
    score += 10 * (freeTimeWeight / 10);
  } else {
    score -= 5;
  }

  // 3. Qualification friction
  if (occupation.qualificationFriction === 'Low') {
    score += 15;
  } else if (occupation.qualificationFriction === 'Medium') {
    score += 5;
  } else if (occupation.qualificationFriction === 'High') {
    score -= 15;
  } else if (occupation.qualificationFriction === 'Very High') {
    score -= 30;
  }

  // 4. Learning cost & startup capital friction
  const cashflowWeight = profile.preferences?.weights?.cashflowWeight ?? profile.weights?.cashflowWeight ?? 8;
  if (occupation.learningCostRmb <= 2000) {
    score += 12 * (cashflowWeight / 10);
  } else if (occupation.learningCostRmb > 20000) {
    score -= 20 * (cashflowWeight / 10);
  }

  // 5. English & 2nd language burden
  const learningCostWeight = profile.preferences?.weights?.learningCostWeight ?? profile.weights?.learningCostWeight ?? 8;
  if (occupation.englishRequirement.includes('1500') || occupation.englishRequirement.includes('无要求') || occupation.englishRequirement.includes('翻译工具')) {
    score += 8;
  } else if (occupation.englishRequirement.includes('6.0') || occupation.englishRequirement.includes('6.5')) {
    score -= 12 * (learningCostWeight / 10);
  }

  // 6. Global mobility & PR
  const prWeight = profile.preferences?.weights?.prWeight ?? profile.weights?.prWeight ?? 8;
  if (occupation.prCorrelation === '高') {
    score += 12 * (prWeight / 10);
  } else if (occupation.prCorrelation === '无直接可能') {
    score -= 15;
  }

  // 7. Background affinity
  if (occupation.category === 'Digital & 3D') {
    score += 10;
  } else if (occupation.category === 'AI & Software') {
    score += 8;
  }

  return Math.min(99, Math.max(15, Math.round(score)));
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
 * RULE-56, 57, 58, 46, 50: Detailed dynamic feasibility scoring with explainability and freshness gate.
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

  const baseScore = pathway.feasibilityScore;
  let score = baseScore;

  // Extract Hard Constraints (RULE-57)
  const savings = profile.hardConstraints?.currentSavingsRmb ?? profile.currentSavingsRmb ?? 0;
  const education = profile.hardConstraints?.education ?? profile.education ?? '全日制大专 (专科)';
  const birthYear = profile.hardConstraints?.birthYear ?? profile.birthYear ?? 2002;
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthYear;
  const englishVocab = profile.hardConstraints?.englishVocabEstimate ?? profile.englishVocabEstimate ?? 2000;
  const monthlyRent = profile.hardConstraints?.monthlyRentRmb ?? profile.monthlyRentRmb ?? 0;
  const monthlyLiving = profile.hardConstraints?.monthlyFoodAndLifeRmb ?? profile.monthlyFoodAndLifeRmb ?? 0;
  const monthlyIncome = profile.hardConstraints?.currentMonthlyIncomeRmb ?? profile.currentMonthlyIncomeRmb ?? 0;

  // Extract Preferences (RULE-57)
  const cashflowWeight = profile.preferences?.weights?.cashflowWeight ?? profile.weights?.cashflowWeight ?? 8;
  const freeTimeWeight = profile.preferences?.weights?.freeTimeWeight ?? profile.weights?.freeTimeWeight ?? 8;
  const mobilityWeight = profile.preferences?.weights?.mobilityWeight ?? profile.weights?.mobilityWeight ?? 8;
  const prWeight = profile.preferences?.weights?.prWeight ?? profile.weights?.prWeight ?? 8;

  // 1. Hard Constraints Validation (RULE-57)
  // Check Age limits (e.g. Working Holiday visa has age 18-30 hard ceiling)
  if (pathway.id === 'path-nz-whv' && (currentAge < 18 || currentAge > 30)) {
    hardConstraintFailures.push(`新西兰 WHV 签证法定年龄严格限制在 18-30 周岁（当前计算年龄：${currentAge} 岁）`);
    negativeDrivers.push(`年龄超出 WHV 法定申请窗口 (-40)`);
    score -= 40;
  }

  // Capital adequacy check
  if (savings < pathway.minCapitalRmb) {
    const deficit = pathway.minCapitalRmb - savings;
    hardConstraintFailures.push(`启动资金缺口：当前可用储蓄 ¥${savings.toLocaleString()} 低于该路线启动门槛 ¥${pathway.minCapitalRmb.toLocaleString()} (缺口 ¥${deficit.toLocaleString()})`);
    const deficitRatio = deficit / pathway.minCapitalRmb;
    const penalty = Math.min(30, Math.round(deficitRatio * 25));
    score -= penalty;
    negativeDrivers.push(`可用储蓄低于启动资金门槛 (-${penalty})`);
  } else if (savings >= pathway.minCapitalRmb * 2) {
    score += 5;
    positiveDrivers.push(`储蓄充裕，超过最低启动资金 2 倍 (+5)`);
  }

  // Monthly Runway buffer
  const monthlyBurn = monthlyRent + monthlyLiving - monthlyIncome;
  if (monthlyBurn > 0) {
    const runwayMonths = savings / monthlyBurn;
    if (runwayMonths < 3) {
      score -= 8;
      negativeDrivers.push(`当前月度净现金流为负且可支配生存缓冲不足 3 个月 (-8)`);
    }
  } else {
    positiveDrivers.push(`当前每月收入自给自足 (净现金流平衡/为正)，具备低消耗打持久战底盘 (+6)`);
    score += 6;
  }

  // Category / Route Specific Drivers
  if (pathway.category === 'Dual Vocational / Ausbildung') {
    if (education.includes('大专') || education.includes('专科')) {
      positiveDrivers.push(`大专学历通过德国商会 ZAB/IHK 认证门槛低，与双元制职业技术高度适配 (+10)`);
      score += 10;
    }
    positiveDrivers.push(`在德培训期间 0 学费且由企业按月发放实训津贴，彻底阻断自保金断粮风险 (+8)`);
    score += 8;
  } else if (pathway.category === 'AI & Remote Launch') {
    positiveDrivers.push(`本土居家数字化资产制作，无需前期重资产沉没成本与签证审批周期 (+12)`);
    score += 12;
  } else if (pathway.category === 'Stepping Stone') {
    if (englishVocab >= 2000) {
      positiveDrivers.push(`词汇量满足马来西亚 DE Rantau 商业英语基础，生活成本仅为欧美 1/3 (+7)`);
      score += 7;
    }
  }

  // Preferences impact
  if (cashflowWeight >= 8 && pathway.minCapitalRmb <= 5000) {
    score += 5;
    positiveDrivers.push(`极度偏好现金流安全：本路线前期资金启动门槛极低 (+5)`);
  }
  if (mobilityWeight >= 8 && pathway.targetCountry !== '中国') {
    score += 4;
    positiveDrivers.push(`追求全球自由流动与海外永居可能 (+4)`);
  }
  if (prWeight >= 8 && (pathway.category === 'Dual Vocational / Ausbildung' || pathway.category === 'Skilled Tech')) {
    score += 5;
    positiveDrivers.push(`德国双元制毕业后居留与永居通道法律清晰 (+5)`);
  }

  // 2. Freshness Gate (RULE-46, RULE-50)
  const freshnessGate = evaluatePathwayFreshnessGate(pathway, latestSnapshotOverride, profile, asOfTimeMs);
  let freshnessGatePassed = freshnessGate.gatePassed;
  let isProvisional = freshnessGate.isProvisional;
  let excludeFromTop = freshnessGate.excludeFromTop;
  let confidenceLabel: 'HIGH' | 'PROVISIONAL' | 'EXCLUDED' = 'HIGH';

  if (freshnessGate.freshnessStatus === 'EXPIRED') {
    confidenceLabel = 'EXCLUDED';
    excludeFromTop = true;
    score = Math.min(score, 30);
    negativeDrivers.push(`[RULE-46] 核心政策事实已超期失效 (${freshnessGate.ageHours}h)，降级并从主推荐中排除 (-35)`);
  } else if (freshnessGate.freshnessStatus === 'STALE') {
    confidenceLabel = 'PROVISIONAL';
    isProvisional = true;
    score -= 15;
    negativeDrivers.push(`[RULE-50] 核心官方事实进入 STALE 观察期 (${freshnessGate.ageHours}h)，降为 PROVISIONAL 临时研判 (-15)`);
  } else if (freshnessGate.freshnessStatus === 'AGING') {
    confidenceLabel = 'HIGH';
    positiveDrivers.push(`官方政策数据处于正常有效生命周期 (${freshnessGate.ageHours}h)`);
  } else if (freshnessGate.freshnessStatus === 'FRESH') {
    confidenceLabel = 'HIGH';
    positiveDrivers.push(`官方一手数据高度新鲜 (刚刚核验)`);
  }

  const hardConstraintsPassed = hardConstraintFailures.length === 0;
  if (!hardConstraintsPassed) {
    confidenceLabel = 'PROVISIONAL';
  }

  const finalScore = Math.min(99, Math.max(10, Math.round(score)));

  // Profile-conditional statement (RULE-56)
  const profileConditionSummary = `当前画像：${education} / ${englishVocab}词汇 / 储蓄¥${savings.toLocaleString()}`;
  const profileConditionalStatement = `以${profileConditionSummary}与最新已核验证据，本路线动态可行性评分为 ${finalScore} 分。`;

  const explanation: ScoreExplanation = {
    baseScore,
    finalScore,
    freshnessGatePassed,
    freshnessStatus: freshnessGate.freshnessStatus,
    isProvisional,
    confidenceLabel,
    positiveDrivers,
    negativeDrivers,
    hardConstraintsPassed,
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
    
    // Modify whyRecommended if provisional or excluded to prevent false "Strong Recommendation" (RULE-50, 63)
    let adjustedWhyRecommended = p.whyRecommended;
    if (details.isProvisional && !adjustedWhyRecommended.startsWith('【临时研判】')) {
      adjustedWhyRecommended = `【临时研判/数据待复核】` + adjustedWhyRecommended;
    } else if (details.excludeFromTop && !adjustedWhyRecommended.startsWith('【已过期停用】')) {
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

  // RULE-63: STALE_CRITICAL_FACT_CANNOT_DRIVE_TOP_RECOMMENDATION
  // Sort so that:
  // 1. Excluded items are strictly placed at the bottom
  // 2. Valid/Fresh items with passing hard constraints are prioritized over Provisional/Stale items
  // 3. Higher feasibility score first
  return scored.sort((a, b) => {
    // Excluded from top always goes to bottom
    if (a.excludeFromTop && !b.excludeFromTop) return 1;
    if (!a.excludeFromTop && b.excludeFromTop) return -1;

    // RULE-63: Stale/Provisional cannot drive top recommendation over a valid Fresh pathway
    // If one is provisional (stale) and the other is fresh and passes hard constraints, prioritize the fresh one
    const aFreshPassed = !a.isProvisional && a.scoreExplanation?.hardConstraintsPassed;
    const bFreshPassed = !b.isProvisional && b.scoreExplanation?.hardConstraintsPassed;

    if (aFreshPassed && !bFreshPassed) {
      if (b.feasibilityScore - a.feasibilityScore < 25) return -1;
    } else if (!aFreshPassed && bFreshPassed) {
      if (a.feasibilityScore - b.feasibilityScore < 25) return 1;
    }

    return b.feasibilityScore - a.feasibilityScore;
  });
}
