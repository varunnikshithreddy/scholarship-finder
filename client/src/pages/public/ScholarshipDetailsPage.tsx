import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { ScholarshipStatusBadge } from '../../components/scholarship/ScholarshipStatusBadge';
import { EligibilityCriteriaList } from '../../components/scholarship/EligibilityCriteriaList';
import { RequiredDocumentsList } from '../../components/scholarship/RequiredDocumentsList';
import { SaveScholarshipButton } from '../../components/scholarship/SaveScholarshipButton';
import { ReportScholarshipDialog } from '../../components/scholarship/ReportScholarshipDialog';
import { ScholarshipCard } from '../../components/scholarship/ScholarshipCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import {
  ExternalLink,
  ShieldCheck,
  Calendar,
  Building,
  GraduationCap,
  Sparkles,
  Flag,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

export const ScholarshipDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const { data: scholarship, isLoading, error } = useQuery({
    queryKey: ['scholarship', id],
    queryFn: () => api.getScholarshipById(id!),
    enabled: !!id,
  });

  const { data: related } = useQuery({
    queryKey: ['scholarship', id, 'related'],
    queryFn: () => api.getRelatedScholarships(scholarship!.id, 3),
    enabled: !!scholarship?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner message="Loading verified scholarship details..." />
      </div>
    );
  }

  if (error || !scholarship) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <ErrorState
          title="Scholarship Not Found"
          message="The requested scholarship record could not be loaded or may not be published yet."
        />
      </div>
    );
  }

  const formattedAmount = scholarship.funding_amount
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: scholarship.funding_currency || 'INR',
        maximumFractionDigits: 0
      }).format(scholarship.funding_amount)
    : 'Not Specified';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Directory', href: '/scholarships' },
          { label: scholarship.title }
        ]}
      />

      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                {scholarship.category?.name || 'Central Grant'}
              </span>
              <ScholarshipStatusBadge
                deadline={scholarship.application_deadline}
                status={scholarship.status}
                verificationStatus={scholarship.verification_status}
              />
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {scholarship.title}
            </h1>

            {/* Provider info */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5 text-slate-900">
                <Building className="w-4 h-4 text-indigo-600" />
                <span>{scholarship.provider?.name || 'Verified Provider'}</span>
              </span>
              {scholarship.provider?.official_website && (
                <a
                  href={scholarship.provider.official_website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <span>Provider Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0 self-start">
            <SaveScholarshipButton scholarshipId={scholarship.id} />
            <button
              onClick={() => setReportModalOpen(true)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
              title="Report inaccurate info"
            >
              <Flag className="w-4 h-4" />
            </button>
            {scholarship.official_application_url && (
              <a
                href={scholarship.official_application_url}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
              >
                <span>Apply on Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Quick Facts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Award Amount</span>
            <p className="text-base font-extrabold text-slate-900">{formattedAmount}</p>
            <p className="text-[11px] text-slate-500 font-medium truncate">{scholarship.funding_frequency || 'Annual aid'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Application Deadline</span>
            <p className="text-base font-extrabold text-slate-900">
              {scholarship.application_deadline ? new Date(scholarship.application_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not Specified'}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">{scholarship.deadline_timezone || 'Asia/Kolkata'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Eligible Levels</span>
            <p className="text-xs font-bold text-slate-900 line-clamp-1">
              {scholarship.education_levels.join(', ') || 'All Higher Education'}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">Regular Degree / Diploma</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Source Provenance</span>
            <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Gazette Verified</span>
            </p>
            <a
              href={scholarship.official_source_url}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-semibold truncate"
            >
              <span>View Source Notification</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Details and Side Advisor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Scholarship Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-indigo-600" />
              <span>Overview & Objective</span>
            </h2>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {scholarship.description}
            </div>
            {scholarship.funding_coverage && (
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs">
                <span className="font-bold text-indigo-900 block mb-0.5">Coverage Breakdown:</span>
                <span className="text-indigo-950 font-medium">{scholarship.funding_coverage}</span>
              </div>
            )}
          </div>

          {/* Documented Eligibility Criteria */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <span>Eligibility Requirements</span>
              </h2>
              <span className="text-xs font-semibold text-slate-400">Official Criteria</span>
            </div>
            <EligibilityCriteriaList criteria={scholarship.criteria || []} />
          </div>

          {/* Required Documents */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-indigo-600" />
              <span>Required Application Documents</span>
            </h2>
            <RequiredDocumentsList documents={scholarship.required_documents || []} />
          </div>

          {/* Application Steps & Selection */}
          {(scholarship.application_instructions || scholarship.selection_process) && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
              {scholarship.application_instructions && (
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900">Application Procedure</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {scholarship.application_instructions}
                  </p>
                </div>
              )}

              {scholarship.selection_process && (
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">Selection Process</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {scholarship.selection_process}
                  </p>
                </div>
              )}

              {scholarship.renewal_conditions && (
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">Renewal Policy</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {scholarship.renewal_conditions}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar: AI Checker & Official Action */}
        <div className="space-y-6 lg:sticky lg:top-24">
          {/* AI Checker Callout Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-teal-300">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">AI Eligibility Check</span>
            </div>
            <h3 className="text-lg font-bold">Check if you qualify for this scholarship</h3>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Run an instant evaluation comparing your academic marks and household income against this specific scheme's rules.
            </p>
            <Link
              to={`/eligibility-checker?scholarship_id=${scholarship.id}`}
              className="w-full py-3 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
            >
              <span>Test My Eligibility Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Official Verification Summary */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verification Provenance</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This scholarship is monitored by our administrative review team. Verified directly against published government guidelines and official foundation disclosures.
            </p>
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Last Verified:</span>
                <span className="font-bold text-slate-900">
                  {scholarship.source_last_verified_at ? new Date(scholarship.source_last_verified_at).toLocaleDateString() : 'Active'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Provider Type:</span>
                <span className="font-bold text-slate-900">{scholarship.provider?.provider_type}</span>
              </div>
            </div>
          </div>

          {/* Ask AI Assistant */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900">Have Questions About This Scheme?</h3>
            <p className="text-slate-500">
              Our AI Assistant can clarify eligibility requirements, document certificates, or selection procedures.
            </p>
            <Link
              to={`/ai-assistant?scholarship_id=${scholarship.id}`}
              className="inline-flex items-center gap-1.5 font-bold text-indigo-600 hover:underline"
            >
              <span>Ask AI Assistant about this</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Related Scholarships */}
      {related && related.length > 0 && (
        <div className="pt-8 border-t border-slate-200 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Related Scholarship Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((r) => (
              <ScholarshipCard key={r.id} scholarship={r} />
            ))}
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportScholarshipDialog
        scholarshipId={scholarship.id}
        scholarshipTitle={scholarship.title}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </div>
  );
};
