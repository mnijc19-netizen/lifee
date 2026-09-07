import { useState, useEffect, useMemo, useRef } from 'react';
import { UserProfile, UserPlanTask, Evidence, Occupation, Country, Pathway } from '../types';
import { DEFAULT_USER_PROFILE, DEFAULT_INITIAL_TASKS } from '../data/defaultProfile';
import { OCCUPATIONS } from '../data/occupations';
import { COUNTRIES } from '../data/countries';
import { PATHWAYS } from '../data/pathways';
import { EVIDENCE_BASE } from '../data/evidence';
import { calculateRunway } from '../engine/runway';
import { rankPathways, calculateOccupationMatchScore } from '../engine/scoring';
import { decompressPayload } from '../engine/syncEngine';

const PROFILE_KEY = 'lifee_user_profile_v1';
const TASKS_KEY = 'lifee_user_tasks_v1';
const CUSTOM_EVIDENCE_KEY = 'lifee_custom_evidence_v1';
const WATCHLIST_KEY = 'lifee_watchlist_v1';

export function useDecisionSystem() {
  // 1. Profile State
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_USER_PROFILE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  // 2. Tasks State
  const [tasks, setTasks] = useState<UserPlanTask[]>(() => {
    try {
      const saved = localStorage.getItem(TASKS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_INITIAL_TASKS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  // 3. Custom Evidence Inbox State
  const [customEvidence, setCustomEvidence] = useState<Evidence[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_EVIDENCE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_EVIDENCE_KEY, JSON.stringify(customEvidence));
    } catch {
      // ignore
    }
  }, [customEvidence]);

  // 4. Watchlist State
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WATCHLIST_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ['occ-ai-3d-asset', 'occ-german-ausbildung-tech', 'country-de', 'country-my'];
  });

  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    } catch {
      // ignore
    }
  }, [watchlist]);

  // 5. Active Tab Navigation
  const [activeTab, setActiveTab] = useState<string>('today');

  // 6. Inspect Drawers / Modals
  const [selectedCareer, setSelectedCareer] = useState<Occupation | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedPathway, setSelectedPathway] = useState<Pathway | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiContextOpen, setIsAiContextOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 7. Computed Metrics
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

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Auto-detect and unpack sync payload from URL hash (e.g. mobile Safari opening #import=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash && hash.includes('import=')) {
      const match = hash.match(/import=([^&]+)/);
      if (match && match[1]) {
        decompressPayload(match[1]).then(payload => {
          if (payload && payload.profile) {
            setProfile(payload.profile);
            if (payload.tasks) setTasks(payload.tasks);
            if (payload.watchlist) setWatchlist(payload.watchlist);
            if (payload.customEvidence) setCustomEvidence(payload.customEvidence);
            try {
              history.replaceState(null, '', window.location.pathname);
            } catch {
              // ignore
            }
          }
        }).catch(err => console.warn('Sync import failed:', err));
      }
    }
  }, []);

  // 8. Completely Silent, Frictionless Multi-Device Auto-Sync (PC · iPhone 16 Pro · 小米 14 Pro)
  const isApplyingRemoteRef = useRef(false);
  const isInitialPullCompleteRef = useRef(false);
  const initialLocalHashRef = useRef<string>('');

  useEffect(() => {
    let isMounted = true;

    const performSilentPull = async () => {
      try {
        const { silentPullFromMaster } = await import('../engine/supabaseSync');
        const remote = await silentPullFromMaster();
        if (remote && remote.profile && isMounted) {
          const localUpdated = localStorage.getItem('lifee_last_local_mod_at');
          if (!localUpdated || new Date(remote.updatedAt) > new Date(localUpdated)) {
            isApplyingRemoteRef.current = true;
            setProfile(remote.profile);
            if (remote.tasks) setTasks(remote.tasks);
            if (remote.watchlist) setWatchlist(remote.watchlist);
            if (remote.customEvidence) setCustomEvidence(remote.customEvidence);
            localStorage.setItem('lifee_last_local_mod_at', remote.updatedAt);
          }
        }
      } catch {
        // silent background failure handling
      } finally {
        isInitialPullCompleteRef.current = true;
      }
    };

    // Pull immediately on app mount
    performSilentPull();

    // Pull whenever user switches back to browser tab (iOS Safari or Xiaomi browser)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        performSilentPull();
      }
    };

    window.addEventListener('focus', performSilentPull);
    document.addEventListener('visibilitychange', handleVisibility);

    // Periodic heartbeat poll every 20 seconds
    const interval = setInterval(performSilentPull, 20000);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', performSilentPull);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, []);

  // Silent push whenever profile, tasks, watchlist, or customEvidence change locally
  useEffect(() => {
    // 1. If this state update was triggered by pulling from remote, do NOT echo it back
    if (isApplyingRemoteRef.current) {
      isApplyingRemoteRef.current = false;
      return;
    }

    // 2. Prevent cold mount on a new device from overwriting existing cloud state before initial pull
    if (!isInitialPullCompleteRef.current) {
      return;
    }

    const currentHash = JSON.stringify({ profile, tasks, watchlist, customEvidence });
    if (initialLocalHashRef.current === currentHash) {
      return;
    }
    initialLocalHashRef.current = currentHash;

    const nowIso = new Date().toISOString();
    localStorage.setItem('lifee_last_local_mod_at', nowIso);
    import('../engine/supabaseSync').then(({ silentPushToMaster }) => {
      import('../engine/syncEngine').then(({ getOrCreateDeviceId }) => {
        silentPushToMaster({
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
    resetToDefaultProfile
  };
}
