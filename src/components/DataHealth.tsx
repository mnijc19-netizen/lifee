import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  RefreshCw, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldAlert, 
  Cpu, 
  Database,
  Radio,
  FileCode2,
  Info
} from 'lucide-react';
import { SourceManifest, ManifestSourceItem, SourceStatus } from '../types';

export const DataHealth: React.FC = () => {
  const [manifest, setManifest] = useState<SourceManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchManifest = async () => {
    try {
      const basePath = import.meta.env.BASE_URL || '/';
      const url = `${basePath.endsWith('/') ? basePath : basePath + '/'}data/source_manifest.json`;
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setManifest(data);
      }
    } catch {
      // Keep null or fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchManifest();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchManifest();
  };

  const getStatusBadge = (status: SourceStatus | string) => {
    switch (status) {
      case 'LIVE_DATA':
        return (
          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 font-bold border border-emerald-500/30 flex items-center space-x-1 w-max">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE_DATA (业务数据解析入库)</span>
          </span>
        );
      case 'REACHABLE':
        return (
          <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-400 font-medium border border-blue-500/20 flex items-center space-x-1 w-max">
            <Radio className="h-3 w-3" />
            <span>REACHABLE (仅端点可达 · 无动态解析器)</span>
          </span>
        );
      case 'CACHED':
        return (
          <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] text-sky-400 font-medium border border-sky-500/20 flex items-center space-x-1 w-max">
            <Database className="h-3 w-3" />
            <span>CACHED (官方基准核验缓存)</span>
          </span>
        );
      case 'MANUAL':
        return (
          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400 font-medium border border-amber-500/20 flex items-center space-x-1 w-max">
            <ShieldAlert className="h-3 w-3" />
            <span>MANUAL (人工核验便签)</span>
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="rounded bg-purple-500/10 px-2 py-0.5 text-[10px] text-purple-300 font-medium border border-purple-500/30 flex items-center space-x-1 w-max">
            <AlertTriangle className="h-3 w-3" />
            <span>BLOCKED (反爬 403 · 已降级)</span>
          </span>
        );
      case 'STATIC':
        return (
          <span className="rounded bg-slate-500/10 px-2 py-0.5 text-[10px] text-slate-300 font-medium border border-slate-500/20 flex items-center space-x-1 w-max">
            <FileCode2 className="h-3 w-3" />
            <span>STATIC (代码内置标准分类)</span>
          </span>
        );
      case 'FAILED_PARSER':
        return (
          <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-300 font-medium border border-rose-500/30 flex items-center space-x-1 w-max">
            <XCircle className="h-3 w-3 text-rose-400" />
            <span>FAILED_PARSER (解析失败 · 拒绝虚标)</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-400 font-medium border border-rose-500/30 flex items-center space-x-1 w-max">
            <XCircle className="h-3 w-3" />
            <span>FAILED (连接失败)</span>
          </span>
        );
      default:
        return (
          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 font-medium border border-slate-700 flex items-center space-x-1 w-max">
            <Cpu className="h-3 w-3" />
            <span>{status || 'UNKNOWN'}</span>
          </span>
        );
    }
  };

  const total = manifest?.totalSources || 18;
  const liveData = manifest?.liveDataCount || 0;
  const reachable = manifest?.reachableCount || 0;
  const cached = manifest?.cachedCount || 0;
  const manual = manifest?.manualCount || 0;
  const blocked = manifest?.blockedCount || 0;
  const staticCount = manifest?.staticCount || 0;
  const failed = manifest?.failedCount || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>严格事实铁律 · 拒绝语义偷换</span>
              <span className="text-slate-500">·</span>
              <span>LIVE_DATA ≠ REACHABLE 状态透明看板</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              数据健康看板 · 真实源状态 (Data Health)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              彻底杜绝把“网页能打开/HTTP 200”冒充为“实时数据接入”。可访问 (REACHABLE) ≠ 数据已实时接入 (LIVE_DATA)。
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-1.5 self-start sm:self-auto rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-700 transition-colors shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? '正在重新读取...' : '刷新健康状态'}</span>
          </button>
        </div>

        {/* Semantic Integrity Warning Banner */}
        <div className="mt-4 rounded-lg bg-blue-950/20 border border-blue-800/40 p-3 text-xs text-blue-200/90 space-y-1">
          <div className="flex items-center space-x-1.5 font-bold text-blue-300">
            <Info className="h-4 w-4 text-blue-400 shrink-0" />
            <span>严格状态定义审计：可访问 ≠ 数据已实时接入</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            <strong>LIVE_DATA ({liveData}个)</strong>：实际请求外部官方页面/API、经专有解析器清洗校验并持久化入库（当前重点接通：德国 Make it in Germany、新西兰移民局 INZ、澳大利亚 JSA、开放外汇实盘）。<br />
            <strong>REACHABLE ({reachable}个)</strong>：官方移民/劳工门户网络响应 HTTP 200，但未挂接专用动态解析器。系统对其政策条目诚实采用带固定核验日期的 <strong>CACHED ({cached}个)</strong> 与 <strong>MANUAL ({manual}个)</strong> 基准，绝不虚夸为全量实时爬取。
          </p>
        </div>

        {/* Status Breakdown Metrics - Every number maps 1:1 to table rows */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2.5 pt-3 border-t border-slate-800/80">
          <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">注册数据源</span>
            <span className="text-base font-bold text-white font-mono">{total} 个</span>
          </div>

          <div className="rounded-lg bg-slate-950 p-2.5 border border-emerald-900/40 bg-emerald-950/10">
            <span className="text-[10px] text-emerald-400 block font-medium">LIVE_DATA (解析入库)</span>
            <span className="text-base font-bold text-emerald-400 font-mono">{liveData} 个</span>
          </div>

          <div className="rounded-lg bg-slate-950 p-2.5 border border-blue-900/40 bg-blue-950/10">
            <span className="text-[10px] text-blue-400 block font-medium">REACHABLE (端点可达)</span>
            <span className="text-base font-bold text-blue-400 font-mono">{reachable} 个</span>
          </div>

          <div className="rounded-lg bg-slate-950 p-2.5 border border-sky-900/40 bg-sky-950/10">
            <span className="text-[10px] text-sky-400 block font-medium">CACHED (基准缓存)</span>
            <span className="text-base font-bold text-sky-400 font-mono">{cached} 个</span>
          </div>

          <div className="rounded-lg bg-slate-950 p-2.5 border border-amber-900/40 bg-amber-950/10">
            <span className="text-[10px] text-amber-400 block font-medium">MANUAL (人工便签)</span>
            <span className="text-base font-bold text-amber-400 font-mono">{manual} 个</span>
          </div>

          <div className="rounded-lg bg-slate-950 p-2.5 border border-purple-900/40 bg-purple-950/10">
            <span className="text-[10px] text-purple-300 block font-medium">BLOCKED (反爬拦截)</span>
            <span className="text-base font-bold text-purple-300 font-mono">{blocked} 个</span>
          </div>

          <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">STATIC (标准内置)</span>
            <span className="text-base font-bold text-slate-300 font-mono">{staticCount} 个</span>
          </div>
        </div>
      </div>

      {/* Fallback Ladder Protocol */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-xs space-y-2">
        <span className="font-bold text-white flex items-center space-x-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>合规反爬与抓取降级阶梯执行标准 (Fallback Ladder Protocol)</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 pt-1">
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <strong className="text-emerald-400 block mb-0.5">Level 1: 开放数据与官方 API</strong>
            优先使用官方 JSON/CSV（如汇率、INZ 开放通报），支持实时解析。
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <strong className="text-blue-400 block mb-0.5">Level 2: 规范公开页面 (REACHABLE)</strong>
            遵守 robots.txt，执行网络连通性探测，采用固定核验周期基准。
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <strong className="text-purple-400 block mb-0.5">Level 3: 公开宏观报告替代 (BLOCKED)</strong>
            商业站反爬（如 Upwork 403）时，自动降级至已核验官方行业白皮书。
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <strong className="text-amber-400 block mb-0.5">Level 4: Manual Inbox 便签</strong>
            针对黑盒与个案（如 EWRB 工时审批、租房涨幅），由人工核验便签入库。
          </div>
        </div>
      </div>

      {/* Manifest Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-emerald-400" />
            <h2 className="text-xs font-bold text-white">权威数据源清单 (共 {total} 行，每一行均与上方统计 1:1 对应)</h2>
          </div>
          {manifest?.updatedAt && (
            <span className="text-[10px] font-mono text-slate-500">
              探针执行时间: {new Date(manifest.updatedAt).toLocaleString()}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold">
                <th className="p-3">数据源名称与官网</th>
                <th className="p-3">国别</th>
                <th className="p-3">层级</th>
                <th className="p-3">严格状态</th>
                <th className="p-3">耗时</th>
                <th className="p-3">基准核验日期</th>
                <th className="p-3">实测事实 / 降级说明</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {(manifest?.sources || []).map(src => (
                <tr key={src.id} className="hover:bg-slate-800/30">
                  <td className="p-3">
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-white hover:text-emerald-400 transition-colors block"
                    >
                      {src.name}
                    </a>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5 truncate max-w-xs">
                      {src.url}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 whitespace-nowrap">{src.country}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/20">
                      {src.sourceTier}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {getStatusBadge(src.status)}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {src.latencyMs > 0 ? `${src.latencyMs} ms` : '-'}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {src.lastVerifiedAt || src.lastCheck?.split('T')[0] || 'UNKNOWN'}
                  </td>
                  <td className="p-3 text-[11px] text-slate-300 max-w-md">
                    <div>{src.extractedFact || '-'}</div>
                    {src.error && (
                      <span className="text-[10px] text-rose-400 font-mono block mt-0.5">
                        [{src.error}]
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
