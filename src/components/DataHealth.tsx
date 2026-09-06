import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Globe, CheckCircle2, AlertTriangle, XCircle, ShieldAlert, Cpu, Database } from 'lucide-react';
import { SourceManifest, ManifestSourceItem } from '../types';

export const DataHealth: React.FC = () => {
  const [manifest, setManifest] = useState<SourceManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchManifest = async () => {
    try {
      // Support GitHub Pages base path
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return (
          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 font-bold border border-emerald-500/30 flex items-center space-x-1 w-max">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>实时在线 (Live)</span>
          </span>
        );
      case 'cached':
        return (
          <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] text-sky-400 font-medium border border-sky-500/20 flex items-center space-x-1 w-max">
            <Database className="h-3 w-3" />
            <span>本地官方缓存 (Cached)</span>
          </span>
        );
      case 'manual':
        return (
          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400 font-medium border border-amber-500/20 flex items-center space-x-1 w-max">
            <ShieldAlert className="h-3 w-3" />
            <span>合规人工/便签 (Manual)</span>
          </span>
        );
      case 'blocked':
        return (
          <span className="rounded bg-purple-500/10 px-2 py-0.5 text-[10px] text-purple-300 font-medium border border-purple-500/30 flex items-center space-x-1 w-max">
            <AlertTriangle className="h-3 w-3" />
            <span>反爬阻断/已降级 (Blocked)</span>
          </span>
        );
      case 'failed':
        return (
          <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-400 font-medium border border-rose-500/30 flex items-center space-x-1 w-max">
            <XCircle className="h-3 w-3" />
            <span>连接超时 (Failed)</span>
          </span>
        );
      default:
        return (
          <span className="rounded bg-slate-500/10 px-2 py-0.5 text-[10px] text-slate-400 font-medium border border-slate-500/20 flex items-center space-x-1 w-max">
            <Cpu className="h-3 w-3" />
            <span>开发排期中 (Queue)</span>
          </span>
        );
    }
  };

  const total = manifest?.totalSources || 18;
  const live = manifest?.liveCount || 0;
  const cached = manifest?.cachedCount || 0;
  const manual = manifest?.manualCount || 0;
  const blocked = manifest?.blockedCount || 0;
  const failed = manifest?.failedCount || 0;
  const unsupported = manifest?.unsupportedCount || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
              <span>零盲猜与事实铁律驱动</span>
              <span className="text-slate-500">·</span>
              <span>数据源健康度与反爬降级梯实时监控</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              数据健康看板 · 真实源状态 (Data Health)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              绝不掩盖失败，绝不虚假宣传 100% 全绿。真实反映官方政府网站、职业注册局与招聘门户的网络可达性、反爬拦截状态与合规降级梯执行情况。
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

        {/* Status Breakdown Metrics */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-4 border-t border-slate-800/80">
          <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">数据源总数</span>
            <span className="text-lg font-bold text-white font-mono">{total} 个</span>
          </div>

          <div className="rounded-lg bg-slate-950 p-3 border border-emerald-900/40 bg-emerald-950/10">
            <span className="text-[10px] text-emerald-400 block font-medium">实时在线 (Live)</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">{live} 个</span>
          </div>

          <div className="rounded-lg bg-slate-950 p-3 border border-sky-900/40 bg-sky-950/10">
            <span className="text-[10px] text-sky-400 block font-medium">官方基准缓存</span>
            <span className="text-lg font-bold text-sky-400 font-mono">{cached} 个</span>
          </div>

          <div className="rounded-lg bg-slate-950 p-3 border border-amber-900/40 bg-amber-950/10">
            <span className="text-[10px] text-amber-400 block font-medium">合规人工便签</span>
            <span className="text-lg font-bold text-amber-400 font-mono">{manual} 个</span>
          </div>

          <div className="rounded-lg bg-slate-950 p-3 border border-purple-900/40 bg-purple-950/10">
            <span className="text-[10px] text-purple-300 block font-medium">商业反爬/已降级</span>
            <span className="text-lg font-bold text-purple-300 font-mono">{blocked} 个</span>
          </div>

          <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">超时/排期适配</span>
            <span className="text-lg font-bold text-slate-400 font-mono">{failed + unsupported} 个</span>
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
            <strong className="text-emerald-400 block mb-0.5">Level 1: 官方开放数据/API</strong>
            优先使用政府公开 CSV/JSON 与 RSS 协议（如汇率、INZ公告），零侵入。
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <strong className="text-sky-400 block mb-0.5">Level 2: 规范公开页面</strong>
            遵守 robots.txt，低频限速缓存，带 ETag / ContentHash 检验。
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <strong className="text-purple-400 block mb-0.5">Level 3: 公开宏观报告替代</strong>
            商业站反爬（如 Upwork/招聘站 403）时，自动降级至年度官方调研报告。
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <strong className="text-amber-400 block mb-0.5">Level 4: Manual Inbox</strong>
            支持用户粘贴真实踩坑帖与官方工单批复，补齐黑盒盲区。
          </div>
        </div>
      </div>

      {/* Manifest Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-emerald-400" />
            <h2 className="text-xs font-bold text-white">权威数据源详细探测清单 ({total} 个)</h2>
          </div>
          {manifest?.updatedAt && (
            <span className="text-[10px] font-mono text-slate-500">
              最后核验时间: {new Date(manifest.updatedAt).toLocaleString()}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold">
                <th className="p-3.5">数据源名称与官网</th>
                <th className="p-3.5">所属国别</th>
                <th className="p-3.5">权威层级</th>
                <th className="p-3.5">健康状态</th>
                <th className="p-3.5">响应耗时</th>
                <th className="p-3.5">核验事实 / 降级策略</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {(manifest?.sources || []).map(src => (
                <tr key={src.id} className="hover:bg-slate-800/30">
                  <td className="p-3.5">
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
                  <td className="p-3.5 text-slate-400">{src.country}</td>
                  <td className="p-3.5">
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/20">
                      {src.sourceTier}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {getStatusBadge(src.status)}
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-400">
                    {src.latencyMs > 0 ? `${src.latencyMs} ms` : '-'}
                  </td>
                  <td className="p-3.5 text-[11px] text-slate-300 max-w-md">
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

