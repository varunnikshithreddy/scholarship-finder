# Scholarship Data Sources & Provenance Policy

## 1. Provenance Integrity Mandate

A core requirement of this platform is that **no scholarship record, deadline, funding amount, or application link may be fabricated or hallucinated**. All listings must trace to an official government Gazette, Ministry portal, or accredited foundation notice.

---

## 2. Seeded & Supported Official Sources

The database is pre-seeded with authentic Indian government and top foundation scholarship schemes:

| Scheme Name | Sponsoring Organization | Official Portal URL |
| :--- | :--- | :--- |
| **PM-USP (Central Sector Scheme of Scholarships)** | Ministry of Education, Dept of Higher Education | [scholarships.gov.in](https://scholarships.gov.in) |
| **AICTE Pragati Scholarship for Girl Students** | All India Council for Technical Education (AICTE) | [aicte-india.org](https://www.aicte-india.org) |
| **National Means-Cum-Merit Scholarship (NMMSS)** | Department of School Education and Literacy | [scholarships.gov.in](https://scholarships.gov.in) |
| **Post-Matric Scholarship for SC Students** | Ministry of Social Justice & Empowerment | [socialjustice.gov.in](https://socialjustice.gov.in) |
| **Tata Trusts Medical and Healthcare Scholarship** | Tata Trusts (Sir Ratan Tata Trust) | [tatatrusts.org](https://www.tatatrusts.org) |
| **Reliance Foundation Undergraduate Scholarship** | Reliance Foundation | [reliancefoundation.org](https://www.reliancefoundation.org) |

---

## 3. Administrative Review & Ingestion Lifecycle

1. **Intake / Draft Creation:**
   - Administrators enter the official title, eligible levels, disciplines, family income limits, and verified closing dates.
   - The official notification link is entered and verified.

2. **Source Verification (`admin/sources`):**
   - An administrator verifies that the notification document matches the stated criteria.
   - The record status transitions from `pending` to `verified`.

3. **Publication:**
   - Only reviewed and verified records are transitioned to `status = 'published'`.
   - Unpublished drafts are shielded by RLS and never exposed to public search or discovery.

4. **Community Accuracy Feedback:**
   - If an official deadline is extended or link changed, students can flag the discrepancy via `POST /api/v1/reports`.
   - Admins review and resolve reported flags in the admin dashboard.
