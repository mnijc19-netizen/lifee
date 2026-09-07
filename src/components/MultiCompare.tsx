import React, { useState } from 'react';
import { Scale, Check, X, ShieldAlert, ArrowRight } from 'lucide-react';
import { OCCUPATIONS } from '../data/occupations';
import { COUNTRIES } from '../data/countries';
import { PATHWAYS } from '../data/pathways';

export const MultiCompare: React.FC = () => {
  const [compareMode, setCompareMode] = useState<'countries' | 'careers' | 'pathways'>('countries');

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
                  全维度实机横向对比
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">结构化硬核看板 · 拒绝长篇大论 · 适合一键截图</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
                多维对比 (Multi-Vector Compare)
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                直接横向排列，一眼看清差距。无论是国家制度红利、职业时薪与工时、还是不同路线的时间与金钱代价，全在统一维度下量化审视。
              </p>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 shrink-0">
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
              <button
                onClick={() => setCompareMode('pathways')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  compareMode === 'pathways' ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                路线 vs 路线
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Country Comparison Table */}
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
                        c.associateDegreeFriendliness.includes('高') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {c.associateDegreeFriendliness}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">最低启动资本要求</td>
                  {COUNTRIES.map(c => (
                    <td key={c.id} className="p-3.5 font-mono font-bold text-amber-400">
                      ¥{c.minStartupCapitalRmb.toLocaleString()}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">小时可支配购买力指数</td>
                  {COUNTRIES.map(c => (
                    <td key={c.id} className="p-3.5 font-mono text-emerald-400 font-bold">
                      {c.netHourlyPurchasingPowerIndex} <span className="text-[10px] text-slate-500 font-normal">(中国一线=100)</span>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">典型周工时 / 法定年假</td>
                  {COUNTRIES.map(c => (
                    <td key={c.id} className="p-3.5 font-mono">
                      {c.typicalWeeklyHours}h / 周 · <span className="text-emerald-400">{c.paidLeaveDaysYear}天</span>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">单人月均租金预估</td>
                  {COUNTRIES.map(c => (
                    <td key={c.id} className="p-3.5 font-mono text-slate-300">
                      约 ¥{c.monthlyRentRmbEstimate}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">第二语言学习成本</td>
                  {COUNTRIES.map(c => (
                    <td key={c.id} className="p-3.5 text-slate-400">
                      {c.secondLanguageCost}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">网络自由与AI可用性</td>
                  {COUNTRIES.map(c => (
                    <td key={c.id} className="p-3.5 text-emerald-400">
                      {c.aiServiceAccessibility} ({c.internetFreedomScore}/10)
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">对华外国人现实难度</td>
                  {COUNTRIES.map(c => (
                    <td key={c.id} className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        c.foreignerWorkDifficulty === '低' ? 'text-emerald-400 bg-emerald-500/10' :
                        c.foreignerWorkDifficulty === '中等' ? 'text-blue-400 bg-blue-500/10' : 'text-rose-400 bg-rose-500/10'
                      }`}>
                        {c.foreignerWorkDifficulty}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">核心官方结论摘要</td>
                  {COUNTRIES.map(c => (
                    <td key={c.id} className="p-3.5 text-slate-400 leading-relaxed text-[11px]">
                      {c.summaryVerdict}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Career Comparison Table */}
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
                      <span className="text-[10px] text-slate-500 font-mono">ISCO {occ.iscoCode}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">综合匹配度 (针对你)</td>
                  {OCCUPATIONS.slice(0, 6).map(occ => (
                    <td key={occ.id} className="p-3.5 font-mono font-bold text-emerald-400 text-sm">
                      {occ.feasibilityScore}%
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">远程弹性 (自由时间)</td>
                  {OCCUPATIONS.slice(0, 6).map(occ => (
                    <td key={occ.id} className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        occ.remotePossibility.includes('远程') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {occ.remotePossibility}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">中国月薪与时薪预估</td>
                  {OCCUPATIONS.slice(0, 6).map(occ => (
                    <td key={occ.id} className="p-3.5 font-mono">
                      ¥{occ.cnSalaryGrossMonthly} (约¥{occ.cnSalaryHourlyEstimate}/h)
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">海外时薪水平</td>
                  {OCCUPATIONS.slice(0, 6).map(occ => (
                    <td key={occ.id} className="p-3.5 font-mono font-semibold text-emerald-400">
                      {occ.overseasSalaryHourlyEstimate}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">资格互认摩擦力</td>
                  {OCCUPATIONS.slice(0, 6).map(occ => (
                    <td key={occ.id} className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        occ.qualificationFriction === 'Low' ? 'text-emerald-400 bg-emerald-500/10' :
                        occ.qualificationFriction === 'Medium' ? 'text-blue-400 bg-blue-500/10' :
                        occ.qualificationFriction === 'High' ? 'text-amber-400 bg-amber-500/10' : 'text-rose-400 bg-rose-500/10'
                      }`}>
                        {occ.qualificationFriction}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">入门学历要求</td>
                  {OCCUPATIONS.slice(0, 6).map(occ => (
                    <td key={occ.id} className="p-3.5 text-slate-300">
                      {occ.entryDegree}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">入门学习周期与成本</td>
                  {OCCUPATIONS.slice(0, 6).map(occ => (
                    <td key={occ.id} className="p-3.5 font-mono text-slate-300">
                      {occ.learningMonths} 个月 · ¥{occ.learningCostRmb}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">AI替代风险与增强潜力</td>
                  {OCCUPATIONS.slice(0, 6).map(occ => (
                    <td key={occ.id} className="p-3.5 text-[11px]">
                      风险: {occ.aiReplacementRisk} / <span className="text-emerald-400">杠杆: {occ.aiEnhancementLeverage}</span>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">最大失败原因预警</td>
                  {OCCUPATIONS.slice(0, 6).map(occ => (
                    <td key={occ.id} className="p-3.5 text-rose-300/90 leading-relaxed text-[11px]">
                      {occ.eightQuestions.q8_topFailureReason}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Pathway Comparison Table */}
      {compareMode === 'pathways' && (
        <div className="glass-card rounded-2xl border border-slate-800/80 shadow-xl overflow-hidden">
          <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 text-[11px] text-slate-400">
            <span>横向对比矩阵</span>
            <span className="text-emerald-400">← 左右滑动查看全部路线 →</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400">
                  <th className="p-3.5 font-semibold sticky left-0 bg-slate-950 z-10 w-44 border-r border-slate-800 shadow-xs">对比指标</th>
                  {PATHWAYS.map(p => (
                    <th key={p.id} className="p-3.5 font-semibold text-white min-w-[200px]">
                      <div className="font-bold text-sm">{p.targetCountry}</div>
                      <span className="text-[10px] text-emerald-400">{p.category}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">当前可行性评分</td>
                  {PATHWAYS.map(p => (
                    <td key={p.id} className="p-3.5 font-mono font-bold text-emerald-400 text-sm">
                      {p.feasibilityScore}%
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">起步最低资金要求</td>
                  {PATHWAYS.map(p => (
                    <td key={p.id} className="p-3.5 font-mono font-bold text-amber-400">
                      ¥{p.minCapitalRmb.toLocaleString()}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">预计落地总周期</td>
                  {PATHWAYS.map(p => (
                    <td key={p.id} className="p-3.5 font-mono text-slate-300">
                      {p.totalMonthsEst} 个月
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">核心入选理由</td>
                  {PATHWAYS.map(p => (
                    <td key={p.id} className="p-3.5 text-slate-300 leading-relaxed text-[11px]">
                      {p.whyRecommended}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">致命失效条件 (Kill Criteria)</td>
                  {PATHWAYS.map(p => (
                    <td key={p.id} className="p-3.5 text-rose-400 leading-relaxed text-[11px]">
                      {p.killCriteria}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10 border-r border-slate-800/80 shadow-xs">当前应迈出的第一步</td>
                  {PATHWAYS.map(p => (
                    <td key={p.id} className="p-3.5 text-emerald-300 leading-relaxed text-[11px]">
                      {p.nextImmediateStep}
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
