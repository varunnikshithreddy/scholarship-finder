import { UserRole } from './scholarship';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  country?: string | null;
  state?: string | null;
  nationality?: string | null;
  date_of_birth?: string | null;
  education_level?: string | null;
  course?: string | null;
  discipline?: string | null;
  institution?: string | null;
  institution_type?: string | null;
  academic_year?: string | null;
  academic_score?: number | null;
  grading_scale?: string | null;
  expected_graduation_year?: number | null;
  annual_family_income?: number | null;
  income_currency?: string | null;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfileInput {
  full_name?: string;
  country?: string;
  state?: string;
  nationality?: string;
  date_of_birth?: string;
  education_level?: string;
  course?: string;
  discipline?: string;
  institution?: string;
  institution_type?: string;
  academic_year?: string;
  academic_score?: number;
  grading_scale?: string;
  expected_graduation_year?: number;
  annual_family_income?: number;
  income_currency?: string;
}
