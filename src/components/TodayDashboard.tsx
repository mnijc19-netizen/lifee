import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  AlertTriangle, 
  Zap, 
  TrendingUp, 
  Flame, 
  Sparkles, 
  Clock, 
  Coins, 
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ShieldCheck, 
  Compass, 
  Lock, 
  Target, 
  Info,
  Radio,
  Calendar,
  ExternalLink,
  SlidersHorizontal,
  FileCheck2,
  Check
} from 'lucide-react';
import { UserProfile, Pathway, IntelligenceEvent, DecisionMode, FreshnessStatus, UserPlanTask } from '../types';
import { RunwayAnalysis } from '../engine/runway';
import { isUserSyncEnabled, getUserSyncSlotId } from '../config/cloudSyncConfig';

interface TodayDashboardProps {
  profile: UserProfile;
  setProfile?: React.Dispatch<React.SetStateAction<UserProfile>>;
  runway: RunwayAnalysis;
  topPathways: Pathway[];
  intelligence: IntelligenceEvent[];
  tasks?: UserPlanTask[];
  onUpdateTaskStatus?: (taskId: string, status: UserPlanTask['status']) => void;
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
  tasks = [],
  onUpdateTaskStatus,
  onSelectPathway,
  onNavigateTab,
  onOpenAiContext
}) => {
  const [mode, setMode] = useState<DecisionMode>(profile.activeDecisionMode || 'EXPLORE');
  const [expandedExplanationId, setExpandedExplanationId] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  // Default carousel is paused so anxious users are not disturbed by auto-sliding while reading
  const [isCarouselPaused, setIsCarouselPaused] = useState(true);
  const [isSvgExpanded, setIsSvgExpanded] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Dynamic Inspection Status from real source_manifest.json
  const [auditInfo, setAuditInfo] = useState<{
    lastCheckTime: string;
    totalSources: number;
    liveDataCount: number;
  }>({
    lastCheckTime: '2026-09-07 17:09 (UTC+8)',
    totalSources: 25,
    liveDataCount: 2
  });

  const baseUrl = import.meta.env.BASE_URL || '/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  useEffect(() => {
    fetch(`${cleanBase}data/source_manifest.json`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.updatedAt) {
          const d = new Date(data.updatedAt);
          const timeStr = !isNaN(d.getTime())
            ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
            : '2026-09-07 17:09';
          setAuditInfo({
            lastCheckTime: `${timeStr} (UTC+8)`,
            totalSources: data.totalSources || 25,
            liveDataCount: data.liveDataCount || 2
          });
        }
      })
      .catch(() => {});
  }, [cleanBase]);

  // Mobile Touch Swipe Gesture Support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        setActiveSlide(prev => (prev + 1) % heroSlides.length);
      } else {
        setActiveSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);
      }
    }
    setTouchStartX(null);
  };

  // Curated Official Policy News Hero Slides
  const heroSlides = [
    {
      id: 'de-opportunity-ausbildung',
      country: '德国 (Germany)',
      flag: '🇩🇪',
      tabLabel: '🇩🇪 德国内政部政策要点',
      agency: '德国联邦内政与国土部 (BMI) & 联邦劳动局 (BA)',
      officialDate: '2026-08 生效中 · 官方数据源核验',
      sourceUrl: 'https://www.make-it-in-germany.com/en/visa-residence/types/job-search-opportunity-card',
      title: '2026 德国政策要点：机会卡自保金 €1,091/月 · 双元制实训起步津贴约 €1,048/月',
      summary: '德国正式执行新版《技术移民发展法案》(FEG)。大专或职业技能人才可凭打分满 6 分申请机会卡赴德找工；双元制带薪实训法定津贴毛额约 €1,048/月（净额约 €822 起），津贴满足生计可免开立自保金账户。注意：双元制毕业并不直接获得永居，需从事匹配全职工作满 24 个月社保（AufenthG §18c）后申请。',
      impactNote: '核心事实：双元制为 3 年带薪制，免学费，适合无高额启动资金积累的实用型人才。',
      bgImage: `${cleanBase}images/banners/de_policy_card.svg`,
      targetTab: 'pathways',
      targetPathwayId: 'path-de-ausbildung',
      badges: [
        { label: '💶 月自保金 €1,091', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
        { label: '⏱️ 打工许可 20h/周', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
        { label: '🎓 双元制起步 ~€1,048', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
      ]
    },
    {
      id: 'nz-minimum-median-wage',
      country: '新西兰 (New Zealand)',
      flag: '🇳🇿',
      tabLabel: '🇳🇿 新西兰工薪基准',
      agency: '新西兰商业创新与就业部 (MBIE) & 移民局 (INZ)',
      officialDate: '2026-04-01 & 2026-03-09 生效 · 官方基准',
      sourceUrl: 'https://www.employment.govt.nz/hours-and-rates/pay/minimum-wage/minimum-wage-rates',
      title: '2026 新西兰法定成人最低时薪 $23.95 NZD · 技术移民中位数 $35.00 NZD',
      summary: 'MBIE 法定成人最低时薪执行 $23.95 NZD；移民局将技术移民 SMC 与绿名单中位数基准锁定在 $35.00 NZD。叉车操作员 (ANZSCO 721311) 确认为 Level 4 岗位，连续工签受限且无直接绿名单直通通道。',
      impactNote: '务实建议：叉车等低技能岗位在澳新无独立移民路径，严防中介过度许诺。',
      bgImage: `${cleanBase}images/banners/nz_policy_card.svg`,
      targetTab: 'pathways',
      targetPathwayId: 'path-nz-working-holiday-forklift',
      badges: [
        { label: '💵 最低时薪 $23.95/h', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
        { label: '📈 移民中位数 $35.00/h', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
        { label: '🚜 叉车监管 ANZSCO 721311', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
      ]
    },
    {
      id: 'au-jsa-shortage-list',
      country: '澳大利亚 (Australia)',
      flag: '🇦🇺',
      tabLabel: '🇦🇺 澳洲技能短缺评估',
      agency: '澳大利亚就业与技能署 (Jobs and Skills Australia - JSA)',
      officialDate: 'JSA 2025-2026 官方评估 · 持续追踪中',
      sourceUrl: 'https://www.jobsandskills.gov.au/data/occupation-shortages/occupations-in-shortage',
      title: '澳大利亚紧缺职业分析：电工全国短缺但换牌壁垒极高 · 软件开发离岸饱和',
      summary: 'JSA 官方实证评估：通用电工 (ANZSCO 341111) 处于全国短缺 (S)，但海外技术人员执业须经 TRA 技能评估与本地学徒换牌；软件开发类 (261313) 处于非短缺 (NS)，离岸独立获邀门槛极高。',
      impactNote: '真实警示：高薪蓝领存在严苛的本土持牌门槛，切勿在未掌握换牌路径前盲目投入资金。',
      bgImage: `${cleanBase}images/banners/au_policy_card.svg`,
      targetTab: 'careers',
      targetPathwayId: null,
      badges: [
        { label: '⚡ 电工全国短缺 (S)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
        { label: '💻 软件开发非紧缺 (NS)', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
        { label: '📋 TRA 强制换牌认证', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
      ]
    }
  ];

  const currentSlide = heroSlides[activeSlide];

  // Derive Daily Micro-Action (5~15 minutes) from user tasks or default calm steps
  const todayTasks = tasks.filter(t => t.period === 'today');
  const primaryTask = todayTasks.find(t => t.status === 'todo') || todayTasks[0] || {
    id: 'default-micro-1',
    title: '完成今日 15 分钟德语 A1 核心词汇复习（30 个高频词）',
    period: 'today',
    status: 'todo',
    estimatedMinutes: 15,
    whyNow: '语言是唯一在任何路线切换时都不会沉没的通用底层资产，每天 15 分钟即可保持手感。'
  };

  const secondaryActions = [
    {
      id: 'sub-action-1',
      title: '盘点现有 3D/AI 外包资产模型文件，分类整理至交付文件夹',
      timeEst: '10 分钟',
      tab: 'myplan',
      desc: '稳住交付现金流，确保月房租优先有着落。'
    },
    {
      id: 'sub-action-2',
      title: '查看德国双元制职业技能大纲（IT系统电子/机电）要求',
      timeEst: '8 分钟',
      tab: 'pathways',
      desc: '对照大专所学课程，标记已具备的重合基础。'
    }
  ];

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
            <span>🟡 AGING (有效期内)</span>
          </span>
        );
      case 'STALE':
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>🟠 STALE (待复核) {isProvisional ? '[临时研判]' : ''}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-700">
            <span>⚪ 标准基准</span>
          </span>
        );
    }
  };

  const handleTogglePrimaryTask = () => {
    if (!onUpdateTaskStatus) return;
    const newStatus = primaryTask.status === 'completed' ? 'todo' : 'completed';
    onUpdateTaskStatus(primaryTask.id, newStatus);
  };

  return (
    <div className="space-y-6">
      {/* 1. Calm Status Ticker & Baseline Info */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-white">系统就绪</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 hidden sm:inline">
            巡检更新：{auditInfo.lastCheckTime} · 跟踪 {auditInfo.totalSources} 大官方端点
          </span>
          <span className="text-emerald-400 font-medium">基准数据持续核验</span>
        </div>
        
        <div className="flex items-center space-x-3 shrink-0 text-[11px] text-slate-400">
          <span className="flex items-center space-x-1">
            <Calendar className="h-3 w-3 text-slate-500" />
            <span>基准：{profile.targetDateBaseline || '2026-09'}</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-emerald-400">
            {isUserSyncEnabled() ? `已连接槽位 (${getUserSyncSlotId()})` : '本地优先已保全'}
          </span>
        </div>
      </div>

      {/* 2. HUMAN-FIRST TOP ACTION: 今日最值得做的一件事 (5~15 分钟微行动) */}
      <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <span>今日最值得做的一件事 (当前最重要的 3 件事)</span>
                <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-semibold">
                  5 ~ 15 分钟微行动
                </span>
              </h2>
              <p className="text-xs text-slate-400">低门槛、零后悔、不因纠结路线而停滞当下的微小进展</p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('myplan')}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-medium cursor-pointer self-start sm:self-auto"
          >
            <span>进入【我的计划】查看完整清单</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Primary Micro-Action Card */}
        <div className={`rounded-2xl border p-4 sm:p-5 transition-all ${
          primaryTask.status === 'completed'
            ? 'border-slate-800 bg-slate-950/40 opacity-75'
            : 'border-emerald-500/50 bg-slate-900/90 shadow-md'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2">
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                  核心推进
                </span>
                <span className="flex items-center space-x-1 text-xs text-slate-400">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span>预估耗时: {primaryTask.estimatedMinutes || 15} 分钟</span>
                </span>
              </div>

              <h3 className={`text-base sm:text-lg font-bold ${primaryTask.status === 'completed' ? 'text-slate-400 line-through' : 'text-white'}`}>
                {primaryTask.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                {primaryTask.whyNow || '稳健推进当期关键门槛，验证小步反馈，杜绝沉没成本。'}
              </p>
            </div>

            <button
              onClick={handleTogglePrimaryTask}
              className={`shrink-0 flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                primaryTask.status === 'completed'
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
              }`}
            >
              <Check className="h-4 w-4" />
              <span>{primaryTask.status === 'completed' ? '已标记完成 (点击撤回)' : '打勾完成此项'}</span>
            </button>
          </div>
        </div>

        {/* 2 Supporting Micro-Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {secondaryActions.map(action => (
            <div
              key={action.id}
              onClick={() => onNavigateTab(action.tab)}
              className="group rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 hover:border-emerald-500/30 hover:bg-slate-900 transition-all cursor-pointer flex items-start justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-semibold text-slate-400 font-mono">
                    ⏱️ {action.timeEst}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {action.title}
                </h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {action.desc}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 shrink-0 mt-1 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. RUNWAY CASHFLOW & QUICK PROFILE SNAPSHOT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Runway Status (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className={`h-4 w-4 ${runway.isSelfSustaining ? 'text-emerald-400' : 'text-amber-400'}`} />
              <h3 className="text-sm font-bold text-white">生存现金流 (Runway)</h3>
            </div>
            <button
              onClick={() => onNavigateTab('runway')}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-0.5 font-medium cursor-pointer"
            >
              <span>测算详情</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-center">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {runway.isSelfSustaining ? '自给自足稳态' : `${runway.survivalMonths} 个月`}
            </div>
            <p className={`text-xs mt-1 font-medium ${runway.isSelfSustaining ? 'text-emerald-400' : 'text-amber-400'}`}>
              {runway.healthLabel}
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-400 pt-1">
            <div className="flex justify-between">
              <span>当前可用储蓄底盘:</span>
              <span className="text-white font-mono font-semibold">¥{(profile.currentSavingsRmb || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>月刚性总支出 (房租+生活):</span>
              <span className="text-slate-200 font-mono">¥{runway.fixedMonthlyBurnRmb.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>月均自给收入:</span>
              <span className="text-emerald-400 font-mono font-semibold">¥{(profile.currentMonthlyIncomeRmb || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right: Current Profile Baseline & Quick Adjustment (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-400">
                <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">当前画像基准</h3>
              </div>

              {/* Mode Toggle */}
              <div className="inline-flex rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setMode('EXPLORE')}
                  className={`flex items-center space-x-1 rounded-lg px-2.5 py-1 transition-all cursor-pointer ${
                    mode === 'EXPLORE'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Compass className="h-3 w-3 text-sky-400" />
                  <span>探索模式</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('EXECUTE')}
                  className={`flex items-center space-x-1 rounded-lg px-2.5 py-1 transition-all cursor-pointer ${
                    mode === 'EXECUTE'
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Lock className="h-3 w-3 text-emerald-300" />
                  <span>执行模式</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              基于当前填写的真实学历与财务底线进行评估。系统杜绝假设大额存款或名校文凭，只算你够得着的路径。
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">学历层次</span>
                <span className="font-semibold text-emerald-300 truncate block mt-0.5">
                  {profile.education || '全日制大专'}
                </span>
              </div>
              <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">专业背景</span>
                <span className="font-semibold text-slate-200 truncate block mt-0.5">
                  {profile.major || '数字媒体'}
                </span>
              </div>
              <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">英语词汇</span>
                <span className="font-semibold text-slate-200 block mt-0.5 font-mono">
                  {profile.englishVocabEstimate || 2000} 词
                </span>
              </div>
              <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">决策模式</span>
                <span className={`font-semibold block mt-0.5 ${mode === 'EXECUTE' ? 'text-emerald-400' : 'text-sky-400'}`}>
                  {mode === 'EXECUTE' ? '🔒 专注攻坚' : '🧭 全局比选'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80">
            <button
              onClick={() => onNavigateTab('runway')}
              className="text-xs text-slate-300 hover:text-white flex items-center space-x-1"
            >
              <span>调整房租与收支项</span>
              <ArrowRight className="h-3 w-3 text-slate-500" />
            </button>

            <button
              onClick={onOpenAiContext}
              className="flex items-center space-x-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="h-3 w-3" />
              <span>提取 AI 决策上下文</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. CALIBRATED OPTIMAL PATHWAYS TOP 3 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm sm:text-base font-bold text-white">
              动态评估当前最优路线 Top 3 (四维标定分 · 拒绝虚标)
            </h2>
          </div>
          <button 
            onClick={() => onNavigateTab('pathways')}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer font-medium"
          >
            <span>查看全部路线</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {mode === 'EXECUTE' && topPathways[0] && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/25 p-4 text-xs text-emerald-200/90 flex items-start space-x-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-emerald-300 flex items-center space-x-2">
                <span>🔒 执行专注保护已激活：当前锁定主攻【{topPathways[0].name.slice(0, 32)}...】</span>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 font-semibold">专注保障</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                在执行模式下系统自动过滤外部噪音。除非触发止损条件或核心移民法规发生重大实质变动，否则请心无旁骛攻坚当期门槛。
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {(mode === 'EXECUTE' ? topPathways.slice(0, 1) : topPathways.slice(0, 3)).map((pathway, idx) => {
            const isExplanationOpen = expandedExplanationId === pathway.id;
            const explanation = pathway.scoreExplanation;

            return (
              <div
                key={pathway.id}
                data-pathway-card="true"
                className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
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

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {pathway.whyRecommended}
                    </p>
                  </div>

                  {/* Calibrated Feasibility Score (Out of 100) */}
                  <div className="flex items-center space-x-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-xs text-slate-400 justify-end">
                        <Coins className="h-3.5 w-3.5 text-amber-400" />
                        <span>起步: ¥{pathway.minCapitalRmb.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-slate-400 justify-end mt-0.5">
                        <Clock className="h-3.5 w-3.5 text-indigo-400" />
                        <span>周期: {pathway.totalMonthsEst}月</span>
                      </div>
                    </div>

                    <div className="text-center rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-2">
                      <span className="block text-[10px] text-slate-400 font-medium">可行性匹配</span>
                      <span className="text-base font-extrabold text-emerald-400 font-mono">
                        {pathway.feasibilityScore}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4-Dimension Breakdown Pills */}
                {explanation && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="rounded bg-slate-950 px-2 py-0.5 text-slate-400 border border-slate-800">
                      偏好度: <strong className="text-slate-200">{explanation.preferenceScore}</strong>/100
                    </span>
                    <span className="rounded bg-slate-950 px-2 py-0.5 text-slate-400 border border-slate-800">
                      就绪度: <strong className="text-slate-200">{explanation.readinessScore}</strong>/100
                    </span>
                    <span className="rounded bg-slate-950 px-2 py-0.5 text-slate-400 border border-slate-800">
                      准入资格: <strong className={explanation.qualificationStatus === 'NOW_ELIGIBLE' ? 'text-emerald-400' : 'text-amber-400'}>
                        {explanation.qualificationStatusLabel}
                      </strong>
                    </span>
                    <span className="rounded bg-slate-950 px-2 py-0.5 text-slate-400 border border-slate-800">
                      证据链: <strong className="text-slate-200">{explanation.evidenceCompleteness}</strong>
                    </span>
                  </div>
                )}

                {/* Next Gate & Peaceful Stop-Loss */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-2.5 text-sky-200">
                    <div className="flex items-center space-x-1.5 font-semibold text-sky-300 mb-0.5">
                      <Target className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                      <span>下一道具体门槛：</span>
                    </div>
                    <div className="text-white font-medium">{pathway.nextGate?.title || pathway.nextImmediateStep}</div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-slate-300">
                    <div className="flex items-center space-x-1.5 font-semibold text-amber-300 mb-0.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span>止损条件 (冷静退出信号)：</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {pathway.killCriteria}
                    </p>
                  </div>
                </div>

                {/* Explanation Drawer Toggle */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setExpandedExplanationId(isExplanationOpen ? null : pathway.id)}
                    className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <Info className="h-3.5 w-3.5 text-slate-400" />
                    <span>{isExplanationOpen ? '收起归因分析' : '查看归因拆解'}</span>
                    {isExplanationOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>

                  <button
                    onClick={() => onSelectPathway(pathway)}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-semibold cursor-pointer"
                  >
                    <span>探索完整里程碑</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {isExplanationOpen && explanation && (
                  <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/90 p-3.5 text-xs space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-semibold text-white">
                        画像匹配拆解：综合匹配 {explanation.finalScore} 分
                      </span>
                      <span className="text-emerald-400 text-[11px]">
                        {explanation.hardConstraintsPassed ? '✅ 约束达标' : '⚠️ 存在差距'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="font-semibold text-emerald-400 block mb-1">🟢 优势支撑：</span>
                        {explanation.positiveDrivers.map((d, i) => (
                          <div key={i} className="text-slate-300">✓ {d}</div>
                        ))}
                      </div>
                      <div>
                        <span className="font-semibold text-amber-400 block mb-1">🔴 风险与限制：</span>
                        {explanation.negativeDrivers.length > 0 ? (
                          explanation.negativeDrivers.map((d, i) => (
                            <div key={i} className="text-slate-300">✕ {d}</div>
                          ))
                        ) : (
                          <div className="text-slate-500">无重大负向扣分</div>
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

      {/* 5. OFFICIAL POLICY GAZETTES & INFOGRAPHIC SLIDES (Demoted below actions, Manual control) */}
      <div 
        className="relative overflow-hidden rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-900/95 via-slate-950 to-slate-900/90 shadow-xl transition-all p-4 sm:p-6 lg:p-7 space-y-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Category Tabs */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1 touch-pan-x shrink-0">
            {heroSlides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setActiveSlide(idx)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-all flex items-center space-x-1.5 cursor-pointer ${
                  activeSlide === idx
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{s.tabLabel}</span>
                {activeSlide === idx && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-[11px] text-slate-400 shrink-0">
            <span className="rounded-full bg-slate-900 px-2.5 py-1 border border-slate-800 flex items-center space-x-1">
              <Clock className="h-3 w-3 text-slate-400" />
              <span>{currentSlide.officialDate}</span>
            </span>
          </div>
        </div>

        {/* Main Grid: Left Policy Headline & Summary / Right Infographic Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-200 border border-slate-700 flex items-center space-x-1">
                <span>{currentSlide.flag}</span>
                <span>{currentSlide.country}</span>
              </span>
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                <Radio className="h-3 w-3 text-emerald-400" />
                <span>官方政策基准</span>
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                {currentSlide.agency}
              </span>
            </div>

            <h3 className="text-base sm:text-xl lg:text-2xl font-black tracking-tight text-white leading-snug">
              {currentSlide.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {currentSlide.summary}
            </p>

            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2.5 sm:p-3 text-xs text-emerald-300/90 flex items-start space-x-2">
              <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{currentSlide.impactNote}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {currentSlide.badges.map((b, idx) => (
                <span key={idx} className={`rounded-lg px-2 sm:px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold border ${b.color}`}>
                  {b.label}
                </span>
              ))}
            </div>

            {/* Mobile Drawer */}
            <div className="lg:hidden pt-1">
              <button
                type="button"
                onClick={() => setIsSvgExpanded(!isSvgExpanded)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <span className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                  <FileCheck2 className="h-3.5 w-3.5" />
                  <span>政策要点图解 (基于官方政策文件整理)</span>
                </span>
                <span className="text-slate-400 font-mono text-[10px]">
                  {isSvgExpanded ? '收起图解 ▲' : '展开查看图解 ▾'}
                </span>
              </button>

              {isSvgExpanded && (
                <div className="mt-2.5 relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-xl transition-all">
                  <img 
                    src={currentSlide.bgImage} 
                    alt={currentSlide.title} 
                    className="w-full h-auto block select-none"
                  />
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => {
                  if (currentSlide.targetPathwayId) {
                    const match = topPathways.find(p => p.id === currentSlide.targetPathwayId);
                    if (match) {
                      onSelectPathway(match);
                      return;
                    }
                  }
                  onNavigateTab(currentSlide.targetTab);
                }}
                className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3.5 sm:px-4 py-2 text-xs font-bold text-slate-950 hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <span>直达此项政策与路线测算</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <a
                href={currentSlide.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 sm:px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
              >
                <span>查看官方原文门户</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Desktop Right Column: Infographic Card */}
          <div className="hidden lg:block lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-xl">
              <img 
                src={currentSlide.bgImage} 
                alt={currentSlide.title} 
                className="w-full h-auto block select-none"
              />
              <div className="absolute top-3 right-3">
                <span className="rounded-full bg-slate-950/85 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono text-emerald-400 border border-emerald-500/40 flex items-center space-x-1 shadow-md">
                  <span>政策要点图解</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Pagination & Manual Controls */}
        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            {heroSlides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setActiveSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  activeSlide === idx 
                    ? 'w-8 bg-emerald-400 shadow-md shadow-emerald-400/50' 
                    : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                title={s.title}
              />
            ))}
            <span className="text-[11px] text-slate-400 ml-2 font-mono">
              0{activeSlide + 1} / 0{heroSlides.length}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
              className="h-8 w-8 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="上一条"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveSlide(prev => (prev + 1) % heroSlides.length)}
              className="h-8 w-8 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="下一条"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
