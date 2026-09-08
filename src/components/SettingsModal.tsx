import React, { useState } from 'react';
import { Settings2, Download, Upload, RotateCcw, X, Sliders, CheckCircle2, ShieldCheck, HeartHandshake, AlertTriangle } from 'lucide-react';
import { UserProfile, UserWeights, UserHardConstraints, UserPreferences } from '../types';
import { 
  validateImportBundle, 
  exportUserData, 
  resetAllUserData, 
  normalizeUserProfile,
  loadStoredTasks,
  loadStoredWatchlist,
  loadStoredCustomEvidence
} from '../utils/storageEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onResetDefaults: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  setProfile,
  onResetDefaults
}) => {
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);
  const [settingsTab, setSettingsTab] = useState<'hardConstraints' | 'preferences' | 'sync'>('hardConstraints');

  if (!isOpen) return null;

  const handleProfileFieldChange = <K extends keyof UserProfile>(key: K, val: UserProfile[K]) => {
    setProfile(prev => {
      const updated = {
        ...prev,
        [key]: val
      };
      // Keep hardConstraints sub-object synchronized (RULE-57)
      if (['birthYear', 'education', 'school', 'major', 'gpa', 'englishVocabEstimate', 'currentSavingsRmb', 'monthlyRentRmb', 'monthlyFoodAndLifeRmb', 'currentMonthlyIncomeRmb', 'currentRemoteHoursPerWeek', 'targetDateBaseline'].includes(key as string)) {
        updated.hardConstraints = {
          birthYear: updated.birthYear,
          education: updated.education,
          school: updated.school,
          major: updated.major,
          gpa: updated.gpa,
          englishVocabEstimate: updated.englishVocabEstimate,
          currentSavingsRmb: updated.currentSavingsRmb,
          monthlyRentRmb: updated.monthlyRentRmb,
          monthlyFoodAndLifeRmb: updated.monthlyFoodAndLifeRmb,
          currentMonthlyIncomeRmb: updated.currentMonthlyIncomeRmb,
          currentRemoteHoursPerWeek: updated.currentRemoteHoursPerWeek,
          targetDateBaseline: updated.targetDateBaseline
        };
      }
      return updated;
    });
  };

  const handleWeightChange = (key: keyof UserWeights, val: number) => {
    setProfile(prev => ({
      ...prev,
      weights: {
        ...prev.weights,
        [key]: val
      },
      preferences: {
        ...prev.preferences,
        weights: {
          ...prev.weights,
          [key]: val
        }
      }
    }));
  };

  const handlePreferenceChange = <K extends keyof UserPreferences>(key: K, val: UserPreferences[K]) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        weights: prev.weights,
        ...prev.preferences,
        [key]: val
      }
    }));
  };

  const handleExportProfile = () => {
    const tasks = loadStoredTasks();
    const watchlist = loadStoredWatchlist();
    const customEvidence = loadStoredCustomEvidence();
    const bundle = exportUserData(profile, tasks, watchlist, customEvidence);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `lifee_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setCopiedStatus('全量备份已安全下载！包含画像、任务与关注清单。');
    setTimeout(() => setCopiedStatus(null), 3000);
  };

  const handleImportProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const validation = validateImportBundle(content);
      if (!validation.valid || !validation.bundle) {
        alert(`导入失败：${validation.error || '文件格式不合规'}`);
        return;
      }

      const summary = validation.summary;
      const confirmed = window.confirm(
        `准备导入以下备份内容：\n- 画像名称：${summary?.profileName || '未命名'}\n- 可用储蓄：¥${(summary?.savingsRmb || 0).toLocaleString()}\n- 任务数量：${summary?.tasksCount || 0} 项\n- 自定义证据：${summary?.evidenceCount || 0} 条\n\n确认导入并更新当前设备画像？`
      );

      if (confirmed) {
        setProfile(validation.bundle.profile);
        setCopiedStatus('✓ 备份已成功导入并完成画像统一！');
        setTimeout(() => setCopiedStatus(null), 3500);
      }
    };
    reader.readAsText(file);
    // Reset input value so same file can be re-imported if needed
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Settings2 className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">个人决策系统设置 (Local Settings)</h2>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab switcher dividing Hard Constraints vs Preferences (RULE-57) */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2 text-xs">
          <button
            type="button"
            onClick={() => setSettingsTab('hardConstraints')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              settingsTab === 'hardConstraints' 
                ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>客观刚性约束 (Hard Constraints)</span>
          </button>
          <button
            type="button"
            onClick={() => setSettingsTab('preferences')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              settingsTab === 'preferences' 
                ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HeartHandshake className="h-3.5 w-3.5 text-sky-400" />
            <span>主观偏好与权重 (Preferences)</span>
          </button>
          <button
            type="button"
            onClick={() => setSettingsTab('sync')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              settingsTab === 'sync' 
                ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="h-3.5 w-3.5 text-indigo-400" />
            <span>备份与跨端迁移</span>
          </button>
        </div>

        {copiedStatus && (
          <div className="rounded-lg bg-emerald-950/40 border border-emerald-800/60 p-2.5 text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{copiedStatus}</span>
          </div>
        )}

        {/* 1. Hard Constraints Tab (RULE-57) */}
        {settingsTab === 'hardConstraints' && (
          <div className="space-y-3">
            <div className="text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <div className="flex items-center space-x-2 text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>刚性客观约束准则</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                刚性约束（年龄、学历、可用资金、语言、刚性支出）直接决定法律签证准入与可行性底线，无法用主观意志覆盖。若不满足（如资金缺口或年龄超限），系统会自动施加准入降权或排除。
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="block text-slate-400 mb-1">代号 / 昵称 (本地自用)</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => handleProfileFieldChange('name', e.target.value)}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">出生年份 (计算签证法定年龄)</label>
                <input
                  type="number"
                  value={profile.birthYear}
                  onChange={e => handleProfileFieldChange('birthYear', Number(e.target.value))}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">最高学历层次</label>
                <input
                  type="text"
                  value={profile.education}
                  onChange={e => handleProfileFieldChange('education', e.target.value)}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">专业方向</label>
                <input
                  type="text"
                  value={profile.major}
                  onChange={e => handleProfileFieldChange('major', e.target.value)}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">毕业院校 (选填/仅本地保全)</label>
                <input
                  type="text"
                  value={profile.school}
                  onChange={e => handleProfileFieldChange('school', e.target.value)}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">估算英语词汇量</label>
                <input
                  type="number"
                  value={profile.englishVocabEstimate}
                  onChange={e => handleProfileFieldChange('englishVocabEstimate', Number(e.target.value))}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">当前可用活期储蓄 (元 · 启动资金底盘)</label>
                <input
                  type="number"
                  value={profile.currentSavingsRmb}
                  onChange={e => handleProfileFieldChange('currentSavingsRmb', Number(e.target.value))}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-emerald-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">每月刚性房租 (元 · 纯现金流流出)</label>
                <input
                  type="number"
                  value={profile.monthlyRentRmb}
                  onChange={e => handleProfileFieldChange('monthlyRentRmb', Number(e.target.value))}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">每月基础生存开销 (元 · 饮食与基本开销)</label>
                <input
                  type="number"
                  value={profile.monthlyFoodAndLifeRmb}
                  onChange={e => handleProfileFieldChange('monthlyFoodAndLifeRmb', Number(e.target.value))}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">当前月均自给收入 (元 · 自由外包进账)</label>
                <input
                  type="number"
                  value={profile.currentMonthlyIncomeRmb}
                  onChange={e => handleProfileFieldChange('currentMonthlyIncomeRmb', Number(e.target.value))}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-emerald-400 font-mono font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">每周远程工作交付工时 (小时/周)</label>
                <input
                  type="number"
                  value={profile.currentRemoteHoursPerWeek}
                  onChange={e => handleProfileFieldChange('currentRemoteHoursPerWeek', Number(e.target.value))}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. Preferences & Weights Tab (RULE-57) */}
        {settingsTab === 'preferences' && (
          <div className="space-y-3">
            <div className="text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <div className="flex items-center space-x-2 text-sky-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                <span>主观偏好与权重调谐</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                主观偏好决定当多条路线在刚性约束上均可行时，系统如何进行个性化排序。可根据你对自由时间、现金流安全或海外永居的重视程度调整。
              </p>
            </div>

            {/* Weights Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>现金流安全与低启动资金权重</span>
                  <span className="font-mono text-emerald-400">{profile.weights.cashflowWeight}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={profile.weights.cashflowWeight}
                  onChange={e => handleWeightChange('cashflowWeight', Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>充足自由时间与非坐班自由</span>
                  <span className="font-mono text-emerald-400">{profile.weights.freeTimeWeight}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={profile.weights.freeTimeWeight}
                  onChange={e => handleWeightChange('freeTimeWeight', Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>高有效时薪与按成果付费</span>
                  <span className="font-mono text-emerald-400">{profile.weights.hourlyWageWeight}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={profile.weights.hourlyWageWeight}
                  onChange={e => handleWeightChange('hourlyWageWeight', Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>全球流动自由与开放网络</span>
                  <span className="font-mono text-emerald-400">{profile.weights.mobilityWeight}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={profile.weights.mobilityWeight}
                  onChange={e => handleWeightChange('mobilityWeight', Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>海外永久居留 (PR) 确定性诉求</span>
                  <span className="font-mono text-emerald-400">{profile.weights.prWeight}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={profile.weights.prWeight}
                  onChange={e => handleWeightChange('prWeight', Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>外语与技能学习耐受度</span>
                  <span className="font-mono text-emerald-400">{profile.weights.learningCostWeight}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={profile.weights.learningCostWeight}
                  onChange={e => handleWeightChange('learningCostWeight', Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>

            {/* Qualitative Preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="block text-slate-400 mb-1">远程办公偏好</label>
                <select
                  value={profile.preferences?.preferRemote ? 'REMOTE' : 'FLEXIBLE'}
                  onChange={e => handlePreferenceChange('preferRemote', e.target.value === 'REMOTE')}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white"
                >
                  <option value="REMOTE">极度偏好 (优先全远程/居家工作室)</option>
                  <option value="FLEXIBLE">弹性接受 (海外带薪实训或现场亦可)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">海外永居 (PR) 优先级</label>
                <select
                  value={profile.preferences?.prPriority || 'HIGH'}
                  onChange={e => handlePreferenceChange('prPriority', e.target.value as any)}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white"
                >
                  <option value="HIGH">高优先级 (要求 3~5 年内法律路径明确)</option>
                  <option value="MEDIUM">中等优先级 (可先体验或旅居积累)</option>
                  <option value="LOW">低优先级 (先确保收入自给与现金流)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">开放互联网诉求</label>
                <select
                  value={profile.preferences?.openInternetPriority || 'HIGH'}
                  onChange={e => handlePreferenceChange('openInternetPriority', e.target.value as any)}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white"
                >
                  <option value="HIGH">极高 (必须完全无阻访问全球 AI 与知识库)</option>
                  <option value="MEDIUM">普通 (日常协同有方案即可)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">风险承受度</label>
                <select
                  value={profile.preferences?.riskTolerance || 'LOW'}
                  onChange={e => handlePreferenceChange('riskTolerance', e.target.value as any)}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white"
                >
                  <option value="LOW">稳健防守型 (拒绝高额负债与重资产赌博)</option>
                  <option value="MEDIUM">平衡型 (可承受适度小试错成本)</option>
                  <option value="HIGH">进取型 (愿意为超额回报承担波动)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 3. Local-First Sync & Export */}
        {settingsTab === 'sync' && (
          <div className="pt-2 space-y-3 text-xs">
            <span className="font-semibold text-slate-300 block">
              跨设备迁移与数据主权 (Local-First Sync)
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              本项目坚持纯 Local-First 隐私理念，所有数据仅明文保存在当前浏览器 LocalStorage 中（Stored locally in plaintext，未采用密码学加密）。如需在手机与电脑间同步，使用下方 JSON 文件进行导入/导出即可。导出的 JSON 为明文备份，请妥善保管。
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleExportProfile}
                className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700 transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-emerald-400" />
                <span>导出个人配置备份 (Export JSON)</span>
              </button>

              <label className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700 transition-colors cursor-pointer">
                <Upload className="h-3.5 w-3.5 text-indigo-400" />
                <span>导入备份 (Import JSON)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportProfile}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (confirm('确认将个人权重与基础设定重置为官方默认样例基准？重置前将自动为您下载一份当前数据安全备份。')) {
                    handleExportProfile();
                    onResetDefaults();
                    setCopiedStatus('已恢复默认画像，原数据备份已自动下载至本地。');
                  }
                }}
                className="flex items-center space-x-1.5 rounded-lg border border-rose-900/50 bg-rose-950/20 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-900/30 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>安全重置为默认画像 (自动备份)</span>
              </button>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
          >
            完成并生效
          </button>
        </div>
      </div>
    </div>
  );
};
