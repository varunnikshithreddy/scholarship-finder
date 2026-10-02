import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { api } from '../../services/api';
import { Shield, Key, AlertTriangle, UserCheck, Trash2, Mail, CheckCircle2 } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const SettingsPage: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsSendingReset(true);
    try {
      await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/login`,
      });
      setResetEmailSent(true);
    } catch (err: any) {
      console.error('Password reset failed', err);
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await api.deleteProfile();
      await logout();
      window.location.href = '/';
    } catch (err: any) {
      setDeleteError(err?.response?.data?.error?.message || 'Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="container-custom py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <Shield className="w-8 h-8 text-indigo-600" />
          Account & Privacy Settings
        </h1>
        <p className="text-slate-600 text-sm max-w-xl mt-1">
          Manage your account credentials, security preferences, and data privacy controls.
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Summary */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            Account Overview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Email</span>
              <span className="text-slate-800 font-medium text-sm mt-0.5 block truncate">{user?.email}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Role</span>
              <span className="capitalize text-slate-800 font-medium text-sm mt-0.5 block">
                {profile?.role || 'Student'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Profile Status</span>
              <span className="text-slate-800 font-medium text-sm mt-0.5 block">
                {profile?.profile_completed ? 'Completed' : 'Draft / Incomplete'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Account Created</span>
              <span className="text-slate-800 font-medium text-sm mt-0.5 block">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Security & Password */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-600" />
            Password & Security
          </h2>
          <p className="text-xs text-slate-500">
            Send a secure password recovery and reset link to your registered email address.
          </p>

          {resetEmailSent ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              Password reset link has been dispatched to {user?.email}. Check your inbox.
            </div>
          ) : (
            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={isSendingReset}
              className="btn-secondary text-xs px-4 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2"
            >
              {isSendingReset ? <LoadingSpinner size="sm" /> : <Mail className="w-4 h-4" />}
              Send Password Reset Email
            </button>
          )}
        </div>

        {/* Danger Zone: Account Deletion */}
        <div className="bg-red-50/50 rounded-2xl border border-red-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-red-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Danger Zone
          </h2>
          <p className="text-xs text-red-700 leading-relaxed">
            Deleting your student account will permanently remove your educational profile, saved scholarship bookmarks, personal preparation notes, and AI eligibility assessment history. This action cannot be undone.
          </p>

          {!deleteConfirmOpen ? (
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-4 h-4" />
              Request Account Deletion
            </button>
          ) : (
            <div className="p-4 bg-white rounded-xl border border-red-300 space-y-3">
              <p className="text-xs font-bold text-slate-900">Are you absolutely sure you want to delete your account?</p>
              {deleteError && <p className="text-xs text-red-600 font-medium">{deleteError}</p>}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? <LoadingSpinner size="sm" /> : 'Yes, Delete My Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmOpen(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
