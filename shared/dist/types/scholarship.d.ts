export type UserRole = 'student' | 'admin';
export type ScholarshipStatus = 'draft' | 'pending_review' | 'published' | 'archived';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected' | 'needs_review';
export type ApplicationStatus = 'interested' | 'planning_to_apply' | 'in_progress' | 'submitted' | 'awarded' | 'not_selected' | 'no_longer_interested';
export type EligibilityStatus = 'likely_eligible' | 'potentially_eligible' | 'likely_ineligible' | 'insufficient_information';
export type NotificationChannel = 'in_app' | 'email';
export interface DocumentRequirement {
    name: string;
    description: string;
    is_mandatory: boolean;
    accepted_format?: string;
    source_reference?: string;
}
export interface ScholarshipProvider {
    id: string;
    name: string;
    slug: string;
    provider_type: string;
    description?: string | null;
    official_website?: string | null;
    country: string;
    verification_status: VerificationStatus;
    created_at: string;
    updated_at: string;
}
export interface ScholarshipCategory {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    icon_name?: string | null;
    is_active: boolean;
    created_at: string;
}
export interface ScholarshipEligibilityCriterion {
    id: string;
    scholarship_id: string;
    criterion_type: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'greater_than_or_equal' | 'less_than' | 'less_than_or_equal' | 'in' | 'contains' | 'between';
    expected_value: any;
    description?: string | null;
    source_text?: string | null;
    is_mandatory: boolean;
    verification_status: VerificationStatus;
    display_order: number;
    created_at: string;
    updated_at: string;
}
export interface ScholarshipSource {
    id: string;
    scholarship_id: string;
    source_name: string;
    source_url: string;
    source_type: string;
    source_published_at?: string | null;
    last_checked_at?: string | null;
    verification_status: VerificationStatus;
    verified_by?: string | null;
    verification_notes?: string | null;
    created_at: string;
}
export interface Scholarship {
    id: string;
    title: string;
    slug: string;
    short_description?: string | null;
    description: string;
    provider_id: string;
    category_id?: string | null;
    status: ScholarshipStatus;
    verification_status: VerificationStatus;
    education_levels: string[];
    disciplines: string[];
    eligible_countries: string[];
    eligible_states: string[];
    eligible_nationalities: string[];
    funding_amount?: number | null;
    funding_currency: string;
    funding_frequency?: string | null;
    funding_coverage?: string | null;
    application_start_date?: string | null;
    application_deadline?: string | null;
    deadline_at?: string | null;
    deadline_timezone: string;
    official_application_url?: string | null;
    official_source_url: string;
    publication_date?: string | null;
    source_last_verified_at?: string | null;
    selection_process?: string | null;
    renewal_conditions?: string | null;
    application_instructions?: string | null;
    required_documents: DocumentRequirement[];
    source_metadata: Record<string, any>;
    is_featured: boolean;
    created_by?: string | null;
    updated_by?: string | null;
    published_at?: string | null;
    archived_at?: string | null;
    created_at: string;
    updated_at: string;
    provider?: ScholarshipProvider;
    category?: ScholarshipCategory;
    criteria?: ScholarshipEligibilityCriterion[];
    sources?: ScholarshipSource[];
}
export interface SavedScholarship {
    id: string;
    user_id: string;
    scholarship_id: string;
    application_status: ApplicationStatus;
    personal_note?: string | null;
    saved_at: string;
    updated_at: string;
    scholarship?: Scholarship;
}
export interface Notification {
    id: string;
    user_id: string;
    scholarship_id?: string | null;
    channel: NotificationChannel;
    title: string;
    message: string;
    notification_type: string;
    is_read: boolean;
    sent_at?: string | null;
    scheduled_at?: string | null;
    idempotency_key?: string | null;
    created_at: string;
    scholarship?: Scholarship;
}
export interface NotificationPreferences {
    user_id: string;
    in_app_enabled: boolean;
    email_enabled: boolean;
    deadline_reminders_enabled: boolean;
    opening_reminders_enabled: boolean;
    scholarship_updates_enabled: boolean;
    reminder_days: number[];
    updated_at: string;
}
export interface ScholarshipReport {
    id: string;
    scholarship_id: string;
    reported_by?: string | null;
    report_type: string;
    description: string;
    status: 'open' | 'under_review' | 'resolved' | 'dismissed';
    reviewed_by?: string | null;
    reviewed_at?: string | null;
    created_at: string;
    scholarship?: Scholarship;
}
export interface AdminAuditLog {
    id: string;
    admin_id?: string | null;
    action: string;
    entity_type: string;
    entity_id?: string | null;
    old_values?: any;
    new_values?: any;
    ip_hash?: string | null;
    user_agent?: string | null;
    created_at: string;
}
