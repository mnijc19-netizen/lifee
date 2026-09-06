import React, { useState } from 'react';
import { Copy, Check, X, Sparkles, FileText, Lock } from 'lucide-react';
import { UserProfile, Pathway } from '../types';
import { generateExportableAiContext } from '../engine/aiAdvisor';

interface AiContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  topPathways: Pathway[];
}

export const AiContextModal: React.FC<AiContextModalProps> = ({
  isOpen,
  onClose,
  profile,
  topPathways
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const markdownContext = generateExportableAiContext(profile, topPathways);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownContext);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
              <Sparkles className="h-4 w-4" />
              <span>客户端零泄露安全生成 (Local Generation Only)</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              一键提取 AI 决策上下文 (Copy AI Context)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              结构化整合你的当前学历背景、财务基准、资产制作经验与当前 Top 3 路线。可直接全选粘贴至 ChatGPT、Claude、Codex 或 Antigravity。
            </p>
          </div>

          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Box */}
        <div className="mt-4 flex-1 overflow-y-auto rounded-lg bg-slate-950 p-4 border border-slate-800">
          <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
            {markdownContext}
          </pre>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center space-x-1">
            <Lock className="h-3.5 w-3.5 text-emerald-400" />
            <span>纯本地生成，绝不上报公开网络</span>
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
            >
              关闭
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950 transition-colors"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? '已复制到剪贴板！' : '复制全部 Markdown'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
