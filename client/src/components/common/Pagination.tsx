import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMeta } from '@scholarship-finder/shared';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ meta, onPageChange }) => {
  if (meta.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-4 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(meta.page - 1)}
          disabled={!meta.hasPrevPage}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(meta.page + 1)}
          disabled={!meta.hasNextPage}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-600">
            Showing <span className="font-semibold text-slate-900">{(meta.page - 1) * meta.pageSize + 1}</span> to{' '}
            <span className="font-semibold text-slate-900">{Math.min(meta.page * meta.pageSize, meta.total)}</span> of{' '}
            <span className="font-semibold text-slate-900">{meta.total}</span> scholarships
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(meta.page - 1)}
              disabled={!meta.hasPrevPage}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`relative inline-flex items-center px-4 py-2 text-xs font-semibold ${
                  pageNum === meta.page
                    ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                    : 'text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => onPageChange(meta.page + 1)}
              disabled={!meta.hasNextPage}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
