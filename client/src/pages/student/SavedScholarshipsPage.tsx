import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark, Trash2, Edit3, Save, ExternalLink, Calendar, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { api } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { APPLICATION_STATUS_LABELS } from '@scholarship-finder/shared';
import type { SavedScholarship, ApplicationStatus } from '@scholarship-finder/shared';

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: 'interested', label: 'Interested' },
  { value: 'planning_to_apply', label: 'Planning to Apply' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'awarded', label: 'Awarded' },
  { value: 'not_selected', label: 'Not Selected' },
  { value: 'no_longer_interested', label: 'No Longer Interested' },
];

export const SavedScholarshipsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState<string>('');

  const { data: savedList, isLoading, isError } = useQuery({
    queryKey: ['saved-scholarships'],
    queryFn: () => api.getSavedScholarships(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { application_status?: ApplicationStatus; personal_note?: string } }) =>
      api.updateSavedScholarship(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-scholarships'] });
      setEditingNoteId(null);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => api.removeSavedScholarship(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-scholarships'] });
    },
  });

  const handleStatusChange = (id: string, newStatus: ApplicationStatus) => {
    updateMutation.mutate({ id, data: { application_status: newStatus } });
  };

  const handleStartEditNote = (saved: SavedScholarship) => {
    setEditingNoteId(saved.id);
    setNoteContent(saved.personal_note || '');
  };

  const handleSaveNote = (id: string) => {
    updateMutation.mutate({ id, data: { personal_note: noteContent } });
  };

  const filteredItems = (savedList || []).filter((item) => {
    if (statusFilter === 'all') return true;
    return item.application_status === statusFilter;
  });

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <Bookmark className="w-8 h-8 text-indigo-600" />
          Saved Scholarships & Application Tracker
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl mt-1">
          Track deadlines, update your application status, and record private preparation notes for your scholarship applications.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            statusFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All ({savedList?.length || 0})
        </button>
        {STATUS_OPTIONS.map((opt) => {
          const count = (savedList || []).filter((s) => s.application_status === opt.value).length;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === opt.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {opt.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Main List */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="font-bold">Failed to load saved scholarships</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-start justify-between gap-6"
            >
              {/* Left Details */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {item.scholarship?.provider?.name || 'Verified Provider'}
                  </span>
                  {item.scholarship?.application_deadline && (
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Deadline: {item.scholarship.application_deadline}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                    <Link to={`/scholarships/${item.scholarship_id}`}>
                      {item.scholarship?.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {item.scholarship?.short_description}
                  </p>
                </div>

                {/* Personal Notes Section */}
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-700">My Application Notes:</span>
                    {editingNoteId !== item.id ? (
                      <button
                        type="button"
                        onClick={() => handleStartEditNote(item)}
                        className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSaveNote(item.id)}
                        disabled={updateMutation.isPending}
                        className="text-xs text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Save className="w-3 h-3" />
                        Save
                      </button>
                    )}
                  </div>

                  {editingNoteId === item.id ? (
                    <textarea
                      rows={2}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Add reminders like: submitted marksheet on Monday, need letter of recommendation..."
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-xs text-slate-600 italic">
                      {item.personal_note || 'No notes added yet.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Action Controls */}
              <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-3 flex-shrink-0 md:w-56">
                <div>
                  <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                    Application Status
                  </label>
                  <select
                    value={item.application_status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value as ApplicationStatus)}
                    className="w-full text-xs font-semibold py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {item.scholarship?.official_application_url && (
                    <a
                      href={item.scholarship.official_application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 btn-primary text-xs py-2 rounded-xl text-center flex items-center justify-center gap-1"
                    >
                      Apply Now <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => removeMutation.mutate(item.id)}
                    disabled={removeMutation.isPending}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors"
                    title="Remove from saved list"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Scholarships in this list</h3>
          <p className="text-sm text-slate-500 mt-1">
            Browse our verified scholarship directory and bookmark opportunities to track your application milestones.
          </p>
          <div className="mt-6">
            <Link to="/scholarships" className="btn-primary text-sm px-5 py-2.5 rounded-xl">
              Explore Scholarships
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
