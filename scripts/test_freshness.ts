import assert from 'assert';
import { 
  calculateFactFreshness, 
  evaluatePathwayFreshnessGate, 
  FRESHNESS_POLICIES,
  PATHWAY_DATA_TYPE_MAP 
} from '../src/engine/freshnessEngine';
import { Pathway, UserProfile } from '../src/types';

console.log('=== [RULE-65 & RULE-72] Freshness Engine Production Parity & Anchor Semantics Suite ===\n');

let passCount = 0;
let failCount = 0;

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passCount++;
  } catch (err: any) {
    console.error(`  [FAIL] ${name}:`, err.message);
    failCount++;
  }
}

const baseTime = new Date('2026-09-07T12:00:00.000Z').getTime();

// ---------------------------------------------------------------------------
// 1. REG-11: Production/Test Parity (Direct production execution, zero duplicated logic)
// ---------------------------------------------------------------------------
console.log('--- REG-11: Production/Test Parity ---');

runTest('REG-11: calculateFactFreshness is directly imported from production engine', () => {
  assert.strictEqual(typeof calculateFactFreshness, 'function');
  assert.strictEqual(typeof evaluatePathwayFreshnessGate, 'function');
});

runTest('REG-11: 5h old critical immigration policy evaluates to FRESH via production code', () => {
  const snap = {
    fetchedAt: new Date(baseTime - 5 * 3600 * 1000).toISOString(),
    sourcePublishedAt: new Date(baseTime - 5 * 3600 * 1000).toISOString()
  };
  const res = calculateFactFreshness(snap, 'CRITICAL_IMMIGRATION_POLICY', baseTime);
  assert.strictEqual(res.status, 'FRESH');
  assert.strictEqual(res.isProvisional, false);
  assert.strictEqual(res.excludeFromScoring, false);
  assert.strictEqual(res.ageHours, 5);
});

runTest('REG-11: 30h old critical immigration policy evaluates to AGING via production code', () => {
  const snap = {
    fetchedAt: new Date(baseTime - 30 * 3600 * 1000).toISOString(),
    sourcePublishedAt: new Date(baseTime - 30 * 3600 * 1000).toISOString()
  };
  const res = calculateFactFreshness(snap, 'CRITICAL_IMMIGRATION_POLICY', baseTime);
  assert.strictEqual(res.status, 'AGING');
  assert.strictEqual(res.isProvisional, false);
  assert.strictEqual(res.excludeFromScoring, false);
});

runTest('REG-11: 80h old critical immigration policy evaluates to STALE via production code', () => {
  const snap = {
    fetchedAt: new Date(baseTime - 80 * 3600 * 1000).toISOString(),
    sourcePublishedAt: new Date(baseTime - 80 * 3600 * 1000).toISOString()
  };
  const res = calculateFactFreshness(snap, 'CRITICAL_IMMIGRATION_POLICY', baseTime);
  assert.strictEqual(res.status, 'STALE');
  assert.strictEqual(res.isProvisional, true, 'STALE must trigger isProvisional = true');
  assert.strictEqual(res.excludeFromScoring, false);
});

runTest('REG-11: 200h old critical immigration policy evaluates to EXPIRED via production code', () => {
  const snap = {
    fetchedAt: new Date(baseTime - 200 * 3600 * 1000).toISOString(),
    sourcePublishedAt: new Date(baseTime - 200 * 3600 * 1000).toISOString()
  };
  const res = calculateFactFreshness(snap, 'CRITICAL_IMMIGRATION_POLICY', baseTime);
  assert.strictEqual(res.status, 'EXPIRED');
  assert.strictEqual(res.isProvisional, true);
  assert.strictEqual(res.excludeFromScoring, true, 'EXPIRED must trigger excludeFromScoring = true');
});

// ---------------------------------------------------------------------------
// 2. REG-12: Anchor Semantics (fetchedAt vs sourcePublishedAt vs effectiveAt)
// ---------------------------------------------------------------------------
console.log('\n--- REG-12: Anchor Semantics (fetchedAt, sourcePublishedAt, effectiveAt) ---');

runTest('REG-12: Anchor "fetchedAt" evaluates collector verification freshness', () => {
  // Scenario: Policy was published 30 days ago (720h), but our collector refreshed and verified it 2 hours ago (2h)
  const snap = {
    fetchedAt: new Date(baseTime - 2 * 3600 * 1000).toISOString(),
    sourcePublishedAt: new Date(baseTime - 720 * 3600 * 1000).toISOString(),
    effectiveAt: '2026-01-01'
  };

  const res = calculateFactFreshness(snap, {
    dataType: 'CRITICAL_IMMIGRATION_POLICY',
    asOfTimeMs: baseTime,
    anchor: 'fetchedAt'
  });

  assert.strictEqual(res.anchorUsed, 'fetchedAt');
  assert.strictEqual(res.ageHours, 2);
  assert.strictEqual(res.status, 'FRESH', 'Freshly polled snapshot is FRESH when anchored on fetchedAt');
});

runTest('REG-12: Anchor "sourcePublishedAt" evaluates original publication age', () => {
  // Same snapshot evaluated by sourcePublishedAt
  const snap = {
    fetchedAt: new Date(baseTime - 2 * 3600 * 1000).toISOString(),
    sourcePublishedAt: new Date(baseTime - 720 * 3600 * 1000).toISOString(),
    effectiveAt: '2026-01-01'
  };

  const res = calculateFactFreshness(snap, {
    dataType: 'CRITICAL_IMMIGRATION_POLICY',
    asOfTimeMs: baseTime,
    anchor: 'sourcePublishedAt'
  });

  assert.strictEqual(res.anchorUsed, 'sourcePublishedAt');
  assert.strictEqual(res.ageHours, 720);
  assert.strictEqual(res.status, 'EXPIRED', '720h old policy is EXPIRED when anchored on sourcePublishedAt');
});

