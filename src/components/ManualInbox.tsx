import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Link as LinkIcon, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  Zap, 
  Sparkles, 
  Clipboard, 
  AlertTriangle, 
  Globe, 
  Tag, 
  HelpCircle,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Evidence, SourceTier } from '../types';

interface ManualInboxProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvidence: (ev: Omit<Evidence, 'id' | 'fetchDate' | 'lastCheckDate'>) => void;
}

const PRESET_TEMPLATES = [
  {
    icon: '💥',
    label: '找工隐形门槛',
    template: '【找工避坑】在[某国/城市]，[某岗位]表面要求不高，实则当地雇主普遍要求[本地执照/特定语言等级/本地工作经验]，没有准备好切勿盲目落地！'
  },
  {
    icon: '⏱️',
    label: '签证排期卡死',
    template: '【排期情报】[某国某签证]在[某地外管局/领馆]目前实际审核排期已长达[X]个月，材料初审严重积压，建议避开此地区或预留额外预算！'
  },
  {
    icon: '💰',
    label: '租房真实开销',
    template: '【真实成本】在[某城市]目前单间房租实际约为每月[X]元，押金需[X]个月，算上初期安置与交通月均开销至少需准备[X]元！'
  },
  {
    icon: '⚠️',
    label: '黑中介擦边陷阱',
    template: '【中介避坑】警惕声称[保就业/免语言/低门槛挂靠]的项目，实际涉及[非法分包/违规打工]，已有被查处拒签或遣返风险！'
  }
];

