# AI-Powered Scholarship Finder Platform

A production-grade, full-stack, AI-powered scholarship discovery and eligibility advisory platform built for students in India seeking Central Government, State Government, Institutional, and top Foundation opportunities.

The platform couples a **deterministic SQL/TypeScript rule engine** with **Google Gemini 2.5 generative reasoning** to ensure factual scholarship accuracy, transparent eligibility evaluations, deadline tracking, and administrative governance.

---

## 🌟 Key Features

### 1. Scholarship Discovery & Advanced Search
- **Home & Catalog Directory:** Browse verified scholarships with full-text search, debounced filtering, and responsive pagination.
- **Multi-Factor Filtering:** Filter by academic level (School, Higher Secondary, Diploma, Undergraduate, Postgraduate, Doctoral), course discipline, state, merit/need type, and funding amount.
- **Verified Provenance:** Every scholarship displays its sponsoring organization, source verification badge, and direct link to the official government portal (`scholarships.gov.in`, `aicte-india.org`, `tatatrusts.org`, etc.).

### 2. Dual-Layer AI Eligibility Checker
- **Deterministic Rules Engine:** Compares student percentage/GPA, household income limits, state residency, and academic discipline against documented criteria without hallucination.
- **Gemini 2.5 Advisory Explanations:** Explains matching rules, missing documents, and recommended next steps in clear language with an official verification disclaimer.
- **Hypothetical What-If Testing:** Allows students to adjust test values to evaluate eligibility scenarios without altering their saved profile.

### 3. Student Dashboard & Application Tracker
- **Personalized Recommendations:** Dynamic matching algorithm with transparent match tags explaining why each program was suggested.
- **Saved Scholarships:** Application status tracking (`Interested`, `Planning to Apply`, `In Progress`, `Submitted`, `Awarded`, `Not Selected`) with private preparation notes.
- **Deadline Tracker:** Grouped by urgency: *Closing Today*, *Closing Within 7 Days*, *Closing Within 30 Days*, *Closing Later*, *Upcoming*, and *Expired*.
- **In-App Notifications:** Real-time deadline proximity alerts and opening window notifications.

### 4. Conversational AI Assistant
- Powered by official `@google/genai` SDK using Gemini 2.5 Flash.
- Answers questions regarding required documents, income certificate rules, and application procedures using verified database records as its grounded knowledge base.

### 5. Administrative Oversight & Governance
- **Catalog Management:** Create, edit, publish, unpublish, and archive scholarship records.
- **Source Verification:** Audit trail linking every listing to official gazette notices.
- **Community Accuracy Reports:** Review user-reported inaccuracies (e.g. deadline extensions, portal updates).
- **Audit Logs:** Immutable tracking of all administrative actions.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, TanStack Query, React Router DOM, Lucide React |
| **Backend** | Node.js, Express.js, TypeScript, Zod, Supabase JS SDK, `@google/genai` |
| **Database & Auth** | Supabase Cloud PostgreSQL, Supabase Auth, Row Level Security (RLS) |
| **Testing** | Vitest, Supertest, TypeScript compiler checks |

---

## 📋 Project Structure

```text
scholarship/
├── client/                     # React 18 + Vite frontend
│   ├── src/
│   │   ├── components/         # Reusable UI (common, scholarship, assistant, eligibility)
│   │   ├── contexts/           # AuthContext (Supabase Auth session & profile state)
│   │   ├── pages/
│   │   │   ├── public/         # Home, Directory, Details, Categories, About, Contact, Privacy, Terms
│   │   │   ├── auth/           # Login, Register
│   │   │   ├── student/        # Dashboard, Profile, EligibilityChecker, Recommendations, Saved, Deadlines, AIAssistant, Notifications, Settings
│   │   │   └── admin/          # AdminDashboard, AdminScholarships, Create/Edit, Sources, Reports, AuditLogs
│   │   └── services/           # API client and Supabase client
├── server/                     # Node.js + Express REST API
│   ├── src/
│   │   ├── controllers/        # HTTP handlers
│   │   ├── middleware/         # Auth, Admin validation, Zod request validators, Rate limiting
│   │   ├── routes/             # Express routes mounted at /api/v1
│   │   └── services/           # Eligibility engine, Gemini service, Recommendations, Admin
│   └── tests/                  # Unit and integration tests (Vitest)
├── shared/                     # Cross-workspace TypeScript types, constants, and Zod schemas
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # 12 PostgreSQL tables, RLS policies, security functions, seed data
├── scripts/
│   └── apply-migration.js      # Migration runner
└── docs/                       # Architecture, API, Database, Security, Deployment, Data Sources
```

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- Node.js `v18+` (v20 or v24 recommended)
- npm `v9+`
- A Supabase Cloud account (or local Supabase instance)

### 2. Clone and Install Dependencies
```bash
git clone <repo-url> scholarship
cd scholarship

# Install all workspace dependencies
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` in the root:
```bash
cp .env.example .env
```
Fill in your Supabase project credentials and optional Gemini API Key:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
```

### 4. Apply Database Migrations to Supabase
Run the automated migration runner:
```bash
node scripts/apply-migration.js
```
*Or paste `/supabase/migrations/001_initial_schema.sql` directly into the Supabase Cloud SQL Editor.*

### 5. Build All Workspaces
```bash
npm run build
```
This builds `@scholarship-finder/shared`, `@scholarship-finder/server`, and `@scholarship-finder/client`.

### 6. Run Test Suite
```bash
npm run test --workspace=server
```
Runs the test suite verifying scholarship retrieval, filtering, and the deterministic eligibility engine.

### 7. Start Local Development Servers
To run both backend API (port 5000) and frontend client (port 5173):
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Security & Data Isolation
- **Row Level Security (RLS)** is enabled on all 12 tables.
- Non-recursive `public.is_admin()` security definer function protects administrative actions.
- Cross-user data access is strictly blocked at the database level.
- Server-side token verification with Supabase JWT.
- Rate limiting on sensitive and AI endpoints (20 req/min).

---

## 📄 License
MIT License.
