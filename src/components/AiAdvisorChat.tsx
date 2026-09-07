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
  RefreshCw,
  Download,
  Check,
  Plus,
  FileText
} from 'lucide-react';
import { UserProfile, UserPlanTask } from '../types';
import { 
  AiResponseStructure, 
  generateAntigravityAuditPrompt, 
  parseExternalAiResponse 
} from '../engine/aiAdvisor';
import { 
  ByokConfig, 
  loadByokConfig, 
  saveByokConfig, 
  queryAdvisor 
} from '../engine/byokAdvisor';
import { PATHWAYS } from '../data/pathways';

interface AiAdvisorChatProps {
  profile: UserProfile;
  onOpenAiContext: () => void;
  onAddTask?: (task: Omit<UserPlanTask, 'id'>) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text?: string;
  structured?: AiResponseStructure;
  engineUsed?: 'local' | 'byok-gemini' | 'byok-openai' | 'antigravity-external';
  errorNotice?: string;
}

export const AiAdvisorChat: React.FC<AiAdvisorChatProps> = ({ profile, onOpenAiContext, onAddTask }) => {
  const [inputQuery, setInputQuery] = useState('');
  const [byokConfig, setByokConfig] = useState<ByokConfig>(loadByokConfig);
  const [isByokModalOpen, setIsByokModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importRawText, setImportRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

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
    '帮我严格做减法：以当前大专+零存款，哪些国家必须直接排除？',
    '分析当前首选路线（德国双元制）的最关键未知项与死穴',
    '为我当前的下一道门槛设计一个 7 天低成本敏捷小实验',
    '核验止损条件 (Kill Criteria)：德语学到什么程度必须果断放弃？'
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

  const handleCopyAntigravityPrompt = () => {
    const prompt = generateAntigravityAuditPrompt(profile, PATHWAYS, inputQuery || undefined);
    navigator.clipboard.writeText(prompt);
    showToast('✨ 已复制反重力 AI 深度审计 Prompt！可在 Antigravity / Codex 窗口中直接粘贴');
  };

  const handleImportExternalAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importRawText.trim()) return;

    try {
      const structured = parseExternalAiResponse(importRawText);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          structured,
          engineUsed: 'antigravity-external'
        }
      ]);
      setImportRawText('');
      setIsImportModalOpen(false);
      showToast('🎉 成功导入并解析反重力外部研判结果！');
    } catch (err: any) {
      alert('解析外部研判失败: ' + err.message);
    }
  };

  const handleAdoptTask = (actionText: string) => {
    if (!onAddTask) return;
    onAddTask({
      title: actionText.slice(0, 90),
      period: 'today',
      status: 'todo',
      whyNow: '由反重力 AI 决策研判提取'
    });
    showToast(`✅ 已将动作加入今日计划：${actionText.slice(0, 26)}...`);
  };

  const handleSaveByok = (e: React.FormEvent) => {
    e.preventDefault();
    saveByokConfig(tempConfig);
    setByokConfig(tempConfig);
    setIsByokModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 rounded-xl border border-emerald-500/50 bg-slate-900/95 px-4 py-3 text-xs font-semibold text-emerald-300 shadow-2xl backdrop-blur animate-fade-in flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className={`inline-block h-2 w-2 rounded-full ${byokConfig.enabled && byokConfig.apiKey.trim() ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span className={byokConfig.enabled && byokConfig.apiKey.trim() ? 'text-indigo-300 font-semibold' : 'text-emerald-400'}>
                {byokConfig.enabled && byokConfig.apiKey.trim()
                  ? `云端大模型 (AI Model: ${byokConfig.model}) · 浏览器直连 · 会话级临时保存 (关闭即清空)`
                  : '本地规则引擎 (Local Rule Engine) · 离线结构化推理 · 零隐私外泄'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              AI 决策顾问与规则引擎 (Decision Intelligence Advisor)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              严禁将规则引擎冒充为大模型：未配置 API Key 时系统以【本地规则引擎】纯离线运行；配置 Key 后仅在当前浏览器会话内存/sessionStorage 暂存，关闭页面自动物理擦除，严禁虚假宣传加密。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Antigravity Prompt Bridge */}
            <button
              onClick={handleCopyAntigravityPrompt}
              className="flex items-center space-x-1.5 rounded-lg border border-purple-500/50 bg-purple-950/40 px-3 py-2 text-xs font-semibold text-purple-200 hover:bg-purple-900/60 transition-colors shadow-lg shadow-purple-950/30"
              title="一键复制包含您当前画像、Runway状态与官方证据库的反重力高阶 Prompt"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>🌌 复制反重力 Prompt</span>
            </button>

            {/* Import External AI Verdict */}
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center space-x-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-900/50 transition-colors"
              title="粘贴 Antigravity / Codex 返回的结构化研判，自动解析并渲染入会话流"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>📥 导入外部研判</span>
            </button>

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
              <FileText className="h-4 w-4" />
              <span>提取 Markdown 上下文</span>
            </button>
          </div>
        </div>

        {/* Anti-Anxiety Directive Banner */}
        <div className="mt-4 rounded-lg border border-sky-500/30 bg-sky-950/20 p-3 text-xs text-sky-200/90 flex items-start space-x-2.5">
          <ShieldCheck className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-semibold text-sky-300 flex items-center space-x-1.5">
              <span>🛡️ 决策防焦虑机制：做减法、找盲区、锁门槛、防沉没</span>
              <span className="rounded bg-sky-500/20 px-1.5 py-0.2 text-[10px] text-sky-300 font-semibold">专注保障</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              AI 顾问的使命是帮您【排除不可行路线】、定位【官方关键未知盲区】、聚焦【当期唯一的 Next Gate】并设计【7 天最小验证实验】，坚决不向您兜售更多制造信息过载与行动瘫痪的空洞选择。
            </p>
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
                      {msg.engineUsed === 'antigravity-external'
                        ? '🌌 反重力 Agent 外部研判 (Antigravity Copilot Bridge)'
                        : msg.engineUsed === 'byok-gemini'
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
                      {msg.structured.evidenceQuotes.map((eq, i) => {
                        const isAiInference = eq.text.includes('AI 推理') || eq.text.includes('未挂接官方证据库');
                        return (
                          <div key={i} className={`pl-2.5 border-l-2 font-mono text-[11px] ${isAiInference ? 'border-amber-500/50 text-amber-300/90' : 'border-emerald-500/50 text-emerald-300/90'}`}>
                            <div className="flex items-center space-x-1.5 mb-0.5">
                              <span>{isAiInference ? '💭 [AI 推论]' : '✅ [官方已验证]'}</span>
                              <span className="text-slate-400">[{eq.tier}] {eq.title}: </span>
                            </div>
                            <span className="italic">"{eq.text}"</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Uncertainties & Risks */}
                    <div className="rounded-lg bg-rose-950/20 border border-rose-900/40 p-3">
                      <span className="text-[10px] text-rose-400 font-semibold uppercase block mb-0.5">
                        五、不确定性与潜在死穴 (Uncertainties & Failure Modes)
                      </span>
                      <p className="text-rose-200/90 leading-relaxed">{msg.structured.uncertaintiesAndRisks}</p>
                    </div>

                    {/* Next Immediate Action */}
                    <div className="rounded-lg bg-emerald-950/40 border border-emerald-800/60 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-start space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-emerald-400 font-semibold uppercase block">
                            六、下一步立刻执行动作 (Next Action)
                          </span>
                          <p className="text-white font-medium mt-0.5">{msg.structured.nextImmediateAction}</p>
                        </div>
                      </div>

                      {/* Action Adoption Button */}
                      {onAddTask && msg.structured.nextImmediateAction && (
                        <button
                          onClick={() => handleAdoptTask(msg.structured!.nextImmediateAction)}
                          className="shrink-0 flex items-center space-x-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>采纳加入今日计划</span>
                        </button>
                      )}
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
          className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5"
        >
          <Send className="h-3.5 w-3.5" />
          <span>发送</span>
        </button>
      </form>

      {/* Import External AI Verdict Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-5 text-xs shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-white font-bold text-sm">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>导入外部 AI (Antigravity / Codex) 研判结果</span>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-slate-400 leading-relaxed">
              将外部 Antigravity / Claude / Codex 对话返回的研判结果（无论是 Markdown 标题还是 JSON 格式）粘贴在下方，Lifee 将自动结构化提炼核心结论、死穴与下一步行动，并可一键纳入您的今日计划。
            </p>

            <form onSubmit={handleImportExternalAi} className="space-y-3">
              <textarea
                value={importRawText}
                onChange={e => setImportRawText(e.target.value)}
                placeholder="在此粘贴外部 AI 输出的文本..."
                rows={10}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none font-mono"
              />

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-slate-300 hover:bg-slate-700"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!importRawText.trim()}
                  className="rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-1.5 font-semibold text-white transition-colors disabled:opacity-40"
                >
                  确认解析并注入会话
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BYOK Config Modal */}
      {isByokModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 text-xs shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-white font-bold text-sm">
                <Key className="h-4 w-4 text-amber-400" />
                <span>配置云端大模型 API (BYOK - Bring Your Own Key)</span>
              </div>
              <button
                onClick={() => setIsByokModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Strict Privacy Notice */}
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-amber-200/90 space-y-1">
              <div className="font-semibold flex items-center space-x-1 text-amber-300">
                <Lock className="h-3.5 w-3.5" />
                <span>最高隐私与安全透明声明 (Constitutional Rule)</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                1. 您的 Key 仅保存在浏览器当前会话内存/sessionStorage 中，<strong className="text-white">关闭网页窗口立即自动擦除</strong>；
                <br />
                2. 前端直连官方大模型端点，不经过任何第三方服务器中转，严禁冒充虚假加密；
                <br />
                3. 若您不配置 Key，系统以 100% 离线规则引擎运行，零隐私泄露风险。
              </p>
            </div>

            <form onSubmit={handleSaveByok} className="space-y-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1">大模型服务商 (Provider)</label>
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
