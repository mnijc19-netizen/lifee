import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Sparkles, 
  HelpCircle, 
  Clock, 
  DollarSign, 
  Award, 
  Laptop, 
  ShieldAlert, 
  ArrowUpRight,
  TrendingUp,
  Bookmark,
  BookmarkCheck,
  X,
  Bot,
  Zap
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

  const categories = [
    { id: 'all', label: '全部职业' },
    { id: 'Digital & 3D', label: '3D与数字制作' },
    { id: 'AI & Software', label: 'AI与软件' },
    { id: 'Trades & Engineering', label: '技工与工程' },
    { id: 'Green Energy', label: '绿色能源与光伏' },
    { id: 'Logistics & Transport', label: '物流与运输' },
    { id: 'Healthcare & Services', label: '医疗与护理服务' },
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
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
              <span>ISCO-08 国际标准职业分类对齐</span>
              <span className="text-slate-500">·</span>
              <span>前置死穴排查 & 8个硬核问题回答</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              职业雷达 (Career Radar)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              不局限于程序员。真实对比国内外收入、小时工资、工时、资格转换摩擦力（如电工4年8000小时硬门槛）、外国人真实签证相关性，杜绝“国外缺人就等于你能办工签”的虚假臆断。
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs text-slate-400">已入库监控:</span>
            <span className="rounded bg-slate-800 px-2.5 py-1 text-xs font-mono font-bold text-emerald-400 border border-slate-700">
              {occupations.length} 核心职业
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="搜索职业、技能、ISCO代码..."
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

          <div className="flex items-center space-x-2">
            <select
              value={frictionFilter}
              onChange={e => setFrictionFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">海外资格认证摩擦力: 全部</option>
              <option value="Low">Low (低摩擦 / 直接可用)</option>
              <option value="Medium">Medium (需轻度补考/认证)</option>
              <option value="High">High (高壁垒 / 需长年经验)</option>
              <option value="Very High">Very High (极难互认 / 需从头学徒)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer select-none bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 w-full justify-between">
              <span>仅看可远程 (免坐班)</span>
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={e => setRemoteOnly(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Occupations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              className="group relative rounded-xl border border-slate-800 bg-slate-900/40 p-4 hover:border-slate-700 hover:bg-slate-900/80 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-700">
                        ISCO {occ.iscoCode}
                      </span>
                      <span className="text-[10px] text-slate-400">{occ.category}</span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {occ.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono line-clamp-1">{occ.titleEn}</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWatchlist(occ.id);
                    }}
                    className={`rounded p-1.5 transition-colors ${
                      isWatched ? 'text-amber-400 bg-amber-500/10' : 'text-slate-600 hover:text-slate-300'
                    }`}
                    title={isWatched ? '已加入观察列表' : '加入观察列表'}
                  >
                    {isWatched ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  </button>
                </div>

                {/* Score & Key Attributes Badge */}
                <div className="mt-3 flex items-center space-x-2">
                  <div className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/20">
                    综合匹配 {occ.dynamicMatchScore}%
                  </div>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium border ${frictionColors}`}>
                    认证摩擦: {occ.qualificationFriction}
                  </span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300 border border-slate-700">
                    {occ.remotePossibility}
                  </span>
                </div>

                {/* Wage & Hours Comparison Table */}
                <div className="mt-3 rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">中国月薪/时薪:</span>
                    <span className="text-slate-200 font-mono">
                      ¥{occ.cnSalaryGrossMonthly} / 约¥{occ.cnSalaryHourlyEstimate}/h
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">海外时薪水平:</span>
                    <span className="text-emerald-400 font-mono font-medium">
                      {occ.overseasSalaryHourlyEstimate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-800/60">
                    <span className="text-slate-500">典型工时/加班:</span>
                    <span className="text-slate-400">
                      周 {occ.cnTypicalHoursWeekly}h (国内加班风险: {occ.cnOvertimeRisk})
                    </span>
                  </div>
                </div>

                {/* Summary Verdict */}
                <p className="mt-3 text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2 rounded border border-slate-800">
                  {occ.summaryVerdict}
                </p>

                {/* Top Skills Tag Pills */}
                <div className="mt-3">
                  <span className="text-[10px] text-slate-500 block mb-1">高频真实招聘技能需求 (由岗位提取)：</span>
                  <div className="flex flex-wrap gap-1">
                    {occ.topSkills.slice(0, 3).map((skill, i) => (
                      <span
                        key={i}
                        className="rounded bg-slate-800/70 px-1.5 py-0.5 text-[10px] text-slate-300 border border-slate-700"
                      >
                        {skill.name} ({skill.frequencyPercent}%)
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  {occ.entryDegree} · {occ.licenseRequired ? '需执照' : '无需执照'}
                </span>
                <div className="flex items-center space-x-2">
                  {onTriggerResearch && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTriggerResearch('occupation', occ.id, occ.title);
                      }}
                      className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded border border-indigo-500/30 transition-colors"
                      title="重新研究最新招聘与实证差异"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>重新研究</span>
                    </button>
                  )}
                  <button
                    onClick={() => onSelectCareer(occ)}
                    className="flex items-center space-x-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-mono text-emerald-400 border border-emerald-500/20">
                    ISCO-08 {selectedCareer.iscoCode}
                  </span>
                  <span className="text-xs text-slate-400">{selectedCareer.category}</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">
                  {selectedCareer.title}
                </h2>
                <p className="text-xs text-slate-400 font-mono">{selectedCareer.titleEn}</p>
              </div>

              <div className="flex items-center space-x-2">
                {onTriggerResearch && (
                  <button
                    onClick={() => onTriggerResearch('occupation', selectedCareer.id, selectedCareer.title)}
                    className="flex items-center space-x-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>重新研究实证差异 (Diff)</span>
                  </button>
                )}
                <button
                  onClick={() => onSelectCareer(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Crucial 8 Questions Section */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-2">
                <HelpCircle className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  针对你的真实个人情况：必须回答的 8 个核心问题
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                  <div className="font-semibold text-emerald-400">1. 我现在够不够资格？</div>
                  <p className="mt-1 text-slate-300 leading-relaxed">{selectedCareer.eightQuestions.q1_currentEligibility}</p>
                </div>

                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                  <div className="font-semibold text-amber-400">2. 我缺什么？</div>
                  <p className="mt-1 text-slate-300 leading-relaxed">{selectedCareer.eightQuestions.q2_missingPrerequisites}</p>
                </div>

                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                  <div className="font-semibold text-emerald-400">3. 最快多久能达到入门水平？</div>
                  <p className="mt-1 text-slate-300 leading-relaxed">{selectedCareer.eightQuestions.q3_fastestTimeToEntry}</p>
                </div>

                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                  <div className="font-semibold text-indigo-400">4. 需要多少钱？</div>
                  <p className="mt-1 text-slate-300 leading-relaxed">{selectedCareer.eightQuestions.q4_financialCost}</p>
                </div>

                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                  <div className="font-semibold text-emerald-400">5. 中国现在能不能靠它赚钱？</div>
                  <p className="mt-1 text-slate-300 leading-relaxed">{selectedCareer.eightQuestions.q5_chinaEarningPotential}</p>
                </div>

                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                  <div className="font-semibold text-indigo-400">6. 海外能不能继续用？</div>
                  <p className="mt-1 text-slate-300 leading-relaxed">{selectedCareer.eightQuestions.q6_overseasUsability}</p>
                </div>

                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                  <div className="font-semibold text-rose-400">7. 如果出国，需要重新认证多少？(资格转换成本)</div>
                  <p className="mt-1 text-slate-300 leading-relaxed">{selectedCareer.eightQuestions.q7_overseasRecertificationBurden}</p>
                </div>

                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                  <div className="font-semibold text-rose-400">8. 这条路最大的失败原因是什么？</div>
                  <p className="mt-1 text-slate-300 leading-relaxed">{selectedCareer.eightQuestions.q8_topFailureReason}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => onSelectCareer(null)}
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
