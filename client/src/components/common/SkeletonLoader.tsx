import React from 'react';

export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm animate-pulse space-y-4">
    <div className="flex justify-between items-start">
      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
      <div className="h-6 bg-slate-200 rounded-full w-20"></div>
    </div>
    <div className="space-y-2">
      <div className="h-6 bg-slate-200 rounded w-3/4"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
    </div>
    <div className="h-12 bg-slate-100 rounded"></div>
    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
      <div className="h-5 bg-slate-200 rounded w-24"></div>
      <div className="h-9 bg-slate-200 rounded-lg w-28"></div>
    </div>
  </div>
);

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);
