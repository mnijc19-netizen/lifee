import { NormalizedSnapshot, SemanticDiffResult, SemanticDiffChange } from '../types';

/**
 * Performs semantic structured diff between two normalized policy snapshots.
 * Strictly adheres to RULE-34 (Previous Snapshot required) & RULE-35 (UNKNOWN vs NO_CHANGE).
 */
function getVal(obj: any): any {
  if (obj === undefined || obj === null) return undefined;
  if (typeof obj === 'object' && obj !== null && 'value' in obj) return obj.value;
  return obj;
}

export function diffSnapshots(
  oldSnapshot: NormalizedSnapshot | null,
  newSnapshot: NormalizedSnapshot
): SemanticDiffResult {
  // RULE-34 & RULE-35: If previous snapshot is missing, status is strictly UNKNOWN
  if (!oldSnapshot) {
    return {
      hasChange: false,
      changeType: 'UNKNOWN',
      summary: 'No baseline available',
      sourceId: newSnapshot.sourceId,
      newSnapshotVersion: newSnapshot.version,
      changes: [],
      detectedAt: newSnapshot.fetchedAt,
      affectedPathways: []
    };
  }

  const changes: SemanticDiffChange[] = [];

  // Deep comparison of normalized facts
  const oldFacts = oldSnapshot.normalizedFacts || {};
  const newFacts = newSnapshot.normalizedFacts || {};

  // 1. Germany Chancenkarte Blocked Funds Check
  const oldMonthly = getVal(oldFacts.opportunityCard?.monthlyBlockedFundsEur);
  const newMonthly = getVal(newFacts.opportunityCard?.monthlyBlockedFundsEur);
  if (oldMonthly !== undefined && newMonthly !== undefined && oldMonthly !== newMonthly) {
    changes.push({
      field: 'opportunityCard.monthlyBlockedFundsEur',
      oldValue: `€${oldMonthly.toLocaleString()}`,
      newValue: `€${newMonthly.toLocaleString()}`,
      summary: `德国机会卡月最低自保金要求由 €${oldMonthly} 调整为 €${newMonthly}`,
      impact: newMonthly > oldMonthly ? 'negative' : 'positive'
    });
  }

  const oldAnnual = getVal(oldFacts.opportunityCard?.annualBlockedFundsEur);
  const newAnnual = getVal(newFacts.opportunityCard?.annualBlockedFundsEur);
  if (oldAnnual !== undefined && newAnnual !== undefined && oldAnnual !== newAnnual) {
    changes.push({
      field: 'opportunityCard.annualBlockedFundsEur',
      oldValue: `€${oldAnnual.toLocaleString()}`,
      newValue: `€${newAnnual.toLocaleString()}`,
      summary: `德国机会卡法定最低年自保金要求由 €${oldAnnual} 调整为 €${newAnnual}`,
      impact: newAnnual > oldAnnual ? 'negative' : 'positive'
    });
  }

  // 2. New Zealand AEWV Wage Check (RULE-39: AEWV wage threshold)
  const oldWage = getVal(oldFacts.aewv?.aewv_general_median_wage_requirement) ?? getVal(oldFacts.aewv?.medianWageHourlyNzd);
  const newWage = getVal(newFacts.aewv?.aewv_general_median_wage_requirement) ?? getVal(newFacts.aewv?.medianWageHourlyNzd);
  if (oldWage !== undefined && newWage !== undefined && oldWage !== newWage) {
    changes.push({
      field: 'aewv.medianWageHourlyNzd',
      oldValue: `$${oldWage} NZD/h`,
      newValue: `$${newWage} NZD/h`,
      summary: `新西兰 AEWV 雇主担保时薪门槛由 $${oldWage} 调整为 $${newWage} NZD/h`,
      impact: newWage > oldWage ? 'negative' : 'positive'
    });
  }

  // 3. New Zealand Stay Limit Check
  const oldStay = getVal(oldFacts.anzscoLevel45Restrictions?.maxContinuousStayYears);
  const newStay = getVal(newFacts.anzscoLevel45Restrictions?.maxContinuousStayYears);
  if (oldStay !== undefined && newStay !== undefined && oldStay !== newStay) {
    changes.push({
      field: 'anzscoLevel45Restrictions.maxContinuousStayYears',
      oldValue: `${oldStay} 年`,
      newValue: `${newStay} 年`,
      summary: `新西兰 ANZSCO 4-5 级岗位工签最长居留期限由 ${oldStay} 年调整为 ${newStay} 年`,
      impact: newStay < oldStay ? 'negative' : 'positive'
    });
  }

  // 4. JSA Shortage Rating Check (RULE-40)
  for (const [key, item] of Object.entries<any>(newFacts.monitoredShortages || {})) {
    const oldItem = oldFacts.monitoredShortages?.[key];
    const oldShortage = typeof oldItem === 'object' ? (oldItem.nationalShortage ?? oldItem.labour_market_status?.nationalShortage) : undefined;
    const newShortage = typeof item === 'object' ? (item.nationalShortage ?? item.labour_market_status?.nationalShortage) : undefined;
    if (oldShortage !== undefined && newShortage !== undefined && oldShortage !== newShortage) {
      changes.push({
        field: `shortage.${key}`,
        oldValue: oldShortage ? '紧缺' : '非紧缺',
        newValue: newShortage ? '紧缺' : '非紧缺',
        summary: `澳大利亚职业 [${item.title || key}] 紧缺评级发生变动：${oldShortage ? '紧缺' : '非紧缺'} -> ${newShortage ? '紧缺' : '非紧缺'}`,
        impact: newShortage ? 'positive' : 'negative'
      });
    }
  }

  const affectedPathways: string[] = [];
  if (newSnapshot.sourceId === 'src-make-it-germany') {
    affectedPathways.push('path-de-ausbildung');
  } else if (newSnapshot.sourceId === 'src-inz-gov') {
    affectedPathways.push('path-nz-whv');
  }

  if (changes.length === 0) {
    return {
      hasChange: false,
      changeType: 'NO_MEANINGFUL_CHANGE',
      summary: 'No meaningful changes detected between snapshots',
      sourceId: newSnapshot.sourceId,
      oldSnapshotVersion: oldSnapshot.version,
      newSnapshotVersion: newSnapshot.version,
      changes: [],
      detectedAt: newSnapshot.fetchedAt,
      affectedPathways
    };
  }

  return {
    hasChange: true,
    changeType: 'POLICY_CHANGE',
    summary: `Detected ${changes.length} policy / requirement change(s)`,
    sourceId: newSnapshot.sourceId,
    oldSnapshotVersion: oldSnapshot.version,
    newSnapshotVersion: newSnapshot.version,
    changes,
    detectedAt: newSnapshot.fetchedAt,
    affectedPathways
  };
}
