import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GraduationCap,
  PlusCircle,
  Search,
  CheckCircle,
  Archive,
  Edit,
  Eye,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ScholarshipStatusBadge } from '../../components/scholarship/ScholarshipStatusBadge';
import type { Scholarship } from '@scholarship-finder/shared';

export const AdminScholarshipsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Load all scholarships
  const { data: scholarshipsData, isLoading, isError } = useQuery({
    queryKey: ['admin-scholarships', statusFilter],
    queryFn: () =>
      api.getScholarships({
        status: statusFilter === 'all' ? undefined : (statusFilter as any),
        pageSize: 100,
      }),
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: (id: string) => api.publishScholarship(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scholarships'] });
    },
  });

  // Unpublish mutation
  const unpublishMutation = useMutation({
    mutationFn: (id: string) => api.unpublishScholarship(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scholarships'] });
    },
  });

  // Verify mutation
  const verifyMutation = useMutation({
    mutationFn: (id: string) => api.verifyScholarship(id, 'Verified by authorized administrator'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scholarships'] });
    },
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: (id: string) => api.archiveScholarship(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scholarships'] });
    },
  });

  const scholarships = scholarshipsData?.scholarships || [];
  const filtered = scholarships.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.provider?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            Scholarship Management
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mt-1">
            Review, verify, publish, and maintain accuracy across all scholarship listings.
          </p>
        </div>

        <Link
          to="/admin/scholarships/new"
          className="btn-primary text-xs px-4 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Scholarship
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['all', 'published', 'draft', 'pending_review', 'archived'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Scholarships Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="font-bold">Failed to load scholarships list.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Scholarship</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Verification</th>
                  <th className="py-3.5 px-4">Deadline</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-1">{s.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{s.provider?.name}</div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">{s.category?.name || 'General'}</td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <ScholarshipStatusBadge status={s.status} />
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          s.verification_status === 'verified'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {s.verification_status === 'verified' && <ShieldCheck className="w-3 h-3" />}
                        {s.verification_status}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-slate-600">
                      {s.application_deadline || 'Not specified'}
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/scholarships/${s.id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                          title="Preview public page"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <Link
                          to={`/admin/scholarships/${s.id}/edit`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                          title="Edit scholarship"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        {s.verification_status !== 'verified' && (
                          <button
                            type="button"
                            onClick={() => verifyMutation.mutate(s.id)}
                            disabled={verifyMutation.isPending}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            title="Verify source citation"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}

                        {s.status === 'published' ? (
                          <button
                            type="button"
                            onClick={() => unpublishMutation.mutate(s.id)}
                            disabled={unpublishMutation.isPending}
                            className="text-[11px] font-semibold px-2 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100"
                          >
                            Unpublish
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => publishMutation.mutate(s.id)}
                            disabled={publishMutation.isPending}
                            className="text-[11px] font-semibold px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          >
                            Publish
                          </button>
                        )}

                        {s.status !== 'archived' && (
                          <button
                            type="button"
                            onClick={() => archiveMutation.mutate(s.id)}
                            disabled={archiveMutation.isPending}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="Archive record"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No matching scholarships found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
