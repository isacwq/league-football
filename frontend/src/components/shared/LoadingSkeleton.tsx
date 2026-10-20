import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'table' | 'text';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'card',
  count = 3,
}) => {
  const items = Array.from({ length: count });

  if (type === 'table') {
    return (
      <div className="w-full space-y-3 animate-pulse">
        <div className="h-10 bg-slate-800 rounded-lg w-full" />
        {items.map((_, i) => (
          <div key={i} className="h-12 bg-slate-800/50 rounded-lg w-full" />
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className="space-y-2 animate-pulse">
        {items.map((_, i) => (
          <div
            key={i}
            className="h-4 bg-slate-800 rounded"
            style={{ width: `${100 - i * 15}%` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {items.map((_, i) => (
        <div
          key={i}
          className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/50 space-y-4"
        >
          <div className="h-6 bg-slate-700 rounded w-2/3" />
          <div className="h-4 bg-slate-700/70 rounded w-1/2" />
          <div className="h-16 bg-slate-700/40 rounded-lg" />
        </div>
      ))}
    </div>
  );
};
