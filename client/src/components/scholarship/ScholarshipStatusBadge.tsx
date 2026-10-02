import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  deadline?: string | null;
  status?: string;
  verificationStatus?: string;
}

export const ScholarshipStatusBadge: React.FC<StatusBadgeProps> = ({
  deadline,
  verificationStatus
}) => {
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let label = 'Open';
  let icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;

  if (deadline) {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      badgeColor = 'bg-slate-100 text-slate-600 border-slate-200';
      label = 'Closed';
      icon = <Clock className="w-3.5 h-3.5 text-slate-400" />;
    } else if (diffDays <= 7) {
      badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
      label = diffDays === 0 ? 'Closes Today' : `Closing in ${diffDays}d`;
      icon = <Clock className="w-3.5 h-3.5 text-amber-600" />;
    } else {
      badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Open';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    }
  } else {
    badgeColor = 'bg-slate-50 text-slate-600 border-slate-200';
    label = 'Upcoming';
    icon = <AlertCircle className="w-3.5 h-3.5 text-slate-400" />;
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
        {icon}
        <span>{label}</span>
      </span>

      {verificationStatus === 'verified' && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200" title="Source verified by administrators">
          <CheckCircle2 className="w-3 h-3 text-blue-600" />
          <span>Verified</span>
        </span>
      )}
    </div>
  );
};
