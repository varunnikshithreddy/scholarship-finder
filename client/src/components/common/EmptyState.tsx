import React from 'react';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Scholarships Found',
  description = 'Try adjusting your search criteria or resetting filters to find matching financial aid opportunities.',
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm max-w-xl mx-auto my-8">
      <div className="w-16 h-16 mx-auto bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
        {icon || <SearchX className="w-8 h-8" />}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-6 text-sm max-w-md mx-auto leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
