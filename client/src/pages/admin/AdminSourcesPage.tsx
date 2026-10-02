import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, ExternalLink, CheckCircle2, Globe } from 'lucide-react';
import { api } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminSourcesPage: React.FC = () => {
  const { data: sources, isLoading, isError } = useQuery({
    queryKey: ['admin-sources'],
    queryFn: () => api.getAdminSources(),
  });

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-indigo-600" />
          Source Provenance & Verification
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl mt-1">
          Review official government notices, educational portals, and trust foundations registered in the provenance database.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700">
          <p className="font-bold">Failed to load registered sources.</p>
        </div>
      ) : sources && sources.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Source Organization</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Verification</th>
                  <th className="py-3.5 px-4">Target Scholarship</th>
                  <th className="py-3.5 px-4">Official URL</th>
                  <th className="py-3.5 px-4">Last Checked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sources.map((src: any) => (
                  <tr key={src.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">{src.source_name}</td>
                    <td className="py-4 px-4 capitalize">{src.source_type}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                        <CheckCircle2 className="w-3 h-3" />
                        {src.verification_status}
                      </span>
                    </td>
                    <td className="py-4 px-4 max-w-xs truncate text-slate-600">
                      {src.scholarship?.title || src.scholarship_id}
                    </td>
                    <td className="py-4 px-4">
                      <a
                        href={src.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Visit Link <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                      {src.last_checked_at ? new Date(src.last_checked_at).toLocaleDateString() : 'Active'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Sources Registered</h3>
          <p className="text-xs text-slate-500 mt-1">
            Registered sources link each scholarship to its official government Gazette or portal.
          </p>
        </div>
      )}
    </div>
  );
};
