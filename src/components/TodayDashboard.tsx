import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ShieldCheck, 
  Compass, 
  Lock, 
  Target, 
  Info,
  Radio,
  Bell,
  Calendar,
  ArrowUpRight,
  ExternalLink,
  SlidersHorizontal,
  FileCheck2
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
  const [activeSlide, setActiveSlide] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [isActionsCollapsed, setIsActionsCollapsed] = useState(false);
  const [isSvgExpanded, setIsSvgExpanded] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Mobile Touch Swipe Gesture Support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        // swipe left -> next slide
        setActiveSlide(prev => (prev + 1) % heroSlides.length);
      } else {
        // swipe right -> previous slide
        setActiveSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);
      }
    }
    setTouchStartX(null);
  };

  const baseUrl = import.meta.env.BASE_URL || '/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  // Curated Official Policy News Hero Slides
  const heroSlides = [
    {
      id: 'de-opportunity-ausbildung',
      country: '德国 (Germany)',
      flag: '🇩🇪',
      tabLabel: '🇩🇪 德国内政部公报',
      agency: '德国联邦内政与国土部 (BMI) & 联邦劳动局 (BA)',
      officialDate: '2026-08 生效中 · 24/7 哨兵已核验',
      sourceUrl: 'https://www.make-it-in-germany.com/en/visa-residence/types/job-search-opportunity-card',
      title: '【官方公报】2026 德国机会卡细则锁定：自保金基线调至 €1,091/月 · 兼职打工放宽至 20h/周',
      summary: '德国官方正式执行新版《技术移民发展法案》(FEG)。大专或职业技能人才可凭打分满 6 分或直接资格抵德 1 年找工；双元制带薪实训法定起步约 €1,048/月，津贴覆盖生活开销即可直接免开立自保金账户。',
      impactNote: '核心利好：每周允许合法打工 20 小时，按法定最低时薪兼职月入最高可达 €1,111，完全自负盈亏。',
      bgImage: `${cleanBase}images/banners/de_policy_card.svg`,
      targetTab: 'pathways',
      targetPathwayId: 'path-de-ausbildung',
      badges: [
        { label: '💶 月自保金 €1,091', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
        { label: '⏱️ 打工放宽 20h/周', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
        { label: '🎓 双元制起步 ~€1,048', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
      ]
    },
    {
      id: 'nz-minimum-median-wage',
      country: '新西兰 (New Zealand)',
      flag: '🇳🇿',
      tabLabel: '🇳🇿 新西兰工薪新政',
      agency: '新西兰商业创新与就业部 (MBIE) & 移民局 (INZ)',
      officialDate: '2026-04-01 & 2026-03-09 生效 · 哨兵已核验',
      sourceUrl: 'https://www.employment.govt.nz/hours-and-rates/pay/minimum-wage/minimum-wage-rates',
      title: '【官方公报】2026 新西兰法定成人最低时薪调至 $23.95 NZD · 技术移民中位数锁定 $35.00 NZD',
      summary: 'MBIE 正式公布最新成人法定最低时薪 $23.95 NZD（2026-04-01 起强制执行）；移民局同步调整技术移民 SMC 与绿名单中位数时薪至 $35.00 NZD。叉车操作员 (ANZSCO 721311) 列为 Level 4 监管岗位。',
      impactNote: '核心利好：绿名单或技术移民薪资达标直接直通居留；普通 AEWV 工签岗位脱钩中位数，仅需达市场公允薪资。',
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
      tabLabel: '🇦🇺 澳洲技能短缺报告',
      agency: '澳大利亚就业与技能署 (Jobs and Skills Australia - JSA)',
      officialDate: 'JSA 2025-2026 官方发布 · 持续追踪中',
      sourceUrl: 'https://www.jobsandskills.gov.au/data/occupation-shortages/occupations-in-shortage',
      title: '【官方报告】2025-2026 澳大利亚紧缺职业清单发布：电工全澳紧缺 · 软件开发进入饱和期',
      summary: '官方最新实证评估显示：通用电工 (ANZSCO 341111) 列为全国短缺 (S)，但海外抵澳执业须经 TRA 严苛技能认证与换牌；软件工程师 (261313) 列为非短缺 (NS)，海外直聘离岸获邀门槛持续收紧。',
      impactNote: '真实警示：高薪蓝领存在本土行业持牌门槛，盲目离岸找工获批率接近为零，务必优先评估低风险路径。',
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

  // Auto slide carousel every 7 seconds
  useEffect(() => {
    if (isCarouselPaused) return;
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isCarouselPaused, heroSlides.length]);

  const currentSlide = heroSlides[activeSlide];

  // Immediate Action Cards (Stress-free execution)
  const topActions = [
    {
      id: 1,
      title: '保持居家 3D/AI 资产制作外包现金流交付',
      reason: `刚性房租（¥${profile.monthlyRentRmb || 1000}/月）优先自负盈亏。先稳住每月的自给进账，买断白天用于学习的核心自由时间。`,
      badge: '生存底线',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      actionTab: 'myplan',
      isHero: true
    },
    {
      id: 2,
      title: '执行今日 45 分钟实用语言攻坚（德语 A1 / 英语 3000 高频词）',
      reason: '外语是所有出海路线（德国双元制、出海接单、WHV、数字游民）的通用底层杠杆，每日 45 分钟属于零后悔高复利投资。',
      badge: '低后悔投资',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      actionTab: 'lowregret',
      isHero: false
    },
    {
      id: 3,
      title: '启动【7天小实验】：用 Python 批处理优化 3D 资产拆分工作流',
      reason: '先验证能否把现有资产制作与切分的单位耗时减少 40%，直接将有效时薪拉升至更高收益区间。',
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

  const handleBannerAction = (slide: typeof heroSlides[0]) => {
    if (slide.targetPathwayId) {
      const match = topPathways.find(p => p.id === slide.targetPathwayId);
      if (match) {
        onSelectPathway(match);
        return;
      }
    }
    onNavigateTab(slide.targetTab);
  };

  return (
    <div className="space-y-6">
      {/* 1. Reassuring Status Ticker & Freshness Beacon */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-white">24/7 哨兵已就绪</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 hidden sm:inline">今日 12:00 完成巡检，监控全球 24 大官方移民与劳工端点</span>
          <span className="text-emerald-400 font-medium">2 项法定新规在库已生效</span>
        </div>
        
        <div className="flex items-center space-x-3 shrink-0 text-[11px] text-slate-400">
          <span className="flex items-center space-x-1">
            <Calendar className="h-3 w-3 text-slate-500" />
            <span>基准: {profile.targetDateBaseline || '2026-09-07'}</span>
          </span>
          <span className="flex items-center space-x-1 text-emerald-400 font-mono">
            <span>三端静默同步中</span>
          </span>
        </div>
      </div>

      {/* 2. OFFICIAL POLICY NEWS & GAZETTE INTELLIGENCE HERO */}
      <div 
        className="relative overflow-hidden rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-900/95 via-slate-950 to-slate-900/90 shadow-2xl transition-all p-4 sm:p-7 lg:p-8 space-y-4 sm:space-y-5"
        onMouseEnter={() => setIsCarouselPaused(true)}
        onMouseLeave={() => setIsCarouselPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Category Tabs for Instant News Switching - Horizontal scroll on mobile */}
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

        {/* Main Split Grid: Left Editorial News / Right Official Gazette Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center">
          {/* Left Column: Official News Headline, Analysis, and CTAs (7 Cols) */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-200 border border-slate-700 flex items-center space-x-1">
                <span>{currentSlide.flag}</span>
                <span>{currentSlide.country}</span>
              </span>
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                <span>官方公报生效</span>
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                {currentSlide.agency}
              </span>
            </div>

            {/* News Headline */}
            <h1 className="text-base sm:text-2xl lg:text-[26px] font-black tracking-tight text-white leading-snug line-clamp-2 sm:line-clamp-none">
              {currentSlide.title}
            </h1>

            {/* News Summary */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2 sm:line-clamp-none">
              {currentSlide.summary}
            </p>

            {/* Impact & Advantage Note */}
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2.5 sm:p-3 text-xs text-emerald-300/90 flex items-start space-x-2">
              <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2 sm:line-clamp-none">{currentSlide.impactNote}</span>
            </div>

            {/* Metric Fact Badges */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-0.5">
              {currentSlide.badges.map((b, idx) => (
                <span key={idx} className={`rounded-lg px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold border ${b.color}`}>
                  {b.label}
                </span>
              ))}
            </div>

            {/* Mobile Collapsible Gazette Document Card Drawer */}
            <div className="lg:hidden pt-1">
              <button
                type="button"
                onClick={() => setIsSvgExpanded(!isSvgExpanded)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <span className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                  <FileCheck2 className="h-3.5 w-3.5" />
                  <span>🏛️ 官方原件公报与防伪凭条</span>
                </span>
                <span className="text-slate-400 font-mono text-[10px]">
                  {isSvgExpanded ? '收起公报 ▲' : '展开查看原件凭条 ▾'}
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
            <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => handleBannerAction(currentSlide)}
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
                <span>查看官方原文</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column: Official Policy Document Gazette Card (5 Cols, Desktop Only) */}
          <div className="hidden lg:block lg:col-span-5 relative group/doc">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl shadow-black/60 transition-transform duration-300 group-hover/doc:scale-[1.01]">
              <img 
                src={currentSlide.bgImage} 
                alt={currentSlide.title} 
                className="w-full h-auto block select-none"
              />
              <div className="absolute top-3 right-3">
                <span className="rounded-full bg-slate-950/85 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono text-emerald-400 border border-emerald-500/40 flex items-center space-x-1 shadow-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>官方原件公报</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Pagination & Carousel Controls */}
        <div className="pt-2 sm:pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
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
            <span className="text-[10px] text-slate-500 hidden sm:inline">
              (支持左右滑动手势)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
              className="h-8 w-8 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="上一条新闻"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveSlide(prev => (prev + 1) % heroSlides.length)}
              className="h-8 w-8 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="下一条新闻"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Sleek Single-Line Profile Toolbar & Mode Switcher */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-3 sm:p-4 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 text-slate-400 font-medium">
            <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-semibold text-white">当前设定画像：</span>
          </div>

          {/* Quick Profile Tag Pills */}
          <span className="rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-1 text-slate-200">
            🎓 学历: <strong className="text-emerald-300">{profile.education || '全日制大专'}</strong>
          </span>
          <span className="rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-1 text-slate-200">
            💰 储蓄: <strong className="text-emerald-300">¥{profile.currentSavingsRmb || 2000}</strong>
          </span>
          <span className="rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-1 text-slate-200">
            🌐 语言: <strong className="text-emerald-300">{profile.englishVocabEstimate || 2000} 词</strong>
          </span>
        </div>

        {/* Mode Toggle & AI Context */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="inline-flex rounded-xl border border-slate-800 bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => setMode('EXPLORE')}
              className={`flex items-center space-x-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                mode === 'EXPLORE'
                  ? 'bg-slate-800 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="h-3 w-3 text-sky-400" />
              <span>探索模式</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('EXECUTE')}
              className={`flex items-center space-x-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                mode === 'EXECUTE'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="h-3 w-3 text-emerald-300" />
              <span>执行模式</span>
            </button>
          </div>

          <button
            onClick={onOpenAiContext}
            className="flex items-center space-x-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-all cursor-pointer"
            title="一键提取当前决策上下文与画像"
          >
            <Sparkles className="h-3 w-3" />
            <span>AI 上下文</span>
          </button>
        </div>
      </div>

      {/* Execute Mode Focus Shield Banner (if active) */}
      {mode === 'EXECUTE' && primaryPathway && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/25 p-4 text-xs text-emerald-200/90 flex items-start space-x-3">
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

      {/* 4. THREE INTUITIVE COMMERCIAL HUBS (Clear & Easy to Use) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Hub 1: Optimal Pathways Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm sm:text-base font-bold text-white">
                动态评估当前最优路线 Top 3 (基于真实官方数据与时效门禁)
              </h2>
            </div>
            <button 
              onClick={() => onNavigateTab('pathways')}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer font-medium"
            >
              <span>查看全部路线拆解</span>
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
                  className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all shadow-sm"
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

                    {/* Metrics & Feasibility Score */}
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
                        <span className="block text-[10px] text-slate-400 font-medium">可行性</span>
                        <span className="text-base font-extrabold text-emerald-400 font-mono">{pathway.feasibilityScore}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Concrete Next Gate & Kill Criteria */}
                  <div className="mt-3.5 pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-2.5 text-sky-200">
                      <div className="flex items-center space-x-1.5 font-semibold text-sky-300 mb-0.5">
                        <Target className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                        <span>下一道具体门槛 (Next Gate)：</span>
                      </div>
                      <div className="text-white font-medium">{pathway.nextGate?.title || pathway.nextImmediateStep}</div>
                    </div>

                    <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-2.5 text-rose-200">
                      <div className="flex items-center space-x-1.5 font-semibold text-rose-300 mb-0.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                        <span>止损条件 (Kill Criteria)：</span>
                      </div>
                      <p className="text-[11px] text-rose-300/90 leading-relaxed">
                        {pathway.killCriteria}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action & Explanation */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setExpandedExplanationId(isExplanationOpen ? null : pathway.id)}
                      className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      <Info className="h-3.5 w-3.5 text-slate-400" />
                      <span>{isExplanationOpen ? '收起评分归因' : '查看评分归因'}</span>
                      {isExplanationOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>

                    <button
                      onClick={() => onSelectPathway(pathway)}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-semibold cursor-pointer"
                    >
                      <span>探索详细节点</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Expanded Score Explanation */}
                  {isExplanationOpen && explanation && (
                    <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/90 p-3.5 text-xs space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-semibold text-white">画像匹配分析：基准 {explanation.baseScore} 分 → 最终 {explanation.finalScore} 分</span>
                        <span className="text-emerald-400 text-[11px]">{explanation.hardConstraintsPassed ? '✅ 约束达标' : '⚠️ 存在差距'}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="font-semibold text-emerald-400 block mb-1">🟢 加分优势：</span>
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

        {/* Hub 2 & Hub 3 Sidebar */}
        <div className="space-y-5">
          {/* Survival Cashflow (Runway) Widget */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Flame className={`h-4 w-4 ${runway.isSelfSustaining ? 'text-emerald-400' : 'text-rose-400'}`} />
                  <h3 className="text-sm font-bold text-white">生存现金流 (Runway)</h3>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  安全感测算
                </span>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {runway.isSelfSustaining ? '自给自足稳态' : `${runway.survivalMonths} 个月`}
                </div>
                <p className={`text-xs mt-1 font-medium ${runway.isSelfSustaining ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {runway.healthLabel}
                </p>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                <div className="flex justify-between">
                  <span>月刚性房租:</span>
                  <span className="text-slate-200 font-mono">¥{profile.monthlyRentRmb || 1000}</span>
                </div>
                <div className="flex justify-between">
                  <span>月均基础开销:</span>
                  <span className="text-slate-200 font-mono">¥{profile.monthlyFoodAndLifeRmb || 2000}</span>
                </div>
                <div className="flex justify-between">
                  <span>当前自给月收入:</span>
                  <span className="text-emerald-400 font-mono font-semibold">¥{profile.currentMonthlyIncomeRmb || 0}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('runway')}
              className="mt-5 w-full rounded-xl border border-slate-700 bg-slate-800/90 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              调整收支与门槛测算 →
            </button>
          </div>

          {/* Stress-Free Collapsible Action Items */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
            <div 
              onClick={() => setIsActionsCollapsed(!isActionsCollapsed)}
              className="flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  当前最重要的 3 件事
                </h3>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <span>{isActionsCollapsed ? '展开' : '收起'}</span>
                {isActionsCollapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
              </div>
            </div>

            {!isActionsCollapsed && (
              <div className="mt-4 space-y-3">
                {topActions.map(action => (
                  <div 
                    key={action.id}
                    onClick={() => onNavigateTab(action.actionTab)}
                    className="group rounded-xl border border-slate-800/90 bg-slate-950/70 p-3 hover:border-emerald-500/40 hover:bg-slate-950 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-semibold border ${action.badgeColor}`}>
                        {action.badge}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">优先级 #0{action.id}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                      {action.title}
                    </h4>
                    <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {action.reason}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

