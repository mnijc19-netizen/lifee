export type SourceTier = 'Tier A' | 'Tier B' | 'Tier C' | 'Tier D' | 'Tier E';

export interface Source {
  id: string;
  name: string;
  country: string;
  category: 'Immigration' | 'Labor Stats' | 'Job Bank' | 'Education' | 'Industry Report' | 'Community' | 'Global Index';
  sourceTier: SourceTier;
  url: string;
  accessType: 'Official Open Data' | 'Official Portal' | 'Public RSS / Feed' | 'Public Web Page' | 'Manual Inbox';
  updateFrequency: 'Daily' | '2-3 Days' | 'Weekly' | 'Monthly' | 'Quarterly';
  parser: string;
  robotsStatus: 'Allowed' | 'Public Read Only' | 'User Contributed';
  termsStatus: 'Compliant' | 'Public Domain / Open Data' | 'Fair Use / Attribution';
  lastSuccess: string;
  lastFailure: string | null;
  freshness: 'Fresh' | 'Normal' | 'Stale' | 'Checking';
}

export interface EightQuestionsCareer {
  q1_currentEligibility: string;
  q2_missingPrerequisites: string;
  q3_fastestTimeToEntry: string;
  q4_financialCost: string;
  q5_chinaEarningPotential: string;
  q6_overseasUsability: string;
  q7_overseasRecertificationBurden: string;
  q8_topFailureReason: string;
}

export interface EightQuestionsCountry {
  q1_realEntryPoints: string;
  q2_minimumStartupCapital: string;
  q3_languageRequirements: string;
  q4_associateDegreeLimitations: string;
  q5_mostRealisticJobs: string;
  q6_permanentResidenceChain: string;
  q7_biggestRisk: string;
  q8_failureCostTimeAndMoney: string;
}

export interface SkillFrequency {
  name: string;
  frequencyPercent: number;
  isCore: boolean;
}

export interface Occupation {
  id: string;
  title: string;
  titleEn: string;
  category: 'AI & Software' | 'Digital & 3D' | 'Trades & Engineering' | 'Logistics & Transport' | 'Healthcare & Services' | 'Green Energy';
  iscoCode: string;
  anzscoCode?: string;
  socCode?: string;
  nocCode?: string;
  cnSalaryGrossMonthly: number;
  cnSalaryHourlyEstimate: number;
  cnTypicalHoursWeekly: number;
  cnOvertimeRisk: '低' | '中' | '高' | '极高';
  overseasSalaryGrossAnnual: string;
  overseasSalaryHourlyEstimate: string;
  overseasTypicalHoursWeekly: number;
  remotePossibility: '全远程' | '混合远程' | '低' | '不可/必须现场';
  entryDegree: '无需学历' | '大专可入' | '本科优先' | '必须本科及以上';
  learningMonths: number;
  learningCostRmb: number;
  licenseRequired: boolean;
  qualificationFriction: 'Low' | 'Medium' | 'High' | 'Very High';
  overseasRecertificationCostRmb: number;
  englishRequirement: string;
  secondLanguageRequirement: string;
  aiReplacementRisk: '极低' | '低' | '中' | '高' | '极高';
  aiEnhancementLeverage: '极高' | '高' | '中' | '低' | '极低';
  fiveYearDemandTrend: '快速增长' | '稳步增长' | '平稳' | '面临替代/萎缩';
  foreignerHiringReality: '容易' | '中等' | '较难' | '极难/有硬性身份壁垒';
  visaCorrelation: '极强(在多国紧缺清单)' | '中等' | '弱(需特殊豁免)' | '无直接工签';
  prCorrelation: '高' | '中' | '低' | '无直接可能';
  globalMobility: '极高' | '高' | '中' | '低';
  topSkills: SkillFrequency[];
  eightQuestions: EightQuestionsCareer;
  feasibilityScore: number;
  confidence: '高' | '中' | '低' | '数据不足';
  summaryVerdict: string;
}

