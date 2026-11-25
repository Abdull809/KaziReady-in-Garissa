# KaziReady Garissa

**Tagline:** From Skills to Opportunities. From Opportunities to Income.  
**Hackathon Track:** Track 02 – Legal & Financial Access  
**Location:** Garissa County, Kenya

KaziReady Garissa is a digital employment, documentation readiness, and stipend transparency platform built for youth, TVET trainees, graduates, and employers across Garissa County (Garissa Town, Dadaab, Balambala, Fafi, Ijara, Lagdera, and Hulugho).

---

## Core Capabilities

- **Opportunities Marketplace:** Search and filter internships, industrial attachments, and entry-level jobs by title, employer, Garissa sub-county, category, paid/unpaid status, type, and deadline.
- **Employer Verification:** Organisations submit registration details and supporting documents. Unverified employers cannot publish public listings until approved by an administrator.
- **Skill Matching:** Automatically compares applicant skills against opportunity requirements and displays a percentage match score.
- **Work Documentation Assistant:** Informational guides covering CV preparation, academic certificates, identification, internship agreements, employment contracts, work permit guidance (including clarification that Kenyan citizens generally do not need foreign-national work permits for ordinary employment), official Kenyan government links, a downloadable sample internship agreement, and a document readiness checklist.
- **Stipend Payment Tracker:** Tracks agreed KES stipends, payment frequency, expected dates, paid amounts, and balances with delayed payment reporting. *(Tracking ledger only—does not hold or transfer money.)*
- **Role-Based Dashboards:** Dedicated workspaces for **Applicants**, **Employers**, and **Administrators** (public registration as Admin is strictly disabled).

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, React Router, Lucide React
- **Backend / Database (Optional):** Supabase (Auth + PostgreSQL + Row Level Security via `supabase/schema.sql`)
- **Offline / Demo Mode:** Automatic persistent `localStorage` demonstration mode when Supabase credentials are not configured

---

## Installation & Local Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application runs on `http://localhost:3000`.

3. **Build for production:**
   ```bash
   npm run build
   ```

---

## Optional Supabase Configuration

If Supabase environment variables are omitted, KaziReady Garissa automatically runs in full **Local Demonstration Mode** using seeded **DEMO** records persisted in `localStorage`.

To connect a live Supabase project:
1. Create a Supabase project and run the SQL in `supabase/schema.sql` inside the Supabase SQL Editor (this creates all 9 tables and Row Level Security policies).
2. Copy `.env.example` to `.env` and populate:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
3. Optionally customize Garissa County support desk details:
   ```env
   VITE_CONTACT_EMAIL=support@yourdomain.org
   VITE_CONTACT_PHONE=+254 7XX XXX XXX
   VITE_CONTACT_OFFICE=Your Garissa Support Office
   ```

---

## Demonstration Accounts (DEMO)

In local demonstration mode, you can use the **One-Click Demo Role Sign-In** buttons on `/login` or sign in with password `KaziDemo2026!`:

- **Applicant (DEMO):** `amina.hassan@demo.kaziready.ke`
- **Verified Employer (DEMO):** `hr@northerntechhub.demo`
- **Pending Employer (DEMO):** `talent@tanahorizon.demo`
- **Administrator (DEMO):** `admin@kazireadygarissa.demo`

All sample opportunities, employers, applicants, and testimonials are clearly marked **DEMO**.
