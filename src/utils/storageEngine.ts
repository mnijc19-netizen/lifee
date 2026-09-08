import { UserProfile, UserPlanTask, Evidence } from '../types';
import { DEFAULT_USER_PROFILE, DEFAULT_INITIAL_TASKS } from '../data/defaultProfile';

export const CURRENT_SCHEMA_VERSION = 2;

export const STORAGE_KEYS = {
  SCHEMA_VERSION: 'lifee_schema_version',
  PROFILE: 'lifee_user_profile_v2',
  TASKS: 'lifee_user_tasks_v2',
  CUSTOM_EVIDENCE: 'lifee_custom_evidence_v2',
  WATCHLIST: 'lifee_watchlist_v2',
  LAST_MODIFIED: 'lifee_last_local_mod_at',
  LEGACY_PROFILE_V1: 'lifee_user_profile_v1',
  LEGACY_TASKS_V1: 'lifee_user_tasks_v1',
  LEGACY_CUSTOM_EVIDENCE_V1: 'lifee_custom_evidence_v1',
  LEGACY_WATCHLIST_V1: 'lifee_watchlist_v1'
} as const;

export interface LifeeExportBundle {
  schemaVersion: number;
  exportedAt: string;
  appVersion: string;
  profile: UserProfile;
  tasks: UserPlanTask[];
  watchlist: string[];
  customEvidence: Evidence[];
}

/**
 * Normalizes a UserProfile so that flat fields and hardConstraints are strictly unified.
 * Zero is preserved (never converted to default), unknown/empty is handled safely.
 */
export function normalizeUserProfile(raw: any): UserProfile {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_USER_PROFILE };
  }

  // Priority: if field is explicitly present in raw, use it; else check hardConstraints; else fallback
  const pickNum = (flatVal: any, hcVal: any, defaultVal: number): number => {
    if (typeof flatVal === 'number' && !isNaN(flatVal)) return Math.max(0, flatVal);
    if (typeof hcVal === 'number' && !isNaN(hcVal)) return Math.max(0, hcVal);
    return defaultVal;
  };

  const pickStr = (flatVal: any, hcVal: any, defaultVal: string): string => {
    if (typeof flatVal === 'string' && flatVal.trim()) return flatVal.trim();
    if (typeof hcVal === 'string' && hcVal.trim()) return hcVal.trim();
    return defaultVal;
  };

  const birthYear = pickNum(raw.birthYear, raw.hardConstraints?.birthYear, 2002);
  const education = pickStr(raw.education, raw.hardConstraints?.education, '全日制大专 (专科)');
  const school = pickStr(raw.school, raw.hardConstraints?.school, '普通专科院校');
  const major = pickStr(raw.major, raw.hardConstraints?.major, '数字媒体与设计 (3D/视觉)');
  const gpa = pickNum(raw.gpa, raw.hardConstraints?.gpa, 3.2);
  const englishVocabEstimate = pickNum(raw.englishVocabEstimate, raw.hardConstraints?.englishVocabEstimate, 2000);
  const currentSavingsRmb = pickNum(raw.currentSavingsRmb, raw.hardConstraints?.currentSavingsRmb, 0);
  const monthlyRentRmb = pickNum(raw.monthlyRentRmb, raw.hardConstraints?.monthlyRentRmb, 0);
  const monthlyFoodAndLifeRmb = pickNum(raw.monthlyFoodAndLifeRmb, raw.hardConstraints?.monthlyFoodAndLifeRmb, 0);
  const currentMonthlyIncomeRmb = pickNum(raw.currentMonthlyIncomeRmb, raw.hardConstraints?.currentMonthlyIncomeRmb, 0);
  const currentRemoteHoursPerWeek = pickNum(raw.currentRemoteHoursPerWeek, raw.hardConstraints?.currentRemoteHoursPerWeek, 25);
  const targetDateBaseline = pickStr(raw.targetDateBaseline, raw.hardConstraints?.targetDateBaseline, '2026-09');

  const weights = raw.weights && typeof raw.weights === 'object' ? {
    cashflowWeight: Number(raw.weights.cashflowWeight ?? 8),
    freeTimeWeight: Number(raw.weights.freeTimeWeight ?? 8),
    hourlyWageWeight: Number(raw.weights.hourlyWageWeight ?? 7),
    mobilityWeight: Number(raw.weights.mobilityWeight ?? 7),
    prWeight: Number(raw.weights.prWeight ?? 6),
    learningCostWeight: Number(raw.weights.learningCostWeight ?? 8),
  } : { ...DEFAULT_USER_PROFILE.weights };

  const unifiedConstraints = {
    birthYear,
    education,
    school,
    major,
    gpa,
    englishVocabEstimate,
    currentSavingsRmb,
    monthlyRentRmb,
    monthlyFoodAndLifeRmb,
    currentMonthlyIncomeRmb,
    currentRemoteHoursPerWeek,
    targetDateBaseline,
    citizenship: raw.citizenship || raw.hardConstraints?.citizenship || '中国 (CN)',
    skills: Array.isArray(raw.skills) ? raw.skills : Array.isArray(raw.hardConstraints?.skills) ? raw.hardConstraints.skills : [],
    certs: Array.isArray(raw.certs) ? raw.certs : Array.isArray(raw.hardConstraints?.certs) ? raw.hardConstraints.certs : []
  };

  return {
    name: typeof raw.name === 'string' && raw.name ? raw.name : '探索者',
    birthYear,
    education,
    school,
    major,
    gpa,
    englishVocabEstimate,
    currentSavingsRmb,
    monthlyRentRmb,
    monthlyFoodAndLifeRmb,
    currentMonthlyIncomeRmb,
    currentRemoteHoursPerWeek,
    targetDateBaseline,
    weights,
    hardConstraints: unifiedConstraints,
    preferences: raw.preferences ? {
      weights,
      preferRemote: Boolean(raw.preferences.preferRemote ?? true),
      commuteToleranceMinutes: Number(raw.preferences.commuteToleranceMinutes ?? 30),
      prPriority: raw.preferences.prPriority || 'MEDIUM',
      openInternetPriority: raw.preferences.openInternetPriority || 'HIGH',
      riskTolerance: raw.preferences.riskTolerance || 'MEDIUM',
      maxInitialCostRmb: Number(raw.preferences.maxInitialCostRmb ?? 20000)
    } : {
      weights,
      preferRemote: true,
      commuteToleranceMinutes: 30,
      prPriority: 'MEDIUM',
      openInternetPriority: 'HIGH',
      riskTolerance: 'MEDIUM',
      maxInitialCostRmb: 20000
    },
    activeDecisionMode: raw.activeDecisionMode === 'EXECUTE' ? 'EXECUTE' : 'EXPLORE',
    pinnedPathwayId: raw.pinnedPathwayId || undefined
  };
}

