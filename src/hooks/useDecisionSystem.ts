import { useState, useEffect, useMemo } from 'react';
import { UserProfile, UserPlanTask, Evidence, Occupation, Country, Pathway } from '../types';
import { DEFAULT_USER_PROFILE, DEFAULT_INITIAL_TASKS } from '../data/defaultProfile';
import { OCCUPATIONS } from '../data/occupations';
import { COUNTRIES } from '../data/countries';
import { PATHWAYS } from '../data/pathways';
import { EVIDENCE_BASE } from '../data/evidence';
import { calculateRunway } from '../engine/runway';
import { rankPathways, calculateOccupationMatchScore } from '../engine/scoring';

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

  const resetToDefaultProfile = () => {
    setProfile(DEFAULT_USER_PROFILE);
    setTasks(DEFAULT_INITIAL_TASKS);
  };

  return {
    profile,
    setProfile,
    tasks,
    updateTaskStatus,
    addTask,
    customEvidence,
    addEvidence,
    watchlist,
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
    runwayAnalysis,
    rankedPathways,
    allEvidence,
    scoredOccupations,
    resetToDefaultProfile
  };
}
