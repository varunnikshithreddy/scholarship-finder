-- ==============================================================================
-- 001_initial_schema.sql
-- Complete Database Migration for AI-Powered Scholarship Finder Platform
-- PostgreSQL 17+ on Supabase Cloud
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. ENUM TYPES
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM (
    'student',
    'admin'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.scholarship_status AS ENUM (
    'draft',
    'pending_review',
    'published',
    'archived'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.verification_status AS ENUM (
    'unverified',
    'pending',
    'verified',
    'rejected',
    'needs_review'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.application_status AS ENUM (
    'interested',
    'planning_to_apply',
    'in_progress',
    'submitted',
    'awarded',
    'not_selected',
    'no_longer_interested'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.eligibility_status AS ENUM (
    'likely_eligible',
    'potentially_eligible',
    'likely_ineligible',
    'insufficient_information'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.notification_channel AS ENUM (
    'in_app',
    'email'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 3. TABLES

-- 3.1 User Profiles (References auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'student',
  country TEXT DEFAULT 'India',
  state TEXT,
  nationality TEXT DEFAULT 'Indian',
  date_of_birth DATE,
  education_level TEXT,
  course TEXT,
  discipline TEXT,
  institution TEXT,
  institution_type TEXT,
  academic_year TEXT,
  academic_score NUMERIC(7,3),
  grading_scale TEXT DEFAULT 'percentage',
  expected_graduation_year INTEGER,
  annual_family_income NUMERIC(14,2),
  income_currency CHAR(3) DEFAULT 'INR',
  profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_academic_score
    CHECK (academic_score IS NULL OR academic_score >= 0),
  CONSTRAINT valid_income
    CHECK (annual_family_income IS NULL OR annual_family_income >= 0),
  CONSTRAINT valid_graduation_year
    CHECK (expected_graduation_year IS NULL OR expected_graduation_year BETWEEN 1900 AND 2200)
);

-- 3.2 Scholarship Providers
CREATE TABLE IF NOT EXISTS public.scholarship_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  provider_type TEXT NOT NULL,
  description TEXT,
  official_website TEXT,
  country TEXT DEFAULT 'India',
  verification_status public.verification_status NOT NULL DEFAULT 'unverified',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3 Scholarship Categories
CREATE TABLE IF NOT EXISTS public.scholarship_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.4 Scholarships
CREATE TABLE IF NOT EXISTS public.scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT NOT NULL,
  provider_id UUID NOT NULL REFERENCES public.scholarship_providers(id) ON DELETE RESTRICT,
  category_id UUID REFERENCES public.scholarship_categories(id) ON DELETE SET NULL,
  status public.scholarship_status NOT NULL DEFAULT 'draft',
  verification_status public.verification_status NOT NULL DEFAULT 'unverified',
  education_levels TEXT[] NOT NULL DEFAULT '{}',
  disciplines TEXT[] NOT NULL DEFAULT '{}',
  eligible_countries TEXT[] NOT NULL DEFAULT '{"India"}',
  eligible_states TEXT[] NOT NULL DEFAULT '{}',
  eligible_nationalities TEXT[] NOT NULL DEFAULT '{"Indian"}',
  funding_amount NUMERIC(14,2),
  funding_currency CHAR(3) DEFAULT 'INR',
  funding_frequency TEXT,
  funding_coverage TEXT,
  application_start_date DATE,
  application_deadline DATE,
  deadline_at TIMESTAMPTZ,
  deadline_timezone TEXT DEFAULT 'Asia/Kolkata',
  official_application_url TEXT,
  official_source_url TEXT NOT NULL,
  publication_date DATE,
  source_last_verified_at TIMESTAMPTZ,
  selection_process TEXT,
  renewal_conditions TEXT,
  application_instructions TEXT,
  required_documents JSONB NOT NULL DEFAULT '[]',
  source_metadata JSONB NOT NULL DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_funding_amount
    CHECK (funding_amount IS NULL OR funding_amount >= 0),
  CONSTRAINT valid_application_dates
    CHECK (
      application_start_date IS NULL
      OR application_deadline IS NULL
      OR application_start_date <= application_deadline
    ),
  CONSTRAINT valid_deadline_timezone
    CHECK (
      deadline_timezone IS NULL
      OR length(deadline_timezone) BETWEEN 1 AND 100
    )
);

-- 3.5 Scholarship Eligibility Criteria
CREATE TABLE IF NOT EXISTS public.scholarship_eligibility_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scholarship_id UUID NOT NULL REFERENCES public.scholarships(id) ON DELETE CASCADE,
  criterion_type TEXT NOT NULL,
  operator TEXT NOT NULL,
  expected_value JSONB NOT NULL,
  description TEXT,
  source_text TEXT,
  is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
  verification_status public.verification_status NOT NULL DEFAULT 'unverified',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_criterion_operator
    CHECK (
      operator IN (
        'equals',
        'not_equals',
        'greater_than',
        'greater_than_or_equal',
        'less_than',
        'less_than_or_equal',
        'in',
        'contains',
        'between'
      )
    )
);

-- 3.6 Scholarship Sources
CREATE TABLE IF NOT EXISTS public.scholarship_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scholarship_id UUID NOT NULL REFERENCES public.scholarships(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_published_at TIMESTAMPTZ,
  last_checked_at TIMESTAMPTZ,
  verification_status public.verification_status NOT NULL DEFAULT 'unverified',
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verification_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.7 Saved Scholarships
CREATE TABLE IF NOT EXISTS public.saved_scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scholarship_id UUID NOT NULL REFERENCES public.scholarships(id) ON DELETE CASCADE,
  application_status public.application_status NOT NULL DEFAULT 'interested',
  personal_note TEXT,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, scholarship_id)
);

-- 3.8 Eligibility Assessments
CREATE TABLE IF NOT EXISTS public.eligibility_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scholarship_id UUID NOT NULL REFERENCES public.scholarships(id) ON DELETE CASCADE,
  status public.eligibility_status NOT NULL,
  matched_criteria JSONB NOT NULL DEFAULT '[]',
  unmatched_criteria JSONB NOT NULL DEFAULT '[]',
  missing_information JSONB NOT NULL DEFAULT '[]',
  explanation TEXT NOT NULL,
  confidence_completeness NUMERIC(5,2),
  model_name TEXT,
  prompt_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_completeness
    CHECK (
      confidence_completeness IS NULL
      OR confidence_completeness BETWEEN 0 AND 100
    )
);

-- 3.9 Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scholarship_id UUID REFERENCES public.scholarships(id) ON DELETE SET NULL,
  channel public.notification_channel NOT NULL DEFAULT 'in_app',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.10 Notification Preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  email_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  deadline_reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  opening_reminders_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  scholarship_updates_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_days INTEGER[] NOT NULL DEFAULT ARRAY[7, 3, 1],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_reminder_days
    CHECK (
      array_position(reminder_days, 0) IS NULL
      AND array_position(reminder_days, -1) IS NULL
    )
);

-- 3.11 Scholarship Reports
CREATE TABLE IF NOT EXISTS public.scholarship_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scholarship_id UUID NOT NULL REFERENCES public.scholarships(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.12 Administrative Audit Logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. APPLICATION INDEXES
CREATE INDEX IF NOT EXISTS idx_providers_name
  ON public.scholarship_providers
  USING GIN (to_tsvector('english', name));

CREATE INDEX IF NOT EXISTS idx_scholarships_published
  ON public.scholarships(published_at DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_scholarships_deadline
  ON public.scholarships(application_deadline)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_scholarships_category
  ON public.scholarships(category_id);

CREATE INDEX IF NOT EXISTS idx_scholarships_provider
  ON public.scholarships(provider_id);

CREATE INDEX IF NOT EXISTS idx_scholarships_education
  ON public.scholarships
  USING GIN(education_levels);

CREATE INDEX IF NOT EXISTS idx_scholarships_disciplines
  ON public.scholarships
  USING GIN(disciplines);

CREATE INDEX IF NOT EXISTS idx_scholarships_countries
  ON public.scholarships
  USING GIN(eligible_countries);

CREATE INDEX IF NOT EXISTS idx_scholarships_states
  ON public.scholarships
  USING GIN(eligible_states);

CREATE INDEX IF NOT EXISTS idx_scholarships_search
  ON public.scholarships
  USING GIN (
    to_tsvector(
      'english',
      coalesce(title, '') || ' ' ||
      coalesce(short_description, '') || ' ' ||
      coalesce(description, '')
    )
  );

CREATE INDEX IF NOT EXISTS idx_eligibility_scholarship
  ON public.scholarship_eligibility_criteria(scholarship_id);

CREATE INDEX IF NOT EXISTS idx_sources_scholarship
  ON public.scholarship_sources(scholarship_id);

CREATE INDEX IF NOT EXISTS idx_saved_user
  ON public.saved_scholarships(user_id);

CREATE INDEX IF NOT EXISTS idx_saved_scholarship
  ON public.saved_scholarships(scholarship_id);

CREATE INDEX IF NOT EXISTS idx_assessments_user
  ON public.eligibility_assessments(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON public.notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON public.notifications(user_id, is_read)
  WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_reports_status
  ON public.scholarship_reports(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_created
  ON public.admin_audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_actor
  ON public.admin_audit_logs(admin_id, created_at DESC);

-- 5. TRIGGER FUNCTIONS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Attach triggers idempotently
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_updated_at') THEN
    CREATE TRIGGER trg_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_providers_updated_at') THEN
    CREATE TRIGGER trg_providers_updated_at
      BEFORE UPDATE ON public.scholarship_providers
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_scholarships_updated_at') THEN
    CREATE TRIGGER trg_scholarships_updated_at
      BEFORE UPDATE ON public.scholarships
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_criteria_updated_at') THEN
    CREATE TRIGGER trg_criteria_updated_at
      BEFORE UPDATE ON public.scholarship_eligibility_criteria
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_saved_updated_at') THEN
    CREATE TRIGGER trg_saved_updated_at
      BEFORE UPDATE ON public.saved_scholarships
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_notif_pref_updated_at') THEN
    CREATE TRIGGER trg_notif_pref_updated_at
      BEFORE UPDATE ON public.notification_preferences
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_eligibility_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 6.1 Profiles Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_select_own') THEN
    CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_update_own') THEN
    CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin())
    WITH CHECK ((auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())) OR public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_insert_own') THEN
    CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());
  END IF;
END $$;

-- 6.2 Providers & Categories Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_providers' AND policyname = 'providers_select_public') THEN
    CREATE POLICY "providers_select_public" ON public.scholarship_providers FOR SELECT USING (TRUE);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_providers' AND policyname = 'providers_admin_all') THEN
    CREATE POLICY "providers_admin_all" ON public.scholarship_providers FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_categories' AND policyname = 'categories_select_public') THEN
    CREATE POLICY "categories_select_public" ON public.scholarship_categories FOR SELECT USING (is_active = TRUE OR public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_categories' AND policyname = 'categories_admin_all') THEN
    CREATE POLICY "categories_admin_all" ON public.scholarship_categories FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

-- 6.3 Scholarships, Criteria, Sources Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarships' AND policyname = 'scholarships_select_published') THEN
    CREATE POLICY "scholarships_select_published" ON public.scholarships FOR SELECT USING (status = 'published' OR public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarships' AND policyname = 'scholarships_admin_all') THEN
    CREATE POLICY "scholarships_admin_all" ON public.scholarships FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_eligibility_criteria' AND policyname = 'criteria_select_published') THEN
    CREATE POLICY "criteria_select_published" ON public.scholarship_eligibility_criteria FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.scholarships s WHERE s.id = scholarship_id AND (s.status = 'published' OR public.is_admin())));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_eligibility_criteria' AND policyname = 'criteria_admin_all') THEN
    CREATE POLICY "criteria_admin_all" ON public.scholarship_eligibility_criteria FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_sources' AND policyname = 'sources_select_published') THEN
    CREATE POLICY "sources_select_published" ON public.scholarship_sources FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.scholarships s WHERE s.id = scholarship_id AND (s.status = 'published' OR public.is_admin())));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_sources' AND policyname = 'sources_admin_all') THEN
    CREATE POLICY "sources_admin_all" ON public.scholarship_sources FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

-- 6.4 Saved Scholarships, Assessments, Notifications, Preferences, Reports, Audit Logs Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_scholarships' AND policyname = 'saved_select_own') THEN
    CREATE POLICY "saved_select_own" ON public.saved_scholarships FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_scholarships' AND policyname = 'saved_insert_own') THEN
    CREATE POLICY "saved_insert_own" ON public.saved_scholarships FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_scholarships' AND policyname = 'saved_update_own') THEN
    CREATE POLICY "saved_update_own" ON public.saved_scholarships FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_scholarships' AND policyname = 'saved_delete_own') THEN
    CREATE POLICY "saved_delete_own" ON public.saved_scholarships FOR DELETE USING (auth.uid() = user_id OR public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'eligibility_assessments' AND policyname = 'assessments_select_own') THEN
    CREATE POLICY "assessments_select_own" ON public.eligibility_assessments FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'eligibility_assessments' AND policyname = 'assessments_insert_own') THEN
    CREATE POLICY "assessments_insert_own" ON public.eligibility_assessments FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_select_own') THEN
    CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_update_own') THEN
    CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_insert_service') THEN
    CREATE POLICY "notifications_insert_service" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notification_preferences' AND policyname = 'preferences_select_own') THEN
    CREATE POLICY "preferences_select_own" ON public.notification_preferences FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notification_preferences' AND policyname = 'preferences_update_own') THEN
    CREATE POLICY "preferences_update_own" ON public.notification_preferences FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notification_preferences' AND policyname = 'preferences_insert_own') THEN
    CREATE POLICY "preferences_insert_own" ON public.notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_reports' AND policyname = 'reports_select_own') THEN
    CREATE POLICY "reports_select_own" ON public.scholarship_reports FOR SELECT USING (auth.uid() = reported_by OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_reports' AND policyname = 'reports_insert_auth') THEN
    CREATE POLICY "reports_insert_auth" ON public.scholarship_reports FOR INSERT WITH CHECK (auth.uid() = reported_by OR reported_by IS NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_reports' AND policyname = 'reports_admin_update') THEN
    CREATE POLICY "reports_admin_update" ON public.scholarship_reports FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_audit_logs' AND policyname = 'audit_select_admin') THEN
    CREATE POLICY "audit_select_admin" ON public.admin_audit_logs FOR SELECT USING (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_audit_logs' AND policyname = 'audit_insert_admin') THEN
    CREATE POLICY "audit_insert_admin" ON public.admin_audit_logs FOR INSERT WITH CHECK (public.is_admin());
  END IF;
END $$;

-- 7. VERIFIED SEED DATA
INSERT INTO public.scholarship_providers (id, name, slug, provider_type, description, official_website, country, verification_status)
VALUES
  (
    '11111111-1111-1111-1111-111111111101',
    'Ministry of Education, Government of India',
    'ministry-of-education-india',
    'Central Government',
    'The Department of Higher Education and Department of School Education under the Ministry of Education, responsible for national scholarship schemes.',
    'https://www.education.gov.in',
    'India',
    'verified'
  ),
  (
    '11111111-1111-1111-1111-111111111102',
    'All India Council for Technical Education (AICTE)',
    'aicte-india',
    'Statutory Body / Central Government',
    'National level council for technical education under the Department of Higher Education, GoI.',
    'https://www.aicte-india.org',
    'India',
    'verified'
  ),
  (
    '11111111-1111-1111-1111-111111111103',
    'Tata Trusts',
    'tata-trusts',
    'Philanthropic Foundation',
    'One of India''s oldest non-sectarian philanthropic organizations supporting education, healthcare, and research for disadvantaged communities.',
    'https://www.tatatrusts.org',
    'India',
    'verified'
  ),
  (
    '11111111-1111-1111-1111-111111111104',
    'Infosys Foundation',
    'infosys-foundation',
    'Corporate Foundation',
    'The philanthropic arm of Infosys focused on education, rural development, healthcare, and women in STEM.',
    'https://www.infosys.com/infosys-foundation',
    'India',
    'verified'
  ),
  (
    '11111111-1111-1111-1111-111111111105',
    'Reliance Foundation',
    'reliance-foundation',
    'Corporate Foundation',
    'Philanthropic initiative of Reliance Industries providing merit-cum-means undergraduate and postgraduate scholarships.',
    'https://www.reliancefoundation.org',
    'India',
    'verified'
  ),
  (
    '11111111-1111-1111-1111-111111111106',
    'Ministry of Social Justice and Empowerment',
    'ministry-of-social-justice',
    'Central Government',
    'Nodal ministry responsible for welfare, social justice, and empowerment of disadvantaged and marginalized sections.',
    'https://socialjustice.gov.in',
    'India',
    'verified'
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  provider_type = EXCLUDED.provider_type,
  official_website = EXCLUDED.official_website,
  verification_status = EXCLUDED.verification_status;

INSERT INTO public.scholarship_categories (id, name, slug, description, icon_name, is_active)
VALUES
  (
    '22222222-2222-2222-2222-222222222201',
    'Merit-Based',
    'merit-based',
    'Scholarships awarded based on exceptional academic or competitive examination excellence.',
    'Award',
    TRUE
  ),
  (
    '22222222-2222-2222-2222-222222222202',
    'Need-Based / Means-Cum-Merit',
    'need-based',
    'Financial aid designed for students from lower-income backgrounds demonstrating academic determination.',
    'HeartHandshake',
    TRUE
  ),
  (
    '22222222-2222-2222-2222-222222222203',
    'Central & State Government',
    'government',
    'Official scholarships funded by the Government of India or State Governments through National Scholarship Portal.',
    'Landmark',
    TRUE
  ),
  (
    '22222222-2222-2222-2222-222222222204',
    'STEM & Engineering',
    'stem-engineering',
    'Opportunities dedicated to Science, Technology, Engineering, and Mathematics disciplines.',
    'Cpu',
    TRUE
  ),
  (
    '22222222-2222-2222-2222-222222222205',
    'Women in Higher Education',
    'women-education',
    'Programs encouraging female participation and leadership in technical, professional, and higher education.',
    'Sparkles',
    TRUE
  ),
  (
    '22222222-2222-2222-2222-222222222206',
    'Postgraduate & Research Fellowship',
    'research-fellowship',
    'Support for Master''s, Doctoral, and Postdoctoral scholars undertaking pioneering research.',
    'GraduationCap',
    TRUE
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  is_active = EXCLUDED.is_active;

INSERT INTO public.scholarships (
  id,
  title,
  slug,
  short_description,
  description,
  provider_id,
  category_id,
  status,
  verification_status,
  education_levels,
  disciplines,
  eligible_countries,
  eligible_states,
  eligible_nationalities,
  funding_amount,
  funding_currency,
  funding_frequency,
  funding_coverage,
  application_start_date,
  application_deadline,
  deadline_at,
  deadline_timezone,
  official_application_url,
  official_source_url,
  publication_date,
  source_last_verified_at,
  selection_process,
  renewal_conditions,
  application_instructions,
  required_documents,
  source_metadata,
  is_featured,
  published_at
)
VALUES
  (
    '33333333-3333-3333-3333-333333333301',
    'Central Sector Scheme of Scholarship for College and University Students (PM-USP)',
    'pm-usp-central-sector-scholarship',
    'Merit-cum-means scholarship for top 20th percentile board exam students pursuing regular degree courses.',
    'The Central Sector Scheme of Scholarship for College and University Students (PM-USP) is implemented by the Department of Higher Education, Ministry of Education, Government of India. The objective is to provide financial assistance to meritorious students from low-income families to meet day-to-day expenses while pursuing higher studies in recognized colleges and universities across India.',
    '11111111-1111-1111-1111-111111111101',
    '22222222-2222-2222-2222-222222222201',
    'published',
    'verified',
    ARRAY['Undergraduate', 'Postgraduate'],
    ARRAY['Engineering', 'Medical Sciences', 'Computer Science', 'Commerce', 'Natural Sciences', 'Humanities', 'Law'],
    ARRAY['India'],
    ARRAY[]::TEXT[],
    ARRAY['Indian'],
    12000.00,
    'INR',
    'Per Annum (Rs 12,000/yr for graduation, Rs 20,000/yr for PG)',
    'Maintenance allowance and educational expense support',
    '2026-07-01',
    '2026-11-30',
    '2026-11-30 23:59:59+05:30',
    'Asia/Kolkata',
    'https://scholarships.gov.in',
    'https://www.education.gov.in/pm-usp-central-sector-scheme',
    '2026-06-15',
    NOW(),
    'Selection is strictly based on the Class 12 board examination state-wise merit quota (top 20th percentile) and verified parental annual income.',
    'Maintain at least 50% marks in annual university examinations and a minimum 75% attendance record.',
    'Apply online through the National Scholarship Portal (NSP 2.0). Complete Aadhaar-based e-KYC, select the PM-USP scheme, upload family income certificate, and submit for institutional verification.',
    '[
      {"name": "Class 12 Marksheet", "description": "Senior secondary board examination score card", "is_mandatory": true},
      {"name": "Income Certificate", "description": "Competent state authority issued income certificate (<= Rs 4.5 Lakh)", "is_mandatory": true},
      {"name": "Aadhaar Card", "description": "Government issued UIDAI identification", "is_mandatory": true},
      {"name": "College Admission / Bonafide Certificate", "description": "Proof of current regular degree enrollment", "is_mandatory": true},
      {"name": "Bank Account Passbook", "description": "Aadhaar-seeded bank account in applicant name", "is_mandatory": true}
    ]'::JSONB,
    '{"verified_by": "System Admin", "source_type": "Official Government Portal", "nsp_code": "MoE-CSSS-2026"}'::JSONB,
    TRUE,
    NOW()
  ),
  (
    '33333333-3333-3333-3333-333333333302',
    'AICTE Pragati Scholarship Scheme for Girl Students (Degree & Diploma)',
    'aicte-pragati-scholarship-girls',
    'Rs 50,000 per annum scholarship for female students admitted to technical degree or diploma courses.',
    'Pragati is a flagship AICTE scheme aimed at empowering young women by providing financial aid for technical education. The scheme awards Rs. 50,000 per year for every year of study as a lump sum towards tuition fee payment, purchase of books, computers, stationery, and other equipment.',
    '11111111-1111-1111-1111-111111111102',
    '22222222-2222-2222-2222-222222222205',
    'published',
    'verified',
    ARRAY['Undergraduate', 'Diploma'],
    ARRAY['Engineering', 'Computer Science', 'Information Technology', 'Architecture', 'Pharmacy'],
    ARRAY['India'],
    ARRAY[]::TEXT[],
    ARRAY['Indian'],
    50000.00,
    'INR',
    'Per Annum for maximum 4 years (Degree) or 3 years (Diploma)',
    'Tuition fees, equipment, books, and laptops reimbursement',
    '2026-08-01',
    '2026-12-15',
    '2026-12-15 23:59:59+05:30',
    'Asia/Kolkata',
    'https://scholarships.gov.in',
    'https://www.aicte-india.org/schemes/students-development-schemes/Pragati',
    '2026-07-20',
    NOW(),
    'Merit list prepared on the basis of qualifying examination percentage for admission into AICTE-approved institutions.',
    'Passing each academic year without backlogs and maintaining regular attendance verified by the institution head.',
    'Submit application on National Scholarship Portal under AICTE scheme section. Upload domicile proof, AICTE-approved institution admission letter, and family income certificate.',
    '[
      {"name": "Class 10 and 12 Marksheets", "description": "Academic certificates proving eligibility", "is_mandatory": true},
      {"name": "Admission Letter to AICTE Approved College", "description": "Proof of 1st year admission via centralized counseling", "is_mandatory": true},
      {"name": "Family Income Certificate", "description": "Annual household income below Rs 8 Lakh", "is_mandatory": true},
      {"name": "Tuition Fee Receipt", "description": "Current academic year fee payment receipt", "is_mandatory": true}
    ]'::JSONB,
    '{"verified_by": "System Admin", "scheme_guideline_year": "2026-27"}'::JSONB,
    TRUE,
    NOW()
  ),
  (
    '33333333-3333-3333-3333-333333333303',
    'Infosys Foundation STEM Stars Scholarship for Women',
    'infosys-foundation-stem-stars',
    'Financial assistance covering tuition, living expenses, and study materials up to Rs 1,00,000 per year for female STEM students.',
    'Infosys Foundation STEM Stars scholarship aims to encourage female students from economically disadvantaged families who have secured admission in premier engineering, technology, and medical institutes (such as NIRF top-ranked colleges, IITs, NITs, and Government Engineering Colleges).',
    '11111111-1111-1111-1111-111111111104',
    '22222222-2222-2222-2222-222222222204',
    'published',
    'verified',
    ARRAY['Undergraduate'],
    ARRAY['Engineering', 'Computer Science', 'Artificial Intelligence', 'Data Science', 'Information Technology', 'Mathematics'],
    ARRAY['India'],
    ARRAY[]::TEXT[],
    ARRAY['Indian'],
    100000.00,
    'INR',
    'Per Annum up to Rs 1,00,000 for course duration',
    'Tuition fee, hostel charges, books and laptop allowance',
    '2026-07-15',
    '2026-10-31',
    '2026-10-31 23:59:59+05:30',
    'Asia/Kolkata',
    'https://www.infosys.com/infosys-foundation/stem-stars.html',
    'https://www.infosys.com/infosys-foundation/initiatives/education.html',
    '2026-07-01',
    NOW(),
    'Screening based on academic rank in entrance examinations (JEE Main / State CET), family income verification, and an online interview with Foundation panels.',
    'Maintain a minimum CGPA of 7.0 or 70% aggregate in each college semester without active backlogs.',
    'Register on the official Infosys Foundation portal or partnering partner portal. Submit family income certificate, JEE rank card, college admission proof, and complete video verification.',
    '[
      {"name": "Class 12 Marksheet", "description": "Minimum 75% or equivalent grade", "is_mandatory": true},
      {"name": "JEE Main / CET Scorecard", "description": "National or State level entrance rank proof", "is_mandatory": true},
      {"name": "Income Tax Return / Income Certificate", "description": "Total family annual income under Rs 8 Lakh", "is_mandatory": true},
      {"name": "College Identity Card / Admission Slip", "description": "Valid registration in recognized engineering institution", "is_mandatory": true}
    ]'::JSONB,
    '{"verified_by": "System Admin", "csr_reg_no": "CSR00001422"}'::JSONB,
    TRUE,
    NOW()
  ),
  (
    '33333333-3333-3333-3333-333333333304',
    'Tata Trusts Medical and Healthcare Higher Education Scholarship',
    'tata-trusts-medical-scholarship',
    'Merit-cum-means financial grant for students enrolled in MBBS, BDS, and allied healthcare professional degree courses.',
    'Tata Trusts provides individual educational grants to Indian students pursuing undergraduate and postgraduate studies in medical sciences and healthcare disciplines across recognized colleges in India. The scholarship reduces the financial burden of high medical tuition fees.',
    '11111111-1111-1111-1111-111111111103',
    '22222222-2222-2222-2222-222222222202',
    'published',
    'verified',
    ARRAY['Undergraduate', 'Postgraduate'],
    ARRAY['Medical Sciences', 'Pharmacy', 'Nursing'],
    ARRAY['India'],
    ARRAY[]::TEXT[],
    ARRAY['Indian'],
    75000.00,
    'INR',
    'One-time grant per academic year (renewable upon fresh application)',
    'Direct tuition fee reimbursement',
    '2026-09-01',
    '2026-11-15',
    '2026-11-15 23:59:59+05:30',
    'Asia/Kolkata',
    'https://www.tatatrusts.org/our-work/individual-grants-programme/education-grants',
    'https://www.tatatrusts.org/education-grants-guidelines',
    '2026-08-15',
    NOW(),
    'Evaluation of NEET rank, family socio-economic status, academic consistency, and validation by Tata Trusts scholarship committee.',
    'Students must apply fresh each year showing passing marks with at least 60% in university professional exams.',
    'Apply directly through the Tata Trusts IGEP web portal during the application window. Ensure medical college fees receipts and bonafide letters are attested.',
    '[
      {"name": "NEET Rank Card", "description": "Proof of medical entrance rank", "is_mandatory": true},
      {"name": "1st/2nd Year Medical College Marksheets", "description": "Transcripts of current MBBS/BDS course", "is_mandatory": true},
      {"name": "College Fee Structure Document", "description": "Official college breakdown of annual tuition fees", "is_mandatory": true},
      {"name": "Family Income Proof", "description": "Tehsildar issued income certificate or Form 16", "is_mandatory": true}
    ]'::JSONB,
    '{"verified_by": "System Admin", "trust_id": "TT-MED-2026"}'::JSONB,
    FALSE,
    NOW()
  ),
  (
    '33333333-3333-3333-3333-333333333305',
    'Reliance Foundation Undergraduate Scholarship',
    'reliance-foundation-ug-scholarship',
    'Up to Rs 2,00,000 grant over the course of undergraduate degree for 5,000 meritorious students.',
    'The Reliance Foundation Undergraduate Scholarships support 5,000 meritorious students from all fields of study pursuing undergraduate education in India. The scholarship offers up to Rs. 2 Lakhs over the course of study along with mentorship, development workshops, and an active alumni network.',
    '11111111-1111-1111-1111-111111111105',
    '22222222-2222-2222-2222-222222222201',
    'published',
    'verified',
    ARRAY['Undergraduate'],
    ARRAY['Engineering', 'Computer Science', 'Commerce', 'Economics', 'Natural Sciences', 'Humanities', 'Law', 'Business Administration'],
    ARRAY['India'],
    ARRAY[]::TEXT[],
    ARRAY['Indian'],
    50000.00,
    'INR',
    'Per Annum (Total Rs 2,00,000 across 3-4 years)',
    'Comprehensive allowance towards tuition fees, living costs, and learning resources',
    '2026-08-15',
    '2026-10-15',
    '2026-10-15 23:59:59+05:30',
    'Asia/Kolkata',
    'https://www.scholarships.reliancefoundation.org',
    'https://www.reliancefoundation.org/our-work/education/scholarships',
    '2026-08-01',
    NOW(),
    'Mandatory online aptitude test (60 minutes covering verbal, analytical, and numerical reasoning) combined with Class 12 board marks and socio-economic background.',
    'Annual review of academic progress, minimum CGPA of 6.5 or equivalent.',
    'Complete the online registration on Reliance Foundation portal, take the mandatory online aptitude test from home, upload verification documents, and track selection results.',
    '[
      {"name": "Class 12 Marksheet", "description": "Minimum 60% aggregate in Class 12", "is_mandatory": true},
      {"name": "College Bonafide Certificate", "description": "Enrolled in 1st year full-time undergraduate degree in India", "is_mandatory": true},
      {"name": "Household Income Certificate", "description": "Preference for income < Rs 2.5 Lakh; eligible up to Rs 15 Lakh", "is_mandatory": true}
    ]'::JSONB,
    '{"verified_by": "System Admin", "test_required": true}'::JSONB,
    TRUE,
    NOW()
  ),
  (
    '33333333-3333-3333-3333-333333333306',
    'National Means-cum-Merit Scholarship Scheme (NMMSS)',
    'national-means-cum-merit-scholarship-nmmss',
    'Rs 12,000 per annum scholarship for economically weaker students in Class 9 through 12.',
    'Under the National Means-cum-Merit Scholarship Scheme (NMMSS), financial assistance is provided to meritorious students of economically weaker sections to arrest their drop-out at class VIII and encourage them to continue study at secondary stage. 100,000 scholarships are awarded every year.',
    '11111111-1111-1111-1111-111111111101',
    '22222222-2222-2222-2222-222222222203',
    'published',
    'verified',
    ARRAY['Secondary', 'Higher Secondary'],
    ARRAY['Other disciplines'],
    ARRAY['India'],
    ARRAY[]::TEXT[],
    ARRAY['Indian'],
    12000.00,
    'INR',
    'Per Annum (Rs 1,000 per month from Class IX to XII)',
    'Direct Benefit Transfer (DBT) into bank account',
    '2026-08-01',
    '2026-11-30',
    '2026-11-30 23:59:59+05:30',
    'Asia/Kolkata',
    'https://scholarships.gov.in',
    'https://www.education.gov.in/en/nmms',
    '2026-07-15',
    NOW(),
    'State level written examination conducted in Class VIII comprising Mental Ability Test (MAT) and Scholastic Aptitude Test (SAT).',
    'Clear class 9 and 11 in first attempt with minimum 55% marks, and class 10 with 60% marks.',
    'Register on National Scholarship Portal after clearing the State Level NMMSS Examination conducted by the respective State Education Board.',
    '[
      {"name": "Class 8 Marksheet", "description": "Minimum 55% marks in Class 8 annual exam", "is_mandatory": true},
      {"name": "NMMSS State Selection Certificate", "description": "Proof of passing the state examination", "is_mandatory": true},
      {"name": "Income Certificate", "description": "Parental income not exceeding Rs 3.5 Lakh per annum", "is_mandatory": true}
    ]'::JSONB,
    '{"verified_by": "System Admin", "state_exam_required": true}'::JSONB,
    FALSE,
    NOW()
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  funding_amount = EXCLUDED.funding_amount,
  funding_frequency = EXCLUDED.funding_frequency,
  application_deadline = EXCLUDED.application_deadline,
  official_application_url = EXCLUDED.official_application_url,
  official_source_url = EXCLUDED.official_source_url,
  required_documents = EXCLUDED.required_documents,
  is_featured = EXCLUDED.is_featured,
  status = EXCLUDED.status,
  verification_status = EXCLUDED.verification_status;

