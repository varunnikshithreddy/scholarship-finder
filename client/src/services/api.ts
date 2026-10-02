import { supabase } from './supabase';
import {
  Scholarship,
  ScholarshipFilterParams,
  Profile,
  UserProfileInput,
  EligibilityAssessmentResult,
  RecommendationItem,
  SavedScholarship,
  Notification,
  NotificationPreferences,
  ApiResponse,
  ScholarshipCategory,
  ScholarshipProvider,
  AdminAuditLog
} from '@scholarship-finder/shared';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const session = (await supabase.auth.getSession()).data.session;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (session?.access_token) {
    (headers as any)['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  const json = await response.json();

  if (!response.ok || json.success === false) {
    const errorMsg = json.error?.message || `API Error: ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return json.data !== undefined ? json.data : json;
}

export const api = {
  // Scholarships
  getScholarships: async (params: ScholarshipFilterParams = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const queryString = query.toString();
    const session = (await supabase.auth.getSession()).data.session;
    const res = await fetch(`${API_BASE}/scholarships${queryString ? `?${queryString}` : ''}`, {
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
    });
    const json = await res.json();
    return {
      scholarships: (json.data as Scholarship[]) || [],
      meta: json.meta
    };
  },

  getLatestScholarships: (limit = 6) =>
    fetchWithAuth<Scholarship[]>(`/scholarships/latest?limit=${limit}`),

  getFeaturedScholarships: (limit = 6) =>
    fetchWithAuth<Scholarship[]>(`/scholarships/featured?limit=${limit}`),

  getScholarshipById: (idOrSlug: string) =>
    fetchWithAuth<Scholarship>(`/scholarships/${idOrSlug}`),

  getRelatedScholarships: (id: string, limit = 4) =>
    fetchWithAuth<Scholarship[]>(`/scholarships/${id}/related?limit=${limit}`),

  getCategories: () =>
    fetchWithAuth<ScholarshipCategory[]>('/categories'),

  getProviders: () =>
    fetchWithAuth<ScholarshipProvider[]>('/providers'),

  // Student Profile
  getMyProfile: () =>
    fetchWithAuth<Profile>('/profile'),

  updateMyProfile: (data: UserProfileInput) =>
    fetchWithAuth<Profile>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  deleteMyAccount: () =>
    fetchWithAuth<{ success: boolean }>('/profile', { method: 'DELETE' }),

  // Eligibility Engine
  checkEligibility: (data: { scholarship_id: string; profile_override?: any }) =>
    fetchWithAuth<EligibilityAssessmentResult>('/eligibility/check', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getEligibilityHistory: () =>
    fetchWithAuth<EligibilityAssessmentResult[]>('/eligibility/history'),

  getAssessmentById: (id: string) =>
    fetchWithAuth<EligibilityAssessmentResult>(`/eligibility/${id}`),

  // Recommendations
  getRecommendations: () =>
    fetchWithAuth<RecommendationItem[]>('/recommendations'),

  // Saved Scholarships
  getSavedScholarships: () =>
    fetchWithAuth<SavedScholarship[]>('/saved-scholarships'),

  saveScholarship: (data: { scholarship_id: string; application_status?: string; personal_note?: string }) =>
    fetchWithAuth<SavedScholarship>('/saved-scholarships', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateSavedScholarship: (id: string, data: { application_status?: string; personal_note?: string }) =>
    fetchWithAuth<SavedScholarship>(`/saved-scholarships/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  removeSavedScholarship: (id: string) =>
    fetchWithAuth<{ success: boolean }>(`/saved-scholarships/${id}`, { method: 'DELETE' }),

  // AI Assistant Chat
  askAssistant: (data: { message: string; scholarship_id?: string; conversation_history?: any[] }) =>
    fetchWithAuth<any>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Notifications
  getNotifications: () =>
    fetchWithAuth<Notification[]>('/notifications'),

  markNotificationRead: (id: string) =>
    fetchWithAuth<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllNotificationsRead: () =>
    fetchWithAuth<{ success: boolean }>('/notifications/read-all', { method: 'PATCH' }),

  getNotificationPreferences: () =>
    fetchWithAuth<NotificationPreferences>('/notifications/preferences'),

  updateNotificationPreferences: (data: Partial<NotificationPreferences>) =>
    fetchWithAuth<NotificationPreferences>('/notifications/preferences', {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  // Admin APIs
  getAdminOverview: () =>
    fetchWithAuth<any>('/admin/overview'),

  getAdminScholarships: async (page = 1, pageSize = 20, search?: string) => {
    const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) query.append('search', search);
    return fetchWithAuth<any>(`/admin/scholarships?${query.toString()}`);
  },

  createScholarshipAdmin: (data: any) =>
    fetchWithAuth<Scholarship>('/admin/scholarships', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateScholarshipAdmin: (id: string, data: any) =>
    fetchWithAuth<Scholarship>(`/admin/scholarships/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  archiveScholarshipAdmin: (id: string) =>
    fetchWithAuth<Scholarship>(`/admin/scholarships/${id}`, { method: 'DELETE' }),

  publishScholarshipAdmin: (id: string) =>
    fetchWithAuth<Scholarship>(`/admin/scholarships/${id}/publish`, { method: 'POST' }),

  unpublishScholarshipAdmin: (id: string) =>
    fetchWithAuth<Scholarship>(`/admin/scholarships/${id}/unpublish`, { method: 'POST' }),

  verifyScholarshipAdmin: (id: string, verification_status: string, notes: string) =>
    fetchWithAuth<Scholarship>(`/admin/scholarships/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ verification_status, notes })
    }),

  getAdminReports: () =>
    fetchWithAuth<any[]>('/admin/reports'),

  updateAdminReport: (id: string, status: string) =>
    fetchWithAuth<any>(`/admin/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  getAdminAuditLogs: () =>
    fetchWithAuth<AdminAuditLog[]>('/admin/audit-logs'),

  getAdminSources: () =>
    fetchWithAuth<any[]>('/admin/sources'),

  // Aliases & shortcuts for convenience
  createScholarship: (data: any) =>
    fetchWithAuth<Scholarship>('/admin/scholarships', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateScholarship: (id: string, data: any) =>
    fetchWithAuth<Scholarship>(`/admin/scholarships/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  publishScholarship: (id: string) =>
    fetchWithAuth<Scholarship>(`/admin/scholarships/${id}/publish`, { method: 'POST' }),

  unpublishScholarship: (id: string) =>
    fetchWithAuth<Scholarship>(`/admin/scholarships/${id}/unpublish`, { method: 'POST' }),

  verifyScholarship: (id: string, notes = 'Verified by admin') =>
    fetchWithAuth<Scholarship>(`/admin/scholarships/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ verification_status: 'verified', notes })
    }),

  archiveScholarship: (id: string) =>
    fetchWithAuth<Scholarship>(`/admin/scholarships/${id}`, { method: 'DELETE' }),

  deleteProfile: () =>
    fetchWithAuth<{ success: boolean }>('/profile', { method: 'DELETE' }),

  refreshRecommendations: () =>
    fetchWithAuth<RecommendationItem[]>('/recommendations/refresh', { method: 'POST' }),
};
