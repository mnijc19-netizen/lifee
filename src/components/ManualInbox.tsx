import React, { useState } from 'react';
import { PlusCircle, Link, FileText, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { Evidence, SourceTier } from '../types';

interface ManualInboxProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvidence: (ev: Omit<Evidence, 'id' | 'fetchDate' | 'lastCheckDate'>) => void;
}

export const ManualInbox: React.FC<ManualInboxProps> = ({
  isOpen,
  onClose,
  onAddEvidence
}) => {
  const [title, setTitle] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [url, setUrl] = useState('');
  const [sourceTier, setSourceTier] = useState<SourceTier>('Tier E');
  const [country, setCountry] = useState('新西兰');
  const [summary, setSummary] = useState('');
  const [quoteText, setQuoteText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;

    onAddEvidence({
      title: title.trim(),
      sourceId: `custom-src-${Date.now()}`,
      sourceName: sourceName.trim() || '用户手动录入便签',
      sourceTier,
      url: url.trim() || 'manual://user-note',
      publishDate: new Date().toISOString().split('T')[0],
      country: country.trim() || '综合',
      isOfficial: sourceTier === 'Tier A' || sourceTier === 'Tier B',
      summary: summary.trim(),
      keyFactQuotes: quoteText.trim() ? [quoteText.trim()] : [summary.trim()],
      confidence: '中',
      expiredRisk: '有效'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <PlusCircle className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              手动录入情报 / 社区避坑便签 (Manual Inbox)
            </h2>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">情报标题 (如：某论坛反馈新西兰电工换牌卡死经历)</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="简要概括标题..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">信息来源名称 (如 Reddit / 小红书 / 官方邮件)</label>
              <input
                type="text"
                value={sourceName}
                onChange={e => setSourceName(e.target.value)}
                placeholder="来源名称..."
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">可信度分层 (Source Tier)</label>
              <select
                value={sourceTier}
                onChange={e => setSourceTier(e.target.value as SourceTier)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Tier E">Tier E (社区经验/论坛避坑/真实个案)</option>
                <option value="Tier D">Tier D (咨询报告/媒体文章)</option>
                <option value="Tier C">Tier C (招聘网站/企业岗位)</option>
                <option value="Tier B">Tier B (专业机构/大学官方)</option>
                <option value="Tier A">Tier A (官方政府/法律/移民局)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">关联国家 / 地区</label>
              <input
                type="text"
                value={country}
                onChange={e => setCountry(e.target.value)}
                placeholder="国家..."
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">原始链接 URL (可选)</label>
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">脱水摘要结论 (核心发现了什么坑或机会？)</label>
            <textarea
              required
              rows={3}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="总结核心事实..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">原文关键原话 / 截图引用摘录 (Key Fact Quote)</label>
            <textarea
              rows={2}
              value={quoteText}
              onChange={e => setQuoteText(e.target.value)}
              placeholder="粘贴原文关键句子..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 font-mono text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
            >
              取消
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-500"
            >
              归档入本地证据库
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
