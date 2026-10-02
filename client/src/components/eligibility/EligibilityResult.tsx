import React from 'react';
import { EligibilityAssessmentResult, ELIGIBILITY_STATUS_LABELS } from '@scholarship-finder/shared';
import { CheckCircle2, XCircle, AlertTriangle, Info, ArrowRight, ShieldAlert } from 'lucide-react';

interface ResultProps {
  assessment: EligibilityAssessmentResult;
  scholarshipTitle?: string;
}

export const EligibilityResult: React.FC<ResultProps> = ({ assessment, scholarshipTitle }) => {
  const statusInfo = ELIGIBILITY_STATUS_LABELS[assessment.status] || {
    label: assessment.status,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    description: ''
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
      {/* Header Result Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Eligibility Assessment
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
            {scholarshipTitle || 'Scholarship Evaluation'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">{statusInfo.description}</p>
        </div>

        <div className="flex flex-col sm:items-end gap-1">
          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-extrabold border ${statusInfo.badgeClass}`}>
            {statusInfo.label}
          </span>
          <span className="text-[11px] text-slate-400 font-semibold">
            Information Completeness: {assessment.confidence_completeness}%
          </span>
        </div>
      </div>

      {/* Narrative Explanation */}
      <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-slate-800 leading-relaxed">
        <p className="font-semibold mb-1 text-indigo-950 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Evaluation Summary</span>
        </p>
        <p>{assessment.explanation}</p>
      </div>

      {/* Matched Criteria */}
      {assessment.matched_criteria && assessment.matched_criteria.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Matched Requirements ({assessment.matched_criteria.length})</span>
          </h4>
          <div className="space-y-2">
            {assessment.matched_criteria.map((c, i) => (
              <div key={i} className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs">
                <div className="flex justify-between items-start font-semibold text-slate-900 mb-0.5">
                  <span>{c.criterion}</span>
                  <span className="text-emerald-700 font-bold">{c.student_value}</span>
                </div>
                <p className="text-slate-600 text-[11px]">{c.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unmatched Criteria */}
      {assessment.unmatched_criteria && assessment.unmatched_criteria.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>Unmet Requirements ({assessment.unmatched_criteria.length})</span>
          </h4>
          <div className="space-y-2">
            {assessment.unmatched_criteria.map((c, i) => (
              <div key={i} className="p-3 rounded-lg bg-rose-50/50 border border-rose-100 text-xs">
                <div className="flex justify-between items-start font-semibold text-slate-900 mb-0.5">
                  <span>{c.criterion}</span>
                  <span className="text-rose-700 font-bold">Your score: {c.student_value}</span>
                </div>
                <p className="text-slate-600 text-[11px]">{c.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Information */}
      {assessment.missing_information && assessment.missing_information.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Unconfirmed Profile Fields ({assessment.missing_information.length})</span>
          </h4>
          <div className="space-y-2">
            {assessment.missing_information.map((m, i) => (
              <div key={i} className="p-3 rounded-lg bg-amber-50/50 border border-amber-100 text-xs">
                <span className="font-semibold text-slate-900 capitalize block mb-0.5">
                  {m.field.replace(/_/g, ' ')}
                </span>
                <p className="text-slate-600 text-[11px]">{m.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Next Steps */}
      {assessment.next_steps && assessment.next_steps.length > 0 && (
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
            Recommended Action Steps
          </h4>
          <ul className="space-y-2 text-xs text-slate-700">
            {assessment.next_steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Advisory Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2 leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
        <p>{assessment.disclaimer}</p>
      </div>
    </div>
  );
};
