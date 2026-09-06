import React from 'react';
import { 
  Compass, 
  Briefcase, 
  Globe2, 
  Milestone, 
  Scale, 
  Radio, 
  FileCheck2, 
  CalendarCheck, 
  Flame, 
  Sparkles, 
  Search, 
  Copy, 
  Settings2, 
  Activity,
  PlusCircle,
  ShieldCheck
} from 'lucide-react';
import { RunwayAnalysis } from '../engine/runway';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  runway: RunwayAnalysis;
  onOpenSearch: () => void;
  onOpenAiContext: () => void;
  onOpenSettings: () => void;
  onOpenManualInbox: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  runway,
  onOpenSearch,
  onOpenAiContext,
  onOpenSettings,
  onOpenManualInbox
}) => {
  const navItems = [
    { id: 'today', label: '今日决策', icon: Compass },
    { id: 'careers', label: '职业雷达', icon: Briefcase },
    { id: 'countries', label: '国家雷达', icon: Globe2 },
    { id: 'pathways', label: '路线探索', icon: Milestone },
    { id: 'compare', label: '多维对比', icon: Scale },
    { id: 'intelligence', label: '情报流', icon: Radio },
    { id: 'evidence', label: '证据库', icon: FileCheck2 },
    { id: 'myplan', label: '行动计划', icon: CalendarCheck },
    { id: 'runway', label: '生存现金流', icon: Flame },
    { id: 'lowregret', label: '低后悔投资', icon: ShieldCheck },
    { id: 'aiadvisor', label: 'AI 顾问', icon: Sparkles },
    { id: 'datahealth', label: '数据健康', icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      {/* Top Utility Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        <div className="flex items-center space-x-3">
          <div 
            onClick={() => setActiveTab('today')}
            className="flex cursor-pointer items-center space-x-2 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:bg-emerald-500/30 transition-colors">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold tracking-tight text-white text-base">Lifee</span>
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20 hidden xs:inline">
                  决策情报系统
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Personal Career & Global Life Decision Intelligence</p>
            </div>
          </div>
        </div>

        {/* Global Utilities & Status */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          {/* Runway Indicator */}
          <button
            onClick={() => setActiveTab('runway')}
            className={`flex shrink-0 whitespace-nowrap items-center space-x-1 rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${
              runway.isSelfSustaining
                ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60'
                : runway.survivalMonths < 2
                ? 'bg-rose-950/60 border-rose-800/60 text-rose-300 animate-pulse'
                : 'bg-amber-950/60 border-amber-800/60 text-amber-300'
            }`}
            title="点击查看生存现金流分析"
          >
            <Flame className="h-3.5 w-3.5 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              {runway.isSelfSustaining ? '现金流稳态' : `Runway: ${runway.survivalMonths}月`}
            </span>
          </button>

          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-700 hover:bg-slate-800 transition-colors"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden md:inline">全局检索 (电工/德国/工签)</span>
            <kbd className="hidden lg:inline rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-700">
              Ctrl K
            </kbd>
          </button>

          {/* Manual Evidence Quick Add */}
          <button
            onClick={onOpenManualInbox}
            className="flex items-center space-x-1 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
            title="手动录入新情报/帖子/链接"
          >
            <PlusCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">录入情报</span>
          </button>

          {/* Copy AI Context */}
          <button
            onClick={onOpenAiContext}
            className="flex items-center space-x-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 transition-colors"
            title="一键复制个人画像与Top3路线Markdown上下文，可直接粘贴给ChatGPT/Codex/Antigravity"
          >
            <Copy className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Copy AI Context</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="rounded-lg border border-slate-800 bg-slate-900/60 p-1.5 text-slate-400 hover:border-slate-700 hover:text-white transition-colors"
            title="个人画像与权重设置"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Tab Navigation - Horizontal Scrollable on Mobile */}
      <nav className="mx-auto flex max-w-7xl space-x-1 overflow-x-auto px-4 pb-1 sm:px-6 no-scrollbar">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex shrink-0 items-center space-x-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-all ${
                isActive
                  ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5 rounded-t-md'
                  : 'border-transparent text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