runTest('REG-12: "effectiveAt" distinguishes IN_FORCE vs UPCOMING_ENFORCEMENT', () => {
  // Case A: Policy effective in the past -> IN_FORCE
  const inForceSnap = {
    fetchedAt: new Date(baseTime).toISOString(),
    effectiveAt: '2026-01-01'
  };
  const resInForce = calculateFactFreshness(inForceSnap, 'CRITICAL_IMMIGRATION_POLICY', baseTime);
  assert.strictEqual(resInForce.legalStatus, 'IN_FORCE');

  // Case B: Policy effective in the future (e.g. 2026-11-01) -> UPCOMING_ENFORCEMENT
  const upcomingSnap = {
    fetchedAt: new Date(baseTime).toISOString(),
    effectiveAt: '2026-11-01'
  };
  const resUpcoming = calculateFactFreshness(upcomingSnap, 'CRITICAL_IMMIGRATION_POLICY', baseTime);
  assert.strictEqual(resUpcoming.legalStatus, 'UPCOMING_ENFORCEMENT');
});

// ---------------------------------------------------------------------------
// 3. RULE-72: Fact-Specific Freshness SLAs
// ---------------------------------------------------------------------------
console.log('\n--- RULE-72: Fact-Specific Freshness SLAs ---');

runTest('RULE-72: OCCUPATION_SHORTAGE_LIST has longer SLA (168h aging, 720h stale)', () => {
  // An occupation shortage list 200 hours old is AGING (not STALE) because shortage lists update annually/semi-annually
  const shortageSnap = {
    fetchedAt: new Date(baseTime - 200 * 3600 * 1000).toISOString(),
    sourcePublishedAt: new Date(baseTime - 200 * 3600 * 1000).toISOString()
  };
  const resShortage = calculateFactFreshness(shortageSnap, 'OCCUPATION_SHORTAGE_LIST', baseTime);
  assert.strictEqual(resShortage.status, 'AGING', '200h is AGING under OCCUPATION_SHORTAGE_LIST SLA (168h~720h)');
  assert.strictEqual(resShortage.isProvisional, false);

  // Under critical immigration policy, 200h would be EXPIRED
  const resCrit = calculateFactFreshness(shortageSnap, 'CRITICAL_IMMIGRATION_POLICY', baseTime);
  assert.strictEqual(resCrit.status, 'EXPIRED');
});

runTest('RULE-72: INDUSTRY_SIGNAL has 720h aging and 2160h stale SLA', () => {
  const signalSnap = {
    fetchedAt: new Date(baseTime - 500 * 3600 * 1000).toISOString()
  };
  const resSignal = calculateFactFreshness(signalSnap, 'INDUSTRY_SIGNAL', baseTime);
  assert.strictEqual(resSignal.status, 'AGING', '500h is AGING under INDUSTRY_SIGNAL SLA (168h~720h)');
});

runTest('RULE-72: Pathway gate applies specific SLA based on PATHWAY_DATA_TYPE_MAP', () => {
  const dePathway: Pathway = {
    id: 'path-de-ausbildung',
    name: '德国双元制职业技术',
    category: 'Dual Vocational / Ausbildung',
    targetCountry: '德国',
    totalMonthsEst: 36,
    minCapitalRmb: 25000,
    feasibilityScore: 88,
    confidenceScore: 92,
    whyRecommended: '低成本技术移民路径',
    mainRisk: '德语学习周期',
    nextImmediateStep: '德语 A1 攻坚',
    killCriteria: '德语进度停滞超 6 个月',
    nodes: []
  };

  const remotePathway: Pathway = {
    id: 'path-cn-remote-studio',
    name: '国内 3D/AI 资产外包工坊',
    category: 'AI & Remote Launch',
    targetCountry: '中国',
    totalMonthsEst: 12,
    minCapitalRmb: 3000,
    feasibilityScore: 90,
    confidenceScore: 85,
    whyRecommended: '快速自给现金流',
    mainRisk: '平台单价波动',
    nextImmediateStep: '搭建 Blender 批处理流水线',
    killCriteria: '连续 2 个月月收入低于房租',
    nodes: []
  };

  assert.strictEqual(PATHWAY_DATA_TYPE_MAP['path-de-ausbildung'], 'CRITICAL_IMMIGRATION_POLICY');
  assert.strictEqual(PATHWAY_DATA_TYPE_MAP['path-cn-remote-studio'], 'INDUSTRY_SIGNAL');

  // Both evaluated at 500h snapshot age:
  // DE pathway (critical policy): 500h > 168h -> EXPIRED
  const snap500h = {
    fetchedAt: new Date(baseTime - 500 * 3600 * 1000).toISOString(),
    sourcePublishedAt: new Date(baseTime - 500 * 3600 * 1000).toISOString()
  };
  const deGate = evaluatePathwayFreshnessGate(dePathway, snap500h as any, undefined, baseTime);
  assert.strictEqual(deGate.freshnessStatus, 'EXPIRED');
  assert.strictEqual(deGate.excludeFromTop, true);

  // CN remote pathway (industry signal): 500h is AGING -> gate passed!
  const remoteGate = evaluatePathwayFreshnessGate(remotePathway, snap500h as any, undefined, baseTime);
  assert.strictEqual(remoteGate.freshnessStatus, 'AGING');
  assert.strictEqual(remoteGate.gatePassed, true);
  assert.strictEqual(remoteGate.excludeFromTop, false);
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log('\n=== Freshness Engine Test Summary ===');
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('ALL FRESHNESS ENGINE TESTS PASSED (100% OK)');
}
