import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, Compass, Briefcase, Globe2, Milestone, Radio, FileCheck2, ShieldCheck } from 'lucide-react';
import { globalSearch, SearchResultItem } from '../engine/search';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, targetId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);

  useEffect(() => {
    if (query.trim()) {
      setResults(globalSearch(query));
    } else {
      setResults(globalSearch('德国'));
    }
  }, [query]);

  // Keyboard shortcut listener for ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const getTypeIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'occupation': return <Briefcase className="h-3.5 w-3.5 text-blue-400" />;
      case 'country': return <Globe2 className="h-3.5 w-3.5 text-emerald-400" />;
      case 'pathway': return <Milestone className="h-3.5 w-3.5 text-indigo-400" />;
      case 'intelligence': return <Radio className="h-3.5 w-3.5 text-amber-400" />;
      case 'evidence': return <FileCheck2 className="h-3.5 w-3.5 text-purple-400" />;
      case 'skill': return <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />;
      default: return <Compass className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-4 pt-16 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800">
          <Search className="h-4 w-4 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="输入搜索词 (如: 电工, 德国, 叉车, 签证, 现金流, Ausbildung)..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-white ml-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/50">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              未找到匹配条目。请尝试其他关键词。
            </div>
          ) : (
            results.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  onNavigate(item.linkTab, item.targetId);
                  onClose();
                }}
                className="group flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/80 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-950 border border-slate-800">
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {item.title}
                      </span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400 border border-slate-700">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
          <span>点击跳转至对应模块</span>
          <span>ESC 键退出</span>
        </div>
      </div>
    </div>
  );
};