/**
 * Loads user profile with automated schema migration and quarantine for corrupted data.
 */
export function loadStoredProfile(): UserProfile {
  try {
    // 1. Check v2 first
    const v2 = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (v2) {
      const parsed = JSON.parse(v2);
      return normalizeUserProfile(parsed);
    }

    // 2. Migrate from v1 if present
    const v1 = localStorage.getItem(STORAGE_KEYS.LEGACY_PROFILE_V1);
    if (v1) {
      try {
        const parsed = JSON.parse(v1);
        const migrated = normalizeUserProfile(parsed);
        saveStoredProfile(migrated);
        return migrated;
      } catch (e) {
        // Quarantine corrupted v1
        localStorage.setItem(`${STORAGE_KEYS.LEGACY_PROFILE_V1}_corrupted_${Date.now()}`, v1);
        console.warn('Corrupted legacy profile quarantined:', e);
      }
    }
  } catch (err) {
    console.error('Failed to load profile, using default:', err);
  }

  return { ...DEFAULT_USER_PROFILE };
}

export function saveStoredProfile(profile: UserProfile): void {
  try {
    const normalized = normalizeUserProfile(profile);
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(normalized));
    localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, String(CURRENT_SCHEMA_VERSION));
    localStorage.setItem(STORAGE_KEYS.LAST_MODIFIED, new Date().toISOString());
  } catch (err) {
    console.warn('Failed to save profile to localStorage:', err);
  }
}

/**
 * Loads tasks with v1 -> v2 migration and quarantine.
 */
export function loadStoredTasks(): UserPlanTask[] {
  try {
    const v2 = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (v2) {
      const parsed = JSON.parse(v2);
      if (Array.isArray(parsed)) return parsed;
    }

    const v1 = localStorage.getItem(STORAGE_KEYS.LEGACY_TASKS_V1);
    if (v1) {
      try {
        const parsed = JSON.parse(v1);
        if (Array.isArray(parsed)) {
          saveStoredTasks(parsed);
          return parsed;
        }
      } catch (e) {
        localStorage.setItem(`${STORAGE_KEYS.LEGACY_TASKS_V1}_corrupted_${Date.now()}`, v1);
      }
    }
  } catch {
    // ignore
  }

  return [...DEFAULT_INITIAL_TASKS];
}

export function saveStoredTasks(tasks: UserPlanTask[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    localStorage.setItem(STORAGE_KEYS.LAST_MODIFIED, new Date().toISOString());
  } catch (err) {
    console.warn('Failed to save tasks:', err);
  }
}

/**
 * Loads custom evidence with migration.
 */
