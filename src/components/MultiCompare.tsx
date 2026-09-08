import React, { useState, useMemo } from 'react';
import { Scale, Check, X, ShieldAlert, ArrowRight, Filter, SlidersHorizontal, Info } from 'lucide-react';
import { OCCUPATIONS } from '../data/occupations';
import { COUNTRIES } from '../data/countries';
import { PATHWAYS as DEFAULT_STATIC_PATHWAYS } from '../data/pathways';
import { Pathway, UserProfile } from '../types';

interface MultiCompareProps {
  profile?: UserProfile;
  pathways?: Pathway[];
  onSelectPathway?: (p: Pathway) => void;
  onNavigateTab?: (tab: string) => void;
}

export const MultiCompare: React.FC<MultiCompareProps> = ({
  profile,
  pathways = DEFAULT_STATIC_PATHWAYS,
  onSelectPathway,
  onNavigateTab
}) => {
  const [compareMode, setCompareMode] = useState<'countries' | 'careers' | 'pathways'>('pathways');
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
  const [selectedPathwayIds, setSelectedPathwayIds] = useState<string[]>([]);

  const activePathways = useMemo(() => {
    if (selectedPathwayIds.length > 0) {
      return pathways.filter(p => selectedPathwayIds.includes(p.id));
    }
    return pathways;
  }, [pathways, selectedPathwayIds]);

  const togglePathwaySelection = (id: string) => {
    if (selectedPathwayIds.includes(id)) {
      setSelectedPathwayIds(prev => prev.filter(x => x !== id));
    } else {
      if (selectedPathwayIds.length >= 3) {
        // limit to 3 max
        setSelectedPathwayIds(prev => [...prev.slice(1), id]);
      } else {
        setSelectedPathwayIds(prev => [...prev, id]);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 p-6 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  全维度横向客观对比
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">统一口径 · 结构化对照 · 拒绝虚假概率</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
                多维对比 (Multi-Vector Compare)
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                在同一套币种、周期和资格证据口径下横向审视。分数统一表示为“综合匹配分 /100”，非签证成功概率；清晰展示前置门槛与止损考量。
              </p>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 shrink-0">
              <button
                onClick={() => setCompareMode('pathways')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  compareMode === 'pathways' ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                路线 vs 路线
              </button>
              <button
                onClick={() => setCompareMode('countries')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  compareMode === 'countries' ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                国家 vs 国家
              </button>
              <button
                onClick={() => setCompareMode('careers')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  compareMode === 'careers' ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                职业 vs 职业
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Pathway Comparison Table */}
      {compareMode === 'pathways' && (
        <div className="space-y-4">
          {/* Pathway Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-3 glass-card p-3.5 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">聚焦选择 2~3 个候选：</span>
              {pathways.map(p => {
                const isSelected = selectedPathwayIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePathwaySelection(p.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {p.targetCountry} ({p.category.split('/')[0].trim()})
                  </button>
                );
              })}
              {selectedPathwayIds.length > 0 && (
                <button
                  onClick={() => setSelectedPathwayIds([])}
                  className="text-xs text-slate-500 hover:text-slate-300 underline ml-1"
                >
                  查看全部
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Info className="h-3.5 w-3.5 text-slate-500" />
              <span>数据与首页及个人画像实时保持单一事实源同步</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800/80 shadow-xl overflow-hidden">
            <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 text-[11px] text-slate-400">
              <span>横向对比矩阵</span>
              <span className="text-emerald-400">← 左右滑动查看全部路线 →</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400">
                    <th className="p-3.5 font-semibold sticky left-0 bg-slate-950 z-10 w-44 border-r border-slate-800 shadow-xs">对比维度</th>
                    {activePathways.map(p => (
                      <th key={p.id} className="p-3.5 font-semibold text-white min-w-[220px]">
                        <div className="font-bold text-sm">{p.targetCountry}</div>
                        <span className="text-[10px] text-emerald-400">{p.category}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">综合匹配分 (/100)</td>
                    {activePathways.map(p => (
                      <td key={p.id} className="p-3.5">
                        <div className="font-mono font-bold text-emerald-400 text-sm">
                          {p.feasibilityScore} / 100
                        </div>
                        <span className="text-[10px] text-slate-400 block font-normal mt-0.5">
                          {p.scoreExplanation?.qualificationStatusLabel || '综合匹配分 (非获批概率)'}
                        </span>
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">启动最低资金要求</td>
                    {activePathways.map(p => (
                      <td key={p.id} className="p-3.5 font-mono font-bold text-amber-400">
                        ¥{p.minCapitalRmb.toLocaleString()}
                        {profile && profile.currentSavingsRmb < p.minCapitalRmb && (
                          <span className="block text-[10px] text-rose-400 font-normal mt-0.5">
                            尚缺 ¥{(p.minCapitalRmb - profile.currentSavingsRmb).toLocaleString()}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">预计落地总周期</td>
                    {activePathways.map(p => (
                      <td key={p.id} className="p-3.5 font-mono text-slate-300">
                        {p.totalMonthsEst} 个月
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">核心优势与入选理由</td>
                    {activePathways.map(p => (
                      <td key={p.id} className="p-3.5 text-slate-300 leading-relaxed text-[11px]">
                        {p.whyRecommended}
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">止损与调整考量</td>
                    {activePathways.map(p => (
                      <td key={p.id} className="p-3.5 text-amber-300/90 leading-relaxed text-[11px]">
                        {p.killCriteria}
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">当前建议第一步动作</td>
                    {activePathways.map(p => (
                      <td key={p.id} className="p-3.5 text-emerald-300 leading-relaxed text-[11px]">
                        {p.nextImmediateStep}
                        {onSelectPathway && onNavigateTab && (
                          <button
                            onClick={() => {
                              onSelectPathway(p);
                              onNavigateTab('pathways');
                            }}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 underline block mt-1.5 cursor-pointer font-medium"
                          >
                            查看节点规划 →
                          </button>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Country Comparison Table */}
      {compareMode === 'countries' && (
        <div className="glass-card rounded-2xl border border-slate-800/80 shadow-xl overflow-hidden">
          <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 text-[11px] text-slate-400">
            <span>横向对比矩阵</span>
            <span className="text-emerald-400">← 左右滑动查看全部国家 →</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400">
                  <th className="p-3.5 font-semibold sticky left-0 bg-slate-950 z-10 w-44 border-r border-slate-800 shadow-xs">对比指标</th>
                  {COUNTRIES.map(c => (
                    <th key={c.id} className="p-3.5 font-semibold text-white min-w-[170px]">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-lg">{c.flag}</span>
                        <span className="font-bold">{c.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block font-normal">{c.region}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">大专学历友好度</td>
                  {COUNTRIES.map(c => (
                    <td key={c.id} className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        c.associateDegreeFriendliness.includes('高') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {c.associateDegreeFriendliness}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">第二外语学习成本</td>
                  {COUNTRIES.map(c => (
                    <td key={c.id} className="p-3.5 text-slate-300">
                      {c.secondLanguageCost}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">起步最低启动资金要求</td>
                  {COUNTRIES.map(c => (
                    <td key={c.id} className="p-3.5 font-mono font-bold text-amber-400">
                      ¥{c.minStartupCapitalRmb.toLocaleString()}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">单间月租预估 (RMB)</td>
                  {COUNTRIES.map(c => (
                    <td key={c.id} className="p-3.5 font-mono text-slate-300">
                      ¥{c.monthlyRentRmbEstimate.toLocaleString()}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">法定工作时间与年假</td>
                  {COUNTRIES.map(c => (
                    <td key={c.id} className="p-3.5 text-slate-300">
                      周 {c.typicalWeeklyHours}h · 年假 {c.paidLeaveDaysYear} 天
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">永居通道概述</td>
                  {COUNTRIES.map(c => (
                    <td key={c.id} className="p-3.5 text-slate-300 leading-relaxed text-[11px]">
                      {c.prRouteSummary}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Career Comparison Table */}
      {compareMode === 'careers' && (
        <div className="glass-card rounded-2xl border border-slate-800/80 shadow-xl overflow-hidden">
          <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 text-[11px] text-slate-400">
            <span>横向对比矩阵</span>
            <span className="text-emerald-400">← 左右滑动查看全部职业 →</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400">
                  <th className="p-3.5 font-semibold sticky left-0 bg-slate-950 z-10 w-44 border-r border-slate-800 shadow-xs">对比指标</th>
                  {OCCUPATIONS.slice(0, 6).map(occ => (
                    <th key={occ.id} className="p-3.5 font-semibold text-white min-w-[180px]">
                      <div className="font-bold text-sm">{occ.title}</div>
                      <span className="text-[10px] text-slate-500 block font-normal">{occ.titleEn}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">入门学历要求</td>
                  {OCCUPATIONS.slice(0, 6).map(occ => (
                    <td key={occ.id} className="p-3.5 text-slate-300">
                      {occ.entryDegree}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">远程可能性</td>
                  {OCCUPATIONS.slice(0, 6).map(occ => (
                    <td key={occ.id} className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        occ.remotePossibility.includes('远程') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {occ.remotePossibility}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">入门学习周期与成本</td>
                  {OCCUPATIONS.slice(0, 6).map(occ => (
                    <td key={occ.id} className="p-3.5 font-mono text-slate-300">
                      {occ.learningMonths} 个月 · ¥{occ.learningCostRmb.toLocaleString()}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">AI 替代风险与增强潜力</td>
                  {OCCUPATIONS.slice(0, 6).map(occ => (
                    <td key={occ.id} className="p-3.5 text-[11px]">
                      风险: {occ.aiReplacementRisk} / <span className="text-emerald-400">杠杆: {occ.aiEnhancementLeverage}</span>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">关键难点提示</td>
                  {OCCUPATIONS.slice(0, 6).map(occ => (
                    <td key={occ.id} className="p-3.5 text-amber-300/90 leading-relaxed text-[11px]">
                      {occ.eightQuestions.q8_topFailureReason}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
