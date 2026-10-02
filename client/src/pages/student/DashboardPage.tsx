import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { ScholarshipCard } from '../../components/scholarship/ScholarshipCard';
import { SkeletonGrid } from '../../components/common/SkeletonLoader';
import {
  Compass,
  Bookmark,
  Calendar,
  Sparkles,
  Bot,
  UserCheck,
  ArrowRight,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, profile } = useAuth();

  const { data: saved, isLoading: savedLoading } = useQuery({
    queryKey: ['saved-scholarships'],
    queryFn: () => api.getSavedScholarships(),
  });

  const { data: recommendations, isLoading: recsLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => api.getRecommendations(),
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.getNotifications(),
  });

  // Calculate profile completeness
  const fields = [
    profile?.education_level,
    profile?.discipline,
    profile?.academic_score,
    profile?.annual_family_income,
    profile?.state
  ];
  const filled = fields.filter(f => f !== null && f !== undefined && f !== '').length;
  const completionPercentage = Math.round((filled / fields.length) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 to-indigo-800 text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            Student Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {profile?.full_name || 'Scholar'}!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl leading-relaxed">
            Monitor upcoming deadlines, test eligibility against official rules, and view tailored aid recommendations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/eligibility-checker"
            className="px-5 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Check Eligibility</span>
          </Link>
          <Link
            to="/ai-assistant"
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition flex items-center gap-2"
          >
            <Bot className="w-4 h-4 text-teal-300" />
            <span>Ask Assistant</span>
          </Link>
        </div>
      </div>

      {/* Profile Completion Warning if not 100% */}
      {completionPercentage < 100 && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-amber-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-600" />
              <span>Complete Your Student Profile ({completionPercentage}%)</span>
            </h4>
            <p className="text-xs text-amber-700">
              Add your current education level, academic score, and income to unlock accurate AI eligibility predictions.
            </p>
          </div>
          <Link
            to="/profile"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 self-start sm:self-center shadow-xs transition"
          >
            Complete Profile
          </Link>
        </div>
      )}

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Saved Scholarships</span>
            <Bookmark className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">{saved?.length || 0}</p>
          <Link to="/saved-scholarships" className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1">
            <span>View Tracker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">AI Recommendations</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">{recommendations?.length || 0}</p>
          <Link to="/recommendations" className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1">
            <span>Explore Matched Grants</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Approaching Deadlines</span>
            <Calendar className="w-5 h-5 text-teal-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">
            {saved?.filter(s => {
              if (!s.scholarship?.application_deadline) return false;
              const diff = (new Date(s.scholarship.application_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
              return diff >= 0 && diff <= 30;
            }).length || 0}
          </p>
          <Link to="/deadlines" className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1">
            <span>Check Deadlines</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recommended Scholarships Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Personalized</span>
            <h2 className="text-xl font-extrabold text-slate-900">Recommended for Your Profile</h2>
          </div>
          <Link to="/recommendations" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
            <span>See all recommendations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recsLoading ? (
          <SkeletonGrid count={3} />
        ) : recommendations && recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.slice(0, 3).map((rec) => (
              <div key={rec.scholarship_id} className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    High Compatibility
                  </span>
                  <h3 className="font-bold text-base text-slate-900 mt-2 mb-1">{rec.scholarship_title}</h3>
                  <p className="text-xs text-slate-500 font-semibold mb-3">{rec.provider_name}</p>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{rec.explanation}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">
                    {rec.funding_amount ? `₹${rec.funding_amount.toLocaleString('en-IN')}` : 'Variable aid'}
                  </span>
                  <Link
                    to={`/scholarships/${rec.scholarship_id}`}
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No specific recommendations calculated yet. Please ensure your profile contains your current education level and discipline.
          </div>
        )}
      </div>

      {/* Saved Scholarships Preview */}
      {saved && saved.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900">Your Saved Opportunities</h2>
            <Link to="/saved-scholarships" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
              <span>Manage all ({saved.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {saved.slice(0, 3).map((item) => (
              <div key={item.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {item.application_status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    {item.scholarship?.application_deadline ? `Due: ${item.scholarship.application_deadline}` : 'Open'}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 line-clamp-2">{item.scholarship?.title}</h4>
                {item.personal_note && (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded">
                    "{item.personal_note}"
                  </p>
                )}
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <Link
                    to={`/scholarships/${item.scholarship?.slug || item.scholarship_id}`}
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <span>View Scholarship</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
