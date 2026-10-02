import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { ScholarshipFilters } from '../../components/scholarship/ScholarshipFilters';
import { ScholarshipCard } from '../../components/scholarship/ScholarshipCard';
import { SkeletonGrid } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { ScholarshipFilterParams } from '@scholarship-finder/shared';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export const ScholarshipDirectoryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Extract filter parameters from URL
  const filters: ScholarshipFilterParams = {
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    education_level: searchParams.get('education_level') || undefined,
    discipline: searchParams.get('discipline') || undefined,
    application_status: (searchParams.get('application_status') as any) || undefined,
    min_funding: searchParams.get('min_funding') ? Number(searchParams.get('min_funding')) : undefined,
    sort_by: (searchParams.get('sort_by') as any) || 'latest',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    pageSize: 12,
  };

  const updateFilters = (newFilters: Partial<ScholarshipFilterParams>) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val === undefined || val === null || val === '') {
        updated.delete(key);
      } else {
        updated.set(key, String(val));
      }
    });
    setSearchParams(updated);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Queries
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['scholarships', filters],
    queryFn: () => api.getScholarships(filters),
  });

  const scholarships = data?.scholarships || [];
  const meta = data?.meta || { page: 1, pageSize: 12, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false };

  // Calculate active filter count
  const activeFilterEntries = Object.entries(filters).filter(([k, v]) => k !== 'page' && k !== 'pageSize' && k !== 'sort_by' && v !== undefined && v !== '');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumbs items={[{ label: 'Scholarships Directory' }]} />

      {/* Directory Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Scholarship Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse {meta.total} verified scholarship opportunities across India
          </p>
        </div>

        {/* Global Search input */}
        <div className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => updateFilters({ search: e.target.value || undefined, page: 1 })}
              placeholder="Filter by name, provider, keyword..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-200 bg-white text-slate-700 flex items-center justify-center shrink-0"
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterEntries.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Active Filters:</span>
          {activeFilterEntries.map(([key, val]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
            >
              <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
              <span className="font-bold">{String(val)}</span>
              <button
                onClick={() => updateFilters({ [key]: undefined, page: 1 })}
                className="hover:text-indigo-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={clearAllFilters}
            className="text-xs text-slate-500 hover:text-indigo-600 font-semibold underline underline-offset-2 ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Filter Sidebar Desktop */}
        <div className="hidden md:block md:col-span-1 sticky top-24">
          <ScholarshipFilters
            filters={filters}
            categories={categoriesData || []}
            onChange={updateFilters}
            onClear={clearAllFilters}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFiltersOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm p-4 flex justify-end">
            <div className="w-full max-w-xs bg-white rounded-2xl p-6 h-full overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-900">Filters</h3>
                <button onClick={() => setMobileFiltersOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <ScholarshipFilters
                filters={filters}
                categories={categoriesData || []}
                onChange={(f) => { updateFilters(f); setMobileFiltersOpen(false); }}
                onClear={() => { clearAllFilters(); setMobileFiltersOpen(false); }}
              />
            </div>
          </div>
        )}

        {/* Results Column */}
        <div className="md:col-span-3 space-y-6">
          {/* Sort bar */}
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200/80 text-xs">
            <span className="text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">{scholarships.length}</span> scholarships
            </span>

            <div className="flex items-center gap-2">
              <label htmlFor="sort_by" className="text-slate-500 font-semibold">Sort by:</label>
              <select
                id="sort_by"
                value={filters.sort_by || 'latest'}
                onChange={(e) => updateFilters({ sort_by: e.target.value as any, page: 1 })}
                className="font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="latest">Recently Announced</option>
                <option value="deadline">Approaching Deadline</option>
                <option value="funding_high">Funding: High to Low</option>
                <option value="funding_low">Funding: Low to High</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {isLoading ? (
            <SkeletonGrid count={6} />
          ) : scholarships.length === 0 ? (
            <EmptyState
              title="No Scholarships Match Your Filters"
              description="Try adjusting your education level, category, or keyword search parameters."
              actionText="Reset All Filters"
              onAction={clearAllFilters}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {scholarships.map((s) => (
                <ScholarshipCard key={s.id} scholarship={s} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            meta={meta}
            onPageChange={(p) => updateFilters({ page: p })}
          />
        </div>
      </div>
    </div>
  );
};
