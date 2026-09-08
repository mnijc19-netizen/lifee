import React, { Component, ReactNode, ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { clearApplicationCacheOnly } from './utils/storageEngine';

// Automatic recovery on stale Vite bundle chunk fetch failure
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Vite preload error detected, reloading to fetch latest bundle...', event);
  window.location.reload();
});

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[RootErrorBoundary] Uncaught rendering exception:', error, errorInfo);
  }

  handleClearCacheAndReload = async () => {
    try {
      await clearApplicationCacheOnly();
    } catch (err) {
      console.warn('[RootErrorBoundary] Cache cleanup warning:', err);
    }
    // Strictly preserve all user data in localStorage, never call localStorage.clear()
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-white">页面渲染遇到异常</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              可能由于浏览器旧版本 Service Worker 缓存或网络波动所致。点击下方按钮即可一键清理应用缓存并重载最新版本（您的个人数据将完整保留）。
            </p>
            {this.state.error && (
              <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs text-red-300/80 font-mono text-left break-all max-h-32 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleClearCacheAndReload}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors cursor-pointer text-sm shadow-lg shadow-emerald-900/30"
            >
              清除本地缓存并强制刷新
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      reg.update().catch(() => {});
    }).catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>
);
