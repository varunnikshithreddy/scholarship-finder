import { EligibilityStatus } from './scholarship';
export interface MatchedCriterion {
    criterion_id: string;
    criterion: string;
    student_value: any;
    required_value: any;
    explanation: string;
}
export interface UnmatchedCriterion {
    criterion_id: string;
    criterion: string;
    student_value: any;
    required_value: any;
    explanation: string;
}
export interface MissingInformationItem {
    criterion_id?: string;
    field: string;
    reason: string;
}
export interface EligibilityAssessmentResult {
    id?: string;
    scholarship_id: string;
    user_id?: string;
    status: EligibilityStatus;
    matched_criteria: MatchedCriterion[];
    unmatched_criteria: UnmatchedCriterion[];
    missing_information: MissingInformationItem[];
    explanation: string;
    confidence_completeness: number;
    next_steps?: string[];
    disclaimer?: string;
    created_at?: string;
}
export interface RecommendationItem {
    scholarship_id: string;
    scholarship_title: string;
    provider_name: string;
    funding_amount?: number | null;
    application_deadline?: string | null;
    reasons: string[];
    matched_criteria: string[];
    missing_information: string[];
    application_status: string;
    explanation: string;
    official_source_url: string;
}
export interface AIChatMessage {
    id: string;
    sender: 'user' | 'assistant';
    content: string;
    timestamp: string;
    source_references?: {
        scholarship_id: string;
        title: string;
        source_url: string;
    }[];
    related_scholarships?: {
        id: string;
        title: string;
    }[];
}
