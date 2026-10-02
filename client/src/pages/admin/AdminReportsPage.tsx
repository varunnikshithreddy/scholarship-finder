import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, Clock, XCircle, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminReportsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: reports, isLoading, isError } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => api.getAdminReports(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'in_review' | 'resolved' | 'dismissed' }) =>
      api.updateAdminReport(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
  });

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
          Community Accuracy Reports
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl mt-1">
          Review inaccuracies reported by students regarding deadline changes, broken links, or criteria updates.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700">
          <p className="font-bold">Failed to load reports.</p>
        </div>
      ) : reports && reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                    {report.report_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-400">
                    Submitted on {new Date(report.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize">
                    Status: {report.status}
                  </span>
                </div>

                <p className="text-sm font-bold text-slate-900">
                  Target: {report.scholarship?.title || report.scholarship_id}
                </p>

                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                  "{report.description}"
                </p>
              </div>

              {/* Status Update Actions */}
              <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                {report.status !== 'in_review' && (
                  <button
                    type="button"
                    onClick={() => updateStatusMutation.mutate({ id: report.id, status: 'in_review' })}
                    disabled={updateStatusMutation.isPending}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    Mark In Review
                  </button>
                )}

                {report.status !== 'resolved' && (
                  <button
                    type="button"
                    onClick={() => updateStatusMutation.mutate({ id: report.id, status: 'resolved' })}
                    disabled={updateStatusMutation.isPending}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Resolve
                  </button>
                )}

                {report.status !== 'dismissed' && (
                  <button
                    type="button"
                    onClick={() => updateStatusMutation.mutate({ id: report.id, status: 'dismissed' })}
                    disabled={updateStatusMutation.isPending}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Accuracy Flags</h3>
          <p className="text-xs text-slate-500 mt-1">
            All scholarship entries are currently verified without pending student reports.
          </p>
        </div>
      )}
    </div>
  );
};
