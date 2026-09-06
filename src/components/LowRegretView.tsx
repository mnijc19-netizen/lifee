import React from 'react';
import { ShieldCheck, ArrowRight, Zap, Coins, CheckCircle, Clock } from 'lucide-react';
import { LOW_REGRET_SKILLS } from '../data/lowRegretSkills';

interface LowRegretViewProps {
  onNavigateTab: (tab: string) => void;
}

export const LowRegretView: React.FC<LowRegretViewProps> = ({ onNavigateTab }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
          <span>反犹豫反内耗算法 · 破局分析瘫痪</span>
          <span className="text-slate-500">·</span>
          <span>只做“无论五年后去哪国、选什么路线都 100% 不贬值”的资产积累</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
          低后悔投资 (Low-Regret Skills)
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          你最担心的是“选错方向白白浪费几年，因此迟迟不敢开始”。低后悔投资模型精选跨国通用、跨工种复用的底层杠杆。哪怕未来政策巨变，所学技能依然能直接支撑现金流。
        </p>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LOW_REGRET_SKILLS.map(skill => (
          <div
            key={skill.id}
            className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4 hover:border-slate-700 hover:bg-slate-900/80 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                  {skill.category}
                </span>
                <span className="text-xs font-mono text-slate-500 flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>预计熟练度周期: {skill.estimatedHoursToProficiency} 小时</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-white mt-2">
                {skill.name}
              </h3>

              <p className="mt-2 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                <strong>为什么属于低后悔投资？</strong><br />
                {skill.whyLowRegret}
              </p>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-start space-x-2 text-indigo-300 bg-indigo-950/20 p-2 rounded border border-indigo-900/30">
                  <Zap className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-indigo-300">全路线跨界复用价值：</span>
                    <span className="text-slate-300 ml-1">{skill.crossRouteValue}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2 text-amber-300 bg-amber-950/20 p-2 rounded border border-amber-900/30">
                  <Coins className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-300">当下立竿见影变现力：</span>
                    <span className="text-slate-300 ml-1">{skill.immediateMonetization}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs">
              <span className="text-slate-500 block mb-1">今日推荐执行：</span>
              <p className="text-emerald-300 font-medium">{skill.recommendedAction}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
