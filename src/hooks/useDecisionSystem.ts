import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { UserProfile, UserPlanTask, Evidence, Occupation, Country, Pathway } from '../types';
import { DEFAULT_USER_PROFILE, DEFAULT_INITIAL_TASKS } from '../data/defaultProfile';
import { OCCUPATIONS } from '../data/occupations';
import { COUNTRIES } from '../data/countries';
import { PATHWAYS } from '../data/pathways';
import { EVIDENCE_BASE } from '../data/evidence';
import { calculateRunway } from '../engine/runway';
import { rankPathways, calculateOccupationMatchScore } from '../engine/scoring';
import { decompressPayload } from '../engine/syncEngine';
import { 
  loadStoredProfile, 
  saveStoredProfile, 
  loadStoredTasks, 
  saveStoredTasks, 
  loadStoredCustomEvidence, 
  saveStoredCustomEvidence, 
  loadStoredWatchlist, 
  saveStoredWatchlist,
  validateImportBundle,
  LifeeExportBundle,
  normalizeUserProfile
} from '../utils/storageEngine';
import { isUserSyncEnabled, getUserSyncSlotId } from '../config/cloudSyncConfig';

const VALID_TABS = new Set([
  'today',
  'careers',
  'countries',
  'pathways',
  'compare',
  'intelligence',
  'evidence',
  'myplan',
  'runway',
  'lowregret',
  'aiadvisor',
  'datahealth'
]);

