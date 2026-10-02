# Deployment Guide

This guide describes production deployment of the Scholarship Finder platform across Supabase, Vercel/Netlify (Frontend), and Render/Railway (Backend).

---

## 1. Prerequisites & Cloud Accounts

- **Supabase Cloud Account:** Project created in region (e.g. `ap-south-1` Mumbai).
- **Google AI Studio:** Valid `GEMINI_API_KEY` for Google Gemini 2.5 Flash.
- **Node.js:** v18 LTS or higher.

---

## 2. Supabase Cloud Database Setup

1. Note your Supabase project URL, Anon Key, and Service Role Key from the Supabase Dashboard:
   - Project URL: `https://<project-ref>.supabase.co`
   - Anon Key: Public key for client.
   - Service Role Key: Secret key for server and migrations runner.
2. Run database migration runner:
   ```bash
   node scripts/apply-migration.js
   ```
   Or paste `/supabase/migrations/001_initial_schema.sql` directly into the Supabase SQL Editor.

---

## 3. Backend Deployment (Render / Railway / Docker)

1. Root Directory: `server`
2. Build Command: `npm install && npm run build`
3. Start Command: `npm start`
4. Set Environment Variables:
   ```env
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   API_BASE_URL=https://your-backend-api.onrender.com/api/v1

   SUPABASE_URL=https://<project-ref>.supabase.co
   SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

   GEMINI_API_KEY=<your-gemini-key>
   GEMINI_MODEL=gemini-2.5-flash

   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX_REQUESTS=100
   AI_RATE_LIMIT_WINDOW_MS=60000
   AI_RATE_LIMIT_MAX_REQUESTS=20

   LOG_LEVEL=info
   APP_TIMEZONE=Asia/Kolkata
   ```

---

## 4. Frontend Deployment (Vercel / Netlify / Cloudflare Pages)

1. Root Directory: `client`
2. Framework Preset: `Vite`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Set Environment Variables:
   ```env
   VITE_API_BASE_URL=https://your-backend-api.onrender.com/api/v1
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```
