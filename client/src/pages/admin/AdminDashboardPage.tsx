import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldAlert,
  GraduationCap,
  CheckCircle2,
  Clock,
  PlusCircle,
  FileText,
  AlertTriangle,
  Layers,
  ExternalLink,
  Users,
} from 'lucide-react';
import { api } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminDashboardPage: React.FC = () => {
  const { data: overview, isLoading, isError } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => api.getAdminOverview(),
  });

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
            Administrative Portal
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Oversight & Governance</h1>
          <p className="text-slate-600 text-sm max-w-xl mt-1">
            Maintain scholarship provenance, verify source citations, review community reports, and monitor publication lifecycles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/scholarships/new"
            className="btn-primary text-xs px-4 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Add Scholarship
          </Link>
          <Link
            to="/admin/scholarships"
            className="btn-secondary text-xs px-4 py-2.5 rounded-xl font-semibold inline-flex items-center gap-1.5"
          >
            <GraduationCap className="w-4 h-4" />
            Manage Catalog
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="font-bold">Failed to load admin overview metrics.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Catalog</span>
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">{overview?.scholarships?.total || 0}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                <span>Published: <strong className="text-emerald-600">{overview?.scholarships?.published || 0}</strong></span>
                <span>Drafts: <strong className="text-amber-600">{overview?.scholarships?.draft || 0}</strong></span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Source Verification</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">{overview?.scholarships?.verified || 0}</p>
              <p className="text-xs text-slate-500 mt-3">
                Needs review: <strong className="text-amber-600">{overview?.scholarships?.needs_review || 0}</strong> records
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Providers</span>
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Layers className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">{overview?.providers_count || 6}</p>
              <p className="text-xs text-slate-500 mt-3">Central, State & Verified Foundations</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Reports</span>
                <div className="p-2 rounded-xl bg-red-50 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">{overview?.open_reports_count || 0}</p>
              <p className="text-xs text-slate-500 mt-3">
                <Link to="/admin/reports" className="text-indigo-600 hover:underline">
                  Review reported flags &rarr;
                </Link>
              </p>
            </div>
          </div>

          {/* Quick Management Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/admin/scholarships"
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:border-indigo-400 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Scholarship Directory Management
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Publish, edit, unpublish, or archive scholarship records. Verify eligibility rules and deadline windows.
              </p>
            </Link>

            <Link
              to="/admin/sources"
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:border-indigo-400 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Source Provenance & Verification
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Manage registered official portals, verified domain link checkers, and last verified inspection dates.
              </p>
            </Link>

            <Link
              to="/admin/audit-logs"
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:border-indigo-400 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Administrative Audit Trails
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Immutable record of administrative actions, status mutations, publishes, and metadata revisions.
              </p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
