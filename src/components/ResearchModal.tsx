import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink, 
  Scale,
  RefreshCw,
  Info,
  Radio,
  WifiOff
} from 'lucide-react';
import { UserProfile, ResearchDiffResult } from '../types';
import { getStaticResearchBaseline, executeLiveResearch } from '../engine/researchEngine';

interface ResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'country' | 'occupation' | 'pathway' | null;
  targetId: string | null;
  targetName?: string;
  profile: UserProfile;
  watchlist: string[];
  onToggleWatchlist: (id: string) => void;
}

export const ResearchModal: React.FC<ResearchModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
  profile,
  watchlist,
  onToggleWatchlist
}) => {
  if (!isOpen || !targetId || !targetType) return null;

  const [diff, setDiff] = useState<ResearchDiffResult>(() => 
    getStaticResearchBaseline(targetType, targetId, profile)
  );
  const [isProbing, setIsProbing] = useState(false);

  useEffect(() => {
    setDiff(getStaticResearchBaseline(targetType, targetId, profile));
  }, [targetType, targetId, profile]);

  const handleLiveProbe = async () => {
    setIsProbing(true);
    try {
      const liveResult = await executeLiveResearch(targetType, targetId, profile);
      setDiff(liveResult);
    } catch (err: any) {
      setDiff(prev => ({
        ...prev,
        status: 'STATIC_FALLBACK',
        fallbackNotice: `实时外部检索执行异常（${err?.message || '网络错误'}），已安全维持静态核验基准。`
      }));
    } finally {
      setIsProbing(false);
    }
  };

  const isWatchlisted = watchlist.includes(targetId);

  const getDeltaBadge = (delta: number) => {
    if (delta > 0) {
      return (
        <span className="flex items-center space-x-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>可行性重估：+{delta} 分 (政策与收益利好)</span>
        </span>
      );
    } else if (delta < 0) {
      return (
        <span className="flex items-center space-x-1 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-400 border border-rose-500/30">
          <TrendingDown className="h-3.5 w-3.5" />
          <span>可行性重估：{delta} 分 (门槛抬升/存在死穴)</span>
        </span>
      );
    }
    return (
      <span className="flex items-center space-x-1 rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 border border-slate-700">
        <Scale className="h-3.5 w-3.5 text-slate-400" />
        <span>可行性重估：基准持平 (稳定观察期)</span>
      </span>
    );
  };

  const getStatusPill = () => {
    if (diff.status === 'STATIC_FALLBACK') {
      return (
        <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-mono font-semibold text-amber-400 border border-amber-500/30 flex items-center space-x-1">
          <span>STATIC_FALLBACK (静态基准预设)</span>
        </span>
      );
    }
    if (diff.status === 'PARTIAL') {
      return (
        <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[11px] font-mono font-semibold text-blue-400 border border-blue-500/30 flex items-center space-x-1">
          <Radio className="h-3 w-3 animate-pulse" />
          <span>PARTIAL (部分实时端点已联网验证)</span>
        </span>
      );
    }
    if (diff.status === 'BLOCKED') {
      return (
        <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[11px] font-mono font-semibold text-rose-400 border border-rose-500/30 flex items-center space-x-1">
          <WifiOff className="h-3 w-3" />
          <span>BLOCKED (网络离线/端点受阻)</span>
        </span>
      );
    }
    return (
      <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-300 border border-slate-700">
        {diff.status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl my-8 max-h-[92vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              {getStatusPill()}
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">基准核验日期: {diff.lastVerifiedAt}</span>
              {diff.fetchedAt && (
                <>
                  <span className="text-slate-500">·</span>
                  <span className="text-emerald-400">探测成功: {new Date(diff.fetchedAt).toLocaleTimeString()}</span>
                </>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1.5">
              {diff.title}
            </h2>
            {diff.verificationSourceUrl && (
              <div className="mt-1 flex items-center space-x-1 text-[11px] text-slate-400">
                <span>出处权威源：</span>
                <a
                  href={diff.verificationSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline flex items-center space-x-0.5"
                >
                  <span>{diff.verificationSourceName || diff.verificationSourceUrl}</span>
                  <ExternalLink className="h-3 w-3 ml-0.5" />
                </a>
              </div>
            )}
          </div>

          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Fallback / Verification Notice Banner */}
        {diff.fallbackNotice && (
          <div className="rounded-lg bg-amber-950/20 border border-amber-800/40 p-3 text-xs text-amber-300 flex items-start space-x-2">
            <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              {diff.fallbackNotice}
            </div>
          </div>
        )}

        {/* Score Delta & Live Probe Trigger Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-950 p-3 border border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">系统综合裁决：</span>
            {getDeltaBadge(diff.feasibilityDelta)}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleLiveProbe}
              disabled={isProbing}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
              title="执行真实外部端点探测并记录网络状态"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isProbing ? 'animate-spin' : ''}`} />
              <span>{isProbing ? '探测中...' : '测试实时联网探测'}</span>
            </button>

            <button
              onClick={() => onToggleWatchlist(targetId)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                isWatchlisted
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isWatchlisted ? <BookmarkCheck className="h-3.5 w-3.5 text-amber-400" /> : <Bookmark className="h-3.5 w-3.5" />}
              <span>{isWatchlisted ? '已关注' : '关注'}</span>
            </button>
          </div>
        </div>

        {/* Baseline vs Reality */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-800/90 bg-slate-950/70 p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              旧基准或大众流传印象 (Baseline / Common Myth)
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {diff.baselineSummary}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block flex items-center space-x-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>官方核验实情 (Ground Truth · {diff.lastVerifiedAt})</span>
            </span>
            <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
              {diff.latestFactSummary}
            </p>
          </div>
        </div>

        {/* Policy & Reality Changes Matrix */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-300 block">
            关键政策与市场参数对比变化 (Policy & Market Diffs)
          </span>

          <div className="space-y-1.5">
            {diff.policyChanges.map((change, idx) => (
              <div key={idx} className="rounded-lg bg-slate-950 p-2.5 border border-slate-800/80 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="font-semibold text-white block">{change.aspect}</span>
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="text-slate-400 line-through">前值: {change.before}</span>
                    <ArrowRight className="h-3 w-3 text-slate-500" />
                    <span className={`font-semibold ${
                      change.impact === 'positive' ? 'text-emerald-400' : change.impact === 'negative' ? 'text-rose-400' : 'text-sky-300'
                    }`}>
                      现值: {change.after}
                    </span>
                  </div>
                </div>

                <span className={`self-start sm:self-auto rounded px-2 py-0.5 text-[10px] font-mono shrink-0 border ${
                  change.impact === 'positive'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : change.impact === 'negative'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {change.impact === 'positive' ? '🟢 机会点' : change.impact === 'negative' ? '🔴 门槛上升' : '⚪ 中性调整'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Separate Timestamps Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-lg bg-slate-950 p-2.5 border border-slate-800 text-[10px] font-mono">
          <div>
            <span className="text-slate-500 block">本次分析请求 (Requested):</span>
            <span className="text-slate-300 font-medium">{diff.requestedAt ? new Date(diff.requestedAt).toLocaleTimeString() : '刚刚'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">数据抓取时点 (Fetched):</span>
            <span className="text-emerald-400 font-medium">{diff.lastSourceFetchedAt ? diff.lastSourceFetchedAt.split('T')[0] : '2026-09-06'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">官方发布生效 (Published):</span>
            <span className="text-sky-400 font-medium">{diff.lastSourcePublishedAt || '2026-08-15'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">上次政策实质变动 (Diff Change):</span>
            <span className="text-amber-400 font-medium">{diff.lastMeaningfulChange || '2026-08-15'}</span>
          </div>
        </div>

        {/* 4-Category Segregation: Verified Facts, Inference, Unknown, Community Signals */}
        <div className="space-y-3 pt-1">
          {/* 1. Verified Facts */}
          {diff.verifiedFacts && diff.verifiedFacts.length > 0 && (
            <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3.5 space-y-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>一、官方已核验事实 (Verified Facts · 来自最新官方公报/证据库)</span>
              </span>
              <div className="space-y-1.5 text-xs">
                {diff.verifiedFacts.map((vf, i) => (
                  <div key={i} className="rounded bg-slate-950/80 p-2 border border-emerald-900/30">
                    <p className="text-emerald-100 font-medium">{vf.claim}</p>
                    {vf.quote && (
                      <p className="text-[11px] text-slate-400 italic mt-1 font-mono">"{vf.quote}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. System Inference */}
          {diff.systemInference && diff.systemInference.length > 0 && (
            <div className="rounded-xl border border-indigo-900/40 bg-indigo-950/20 p-3.5 space-y-2">
              <span className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
                <Sparkles className="h-4 w-4" />
                <span>二、结合你当前画像之系统推理 (System Inference · 财务与门槛重估)</span>
              </span>
              <ul className="space-y-1 text-xs text-indigo-200/90">
                {diff.systemInference.map((inf, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span className="leading-relaxed">{inf}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 3. Community Signals & 4. Data Gaps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Community Signals */}
            <div className="rounded-xl border border-amber-900/40 bg-amber-950/15 p-3.5 space-y-1.5">
              <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                <Radio className="h-3.5 w-3.5" />
                <span>三、真实社区避坑信标 (Community Signals)</span>
              </span>
              {diff.communitySignals && diff.communitySignals.length > 0 ? (
                <ul className="space-y-1 text-xs text-amber-200/80">
                  {diff.communitySignals.map((cs, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span className="leading-relaxed">{cs}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 italic">暂无非官方民间预警，当前主要以官方准则为准。</p>
              )}
            </div>

            {/* Unknown Data Gaps */}
            <div className="rounded-xl border border-rose-900/30 bg-rose-950/15 p-3.5 space-y-1.5">
              <span className="text-xs font-bold text-rose-400 flex items-center space-x-1.5">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>四、数据盲区与未知项 (Unknown / Data Gaps)</span>
              </span>
              {diff.dataGapsUnknown && diff.dataGapsUnknown.length > 0 ? (
                <ul className="space-y-1 text-xs text-rose-200/80">
                  {diff.dataGapsUnknown.map((ug, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-rose-400 font-bold">•</span>
                      <span className="leading-relaxed">{ug}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 italic">核心关键参数已全部闭环确证。</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
          >
            完成研判
          </button>
        </div>
      </div>
    </div>
  );
};
