import React, { useState, useMemo } from 'react';
import { Flame, ShieldCheck, AlertTriangle, ShieldAlert, DollarSign, ArrowRight, Building2, Globe, RefreshCw, ExternalLink, Check, RotateCcw } from 'lucide-react';
import { UserProfile, Pathway } from '../types';
import { calculateRunway, evaluatePathwayRunwayGating } from '../engine/runway';
import { CITY_COST_PROFILES } from '../data/cityCostProfiles';
import { normalizeUserProfile } from '../utils/storageEngine';

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
  const [isMobileInputOpen, setIsMobileInputOpen] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [isScenarioMode, setIsScenarioMode] = useState<boolean>(false);
  const [applyFeedback, setApplyFeedback] = useState<string | null>(null);

  const selectedCity = useMemo(() => {
    return CITY_COST_PROFILES.find(c => c.id === selectedCityId);
  }, [selectedCityId]);

  // If in scenario mode, calculate runway using the selected city's costs; otherwise use user baseline
  const activeProfileForCalculation = useMemo<UserProfile>(() => {
    if (isScenarioMode && selectedCity) {
      return {
        ...profile,
        monthlyRentRmb: selectedCity.singleApartmentRentOutsideRmb,
        monthlyFoodAndLifeRmb: selectedCity.monthlyLivingExpensesExcludingRentRmb
      };
    }
    return profile;
  }, [profile, isScenarioMode, selectedCity]);

  const runway = useMemo(() => calculateRunway(activeProfileForCalculation), [activeProfileForCalculation]);

  const handleCitySelect = (cityId: string) => {
    setSelectedCityId(cityId);
    if (cityId) {
      setIsScenarioMode(true);
    } else {
      setIsScenarioMode(false);
    }
  };

  const handleApplyScenarioToProfile = () => {
    if (!selectedCity) return;
    setProfile(prev => {
      const updated = {
        ...prev,
        monthlyRentRmb: selectedCity.singleApartmentRentOutsideRmb,
        monthlyFoodAndLifeRmb: selectedCity.monthlyLivingExpensesExcludingRentRmb
      };
      return normalizeUserProfile(updated);
    });
    setApplyFeedback(`已将【${selectedCity.cityName}】的开销基准更新为您的主预算设定！`);
    setTimeout(() => setApplyFeedback(null), 3000);
  };

  const handleExitScenario = () => {
    setIsScenarioMode(false);
    setSelectedCityId('');
    setApplyFeedback('已退出情景模拟，已恢复您的真实财务基线。');
    setTimeout(() => setApplyFeedback(null), 2500);
  };

  const handleInputChange = (field: keyof UserProfile, val: number) => {
    // If user was in scenario mode and edits rent/food, exit scenario mode
    if (isScenarioMode && (field === 'monthlyRentRmb' || field === 'monthlyFoodAndLifeRmb')) {
      setIsScenarioMode(false);
      setSelectedCityId('');
    }

    setProfile(prev => {
      const updated = {
        ...prev,
        [field]: Math.max(0, val)
      };
      return normalizeUserProfile(updated);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 p-6 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              现金流与生存跑道
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">以真实收支为底盘 · 情景测算独立隔离</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
            生存现金流测算器 (Runway Assessment)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            现金流自给能力是所有长远规划的第一道底牌。在熟悉的环境保持较低固定消耗，或提前模拟目标海外城市真实房租与生活成本，清晰看清每月现金缓冲期。
          </p>
        </div>
      </div>

      {/* Scenario Mode Banner */}
      {isScenarioMode && selectedCity && (
        <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/30 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs shadow-lg animate-fade-in">
          <div className="flex items-center space-x-2.5">
            <Building2 className="h-5 w-5 text-indigo-400 shrink-0" />
            <div>
              <span className="font-bold text-white text-sm">
                当前处于【{selectedCity.flag} {selectedCity.cityName}】独立情景模拟模式
              </span>
              <p className="text-slate-300 text-[11px] mt-0.5">
                情景数据仅供预览对比，尚未覆盖您在设置中的实际个人生活基线。
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleApplyScenarioToProfile}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center space-x-1 shadow-sm transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              <span>应用到我的主预算</span>
            </button>
            <button
              onClick={handleExitScenario}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center space-x-1 border border-slate-700 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>退出情景 · 恢复基线</span>
            </button>
          </div>
        </div>
      )}

      {applyFeedback && (
        <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center space-x-2 animate-fade-in">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{applyFeedback}</span>
        </div>
      )}

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Inputs */}
        <div className="lg:col-span-1 glass-card rounded-2xl border border-slate-800/80 p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              财务输入 (元 / RMB)
            </h3>
            <button
              onClick={() => setIsMobileInputOpen(!isMobileInputOpen)}
              className="lg:hidden text-xs text-emerald-400 hover:text-emerald-300 font-medium py-1 px-2.5 rounded-xl border border-slate-700 bg-slate-800 touch-target-min"
            >
              {isMobileInputOpen ? '收起输入' : '展开调参'}
            </button>
          </div>

          <div className={`space-y-4 ${isMobileInputOpen ? 'block' : 'hidden lg:block'}`}>
            {/* City Cost Preset Selector */}
            <div className="rounded-xl border border-indigo-500/30 bg-slate-950/80 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  目标城市生活成本参考 (Numbeo 数据)
                </span>
                {selectedCityId && (
                  <button
                    type="button"
                    onClick={handleExitScenario}
                    className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    重置情景
                  </button>
                )}
              </div>
              <select
                value={selectedCityId}
                onChange={e => handleCitySelect(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 px-3 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">-- 选择目标城市模拟当地开销 --</option>
                {CITY_COST_PROFILES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.flag} {c.cityName} · 预估月生存 ¥{c.totalMonthlySurvivalRmb.toLocaleString()}
                  </option>
                ))}
              </select>
              {selectedCity && (
                <div className="text-[11px] text-slate-300 space-y-1 pt-1.5 border-t border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-400">单间月租金参考:</span>
                    <span className="font-mono text-emerald-300">
                      ¥{selectedCity.singleApartmentRentOutsideRmb.toLocaleString()} ({selectedCity.singleApartmentRentOutsideLocal} {selectedCity.currency})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">基础生活开销:</span>
                    <span className="font-mono text-emerald-300">
                      ¥{selectedCity.monthlyLivingExpensesExcludingRentRmb.toLocaleString()} ({selectedCity.monthlyLivingExpensesExcludingRentLocal} {selectedCity.currency})
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                    <span>信源: {selectedCity.source} ({selectedCity.sourceTier})</span>
                    <a href={selectedCity.sourceUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center gap-0.5">
                      核验链接 <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">当前可用存款储备</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2 text-slate-500 text-xs font-mono">¥</span>
                <input
                  type="number"
                  min="0"
                  value={profile.currentSavingsRmb}
                  onChange={e => handleInputChange('currentSavingsRmb', Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2 pl-9 pr-3 text-xs font-mono text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                每月固定房租支出 {isScenarioMode && <span className="text-indigo-400">(情景模拟中)</span>}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2 text-slate-500 text-xs font-mono">¥</span>
                <input
                  type="number"
                  min="0"
                  value={isScenarioMode && selectedCity ? selectedCity.singleApartmentRentOutsideRmb : profile.monthlyRentRmb}
                  onChange={e => handleInputChange('monthlyRentRmb', Number(e.target.value))}
                  className={`w-full rounded-xl border py-2 pl-9 pr-3 text-xs font-mono focus:outline-none transition-all ${
                    isScenarioMode ? 'border-indigo-500/50 bg-indigo-950/20 text-indigo-200' : 'border-slate-800 bg-slate-950/80 text-white focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                每月食物与基础生活开销 {isScenarioMode && <span className="text-indigo-400">(情景模拟中)</span>}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2 text-slate-500 text-xs font-mono">¥</span>
                <input
                  type="number"
                  min="0"
                  value={isScenarioMode && selectedCity ? selectedCity.monthlyLivingExpensesExcludingRentRmb : profile.monthlyFoodAndLifeRmb}
                  onChange={e => handleInputChange('monthlyFoodAndLifeRmb', Number(e.target.value))}
                  className={`w-full rounded-xl border py-2 pl-9 pr-3 text-xs font-mono focus:outline-none transition-all ${
                    isScenarioMode ? 'border-indigo-500/50 bg-indigo-950/20 text-indigo-200' : 'border-slate-800 bg-slate-950/80 text-white focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">当前每月自给收入 (兼职/自由职业)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2 text-slate-500 text-xs font-mono">¥</span>
                <input
                  type="number"
                  min="0"
                  value={profile.currentMonthlyIncomeRmb}
                  onChange={e => handleInputChange('currentMonthlyIncomeRmb', Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2 pl-9 pr-3 text-xs font-mono text-emerald-400 font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 leading-relaxed border-t border-slate-800/80">
              * 隐私保障：财务数据保存在当前浏览器本地存储中，不会在未授权状态下自动上传至公共服务器。
            </div>
          </div>
        </div>

        {/* Right Analysis Dashboard */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Stat Card */}
          <div className={`glass-card rounded-2xl border p-6 shadow-xl ${
            runway.isSelfSustaining
              ? 'border-emerald-500/40 bg-emerald-950/20'
              : runway.survivalMonths < 2
              ? 'border-rose-500/50 bg-rose-950/20'
              : 'border-amber-500/40 bg-amber-950/20'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Flame className={`h-5 w-5 ${runway.isSelfSustaining ? 'text-emerald-400' : 'text-amber-400'}`} />
                <h3 className="text-base font-bold text-white">生存缓冲期 (Survival Runway) 评估</h3>
              </div>
              <span className={`rounded-xl px-3 py-1 text-xs font-bold border ${
                runway.isSelfSustaining ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}>
                {runway.healthLabel}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="rounded-xl bg-slate-950/80 p-4 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">月固定基础支出</span>
                <span className="text-xl font-bold text-white font-mono">¥{runway.fixedMonthlyBurnRmb.toLocaleString()}</span>
              </div>
              <div className="rounded-xl bg-slate-950/80 p-4 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">月净结余现金流</span>
                <span className={`text-xl font-bold font-mono ${runway.netMonthlyCashflowRmb >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {runway.netMonthlyCashflowRmb >= 0 ? `+¥${runway.netMonthlyCashflowRmb.toLocaleString()}` : `-¥${Math.abs(runway.netMonthlyCashflowRmb).toLocaleString()}`}
                </span>
              </div>
              <div className="rounded-xl bg-slate-950/80 p-4 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">估算生存缓冲期</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">
                  {runway.survivalMonthsDisplay}
                </span>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3.5 bg-slate-950/40 p-3 rounded-xl">
              <strong className="text-white">现金流分析提示：</strong>
              {runway.statusKind === 'UNRECORDED'
                ? '您尚未录入基础月度开销。建议在左侧填写入住城市的房租与基本生活费用，系统将自动测算您的资金安全边际。'
                : runway.statusKind === 'SURPLUS'
                ? '当前月度收入大于固定基础支出，处于正向现金流状态。只要此项收入保持基本稳定，无需因短期的求职焦虑而被迫做仓促决定，可从容规划语言学习与作品准备。'
                : runway.statusKind === 'BALANCED'
                ? '当前月度收支基本相抵。建议保持理性开支，并有意识地储备 3 个月以上的应急金，以应对突发变化。'
                : `当前月度支出大于收入，现有储蓄约可支持 ${runway.survivalMonths} 个月的过渡期。建议优先将日常开销保持在最低必要水平，或通过适度兼职减少资金消耗速率。`}
            </div>
          </div>

          {/* Pathway Capital Feasibility Matrix */}
          <div className="glass-card rounded-2xl border border-slate-800/80 p-5 space-y-3.5 shadow-lg">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              全路线启动资金前置门槛评估
            </h3>

            <div className="space-y-2.5">
              {pathways.map(p => {
                const gate = evaluatePathwayRunwayGating(p, profile);
                return (
                  <div
                    key={p.id}
                    className={`rounded-xl border p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs transition-all ${
                      gate.isBlocked ? 'border-rose-900/60 bg-rose-950/20' : 'border-slate-800/80 bg-slate-950/80 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{p.targetCountry} · {p.category}</span>
                        {gate.isBlocked ? (
                          <span className="rounded-md bg-amber-500/15 text-amber-400 px-2 py-0.5 text-[10px] border border-amber-500/30 font-bold">
                            资金待积累 (尚缺 ¥{gate.gapRmb.toLocaleString()})
                          </span>
                        ) : (
                          <span className="rounded-md bg-emerald-500/15 text-emerald-400 px-2 py-0.5 text-[10px] border border-emerald-500/30 font-bold">
                            资金门槛适配 / 可持续推进
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{gate.reason}</p>
                    </div>

                    <button
                      onClick={() => {
                        onSelectPathway(p);
                        onNavigateTab('pathways');
                      }}
                      className="text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/30 flex items-center space-x-1.5 shrink-0 font-semibold text-xs transition-colors self-start sm:self-center"
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
