import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, History, Search, ArrowRight, AlertCircle, BookOpen, User, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { EligibilityResult } from '../../components/eligibility/EligibilityResult';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import type { Scholarship, EligibilityAssessmentResult } from '@scholarship-finder/shared';

export const EligibilityCheckerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('scholarshipId') || '';
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const [selectedScholarshipId, setSelectedScholarshipId] = useState<string>(preselectedId);
  const [scholarshipSearch, setScholarshipSearch] = useState('');
  
  // Custom profile overrides for what-if evaluation
  const [customScore, setCustomScore] = useState<string>(profile?.academic_score?.toString() || '');
  const [customIncome, setCustomIncome] = useState<string>(profile?.annual_family_income?.toString() || '');
  const [customEducationLevel, setCustomEducationLevel] = useState<string>(profile?.education_level || '');

  // Keep state synced if profile loads later
  useEffect(() => {
    if (profile) {
      if (!customScore && profile.academic_score) setCustomScore(profile.academic_score.toString());
      if (!customIncome && profile.annual_family_income) setCustomIncome(profile.annual_family_income.toString());
      if (!customEducationLevel && profile.education_level) setCustomEducationLevel(profile.education_level);
    }
  }, [profile]);

  // Load published scholarships for selector
  const { data: scholarshipsData, isLoading: isLoadingScholarships } = useQuery({
    queryKey: ['published-scholarships-picker'],
    queryFn: () => api.getScholarships({ page: 1, limit: 100 } as any),
  });

  // Load previous assessment history
  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['eligibility-history'],
    queryFn: () => api.getEligibilityHistory(),
  });

  const [currentAssessment, setCurrentAssessment] = useState<EligibilityAssessmentResult | null>(null);

  // Mutation to check eligibility
  const checkMutation = useMutation({
    mutationFn: (data: { scholarship_id: string; profile_override?: Record<string, any> }) =>
      api.checkEligibility(data),
    onSuccess: (result) => {
      setCurrentAssessment(result);
      queryClient.invalidateQueries({ queryKey: ['eligibility-history'] });
    },
  });

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScholarshipId) return;

    const studentContext: Record<string, any> = {};
    if (customScore) studentContext.academic_score = parseFloat(customScore);
    if (customIncome) studentContext.annual_family_income = parseFloat(customIncome);
    if (customEducationLevel) studentContext.education_level = customEducationLevel;

    checkMutation.mutate({
      scholarship_id: selectedScholarshipId,
      profile_override: Object.keys(studentContext).length > 0 ? studentContext : undefined,
    });
  };

  const scholarships: Scholarship[] = scholarshipsData?.scholarships || [];
  const filteredScholarships = scholarships.filter((s: Scholarship) =>
    s.title.toLowerCase().includes(scholarshipSearch.toLowerCase()) ||
    s.provider?.name?.toLowerCase().includes(scholarshipSearch.toLowerCase())
  );

  const selectedScholarship = scholarships.find((s: Scholarship) => s.id === selectedScholarshipId);

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Powered by Google Gemini 2.5 & Deterministic Criteria Engine
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI-Assisted Eligibility Checker</h1>
        <p className="text-slate-600 text-base max-w-3xl mt-1">
          Evaluate your profile directly against documented scholarship requirements. Our dual-layer engine verifies strict academic and financial rules before synthesizing an advisory report.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Selection */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              1. Select a Scholarship
            </h2>

            {/* Search filter for dropdown */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by scholarship or provider..."
                value={scholarshipSearch}
                onChange={(e) => setScholarshipSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {isLoadingScholarships ? (
              <div className="py-6 flex justify-center">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {filteredScholarships.map((s: Scholarship) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedScholarshipId(s.id)}
                    className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex items-start justify-between gap-2 ${
                      selectedScholarshipId === s.id
                        ? 'bg-indigo-50/80 border-indigo-500 text-indigo-950 font-medium ring-1 ring-indigo-500 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="line-clamp-1">{s.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{s.provider?.name}</p>
                    </div>
                    {selectedScholarshipId === s.id && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
                {filteredScholarships.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No matching scholarships found</p>
                )}
              </div>
            )}

            {selectedScholarship && (
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Target:</span> {selectedScholarship.title}
                <div className="mt-1 flex items-center justify-between">
                  <span>Category: {selectedScholarship.category?.name || 'General'}</span>
                  <Link
                    to={`/scholarships/${selectedScholarship.id}`}
                    target="_blank"
                    className="text-indigo-600 hover:underline inline-flex items-center gap-0.5"
                  >
                    View Details <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile Context / Override */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                2. Student Profile Context
              </h2>
              <Link to="/profile" className="text-xs text-indigo-600 hover:underline">
                Edit Profile
              </Link>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Your profile is automatically loaded. You can adjust values below to test hypothetical eligibility scenarios without changing your saved profile.
            </p>

            <form onSubmit={handleEvaluate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Score (% or GPA)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={customScore}
                  onChange={(e) => setCustomScore(e.target.value)}
                  placeholder="e.g. 85.5"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Annual Household Family Income (INR)
                </label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={customIncome}
                  onChange={(e) => setCustomIncome(e.target.value)}
                  placeholder="e.g. 250000"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Education Level
                </label>
                <input
                  type="text"
                  value={customEducationLevel}
                  onChange={(e) => setCustomEducationLevel(e.target.value)}
                  placeholder="e.g. Undergraduate, Higher Secondary"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedScholarshipId || checkMutation.isPending}
                className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm font-semibold disabled:opacity-50"
              >
                {checkMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Analyzing Eligibility with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Check Eligibility</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Assessment Result & History */}
        <div className="lg:col-span-7 space-y-6">
          {checkMutation.isError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Assessment Failed</p>
                <p className="text-xs text-red-600 mt-1">
                  {(checkMutation.error as any)?.response?.data?.error?.message ||
                    'Unable to evaluate eligibility at this moment. Please verify the scholarship selection and try again.'}
                </p>
              </div>
            </div>
          )}

          {currentAssessment ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Assessment Result</h2>
                <span className="text-xs text-slate-500">
                  Evaluated at {currentAssessment.created_at ? new Date(currentAssessment.created_at).toLocaleTimeString() : 'Just now'}
                </span>
              </div>
              <EligibilityResult assessment={currentAssessment} />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Assessment Active</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Select a scholarship from the list on the left and click <strong>Check Eligibility</strong> to run our multi-stage eligibility evaluation.
              </p>
            </div>
          )}

          {/* Past Assessment History */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              Recent Evaluation History
            </h2>

            {isLoadingHistory ? (
              <div className="py-6 flex justify-center">
                <LoadingSpinner size="sm" />
              </div>
            ) : historyData && historyData.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {historyData.slice(0, 5).map((item) => (
                  <div key={item.id || item.scholarship_id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.scholarship_id}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Status: <span className="capitalize font-medium text-slate-700">{item.status?.replace(/_/g, ' ')}</span> &bull; {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recorded'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentAssessment(item)}
                      className="btn-secondary text-xs px-3 py-1.5 rounded-lg flex-shrink-0"
                    >
                      View Report
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No prior eligibility assessments recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
