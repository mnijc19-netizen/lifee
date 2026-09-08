import React from 'react';
import { ShieldCheck, AlertCircle, ArrowRight, X, FileText, CheckCircle2 } from 'lucide-react';
import { LifeeExportBundle } from '../utils/storageEngine';
import { UserProfile } from '../types';

interface ImportPreviewModalProps {
  isOpen: boolean;
  bundle: LifeeExportBundle | null;
  currentProfile: UserProfile;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
  isOpen,
  bundle,
  currentProfile,
  onConfirm,
  onCancel
}) => {
  if (!isOpen || !bundle) return null;

  const newProfile = bundle.profile;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-200 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-emerald-400">
            <ShieldCheck className="h-5 w-5 shrink-0" />
            <h2 className="text-base font-bold text-white">跨端导入预览与确认</h2>
          </div>
          <button
            onClick={onCancel}
            className="rounded p-1 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Reassurance Notice */}
        <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-3 text-xs text-sky-200 leading-relaxed flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
          <span>
            检测到跨设备或备份导入请求。在您点击“确认导入”之前，<strong>当前设备的本地数据完全不会被更改</strong>。请检查以下对比：
          </span>
        </div>

        {/* Profile Comparison Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-2.5 text-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            核心画像变更对比
          </div>

          <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-800/60 text-slate-400 text-[11px]">
            <span>维度</span>
            <span>当前设备</span>
            <span className="text-emerald-400">导入后</span>
          </div>

          <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-800/40">
            <span className="text-slate-400">画像称谓</span>
            <span className="text-slate-300 font-medium">{currentProfile.name || '默认探索者'}</span>
            <span className="text-emerald-300 font-bold">{newProfile.name || '探索者'}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-800/40">
            <span className="text-slate-400">学历层次</span>
            <span className="text-slate-300">{currentProfile.education}</span>
            <span className="text-emerald-300">{newProfile.education}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-800/40">
            <span className="text-slate-400">可用储蓄</span>
            <span className="text-slate-300 font-mono">¥{(currentProfile.currentSavingsRmb || 0).toLocaleString()}</span>
            <span className="text-emerald-400 font-mono font-bold">¥{(newProfile.currentSavingsRmb || 0).toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-800/40">
            <span className="text-slate-400">月均自给收入</span>
            <span className="text-slate-300 font-mono">¥{(currentProfile.currentMonthlyIncomeRmb || 0).toLocaleString()}</span>
            <span className="text-emerald-400 font-mono font-bold">¥{(newProfile.currentMonthlyIncomeRmb || 0).toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 py-1">
            <span className="text-slate-400">附带数据包</span>
            <span className="text-slate-500">当前任务/清单</span>
            <span className="text-emerald-300">
              {bundle.tasks?.length || 0} 项任务 · {bundle.watchlist?.length || 0} 关注项
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
          >
            取消并保持现状
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 flex items-center space-x-1.5 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>确认导入并覆盖本地</span>
          </button>
        </div>
      </div>
    </div>
  );
};
