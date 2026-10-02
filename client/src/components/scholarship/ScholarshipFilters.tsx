import React from 'react';
import { ScholarshipFilterParams, ScholarshipCategory, EDUCATION_LEVELS, DISCIPLINES } from '@scholarship-finder/shared';
import { Filter, X, RotateCcw } from 'lucide-react';

interface ScholarshipFiltersProps {
  filters: ScholarshipFilterParams;
  categories: ScholarshipCategory[];
  onChange: (newFilters: Partial<ScholarshipFilterParams>) => void;
  onClear: () => void;
}

export const ScholarshipFilters: React.FC<ScholarshipFiltersProps> = ({
  filters,
  categories,
  onChange,
  onClear,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-sm text-slate-900">Filters</h3>
        </div>
        <button
          onClick={onClear}
          className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Application Status */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Application Window
        </label>
        <div className="space-y-1.5 text-xs font-medium text-slate-700">
          {[
            { value: '', label: 'All Statuses' },
            { value: 'open', label: 'Currently Open' },
            { value: 'closing_soon', label: 'Closing Soon (≤ 7 days)' },
            { value: 'closed', label: 'Past / Closed' },
          ].map((item) => (
            <label key={item.value} className="flex items-center gap-2 cursor-pointer hover:text-indigo-600">
              <input
                type="radio"
                name="application_status"
                value={item.value}
                checked={(filters.application_status || '') === item.value}
                onChange={() => onChange({ application_status: (item.value as any) || undefined, page: 1 })}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Category
        </label>
        <select
          value={filters.category || ''}
          onChange={(e) => onChange({ category: e.target.value || undefined, page: 1 })}
          className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Education Levels */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Education Level
        </label>
        <select
          value={filters.education_level || ''}
          onChange={(e) => onChange({ education_level: e.target.value || undefined, page: 1 })}
          className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
        >
          <option value="">All Levels</option>
          {EDUCATION_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      {/* Discipline */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Discipline / Stream
        </label>
        <select
          value={filters.discipline || ''}
          onChange={(e) => onChange({ discipline: e.target.value || undefined, page: 1 })}
          className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
        >
          <option value="">All Disciplines</option>
          {DISCIPLINES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Minimum Funding */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Minimum Funding (INR)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={filters.min_funding || ''}
            onChange={(e) => onChange({ min_funding: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};