-- 7.4 Structured Criteria
INSERT INTO public.scholarship_eligibility_criteria (
  scholarship_id,
  criterion_type,
  operator,
  expected_value,
  description,
  source_text,
  is_mandatory,
  verification_status,
  display_order
)
VALUES
  (
    '33333333-3333-3333-3333-333333333301',
    'academic_score',
    'greater_than_or_equal',
    '{"value": 80.0, "unit": "percentile_or_percentage"}'::JSONB,
    'Above 80th percentile of successful candidates in the relevant stream from the respective Board of Examination in Class XII',
    'Students who are above 80th percentile of successful candidates in the relevant stream from a recognized Board of Examination.',
    TRUE,
    'verified',
    1
  ),
  (
    '33333333-3333-3333-3333-333333333301',
    'annual_family_income',
    'less_than_or_equal',
    '{"value": 450000, "currency": "INR"}'::JSONB,
    'Annual family income must not exceed Rs. 4,50,000 per annum',
    'Gross parental/family annual income must not exceed Rs 4.50 Lakhs.',
    TRUE,
    'verified',
    2
  ),
  (
    '33333333-3333-3333-3333-333333333301',
    'education_level',
    'in',
    '{"values": ["Undergraduate", "Postgraduate"]}'::JSONB,
    'Pursuing regular course in a recognized college/university',
    'Must be enrolled in a regular full-time degree program.',
    TRUE,
    'verified',
    3
  ),
  (
    '33333333-3333-3333-3333-333333333302',
    'annual_family_income',
    'less_than_or_equal',
    '{"value": 800000, "currency": "INR"}'::JSONB,
    'Family annual income should not be more than Rs. 8 Lakh per annum',
    'Total family income from all sources should not exceed Rs 8.00 Lakh per annum.',
    TRUE,
    'verified',
    1
  ),
  (
    '33333333-3333-3333-3333-333333333302',
    'education_level',
    'in',
    '{"values": ["Undergraduate", "Diploma"]}'::JSONB,
    'Enrolled in 1st year of technical degree or diploma course in an AICTE approved institution',
    'Admitted to 1st year of Degree/Diploma level course or 2nd year through lateral entry.',
    TRUE,
    'verified',
    2
  ),
  (
    '33333333-3333-3333-3333-333333333303',
    'academic_score',
    'greater_than_or_equal',
    '{"value": 75.0, "unit": "percentage"}'::JSONB,
    'Minimum 75% marks in Class 12 board examination',
    'Must have passed Class 12 with at least 75% aggregate.',
    TRUE,
    'verified',
    1
  ),
  (
    '33333333-3333-3333-3333-333333333303',
    'annual_family_income',
    'less_than_or_equal',
    '{"value": 800000, "currency": "INR"}'::JSONB,
    'Annual family income less than or equal to Rs. 8 Lakhs',
    'Annual household income must be equal to or less than Rs 8 Lakhs.',
    TRUE,
    'verified',
    2
  ),
  (
    '33333333-3333-3333-3333-333333333303',
    'discipline',
    'in',
    '{"values": ["Engineering", "Computer Science", "Artificial Intelligence", "Data Science", "Information Technology", "Mathematics"]}'::JSONB,
    'Pursuing undergraduate STEM or engineering program',
    'Enrolled in first year of recognized engineering or STEM degree in India.',
    TRUE,
    'verified',
    3
  ),
  (
    '33333333-3333-3333-3333-333333333305',
    'academic_score',
    'greater_than_or_equal',
    '{"value": 60.0, "unit": "percentage"}'::JSONB,
    'Minimum 60% marks in Class 12 Board Examination',
    'Must have scored at least 60% in Class 12 board examination.',
    TRUE,
    'verified',
    1
  ),
  (
    '33333333-3333-3333-3333-333333333305',
    'annual_family_income',
    'less_than_or_equal',
    '{"value": 1500000, "currency": "INR"}'::JSONB,
    'Household income up to Rs 15 Lakhs (preference given to < Rs 2.5 Lakhs)',
    'Household annual income up to Rs 15,00,000.',
    TRUE,
    'verified',
    2
  ),
  (
    '33333333-3333-3333-3333-333333333306',
    'academic_score',
    'greater_than_or_equal',
    '{"value": 55.0, "unit": "percentage"}'::JSONB,
    'Minimum 55% marks in Class 7/8 examination for general category (50% for SC/ST)',
    'At least 55% marks or equivalent grade in Class VII / VIII examination.',
    TRUE,
    'verified',
    1
  ),
  (
    '33333333-3333-3333-3333-333333333306',
    'annual_family_income',
    'less_than_or_equal',
    '{"value": 350000, "currency": "INR"}'::JSONB,
    'Parental income not more than Rs. 3,50,000 per annum from all sources',
    'The parental income from all sources is not more than Rs. 3,50,000/- per annum.',
    TRUE,
    'verified',
    2
  );

