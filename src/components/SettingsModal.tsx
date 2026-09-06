import React, { useState } from 'react';
import { Settings2, Download, Upload, RotateCcw, X, Sliders, CheckCircle2, User } from 'lucide-react';
import { UserProfile, UserWeights } from '../types';

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
  const [settingsTab, setSettingsTab] = useState<'profile' | 'weights' | 'sync'>('profile');

  if (!isOpen) return null;

  const handleProfileFieldChange = <K extends keyof UserProfile>(key: K, val: UserProfile[K]) => {
    setProfile(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const handleWeightChange = (key: keyof UserWeights, val: number) => {
    setProfile(prev => ({
      ...prev,
      weights: {
        ...prev.weights,
        [key]: val
      }
    }));
  };

  const handleExportProfile = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `lifee_profile_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setCopiedStatus('配置备份已下载！可在手机或新电脑随时导入。');
    setTimeout(() => setCopiedStatus(null), 3000);
  };

  const handleImportProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported && imported.weights) {
          setProfile(imported);
          setCopiedStatus('配置成功从备份文件还原！');
          setTimeout(() => setCopiedStatus(null), 3000);
        }
      } catch (err) {
        alert('导入失败：文件格式不合规。');
      }
    };
    reader.readAsText(file);
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

        {/* Tab switcher */}
        <div className="flex space-x-2 border-b border-slate-800 pb-2 text-xs">
          <button
            onClick={() => setSettingsTab('profile')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              settingsTab === 'profile' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>个人画像与财务 (Local-First)</span>
          </button>
          <button
            onClick={() => setSettingsTab('weights')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              settingsTab === 'weights' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>决策打分权重</span>
          </button>
          <button
            onClick={() => setSettingsTab('sync')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              settingsTab === 'sync' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>备份与跨端迁移</span>
          </button>
        </div>

        {copiedStatus && (
          <div className="rounded-lg bg-emerald-950/40 border border-emerald-800/60 p-2.5 text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{copiedStatus}</span>
          </div>
        )}

        {/* Profile Tab */}
        {settingsTab === 'profile' && (
          <div className="space-y-3">
            <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>本页信息 100% 存储于当前浏览器本地，代码与网络绝不上报，保障你的真实隐私。</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="block text-slate-400 mb-1">代号 / 昵称</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => handleProfileFieldChange('name', e.target.value)}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">出生年份</label>
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
                <label className="block text-slate-400 mb-1">毕业院校 (选填/本地保留)</label>
                <input
                  type="text"
                  value={profile.school}
                  onChange={e => handleProfileFieldChange('school', e.target.value)}
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
                <label className="block text-slate-400 mb-1">平均 GPA (或百分制分数)</label>
                <input
                  type="number"
                  value={profile.gpa}
                  onChange={e => handleProfileFieldChange('gpa', Number(e.target.value))}
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
                <label className="block text-slate-400 mb-1">当前可用活期储蓄 (元)</label>
                <input
                  type="number"
                  value={profile.currentSavingsRmb}
                  onChange={e => handleProfileFieldChange('currentSavingsRmb', Number(e.target.value))}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-emerald-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">每月刚性房租 (元)</label>
                <input
                  type="number"
                  value={profile.monthlyRentRmb}
                  onChange={e => handleProfileFieldChange('monthlyRentRmb', Number(e.target.value))}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">每月基础生存开销 (元)</label>
                <input
                  type="number"
                  value={profile.monthlyFoodAndLifeRmb}
                  onChange={e => handleProfileFieldChange('monthlyFoodAndLifeRmb', Number(e.target.value))}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">当前月均自给收入 (元)</label>
                <input
                  type="number"
                  value={profile.currentMonthlyIncomeRmb}
                  onChange={e => handleProfileFieldChange('currentMonthlyIncomeRmb', Number(e.target.value))}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-emerald-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">每周远程工作交付工时</label>
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

        {/* Weights Sliders Section */}
        {settingsTab === 'weights' && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
              <Sliders className="h-4 w-4 text-emerald-400" />
              <span>多维打分偏好权重 (0 ~ 10 分)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>现金流保护与低启动资金</span>
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
                  <span>充足自由时间与非坐班</span>
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
                  <span>全球流动自由度与网络无阻</span>
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
                  <span>海外永久居留 (PR) 确定性</span>
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
                  <span>语言与技能学习成本容忍度</span>
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
          </div>
        )}

        {/* Local-First Sync & Export */}
        {settingsTab === 'sync' && (
          <div className="pt-2 space-y-3 text-xs">
            <span className="font-semibold text-slate-300 block">
              跨设备迁移与数据主权 (Local-First Sync)
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              本项目坚持纯 Local-First 隐私理念，所有修改与便签仅保存于当前浏览器。如需在手机与电脑间无缝同步，使用下方 JSON 导入/导出即可。
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
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
                onClick={() => {
                  if (confirm('确认将个人权重与基础设定重置为官方默认样例基准？')) {
                    onResetDefaults();
                  }
                }}
                className="flex items-center space-x-1.5 rounded-lg border border-rose-900/50 bg-rose-950/20 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-900/30 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>恢复系统默认样例画像</span>
              </button>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500"
          >
            完成并生效
          </button>
        </div>
      </div>
    </div>
  );
};
