import React, { useState } from 'react';
import { Flag, X, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface ReportScholarshipDialogProps {
  scholarshipId: string;
  scholarshipTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportScholarshipDialog: React.FC<ReportScholarshipDialogProps> = ({
  scholarshipId,
  scholarshipTitle,
  isOpen,
  onClose
}) => {
  const [reportType, setReportType] = useState('Incorrect Information');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      await supabase.from('scholarship_reports').insert({
        scholarship_id: scholarshipId,
        reported_by: user?.id || null,
        report_type: reportType,
        description,
        status: 'open'
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit report');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2 text-rose-600">
            <Flag className="w-5 h-5" />
            <h3 className="font-bold text-sm text-slate-900">Report Inaccuracy</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">Thank You for Reporting!</h4>
            <p className="text-xs text-slate-500">Our administrative verification team will review this notice.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            <p className="text-slate-600 font-normal">
              Reporting: <span className="font-bold text-slate-900">{scholarshipTitle}</span>
            </p>

            <div>
              <label className="block text-slate-700 mb-1">Issue Category</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Incorrect Information">Incorrect Eligibility / Dates</option>
                <option value="Broken Official URL">Broken / Inaccessible Official Link</option>
                <option value="Expired Scholarship">Scholarship Has Already Expired</option>
                <option value="Other">Other Observation</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Details & Evidence</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Explain what is inaccurate and provide official source URL if available..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-normal"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 flex items-center gap-1.5"
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Submit Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