export function loadStoredCustomEvidence(): Evidence[] {
  try {
    const v2 = localStorage.getItem(STORAGE_KEYS.CUSTOM_EVIDENCE);
    if (v2) {
      const parsed = JSON.parse(v2);
      if (Array.isArray(parsed)) return parsed;
    }

    const v1 = localStorage.getItem(STORAGE_KEYS.LEGACY_CUSTOM_EVIDENCE_V1);
    if (v1) {
      try {
        const parsed = JSON.parse(v1);
        if (Array.isArray(parsed)) {
          localStorage.setItem(STORAGE_KEYS.CUSTOM_EVIDENCE, JSON.stringify(parsed));
          return parsed;
        }
      } catch (e) {
        localStorage.setItem(`${STORAGE_KEYS.LEGACY_CUSTOM_EVIDENCE_V1}_corrupted_${Date.now()}`, v1);
      }
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveStoredCustomEvidence(evidence: Evidence[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_EVIDENCE, JSON.stringify(evidence));
  } catch (err) {
    console.warn('Failed to save custom evidence:', err);
  }
}

/**
 * Loads watchlist with migration.
 */
export function loadStoredWatchlist(): string[] {
  const defaultList = ['occ-ai-3d-asset', 'occ-german-ausbildung-tech', 'country-de', 'country-my'];
  try {
    const v2 = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
    if (v2) {
      const parsed = JSON.parse(v2);
      if (Array.isArray(parsed)) return parsed;
    }

    const v1 = localStorage.getItem(STORAGE_KEYS.LEGACY_WATCHLIST_V1);
    if (v1) {
      try {
        const parsed = JSON.parse(v1);
        if (Array.isArray(parsed)) {
          localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(parsed));
          return parsed;
        }
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }
  return defaultList;
}

export function saveStoredWatchlist(watchlist: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
  } catch (err) {
    console.warn('Failed to save watchlist:', err);
  }
}

/**
 * Creates a complete JSON export bundle containing all user business data,
 * strictly excluding any API keys or credentials.
 */
export function createExportBundle(
  profile: UserProfile,
  tasks: UserPlanTask[],
  watchlist: string[],
  customEvidence: Evidence[]
): LifeeExportBundle {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: '2.0-human-first',
    profile: normalizeUserProfile(profile),
    tasks: tasks || [],
    watchlist: watchlist || [],
    customEvidence: customEvidence || []
  };
}

export const exportUserData = createExportBundle;

/**
 * Resets user data keys from localStorage safely.
 */
export function resetAllUserData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_EVIDENCE);
    localStorage.removeItem(STORAGE_KEYS.WATCHLIST);
  } catch (err) {
    console.warn('Failed to reset user data:', err);
  }
}

/**
 * Validates an import bundle against security constraints (<1MB, valid schema).
 */
export function validateImportBundle(rawText: string): {
  valid: boolean;
  error?: string;
  bundle?: LifeeExportBundle;
  summary?: {
    profileName: string;
    savingsRmb: number;
    tasksCount: number;
    evidenceCount: number;
  };
} {
  if (!rawText || typeof rawText !== 'string') {
    return { valid: false, error: '文件内容为空' };
  }

  // Enforce 1MB payload limit
  if (rawText.length > 1024 * 1024) {
    return { valid: false, error: '备份文件超过 1MB 安全大小限制' };
  }

  try {
    const parsed = JSON.parse(rawText);
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: '非法的 JSON 对象' };
    }

    // Must at least contain profile or weights
    const profile = parsed.profile ? normalizeUserProfile(parsed.profile) : (parsed.weights ? normalizeUserProfile(parsed) : null);
    if (!profile) {
      return { valid: false, error: '备份文件中未找到有效的个人资料' };
    }

    const tasks: UserPlanTask[] = Array.isArray(parsed.tasks) ? parsed.tasks : [];
    const watchlist: string[] = Array.isArray(parsed.watchlist) ? parsed.watchlist : [];
    const customEvidence: Evidence[] = Array.isArray(parsed.customEvidence) ? parsed.customEvidence : [];

    const bundle: LifeeExportBundle = {
      schemaVersion: parsed.schemaVersion || 1,
      exportedAt: parsed.exportedAt || new Date().toISOString(),
      appVersion: parsed.appVersion || '1.0',
      profile,
      tasks,
      watchlist,
      customEvidence
    };

    return {
      valid: true,
      bundle,
      summary: {
        profileName: profile.name,
        savingsRmb: profile.currentSavingsRmb,
        tasksCount: tasks.length,
        evidenceCount: customEvidence.length
      }
    };
  } catch (err: any) {
    return { valid: false, error: `JSON 解析失败: ${err.message}` };
  }
}

/**
 * Clears ONLY application runtime caches (Service Worker & Cache Storage starting with lifee-).
 * Strictly preserves all user business data in localStorage.
 */
export async function clearApplicationCacheOnly(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of registrations) {
      if (reg.scope && reg.scope.includes('lifee')) {
        await reg.unregister();
      }
    }
  }

  if ('caches' in window) {
    const keys = await caches.keys();
    for (const key of keys) {
      if (key.startsWith('lifee-')) {
        await caches.delete(key);
      }
    }
  }
}
