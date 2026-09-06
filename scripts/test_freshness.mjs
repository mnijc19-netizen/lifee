import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== [Lifee Freshness Engine Test Suite] SLA, Gate & REG-06 Invariants ===\n');

// SLA Configuration Mirror (RULE-47)
const FRESHNESS_POLICIES = {
  CRITICAL_IMMIGRATION_POLICY: {
    targetRefreshHours: 6,
    agingAfterHours: 24,
    staleAfterHours: 72,
    expireAfterHours: 168
  },
  OFFICIAL_NEWS_TRIGGER: {
    targetRefreshHours: 2,
    agingAfterHours: 12,
    staleAfterHours: 24,
    expireAfterHours: 48
  },
  OCCUPATION_SHORTAGE_LIST: {
    targetRefreshHours: 48,
    agingAfterHours: 168,
    staleAfterHours: 720,
    expireAfterHours: 2160
  }
};

function calculateFactFreshness(snapshot, dataType = 'CRITICAL_IMMIGRATION_POLICY', asOfTimeMs) {
  const policy = FRESHNESS_POLICIES[dataType] || FRESHNESS_POLICIES.CRITICAL_IMMIGRATION_POLICY;
  const now = asOfTimeMs !== undefined ? asOfTimeMs : Date.now();
  const anchorDateStr = snapshot.sourcePublishedAt || snapshot.fetchedAt;
  const anchorTime = new Date(anchorDateStr).getTime();

  if (isNaN(anchorTime)) {
    return { status: 'UNKNOWN', ageHours: 0, isProvisional: true, excludeFromScoring: false };
  }

  const ageMs = Math.max(0, now - anchorTime);
  const ageHours = Math.round(ageMs / (1000 * 60 * 60));

  let status = 'FRESH';
  let isProvisional = false;
  let excludeFromScoring = false;

  if (ageHours >= policy.expireAfterHours) {
    status = 'EXPIRED';
    isProvisional = true;
    excludeFromScoring = true;
  } else if (ageHours >= policy.staleAfterHours) {
    status = 'STALE';
    isProvisional = true;
    excludeFromScoring = false;
  } else if (ageHours >= policy.agingAfterHours) {
    status = 'AGING';
    isProvisional = false;
    excludeFromScoring = false;
  }

  return { status, ageHours, isProvisional, excludeFromScoring, policy };
}

const tests = [];

// 1. SLA Threshold Tests (RULE-45, 47, 48)
const baseTime = new Date('2026-09-07T12:00:00.000Z').getTime();

// Fresh check (5 hours old)
const snapFresh = { sourcePublishedAt: new Date(baseTime - 5 * 3600 * 1000).toISOString(), fetchedAt: new Date(baseTime).toISOString() };
const resFresh = calculateFactFreshness(snapFresh, 'CRITICAL_IMMIGRATION_POLICY', baseTime);
tests.push({
  name: 'RULE-45: 5h old critical immigration policy is FRESH',
  pass: resFresh.status === 'FRESH' && !resFresh.isProvisional && !resFresh.excludeFromScoring
});

// Aging check (30 hours old)
const snapAging = { sourcePublishedAt: new Date(baseTime - 30 * 3600 * 1000).toISOString(), fetchedAt: new Date(baseTime).toISOString() };
const resAging = calculateFactFreshness(snapAging, 'CRITICAL_IMMIGRATION_POLICY', baseTime);
tests.push({
  name: 'RULE-45/47: 30h old critical immigration policy is AGING (24h-72h)',
  pass: resAging.status === 'AGING' && !resAging.isProvisional && !resAging.excludeFromScoring
});

// Stale check (80 hours old)
const snapStale = { sourcePublishedAt: new Date(baseTime - 80 * 3600 * 1000).toISOString(), fetchedAt: new Date(baseTime).toISOString() };
const resStale = calculateFactFreshness(snapStale, 'CRITICAL_IMMIGRATION_POLICY', baseTime);
tests.push({
  name: 'RULE-46: 80h old critical immigration policy is STALE (downgrades to PROVISIONAL)',
  pass: resStale.status === 'STALE' && resStale.isProvisional === true && resStale.excludeFromScoring === false
});

// Expired check (200 hours old)
const snapExpired = { sourcePublishedAt: new Date(baseTime - 200 * 3600 * 1000).toISOString(), fetchedAt: new Date(baseTime).toISOString() };
const resExpired = calculateFactFreshness(snapExpired, 'CRITICAL_IMMIGRATION_POLICY', baseTime);
tests.push({
  name: 'RULE-46/49: 200h old critical immigration policy is EXPIRED (excluded from scoring)',
  pass: resExpired.status === 'EXPIRED' && resExpired.isProvisional === true && resExpired.excludeFromScoring === true
});

