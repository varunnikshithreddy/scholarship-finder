# Database Schema & Data Dictionary

Database: **PostgreSQL (Supabase Cloud)**
Schema: `public`
Migration File: `/supabase/migrations/001_initial_schema.sql`

---

## 1. Tables Overview

| Table Name | Description | RLS Enabled |
| :--- | :--- | :---: |
| `profiles` | Extended student profile referencing `auth.users` | Yes |
| `scholarship_providers` | Government ministries, departments, and trusts | Yes |
| `scholarship_categories` | Academic classifications (Merit, STEM, Girls, Need) | Yes |
| `scholarships` | Core scholarship directory records | Yes |
| `scholarship_eligibility_criteria` | Granular structured rules evaluated deterministically | Yes |
| `scholarship_sources` | Official links, gazette publications, and check dates | Yes |
| `saved_scholarships` | User bookmarks with preparation notes & milestones | Yes |
| `eligibility_assessments` | History of student evaluation reports | Yes |
| `notifications` | In-app alerts, deadline reminders, and matches | Yes |
| `notification_preferences` | User delivery channels and reminder intervals | Yes |
| `scholarship_reports` | Community feedback on link changes and deadline updates | Yes |
| `admin_audit_logs` | Immutable audit trail for security and governance | Yes |

---

## 2. Key Relationships

- `profiles.id` &rarr; `auth.users.id` (ON DELETE CASCADE)
- `scholarships.provider_id` &rarr; `scholarship_providers.id` (ON DELETE RESTRICT)
- `scholarships.category_id` &rarr; `scholarship_categories.id` (ON DELETE SET NULL)
- `scholarship_eligibility_criteria.scholarship_id` &rarr; `scholarships.id` (ON DELETE CASCADE)
- `saved_scholarships.user_id` &rarr; `profiles.id` (ON DELETE CASCADE)
- `saved_scholarships.scholarship_id` &rarr; `scholarships.id` (ON DELETE CASCADE)
- `eligibility_assessments.scholarship_id` &rarr; `scholarships.id` (ON DELETE CASCADE)

---

## 3. Indexes & Performance

1. **Full-Text Search Index:**
   ```sql
   CREATE INDEX idx_scholarships_search
   ON public.scholarships
   USING GIN (
     to_tsvector(
       'english',
       coalesce(title, '') || ' ' ||
       coalesce(short_description, '') || ' ' ||
       coalesce(description, '')
     )
   );
   ```

2. **Array Indexes (Education Levels, Disciplines, States):**
   ```sql
   CREATE INDEX idx_scholarships_education ON public.scholarships USING GIN(education_levels);
   CREATE INDEX idx_scholarships_disciplines ON public.scholarships USING GIN(disciplines);
   CREATE INDEX idx_scholarships_countries ON public.scholarships USING GIN(eligible_countries);
   ```

3. **Status and Deadlines:**
   ```sql
   CREATE INDEX idx_scholarships_published ON public.scholarships(published_at DESC) WHERE status = 'published';
   CREATE INDEX idx_scholarships_deadline ON public.scholarships(application_deadline) WHERE status = 'published';
   ```

---

## 4. Automatic Triggers

- `handle_updated_at()`: Automatically sets `updated_at = NOW()` on row updates for all tables.
- `handle_new_user()`: Automatically creates a row in `public.profiles` when a new account is registered in Supabase `auth.users`.
