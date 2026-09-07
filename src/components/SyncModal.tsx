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
  Share2
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
  const [syncStatus, setSyncStatus] = useState<string>('就绪');
  const [isProcessing, setIsProcessing] = useState(false);
  const deviceId = getOrCreateDeviceId();

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
      setSyncStatus('手机同步直达链接已复制到剪贴板！在 iPhone 16 Pro 浏览器粘贴打开即可瞬间同步全部数据。');
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
        setSyncStatus('未找到此配对码对应的云端同步记录，请先在发送端点击“上传同步”。');
      }
    } catch {
      setSyncStatus('配对同步出错，请检查网络或配对码。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadCurrent = async () => {
    setIsProcessing(true);
    setSyncStatus('正在加密同步当前设备状态到云端通道...');
    try {
      const ok = await uploadToCloudRelay(pairingCode, currentPayload);
      if (ok) {
        setSyncStatus(`✓ 当前数据已成功同步！配对码：${pairingCode}，在另一台设备输入即可直接拉取。`);
      } else {
        setSyncStatus('同步失败，请重试。');
      }
    } catch {
      setSyncStatus('网络异常，未能上传到云端通道。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `lifee_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setSyncStatus('✓ 完整数据备份文件已导出至本地！');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as LifeeSyncPayload;
        if (parsed.profile) {
          setProfile(parsed.profile);
          if (parsed.tasks) setTasks(parsed.tasks);
          if (parsed.watchlist) setWatchlist(parsed.watchlist);
          if (parsed.customEvidence) setCustomEvidence(parsed.customEvidence);
          setSyncStatus('✓ 备份文件导入成功，所有画像与任务已更新！');
        }
      } catch {
        setSyncStatus('JSON 备份解析失败，格式不正确。');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl glass-panel rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>多设备安全无感同步</span>
              <span className="text-slate-500">·</span>
              <span>端到端本地优先</span>
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
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Method 1: Instant Mobile 1-Click Link */}
        <div className="mt-5 space-y-4">
          <div className="rounded-xl bg-slate-950/80 p-4 border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  推荐方式：iPhone 16 Pro 一键直达同步
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
                  className="rounded-lg bg-slate-800 p-2 text-slate-300 hover:text-white transition-colors"
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

          {/* Method 3: JSON File Backup/Restore */}
          <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">离线文件冷备与恢复 (JSON)</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportJson}
                className="flex items-center space-x-1 text-slate-300 hover:text-white bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 transition-colors"
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
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-bold text-white hover:bg-slate-700 transition-colors"
          >
            完成并关闭
          </button>
        </div>
      </div>
    </div>
  );
};