// Official news SLA check (30h old news is STALE)
const snapNews = { fetchedAt: new Date(baseTime - 30 * 3600 * 1000).toISOString() };
const resNews = calculateFactFreshness(snapNews, 'OFFICIAL_NEWS_TRIGGER', baseTime);
tests.push({
  name: 'RULE-47: 30h old official news trigger is STALE (News SLA is 24h)',
  pass: resNews.status === 'STALE'
});

// 2. REG-06: STALE_CRITICAL_FACT_CANNOT_DRIVE_TOP_RECOMMENDATION
// Simulate 2 competing pathways:
// Pathway A: High baseline score (92), but its critical evidence is STALE
// Pathway B: Lower baseline score (88), but its evidence is FRESH and passes hard constraints
function mockRank(pathways, snapshots, profile, asOfTime) {
  return pathways.map(p => {
    const snap = snapshots[p.id];
    const freshness = calculateFactFreshness(snap, 'CRITICAL_IMMIGRATION_POLICY', asOfTime);
    let score = p.baseScore;
    let isProvisional = freshness.isProvisional;
    let excludeFromTop = freshness.excludeFromScoring;

    if (freshness.status === 'EXPIRED') {
      score = Math.min(score, 30);
      excludeFromTop = true;
    } else if (freshness.status === 'STALE') {
      score -= 15;
      isProvisional = true;
    }

    return {
      id: p.id,
      name: p.name,
      score,
      freshnessStatus: freshness.status,
      isProvisional,
      excludeFromTop,
      passesHardConstraints: true
    };
  }).sort((a, b) => {
    if (a.excludeFromTop && !b.excludeFromTop) return 1;
    if (!a.excludeFromTop && b.excludeFromTop) return -1;
    // RULE-63: Fresh passes hard constraints prioritizes over Stale/Provisional
    if (!a.isProvisional && b.isProvisional) {
      if (b.score - a.score < 25) return -1;
    }
    if (a.isProvisional && !b.isProvisional) {
      if (a.score - b.score < 25) return 1;
    }
    return b.score - a.score;
  });
}

const pathways = [
  { id: 'path-de', name: '德国双元制', baseScore: 92 },
  { id: 'path-my', name: '马来西亚数字游民', baseScore: 88 }
];

// Case 1: Both Fresh -> Germany wins #1
const snapshotsBothFresh = {
  'path-de': { sourcePublishedAt: new Date(baseTime - 10 * 3600 * 1000).toISOString() },
  'path-my': { sourcePublishedAt: new Date(baseTime - 10 * 3600 * 1000).toISOString() }
};
const rankNormal = mockRank(pathways, snapshotsBothFresh, {}, baseTime);
tests.push({
  name: 'REG-06 Baseline: When both fresh, Germany is #1 (92 vs 88)',
  pass: rankNormal[0].id === 'path-de' && rankNormal[0].score === 92 && !rankNormal[0].isProvisional
});

// Case 2: Germany is STALE (100h old) -> Malaysia is FRESH -> Malaysia wins #1!
const snapshotsGermanyStale = {
  'path-de': { sourcePublishedAt: new Date(baseTime - 100 * 3600 * 1000).toISOString() },
  'path-my': { sourcePublishedAt: new Date(baseTime - 10 * 3600 * 1000).toISOString() }
};
const rankStale = mockRank(pathways, snapshotsGermanyStale, {}, baseTime);
tests.push({
  name: 'REG-06: STALE_CRITICAL_FACT_CANNOT_DRIVE_TOP_RECOMMENDATION (Stale Germany demoted below Fresh Malaysia)',
  pass: rankStale[0].id === 'path-my' && rankStale[1].id === 'path-de' && rankStale[1].isProvisional === true
});

// Case 3: Germany is EXPIRED (200h old) -> Germany is excluded from top rankings
const snapshotsGermanyExpired = {
  'path-de': { sourcePublishedAt: new Date(baseTime - 200 * 3600 * 1000).toISOString() },
  'path-my': { sourcePublishedAt: new Date(baseTime - 10 * 3600 * 1000).toISOString() }
};
const rankExpired = mockRank(pathways, snapshotsGermanyExpired, {}, baseTime);
tests.push({
  name: 'REG-06: EXPIRED fact is strictly excluded from top recommendations',
  pass: rankExpired[0].id === 'path-my' && rankExpired[1].excludeFromTop === true && rankExpired[1].score <= 30
});

console.log('--- Test Results ---');
let allPassed = true;
for (const t of tests) {
  console.log(`  ${t.pass ? '✓ PASS' : '✗ FAIL'}: ${t.name}`);
  if (!t.pass) allPassed = false;
}

if (allPassed) {
  console.log(`\n>>> ALL ${tests.length} FRESHNESS & REG-06 TESTS PASSED! <<<`);
  process.exit(0);
} else {
  console.error('\n>>> SOME TESTS FAILED <<<');
  process.exit(1);
}