export interface Country {
  id: string;
  name: string;
  nameEn: string;
  flag: string;
  region: 'English-Speaking' | 'Western/Northern Europe' | 'Southern/Eastern Europe' | 'Asia' | 'Middle East';
  primaryLanguage: string;
  secondLanguageCost: '无/英语母语' | '低' | '中(需德语/日语等初阶)' | '高(需达B2/C1)';
  foreignerWorkDifficulty: '低' | '中等' | '较高' | '极高';
  visaRoutesSummary: string[];
  prRouteSummary: string;
  associateDegreeFriendliness: '极高' | '高' | '中等' | '低(需认证或专升本)' | '极低(必须全日制本硕)';
  tradesViability: '优' | '良' | '需高壁垒本地资格' | '极难工签';
  itViability: '优' | '良' | '中等' | '需本地大厂担保';
  minStartupCapitalRmb: number;
  monthlyRentRmbEstimate: number;
  monthlyLivingCostRmbEstimate: number;
  minWageHourlyRmbEstimate: number;
  medianWageMonthlyRmbEstimate: number;
  typicalWeeklyHours: number;
  paidLeaveDaysYear: number;
  laborProtectionScore: number;
  taxBurden: '低' | '中' | '高';
  safetyRank: string;
  internetFreedomScore: number;
  aiServiceAccessibility: '完全自由' | '有轻微合规审查' | '受限';
  netHourlyPurchasingPowerIndex: number;
  eightQuestions: EightQuestionsCountry;
  summaryVerdict: string;
}

export interface PathwayNode {
  id: string;
  title: string;
  stage: string;
  durationMonths: number;
  costRmb: number;
  cashflowType: '持续自给自足' | '轻微支出' | '重度资本消耗' | '带薪补贴/免学费';
  prerequisites: string[];
  skillsToLearn: string[];
  certsToAcquire: string[];
  englishMilestone: string;
  risk: string;
  killCriteria: string;
  fallbackPlan: string;
  rationale: string;
}

export type FreshnessStatus = 'FRESH' | 'AGING' | 'STALE' | 'EXPIRED' | 'UNKNOWN';

export interface FreshnessPolicy {
  dataType: string;
  targetRefreshHours: number;
  agingAfterHours: number;
  staleAfterHours: number;
  expireAfterHours: number;
  expectedSourceCadence: string;
  isNonOfficial?: boolean;
}

export interface FreshnessEvaluation {
  status: FreshnessStatus;
  ageHours: number;
  sourcePublishedAt?: string | null;
  effectiveAt?: string | null;
  fetchedAt: string;
  lastVerifiedAt?: string;
  policy: FreshnessPolicy;
  isProvisional: boolean;
  excludeFromScoring: boolean;
  historicalNotice?: string;
  anchorUsed?: 'fetchedAt' | 'sourcePublishedAt';
  anchorDate?: string;
  legalStatus?: 'IN_FORCE' | 'UPCOMING_ENFORCEMENT' | 'UNKNOWN';
}

export type DecisionMode = 'EXPLORE' | 'EXECUTE';

export interface BehavioralModeState {
  currentMode: DecisionMode;
  modeActivatedAt: string;
  pinnedPathwayId?: string;
  exitCriteria: {
    description: string;
    targetMetric: string;
    deadlineMonths: number;
    killThreshold?: string;
  };
  filterNonPinned: boolean;
}

export interface DerivedActionItem {
  id: string | number;
  title: string;
  reason: string;
  badge: string;
  badgeColor: string;
  actionTab: string;
  derivationSource: 'PROFILE_RUNWAY' | 'PATHWAY_NEXT_GATE' | 'MINI_EXPERIMENT' | 'POLICY_EVIDENCE' | 'STATIC_FALLBACK';
}

export interface NextGate {
  title: string;
  targetMetric: string;
  deadlineMonths: number;
  whyThisGateNow: string;
  recommendedDailyAction: string;
}

export interface ScoreExplanation {
  baseScore: number;
  finalScore: number;
  freshnessGatePassed: boolean;
  freshnessStatus: FreshnessStatus;
  isProvisional: boolean;
  confidenceLabel: 'HIGH' | 'PROVISIONAL' | 'EXCLUDED';
  positiveDrivers: string[];
  negativeDrivers: string[];
  hardConstraintsPassed: boolean;
  hardConstraintFailures?: string[];
  profileConditionSummary: string;
}

export interface Pathway {
  id: string;
  name: string;
  title?: string;
  category: 'AI & Remote Launch' | 'Dual Vocational / Ausbildung' | 'Stepping Stone' | 'Specified Skills' | 'Working Holiday' | 'Skilled Tech';
  targetCountry: string;
  totalMonthsEst: number;
  minCapitalRmb: number;
  feasibilityScore: number;
  confidenceScore: number;
  whyRecommended: string;
  mainRisk: string;
  nextImmediateStep: string;
  killCriteria: string;
  nodes: PathwayNode[];
  // Decision Intelligence Enhancements (RULE-45~60)
  freshnessStatus?: FreshnessStatus;
  isProvisional?: boolean;
  excludeFromTop?: boolean;
  scoreExplanation?: ScoreExplanation;
  nextGate?: NextGate;
  profileConditionalStatement?: string;
}

