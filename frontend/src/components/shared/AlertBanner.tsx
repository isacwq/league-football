import React from 'react';

interface AlertBannerProps {
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  onRetry?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  message,
  type = 'error',
  onRetry,
}) => {
  const styles = {
    error: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    info: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  };

  return (
    <div
      className={`p-4 rounded-xl border flex items-center justify-between space-x-3 my-4 ${styles[type]}`}
      role="alert"
    >
      <div className="flex items-center space-x-3">
        <span className="text-lg">
          {type === 'error' && '⚠️'}
          {type === 'warning' && '⚡'}
          {type === 'info' && 'ℹ️'}
          {type === 'success' && '✅'}
        </span>
        <p className="text-sm font-medium">{message}</p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-600 transition-colors"
        >
          Tentar Novamente
        </button>
      )}
    </div>
  );
};
