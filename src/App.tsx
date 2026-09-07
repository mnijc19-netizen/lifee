import React, { useState } from 'react';
import { useDecisionSystem } from './hooks/useDecisionSystem';
import { Navbar } from './components/Navbar';
import { TodayDashboard } from './components/TodayDashboard';
import { CareerRadar } from './components/CareerRadar';
import { CountryRadar } from './components/CountryRadar';
import { PathExplorer } from './components/PathExplorer';
import { MultiCompare } from './components/MultiCompare';
import { IntelligenceFeed } from './components/IntelligenceFeed';
import { EvidenceBase } from './components/EvidenceBase';
import { MyPlanHub } from './components/MyPlanHub';
import { RunwayCalculator } from './components/RunwayCalculator';
import { LowRegretView } from './components/LowRegretView';
import { AiAdvisorChat } from './components/AiAdvisorChat';
import { DataHealth } from './components/DataHealth';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AiContextModal } from './components/AiContextModal';
import { SettingsModal } from './components/SettingsModal';
import { ManualInbox } from './components/ManualInbox';
import { ResearchModal } from './components/ResearchModal';
import { SyncModal } from './components/SyncModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { INTELLIGENCE_STREAM } from './data/intelligence';
import { COUNTRIES } from './data/countries';

export function App() {
  const {
    profile,
    setProfile,
    tasks,
    setTasks,
    updateTaskStatus,
    addTask,
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
    customEvidence,
    setCustomEvidence,
    addEvidence
  } = useDecisionSystem();

  const [isManualInboxOpen, setIsManualInboxOpen] = useState(false);
  const [researchTarget, setResearchTarget] = useState<{
    isOpen: boolean;
    type: 'country' | 'occupation' | 'pathway' | null;
    id: string | null;
    name?: string;
  }>({
    isOpen: false,
    type: null,
    id: null,
  });

  const handleTriggerResearch = (type: 'country' | 'occupation' | 'pathway', id: string, name?: string) => {
    setResearchTarget({
      isOpen: true,
      type,
      id,
      name,
    });
  };

  const handleNavigate = (tab: string, targetId?: string) => {
    setActiveTab(tab);
    if (tab === 'careers' && targetId) {
      const target = scoredOccupations.find(o => o.id === targetId);
      if (target) setSelectedCareer(target);
    } else if (tab === 'countries' && targetId) {
      const target = COUNTRIES.find(c => c.id === targetId);
      if (target) setSelectedCountry(target);
    } else if (tab === 'pathways' && targetId) {
      const target = rankedPathways.find(p => p.id === targetId);
      if (target) setSelectedPathway(target);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        runway={runwayAnalysis}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAiContext={() => setIsAiContextOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenManualInbox={() => setIsManualInboxOpen(true)}
        onOpenSync={() => setIsSyncModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 pb-24 md:pb-12">
        {activeTab === 'today' && (
          <TodayDashboard
            profile={profile}
            setProfile={setProfile}
            runway={runwayAnalysis}
            topPathways={rankedPathways}
            intelligence={INTELLIGENCE_STREAM}
            onSelectPathway={(p) => {
              setSelectedPathway(p);
              setActiveTab('pathways');
            }}
            onNavigateTab={setActiveTab}
            onOpenAiContext={() => setIsAiContextOpen(true)}
          />
        )}

        {activeTab === 'careers' && (
          <CareerRadar
            occupations={scoredOccupations}
            watchlist={watchlist}
            onToggleWatchlist={toggleWatchlist}
            selectedCareer={selectedCareer}
            onSelectCareer={setSelectedCareer}
            onTriggerResearch={handleTriggerResearch}
          />
        )}

        {activeTab === 'countries' && (
          <CountryRadar
            countries={COUNTRIES}
            watchlist={watchlist}
            onToggleWatchlist={toggleWatchlist}
            selectedCountry={selectedCountry}
            onSelectCountry={setSelectedCountry}
            onTriggerResearch={handleTriggerResearch}
          />
        )}

        {activeTab === 'pathways' && (
          <PathExplorer
            pathways={rankedPathways}
            profile={profile}
            selectedPathway={selectedPathway}
            onSelectPathway={setSelectedPathway}
            onNavigateTab={setActiveTab}
            onTriggerResearch={handleTriggerResearch}
          />
        )}

        {activeTab === 'compare' && <MultiCompare />}

        {activeTab === 'intelligence' && (
          <IntelligenceFeed
            events={INTELLIGENCE_STREAM}
            onSelectEvidence={(_evId) => {
              setActiveTab('evidence');
            }}
          />
        )}

        {activeTab === 'evidence' && <EvidenceBase evidenceList={allEvidence} />}

        {activeTab === 'myplan' && (
          <MyPlanHub
            tasks={tasks}
            onUpdateStatus={updateTaskStatus}
            onAddTask={addTask}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'runway' && (
          <RunwayCalculator
            profile={profile}
            setProfile={setProfile}
            pathways={rankedPathways}
            onSelectPathway={(p) => {
              setSelectedPathway(p);
              setActiveTab('pathways');
            }}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'lowregret' && <LowRegretView onNavigateTab={setActiveTab} />}

        {activeTab === 'aiadvisor' && (
          <AiAdvisorChat
            profile={profile}
            onOpenAiContext={() => setIsAiContextOpen(true)}
            onAddTask={addTask}
          />
        )}

        {activeTab === 'datahealth' && <DataHealth />}
      </main>

      {/* Modals & Dialogs */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      <AiContextModal
        isOpen={isAiContextOpen}
        onClose={() => setIsAiContextOpen(false)}
        profile={profile}
        topPathways={rankedPathways}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        setProfile={setProfile}
        onResetDefaults={resetToDefaultProfile}
      />

      <ResearchModal
        isOpen={researchTarget.isOpen}
        onClose={() => setResearchTarget({ isOpen: false, type: null, id: null })}
        targetType={researchTarget.type}
        targetId={researchTarget.id}
        targetName={researchTarget.name}
        profile={profile}
        watchlist={watchlist}
        onToggleWatchlist={toggleWatchlist}
      />

      <ManualInbox
        isOpen={isManualInboxOpen}
        onClose={() => setIsManualInboxOpen(false)}
        onAddEvidence={addEvidence}
      />

      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        profile={profile}
        setProfile={setProfile}
        tasks={tasks}
        setTasks={setTasks}
        watchlist={watchlist}
        setWatchlist={setWatchlist}
        customEvidence={customEvidence}
        setCustomEvidence={setCustomEvidence}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSync={() => setIsSyncModalOpen(true)}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-400">Lifee Decision Intelligence</span>
            <span>·</span>
            <span>2026 个人决策情报系统</span>
          </div>
          <div className="text-[11px] text-slate-500">
            全领域零盲猜与事实铁律驱动 · 本地优先隐私保护
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
