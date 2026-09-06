import { 
  FreshnessStatus, 
  FreshnessPolicy, 
  FreshnessEvaluation, 
  NormalizedSnapshot, 
  Pathway, 
  UserProfile 
} from '../types';
import { BUNDLED_SNAPSHOTS, TARGET_SOURCE_MAP } from './researchEngine';

// RULE-47: Fine-grained Freshness SLA Table per Data Type
export const FRESHNESS_POLICIES: Record<string, FreshnessPolicy> = {
  CRITICAL_IMMIGRATION_POLICY: {
    dataType: 'CRITICAL_IMMIGRATION_POLICY',
    targetRefreshHours: 6,
    agingAfterHours: 24,
    staleAfterHours: 72,
    expireAfterHours: 168, // 7 days
    expectedSourceCadence: '官方公报与法律条款动态生效 (1-6h 刷新, 24h 告警)'
  },
  OFFICIAL_NEWS_TRIGGER: {
    dataType: 'OFFICIAL_NEWS_TRIGGER',
    targetRefreshHours: 2,
    agingAfterHours: 12,
    staleAfterHours: 24,
    expireAfterHours: 48,
    expectedSourceCadence: '官方新闻与动态通告 (30m-2h 刷新, 最多 12h)'
  },
  OCCUPATION_SHORTAGE_LIST: {
    dataType: 'OCCUPATION_SHORTAGE_LIST',
    targetRefreshHours: 48,
    agingAfterHours: 168, // 7 days
    staleAfterHours: 720, // 30 days
    expireAfterHours: 2160, // 90 days
    expectedSourceCadence: '官方年度/半年审定紧缺清单 (1-7d 巡检)'
  },
  MACRO_LABOR_STATS: {
    dataType: 'MACRO_LABOR_STATS',
    targetRefreshHours: 720, // 30 days
    agingAfterHours: 2160, // 90 days
    staleAfterHours: 4320, // 180 days
    expireAfterHours: 8760, // 365 days
    expectedSourceCadence: '官方统计局发布周期 (半年/年度发布)'
  },
  COMMUNITY_SIGNALS: {
    dataType: 'COMMUNITY_SIGNALS',
    targetRefreshHours: 24,
    agingAfterHours: 72,
    staleAfterHours: 168, // 7 days
    expireAfterHours: 720, // 30 days
    expectedSourceCadence: '民间避坑与经验信标 (24-72h 巡检)',
    isNonOfficial: true
  },
  DEFAULT: {
    dataType: 'DEFAULT',
    targetRefreshHours: 24,
    agingAfterHours: 72,
    staleAfterHours: 168,
    expireAfterHours: 720,
    expectedSourceCadence: '标准业务周期'
  }
};

export function getFreshnessPolicy(dataType: string = 'DEFAULT'): FreshnessPolicy {
  return FRESHNESS_POLICIES[dataType] || FRESHNESS_POLICIES.DEFAULT;
}

/**
 * RULE-48: Calculate freshness purely based on Source Dates (sourcePublishedAt, fetchedAt),
 * NEVER on browser session / reload time.
 */
export function calculateFactFreshness(
  snapshot: { sourcePublishedAt?: string | null; fetchedAt: string; effectiveAt?: string | null },
  dataType: string = 'CRITICAL_IMMIGRATION_POLICY',
  asOfTimeMs?: number
): FreshnessEvaluation {
  const policy = getFreshnessPolicy(dataType);
  const now = asOfTimeMs !== undefined ? asOfTimeMs : Date.now();
  
  // Anchor date for freshness SLA (RULE-47 & RULE-48):
  // Check retrieval & verification timeliness based on fetchedAt, with fallback to sourcePublishedAt.
  const anchorDateStr = snapshot.fetchedAt || snapshot.sourcePublishedAt || '';
  const anchorTime = new Date(anchorDateStr).getTime();
  
  if (isNaN(anchorTime)) {
    return {
      status: 'UNKNOWN',
      ageHours: 0,
      sourcePublishedAt: snapshot.sourcePublishedAt,
      effectiveAt: snapshot.effectiveAt,
      fetchedAt: snapshot.fetchedAt,
      policy,
      isProvisional: true,
      excludeFromScoring: false,
      historicalNotice: '来源时间戳无法解析，置信度降级为未知'
    };
  }

  const ageMs = Math.max(0, now - anchorTime);
  const ageHours = Math.round(ageMs / (1000 * 60 * 60));

  let status: FreshnessStatus = 'FRESH';
  let isProvisional = false;
  let excludeFromScoring = false;
  let historicalNotice: string | undefined = undefined;

  if (ageHours >= policy.expireAfterHours) {
    status = 'EXPIRED';
    isProvisional = true;
    excludeFromScoring = true;
    historicalNotice = `[RULE-49 历史数据存证] 本政策数据已发布超 ${ageHours} 小时（超过有效周期 ${policy.expireAfterHours}h），正处于重新核验期，已从主打分中排除。`;
  } else if (ageHours >= policy.staleAfterHours) {
    status = 'STALE';
    isProvisional = true;
    excludeFromScoring = false;
    historicalNotice = `[RULE-46 时效临界] 来源数据已发布超 ${ageHours} 小时，已降级为临时研判 (PROVISIONAL)。`;
  } else if (ageHours >= policy.agingAfterHours) {
    status = 'AGING';
    isProvisional = false;
    excludeFromScoring = false;
  } else {
    status = 'FRESH';
    isProvisional = false;
    excludeFromScoring = false;
  }

  return {
    status,
    ageHours,
    sourcePublishedAt: snapshot.sourcePublishedAt,
    effectiveAt: snapshot.effectiveAt,
    fetchedAt: snapshot.fetchedAt,
    policy,
    isProvisional,
    excludeFromScoring,
    historicalNotice
  };
}

