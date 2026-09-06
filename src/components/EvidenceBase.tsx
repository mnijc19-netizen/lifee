import React, { useState } from 'react';
import { 
  FileCheck2, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Building2,
  Filter
} from 'lucide-react';
import { Evidence, SourceTier } from '../types';

interface EvidenceBaseProps {
  evidenceList: Evidence[];
}

export const EvidenceBase: React.FC<EvidenceBaseProps> = ({ evidenceList }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  const tiers: SourceTier[] = ['Tier A', 'Tier B', 'Tier C', 'Tier D', 'Tier E'];
  const countries = Array.from(new Set(evidenceList.map(e => e.country)));

  const filteredEvidence = evidenceList.filter(ev => {
    const matchesSearch = 
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.sourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.keyFactQuotes.some(q => q.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTier = tierFilter === 'all' || ev.sourceTier === tierFilter;
    const matchesCountry = countryFilter === 'all' || ev.country === countryFilter;

    return matchesSearch && matchesTier && matchesCountry;
  });

  const getTierBadgeColor = (tier: SourceTier) => {
    switch (tier) {
      case 'Tier A':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Tier B':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Tier C':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Tier D':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Tier E':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
              <span>全领域零盲猜与事实铁律</span>
              <span className="text-slate-500">·</span>
              <span>Source Tier 权威分层架构</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              证据库 (Evidence Base)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              系统中的每一个重大推荐均有据可查。严格区分 Tier A（政府法律/统计局/移民局）、Tier B（公立大学/行业注册）、Tier C（大型招聘数据）与 Tier E（真实社区避坑反馈）。
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs text-slate-400">核验证据条目:</span>
            <span className="rounded bg-slate-800 px-2.5 py-1 text-xs font-mono font-bold text-emerald-400 border border-slate-700">
              {evidenceList.length} 条已认证
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800/80">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="搜索证据标题、法条摘录、来源..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={tierFilter}
              onChange={e => setTierFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">可信等级: 全部 (Tier A~E)</option>
              {tiers.map(t => (
                <option key={t} value={t}>{t} {t === 'Tier A' ? '(最高可信度/政府移民局)' : t === 'Tier E' ? '(社区避坑/信息差)' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={countryFilter}
              onChange={e => setCountryFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">关联国家/地区: 全部</option>
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Evidence Cards List */}
      <div className="space-y-4">
        {filteredEvidence.map(ev => (
          <div
            key={ev.id}
            id={ev.id}
            className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 hover:border-slate-700 hover:bg-slate-900/80 transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <span className={`rounded px-2 py-0.5 text-xs font-mono font-bold border ${getTierBadgeColor(ev.sourceTier)}`}>
                  {ev.sourceTier}
                </span>
                <span className="text-xs font-semibold text-slate-200">{ev.sourceName}</span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-slate-400">{ev.country}</span>
              </div>

              <div className="flex items-center space-x-3 text-xs text-slate-500 font-mono">
                <span>发布: {ev.publishDate}</span>
                <span>最后核验: {ev.lastCheckDate}</span>
              </div>
            </div>

            <div>
              <div className="flex items-start justify-between">
                <h3 className="text-base font-bold text-white">
                  {ev.title}
                </h3>
                {ev.url.startsWith('http') && (
                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-xs text-emerald-400 hover:text-emerald-300 shrink-0 ml-2"
                  >
                    <span>原始链接</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                {ev.summary}
              </p>
            </div>

            {/* Key Fact Quotes */}
            <div className="rounded-lg bg-slate-950/80 p-3 border border-slate-800/80 space-y-1.5">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                官方原文/高价值实证摘录 (Key Fact Quotes)：
              </span>
              {ev.keyFactQuotes.map((quote, idx) => (
                <p key={idx} className="text-xs font-mono text-emerald-300/90 pl-3 border-l-2 border-emerald-500/50 leading-relaxed">
                  "{quote}"
                </p>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
              <div className="flex items-center space-x-1 text-emerald-400/90">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>数据置信度: {ev.confidence}</span>
              </div>
              <span className="font-mono text-[11px]">时效状态: {ev.expiredRisk}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