export interface Evidence {
  id: string;
  title: string;
  sourceId: string;
  sourceName: string;
  sourceTier: SourceTier;
  url: string;
  publishDate: string;
  fetchDate: string;
  lastCheckDate: string;
  country: string;
  occupationId?: string;
  isOfficial: boolean;
  summary: string;
  keyFactQuotes: string[];
  confidence: '高' | '中' | '未完全确认' | '数据不足';
  expiredRisk: '有效' | '政策变动期' | '可能过期';
}

export interface IntelligenceEvent {
  id: string;
  title: string;
  category: '签证政策' | '紧缺名单' | '工资门槛' | '资格认证' | 'AI与自动化趋势' | '国内就业信号';
  impactScore: number;
  country: string;
  date: string;
  summary: string;
  oldFact: string;
  newFact: string;
  whatToChangeForMe: string;
  evidenceId: string;
  eventOrigin?: 'LIVE_DETECTED' | 'HISTORICAL_SEED' | 'MANUAL' | 'CACHED';
  sourceUrl?: string;
  affectedPathways?: string[];
  // Decision intelligence enhancements (RULE-54)
  tier?: 'TODAY_PRIORITY' | 'BACKGROUND_INTEL';
  whatChanged?: string;
  effectiveDate?: string;
  confidence?: 'HIGH' | 'MEDIUM' | 'PROVISIONAL';
  affectedProfileConditions?: string[];
  personalImpact?: string;
  scoreDelta?: number;
  actionRequired?: string;
}

export interface LowRegretSkill {
  id: string;
  name: string;
  category: string;
  estimatedHoursToProficiency: number;
  whyLowRegret: string;
  crossRouteValue: string;
  immediateMonetization: string;
  recommendedAction: string;
}

export interface MiniExperiment {
  id: string;
  title: string;
  durationDays: 7 | 14 | 30;
  goal: string;
  actionSteps: string[];
  successMetric: string;
  killCriteria: string;
  linkedCareerId?: string;
}

export interface UserPlanTask {
  id: string;
  title: string;
  period: 'today' | 'week' | '30d' | '90d';
  status: 'todo' | 'in_progress' | 'completed' | 'abandoned';
  whyNow: string;
  linkedPathwayId?: string;
  deadline?: string;
}

export interface UserWeights {
  cashflowWeight: number;
  freeTimeWeight: number;
  hourlyWageWeight: number;
  mobilityWeight: number;
  prWeight: number;
  learningCostWeight: number;
}

export interface UserHardConstraints {
  birthYear: number;
  education: string;
  school: string;
  major: string;
  gpa: number;
  englishVocabEstimate: number;
  currentSavingsRmb: number;
  monthlyRentRmb: number;
  monthlyFoodAndLifeRmb: number;
  currentMonthlyIncomeRmb: number;
  currentRemoteHoursPerWeek: number;
  targetDateBaseline: string;
  citizenship?: string;
  skills?: string[];
  certs?: string[];
}

export interface UserPreferences {
  weights: UserWeights;
  preferRemote?: boolean;
  commuteToleranceMinutes?: number;
  prPriority?: 'HIGH' | 'MEDIUM' | 'LOW';
  openInternetPriority?: 'HIGH' | 'MEDIUM' | 'LOW';
  riskTolerance?: 'LOW' | 'MEDIUM' | 'HIGH';
  maxInitialCostRmb?: number;
}

export interface UserProfile {
  name: string;
  birthYear: number;
  education: string;
  school: string;
  major: string;
  gpa: number;
  englishVocabEstimate: number;
  currentSavingsRmb: number;
  monthlyRentRmb: number;
  monthlyFoodAndLifeRmb: number;
  currentMonthlyIncomeRmb: number;
  currentRemoteHoursPerWeek: number;
  targetDateBaseline: string;
  weights: UserWeights;
  // RULE-57 Structured Hard Constraints vs Preferences
  hardConstraints?: UserHardConstraints;
  preferences?: UserPreferences;
  activeDecisionMode?: DecisionMode;
  pinnedPathwayId?: string;
  behavioralModeState?: BehavioralModeState;
}

