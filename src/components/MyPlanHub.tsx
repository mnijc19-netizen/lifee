import React, { useState } from 'react';
import { 
  CalendarCheck, 
  CheckCircle2, 
  Circle, 
  Clock, 
  HelpCircle, 
  Plus, 
  Ban, 
  Flame, 
  Sparkles, 
  FlaskConical,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { UserPlanTask, MiniExperiment } from '../types';
import { MINI_EXPERIMENTS } from '../data/experiments';

interface MyPlanHubProps {
  tasks: UserPlanTask[];
  onUpdateStatus: (taskId: string, status: UserPlanTask['status']) => void;
  onAddTask: (task: Omit<UserPlanTask, 'id'>) => void;
  onNavigateTab: (tab: string) => void;
}

export const MyPlanHub: React.FC<MyPlanHubProps> = ({
  tasks,
  onUpdateStatus,
  onAddTask,
  onNavigateTab
}) => {
  const [activePeriod, setActivePeriod] = useState<'today' | 'week' | '30d' | '90d'>('today');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskWhyNow, setNewTaskWhyNow] = useState('');

  const filteredTasks = tasks.filter(t => t.period === activePeriod);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskWhyNow.trim()) return;

    onAddTask({
      title: newTaskTitle.trim(),
      whyNow: newTaskWhyNow.trim(),
      period: activePeriod,
      status: 'todo'
    });

    setNewTaskTitle('');
    setNewTaskWhyNow('');
    setIsAddingTask(false);
  };

  const getStatusBadge = (status: UserPlanTask['status']) => {
    switch (status) {
      case 'completed':
        return <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 border border-emerald-500/20 flex items-center space-x-1"><CheckCircle2 className="h-3 w-3" /><span>已完成</span></span>;
      case 'in_progress':
        return <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] text-indigo-400 border border-indigo-500/20 flex items-center space-x-1"><Clock className="h-3 w-3" /><span>进行中</span></span>;
      case 'abandoned':
        return <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-400 border border-rose-500/20 flex items-center space-x-1"><Ban className="h-3 w-3" /><span>已放弃</span></span>;
      default:
        return <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 border border-slate-700 flex items-center space-x-1"><Circle className="h-3 w-3" /><span>未开始</span></span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
              <span>拒绝死板待办 · 拒绝分析瘫痪</span>
              <span className="text-slate-500">·</span>
              <span>每一个行动必须绑定“为什么我现在应该做这个”</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              我的计划与行动枢纽 (My Plan)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              克服“不断寻找更优解迟迟不行动”的根本解法：只关注当下 90天/30天/本周/今天。做低后悔投资，跑 7/14/30 天真实验证小实验。
            </p>
          </div>

          <button
            onClick={() => setIsAddingTask(true)}
            className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-emerald-500 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>添加行动任务</span>
          </button>
        </div>

        {/* Period Selector Tabs */}
        <div className="mt-5 flex space-x-2 border-t border-slate-800/80 pt-4">
          {[
            { id: 'today', label: '今天 (Today)' },
            { id: 'week', label: '本周 (This Week)' },
            { id: '30d', label: '30 天冲刺 (30 Days)' },
            { id: '90d', label: '90 天目标 (90 Days)' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setActivePeriod(p.id as any)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                activePeriod === p.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Task Modal / Form */}
      {isAddingTask && (
        <form onSubmit={handleCreateTask} className="rounded-xl border border-emerald-500/40 bg-slate-900/90 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">添加新行动到 [{activePeriod.toUpperCase()}]</span>
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              取消
            </button>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">行动内容 (具体明确，如：完成45分钟英语听力)</label>
            <input
              type="text"
              required
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="行动名称..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">为什么我现在应该做这个？(核心因果逻辑)</label>
            <input
              type="text"
              required
              value={newTaskWhyNow}
              onChange={e => setNewTaskWhyNow(e.target.value)}
              placeholder="例：目前Top 5路线中有4条需要英语，属于低后悔投资..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
            >
              保存行动
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center text-xs text-slate-500">
            当前时段暂无任务。点击右上角“添加行动任务”，开始今天的微小复利。
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 hover:border-slate-700 hover:bg-slate-900/70 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex items-center space-x-2">
                  {getStatusBadge(task.status)}
                  <h4 className={`text-sm font-bold ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}`}>
                    {task.title}
                  </h4>
                </div>

                <div className="rounded bg-slate-950/70 p-2 border border-slate-800/80 text-xs text-slate-300 flex items-start space-x-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-400">为什么现在做？</span>
                    <span className="ml-1 text-slate-300">{task.whyNow}</span>
                  </div>
                </div>
              </div>

              {/* Status Switcher Buttons */}
              <div className="flex items-center space-x-1 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                <button
                  onClick={() => onUpdateStatus(task.id, 'todo')}
                  className={`px-2 py-1 rounded text-[11px] border transition-colors ${
                    task.status === 'todo' ? 'bg-slate-800 text-white border-slate-700 font-bold' : 'text-slate-500 border-transparent hover:text-slate-300'
                  }`}
                >
                  未开始
                </button>
                <button
                  onClick={() => onUpdateStatus(task.id, 'in_progress')}
                  className={`px-2 py-1 rounded text-[11px] border transition-colors ${
                    task.status === 'in_progress' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-bold' : 'text-slate-500 border-transparent hover:text-slate-300'
                  }`}
                >
                  进行中
                </button>
                <button
                  onClick={() => onUpdateStatus(task.id, 'completed')}
                  className={`px-2 py-1 rounded text-[11px] border transition-colors ${
                    task.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold' : 'text-slate-500 border-transparent hover:text-slate-300'
                  }`}
                >
                  已完成
                </button>
                <button
                  onClick={() => onUpdateStatus(task.id, 'abandoned')}
                  className={`px-2 py-1 rounded text-[11px] border transition-colors ${
                    task.status === 'abandoned' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold' : 'text-slate-500 border-transparent hover:text-slate-300'
                  }`}
                >
                  已放弃
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mini-Experiments Section (Anti-Analysis-Paralysis) */}
      <div className="pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <FlaskConical className="h-4 w-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white">敏捷试错小实验 (7天 / 14天 / 30天真实验证)</h2>
          </div>
          <span className="text-xs text-slate-500">不确定就不要先学一年，先跑真实测试</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MINI_EXPERIMENTS.map(exp => (
            <div
              key={exp.id}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/20">
                    {exp.durationDays} 天周期
                  </span>
                  <span className="text-xs font-mono text-slate-500">测试闭环</span>
                </div>

                <h3 className="text-sm font-bold text-white mt-2">
                  {exp.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {exp.goal}
                </p>

                <div className="mt-3 rounded bg-slate-950 p-2.5 border border-slate-800/80 text-xs space-y-1">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">行动抓手：</span>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {exp.actionSteps.map((step, i) => (
                      <li key={i} className="flex items-start space-x-1">
                        <span className="text-emerald-400 font-mono">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 text-xs space-y-1">
                <div className="text-emerald-400 text-[11px]">
                  <strong>成功指标：</strong>{exp.successMetric}
                </div>
                <div className="text-rose-400 text-[11px]">
                  <strong>放弃止损：</strong>{exp.killCriteria}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
