import React, { useState } from 'react';
import { 
  Compass, 
  Milestone, 
  CalendarCheck, 
  Sparkles, 
  MoreHorizontal,
  Briefcase,
  Globe2,
  Scale,
  Radio,
  FileCheck2,
  Flame,
  ShieldCheck,
  Activity,
  Search,
  Settings2,
  X,
  Smartphone
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onOpenSync?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  onOpenSettings,
  onOpenSync
}) => {
  const [activeSheet, setActiveSheet] = useState<'routes' | 'more' | null>(null);

  const routeTabs = [
    { id: 'pathways', label: '路线探索', icon: Milestone, desc: '多阶段演进与里程碑' },
    { id: 'careers', label: '职业雷达', icon: Briefcase, desc: '紧缺工种与匹配度' },
    { id: 'countries', label: '国家雷达', icon: Globe2, desc: '移民政策与定居可行性' },
    { id: 'compare', label: '多维对比', icon: Scale, desc: '横向多维决策对齐' },
  ];

  const moreTabs = [
    { id: 'intelligence', label: '情报流', icon: Radio, desc: '政策与市场最新异动' },
    { id: 'evidence', label: '证据库', icon: FileCheck2, desc: '原子事实与官方存证' },
    { id: 'runway', label: '生存现金流', icon: Flame, desc: '财务安全与缓冲月数' },
    { id: 'lowregret', label: '低后悔投资', icon: ShieldCheck, desc: '不可逆损失防范' },
    { id: 'datahealth', label: '数据健康', icon: Activity, desc: '规则与采集器真实性' },
  ];

  const isRouteActive = ['pathways', 'careers', 'countries', 'compare'].includes(activeTab);
  const isMoreActive = ['intelligence', 'evidence', 'runway', 'lowregret', 'datahealth'].includes(activeTab);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setActiveSheet(null);
  };

  return (
    <>
      {/* Popover Sheet Backdrop */}
      {activeSheet && (
        <div 
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
          onClick={() => setActiveSheet(null)}
        />
      )}

      {/* Routes Popover Sheet */}
      {activeSheet === 'routes' && (
        <div className="fixed bottom-16 left-0 right-0 z-50 rounded-t-2xl border-t border-slate-800 bg-slate-900/98 p-4 shadow-2xl backdrop-blur-xl md:hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <span className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Milestone className="w-4 h-4 text-emerald-400" />
              路线中心
            </span>
            <button 
              onClick={() => setActiveSheet(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white touch-target-min flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-3">
            {routeTabs.map((item) => {
              const Icon = item.icon;
              const isCurrent = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-colors min-h-[56px] touch-target-min ${
                    isCurrent 
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-white' 
                      : 'border-slate-800 bg-slate-800/50 text-slate-300 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isCurrent ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1">{item.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* More Popover Sheet */}
      {activeSheet === 'more' && (
        <div className="fixed bottom-16 left-0 right-0 z-50 max-h-[75vh] overflow-y-auto rounded-t-2xl border-t border-slate-800 bg-slate-900/98 p-4 shadow-2xl backdrop-blur-xl md:hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <span className="text-sm font-semibold text-white flex items-center gap-1.5">
              <MoreHorizontal className="w-4 h-4 text-emerald-400" />
              更多工具与分析
            </span>
            <button 
              onClick={() => setActiveSheet(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white touch-target-min flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-1.5 pt-3">
            {moreTabs.map((item) => {
              const Icon = item.icon;
              const isCurrent = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex w-full items-center justify-between p-3 rounded-xl border transition-colors min-h-[48px] touch-target-min ${
                    isCurrent 
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-white' 
                      : 'border-slate-800/80 bg-slate-800/40 text-slate-300 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isCurrent ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-xs text-slate-400">{item.desc}</span>
                </button>
              );
            })}
            
            <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-2">
              <button
                onClick={() => { setActiveSheet(null); onOpenSearch(); }}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-300 font-medium min-h-[44px]"
              >
                <Search className="w-3.5 h-3.5" />
                搜索
              </button>
              {onOpenSync && (
                <button
                  onClick={() => { setActiveSheet(null); onOpenSync(); }}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-xs text-emerald-300 font-medium min-h-[44px]"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  多端同步
                </button>
              )}
              <button
                onClick={() => { setActiveSheet(null); onOpenSettings(); }}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-300 font-medium min-h-[44px]"
              >
                <Settings2 className="w-3.5 h-3.5" />
                画像
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Fixed Bottom Bar */}
      <nav 
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-800/90 bg-slate-950/95 px-2 py-1 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)' }}
      >
        {/* 1. 今日 */}
        <button
          onClick={() => { setActiveSheet(null); setActiveTab('today'); }}
          className={`flex flex-1 flex-col items-center justify-center py-1.5 touch-target-min transition-colors ${
            activeTab === 'today' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="h-5 w-5 mb-0.5" />
          <span className="text-[11px]">今日</span>
        </button>

        {/* 2. 路线 */}
        <button
          onClick={() => {
            if (activeSheet === 'routes') {
              setActiveSheet(null);
            } else {
              setActiveSheet('routes');
            }
          }}
          className={`flex flex-1 flex-col items-center justify-center py-1.5 touch-target-min transition-colors ${
            isRouteActive || activeSheet === 'routes' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Milestone className="h-5 w-5 mb-0.5" />
          <span className="text-[11px]">路线</span>
        </button>

        {/* 3. 行动 */}
        <button
          onClick={() => { setActiveSheet(null); setActiveTab('myplan'); }}
          className={`flex flex-1 flex-col items-center justify-center py-1.5 touch-target-min transition-colors ${
            activeTab === 'myplan' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarCheck className="h-5 w-5 mb-0.5" />
          <span className="text-[11px]">行动</span>
        </button>

        {/* 4. AI */}
        <button
          onClick={() => { setActiveSheet(null); setActiveTab('aiadvisor'); }}
          className={`flex flex-1 flex-col items-center justify-center py-1.5 touch-target-min transition-colors ${
            activeTab === 'aiadvisor' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="h-5 w-5 mb-0.5" />
          <span className="text-[11px]">AI</span>
        </button>

        {/* 5. 更多 */}
        <button
          onClick={() => {
            if (activeSheet === 'more') {
              setActiveSheet(null);
            } else {
              setActiveSheet('more');
            }
          }}
          className={`flex flex-1 flex-col items-center justify-center py-1.5 touch-target-min transition-colors ${
            isMoreActive || activeSheet === 'more' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MoreHorizontal className="h-5 w-5 mb-0.5" />
          <span className="text-[11px]">更多</span>
        </button>
      </nav>
    </>
  );
};

export default MobileBottomNav;
