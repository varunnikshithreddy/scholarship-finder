import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import type { Scholarship } from '@scholarship-finder/shared';

export const DeadlineTrackerPage: React.FC = () => {
  const [filterMode, setFilterMode] = useState<'saved' | 'all'>('saved');

  // Fetch saved scholarships
  const { data: savedList, isLoading: isLoadingSaved } = useQuery({
    queryKey: ['saved-scholarships'],
    queryFn: () => api.getSavedScholarships(),
  });

  // Fetch all published scholarships
  const { data: allScholarshipsData, isLoading: isLoadingAll } = useQuery({
    queryKey: ['all-published-scholarships-deadlines'],
    queryFn: () => api.getScholarships({ page: 1, limit: 100 } as any),
  });

  const rawList: Scholarship[] = useMemo(() => {
    if (filterMode === 'saved') {
      return (savedList || [])
        .map((s) => s.scholarship)
        .filter((s): s is Scholarship => !!s);
    }
    return allScholarshipsData?.scholarships || [];
  }, [filterMode, savedList, allScholarshipsData]);

  // Categorize by deadline proximity
  const categorized = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const groups = {
      closingToday: [] as { scholarship: Scholarship; daysDiff: number }[],
      closing7Days: [] as { scholarship: Scholarship; daysDiff: number }[],
      closing30Days: [] as { scholarship: Scholarship; daysDiff: number }[],
      closingLater: [] as { scholarship: Scholarship; daysDiff: number }[],
      upcoming: [] as { scholarship: Scholarship; daysDiff: number }[],
      expired: [] as { scholarship: Scholarship; daysDiff: number }[],
      unspecified: [] as { scholarship: Scholarship; daysDiff: number }[],
    };

    rawList.forEach((s) => {
      if (!s.application_deadline) {
        groups.unspecified.push({ scholarship: s, daysDiff: 9999 });
        return;
      }

      const deadline = new Date(s.application_deadline);
      deadline.setHours(0, 0, 0, 0);
      const diffTime = deadline.getTime() - today.getTime();
      const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Check upcoming start date
      if (s.application_start_date) {
        const start = new Date(s.application_start_date);
        start.setHours(0, 0, 0, 0);
        if (start.getTime() > today.getTime()) {
          groups.upcoming.push({ scholarship: s, daysDiff });
          return;
        }
      }

      if (daysDiff < 0) {
        groups.expired.push({ scholarship: s, daysDiff });
      } else if (daysDiff === 0) {
        groups.closingToday.push({ scholarship: s, daysDiff });
      } else if (daysDiff <= 7) {
        groups.closing7Days.push({ scholarship: s, daysDiff });
      } else if (daysDiff <= 30) {
        groups.closing30Days.push({ scholarship: s, daysDiff });
      } else {
        groups.closingLater.push({ scholarship: s, daysDiff });
      }
    });

    return groups;
  }, [rawList]);

  const isLoading = isLoadingSaved || (filterMode === 'all' && isLoadingAll);

  const renderSection = (
    title: string,
    items: { scholarship: Scholarship; daysDiff: number }[],
    colorClass: { bg: string; border: string; text: string; badge: string; icon: React.ReactNode }
  ) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${colorClass.bg} ${colorClass.border} border`}>
          {colorClass.icon}
          <h2 className={`text-sm font-bold ${colorClass.text}`}>{title}</h2>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-white font-semibold text-slate-700 shadow-xs">
            {items.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(({ scholarship: s, daysDiff }) => (
            <div
              key={s.id}
              className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-slate-500 font-medium">{s.provider?.name}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${colorClass.badge}`}>
                    {daysDiff < 0
                      ? 'Expired'
                      : daysDiff === 0
                      ? 'Closing Today!'
                      : `${daysDiff} days left`}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1 hover:text-indigo-600">
                  <Link to={`/scholarships/${s.id}`}>{s.title}</Link>
                </h3>

                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Final Deadline: <strong>{s.application_deadline}</strong>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/scholarships/${s.id}`}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  View Requirements
                </Link>

                {s.official_application_url && (
                  <a
                    href={s.official_application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1"
                  >
                    Official Portal <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Clock className="w-8 h-8 text-indigo-600" />
            Scholarship Deadline Tracker
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl mt-1">
            Stay ahead of strict application submission windows. Deadlines are calculated against local timezone constraints.
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setFilterMode('saved')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterMode === 'saved' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Saved Scholarships ({savedList?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterMode === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Published ({allScholarshipsData?.scholarships?.length || 0})
          </button>
        </div>
      </div>

      {/* Main Sections */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-8">
          {renderSection('Urgent: Closing Today', categorized.closingToday, {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-900',
            badge: 'bg-red-100 text-red-800',
            icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
          })}

          {renderSection('Closing Within 7 Days', categorized.closing7Days, {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            text: 'text-amber-900',
            badge: 'bg-amber-100 text-amber-800',
            icon: <Clock className="w-4 h-4 text-amber-600" />,
          })}

          {renderSection('Closing Within 30 Days', categorized.closing30Days, {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-900',
            badge: 'bg-blue-100 text-blue-800',
            icon: <Calendar className="w-4 h-4 text-blue-600" />,
          })}

          {renderSection('Closing Later', categorized.closingLater, {
            bg: 'bg-slate-50',
            border: 'border-slate-200',
            text: 'text-slate-800',
            badge: 'bg-slate-100 text-slate-700',
            icon: <CheckCircle className="w-4 h-4 text-slate-500" />,
          })}

          {renderSection('Upcoming Application Windows', categorized.upcoming, {
            bg: 'bg-purple-50',
            border: 'border-purple-200',
            text: 'text-purple-900',
            badge: 'bg-purple-100 text-purple-800',
            icon: <Calendar className="w-4 h-4 text-purple-600" />,
          })}

          {renderSection('Past Deadlines / Expired', categorized.expired, {
            bg: 'bg-slate-50',
            border: 'border-slate-200',
            text: 'text-slate-500',
            badge: 'bg-slate-200 text-slate-600',
            icon: <Clock className="w-4 h-4 text-slate-400" />,
          })}

          {rawList.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-md mx-auto">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Tracked Deadlines</h3>
              <p className="text-xs text-slate-500 mt-1">
                {filterMode === 'saved'
                  ? 'You have not bookmarked any scholarships yet. Explore our directory and save scholarships to track deadlines.'
                  : 'No published scholarships found.'}
              </p>
              {filterMode === 'saved' && (
                <Link to="/scholarships" className="btn-primary text-xs px-4 py-2 rounded-xl mt-4 inline-block">
                  Discover Scholarships
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
