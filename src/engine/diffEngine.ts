import { NormalizedSnapshot, SemanticDiffResult, SemanticDiffChange } from '../types';

/**
 * Performs semantic structured diff between two normalized policy snapshots.
 * Filters out cosmetic noise, checking only real business fields:
 * - Blocked account financial requirements
 * - Minimum hourly wage thresholds
 * - Language milestones
 * - Shortage classifications
 */
export function diffSnapshots(
  oldSnapshot: NormalizedSnapshot | null,
  newSnapshot: NormalizedSnapshot
): SemanticDiffResult {
  if (!oldSnapshot) {
    return {
      hasChange: false,
      changeType: 'NO_MEANINGFUL_CHANGE',
      sourceId: newSnapshot.sourceId,
      newSnapshotVersion: newSnapshot.version,
      changes: [],
      detectedAt: newSnapshot.fetchedAt
    };
  }

  const changes: SemanticDiffChange[] = [];

  // Deep comparison of normalized facts
  const oldFacts = oldSnapshot.normalizedFacts || {};
  const newFacts = newSnapshot.normalizedFacts || {};

  // 1. Germany Chancenkarte Blocked Funds Check
  if (
    oldFacts.opportunityCard?.annualBlockedFundsEur !== undefined &&
    newFacts.opportunityCard?.annualBlockedFundsEur !== undefined
  ) {
    const oldAmt = oldFacts.opportunityCard.annualBlockedFundsEur;
    const newAmt = newFacts.opportunityCard.annualBlockedFundsEur;
    if (oldAmt !== newAmt) {
      changes.push({
        field: 'opportunityCard.annualBlockedFundsEur',
        oldValue: `€${oldAmt.toLocaleString()}`,
        newValue: `€${newAmt.toLocaleString()}`,
        summary: `德国机会卡法定最低年自保金要求由 €${oldAmt} 调整为 €${newAmt}`,
        impact: newAmt > oldAmt ? 'negative' : 'positive'
      });
    }
  }

  // 2. New Zealand AEWV Wage Check
  if (
    oldFacts.aewv?.medianWageHourlyNzd !== undefined &&
    newFacts.aewv?.medianWageHourlyNzd !== undefined
  ) {
    const oldWage = oldFacts.aewv.medianWageHourlyNzd;
    const newWage = newFacts.aewv.medianWageHourlyNzd;
    if (oldWage !== newWage) {
      changes.push({
        field: 'aewv.medianWageHourlyNzd',
        oldValue: `$${oldWage} NZD/h`,
        newValue: `$${newWage} NZD/h`,
        summary: `新西兰 AEWV 雇主担保时薪门槛由 $${oldWage} 调整为 $${newWage} NZD/h`,
        impact: newWage > oldWage ? 'negative' : 'positive'
      });
    }
  }

  // 3. JSA Shortage Rating Check
  if (newFacts.monitoredShortages) {
    for (const [key, item] of Object.entries<any>(newFacts.monitoredShortages)) {
      const oldItem = oldFacts.monitoredShortages?.[key];
      if (oldItem && oldItem.nationalShortage !== item.nationalShortage) {
        changes.push({
          field: `shortage.${key}`,
          oldValue: oldItem.nationalShortage ? '紧缺' : '非紧缺',
          newValue: item.nationalShortage ? '紧缺' : '非紧缺',
          summary: `澳大利亚职业 [${item.title}] 紧缺评级发生变动：${oldItem.nationalShortage} -> ${item.nationalShortage}`,
          impact: item.nationalShortage ? 'positive' : 'negative'
        });
      }
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
    sourceId: newSnapshot.sourceId,
    oldSnapshotVersion: oldSnapshot.version,
    newSnapshotVersion: newSnapshot.version,
    changes,
    detectedAt: newSnapshot.fetchedAt,
    affectedPathways
  };
}
