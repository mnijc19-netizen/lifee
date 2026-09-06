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
  Sparkles
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
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
              <span>全球候选池动态筛选</span>
              <span className="text-slate-500">·</span>
              <span>每小时可支配购买力 & 中国护照大专现实性评估</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              国家雷达 (Country Radar)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              不只看热门移民中介推销的国家。结合中国护照、大专文凭受认可度、最低启动资金、网络与AI自由度、真实永居链条进行全景脱水比对。
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs text-slate-400">重点监测候选国:</span>
            <span className="rounded bg-slate-800 px-2.5 py-1 text-xs font-mono font-bold text-emerald-400 border border-slate-700">
              {countries.length} 个核心国家
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800/80">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="搜索国家、签证类型、语言..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">区域: 全部区域</option>
              <option value="English-Speaking">传统英语系国家 (澳/新/加等)</option>
              <option value="Western/Northern Europe">西欧/北欧国家 (德/荷等)</option>
              <option value="Asia">亚洲跳板/近邻 (马/日/新等)</option>
            </select>
          </div>

          <div>
            <select
              value={degreeFilter}
              onChange={e => setDegreeFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
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

      {/* Country Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCountries.map(country => {
          const isWatched = watchlist.includes(country.id);

          return (
            <div
              key={country.id}
              className="group relative rounded-xl border border-slate-800 bg-slate-900/40 p-4 hover:border-slate-700 hover:bg-slate-900/80 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-2xl">{country.flag}</span>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {country.name} ({country.nameEn})
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">{country.region}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleWatchlist(country.id)}
                    className={`rounded p-1.5 transition-colors ${
                      isWatched ? 'text-amber-400 bg-amber-500/10' : 'text-slate-600 hover:text-slate-300'
                    }`}
                  >
                    {isWatched ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  </button>
                </div>

                {/* Badges & Readiness Matrix */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-700">
                    大专友好度: <strong className="text-emerald-400">{country.associateDegreeFriendliness}</strong>
                  </span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-700">
                    最低资本: <strong className="text-amber-400">¥{country.minStartupCapitalRmb.toLocaleString()}</strong>
                  </span>
                  <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono text-indigo-400 border border-indigo-500/20">
                    购买力指数: {country.netHourlyPurchasingPowerIndex}
                  </span>
                </div>

                {/* Hard Metrics Box */}
                <div className="mt-3 rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">法定工时 / 带薪年假:</span>
                    <span className="text-slate-200 font-mono">
                      {country.typicalWeeklyHours}h / 周 · 年假 {country.paidLeaveDaysYear} 天
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">单人月均租金预估:</span>
                    <span className="text-slate-300 font-mono">约 ¥{country.monthlyRentRmbEstimate}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-800/60">
                    <span className="text-slate-500">网络与AI自由度:</span>
                    <span className="text-emerald-400 flex items-center space-x-1">
                      <Wifi className="h-3 w-3" />
                      <span>{country.aiServiceAccessibility} ({country.internetFreedomScore}/10)</span>
                    </span>
                  </div>
                </div>

                {/* Summary Verdict */}
                <p className="mt-3 text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2 rounded border border-slate-800">
                  {country.summaryVerdict}
                </p>

                {/* Visa Routes Peek */}
                <div className="mt-2.5">
                  <span className="text-[10px] text-slate-500 block mb-1">官方核心通道：</span>
                  <ul className="space-y-1">
                    {country.visaRoutesSummary.slice(0, 2).map((v, i) => (
                      <li key={i} className="text-[11px] text-slate-400 line-clamp-1 flex items-center space-x-1">
                        <span className="h-1 w-1 rounded-full bg-emerald-400" />
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  语言门槛: {country.secondLanguageCost}
                </span>
                <div className="flex items-center space-x-2">
                  {onTriggerResearch && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTriggerResearch('country', country.id, country.name);
                      }}
                      className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded border border-indigo-500/30 transition-colors"
                      title="重新研究最新政策变动与实证差异"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>重新研究</span>
                    </button>
                  )}
                  <button
                    onClick={() => onSelectCountry(country)}
                    className="flex items-center space-x-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
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
                    className="flex items-center space-x-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>重新研究实证差异 (Diff)</span>
                  </button>
                )}
                <button
                  onClick={() => onSelectCountry(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* 8 Questions for Country Recommendation */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-2">
                <HelpCircle className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  针对中国大专+低启动资金背景：必须回答的 8 个国家硬核问题
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                  <div className="font-semibold text-emerald-400">1. 我现在有什么现实入口？</div>
                  <p className="mt-1 text-slate-300 leading-relaxed">{selectedCountry.eightQuestions.q1_realEntryPoints}</p>
                </div>

                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                  <div className="font-semibold text-amber-400">2. 最低资金大约多少？</div>
                  <p className="mt-1 text-slate-300 leading-relaxed">{selectedCountry.eightQuestions.q2_minimumStartupCapital}</p>
                </div>

                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                  <div className="font-semibold text-emerald-400">3. 语言要求是什么？</div>
                  <p className="mt-1 text-slate-300 leading-relaxed">{selectedCountry.eightQuestions.q3_languageRequirements}</p>
                </div>

                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                  <div className="font-semibold text-rose-400">4. 我这个大专学历有什么限制？</div>
                  <p className="mt-1 text-slate-300 leading-relaxed">{selectedCountry.eightQuestions.q4_associateDegreeLimitations}</p>
                </div>

                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                  <div className="font-semibold text-indigo-400">5. 最现实的工作是什么？</div>
                  <p className="mt-1 text-slate-300 leading-relaxed">{selectedCountry.eightQuestions.q5_mostRealisticJobs}</p>
                </div>

                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                  <div className="font-semibold text-emerald-400">6. 到长期身份的链条是什么？</div>
                  <p className="mt-1 text-slate-300 leading-relaxed">{selectedCountry.eightQuestions.q6_permanentResidenceChain}</p>
                </div>

                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                  <div className="font-semibold text-rose-400">7. 最大风险是什么？</div>
                  <p className="mt-1 text-slate-300 leading-relaxed">{selectedCountry.eightQuestions.q7_biggestRisk}</p>
                </div>

                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                  <div className="font-semibold text-amber-400">8. 如果失败，我损失多少时间和钱？</div>
                  <p className="mt-1 text-slate-300 leading-relaxed">{selectedCountry.eightQuestions.q8_failureCostTimeAndMoney}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => onSelectCountry(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-white hover:bg-slate-700"
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
