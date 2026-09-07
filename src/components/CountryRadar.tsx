import React, { useState } from 'react';
import { 
  Globe2, 
  Search, 
  HelpCircle, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Wifi, 
  Briefcase, 
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  X,
  AlertCircle,
  Sparkles,
  Target
} from 'lucide-react';
import { Country } from '../types';

interface CountryRadarProps {
  countries: Country[];
  watchlist: string[];
  onToggleWatchlist: (id: string) => void;
  selectedCountry: Country | null;
  onSelectCountry: (c: Country | null) => void;
  onTriggerResearch?: (type: 'country' | 'occupation' | 'pathway', id: string, name?: string) => void;
}

export const CountryRadar: React.FC<CountryRadarProps> = ({
  countries,
  watchlist,
  onToggleWatchlist,
  selectedCountry,
  onSelectCountry,
  onTriggerResearch
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [degreeFilter, setDegreeFilter] = useState<string>('all');
  const [questionFilter, setQuestionFilter] = useState<'all' | 'entry' | 'cost' | 'chain' | 'risk'>('all');

  const regions = [
    { id: 'all', label: '全部区域' },
    { id: 'English-Speaking', label: '英语系 (澳/新/加)' },
    { id: 'Western/Northern Europe', label: '西欧/北欧 (德/荷)' },
    { id: 'Asia', label: '亚洲跳板 (马/日)' },
  ];

  const filteredCountries = countries.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.visaRoutesSummary.some(v => v.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRegion = selectedRegion === 'all' || c.region === selectedRegion;
    const matchesDegree = degreeFilter === 'all' || c.associateDegreeFriendliness === degreeFilter;

    return matchesSearch && matchesRegion && matchesDegree;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 p-6 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  全球候选池动态筛选
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">每小时可支配购买力 & 中国护照大专现实性评估</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
                国家雷达 (Country Radar)
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                不只看热门移民中介推销的国家。结合中国护照、大专文凭受认可度、最低启动资金、网络与AI自由度、真实永居链条进行全景脱水比对。
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-xs text-slate-400">重点监测候选国:</span>
              <span className="rounded-xl bg-slate-900/90 px-3 py-1.5 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30 shadow-xs">
                {countries.length} 个核心国家
              </span>
            </div>
          </div>

          {/* Interactive Region Selector Pills */}
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {regions.map(r => {
                const isActive = selectedRegion === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRegion(r.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isActive 
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/30' 
                        : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Controls */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="搜索国家、签证类型、语言..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <select
                value={degreeFilter}
                onChange={e => setDegreeFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2 px-3 text-xs text-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
              >
                <option value="all">大专文凭友好度: 全部</option>
                <option value="极高">极高 (政策直接承认专科学历)</option>
                <option value="高">高 (双元制/技能类高度认可)</option>
                <option value="低(需认证或专升本)">低 (打分体系严重劣势)</option>
                <option value="极低(必须全日制本硕)">极低 (技术移民必须统招本硕)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Country Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCountries.map(country => {
          const isWatched = watchlist.includes(country.id);

          return (
            <div
              key={country.id}
              className="glass-card rounded-2xl border border-slate-800/80 p-5 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group shadow-lg hover:shadow-emerald-950/20"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{country.flag}</span>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {country.name} ({country.nameEn})
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">{country.region}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleWatchlist(country.id)}
                    className={`rounded-xl p-2 transition-colors ${
                      isWatched ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-500 hover:text-slate-300 bg-slate-900/60 border border-slate-800'
                    }`}
                  >
                    {isWatched ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  </button>
                </div>

                {/* Badges & Readiness Matrix */}
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  <span className="rounded-lg bg-slate-900/90 px-2.5 py-1 text-[11px] text-slate-300 border border-slate-800">
                    大专友好度: <strong className="text-emerald-400">{country.associateDegreeFriendliness}</strong>
                  </span>
                  <span className="rounded-lg bg-slate-900/90 px-2.5 py-1 text-[11px] text-slate-300 border border-slate-800">
                    最低资本: <strong className="text-amber-400">¥{country.minStartupCapitalRmb.toLocaleString()}</strong>
                  </span>
                  <span className="rounded-lg bg-indigo-500/15 px-2.5 py-1 text-[11px] font-mono text-indigo-400 border border-indigo-500/30">
                    购买力: {country.netHourlyPurchasingPowerIndex}
                  </span>
                </div>

                {/* Hard Metrics Bento Box */}
                <div className="mt-3.5 rounded-xl bg-slate-950/70 p-3 border border-slate-800/80 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">法定工时 / 带薪年假:</span>
                    <span className="text-slate-200 font-mono">
                      {country.typicalWeeklyHours}h/周 · 年假 <span className="text-emerald-400">{country.paidLeaveDaysYear}天</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">单人月均租金预估:</span>
                    <span className="text-slate-300 font-mono">约 ¥{country.monthlyRentRmbEstimate}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-slate-800/70">
                    <span className="text-slate-500">网络与AI自由度:</span>
                    <span className="text-emerald-400 flex items-center space-x-1 font-medium">
                      <Wifi className="h-3 w-3" />
                      <span>{country.aiServiceAccessibility} ({country.internetFreedomScore}/10)</span>
                    </span>
                  </div>
                </div>

                {/* Summary Verdict */}
                <div className="mt-3 text-xs text-slate-300 leading-relaxed bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2">
                  <Target className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{country.summaryVerdict}</span>
                </div>

                {/* Visa Routes Peek */}
                <div className="mt-3">
                  <span className="text-[10px] text-slate-500 block mb-1 font-medium">官方核心通道：</span>
                  <ul className="space-y-1">
                    {country.visaRoutesSummary.slice(0, 2).map((v, i) => (
                      <li key={i} className="text-[11px] text-slate-400 line-clamp-1 flex items-center space-x-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  语言: {country.secondLanguageCost}
                </span>
                <div className="flex items-center space-x-2">
                  {onTriggerResearch && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTriggerResearch('country', country.id, country.name);
                      }}
                      className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded-lg border border-indigo-500/30 transition-colors"
                      title="重新研究最新政策变动与实证差异"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>重新研究</span>
                    </button>
                  )}
                  <button
                    onClick={() => onSelectCountry(country)}
                    className="flex items-center space-x-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1.5 rounded-lg border border-emerald-500/30 transition-all"
                  >
                    <span>查看 8 个硬核回答</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Country Detail Modal */}
      {selectedCountry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl glass-panel rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{selectedCountry.flag}</span>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedCountry.name} ({selectedCountry.nameEn})
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedCountry.region} · 官方主要语言: {selectedCountry.primaryLanguage}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {onTriggerResearch && (
                  <button
                    onClick={() => onTriggerResearch('country', selectedCountry.id, selectedCountry.name)}
                    className="flex items-center space-x-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>重新研究实证差异 (Diff)</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onSelectCountry(null);
                    setQuestionFilter('all');
                  }}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Sub-header Filter Tabs */}
            <div className="mt-5 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <HelpCircle className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  针对中国大专+低启动资金背景：必须回答的 8 个国家硬核问题
                </h3>
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setQuestionFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    questionFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  全部 (8)
                </button>
                <button
                  onClick={() => setQuestionFilter('entry')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    questionFilter === 'entry' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🎯 入口资质
                </button>
                <button
                  onClick={() => setQuestionFilter('cost')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    questionFilter === 'cost' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  💰 资金语言
                </button>
                <button
                  onClick={() => setQuestionFilter('chain')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    questionFilter === 'chain' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🧭 就业永居
                </button>
                <button
                  onClick={() => setQuestionFilter('risk')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    questionFilter === 'risk' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⚠️ 风险止损
                </button>
              </div>
            </div>

            {/* 8 Questions for Country Recommendation */}
            <div className="mt-5 space-y-3.5 text-xs">
              {(questionFilter === 'all' || questionFilter === 'entry') && (
                <>
                  <div className="rounded-xl bg-slate-950/80 p-4 border border-emerald-500/30 shadow-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px]">1</span>
                      <div className="font-semibold text-emerald-400 text-sm">我现在有什么现实入口？</div>
                    </div>
                    <p className="mt-2 text-slate-300 leading-relaxed pl-7">{selectedCountry.eightQuestions.q1_realEntryPoints}</p>
                  </div>

                  <div className="rounded-xl bg-slate-950/80 p-4 border border-rose-500/30 shadow-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[11px]">4</span>
                      <div className="font-semibold text-rose-400 text-sm">我这个大专学历有什么限制？</div>
                    </div>
                    <p className="mt-2 text-slate-300 leading-relaxed pl-7">{selectedCountry.eightQuestions.q4_associateDegreeLimitations}</p>
                  </div>
                </>
              )}

              {(questionFilter === 'all' || questionFilter === 'cost') && (
                <>
                  <div className="rounded-xl bg-slate-950/80 p-4 border border-amber-500/30 shadow-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px]">2</span>
                      <div className="font-semibold text-amber-400 text-sm">最低资金大约多少？</div>
                    </div>
                    <p className="mt-2 text-slate-300 leading-relaxed pl-7">{selectedCountry.eightQuestions.q2_minimumStartupCapital}</p>
                  </div>

                  <div className="rounded-xl bg-slate-950/80 p-4 border border-indigo-500/30 shadow-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[11px]">3</span>
                      <div className="font-semibold text-indigo-400 text-sm">语言要求是什么？</div>
                    </div>
                    <p className="mt-2 text-slate-300 leading-relaxed pl-7">{selectedCountry.eightQuestions.q3_languageRequirements}</p>
                  </div>
                </>
              )}

              {(questionFilter === 'all' || questionFilter === 'chain') && (
                <>
                  <div className="rounded-xl bg-slate-950/80 p-4 border border-indigo-500/30 shadow-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[11px]">5</span>
                      <div className="font-semibold text-indigo-400 text-sm">最现实的工作是什么？</div>
                    </div>
                    <p className="mt-2 text-slate-300 leading-relaxed pl-7">{selectedCountry.eightQuestions.q5_mostRealisticJobs}</p>
                  </div>

                  <div className="rounded-xl bg-slate-950/80 p-4 border border-emerald-500/30 shadow-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px]">6</span>
                      <div className="font-semibold text-emerald-400 text-sm">到长期身份的链条是什么？</div>
                    </div>
                    <p className="mt-2 text-slate-300 leading-relaxed pl-7">{selectedCountry.eightQuestions.q6_permanentResidenceChain}</p>
                  </div>
                </>
              )}

              {(questionFilter === 'all' || questionFilter === 'risk') && (
                <>
                  <div className="rounded-xl bg-slate-950/80 p-4 border border-rose-500/30 shadow-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[11px]">7</span>
                      <div className="font-semibold text-rose-400 text-sm">最大风险是什么？</div>
                    </div>
                    <p className="mt-2 text-slate-300 leading-relaxed pl-7">{selectedCountry.eightQuestions.q7_biggestRisk}</p>
                  </div>

                  <div className="rounded-xl bg-slate-950/80 p-4 border border-amber-500/30 shadow-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px]">8</span>
                      <div className="font-semibold text-amber-400 text-sm">如果失败，我损失多少时间和钱？</div>
                    </div>
                    <p className="mt-2 text-slate-300 leading-relaxed pl-7">{selectedCountry.eightQuestions.q8_failureCostTimeAndMoney}</p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                数据基于官方移民局政策法规与大专背景实务交叉脱水
              </span>
              <button
                onClick={() => {
                  onSelectCountry(null);
                  setQuestionFilter('all');
                }}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
              >
                关闭详情
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

