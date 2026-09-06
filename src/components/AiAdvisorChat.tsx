import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  ShieldCheck, 
  Bot, 
  CheckCircle2, 
  Key, 
  Settings, 
  X, 
  ExternalLink, 
  AlertTriangle, 
  Cpu, 
  Lock,
  RefreshCw
} from 'lucide-react';
import { UserProfile } from '../types';
import { AiResponseStructure } from '../engine/aiAdvisor';
import { 
  ByokConfig, 
  loadByokConfig, 
  saveByokConfig, 
  queryAdvisor 
} from '../engine/byokAdvisor';

interface AiAdvisorChatProps {
  profile: UserProfile;
  onOpenAiContext: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text?: string;
  structured?: AiResponseStructure;
  engineUsed?: 'local' | 'byok-gemini' | 'byok-openai';
  errorNotice?: string;
}

export const AiAdvisorChat: React.FC<AiAdvisorChatProps> = ({ profile, onOpenAiContext }) => {
  const [inputQuery, setInputQuery] = useState('');
  const [byokConfig, setByokConfig] = useState<ByokConfig>(loadByokConfig);
  const [isByokModalOpen, setIsByokModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state inside BYOK Modal
  const [tempConfig, setTempConfig] = useState<ByokConfig>(byokConfig);

  useEffect(() => {
    setTempConfig(byokConfig);
  }, [byokConfig]);

  const initialGreeting: AiResponseStructure = useMemo(() => ({
    conclusion: '你好！我是你的个人人生与职业决策专属情报顾问。',
    why: '我的所有推理全部基于系统本地已交叉验证的官方移民局、统计局、EWRB执照委员会及真实社区避坑证据库，拒绝通用大模型的凭空幻觉。',
    relevanceToUser: `已自动加载你的当前画像：${profile.education || '全日制大专'} (${profile.major || '数字媒体与设计'})、流动资金约 ¥${(profile.currentSavingsRmb || 0).toLocaleString()}、偏好弹性/远程。`,
    evidenceQuotes: [
      {
        title: '德国双元制与机会卡政策对比',
        tier: 'Tier A',
        text: '双元制免学费且发工资，机会卡需预存13,092欧自保金。',
        source: 'https://www.make-it-in-germany.com'
      }
    ],
    uncertaintiesAndRisks: '凡本系统未收录或缺乏官方公报的灰色签证中介承诺，我将一律标记为“未确认”或“高风险”。',
    nextImmediateAction: '点击下方推荐问题，或直接向我咨询具体的国家工签、工种换证成本或现金流困局。'
  }), [profile]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      structured: initialGreeting,
      engineUsed: 'local'
    }
  ]);

  const quickChips = [
    '去新西兰做电工现实吗？中国证书能转吗？',
    '德国双元制对我这种大专零积蓄有什么死穴？',
    '朋友说出国开叉车工资高，能办工签移民吗？',
    '居家 AI + 3D 外包如何最快提升时薪并维持现金流？'
  ];

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || inputQuery).trim();
    if (!q || isLoading) return;

    const newMsgs: ChatMessage[] = [...messages, { role: 'user', text: q }];
    setMessages(newMsgs);
    setInputQuery('');
    setIsLoading(true);

    try {
      const result = await queryAdvisor(q, profile, byokConfig);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          structured: result.response,
          engineUsed: result.engineUsed,
          errorNotice: result.errorNotice
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          structured: {
            conclusion: '查询执行异常',
            why: err?.message || '未知错误',
            relevanceToUser: '无法连接到决策推理引擎',
            evidenceQuotes: [],
            uncertaintiesAndRisks: '请检查网络连接或 API Key 设置',
            nextImmediateAction: '切换回本地规则引擎模式后重试'
          },
          engineUsed: 'local'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveByok = (e: React.FormEvent) => {
    e.preventDefault();
    saveByokConfig(tempConfig);
    setByokConfig(tempConfig);
    setIsByokModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className={`inline-block h-2 w-2 rounded-full ${byokConfig.enabled && byokConfig.apiKey.trim() ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span className={byokConfig.enabled && byokConfig.apiKey.trim() ? 'text-indigo-300 font-semibold' : 'text-emerald-400'}>
                {byokConfig.enabled && byokConfig.apiKey.trim()
                  ? `云端大模型 (AI Model: ${byokConfig.model}) · 浏览器直连 · 密钥仅存本地`
                  : '本地规则引擎 (Local Rule Engine) · 离线结构化推理 · 零隐私外泄'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              AI 决策顾问与规则引擎 (Decision Intelligence Advisor)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              严禁将规则引擎伪称为大模型：未配置 API Key 时系统以【本地规则引擎】纯离线运行；配置 Key 后方启用【云端 AI 大模型】直连推演。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setTempConfig(byokConfig);
                setIsByokModalOpen(true);
              }}
              className={`flex items-center space-x-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                byokConfig.enabled && byokConfig.apiKey.trim()
                  ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title="配置您自己的 Gemini 或 OpenAI API Key"
            >
              <Key className="h-3.5 w-3.5 text-amber-400" />
              <span>{byokConfig.enabled && byokConfig.apiKey.trim() ? `AI Model 激活 (${byokConfig.provider.toUpperCase()})` : '配置云端大模型 (BYOK)'}</span>
            </button>

            <button
              onClick={onOpenAiContext}
              className="flex items-center space-x-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span>提取 Markdown 上下文</span>
            </button>
          </div>
        </div>

        {/* Quick Chips */}
        <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-slate-800/80">
          <span className="text-xs text-slate-500 self-center">快速提问：</span>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              disabled={isLoading}
              className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300 transition-colors disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Dialogue Display */}
      <div className="space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'user' ? (
              <div className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs text-white max-w-2xl shadow-lg">
                {msg.text}
              </div>
            ) : (
              <div className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3.5 text-xs shadow-xl">
                {/* Engine Source Badge */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                    <Bot className="h-4 w-4" />
                    <span>决策研判闭环 (Structured Decision Resolution)</span>
                  </div>
                  <div className="flex items-center space-x-1 text-[11px] font-mono text-slate-400">
                    <Cpu className="h-3 w-3 text-slate-500" />
                    <span>
                      {msg.engineUsed === 'byok-gemini'
                        ? 'Google Gemini 大模型直连推演 (AI Model)'
                        : msg.engineUsed === 'byok-openai'
                        ? 'OpenAI 大模型直连推演 (AI Model)'
                        : '本地规则引擎 (Local Rule Engine)'}
                    </span>
                  </div>
                </div>

                {/* Error / Fallback Notice */}
                {msg.errorNotice && (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-2.5 text-amber-300 flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{msg.errorNotice}</span>
                  </div>
                )}

                {msg.structured && (
                  <div className="space-y-3">
                    {/* Conclusion */}
                    <div className="rounded-lg bg-emerald-950/30 border border-emerald-800/50 p-3">
                      <span className="text-[10px] text-emerald-400 font-semibold uppercase block mb-0.5">
                        一、核心结论 (Verdict)
                      </span>
                      <p className="text-sm font-bold text-white leading-relaxed">
                        {msg.structured.conclusion}
                      </p>
                    </div>

                    {/* Why & Relevance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">
                          二、底层依据 (Why)
                        </span>
                        <p className="text-slate-300 leading-relaxed">{msg.structured.why}</p>
                      </div>

                      <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                        <span className="text-[10px] text-indigo-400 font-semibold uppercase block mb-1">
                          三、对我有什么关系 (Personal Relevance)
                        </span>
                        <p className="text-slate-300 leading-relaxed">{msg.structured.relevanceToUser}</p>
                      </div>
                    </div>

                    {/* Evidence Quotes */}
                    <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-1.5">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                        四、所引用之官方证据库条目 (Evidence Citation)
                      </span>
                      {msg.structured.evidenceQuotes.map((eq, i) => (
                        <div key={i} className="pl-2.5 border-l-2 border-emerald-500/50 font-mono text-[11px] text-emerald-300/90">
                          <span className="text-slate-400">[{eq.tier}] {eq.title}: </span>
                          <span>"{eq.text}"</span>
                        </div>
                      ))}
                    </div>

                    {/* Uncertainties & Risks */}
                    <div className="rounded-lg bg-rose-950/20 border border-rose-900/40 p-3">
                      <span className="text-[10px] text-rose-400 font-semibold uppercase block mb-0.5">
                        五、不确定性与潜在死穴 (Uncertainties & Failure Modes)
                      </span>
                      <p className="text-rose-200/90 leading-relaxed">{msg.structured.uncertaintiesAndRisks}</p>
                    </div>

                    {/* Next Immediate Action */}
                    <div className="rounded-lg bg-emerald-950/40 border border-emerald-800/60 p-3 flex items-start space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-emerald-400 font-semibold uppercase block">
                          六、下一步立刻执行动作 (Next Action)
                        </span>
                        <p className="text-white font-medium mt-0.5">{msg.structured.nextImmediateAction}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400 flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
              <span>
                {byokConfig.enabled && byokConfig.apiKey.trim()
                  ? `正在调用云端大模型 (${byokConfig.model}) 进行六段式严格实证推理...`
                  : '本地证据规则引擎正在交叉验证...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="sticky bottom-4 z-20 rounded-xl border border-slate-800 bg-slate-900/90 p-2 shadow-2xl backdrop-blur flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={e => setInputQuery(e.target.value)}
          placeholder="向决策系统咨询任何职业死穴、国家政策或下一步抉择..."
          disabled={isLoading}
          className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !inputQuery.trim()}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-500 transition-colors flex items-center space-x-1.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>发送查询</span>
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>

      {/* BYOK Settings Modal */}
      {isByokModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">云端大模型直连设置 (BYOK)</h2>
              </div>
              <button
                onClick={() => setIsByokModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-lg bg-emerald-950/20 border border-emerald-900/40 p-3 text-xs text-emerald-300 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold">
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                <span>零泄漏隐私保护铁律</span>
              </div>
              <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                您的 API Key 仅保存在当前浏览器的 LocalStorage 中。查询请求将直接由您的浏览器端发起，绝不经过任何后端服务器，保证个人财务与背景数据 100% 本地闭环。
              </p>
            </div>

            <form onSubmit={handleSaveByok} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">直连服务商 (Provider)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTempConfig(prev => ({ ...prev, provider: 'gemini', model: 'gemini-2.5-flash' }))}
                    className={`rounded-lg p-2.5 border text-center transition-colors ${
                      tempConfig.provider === 'gemini'
                        ? 'border-indigo-500 bg-indigo-500/20 text-white font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Google Gemini
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempConfig(prev => ({ ...prev, provider: 'openai', model: 'gpt-4o-mini' }))}
                    className={`rounded-lg p-2.5 border text-center transition-colors ${
                      tempConfig.provider === 'openai'
                        ? 'border-indigo-500 bg-indigo-500/20 text-white font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    OpenAI Compatible
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  API Key <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  value={tempConfig.apiKey}
                  onChange={e => setTempConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder={tempConfig.provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">模型名称 (Model Identifier)</label>
                <input
                  type="text"
                  value={tempConfig.model}
                  onChange={e => setTempConfig(prev => ({ ...prev, model: e.target.value }))}
                  placeholder={tempConfig.provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini'}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none font-mono"
                />
              </div>

              {tempConfig.provider === 'openai' && (
                <div>
                  <label className="block text-slate-400 font-medium mb-1">自定义端点 (Base URL)</label>
                  <input
                    type="text"
                    value={tempConfig.customEndpoint || ''}
                    onChange={e => setTempConfig(prev => ({ ...prev, customEndpoint: e.target.value }))}
                    placeholder="https://api.openai.com/v1"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="enableByok"
                  checked={tempConfig.enabled}
                  onChange={e => setTempConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="enableByok" className="text-slate-300 font-medium select-none cursor-pointer">
                  启用云端大模型直连推演 (若关闭或调用失败将平滑回退至本地规则引擎)
                </label>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const empty = { provider: 'gemini' as const, apiKey: '', model: 'gemini-2.5-flash', enabled: false };
                    setTempConfig(empty);
                    saveByokConfig(empty);
                    setByokConfig(empty);
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 underline"
                >
                  清除已保存 Key
                </button>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsByokModalOpen(false)}
                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    保存配置
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
