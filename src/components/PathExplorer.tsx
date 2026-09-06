import React, { useState } from 'react';
import { 
  Milestone, 
  Clock, 
  Coins, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  HelpCircle,
  TrendingUp,
  Flame,
  ChevronDown,
  ChevronUp,
  Compass,
  Sparkles,
  Search,
  Eye,
  AlertCircle
} from 'lucide-react';
import { Pathway, UserProfile, DiscoveryRoute } from '../types';
import { evaluatePathwayRunwayGating } from '../engine/runway';
import { DISCOVERY_ROUTES } from '../data/discoveryRoutes';

interface PathExplorerProps {
  pathways: Pathway[];
  profile: UserProfile;
  selectedPathway: Pathway | null;
  onSelectPathway: (p: Pathway | null) => void;
  onNavigateTab: (tab: string) => void;
  onTriggerResearch?: (type: 'country' | 'occupation' | 'pathway', id: string) => void;
}

export const PathExplorer: React.FC<PathExplorerProps> = ({
  pathways,
  profile,
  selectedPathway,
  onSelectPathway,
  onNavigateTab,
  onTriggerResearch
}) => {
  const [viewMode, setViewMode] = useState<'validated' | 'discovery'>('validated');
  const [selectedDiscoveryRoute, setSelectedDiscoveryRoute] = useState<DiscoveryRoute | null>(null);
  const [activePathwayId, setActivePathwayId] = useState<string>(
    selectedPathway?.id || pathways[0]?.id || 'path-de-ausbildung'
  );

  const currentPathway = pathways.find(p => p.id === activePathwayId) || pathways[0];
  const gating = evaluatePathwayRunwayGating(currentPathway, profile);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
              <Compass className="h-4 w-4" />
              <span>全节点可行性与止损线审计</span>
              <span className="text-slate-500">·</span>
              <span>前置排查资本断裂与资格壁垒</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              路线探索器 (Path Explorer)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              拒绝“某国不错”的空洞建议。必须从个人当前真实起点出发，拆成可衡量的小节点。每个节点标明所需资金、时间、外语里程碑与退出条件。
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center space-x-2 border border-slate-800 bg-slate-950 p-1 rounded-lg self-start sm:self-auto shrink-0">
            <button
              onClick={() => setViewMode('validated')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'validated'
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              定型可行路线 ({pathways.length})
            </button>
            <button
              onClick={() => setViewMode('discovery')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'discovery'
                  ? 'bg-indigo-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="h-3 w-3 text-amber-300" />
              <span>发现池 · 早期前沿 ({DISCOVERY_ROUTES.length})</span>
            </button>
          </div>
        </div>

        {/* Pathway Tabs for Validated Mode */}
        {viewMode === 'validated' && (
          <div className="mt-5 flex space-x-2 overflow-x-auto pb-1 no-scrollbar border-t border-slate-800/80 pt-4">
            {pathways.map((p, idx) => {
              const isActive = p.id === activePathwayId;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setActivePathwayId(p.id);
                    onSelectPathway(p);
                  }}
                  className={`flex shrink-0 items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium border transition-all ${
                    isActive
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono">
                    #{idx + 1}
                  </span>
                  <span>{p.targetCountry} · {p.category}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Discovery Pipeline Mode View */}
      {viewMode === 'discovery' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-indigo-900/40 bg-indigo-950/20 p-4 text-xs space-y-1">
            <span className="font-bold text-indigo-300 flex items-center space-x-1.5">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>发现池定位说明 (Discovery Pool Protocol · STATIC_SEED / CANDIDATE)</span>
            </span>
            <p className="text-indigo-200/80 text-[11px] leading-relaxed">
              根据宪法规定：以下前沿路线属于<strong>系统预设研究候选 (STATIC_SEED / CANDIDATE)</strong>，绝非自动化爬虫实时凭空发现。每个项目均标明待穿透盲区与关联证据，严禁虚假宣传“全自动挖掘”。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DISCOVERY_ROUTES.map(route => (
              <div
                key={route.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3.5 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">{route.targetCountry} · {route.category}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      route.status === 'due_diligence'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : route.status === 'validated'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                    }`}>
                      {route.status === 'due_diligence' ? '🔍 尽调中' : route.status === 'validated' ? '✅ 已验证' : '⚠️ 待确证'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {route.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {route.summary}
                  </p>

                  <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <strong className="text-amber-400 block">为什么近期受关注：</strong>
                    <div>{route.whyEmerging}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-mono text-slate-400">
                    <span>预估花费: ¥{route.estimatedCostRmb.toLocaleString()}</span>
                    <span>落地周期: {route.estimatedMonths} 个月</span>
                    <span className="text-indigo-400">关联证据: {route.linkedEvidenceIds.length > 0 ? `${route.linkedEvidenceIds.length} 项官方/行业条目` : '待实证补充'}</span>
                    <span className="text-slate-500">基准核验: {route.lastVerifiedAt}</span>
                  </div>

                  <button
                    onClick={() => setSelectedDiscoveryRoute(route)}
                    className="w-full flex items-center justify-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>查看完整尽调盲区与验证步骤</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Discovery Detail Modal */}
          {selectedDiscoveryRoute && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
              <div className="relative w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto space-y-4">
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-mono text-emerald-400">发现池前沿通道尽调报告</span>
                    <h2 className="text-lg font-bold text-white mt-1">
                      {selectedDiscoveryRoute.title}
                    </h2>
                  </div>
                  <button onClick={() => setSelectedDiscoveryRoute(null)} className="rounded p-1 text-slate-400 hover:text-white">
                    <AlertCircle className="hidden" />
                    <span className="text-lg">×</span>
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">通道概述</span>
                    <p className="text-slate-300 leading-relaxed">{selectedDiscoveryRoute.summary}</p>
                  </div>

                  <div className="rounded-lg bg-rose-950/20 border border-rose-900/40 p-3 space-y-2">
                    <span className="text-xs font-bold text-rose-400 block">待穿透的未知风险与盲区 (Unverified Risks)</span>
                    <ul className="space-y-1 text-rose-200/90 text-[11px]">
                      {selectedDiscoveryRoute.unverifiedRisks.map((r, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg bg-indigo-950/20 border border-indigo-900/40 p-3 space-y-2">
                    <span className="text-xs font-bold text-indigo-300 block">建议尽调行动步骤 (Investigation Steps)</span>
                    <ul className="space-y-1 text-indigo-200/90 text-[11px]">
                      {selectedDiscoveryRoute.investigationSteps.map((s, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-indigo-400 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => setSelectedDiscoveryRoute(null)}
                    className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Pathway Deep View for Validated Mode */}
      {viewMode === 'validated' && currentPathway && (
        <div className="space-y-5">
          {/* Pathway Master Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                    {currentPathway.category}
                  </span>
                  <span className="text-xs text-slate-400">最终目的地: {currentPathway.targetCountry}</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">
                  {currentPathway.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed max-w-4xl">
                  {currentPathway.whyRecommended}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 text-center min-w-[90px]">
                  <span className="text-[10px] text-slate-500 block">预计总周期</span>
                  <span className="text-base font-bold text-white font-mono">{currentPathway.totalMonthsEst} 个月</span>
                </div>
                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 text-center min-w-[90px]">
                  <span className="text-[10px] text-slate-500 block">起步最低资金</span>
                  <span className="text-base font-bold text-amber-400 font-mono">¥{currentPathway.minCapitalRmb.toLocaleString()}</span>
                </div>
                <div className="rounded-lg bg-emerald-500/10 p-3 border border-emerald-500/20 text-center min-w-[80px]">
                  <span className="text-[10px] text-emerald-400 block">可行性评分</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">{currentPathway.feasibilityScore}%</span>
                </div>
                {onTriggerResearch && (
                  <button
                    onClick={() => onTriggerResearch('pathway', currentPathway.id)}
                    className="flex flex-col items-center justify-center rounded-lg border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 p-2.5 text-xs text-indigo-300 transition-colors min-w-[90px]"
                    title="重新研究最新政策变动与实证差异"
                  >
                    <Sparkles className="h-4 w-4 mb-0.5 text-indigo-400" />
                    <span className="font-semibold text-[11px]">重新研究 (Diff)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Runway Gating Banner */}
            {gating.isBlocked ? (
              <div className="rounded-lg bg-rose-950/40 border border-rose-800/60 p-3 flex items-start space-x-2 text-xs text-rose-300">
                <Flame className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">资本门槛拦截警告：</span>
                  <span>{gating.reason}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-emerald-950/30 border border-emerald-800/40 p-2.5 flex items-center justify-between text-xs text-emerald-300">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong>现金流适配：</strong>该路线前置成本低或支持居家边赚边学，不要求预先掏出数十万资产证明。</span>
                </div>
              </div>
            )}

            {/* Core Kill Criteria Directive */}
            <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 flex items-start space-x-2 text-xs">
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-400">路线失效止损条件 (Kill Criteria)：</span>
                <span className="text-slate-300 ml-1">{currentPathway.killCriteria}</span>
              </div>
            </div>
          </div>

          {/* Sequential Milestone Nodes Timeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Milestone className="h-4 w-4 text-emerald-400" />
                <span>分段节点推进图 (Sequential Milestones)</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">共 {currentPathway.nodes.length} 个递进节点</span>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
              {currentPathway.nodes.map((node, nodeIdx) => (
                <div key={node.id} className="relative group">
                  {/* Node Circle */}
                  <div className="absolute -left-6 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 border-2 border-emerald-500 text-[10px] font-bold text-emerald-400 group-hover:scale-110 transition-transform">
                    {nodeIdx + 1}
                  </div>

                  {/* Node Card */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 hover:bg-slate-900 transition-all space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono text-emerald-400 font-semibold">{node.stage}</span>
                          <span className="text-slate-500">·</span>
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                            {node.cashflowType}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-0.5">
                          {node.title}
                        </h4>
                      </div>

                      <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
                        <span>周期: {node.durationMonths} 个月</span>
                        <span>花费: ¥{node.costRmb.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Node Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">
                          前置必须条件 (Prerequisites)
                        </span>
                        <ul className="space-y-1">
                          {node.prerequisites.map((p, i) => (
                            <li key={i} className="text-slate-300 flex items-start space-x-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">
                          核心技能与证书 (Skills & Certs)
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {node.skillsToLearn.map((s, i) => (
                            <span key={i} className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-200">
                              {s}
                            </span>
                          ))}
                          {node.certsToAcquire.map((c, i) => (
                            <span key={i} className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[11px] text-indigo-300 border border-indigo-500/20">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* English Milestone & Fallback Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                      <div className="text-slate-400 flex items-center space-x-1.5">
                        <span className="text-slate-500">语言里程碑：</span>
                        <span className="text-slate-200 font-medium">{node.englishMilestone}</span>
                      </div>
                      <div className="text-rose-400/90 flex items-center space-x-1.5">
                        <span className="text-slate-500">应急备选：</span>
                        <span>{node.fallbackPlan}</span>
                      </div>
                    </div>

                    {/* Node Rationale */}
                    <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded border border-slate-800/50">
                      <strong>为什么这一步这么走？</strong> {node.rationale}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
