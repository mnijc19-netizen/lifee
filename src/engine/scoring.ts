import { UserProfile, Occupation, Pathway } from '../types';

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
  if (occupation.remotePossibility === '全远程') {
    score += 18 * (profile.weights.freeTimeWeight / 10);
  } else if (occupation.remotePossibility === '混合远程') {
    score += 10 * (profile.weights.freeTimeWeight / 10);
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
  if (occupation.learningCostRmb <= 2000) {
    score += 12 * (profile.weights.cashflowWeight / 10);
  } else if (occupation.learningCostRmb > 20000) {
    score -= 20 * (profile.weights.cashflowWeight / 10);
  }

  // 5. English & 2nd language burden
  if (occupation.englishRequirement.includes('1500') || occupation.englishRequirement.includes('无要求') || occupation.englishRequirement.includes('翻译工具')) {
    score += 8;
  } else if (occupation.englishRequirement.includes('6.0') || occupation.englishRequirement.includes('6.5')) {
    score -= 12 * (profile.weights.learningCostWeight / 10);
  }

  // 6. Global mobility & PR
  if (occupation.prCorrelation === '高') {
    score += 12 * (profile.weights.prWeight / 10);
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

export function calculateDynamicPathwayFeasibility(pathway: Pathway, profile: UserProfile): number {
  let score = pathway.feasibilityScore;
  const savings = profile.currentSavingsRmb || 0;
  
  // 1. Capital adequacy penalty/bonus
  if (savings < pathway.minCapitalRmb) {
    const deficitRatio = (pathway.minCapitalRmb - savings) / pathway.minCapitalRmb;
    score -= Math.min(30, Math.round(deficitRatio * 25));
  } else if (savings >= pathway.minCapitalRmb * 2) {
    score += 5;
  }

  // 2. Monthly Runway buffer
  const monthlyRent = profile.monthlyRentRmb || 0;
  const monthlyLiving = profile.monthlyFoodAndLifeRmb || 0;
  const monthlyIncome = profile.currentMonthlyIncomeRmb || 0;
  const monthlyBurn = monthlyRent + monthlyLiving - monthlyIncome;
  if (monthlyBurn > 0) {
    const runwayMonths = savings / monthlyBurn;
    if (runwayMonths < 3) {
      score -= 8;
    }
  }

  // 3. User preference weights
  if (profile.weights?.cashflowWeight >= 8 && pathway.minCapitalRmb <= 5000) {
    score += 5;
  }
  if (profile.weights?.mobilityWeight >= 8 && pathway.targetCountry !== '中国') {
    score += 4;
  }

  return Math.min(99, Math.max(10, score));
}

export function rankPathways(pathways: Pathway[], profile: UserProfile): Pathway[] {
  return [...pathways]
    .map(p => ({
      ...p,
      feasibilityScore: calculateDynamicPathwayFeasibility(p, profile)
    }))
    .sort((a, b) => b.feasibilityScore - a.feasibilityScore);
}
