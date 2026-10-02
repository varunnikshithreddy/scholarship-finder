import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, Shield, User, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminAuditLogsPage: React.FC = () => {
  const { data: logs, isLoading, isError } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => api.getAdminAuditLogs(),
  });

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <History className="w-8 h-8 text-indigo-600" />
          Administrative Audit Trail
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl mt-1">
          Immutable system log capturing scholarship updates, source verifications, and status transitions for compliance.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700">
          <p className="font-bold">Failed to load audit logs.</p>
        </div>
      ) : logs && logs.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Entity Type</th>
                  <th className="py-3.5 px-4">Entity ID</th>
                  <th className="py-3.5 px-4">Admin ID</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-indigo-700 font-sans text-xs">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4 capitalize font-sans text-slate-800">
                      {log.entity_type}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 truncate max-w-[140px]">
                      {log.entity_id || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 truncate max-w-[140px]">
                      {log.admin_id || 'system'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-sans text-xs whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Audit Records Yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Administrative actions such as publication, edits, or verification decisions will appear here.
          </p>
        </div>
      )}
    </div>
  );
};
