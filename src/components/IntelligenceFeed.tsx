import React, { useState } from 'react';
import { Radio, AlertTriangle, ArrowRight, Filter, Search, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { IntelligenceEvent } from '../types';

interface IntelligenceFeedProps {
  events: IntelligenceEvent[];
  onSelectEvidence: (evidenceId: string) => void;
}

export const IntelligenceFeed: React.FC<IntelligenceFeedProps> = ({
  events,
  onSelectEvidence
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = [
    { id: 'all', label: '全部情报' },
    { id: '签证政策', label: '签证政策' },
    { id: '紧缺名单', label: '紧缺名单' },
    { id: '国内就业信号', label: '国内就业信号' },
  ];

  const sortedEvents = [...events].sort((a, b) => b.impactScore - a.impactScore);

  const filteredEvents = sortedEvents.filter(e => {
    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
    const matchesSearch = 
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.whatToChangeForMe.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>按个人决策破坏力排序 (Impact Score)</span>
              <span className="text-slate-500">·</span>
              <span>只呈报真正会改变行动的政策与市场信号</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              情报流 (Intelligence Stream)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              拒绝水文资讯。系统持续监控官方移民局、统计局、大厂外包管线与社区避坑反馈。任何政策门槛变更或名单调整，均直接给出“旧实情 → 新实情 → 对我有什么改变”。
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs text-slate-400">高影响信号:</span>
            <span className="rounded bg-slate-800 px-2.5 py-1 text-xs font-mono font-bold text-emerald-400 border border-slate-700">
              {filteredEvents.length} 条已捕获
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-800/80">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="搜索情报关键词、国家、工签..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Intelligence Cards Feed */}
      <div className="space-y-4">
        {filteredEvents.map(event => (
          <div
            key={event.id}
            className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 hover:border-slate-700 hover:bg-slate-900/80 transition-all space-y-3.5"
          >
            {/* 1. Header Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center space-x-2 flex-wrap gap-1">
                <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/20">
                  影响分 {event.impactScore}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  event.eventOrigin === 'LIVE_DETECTED'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                    : event.eventOrigin === 'MANUAL'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {event.eventOrigin === 'LIVE_DETECTED'
                    ? '⚡ LIVE_DETECTED (快照差分实时捕获)'
                    : event.eventOrigin === 'MANUAL'
                    ? '✍ MANUAL (人工核验便签)'
                    : '🏛 HISTORICAL_SEED (历史基准事件)'}
                </span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                  {event.category}
                </span>
                <span className="text-xs text-slate-400">国家/地区: {event.country}</span>
              </div>

              <span className="text-xs font-mono text-slate-500">{event.date}</span>
            </div>

            {/* 2. What Happened (发生了什么) */}
            <div>
              <h3 className="text-base font-bold text-white leading-snug">
                {event.title}
              </h3>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                {event.summary}
              </p>
            </div>

            {/* 3. Top Prominence: Direct Impact on Me (对我有何影响) */}
            <div className="rounded-lg bg-emerald-950/30 border border-emerald-800/40 p-3.5 flex items-start space-x-2.5 text-xs text-emerald-300 shadow-xs">
              <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-400">对我的直接决策影响与行动转向：</span>
                <span className="ml-1 text-emerald-200/95 leading-relaxed">{event.whatToChangeForMe}</span>
              </div>
            </div>

            {/* 4. Secondary: Structured Before/After Delta Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="rounded-lg bg-slate-950/80 p-3 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">
                  旧事实 / 往期基准 (Old Fact)
                </span>
                <p className="text-slate-400 leading-relaxed">{event.oldFact}</p>
              </div>

              <div className="rounded-lg bg-slate-950/80 p-3 border border-emerald-900/40">
                <span className="text-[10px] text-emerald-400 font-semibold uppercase block mb-1">
                  最新生效事实 (New Fact Verified)
                </span>
                <p className="text-slate-200 font-medium leading-relaxed">{event.newFact}</p>
              </div>
            </div>

            {/* 5. Footer: View Evidence */}
            <div className="flex justify-end pt-1">
              <button
                onClick={() => onSelectEvidence(event.evidenceId)}
                className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors touch-target-min"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>查看支撑法条与官方源证据</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
