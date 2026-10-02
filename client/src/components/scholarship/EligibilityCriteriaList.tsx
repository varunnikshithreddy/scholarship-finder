import React from 'react';
import { ScholarshipEligibilityCriterion } from '@scholarship-finder/shared';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface CriteriaListProps {
  criteria: ScholarshipEligibilityCriterion[];
}

export const EligibilityCriteriaList: React.FC<CriteriaListProps> = ({ criteria }) => {
  if (!criteria || criteria.length === 0) {
    return (
      <p className="text-xs text-slate-500 italic py-2">
        Specific structured criteria not yet detailed. Please refer to the official notification.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {criteria.map((item, idx) => (
        <div
          key={item.id || idx}
          className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-start gap-3"
        >
          <div className="mt-0.5 text-indigo-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-slate-900 capitalize">
                {item.criterion_type.replace(/_/g, ' ')}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                item.is_mandatory ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {item.is_mandatory ? 'Mandatory' : 'Optional / Preferred'}
              </span>
            </div>
            <p className="text-slate-700 font-medium leading-relaxed">
              {item.description || item.source_text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