export interface PathwayFreshnessGateResult {
  gatePassed: boolean;
  freshnessStatus: FreshnessStatus;
  isProvisional: boolean;
  excludeFromTop: boolean;
  reasons: string[];
  historicalNotice?: string;
  sourceId?: string;
  ageHours?: number;
}

/**
 * RULE-50: Freshness Gate before Top Recommendations
 * 5 Checks:
 * 1. Key evidence exists
 * 2. Freshness SLA check (not STALE or EXPIRED)
 * 3. Trustworthy source (Tier A/B)
 * 4. No major unknown gap
 * 5. Profile hard constraints alignment
 */
export function evaluatePathwayFreshnessGate(
  pathway: Pathway,
  latestSnapshotOverride?: NormalizedSnapshot | null,
  profile?: UserProfile,
  asOfTimeMs?: number
): PathwayFreshnessGateResult {
  const reasons: string[] = [];
  const targetBinding = TARGET_SOURCE_MAP[pathway.id];
  const sourceId = targetBinding?.sourceId || 'src-generic';

  // Get latest snapshot from override or bundled snapshot
  const bundled = BUNDLED_SNAPSHOTS[sourceId];
  const snapshot = latestSnapshotOverride !== undefined ? latestSnapshotOverride : (bundled?.latest || null);

  if (!snapshot) {
    return {
      gatePassed: false,
      freshnessStatus: 'UNKNOWN',
      isProvisional: true,
      excludeFromTop: false,
      reasons: ['缺少官方快照证据，无法通过完整时效门禁'],
      sourceId
    };
  }

  // Evaluate freshness
  const evalResult = calculateFactFreshness(snapshot, 'CRITICAL_IMMIGRATION_POLICY', asOfTimeMs);

  let gatePassed = true;
  let excludeFromTop = false;
  let isProvisional = evalResult.isProvisional;

  // RULE-46: Expired data must be excluded from scoring and cannot drive recommendations
  if (evalResult.status === 'EXPIRED') {
    gatePassed = false;
    excludeFromTop = true;
    reasons.push(`核心法律/政策依据已超期失效 (${evalResult.ageHours}h > ${evalResult.policy.expireAfterHours}h)`);
  } else if (evalResult.status === 'STALE') {
    // RULE-46 & RULE-50: Stale critical fact triggers PROVISIONAL downgrade
    gatePassed = false;
    isProvisional = true;
    reasons.push(`依赖的核心事实已进入 STALE 观察期 (${evalResult.ageHours}h > ${evalResult.policy.staleAfterHours}h)，降级为 PROVISIONAL`);
  }

  // Profile hard constraints alignment check
  if (profile) {
    const savings = profile.hardConstraints?.currentSavingsRmb ?? profile.currentSavingsRmb ?? 0;
    if (savings < pathway.minCapitalRmb) {
      reasons.push(`刚性资金门槛差距：当前储蓄 ¥${savings} 低于路线初始门槛 ¥${pathway.minCapitalRmb}`);
    }
  }

  return {
    gatePassed,
    freshnessStatus: evalResult.status,
    isProvisional,
    excludeFromTop,
    reasons,
    historicalNotice: evalResult.historicalNotice,
    sourceId,
    ageHours: evalResult.ageHours
  };
}
