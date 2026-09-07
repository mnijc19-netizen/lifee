import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  AlertTriangle, 
  Zap, 
  ShieldAlert, 
  TrendingUp, 
  Flame, 
  Sparkles, 
  Clock, 
  Coins, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Compass,
  Lock,
  Target,
  Info
} from 'lucide-react';
import { UserProfile, Pathway, IntelligenceEvent, DecisionMode, FreshnessStatus } from '../types';
import { RunwayAnalysis } from '../engine/runway';

interface TodayDashboardProps {
  profile: UserProfile;
  setProfile?: React.Dispatch<React.SetStateAction<UserProfile>>;
  runway: RunwayAnalysis;
  topPathways: Pathway[];
  intelligence: IntelligenceEvent[];
  onSelectPathway: (p: Pathway) => void;
  onNavigateTab: (tab: string) => void;
  onOpenAiContext: () => void;
}

export const TodayDashboard: React.FC<TodayDashboardProps> = ({
  profile,
  setProfile,
  runway,
  topPathways,
  intelligence,
  onSelectPathway,
  onNavigateTab,
  onOpenAiContext
}) => {
  // Decision Mode: Explore Mode vs Execute Mode
  const [mode, setMode] = useState<DecisionMode>(profile.activeDecisionMode || 'EXPLORE');
  const [expandedExplanationId, setExpandedExplanationId] = useState<string | null>(null);

  // Immediate Action Cards (Section A)
  const topActions = [
    {
      id: 1,
      title: '保持居家 3D/AI 资产制作外包现金流交付',
      reason: `刚性房租（¥${profile.monthlyRentRmb || 1200}/月）需要自负盈亏。只有先稳住每月的自给进账，才能彻底免除低薪长工时坐班通勤，买断白天用于学习的核心自由时间。`,
      badge: '生存底线',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      actionTab: 'myplan',
      isHero: true
    },
    {
      id: 2,
      title: '执行今日 45 分钟实用语言攻坚（德语 A1 / 英语 3000 高频词）',
      reason: '外语是所有高阶出海路线（德国双元制、出海接单、WHV、数字游民）的通用底层杠杆，每日 45 分钟属于零后悔高复利投资。',
      badge: '低后悔投资',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      actionTab: 'lowregret',
      isHero: false
    },
    {
      id: 3,
      title: '启动【7天小实验】：用 Python 批处理优化 3D 资产拆分工作流',
      reason: '拒绝假大空式的学习。先验证能否把现有资产制作与切分的单位耗时减少 40%，直接将有效时薪拉升至更高收益区间。',
      badge: '敏捷验证',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      actionTab: 'myplan',
      isHero: false
    }
  ];

  const primaryPathway = topPathways[0] || null;

  const renderFreshnessBadge = (status?: FreshnessStatus, isProvisional?: boolean) => {
    switch (status) {
      case 'FRESH':
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>🟢 FRESH (官方核验)</span>
          </span>
        );
      case 'AGING':
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span>🟡 AGING (在有效周期内)</span>
          </span>
        );
      case 'STALE':
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>🟠 STALE {isProvisional ? '[PROVISIONAL 临时研判]' : ''}</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            <span>🔴 EXPIRED [超期排除]</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-700">
            <span>⚪ UNKNOWN</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Directive Headline */}
      <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-slate-950/90 backdrop-blur-xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>决策基准日期: {profile.targetDateBaseline}</span>
              <span className="text-slate-500">·</span>
              <span>当前画像：{profile.education || '大专学历'} / ¥{profile.currentSavingsRmb || 0} 可用储蓄</span>
            </div>
            <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>人生路线智能决策罗盘</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">
                我现在最应该做什么？
              </span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              系统已根据你的设定条件（{profile.education || '大专学历'}、¥{profile.currentSavingsRmb}储蓄、¥{profile.monthlyRentRmb}房租、{profile.englishVocabEstimate}词汇量）完成全局政策与市场交叉验证。拒绝假大空的规划，直达今日执行闭环。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Explore Mode vs Execute Mode Toggle */}
            <div className="inline-flex rounded-xl border border-slate-800 bg-slate-950/80 p-1 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setMode('EXPLORE')}
                className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  mode === 'EXPLORE'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="h-3.5 w-3.5 text-sky-400" />
                <span>探索模式 (Explore)</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('EXECUTE')}
                className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  mode === 'EXECUTE'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="h-3.5 w-3.5 text-emerald-300" />
                <span>执行模式 (Execute)</span>
              </button>
            </div>

            <button
              onClick={onOpenAiContext}
              className="flex items-center space-x-2 rounded-xl bg-emerald-600/90 px-3.5 py-2 text-xs font-medium text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>一键提取 AI 上下文</span>
            </button>
          </div>
        </div>

        {/* Execute Mode Focus Shield Banner */}
        {mode === 'EXECUTE' && primaryPathway && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/25 p-4 text-xs text-emerald-200/90 flex items-start space-x-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-emerald-300 flex items-center space-x-2">
                <span>🔒 执行专注保护已激活：当前锁定主攻【{primaryPathway.name.slice(0, 32)}...】</span>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 font-semibold">专注保障</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                在执行模式下系统自动过滤微弱外部噪音，不让无休止的信息搜集推迟行动。除非当前路线触发<strong>止损条件 (Kill Criteria)</strong>或<strong>核心移民法规发生重大实质变动</strong>，否则请心无旁骛攻坚当期唯一的 Next Gate。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 30-Second Quick Onboarding & Profile Tuning Wizard */}
      <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl p-4 sm:p-5 shadow-xl shadow-black/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 mb-3.5 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs shadow-xs">
              ⚡
            </span>
            <span className="text-sm font-bold text-white tracking-wide">30秒快捷画像调优 · 即选即测算</span>
            <span className="hidden sm:inline-block text-xs text-slate-400">
              (点击下方选项直接切换人生基准条件，推荐路线与生存跑道秒级重算)
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            纯本地实时推演 · 零隐私上传
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Degree */}
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>🎓 最高学历背景</span>
              <span className="text-slate-500 text-[10px]">影响工签与绿卡门槛</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: '全日制大专', val: '全日制大专 (专科)' },
                { label: '本科及以上', val: '全日制本科及以上' },
                { label: '中专/高中', val: '高中/中专/无学历' }
              ].map(opt => {
                const cur = profile.education || '全日制大专 (专科)';
                const isSelected = cur.includes('大专') ? opt.val.includes('大专') : (cur.includes('本科') ? opt.val.includes('本科') : opt.val.includes('高中'));
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => {
                      if (setProfile) setProfile(prev => ({ ...prev, education: opt.val }));
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-xs'
                        : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Savings */}
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>💰 可用起步储蓄</span>
              <span className="text-slate-500 text-[10px]">现金流第一道过滤器</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: '¥5,000', val: 5000 },
                { label: '¥30,000', val: 30000 },
                { label: '¥100,000+', val: 100000 }
              ].map(opt => {
                const s = profile.currentSavingsRmb || 0;
                const isSelected = (opt.val === 5000 && s <= 10000) || (opt.val === 30000 && s > 10000 && s < 80000) || (opt.val === 100000 && s >= 80000);
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => {
                      if (setProfile) setProfile(prev => ({ ...prev, currentSavingsRmb: opt.val }));
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-xs'
                        : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* English / Language */}
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>🌐 语言与沟通基础</span>
              <span className="text-slate-500 text-[10px]">高复利底层杠杆</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: '基础 2000词', val: 2000 },
                { label: '进阶 4000词', val: 4000 },
                { label: '零基础攻坚', val: 800 }
              ].map(opt => {
                const v = profile.englishVocabEstimate || 2000;
                const isSelected = (opt.val === 2000 && v >= 1500 && v <= 2500) || (opt.val === 4000 && v > 2500) || (opt.val === 800 && v < 1500);
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => {
                      if (setProfile) setProfile(prev => ({ ...prev, englishVocabEstimate: opt.val }));
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-xs'
                        : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* A. Top 3 Immediate Actions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-emerald-400" />
            <h2 className="text-base font-semibold text-white">A. 当前最重要的 3 件事 (今日与本周执行)</h2>
          </div>
          <button 
            onClick={() => onNavigateTab('myplan')}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
          >
            <span>进入行动看板</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Hero Card for Top 1 Action */}
        <div className="space-y-3">
          {/* Top 1 Action (Hero) */}
          <div className="group relative rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-900 p-5 shadow-sm hover:border-emerald-500/60 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="rounded px-2.5 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Top 1 核心动作 · 生存底线
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">优先级 #01</span>
                </div>
                <span className="text-xs text-slate-400">今日必做</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                {topActions[0].title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
                {topActions[0].reason}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">为什么现在做？稳固生存底线，杜绝沉没成本</span>
              <button
                onClick={() => onNavigateTab(topActions[0].actionTab)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-sm"
              >
                <span>立即执行</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Secondary Actions 2 & 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topActions.slice(1).map(action => (
              <div 
                key={action.id}
                className="group relative rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 hover:bg-slate-900 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-semibold border ${action.badgeColor}`}>
                      {action.badge}
                    </span>
                    <span className="text-xs font-mono text-slate-500">优先级 #0{action.id}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                    {action.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                    {action.reason}
                  </p>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500">为什么现在做？</span>
                  <button
                    onClick={() => onNavigateTab(action.actionTab)}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-medium"
                  >
                    <span>立即执行</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* B. My Current Status Matrix & Runway Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Runway Survival Widget */}
        <div className="lg:col-span-1 rounded-xl border border-slate-800 bg-slate-900/50 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">生存现金流 (Runway)</span>
              <Flame className={`h-4 w-4 ${runway.isSelfSustaining ? 'text-emerald-400' : 'text-rose-400'}`} />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-white">
                {runway.isSelfSustaining ? '自给自足稳态' : `${runway.survivalMonths} 个月`}
              </div>
              <p className={`text-xs mt-1 ${runway.isSelfSustaining ? 'text-emerald-400' : 'text-amber-400'}`}>
                {runway.healthLabel}
              </p>
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
              <div className="flex justify-between">
                <span>月刚性房租支出:</span>
                <span className="text-slate-200 font-mono">¥{profile.monthlyRentRmb}</span>
              </div>
              <div className="flex justify-between">
                <span>月均基础开销:</span>
                <span className="text-slate-200 font-mono">¥{profile.monthlyFoodAndLifeRmb}</span>
              </div>
              <div className="flex justify-between">
                <span>当前自给收入:</span>
                <span className="text-emerald-400 font-mono">¥{profile.currentMonthlyIncomeRmb}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('runway')}
            className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-800/80 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            调整收支与门槛测算
          </button>
        </div>

        {/* User Profile Snapshot Grid */}
        <div className="lg:col-span-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">B. 我的当前底层状态 (System State Matrix · 客观硬性约束)</span>
            <span className="text-[10px] text-slate-500 font-mono">硬性约束校验</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-2.5">
              <span className="text-[10px] text-slate-500 block">学历背景</span>
              <span className="text-xs font-semibold text-white block mt-0.5">{profile.education || '全日制大专'}</span>
              <span className="text-[10px] text-amber-400">{profile.major || '数字媒体与设计'}</span>
            </div>

            <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-2.5">
              <span className="text-[10px] text-slate-500 block">英语水平</span>
              <span className="text-xs font-semibold text-white block mt-0.5">~{profile.englishVocabEstimate || 2000} 词汇量</span>
              <span className="text-[10px] text-rose-400">口语听力攻坚中</span>
            </div>

            <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-2.5">
              <span className="text-[10px] text-slate-500 block">当前实战技能</span>
              <span className="text-xs font-semibold text-white block mt-0.5">3D + AI 工作流</span>
              <span className="text-[10px] text-emerald-400">数字资产交付流水</span>
            </div>

            <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-2.5">
              <span className="text-[10px] text-slate-500 block">AI 协同能力</span>
              <span className="text-xs font-semibold text-white block mt-0.5">高频 Agent 协同</span>
              <span className="text-[10px] text-indigo-400">独立交付全栈 Web</span>
            </div>

            <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-2.5">
              <span className="text-[10px] text-slate-500 block">启动可用资本</span>
              <span className="text-xs font-semibold text-white block mt-0.5 font-mono">¥{profile.currentSavingsRmb}</span>
              <span className="text-[10px] text-amber-400">需依赖现金流</span>
            </div>

            <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-2.5">
              <span className="text-[10px] text-slate-500 block">出国准备度</span>
              <span className="text-xs font-semibold text-white block mt-0.5">阶段 1 (蓄水中)</span>
              <span className="text-[10px] text-emerald-400">可走双元制/跳板</span>
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-400 bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                <strong>系统裁决：</strong>目前不具备直接自费留学（需20万+）或离岸技术移民条件；首要战略是<strong>“居家低消耗做远程现金流 + 定向攻关外语门槛”</strong>。
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('lowregret')}
              className="text-emerald-400 hover:underline shrink-0 ml-3 text-[11px]"
            >
              查看低后悔技能表
            </button>
          </div>
        </div>
      </div>

      {/* C. Current Optimal Pathways (Profile-Conditional & Explainable) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h2 className="text-base font-semibold text-white">
              C. 动态评估当前最优路线 {mode === 'EXECUTE' ? '（当前执行锚定）' : 'Top 3 (基于真实官方数据与时效门禁)'}
            </h2>
          </div>
          <button 
            onClick={() => onNavigateTab('pathways')}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
          >
            <span>查看完整 5 条路线拆解</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {(mode === 'EXECUTE' ? topPathways.slice(0, 1) : topPathways.slice(0, 3)).map((pathway, idx) => {
            const isExplanationOpen = expandedExplanationId === pathway.id;
            const explanation = pathway.scoreExplanation;

            return (
              <div
                key={pathway.id}
                data-pathway-card="true"
                className="group rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5 hover:border-emerald-500/40 hover:bg-slate-900/80 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                        {pathway.category}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-xs text-slate-300">目标国: {pathway.targetCountry}</span>
                      {renderFreshnessBadge(pathway.freshnessStatus, pathway.isProvisional)}
                    </div>

                    <h3 
                      onClick={() => onSelectPathway(pathway)}
                      className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors cursor-pointer"
                    >
                      {pathway.name}
                    </h3>

                    {/* Profile Conditional Statement */}
                    <p className="text-xs text-slate-300 bg-slate-950/50 rounded px-2.5 py-1.5 border border-slate-800/80">
                      <span className="text-emerald-400 font-medium">📌 画像条件化判定：</span>
                      {pathway.profileConditionalStatement || `以当前画像（${profile.education || '大专'} / ${profile.englishVocabEstimate || 2000}词汇 / ¥${profile.currentSavingsRmb}储蓄）与最新已核验证据，综合排序第 ${idx + 1} 位`}
                    </p>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {pathway.whyRecommended}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-xs text-slate-400 justify-end">
                        <Coins className="h-3.5 w-3.5 text-amber-400" />
                        <span>最低资金: ¥{pathway.minCapitalRmb.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-slate-400 justify-end mt-0.5">
                        <Clock className="h-3.5 w-3.5 text-indigo-400" />
                        <span>预计周期: {pathway.totalMonthsEst} 个月</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="text-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5">
                        <span className="block text-[10px] text-slate-400">可行性评分</span>
                        <span className="text-sm font-bold text-emerald-400 font-mono">{pathway.feasibilityScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Concrete Next Gate & Kill Criteria */}
                <div className="mt-3.5 pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                  {/* Next Gate */}
                  <div className="rounded-lg border border-sky-500/30 bg-sky-950/20 p-2.5 text-sky-200">
                    <div className="flex items-center space-x-1.5 font-semibold text-sky-300 mb-1">
                      <Target className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                      <span>下一道具体门槛 (Next Gate)：</span>
                      <span className="text-white">{pathway.nextGate?.title || pathway.nextImmediateStep}</span>
                    </div>
                    {pathway.nextGate && (
                      <div className="space-y-0.5 text-[11px] text-sky-300/80">
                        <div><strong className="text-sky-200">衡量指标：</strong>{pathway.nextGate.targetMetric}</div>
                        <div><strong className="text-sky-200">每日动作：</strong>{pathway.nextGate.recommendedDailyAction}</div>
                      </div>
                    )}
                  </div>

                  {/* Kill Criteria */}
                  <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-2.5 text-rose-200">
                    <div className="flex items-center space-x-1.5 font-semibold text-rose-300 mb-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                      <span>止损条件 (Kill Criteria)：</span>
                    </div>
                    <p className="text-[11px] text-rose-300/90 leading-relaxed">
                      {pathway.killCriteria}
                    </p>
                  </div>
                </div>

                {/* Score Explanation Toggle */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setExpandedExplanationId(isExplanationOpen ? null : pathway.id)}
                    className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <Info className="h-3.5 w-3.5 text-slate-400" />
                    <span>{isExplanationOpen ? '收起评分归因拆解' : '查看评分归因拆解 (可解释性归因)'}</span>
                    {isExplanationOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>

                  <button
                    onClick={() => onSelectPathway(pathway)}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-medium"
                  >
                    <span>查看路线阶段节点</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {/* Expanded Score Explanation Box */}
                {isExplanationOpen && explanation && (
                  <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/80 p-3.5 text-xs space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white">评分归因构成：</span>
                        <span className="font-mono text-slate-400">基准 {explanation.baseScore} 分 → 最终 {explanation.finalScore} 分</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        explanation.hardConstraintsPassed
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {explanation.hardConstraintsPassed ? '✅ 刚性约束达标' : '⚠️ 存在资金/年龄硬约束差距'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Positive Drivers */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-emerald-400">🟢 正向加分因素：</span>
                        {explanation.positiveDrivers.map((driver, dIdx) => (
                          <div key={dIdx} className="text-slate-300 text-[11px] flex items-start space-x-1.5">
                            <span className="text-emerald-400 shrink-0">✓</span>
                            <span>{driver}</span>
                          </div>
                        ))}
                      </div>

                      {/* Negative Drivers */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-amber-400">🔴 约束降权与风险：</span>
                        {explanation.negativeDrivers.length > 0 ? (
                          explanation.negativeDrivers.map((driver, dIdx) => (
                            <div key={dIdx} className="text-slate-300 text-[11px] flex items-start space-x-1.5">
                              <span className="text-amber-400 shrink-0">✕</span>
                              <span>{driver}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-500 text-[11px]">无重大负向扣分项</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* D. Major Policy & Market Changes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h2 className="text-base font-semibold text-white">D. 重大政策情报与个人决策关联 (回答“与我有什么关系”)</h2>
          </div>
          <button 
            onClick={() => onNavigateTab('intelligence')}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
          >
            <span>查看完整情报流</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {intelligence.slice(0, 2).map(intel => (
            <div key={intel.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                    {intel.category}
                  </span>
                  <span className="text-xs text-slate-400">{intel.country}</span>
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[9px] text-emerald-400 font-mono">
                    今日优先
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">{intel.date}</span>
              </div>

              <h4 className="text-sm font-semibold text-white">{intel.title}</h4>

              <div className="text-xs space-y-1.5 bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <div className="text-slate-400">
                  <span className="text-slate-500 font-medium">变动事实：</span>{intel.newFact}
                </div>
                <div className="text-emerald-400/90 pt-1.5 border-t border-slate-800/80">
                  <span className="font-semibold text-emerald-400">对我的直接决策影响：</span>
                  {intel.whatToChangeForMe}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
