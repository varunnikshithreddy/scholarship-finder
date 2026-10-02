import React, { useState, useEffect } from 'react';
import { Bookmark, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface SaveScholarshipButtonProps {
  scholarshipId: string;
  className?: string;
}

export const SaveScholarshipButton: React.FC<SaveScholarshipButtonProps> = ({
  scholarshipId,
  className = ''
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('interested');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    api.getSavedScholarships().then(list => {
      const found = list.find(item => item.scholarship_id === scholarshipId);
      if (found) {
        setIsSaved(true);
        setSavedRecordId(found.id);
        setStatus(found.application_status);
        setNote(found.personal_note || '');
      }
    }).catch(() => {});
  }, [user, scholarshipId]);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    if (isSaved) {
      // Toggle un-save directly or open status editor
      handleUnsave();
    } else {
      setModalOpen(true);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const saved = await api.saveScholarship({
        scholarship_id: scholarshipId,
        application_status: status,
        personal_note: note
      });
      setIsSaved(true);
      setSavedRecordId(saved.id);
      setModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save scholarship');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsave = async () => {
    if (!savedRecordId) return;
    setIsLoading(true);
    try {
      await api.removeSavedScholarship(savedRecordId);
      setIsSaved(false);
      setSavedRecordId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to remove saved scholarship');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        disabled={isLoading}
        className={`p-2 rounded-lg border transition flex items-center justify-center ${
          isSaved
            ? 'bg-amber-50 text-amber-600 border-amber-300 hover:bg-amber-100'
            : 'bg-white text-slate-500 border-slate-200 hover:text-indigo-600 hover:border-slate-300'
        } ${className}`}
        title={isSaved ? 'Saved! Click to remove' : 'Bookmark this scholarship'}
        aria-label={isSaved ? 'Remove bookmark' : 'Bookmark scholarship'}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
        )}
      </button>

      {/* Save Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={(e) => { e.stopPropagation(); setModalOpen(false); }}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-base text-slate-900 mb-1">Save to Application Tracker</h3>
            <p className="text-xs text-slate-500 mb-4">
              Track deadlines, organize documents, and log your application progress.
            </p>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Application Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="interested">Interested</option>
                  <option value="planning_to_apply">Planning to Apply</option>
                  <option value="in_progress">Application in Progress</option>
                  <option value="submitted">Submitted</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Personal Note (Optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Need to get Bonafide certificate from HOD by next week"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-normal"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 flex items-center gap-1.5"
                >
                  {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Scholarship</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
