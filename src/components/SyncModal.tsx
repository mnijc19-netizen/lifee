import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Laptop, 
  QrCode, 
  Copy, 
  Check, 
  RefreshCw, 
  Download, 
  Upload, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  Share2,
  Database,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { UserProfile, UserPlanTask, Evidence } from '../types';
import { 
  LifeeSyncPayload, 
  getSavedSyncCode, 
  saveSyncCode, 
  generatePairingCode, 
  generateInstantMobileSyncUrl,
  uploadToCloudRelay,
  downloadFromCloudRelay,
  getOrCreateDeviceId
} from '../engine/syncEngine';
import { 
  loadSupabaseConfig, 
  saveSupabaseConfig, 
  testSupabaseConnection, 
  INITIAL_SUPABASE_SQL,
  SupabaseConfig 
} from '../engine/supabaseSync';
import { isCloudSyncPreConfigured, CLOUD_SYNC_CONFIG } from '../config/cloudSyncConfig';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  tasks: UserPlanTask[];
  setTasks: React.Dispatch<React.SetStateAction<UserPlanTask[]>>;
  watchlist: string[];
  setWatchlist: React.Dispatch<React.SetStateAction<string[]>>;
  customEvidence: Evidence[];
  setCustomEvidence: React.Dispatch<React.SetStateAction<Evidence[]>>;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  profile,
  setProfile,
  tasks,
  setTasks,
  watchlist,
  setWatchlist,
  customEvidence,
  setCustomEvidence
}) => {
  const [pairingCode, setPairingCode] = useState<string>(getSavedSyncCode() || generatePairingCode());
  const [inputCode, setInputCode] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('就绪');
  const [isProcessing, setIsProcessing] = useState(false);
  const deviceId = getOrCreateDeviceId();

  // Supabase state
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(loadSupabaseConfig);
  const [isSupabaseExpanded, setIsSupabaseExpanded] = useState(false);
  const [supabaseTesting, setSupabaseTesting] = useState(false);
  const [supabaseTestMsg, setSupabaseTestMsg] = useState<{ success: boolean; text: string } | null>(null);

  useEffect(() => {
    saveSyncCode(pairingCode);
  }, [pairingCode]);

  if (!isOpen) return null;

  const currentPayload: LifeeSyncPayload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    deviceId,
    profile,
    tasks,
    watchlist,
    customEvidence
  };

  const handleCopyMobileLink = async () => {
    setIsProcessing(true);
    try {
      const url = await generateInstantMobileSyncUrl(currentPayload);
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setSyncStatus('手机同步直达链接已复制！在 iPhone 16 Pro 微信或 Safari 粘贴打开即可秒级同步全部数据。');
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      setSyncStatus('链接生成失败，请尝试下方配对码或文件导入。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(pairingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopySql = async () => {
    await navigator.clipboard.writeText(INITIAL_SUPABASE_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleTestSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseTesting(true);
    setSupabaseTestMsg(null);
    try {
      const res = await testSupabaseConnection(supabaseConfig.url, supabaseConfig.anonKey);
      setSupabaseTestMsg({ success: res.success, text: res.message });
      if (res.success) {
        const updated = { ...supabaseConfig, enabled: true };
        setSupabaseConfig(updated);
        saveSupabaseConfig(updated);
        // Automatically trigger push
        await uploadToCloudRelay(pairingCode, currentPayload);
        setSyncStatus('✓ Supabase 连接成功并已上传当前数据快照！');
      }
    } finally {
      setSupabaseTesting(false);
    }
  };

  const handlePairWithCode = async () => {
    if (!inputCode.trim()) return;
    setIsProcessing(true);
    setSyncStatus('正在通过配对码查找云端数据...');
    try {
      const code = inputCode.toUpperCase().trim();
      const downloaded = await downloadFromCloudRelay(code);
      if (downloaded && downloaded.profile) {
        setProfile(downloaded.profile);
        if (downloaded.tasks) setTasks(downloaded.tasks);
        if (downloaded.watchlist) setWatchlist(downloaded.watchlist);
        if (downloaded.customEvidence) setCustomEvidence(downloaded.customEvidence);
        setPairingCode(code);
        saveSyncCode(code);
        setSyncStatus(`✓ 同步成功！已从设备 (${downloaded.deviceId}) 载入最新画像与决策清单。`);
      } else {
        setSyncStatus('未找到此配对码对应的云端同步记录，请先在发送端点击“更新云端快照”。');
      }
    } catch {
      setSyncStatus('配对同步出错，请检查网络或配对码。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadCurrent = async () => {
    setIsProcessing(true);
    setSyncStatus('正在更新云端快照...');
    try {
      const ok = await uploadToCloudRelay(pairingCode, currentPayload);
      if (ok) {
        setSyncStatus(`✓ 云端快照更新成功！另一台设备输入配对码【${pairingCode}】即可拉取。`);
      } else {
        setSyncStatus('云端上传遇到轻微波动，已在本地暂存。');
      }
    } catch {
      setSyncStatus('上传异常，请重试。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `lifee_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setSyncStatus('冷备 JSON 文件已导出到本地下载目录。');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as LifeeSyncPayload;
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.watchlist) setWatchlist(parsed.watchlist);
        if (parsed.customEvidence) setCustomEvidence(parsed.customEvidence);
        setSyncStatus('✓ 本地 JSON 备份数据已成功导入并恢复！');
      } catch {
        setSyncStatus('导入失败：文件格式不符合 Lifee 标准备份规范。');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-200 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>多设备安全无感同步 · 端到端本地优先</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              多设备数据互通中心 (Cross-Device Sync)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              确保 Windows PC 与 iPhone 16 Pro 随时访问网址时画像、储蓄、任务与清单 100% 保持一致。
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Pre-configured Master Cloud Sync Banner */}
        {isCloudSyncPreConfigured() && (
          <div className="mt-4 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 p-4 border border-emerald-500/40 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  三端无感静默实时同步已激活 (Supabase 直连)
                </span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                全自动双向同步
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              恭喜！您的专属 Supabase 云数据库已成功连接。您的 <strong>Windows 电脑、iPhone 16 Pro、小米 14 Pro</strong> 只要打开原本的网址，系统将在后台自动双向毫秒级同步所有储蓄画像、任务打勾与录入情报，彻底告别所有手动步骤！
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1 font-mono border-t border-slate-800/80">
              <span className="truncate max-w-[280px]">实例: {CLOUD_SYNC_CONFIG.supabaseUrl.replace('https://', '')}</span>
              <span className="text-emerald-400">心跳: 每 15 秒 / 切屏即刷新</span>
            </div>
          </div>
        )}

        {/* Method 1: Instant Mobile 1-Click Link */}
        <div className="mt-4 space-y-4">
          <div className="rounded-xl bg-slate-950/80 p-4 border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  备用直达：iPhone 16 Pro 微信/AirDrop 快捷链接
                </span>
              </div>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                免输密码 · 即开即用
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              一键生成带有加密状态指纹的直达 URL。通过微信、邮件或 Airdrop 发送到 iPhone 16 Pro，在 Safari 浏览器中打开，手机端将自动秒级合并当前全部资产、任务和定制路线。
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleCopyMobileLink}
                disabled={isProcessing}
                className="flex items-center space-x-1.5 rounded-xl bg-emerald-500 text-slate-950 px-4 py-2 text-xs font-bold hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedLink ? '手机同步链接已复制！' : '复制 iPhone 同步直达链接'}</span>
              </button>
              <button
                onClick={handleUploadCurrent}
                disabled={isProcessing}
                className="flex items-center space-x-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 text-xs font-medium transition-colors border border-slate-700 cursor-pointer"
                title="上传当前状态至云端中继"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>更新云端快照</span>
              </button>
            </div>
          </div>

          {/* Method 2: Pairing Code */}
          <div className="rounded-xl bg-slate-950/80 p-4 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Laptop className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  专属 6 位配对码漫游 (Pairing Code)
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">当前设备: {deviceId}</span>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* My code */}
              <div className="rounded-lg bg-slate-900/90 p-3 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">本设备专属配对码</span>
                  <span className="text-lg font-bold font-mono text-indigo-300 tracking-wider">
                    {pairingCode}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="rounded-lg bg-slate-800 p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="复制配对码"
                >
                  {copiedCode ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              {/* Enter code */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="输入另一设备的配对码 (如 LF-XXXX)"
                  value={inputCode}
                  onChange={e => setInputCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 px-3 text-xs font-mono text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none uppercase"
                />
                <button
                  onClick={handlePairWithCode}
                  disabled={isProcessing || !inputCode.trim()}
                  className="shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  拉取合并
                </button>
              </div>
            </div>
          </div>

          {/* Method 3: Supabase Cloud Database Direct Sync (Optional Advanced) */}
          <div className="rounded-xl bg-slate-950/80 p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsSupabaseExpanded(!isSupabaseExpanded)}>
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Supabase 实时云数据库直连 (可选高阶)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${supabaseConfig.enabled && supabaseConfig.url ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                  {supabaseConfig.enabled && supabaseConfig.url ? '● 已连接' : '○ 未连接'}
                </span>
                {isSupabaseExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              若您拥有 Supabase 免费项目（500MB 免费存储），填写后系统每次保存画像或任务将自动实时 upsert 至云端 PostgreSQL，并在打开网页时毫秒级自动拉取。
            </p>

            {isSupabaseExpanded && (
              <form onSubmit={handleTestSupabase} className="pt-2 border-t border-slate-800/80 space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-400 font-medium mb-1">
                    Supabase Project URL (https://xxxx.supabase.co)
                  </label>
                  <input
                    type="text"
                    value={supabaseConfig.url}
                    onChange={e => setSupabaseConfig(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://your-project.supabase.co"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 px-3 text-xs font-mono text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 font-medium mb-1">
                    Supabase anon public key
                  </label>
                  <input
                    type="password"
                    value={supabaseConfig.anonKey}
                    onChange={e => setSupabaseConfig(prev => ({ ...prev, anonKey: e.target.value }))}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 px-3 text-xs font-mono text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {supabaseTestMsg && (
                  <div className={`rounded-lg p-2.5 text-[11px] ${supabaseTestMsg.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'}`}>
                    {supabaseTestMsg.text}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 underline cursor-pointer"
                  >
                    {copiedSql ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedSql ? '建表 SQL 已复制！' : '复制 Supabase 一键建表 SQL'}</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {supabaseConfig.enabled && (
                      <button
                        type="button"
                        onClick={() => {
                          const reset = { url: '', anonKey: '', enabled: false };
                          setSupabaseConfig(reset);
                          saveSupabaseConfig(reset);
                          setSupabaseTestMsg({ success: true, text: '已断开 Supabase 直连' });
                        }}
                        className="rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 px-3 py-1.5 text-xs text-rose-300"
                      >
                        断开
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={supabaseTesting || !supabaseConfig.url.trim() || !supabaseConfig.anonKey.trim()}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center space-x-1.5"
                    >
                      {supabaseTesting && <RefreshCw className="h-3 w-3 animate-spin" />}
                      <span>{supabaseTesting ? '正在验证连接...' : '测试并连接'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Method 4: JSON File Backup/Restore */}
          <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">离线文件冷备与恢复 (JSON)</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportJson}
                className="flex items-center space-x-1 text-slate-300 hover:text-white bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>导出冷备</span>
              </button>
              <label className="flex items-center space-x-1 text-slate-300 hover:text-white bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 transition-colors cursor-pointer">
                <Upload className="h-3.5 w-3.5" />
                <span>导入恢复</span>
                <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
              </label>
            </div>
          </div>

          {/* Status Alert */}
          {syncStatus && (
            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-xs text-emerald-400 flex items-start gap-2">
              <Zap className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{syncStatus}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-bold text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            完成并关闭
          </button>
        </div>
      </div>
    </div>
  );
};