export const ManualInbox: React.FC<ManualInboxProps> = ({
  isOpen,
  onClose,
  onAddEvidence
}) => {
  // Mode: 'smart' (one-box auto paste) vs 'detailed' (full manual form)
  const [mode, setMode] = useState<'smart' | 'detailed'>('smart');
  const [smartText, setSmartText] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [isCopiedSuccess, setIsCopiedSuccess] = useState(false);

  // Extracted or detailed fields
  const [title, setTitle] = useState('');
  const [sourceName, setSourceName] = useState('小红书 / 社区经验');
  const [url, setUrl] = useState('');
  const [sourceTier, setSourceTier] = useState<SourceTier>('Tier E');
  const [country, setCountry] = useState('新西兰');
  const [summary, setSummary] = useState('');
  const [quoteText, setQuoteText] = useState('');

  // Auto-extraction logic on smartText change
  useEffect(() => {
    if (!smartText.trim()) return;

    // 1. Detect URL
    const urlMatch = smartText.match(/https?:\/\/[^\s]+/i);
    if (urlMatch) {
      setUrl(urlMatch[0]);
    }

    // 2. Detect Source
    const lower = smartText.toLowerCase();
    if (lower.includes('xiaohongshu') || lower.includes('xhslink') || smartText.includes('小红书')) {
      setSourceName('小红书真实经历');
      setSourceTier('Tier E');
    } else if (lower.includes('mp.weixin.qq.com') || smartText.includes('微信') || smartText.includes('公众号')) {
      setSourceName('微信公众号深度帖');
      setSourceTier('Tier D');
    } else if (lower.includes('reddit') || smartText.includes('reddit') || smartText.includes('r/')) {
      setSourceName('Reddit 海外社区');
      setSourceTier('Tier E');
    } else if (lower.includes('zhihu') || smartText.includes('知乎')) {
      setSourceName('知乎实操分享');
      setSourceTier('Tier E');
    } else if (lower.includes('bilibili') || smartText.includes('b站') || smartText.includes('哔哩哔哩')) {
      setSourceName('Bilibili 视频分享');
      setSourceTier('Tier E');
    }

    // 3. Detect Country
    if (smartText.includes('新西兰') || smartText.includes('奥克兰') || smartText.includes('基督城') || smartText.includes('惠灵顿') || smartText.includes('纽村')) {
      setCountry('新西兰');
    } else if (smartText.includes('德国') || smartText.includes('柏林') || smartText.includes('慕尼黑') || smartText.includes('法兰克福') || smartText.includes('汉堡') || smartText.includes('双元制')) {
      setCountry('德国');
    } else if (smartText.includes('澳大利亚') || smartText.includes('澳洲') || smartText.includes('悉尼') || smartText.includes('墨尔本') || smartText.includes('布里斯班')) {
      setCountry('澳大利亚');
    } else if (smartText.includes('日本') || smartText.includes('东京') || smartText.includes('大阪') || smartText.includes('特定技能')) {
      setCountry('日本');
    } else if (smartText.includes('新加坡')) {
      setCountry('新加坡');
    } else if (smartText.includes('西班牙')) {
      setCountry('西班牙');
    } else if (smartText.includes('加拿大') || smartText.includes('温哥华') || smartText.includes('多伦多')) {
      setCountry('加拿大');
    }

    // 4. Auto Title Generation
    const cleaned = smartText.replace(/https?:\/\/[^\s]+/gi, '').trim();
    const firstLine = cleaned.split('\n')[0] || '';
    const firstSentence = firstLine.split(/[。！？!?]/)[0] || '';
    const autoTitle = firstSentence.length > 0 && firstSentence.length <= 36 
      ? firstSentence 
      : cleaned.slice(0, 32) + (cleaned.length > 32 ? '...' : '');

    setTitle(autoTitle || '用户随手记避坑便签');
    setSummary(cleaned);
    setQuoteText(cleaned.slice(0, 180));
  }, [smartText]);

  if (!isOpen) return null;

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSmartText(text);
      }
    } catch {
      // ignore
    }
  };

  const handleApplyTemplate = (tpl: string) => {
    setSmartText(tpl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSummary = mode === 'smart' ? (smartText.trim() || summary.trim()) : summary.trim();
    const finalTitle = title.trim() || (finalSummary.slice(0, 30) + '...');

    if (!finalSummary) return;

    onAddEvidence({
      title: finalTitle,
      sourceId: `custom-src-${Date.now()}`,
      sourceName: sourceName.trim() || '用户随手记便签',
      sourceTier,
      url: url.trim() || 'manual://user-inbox-note',
      publishDate: new Date().toISOString().split('T')[0],
      country: country.trim() || '全球/综合',
      isOfficial: sourceTier === 'Tier A' || sourceTier === 'Tier B',
      summary: finalSummary,
      keyFactQuotes: quoteText.trim() ? [quoteText.trim()] : [finalSummary.slice(0, 150)],
      confidence: '中',
      expiredRisk: '有效'
    });

    setIsCopiedSuccess(true);
    setTimeout(() => {
      setIsCopiedSuccess(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/95 p-5 sm:p-6 shadow-2xl my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  录入民间避坑情报 / 随手速记
                </h2>
                <button
                  type="button"
                  onClick={() => setShowHelp(!showHelp)}
                  className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title="查看具体作用与说明"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                支持整段复制粘贴，系统自动提炼国家、避坑要点与来源
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Explain Card (Collapsible) */}
        {showHelp && (
          <div className="mt-3 rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-3 text-xs text-indigo-200 space-y-1.5">
            <div className="flex items-center space-x-1.5 font-semibold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>这个功能具体有什么用？</span>
            </div>
            <p className="text-[11px] leading-relaxed text-indigo-200/90">
              1. <strong>记录官方不写的民间真相</strong>：各国移民局官网上绝不会告诉你哪家外管局排期卡死、哪个城市租房爆雷、或者哪些中介口头承诺是坑。你在小红书、知乎或微信看到的真实经验，随手一粘即可存下；<br />
              2. <strong>喂给 AI 决策顾问</strong>：你录入的每一个避坑案例，都会进入系统的【证据库】。后续你向 AI 咨询或测算资金时，AI 会把这些作为专属参考依据提醒你避坑；<br />
              3. <strong>三端自动打通</strong>：无论你在电脑上粘贴还是手机上速记，三台设备（PC · iPhone 16 Pro · 小米 14 Pro）都会全自动同步！
            </p>
          </div>
        )}

        {/* Mode Selector */}
        <div className="mt-3.5 flex items-center justify-between rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setMode('smart')}
            className={`flex-1 flex items-center justify-center space-x-1.5 rounded-lg py-1.5 font-medium transition-all cursor-pointer ${
              mode === 'smart' 
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>⚡ 智能一键速记 (超省心)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('detailed')}
            className={`flex-1 flex items-center justify-center space-x-1.5 rounded-lg py-1.5 font-medium transition-all cursor-pointer ${
              mode === 'detailed' 
                ? 'bg-slate-800 text-white font-bold shadow-xs' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>📝 传统详细表单 (微调)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-3.5 space-y-3.5 text-xs">
          {mode === 'smart' ? (
            /* --- SMART ONE-BOX MODE --- */
            <div className="space-y-3">
              {/* Quick Preset Chips */}
              <div>
                <span className="text-[11px] text-slate-400 mb-1.5 block">
                  快速点选常见避坑模板：
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_TEMPLATES.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyTemplate(t.template)}
                      className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-left text-[11px] text-slate-300 hover:border-emerald-500/50 hover:bg-slate-800 hover:text-white transition-all group cursor-pointer"
                    >
                      <span className="text-xs group-hover:scale-110 transition-transform">{t.icon}</span>
                      <span className="truncate">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Paste Textarea */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium flex items-center space-x-1">
                    <span>粘贴帖子内容、避坑经验或随手记：</span>
                  </label>
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="flex items-center space-x-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <Clipboard className="h-3 w-3" />
                    <span>一键粘贴剪贴板</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={4}
                  value={smartText}
                  onChange={e => setSmartText(e.target.value)}
                  placeholder="📋 随便粘贴你在小红书、知乎、微信公众号或论坛看到的内容，带网址也行...&#10;例如：小红书上看到很多老哥吐槽奥克兰叉车工找工极难，中介吹嘘的保就业全坑，没有本地 F 证和一年驾龄连面试都没有..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all leading-relaxed"
                />
              </div>

              {/* Real-Time Extraction Preview Pills */}
              {smartText.trim() && (
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-semibold text-emerald-400 flex items-center space-x-1">
                      <Sparkles className="h-3 w-3" />
                      <span>已为你自动识别与提炼：</span>
                    </span>
                    <span className="text-[10px] text-slate-500">（如需更改可直接点击切换）</span>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    {/* Country Selector Chip */}
                    <div className="flex items-center space-x-1 rounded-full bg-slate-900 border border-slate-700 px-2.5 py-1 text-slate-200">
                      <Globe className="h-3 w-3 text-emerald-400 shrink-0" />
                      <span className="text-slate-400">国家:</span>
                      <select
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        className="bg-transparent text-emerald-300 font-medium focus:outline-none cursor-pointer"
                      >
                        <option value="新西兰" className="bg-slate-900 text-white">新西兰</option>
                        <option value="德国" className="bg-slate-900 text-white">德国</option>
                        <option value="澳大利亚" className="bg-slate-900 text-white">澳大利亚</option>
                        <option value="日本" className="bg-slate-900 text-white">日本</option>
                        <option value="新加坡" className="bg-slate-900 text-white">新加坡</option>
                        <option value="西班牙" className="bg-slate-900 text-white">西班牙</option>
                        <option value="加拿大" className="bg-slate-900 text-white">加拿大</option>
                        <option value="全球/综合" className="bg-slate-900 text-white">全球/综合</option>
                      </select>
                    </div>

                    {/* Source Selector Chip */}
                    <div className="flex items-center space-x-1 rounded-full bg-slate-900 border border-slate-700 px-2.5 py-1 text-slate-200">
                      <Tag className="h-3 w-3 text-indigo-400 shrink-0" />
                      <span className="text-slate-400">来源:</span>
                      <select
                        value={sourceName}
                        onChange={e => setSourceName(e.target.value)}
                        className="bg-transparent text-indigo-300 font-medium focus:outline-none cursor-pointer"
                      >
                        <option value="小红书真实经历" className="bg-slate-900 text-white">小红书经历</option>
                        <option value="知乎实操分享" className="bg-slate-900 text-white">知乎分享</option>
                        <option value="微信公众号深度帖" className="bg-slate-900 text-white">微信公众号</option>
                        <option value="Reddit 海外社区" className="bg-slate-900 text-white">Reddit 社区</option>
                        <option value="Bilibili 视频分享" className="bg-slate-900 text-white">B站视频</option>
                        <option value="线下/朋友亲历反馈" className="bg-slate-900 text-white">朋友亲历</option>
                        <option value="用户随手记便签" className="bg-slate-900 text-white">随手便签</option>
                      </select>
                    </div>

                    {/* Tier Indicator */}
                    <span className="rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium">
                      民间避坑经验 (Tier E)
                    </span>
                  </div>

                  {/* Title edit inline */}
                  <div className="pt-1 flex items-center space-x-1.5">
                    <span className="text-slate-400 shrink-0">标题:</span>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="自动提取的标题..."
                      className="w-full bg-transparent text-slate-200 font-medium border-b border-dashed border-slate-700 focus:border-emerald-500 focus:outline-none px-1 py-0.5"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* --- DETAILED / POWER USER FORM --- */
            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">情报标题</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="如：某论坛反馈新西兰电工换牌卡死经历"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">信息来源名称</label>
                  <input
                    type="text"
                    value={sourceName}
                    onChange={e => setSourceName(e.target.value)}
                    placeholder="如：小红书、知乎、微信"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">可信度分层</label>
                  <select
                    value={sourceTier}
                    onChange={e => setSourceTier(e.target.value as SourceTier)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Tier E">Tier E (社区经验 / 论坛避坑 / 真实个案)</option>
                    <option value="Tier D">Tier D (咨询报告 / 媒体文章)</option>
                    <option value="Tier C">Tier C (招聘网站 / 企业岗位)</option>
                    <option value="Tier B">Tier B (专业机构 / 大学官方)</option>
                    <option value="Tier A">Tier A (官方政府 / 法律 / 移民局)</option>
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
                    placeholder="新西兰 / 德国 / 澳大利亚..."
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
                <label className="block text-slate-400 mb-1">核心摘要结论 (发现了什么坑或机会？)</label>
                <textarea
                  required
                  rows={2}
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="总结核心事实..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">原文关键原话摘录</label>
                <textarea
                  rows={2}
                  value={quoteText}
                  onChange={e => setQuoteText(e.target.value)}
                  placeholder="粘贴原文关键句子..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 font-mono text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-800/80 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={mode === 'smart' ? !smartText.trim() : (!title.trim() || !summary.trim())}
              className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-xs font-bold text-slate-950 hover:from-emerald-400 hover:to-teal-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isCopiedSuccess ? '✓ 已归档入库！' : '⚡ 立即一键归档入库'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
