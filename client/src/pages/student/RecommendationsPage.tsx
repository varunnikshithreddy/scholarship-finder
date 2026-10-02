import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, RefreshCw, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import type { RecommendationItem } from '@scholarship-finder/shared';

export const RecommendationsPage: React.FC = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: recommendations, isLoading, isError, error } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => api.getRecommendations(),
  });

  const refreshMutation = useMutation({
    mutationFn: () => api.refreshRecommendations(),
    onSuccess: (data) => {
      queryClient.setQueryData(['recommendations'], data);
    },
  });

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Profile-Driven Recommendation Engine
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Personalized Recommendations</h1>
          <p className="text-slate-600 text-sm max-w-2xl mt-1">
            Verified opportunities matched to your academic level ({profile?.education_level || 'Not set'}), state ({profile?.state || 'All India'}), and financial eligibility thresholds.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
          className="btn-secondary self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-sm text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
          <span>{refreshMutation.isPending ? 'Recalculating...' : 'Refresh Matches'}</span>
        </button>
      </div>

      {/* Profile Incomplete Prompt */}
      {!profile?.profile_completed && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900">Your student profile is incomplete</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Complete your academic score, annual family income, and field of study to unlock 100% accurate scholarship recommendations.
              </p>
            </div>
          </div>
          <Link
            to="/profile"
            className="btn-primary text-xs px-4 py-2 rounded-xl whitespace-nowrap self-start sm:self-auto"
          >
            Complete Profile
          </Link>
        </div>
      )}

      {/* Main Content */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-slate-500 mt-4">Evaluating documented criteria against your profile...</p>
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <h3 className="font-bold text-base">Failed to load recommendations</h3>
          <p className="text-xs text-red-600 mt-1">{(error as any)?.message || 'Please try again later'}</p>
        </div>
      ) : recommendations && recommendations.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec: RecommendationItem) => (
              <div key={rec.scholarship_id} className="flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:border-indigo-300 transition-all">
                {/* Recommendation Match Badge & Rationale */}
                <div className="p-3.5 bg-indigo-50/70 border-b border-indigo-100 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-900 inline-flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Matched Recommendation
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-[11px] capitalize">
                      {rec.application_status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {rec.matched_criteria.map((crit, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/90 text-indigo-800 text-[11px] font-medium border border-indigo-200/60"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {crit.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                  {rec.explanation && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 italic">
                      "{rec.explanation}"
                    </p>
                  )}
                </div>

                {/* Scholarship preview */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-2 hover:text-indigo-600 transition-colors">
                      <Link to={`/scholarships/${rec.scholarship_id}`}>
                        {rec.scholarship_title}
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Provider: <span className="text-slate-700 font-medium">{rec.provider_name}</span>
                    </p>
                    {rec.funding_amount && (
                      <p className="text-xs font-semibold text-emerald-700 mt-2">
                        Funding: ₹{rec.funding_amount.toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block uppercase font-bold tracking-wider">Deadline</span>
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {rec.application_deadline || 'Not specified'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/eligibility-checker?scholarshipId=${rec.scholarship_id}`}
                        className="btn-secondary text-xs px-2.5 py-1.5 rounded-lg"
                      >
                        Verify
                      </Link>
                      <Link
                        to={`/scholarships/${rec.scholarship_id}`}
                        className="btn-primary text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1"
                      >
                        Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Advisory Note */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Disclaimer:</strong> Recommendations are calculated dynamically using documented scholarship eligibility thresholds compared against your student profile. Recommendations do not guarantee scholarship awards. Always verify criteria on the official sponsoring agency website before submitting your application.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-xl mx-auto">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Direct Recommendations Found</h3>
          <p className="text-sm text-slate-500 mt-2">
            Based on your current profile parameters, no open scholarships have exact matches. Try updating your profile or explore all general open scholarships.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link to="/profile" className="btn-secondary text-sm px-4 py-2 rounded-xl">
              Update Profile
            </Link>
            <Link to="/scholarships" className="btn-primary text-sm px-4 py-2 rounded-xl">
              Browse All Scholarships
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
