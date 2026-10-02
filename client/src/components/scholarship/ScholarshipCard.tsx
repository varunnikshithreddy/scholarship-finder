import React from 'react';
import { Link } from 'react-router-dom';
import { Scholarship } from '@scholarship-finder/shared';
import { ScholarshipStatusBadge } from './ScholarshipStatusBadge';
import { SaveScholarshipButton } from './SaveScholarshipButton';
import { Calendar, GraduationCap, ArrowRight } from 'lucide-react';

interface ScholarshipCardProps {
  scholarship: Scholarship;
}

export const ScholarshipCard: React.FC<ScholarshipCardProps> = ({ scholarship }) => {
  const formattedAmount = scholarship.funding_amount
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: scholarship.funding_currency || 'INR',
        maximumFractionDigits: 0
      }).format(scholarship.funding_amount)
    : 'Funding Varies';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div className="p-6">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
            {scholarship.category?.name || 'General Aid'}
          </span>
          <ScholarshipStatusBadge
            deadline={scholarship.application_deadline}
            status={scholarship.status}
            verificationStatus={scholarship.verification_status}
          />
        </div>

        {/* Title */}
        <Link to={`/scholarships/${scholarship.slug || scholarship.id}`} className="block group-hover:text-indigo-600 transition">
          <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug mb-1">
            {scholarship.title}
          </h3>
        </Link>

        {/* Provider */}
        <p className="text-xs font-semibold text-slate-500 mb-3 truncate">
          {scholarship.provider?.name || 'Verified Provider'}
        </p>

        {/* Short Summary */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {scholarship.short_description || scholarship.description}
        </p>

        {/* Tags: Education levels */}
        {scholarship.education_levels && scholarship.education_levels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {scholarship.education_levels.slice(0, 2).map((level, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                <GraduationCap className="w-3 h-3 text-slate-400" />
                <span>{level}</span>
              </span>
            ))}
            {scholarship.education_levels.length > 2 && (
              <span className="text-[10px] font-semibold text-slate-400 self-center">
                +{scholarship.education_levels.length - 2} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Scholarship Value</span>
          <span className="font-extrabold text-sm text-slate-900">{formattedAmount}</span>
        </div>

        <div className="flex items-center gap-2">
          <SaveScholarshipButton scholarshipId={scholarship.id} />
          <Link
            to={`/scholarships/${scholarship.slug || scholarship.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
