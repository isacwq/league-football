import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 my-6 space-y-3">
      <div className="p-3 bg-slate-800/60 rounded-full text-slate-400 text-2xl">
        ⚽
      </div>
      <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm">{description}</p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