function getInitialTab(): string {
  if (typeof window === 'undefined') return 'today';
  const hash = window.location.hash.replace(/^#/, '');
  const tabMatch = hash.match(/tab=([a-z0-9-]+)/i);
  if (tabMatch && VALID_TABS.has(tabMatch[1])) {
    return tabMatch[1];
  }
  if (VALID_TABS.has(hash)) {
    return hash;
  }
  return 'today';
}

export function useDecisionSystem() {
  // 1. Profile State with Schema Migration and Quarantine Support
  const [profile, setProfile] = useState<UserProfile>(() => loadStoredProfile());

  useEffect(() => {
    saveStoredProfile(profile);
  }, [profile]);

  // 2. Tasks State with Schema Migration and Quarantine Support
  const [tasks, setTasks] = useState<UserPlanTask[]>(() => loadStoredTasks());

  useEffect(() => {
    saveStoredTasks(tasks);
  }, [tasks]);

  // 3. Custom Evidence Inbox State
  const [customEvidence, setCustomEvidence] = useState<Evidence[]>(() => loadStoredCustomEvidence());

  useEffect(() => {
    saveStoredCustomEvidence(customEvidence);
  }, [customEvidence]);

  // 4. Watchlist State
  const [watchlist, setWatchlist] = useState<string[]>(() => loadStoredWatchlist());

  useEffect(() => {
    saveStoredWatchlist(watchlist);
  }, [watchlist]);

  // 5. Active Tab Navigation with URL Hash Synchronization & Back/Forward Support
  const [activeTab, setActiveTabState] = useState<string>(getInitialTab);

  const setActiveTab = useCallback((newTab: string) => {
    if (!VALID_TABS.has(newTab)) return;
    setActiveTabState(newTab);
    if (typeof window !== 'undefined') {
      const targetHash = newTab === 'today' ? '' : `#tab=${newTab}`;
      if (window.location.hash !== targetHash) {
        try {
          history.pushState(null, '', targetHash || window.location.pathname);
        } catch {
          window.location.hash = targetHash;
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleHashChange = () => {
      const current = getInitialTab();
      setActiveTabState(current);
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  // 6. Inspect Drawers / Modals
  const [selectedCareer, setSelectedCareer] = useState<Occupation | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedPathway, setSelectedPathway] = useState<Pathway | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiContextOpen, setIsAiContextOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // 7. Safe Import Preview (No Auto-Overwrite)
  const [pendingImportBundle, setPendingImportBundle] = useState<LifeeExportBundle | null>(null);
  const [isImportPreviewOpen, setIsImportPreviewOpen] = useState(false);

  // Parse sync import from URL hash with explicit preview & zero unconfirmed overwrite
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash && hash.includes('import=')) {
      const match = hash.match(/import=([^&]+)/);
      if (match && match[1]) {
        decompressPayload(match[1]).then(payload => {
          if (payload) {
            const rawJson = JSON.stringify(payload);
            const validation = validateImportBundle(rawJson);
            if (validation.valid && validation.bundle) {
              setPendingImportBundle(validation.bundle);
              setIsImportPreviewOpen(true);
            }
            try {
              // Clean import hash so reloads don't re-trigger preview
              history.replaceState(null, '', window.location.pathname);
            } catch {
              // ignore
            }
          }
        }).catch(err => console.warn('Sync import decompression failed:', err));
      }
    }
  }, []);

  const applyPendingImport = useCallback(() => {
    if (!pendingImportBundle) return;
    setProfile(pendingImportBundle.profile);
    if (pendingImportBundle.tasks) setTasks(pendingImportBundle.tasks);
    if (pendingImportBundle.watchlist) setWatchlist(pendingImportBundle.watchlist);
    if (pendingImportBundle.customEvidence) setCustomEvidence(pendingImportBundle.customEvidence);
    setPendingImportBundle(null);
    setIsImportPreviewOpen(false);
  }, [pendingImportBundle]);

  const cancelPendingImport = useCallback(() => {
    setPendingImportBundle(null);
    setIsImportPreviewOpen(false);
  }, []);

  // 8. Computed Metrics
  const runwayAnalysis = useMemo(() => calculateRunway(profile), [profile]);
  const rankedPathways = useMemo(() => rankPathways(PATHWAYS, profile), [profile]);
  const allEvidence = useMemo(() => [...EVIDENCE_BASE, ...customEvidence], [customEvidence]);
  const scoredOccupations = useMemo(() => {
    return OCCUPATIONS.map(occ => ({
      ...occ,
      dynamicMatchScore: calculateOccupationMatchScore(occ, profile)
    })).sort((a, b) => b.dynamicMatchScore - a.dynamicMatchScore);
  }, [profile]);

  // Actions
  const toggleWatchlist = (id: string) => {
    setWatchlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const updateTaskStatus = (taskId: string, status: UserPlanTask['status']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  };

  const addTask = (task: Omit<UserPlanTask, 'id'>) => {
    const newTask: UserPlanTask = {
      ...task,
      id: `task-${Date.now()}`
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const addEvidence = (ev: Omit<Evidence, 'id' | 'fetchDate' | 'lastCheckDate'>) => {
    const newEv: Evidence = {
      ...ev,
      id: `ev-custom-${Date.now()}`,
      fetchDate: new Date().toISOString().split('T')[0],
      lastCheckDate: new Date().toISOString().split('T')[0]
    };
    setCustomEvidence(prev => [newEv, ...prev]);
  };

  // 9. Cloud Sync strictly gated by user permission & isolated pairing slot
  const isApplyingRemoteRef = useRef(false);
  const isInitialPullCompleteRef = useRef(false);
  const initialLocalHashRef = useRef<string>('');

  useEffect(() => {
    let isMounted = true;

    const performIsolatedPull = async () => {
      // Cloud sync ONLY runs if user explicitly opted in and has configured a slot
      if (!isUserSyncEnabled()) {
        isInitialPullCompleteRef.current = true;
        return;
      }

      try {
        const { pullUserIsolatedState } = await import('../engine/supabaseSync');
        const remote = await pullUserIsolatedState();
        if (remote && remote.profile && isMounted) {
          const localUpdated = localStorage.getItem('lifee_last_local_mod_at');
          if (!localUpdated || new Date(remote.updatedAt) > new Date(localUpdated)) {
            isApplyingRemoteRef.current = true;
            setProfile(normalizeUserProfile(remote.profile));
            if (remote.tasks) setTasks(remote.tasks);
            if (remote.watchlist) setWatchlist(remote.watchlist);
            if (remote.customEvidence) setCustomEvidence(remote.customEvidence);
            localStorage.setItem('lifee_last_local_mod_at', remote.updatedAt);
          }
        }
      } catch (err) {
        console.warn('Isolated pull error:', err);
      } finally {
        isInitialPullCompleteRef.current = true;
      }
    };

    performIsolatedPull();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        performIsolatedPull();
      }
    };

    window.addEventListener('focus', performIsolatedPull);
    document.addEventListener('visibilitychange', handleVisibility);

    const interval = setInterval(() => {
      if (isUserSyncEnabled()) {
        performIsolatedPull();
      }
    }, 30000);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', performIsolatedPull);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, []);

  // Isolated push when state changes and sync is user-enabled
  useEffect(() => {
    if (!isUserSyncEnabled()) return;
    if (isApplyingRemoteRef.current) {
      isApplyingRemoteRef.current = false;
      return;
    }
    if (!isInitialPullCompleteRef.current) return;

    const currentHash = JSON.stringify({ profile, tasks, watchlist, customEvidence });
    if (initialLocalHashRef.current === currentHash) return;
    initialLocalHashRef.current = currentHash;

    const nowIso = new Date().toISOString();
    localStorage.setItem('lifee_last_local_mod_at', nowIso);

    import('../engine/supabaseSync').then(({ pushUserIsolatedState }) => {
      import('../engine/syncEngine').then(({ getOrCreateDeviceId }) => {
        pushUserIsolatedState({
          version: 1,
          updatedAt: nowIso,
          deviceId: getOrCreateDeviceId(),
          profile,
          tasks,
          watchlist,
          customEvidence
        });
      });
    }).catch(() => {});
  }, [profile, tasks, watchlist, customEvidence]);

  const resetToDefaultProfile = () => {
    setProfile(DEFAULT_USER_PROFILE);
    setTasks(DEFAULT_INITIAL_TASKS);
  };

  return {
    profile,
    setProfile,
    tasks,
    setTasks,
    updateTaskStatus,
    addTask,
    customEvidence,
    setCustomEvidence,
    addEvidence,
    watchlist,
    setWatchlist,
    toggleWatchlist,
    activeTab,
    setActiveTab,
    selectedCareer,
    setSelectedCareer,
    selectedCountry,
    setSelectedCountry,
    selectedPathway,
    setSelectedPathway,
    isSearchOpen,
    setIsSearchOpen,
    isAiContextOpen,
    setIsAiContextOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isSyncModalOpen,
    setIsSyncModalOpen,
    runwayAnalysis,
    rankedPathways,
    allEvidence,
    scoredOccupations,
    resetToDefaultProfile,
    pendingImportBundle,
    isImportPreviewOpen,
    applyPendingImport,
    cancelPendingImport
  };
}
