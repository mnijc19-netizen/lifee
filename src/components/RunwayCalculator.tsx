import React from 'react';
import { Flame, ShieldCheck, AlertTriangle, ShieldAlert, DollarSign, ArrowRight } from 'lucide-react';
import { UserProfile, Pathway } from '../types';
import { calculateRunway, evaluatePathwayRunwayGating } from '../engine/runway';

interface RunwayCalculatorProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  pathways: Pathway[];
  onSelectPathway: (p: Pathway) => void;
  onNavigateTab: (tab: string) => void;
}

export const RunwayCalculator: React.FC<RunwayCalculatorProps> = ({
  profile,
  setProfile,
  pathways,
  onSelectPathway,
  onNavigateTab
}) => {
  const runway = calculateRunway(profile);

  const handleInputChange = (field: keyof UserProfile, val: number) => {
    setProfile(prev => ({
      ...prev,
      [field]: Math.max(0, val)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
          <span>生存底线法则 · 资本断裂防范</span>
          <span className="text-slate-500">·</span>
          <span>凡要求长期不赚钱脱产的路线均自动触发可行性扣减</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
          生存现金流测算器 (Runway Intelligence)
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          因为你目前存款较少、家庭无法承担几十万留学费用，现金流自给能力是所有路线的第一前置过滤器。
        </p>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Inputs */}
        <div className="lg:col-span-1 rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            输入你的真实财务数字 (元 / RMB)
          </h3>

          <div>
            <label className="block text-xs text-slate-400 mb-1">当前手头可用存款储备</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-500 text-xs">¥</span>
              <input
                type="number"
                value={profile.currentSavingsRmb}
                onChange={e => handleInputChange('currentSavingsRmb', Number(e.target.value))}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-1.5 pl-8 pr-3 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">每月固定房租支出</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-500 text-xs">¥</span>
              <input
                type="number"
                value={profile.monthlyRentRmb}
                onChange={e => handleInputChange('monthlyRentRmb', Number(e.target.value))}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-1.5 pl-8 pr-3 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">每月食物与基础生活开销</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-500 text-xs">¥</span>
              <input
                type="number"
                value={profile.monthlyFoodAndLifeRmb}
                onChange={e => handleInputChange('monthlyFoodAndLifeRmb', Number(e.target.value))}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-1.5 pl-8 pr-3 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">当前每月自给收入 (3D外包/兼职)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-500 text-xs">¥</span>
              <input
                type="number"
                value={profile.currentMonthlyIncomeRmb}
                onChange={e => handleInputChange('currentMonthlyIncomeRmb', Number(e.target.value))}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-1.5 pl-8 pr-3 text-xs font-mono text-emerald-400 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 leading-relaxed border-t border-slate-800">
            * 提示：数据保存在本地浏览器 LocalStorage，不会上传至任何公开服务器，安全无泄露风险。
          </div>
        </div>

        {/* Right Analysis Dashboard */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Stat Card */}
          <div className={`rounded-xl border p-5 ${
            runway.isSelfSustaining
              ? 'border-emerald-500/30 bg-emerald-950/20'
              : runway.survivalMonths < 2
              ? 'border-rose-500/40 bg-rose-950/20'
              : 'border-amber-500/30 bg-amber-950/20'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Flame className={`h-5 w-5 ${runway.isSelfSustaining ? 'text-emerald-400' : 'text-amber-400'}`} />
                <h3 className="text-base font-bold text-white">生存缓冲期 (Survival Runway) 裁决</h3>
              </div>
              <span className={`rounded px-2 py-0.5 text-xs font-bold border ${
                runway.isSelfSustaining ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {runway.healthLabel}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg bg-slate-950/70 p-3 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">月固定总烧钱率 (Burn Rate)</span>
                <span className="text-lg font-bold text-white font-mono">¥{runway.fixedMonthlyBurnRmb}</span>
              </div>
              <div className="rounded-lg bg-slate-950/70 p-3 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">月净现金流 (Net Cash Flow)</span>
                <span className={`text-lg font-bold font-mono ${runway.netMonthlyCashflowRmb >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {runway.netMonthlyCashflowRmb >= 0 ? `+¥${runway.netMonthlyCashflowRmb}` : `-¥${Math.abs(runway.netMonthlyCashflowRmb)}`}
                </span>
              </div>
              <div className="rounded-lg bg-slate-950/70 p-3 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">极限生存支撑时间</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {runway.isSelfSustaining ? '无限期稳态' : `${runway.survivalMonths} 个月`}
                </span>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
              <strong>系统裁决：</strong>
              {runway.isSelfSustaining
                ? '太棒了！只要你的远程数字交付业务能持续保持，你的现金流就处于净流入状态，你不需要去被迫找传统高压低薪的坐班工作。你所有的业余时间都可以从容投资在核心语言和作品集上！'
                : `注意！当前月支出大于收入，存款仅能支撑 ${runway.survivalMonths} 个月。你必须在 30 天内把远程交付收入拉满，或者将非必要生活开销缩减，绝不能在此时做任何高额自费消费！`}
            </div>
          </div>

          {/* Pathway Capital Feasibility Matrix */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              全路线资金可行性门槛与拦截审计 (Capital Gating Audit)
            </h3>

            <div className="space-y-2">
              {pathways.map(p => {
                const gate = evaluatePathwayRunwayGating(p, profile);
                return (
                  <div
                    key={p.id}
                    className={`rounded-lg border p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs ${
                      gate.isBlocked ? 'border-rose-900/50 bg-rose-950/20' : 'border-slate-800 bg-slate-950'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{p.targetCountry} · {p.category}</span>
                        {gate.isBlocked ? (
                          <span className="rounded bg-rose-500/10 text-rose-400 px-1.5 py-0.2 text-[10px] border border-rose-500/20 font-bold">
                            资金拦截 (缺口 ¥{gate.gapRmb.toLocaleString()})
                          </span>
                        ) : (
                          <span className="rounded bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 text-[10px] border border-emerald-500/20 font-bold">
                            资金安全 / 可边赚边走
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{gate.reason}</p>
                    </div>

                    <button
                      onClick={() => {
                        onSelectPathway(p);
                        onNavigateTab('pathways');
                      }}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 shrink-0 font-medium text-xs"
                    >
                      <span>路线详情</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