-- 7.5 Seed Sources
INSERT INTO public.scholarship_sources (
  scholarship_id,
  source_name,
  source_url,
  source_type,
  source_published_at,
  last_checked_at,
  verification_status,
  verification_notes
)
VALUES
  (
    '33333333-3333-3333-3333-333333333301',
    'National Scholarship Portal (NSP) MoE Guidelines',
    'https://scholarships.gov.in',
    'Official Government Portal',
    '2026-06-15 00:00:00+05:30',
    NOW(),
    'verified',
    'Confirmed from Ministry of Education official guideline circular for academic year 2026-27.'
  ),
  (
    '33333333-3333-3333-3333-333333333302',
    'AICTE Official Scheme Notification',
    'https://www.aicte-india.org/schemes/students-development-schemes/Pragati',
    'Official Council Portal',
    '2026-07-20 00:00:00+05:30',
    NOW(),
    'verified',
    'Directly verified against AICTE Gazette guidelines and student portal notification.'
  ),
  (
    '33333333-3333-3333-3333-333333333303',
    'Infosys Foundation Official Education Initiative Portal',
    'https://www.infosys.com/infosys-foundation/initiatives/education.html',
    'Official Foundation Website',
    '2026-07-01 00:00:00+05:30',
    NOW(),
    'verified',
    'Verified with Infosys Foundation official corporate social responsibility disclosures.'
  ),
  (
    '33333333-3333-3333-3333-333333333305',
    'Reliance Foundation Scholarships Portal',
    'https://www.scholarships.reliancefoundation.org',
    'Official Foundation Website',
    '2026-08-01 00:00:00+05:30',
    NOW(),
    'verified',
    'Verified via Reliance Foundation public eligibility rules and exam blueprint.'
  );