export type SourceStatus = 
  | 'LIVE_DATA' 
  | 'REACHABLE' 
  | 'CACHED' 
  | 'STATIC' 
  | 'MANUAL' 
  | 'BLOCKED' 
  | 'FAILED' 
  | 'FAILED_PARSER'
  | 'STALE' 
  | 'UNKNOWN';

export type FunctionStatus = 
  | 'IMPLEMENTED' 
  | 'PARTIAL' 
  | 'STUB' 
  | 'MOCK' 
  | 'STATIC_FALLBACK' 
  | 'BLOCKED' 
  | 'NOT_IMPLEMENTED';

export interface ManifestSourceItem {
  id: string;
  name: string;
  url: string;
  country: string;
  sourceTier: SourceTier;
  category: string;
  status: SourceStatus;
  httpStatus: number | null;
  latencyMs: number;
  lastCheck: string;
  sourcePublishedAt?: string;
  fetchedAt?: string;
  parsedAt?: string;
  lastVerifiedAt?: string;
  contentHash?: string;
  extractedFact?: string;
  error?: string;
  fallbackLevel: 1 | 2 | 3 | 4;
}

export interface SourceManifest {
  updatedAt: string;
  totalSources: number;
  liveDataCount: number;
  reachableCount: number;
  cachedCount: number;
  manualCount: number;
  blockedCount: number;
  failedCount: number;
  staticCount: number;
  unknownCount: number;
  sources: ManifestSourceItem[];
}

export interface DiscoveryRoute {
  id: string;
  title: string;
  targetCountry: string;
  category: string;
  status: 'unverified' | 'due_diligence' | 'validated';
  originType?: 'STATIC_SEED' | 'AUTOMATED_CANDIDATE';
  validation_status?: 'UNVERIFIED' | 'VALIDATED';
  estimatedCostRmb: number;
  estimatedMonths: number;
  summary: string;
  whyEmerging: string;
  unverifiedRisks: string[];
  investigationSteps: string[];
  linkedEvidenceIds: string[];
  lastVerifiedAt: string;
}

export interface SourceProvenance<T = any> {
  value: T;
  unit?: string;
  sourceId: string;
  sourceUrl: string;
  sourceTitle: string;
  fetchedAt: string;
  sourcePublishedAt: string | null;
  effectiveAt?: string | null;
  evidenceText: string;
  parserVersion: string;
}

export interface NormalizedSnapshot {
  sourceId: string;
  version: number;
  fetchedAt: string;
  lastCheckedAt?: string;
  sourcePublishedAt?: string | null;
  url: string;
  contentHash: string;
  parserVersion: string;
  normalizedFacts: Record<string, any>;
  evidence: {
    evidenceId: string;
    claim: string;
    quotes: string[];
    sourceUrl: string;
  }[];
}

export interface SemanticDiffChange {
  field: string;
  oldValue: any;
  newValue: any;
  summary: string;
  impact?: 'positive' | 'neutral' | 'negative';
}

export interface SemanticDiffResult {
  hasChange: boolean;
  changeType: 'NO_MEANINGFUL_CHANGE' | 'POLICY_CHANGE' | 'CRITERIA_UPDATE' | 'UNKNOWN';
  summary?: string;
  sourceId: string;
  oldSnapshotVersion?: number;
  newSnapshotVersion?: number;
  changes: SemanticDiffChange[];
  detectedAt: string;
  affectedPathways?: string[];
}

export interface ResearchDiffResult {
  targetId: string;
  targetType: 'country' | 'occupation' | 'pathway';
  title: string;
  status: FunctionStatus;
  evidenceMode: 'LIVE_DATA' | 'STATIC_FALLBACK' | 'CACHED';
  baselineSummary: string;
  latestFactSummary: string;
  policyChanges: { aspect: string; before: string; after: string; impact: 'positive' | 'neutral' | 'negative' }[];
  feasibilityDelta: number;
  riskAudit: string[];
  recommendedAction: string;
  // Rigorous 4-category evidence segregation
  verifiedFacts: { claim: string; evidenceId?: string; sourceUrl?: string; quote?: string }[];
  systemInference: string[];
  communitySignals: string[];
  dataGapsUnknown: string[];
  // Rigorous timestamps
  requestedAt: string;
  lastSourceFetchedAt: string;
  lastSourcePublishedAt: string | null;
  lastMeaningfulChange: string;
  lastVerifiedAt?: string;
  fetchedAt?: string;
  verificationSourceUrl?: string;
  verificationSourceName?: string;
  fallbackNotice?: string;
}

