# Security Architecture & Data Isolation

## 1. Row Level Security (RLS) Implementation

RLS is enabled across all 12 tables in PostgreSQL. Access controls enforce data isolation directly at the database layer.

### 1.1 Non-Recursive Admin Authorization
To prevent infinite recursion in RLS policies that evaluate administrative roles:
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;
```

### 1.2 Table Isolation Rules
- **`profiles`:**
  - `SELECT`: Only row owner (`id = auth.uid()`) or admin.
  - `UPDATE`: Only row owner, with check ensuring role cannot be self-escalated.
- **`scholarships`:**
  - `SELECT`: Anonymous and authenticated users can view published records (`status = 'published'`). Draft/archived records are only readable by admins.
  - `INSERT / UPDATE / DELETE`: Restricted strictly to `is_admin() = TRUE`.
- **`saved_scholarships`:**
  - `ALL`: Strictly restricted to `user_id = auth.uid()`.
- **`eligibility_assessments`:**
  - `SELECT`: Restricted to `user_id = auth.uid()` or admin.
- **`notifications`:**
  - `SELECT / UPDATE`: Restricted to `user_id = auth.uid()`.
- **`admin_audit_logs`:**
  - Direct insertion or deletion by client accounts is completely blocked. Read access is restricted to authenticated admins.

---

## 2. API Security Controls

1. **Authentication Token Verification:**
   - Client passes Supabase Auth access JWT in `Authorization: Bearer <token>`.
   - Node.js backend verifies cryptographic signature using Supabase SDK.
   - User profile and authoritative role are resolved server-side.

2. **Input Validation (Zod):**
   - Every route validates `req.body`, `req.query`, and `req.params`.
   - Unexpected fields are stripped, and bounds (e.g. `pageSize <= 100`, `academic_score BETWEEN 0 AND 100`) are strictly enforced.

3. **Rate Limiting:**
   - Global rate limiter on standard routes: 100 requests per 15-minute window.
   - AI and assessment endpoints: 20 requests per minute per IP to mitigate abuse and protect inference cost.

4. **Prompt Injection Defenses:**
   - System prompts are strictly hardcoded server-side.
   - External scholarship descriptions and student messages are treated as untrusted data inputs.
   - Gemini API keys are never exposed to the frontend or browser network logs.
