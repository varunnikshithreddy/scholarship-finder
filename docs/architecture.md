# System Architecture: AI-Powered Scholarship Finder

## 1. High-Level Architectural Overview

Scholarship Finder is designed as a secure, distributed, modular full-stack web application tailored for high-accuracy scholarship discovery. The platform adheres to the principle of **strict factual provenance**: AI models are never treated as authoritative sources of truth for deadlines, eligibility rules, or application links. Instead, a **dual-layer architecture** couples a deterministic SQL/TypeScript business logic engine with Google Gemini 2.5 generative reasoning for student advisory explanations.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React 18 + Vite Frontend                        │
│  - Tailwind CSS Responsive Design System                               │
│  - TanStack Query (Server-State Cache & Invalidation)                  │
│  - React Router DOM (Guarded Public, Student, and Admin Subtrees)      │
│  - Supabase Auth Client                                                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / REST (Bearer JWT)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Node.js / Express Backend (v1)                     │
│  - Request Validation Middleware (Zod)                                 │
│  - Auth & Admin Authorization Middleware (Supabase JWT Verification)   │
│  - Rate Limiting Middleware (IP & Account level)                       │
│  - Standardized JSON Envelope Formatting & Error Handling              │
└───────────────┬───────────────────────────────┬────────────────────────┘
                │                               │
                ▼                               ▼
┌──────────────────────────────┐ ┌───────────────────────────────────────┐
│     Deterministic Engine     │ │   Gemini AI Advisory Service          │
│ - Strict Academic Thresholds │ │ - Official @google/genai SDK          │
│ - Income Ceiling Constraints │ │ - Constrained System Prompts          │
│ - Geographic/State Matching  │ │ - Structured Zod Output Validation    │
│ - Deadline Proximity Clocks  │ │ - Non-destructive Fallback Handlers   │
└───────────────┬──────────────┘ └───────────────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Supabase Cloud PostgreSQL                         │
│  - 12 Normalized Relational Tables                                     │
│  - Row Level Security (RLS) on all user-facing tables                  │
│  - Non-recursive `is_admin()` Security Definer Function                │
│  - GIN Full-Text Search Indexes & Triggers                             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Dual-Layer AI & Deterministic Engine

To prevent hallucination of critical educational opportunities:

1. **Layer 1: Deterministic Engine (`eligibilityEngine.service.ts`)**
   - Retrieves documented eligibility criteria rows directly from PostgreSQL (`scholarship_eligibility_criteria`).
   - Evaluates boolean and numeric operators (`equals`, `not_equals`, `greater_than`, `greater_than_or_equal`, `less_than`, `less_than_or_equal`, `in`, `contains`, `between`).
   - Identifies definitely matched criteria, definite disqualifiers, and missing student fields without sending sensitive profile data out of boundary.
   - Calculates baseline `status` (`likely_eligible`, `likely_ineligible`, `potentially_eligible`, `insufficient_information`).

2. **Layer 2: AI Synthesizer & Explainer (`gemini.service.ts`)**
   - Receives the deterministic evaluation results and structured scholarship summary.
   - Formulates clear, student-friendly explanations in plain English.
   - If Gemini is unreachable or offline, the platform automatically returns the deterministic result with a fallback advisory statement, ensuring 100% operational uptime.

---

## 3. Data Flow Workflows

### 3.1 Scholarship Discovery Flow
1. Guest or student visits `/scholarships` with optional filter parameters (search, category, education level, state, deadline).
2. Express controller parses query using `scholarshipFilterSchema` via Zod.
3. PostgreSQL executes indexed query filtering on `status = 'published'` with full-text search indexing on `title || short_description || description`.
4. Response returns sanitized scholarship cards with verified provider metadata.

### 3.2 AI Eligibility Evaluation Flow
1. Authenticated student selects a scholarship at `/eligibility-checker`.
2. Frontend submits user ID and optional what-if profile overrides to `POST /api/v1/eligibility/check`.
3. Backend fetches verified criteria rows and student profile.
4. Deterministic engine computes rule comparisons.
5. Gemini 2.5 generates contextual explanation.
6. The completed assessment is saved to `eligibility_assessments` and returned with an official source disclaimer.
