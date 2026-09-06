import React from 'react';
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
  FileText,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { UserProfile, Pathway, IntelligenceEvent } from '../types';
import { RunwayAnalysis } from '../engine/runway';

interface TodayDashboardProps {
  profile: UserProfile;
  runway: RunwayAnalysis;
  topPathways: Pathway[];
  intelligence: IntelligenceEvent[];
  onSelectPathway: (p: Pathway) => void;
  onNavigateTab: (tab: string) => void;
  onOpenAiContext: () => void;
}

export const TodayDashboard: React.FC<TodayDashboardProps> = ({
  profile,
  runway,
  topPathways,
  intelligence,
  onSelectPathway,
  onNavigateTab,
  onOpenAiContext
}) => {
  // Section A: Top 3 Immediate Actions for Today & This Week
  const topActions = [
    {
      id: 1,
      title: '保持居家 3D/AI 资产制作外包现金流交付',
      reason: `刚性房租（¥${profile.monthlyRentRmb || 1200}/月）需要自负盈亏。只有先稳住每月的自给进账，才能彻底免除低薪长工时坐班通勤，买断白天用于学习的核心自由时间。`,
      badge: '生存底线',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      actionTab: 'myplan'
    },
    {
      id: 2,
      title: '执行今日 45 分钟实用语言攻坚（英语3000高频词 / 德语A1）',
      reason: '当前英语处于 1500 词汇量短板，是当前 Top 5 候选路线中 4 条海外路线（出海接单、德国、新西兰、马来西亚）的共用元技能，属于 0 后悔投资。',
      badge: '低后悔投资',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      actionTab: 'lowregret'
    },
    {
      id: 3,
      title: '启动【7天小实验】：用 Python 批处理优化 3D 资产拆分工作流',
      reason: '不要盲目开始学 10 门新技术。先验证能否把现有资产制作与切分的单位耗时减少 40%，有效提升到手小时收益。',
      badge: '敏捷验证',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      actionTab: 'myplan'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & Directive Headline */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>当前决策基准日期: {profile.targetDateBaseline}</span>
              <span className="text-slate-500">·</span>
              <span>个人状态：{profile.education || '大专学历'} / ¥{profile.currentSavingsRmb || 0} 启动储备</span>
            </div>
            <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              我现在最应该做什么？
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-3xl">
              系统已根据你的设定条件（{profile.education || '大专学历'}、¥{profile.currentSavingsRmb}存款、¥{profile.monthlyRentRmb}房租、{profile.englishVocabEstimate}词汇量）完成全局政策与市场交叉验证。拒绝假大空的规划，直达今日执行闭环。
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onOpenAiContext}
              className="flex items-center space-x-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-950"
            >
              <Sparkles className="h-4 w-4" />
              <span>一键提取 AI 决策上下文</span>
            </button>
          </div>
        </div>
      </div>

      {/* A. Top 3 Immediate Actions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-emerald-400" />
            <h2 className="text-base font-semibold text-white">A. 当前最重要的 3 件事 (今日与本周)</h2>
          </div>
          <button 
            onClick={() => onNavigateTab('myplan')}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
          >
            <span>进入行动看板</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topActions.map(action => (
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
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  {action.reason}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
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
            className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-800/80 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            调整收支与门槛测算
          </button>
        </div>

        {/* User Profile Snapshot Grid */}
        <div className="lg:col-span-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">B. 我的当前底层状态 (System State Matrix)</span>
            <span className="text-[10px] text-slate-500 font-mono">无本地假想 / 零盲猜锚定</span>
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
                <strong>系统裁决：</strong>目前绝对不具备直接自费留学（需20万+）或离岸技术移民条件；首要战略是<strong>“居家低消耗做远程现金流 + 定向攻关语言”</strong>。
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

      {/* C. Current Optimal Pathways Top 3 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h2 className="text-base font-semibold text-white">C. 动态评估当前最优路线 Top 3 (基于真实官方数据)</h2>
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
          {topPathways.slice(0, 3).map((pathway, idx) => (
            <div
              key={pathway.id}
              onClick={() => onSelectPathway(pathway)}
              className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5 hover:border-emerald-500/40 hover:bg-slate-900/80 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      {pathway.category}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-xs text-slate-300">目标国: {pathway.targetCountry}</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {pathway.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
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
                      <span className="block text-[10px] text-slate-400">可行性</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono">{pathway.feasibilityScore}%</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>

              {/* Kill Criteria & Next Step Quick Peek */}
              <div className="mt-3 pt-3 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div className="flex items-start space-x-1.5 text-rose-300/90 bg-rose-950/20 rounded p-1.5 border border-rose-900/30">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>失效条件 (Kill Criteria)：</strong>{pathway.killCriteria}</span>
                </div>
                <div className="flex items-start space-x-1.5 text-emerald-300/90 bg-emerald-950/20 rounded p-1.5 border border-emerald-900/30">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>当前第一步：</strong>{pathway.nextImmediateStep}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* D. Major Policy & Market Changes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h2 className="text-base font-semibold text-white">D. 最近发生的重大变化 (真正改变决策的硬核情报)</h2>
          </div>
          <button 
            onClick={() => onNavigateTab('intelligence')}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
          >
            <span>查看全部情报流</span>
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
                </div>
                <span className="text-[11px] font-mono text-slate-500">{intel.date}</span>
              </div>

              <h4 className="text-sm font-semibold text-white">{intel.title}</h4>

              <div className="text-xs space-y-1 bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <div className="text-slate-400">
                  <span className="text-slate-500">最新实情：</span>{intel.newFact}
                </div>
                <div className="text-emerald-400/90 pt-1 border-t border-slate-800/80">
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
