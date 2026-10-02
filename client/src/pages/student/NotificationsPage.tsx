import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Clock, ShieldCheck, Mail, Settings, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import type { Notification, NotificationPreferences } from '@scholarship-finder/shared';

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'notifications' | 'preferences'>('notifications');

  // Load notifications
  const { data: notifications, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.getNotifications(),
  });

  // Load preferences
  const { data: preferences, isLoading: isLoadingPreferences } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => api.getNotificationPreferences(),
  });

  // Mark single as read
  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Update preferences
  const updatePrefsMutation = useMutation({
    mutationFn: (data: Partial<NotificationPreferences>) => api.updateNotificationPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });

  const unreadCount = (notifications || []).filter((n) => !n.is_read).length;

  return (
    <div className="container-custom py-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-indigo-600" />
            Notifications & Alerts
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mt-1">
            Receive automated alerts for upcoming application deadlines, opening windows, and new verified scholarships matching your profile.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Activity</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'preferences'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </button>
        </div>
      </div>

      {activeTab === 'notifications' ? (
        <div className="space-y-4">
          {/* Header Action */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Recent Alerts ({notifications?.length || 0})
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all as read
              </button>
            )}
          </div>

          {isLoadingNotifications ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="space-y-2.5">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                    notif.is_read
                      ? 'bg-white border-slate-200/80 text-slate-700'
                      : 'bg-indigo-50/40 border-indigo-200 text-indigo-950 shadow-xs'
                  }`}
                >
                  <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${notif.is_read ? 'bg-slate-100 text-slate-500' : 'bg-indigo-100 text-indigo-700'}`}>
                    <Clock className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold truncate">{notif.title}</h4>
                      <span className="text-[11px] text-slate-400 flex-shrink-0">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                  </div>

                  {!notif.is_read && (
                    <button
                      type="button"
                      onClick={() => markReadMutation.mutate(notif.id)}
                      className="text-xs text-indigo-600 hover:underline flex-shrink-0 font-medium"
                      title="Mark as read"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No notifications yet</p>
              <p className="text-xs text-slate-500 mt-0.5">
                We will alert you when saved scholarships approach their deadlines or new programs open.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Preferences Form */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Notification Preferences</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control how and when you receive critical application updates and reminders.
            </p>
          </div>

          {isLoadingPreferences ? (
            <div className="py-8 flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : preferences ? (
            <div className="space-y-6">
              {/* Channel Toggles */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400">Delivery Channels</h3>
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.in_app_enabled}
                    onChange={(e) => updatePrefsMutation.mutate({ in_app_enabled: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800 block">In-App Notifications</span>
                    <span className="text-xs text-slate-500">Show notification bell alerts inside the portal dashboard</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.email_enabled}
                    onChange={(e) => updatePrefsMutation.mutate({ email_enabled: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800 block">Email Reminders</span>
                    <span className="text-xs text-slate-500">Send critical deadline alerts to your registered email address</span>
                  </div>
                </label>
              </div>

              {/* Reminder Types */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400">Notification Triggers</h3>
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.deadline_reminders_enabled}
                    onChange={(e) => updatePrefsMutation.mutate({ deadline_reminders_enabled: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800 block">Deadline Approaching Reminders</span>
                    <span className="text-xs text-slate-500">Notify me prior to the final application closing date</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.opening_reminders_enabled}
                    onChange={(e) => updatePrefsMutation.mutate({ opening_reminders_enabled: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800 block">Application Window Opening Alerts</span>
                    <span className="text-xs text-slate-500">Notify me when upcoming scholarships start accepting applications</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.scholarship_updates_enabled}
                    onChange={(e) => updatePrefsMutation.mutate({ scholarship_updates_enabled: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800 block">Eligibility & Criteria Changes</span>
                    <span className="text-xs text-slate-500">Alert me if eligibility or document requirements are updated on saved scholarships</span>
                  </div>
                </label>
              </div>

              {updatePrefsMutation.isSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                  Preferences updated successfully.
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
