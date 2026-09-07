import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  HelpCircle, 
  Clock, 
  DollarSign, 
  Laptop, 
  ShieldAlert, 
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  X,
  CheckCircle2,
  AlertTriangle,
  Target,
  Zap,
  Briefcase,
  SlidersHorizontal
} from 'lucide-react';
import { Occupation } from '../types';

interface CareerRadarProps {
  occupations: (Occupation & { dynamicMatchScore: number })[];
  watchlist: string[];
  onToggleWatchlist: (id: string) => void;
  selectedCareer: Occupation | null;
  onSelectCareer: (occ: Occupation | null) => void;
  onTriggerResearch?: (type: 'country' | 'occupation' | 'pathway', id: string, name?: string) => void;
}

export const CareerRadar: React.FC<CareerRadarProps> = ({
  occupations,
  watchlist,
  onToggleWatchlist,
  selectedCareer,
  onSelectCareer,
  onTriggerResearch
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [frictionFilter, setFrictionFilter] = useState<string>('all');
  const [questionFilter, setQuestionFilter] = useState<'all' | 'eligibility' | 'cost' | 'earning' | 'risk'>('all');

  const categories = [
    { id: 'all', label: '全部职业' },
    { id: 'Digital & 3D', label: '3D与数字制作' },
    { id: 'AI & Software', label: 'AI与软件' },
    { id: 'Trades & Engineering', label: '技工与工程' },
    { id: 'Green Energy', label: '绿色能源与光伏' },
    { id: 'Logistics & Transport', label: '物流与运输' },
    { id: 'Healthcare & Services', label: '医疗与护理' },
  ];

  const filteredOccupations = occupations.filter(occ => {
    const matchesSearch = 
      occ.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      occ.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      occ.iscoCode.includes(searchTerm) ||
      occ.topSkills.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || occ.category === selectedCategory;
    const matchesRemote = !remoteOnly || occ.remotePossibility === '全远程' || occ.remotePossibility === '混合远程';
    const matchesFriction = frictionFilter === 'all' || occ.qualificationFriction === frictionFilter;

    return matchesSearch && matchesCategory && matchesRemote && matchesFriction;
  });

  return (
    <div className="space-y-6">
      {/* Header & Philosophy */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 p-6 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  ISCO-08 国际标准职业分类对齐
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">前置死穴排查 & 8个硬核问题回答</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
                职业雷达 (Career Radar)
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                不局限于程序员。真实对比国内外收入、小时工资、工时、资格转换摩擦力（如电工4年8000小时硬门槛）、外国人真实签证相关性，杜绝“国外缺人就等于你能办工签”的虚假臆断。
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-xs text-slate-400">入库全量监控:</span>
              <span className="rounded-xl bg-slate-900/90 px-3 py-1.5 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30 shadow-xs">
                {occupations.length} 核心职业
              </span>
            </div>
          </div>

          {/* Interactive Category Selector Pills */}
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {categories.map(c => {
                const isActive = selectedCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isActive 
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/30' 
                        : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Filter Controls */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="搜索职业、技能、ISCO代码..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <select
                value={frictionFilter}
                onChange={e => setFrictionFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2 px-3 text-xs text-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
              >
                <option value="all">海外资格认证摩擦力: 全部</option>
                <option value="Low">Low (低摩擦 / 直接可用)</option>
                <option value="Medium">Medium (需轻度补考/认证)</option>
                <option value="High">High (高壁垒 / 需长年经验)</option>
                <option value="Very High">Very High (极难互认 / 需从头学徒)</option>
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer select-none bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors w-full justify-between h-[34px]">
                <span className="flex items-center gap-1.5">
                  <Laptop className="h-3.5 w-3.5 text-emerald-400" />
                  仅看可远程 (免坐班)
                </span>
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={e => setRemoteOnly(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Occupations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOccupations.map(occ => {
          const isWatched = watchlist.includes(occ.id);
          const frictionColors = {
            'Low': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'Medium': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'High': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            'Very High': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          }[occ.qualificationFriction];

          return (
            <div
              key={occ.id}
              className="glass-card rounded-2xl border border-slate-800/80 p-5 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group shadow-lg hover:shadow-emerald-950/20"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="rounded-md bg-slate-800/90 px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-slate-700">
                        ISCO {occ.iscoCode}
                      </span>
                      <span className="text-[11px] text-slate-400">{occ.category}</span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors pt-0.5">
                      {occ.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono line-clamp-1">{occ.titleEn}</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWatchlist(occ.id);
                    }}
                    className={`rounded-xl p-2 transition-colors ${
                      isWatched ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-500 hover:text-slate-300 bg-slate-900/60 border border-slate-800'
                    }`}
                    title={isWatched ? '已加入观察列表' : '加入观察列表'}
                  >
                    {isWatched ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  </button>
                </div>

                {/* Match Score & Badges */}
                <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                  <div className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    <span>匹配 {occ.dynamicMatchScore}%</span>
                  </div>
                  <span className={`rounded-lg px-2 py-1 text-[11px] font-medium border ${frictionColors}`}>
                    摩擦: {occ.qualificationFriction}
                  </span>
                  <span className="rounded-lg bg-slate-900/90 px-2 py-1 text-[11px] text-slate-300 border border-slate-800">
                    {occ.remotePossibility}
                  </span>
                </div>

                {/* Bento Style Salary & Hours Comparison */}
                <div className="mt-3.5 rounded-xl bg-slate-950/70 p-3 border border-slate-800/80 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1">
                      <span className="text-[10px] bg-slate-800 px-1 py-0.2 rounded text-slate-300">国内</span>
                      月薪/时薪:
                    </span>
                    <span className="text-slate-200 font-mono font-medium">
                      ¥{occ.cnSalaryGrossMonthly} <span className="text-slate-500 text-[11px]">(约¥{occ.cnSalaryHourlyEstimate}/h)</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1">
                      <span className="text-[10px] bg-emerald-950/80 border border-emerald-800/50 px-1 py-0.2 rounded text-emerald-400">海外</span>
                      时薪基准:
                    </span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {occ.overseasSalaryHourlyEstimate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-slate-800/70">
                    <span className="text-slate-500">典型工时/加班风险:</span>
                    <span className="text-slate-300 font-mono">
                      周 {occ.cnTypicalHoursWeekly}h · <span className={occ.cnOvertimeRisk.includes('高') ? 'text-rose-400' : 'text-slate-400'}>{occ.cnOvertimeRisk}</span>
                    </span>
                  </div>
                </div>

                {/* Summary Verdict Box */}
                <div className="mt-3 text-xs text-slate-300 leading-relaxed bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2">
                  <Target className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{occ.summaryVerdict}</span>
                </div>

                {/* Top Skills Tag Pills */}
                <div className="mt-3">
                  <span className="text-[10px] text-slate-500 block mb-1.5 font-medium">高频真实招聘技能需求 (岗位高频词)：</span>
                  <div className="flex flex-wrap gap-1.5">
                    {occ.topSkills.slice(0, 3).map((skill, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-slate-900/90 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-800"
                      >
                        {skill.name} <span className="text-emerald-400 font-mono">{skill.frequencyPercent}%</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button & Metadata Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  {occ.entryDegree} · {occ.licenseRequired ? '需执照' : '无需执照'}
                </span>
                <div className="flex items-center space-x-2">
                  {onTriggerResearch && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTriggerResearch('occupation', occ.id, occ.title);
                      }}
                      className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded-lg border border-indigo-500/30 transition-colors"
                      title="重新研究最新招聘与实证差异"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>重新研究</span>
                    </button>
                  )}
                  <button
                    onClick={() => onSelectCareer(occ)}
                    className="flex items-center space-x-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1.5 rounded-lg border border-emerald-500/30 transition-all"
                  >
                    <span>查看 8 个核心问题回答</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal / Drawer for the 8 Core Questions */}
      {selectedCareer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl glass-panel rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="rounded-lg bg-emerald-500/10 px-2 py-0.5 text-xs font-mono text-emerald-400 border border-emerald-500/20">
                    ISCO-08 {selectedCareer.iscoCode}
                  </span>
                  <span className="text-xs text-slate-400">{selectedCareer.category}</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1.5">
                  {selectedCareer.title}
                </h2>
                <p className="text-xs text-slate-400 font-mono">{selectedCareer.titleEn}</p>
              </div>

              <div className="flex items-center space-x-2">
                {onTriggerResearch && (
                  <button
                    onClick={() => onTriggerResearch('occupation', selectedCareer.id, selectedCareer.title)}
                    className="flex items-center space-x-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>重新研究实证差异 (Diff)</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onSelectCareer(null);
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
                  针对你的真实个人情况：必须回答的 8 个核心问题
                </h3>
              </div>

              {/* Categorized Filter Pills */}
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
                  onClick={() => setQuestionFilter('eligibility')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    questionFilter === 'eligibility' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🎯 资格现状
                </button>
                <button
                  onClick={() => setQuestionFilter('cost')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    questionFilter === 'cost' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⏱️ 周期成本
                </button>
                <button
                  onClick={() => setQuestionFilter('earning')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    questionFilter === 'earning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  💰 变现可用
                </button>
                <button
                  onClick={() => setQuestionFilter('risk')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    questionFilter === 'risk' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⚠️ 风险死穴
                </button>
              </div>
            </div>

            {/* Crucial 8 Questions Cards */}
            <div className="mt-5 space-y-3.5 text-xs">
              {/* Group 1: 资格与缺口 */}
              {(questionFilter === 'all' || questionFilter === 'eligibility') && (
                <>
                  <div className="rounded-xl bg-slate-950/80 p-4 border border-emerald-500/30 shadow-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px]">1</span>
                      <div className="font-semibold text-emerald-400 text-sm">我现在够不够资格？</div>
                    </div>
                    <p className="mt-2 text-slate-300 leading-relaxed pl-7">{selectedCareer.eightQuestions.q1_currentEligibility}</p>
                  </div>

                  <div className="rounded-xl bg-slate-950/80 p-4 border border-amber-500/30 shadow-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px]">2</span>
                      <div className="font-semibold text-amber-400 text-sm">我缺什么？</div>
                    </div>
                    <p className="mt-2 text-slate-300 leading-relaxed pl-7">{selectedCareer.eightQuestions.q2_missingPrerequisites}</p>
                  </div>
                </>
              )}

              {/* Group 2: 时间与资金投入 */}
              {(questionFilter === 'all' || questionFilter === 'cost') && (
                <>
                  <div className="rounded-xl bg-slate-950/80 p-4 border border-indigo-500/30 shadow-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[11px]">3</span>
                      <div className="font-semibold text-indigo-400 text-sm">最快多久能达到入门水平？</div>
                    </div>
                    <p className="mt-2 text-slate-300 leading-relaxed pl-7">{selectedCareer.eightQuestions.q3_fastestTimeToEntry}</p>
                  </div>

                  <div className="rounded-xl bg-slate-950/80 p-4 border border-indigo-500/30 shadow-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[11px]">4</span>
                      <div className="font-semibold text-indigo-400 text-sm">需要多少钱？</div>
                    </div>
                    <p className="mt-2 text-slate-300 leading-relaxed pl-7">{selectedCareer.eightQuestions.q4_financialCost}</p>
                  </div>
                </>
              )}

              {/* Group 3: 变现能力与海外可用性 */}
              {(questionFilter === 'all' || questionFilter === 'earning') && (
                <>
                  <div className="rounded-xl bg-slate-950/80 p-4 border border-emerald-500/30 shadow-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px]">5</span>
                      <div className="font-semibold text-emerald-400 text-sm">中国现在能不能靠它赚钱？</div>
                    </div>
                    <p className="mt-2 text-slate-300 leading-relaxed pl-7">{selectedCareer.eightQuestions.q5_chinaEarningPotential}</p>
                  </div>

                  <div className="rounded-xl bg-slate-950/80 p-4 border border-emerald-500/30 shadow-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px]">6</span>
                      <div className="font-semibold text-emerald-400 text-sm">海外能不能继续用？</div>
                    </div>
                    <p className="mt-2 text-slate-300 leading-relaxed pl-7">{selectedCareer.eightQuestions.q6_overseasUsability}</p>
                  </div>
                </>
              )}

              {/* Group 4: 重新认证壁垒与最大失败死穴 */}
              {(questionFilter === 'all' || questionFilter === 'risk') && (
                <>
                  <div className="rounded-xl bg-slate-950/80 p-4 border border-rose-500/30 shadow-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[11px]">7</span>
                      <div className="font-semibold text-rose-400 text-sm">如果出国，需要重新认证多少？(资格转换成本)</div>
                    </div>
                    <p className="mt-2 text-slate-300 leading-relaxed pl-7">{selectedCareer.eightQuestions.q7_overseasRecertificationBurden}</p>
                  </div>

                  <div className="rounded-xl bg-slate-950/80 p-4 border border-rose-500/30 shadow-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[11px]">8</span>
                      <div className="font-semibold text-rose-400 text-sm">这条路最大的失败原因是什么？(前置死穴)</div>
                    </div>
                    <p className="mt-2 text-slate-300 leading-relaxed pl-7">{selectedCareer.eightQuestions.q8_topFailureReason}</p>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                数据基于各国实务认证政策与真实招聘市场交叉脱水
              </span>
              <button
                onClick={() => {
                  onSelectCareer(null);
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

