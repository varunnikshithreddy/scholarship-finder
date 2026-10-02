# REST API Reference: Scholarship Finder

Base URL: `/api/v1`

All responses follow the unified envelope specification:
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable explanation",
    "details": []
  }
}
```

---

## 1. Public Endpoints

### 1.1 `GET /scholarships`
Retrieve published scholarships with full-text search, pagination, and multi-faceted filtering.
- **Query Parameters:**
  - `search` (string): Search query against title, short_description, and full description.
  - `category` (string): Category slug or ID.
  - `education_level` (string): Target academic qualification.
  - `discipline` (string): Field of study.
  - `state` (string): Geographic eligibility.
  - `min_funding` (number): Minimum funding amount.
  - `max_funding` (number): Maximum funding amount.
  - `status` (string): Published (default for public).
  - `sort_by` (string): `deadline_asc`, `deadline_desc`, `amount_desc`, `latest`.
  - `page` (number, default: 1).
  - `pageSize` (number, default: 12, max: 100).

### 1.2 `GET /scholarships/latest`
Fetch verified recent additions sorted by announcement date.
- **Query Parameters:** `limit` (number, default: 6).

### 1.3 `GET /scholarships/featured`
Fetch scholarships marked as featured by administrators.
- **Query Parameters:** `limit` (number, default: 6).

### 1.4 `GET /scholarships/:idOrSlug`
Fetch complete public scholarship record including provider, category, criteria, and official source URL.

### 1.5 `GET /scholarships/:id/related`
Fetch matching opportunities by category, discipline, and education level.

### 1.6 `GET /categories`
Retrieve all active scholarship categories.

### 1.7 `GET /providers`
Retrieve active scholarship providers (ministries, boards, foundations).

---

## 2. Authenticated Student Endpoints
*Requires `Authorization: Bearer <supabase_jwt>` header.*

### 2.1 Student Profile
- `GET /profile`: Retrieve current student profile.
- `PATCH /profile`: Update educational, academic, and financial profile fields (Zod validated).
- `DELETE /profile`: Permanent GDPR/privacy-compliant student account deletion.

### 2.2 AI Eligibility Checker
- `POST /eligibility/check`:
  - **Body:** `{ "scholarship_id": "uuid", "profile_override": { "academic_score": 85.5, ... } }`
  - Evaluates deterministic criteria + Gemini advisory narrative.
- `GET /eligibility/history`: List previous evaluations for current user.
- `GET /eligibility/:id`: Retrieve single assessment record.

### 2.3 Personalized Recommendations
- `GET /recommendations`: Get profile-matched scholarships with matched criteria and explanation.
- `POST /recommendations/refresh`: Invalidate cache and recompute recommendations.

### 2.4 Saved Scholarships & Application Tracker
- `GET /saved-scholarships`: Retrieve bookmarked scholarships with statuses and personal preparation notes.
- `POST /saved-scholarships`: Bookmark a scholarship (`application_status`, `personal_note`).
- `PATCH /saved-scholarships/:id`: Update status or note.
- `DELETE /saved-scholarships/:id`: Remove bookmark.

### 2.5 In-App Notifications
- `GET /notifications`: Retrieve in-app notifications.
- `PATCH /notifications/:id/read`: Mark single notification read.
- `PATCH /notifications/read-all`: Mark all read.
- `GET /notifications/preferences`: Get delivery channels and reminder days.
- `PATCH /notifications/preferences`: Update preferences.

### 2.6 Conversational AI Assistant
- `POST /ai/chat`:
  - **Body:** `{ "message": "What documents do I need?", "scholarship_id": "uuid" }`
  - **Response:** Factual sourced answer with verified official URLs.

---

## 3. Administrative Endpoints
*Requires `Authorization: Bearer <jwt>` and admin role.*

- `GET /admin/overview`: Summary metrics (totals, verification counts, open reports).
- `GET /admin/scholarships`: Manage catalog with draft/published filter.
- `POST /admin/scholarships`: Create new scholarship record.
- `PATCH /admin/scholarships/:id`: Update scholarship record.
- `DELETE /admin/scholarships/:id`: Soft-archive scholarship.
- `POST /admin/scholarships/:id/publish`: Publish to directory.
- `POST /admin/scholarships/:id/unpublish`: Return to draft.
- `POST /admin/scholarships/:id/verify`: Mark provenance verified.
- `GET /admin/sources`: Provenance links table.
- `GET /admin/reports`: Community accuracy flags.
- `PATCH /admin/reports/:id`: Update report status (`in_review`, `resolved`, `dismissed`).
- `GET /admin/audit-logs`: Audit trail logs.
