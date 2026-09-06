import React, { useMemo } from 'react';
import { X, Sparkles, TrendingUp, TrendingDown, ShieldAlert, ArrowRight, CheckCircle2, Bookmark, BookmarkCheck, ExternalLink, Scale } from 'lucide-react';
import { UserProfile } from '../types';
import { evaluateResearchDiff } from '../engine/researchEngine';

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

  const diff = useMemo(() => {
    return evaluateResearchDiff(targetType, targetId, profile);
  }, [targetType, targetId, profile]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl my-8 max-h-[92vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
              <Sparkles className="h-4 w-4" />
              <span>多维交叉实证 · 实时重新研究 (Deep Re-evaluation)</span>
              <span className="text-slate-500">·</span>
              <span>{diff.researchedAt}</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5">
              {diff.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              对比基准历史档案 vs 官方最新出台的签证/劳工公报与市场水温，识别隐藏死穴与突破机会。
            </p>
          </div>

          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Score Delta Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-950 p-3.5 border border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">系统综合裁决：</span>
            {getDeltaBadge(diff.feasibilityDelta)}
          </div>

          <button
            onClick={() => onToggleWatchlist(targetId)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              isWatchlisted
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isWatchlisted ? <BookmarkCheck className="h-3.5 w-3.5 text-amber-400" /> : <Bookmark className="h-3.5 w-3.5" />}
            <span>{isWatchlisted ? '已在关注清单' : '加入重点关注'}</span>
          </button>
        </div>

        {/* Baseline vs Latest Reality */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="rounded-xl border border-slate-800/90 bg-slate-950/70 p-4 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              旧基准或大众流传印象 (Baseline / Common Myth)
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {diff.baselineSummary}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-4 space-y-1.5">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block flex items-center space-x-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>最新官方核验实情 (Latest Ground Truth)</span>
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

          <div className="space-y-2">
            {diff.policyChanges.map((change, idx) => (
              <div key={idx} className="rounded-lg bg-slate-950 p-3 border border-slate-800/80 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="space-y-1">
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

        {/* Risk Audit & Action Directive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
          <div className="rounded-xl border border-rose-900/30 bg-rose-950/15 p-4 space-y-2">
            <span className="text-xs font-bold text-rose-400 flex items-center space-x-1.5">
              <ShieldAlert className="h-4 w-4" />
              <span>前置死穴与致命盲区排查 (Risk & Trap Audit)</span>
            </span>
            <ul className="space-y-1.5 text-xs text-rose-200/80">
              {diff.riskAudit.map((risk, i) => (
                <li key={i} className="flex items-start space-x-1.5">
                  <span className="text-rose-400 shrink-0 font-bold">•</span>
                  <span className="leading-relaxed">{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-indigo-900/40 bg-indigo-950/20 p-4 space-y-2">
            <span className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span>针对你的最新行动修正 (Action Directive)</span>
            </span>
            <p className="text-xs text-indigo-100/90 leading-relaxed font-medium">
              {diff.recommendedAction}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end space-x-2">
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
