-- KaziReady Garissa — PostgreSQL & Supabase Schema with Row Level Security (RLS)
-- Run this SQL in your Supabase SQL Editor when configuring a hosted Supabase backend.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('applicant', 'employer', 'admin')) DEFAULT 'applicant',
  phone TEXT DEFAULT '',
  location TEXT DEFAULT 'Garissa Town',
  education TEXT DEFAULT '',
  institution TEXT DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  bio TEXT DEFAULT '',
  cv_file_name TEXT DEFAULT '',
  document_checklist JSONB DEFAULT '{}'::jsonb,
  is_suspended BOOLEAN DEFAULT FALSE,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent public self-registration as 'admin' via database trigger
CREATE OR REPLACE FUNCTION public.prevent_public_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'admin' AND auth.uid() IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      NEW.role := 'applicant';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_public_admin ON public.profiles;
CREATE TRIGGER trg_prevent_public_admin
BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_public_admin_role();

-- 2. EMPLOYERS
CREATE TABLE IF NOT EXISTS public.employers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  sector TEXT NOT NULL,
  location TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  website TEXT DEFAULT '',
  description TEXT DEFAULT '',
  verification_document_name TEXT DEFAULT '',
  verification_status TEXT NOT NULL CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  verification_notes TEXT DEFAULT '',
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. OPPORTUNITIES
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('Internship', 'Job', 'Attachment')),
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  skills_required TEXT[] DEFAULT '{}',
  is_paid BOOLEAN DEFAULT TRUE,
  stipend_monthly_kes INTEGER DEFAULT 0,
  deadline DATE NOT NULL,
  is_open BOOLEAN DEFAULT TRUE,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. APPLICATIONS
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  education TEXT NOT NULL,
  institution TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  cv_file_name TEXT NOT NULL,
  cover_letter TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected')) DEFAULT 'Pending',
  employer_notes TEXT DEFAULT '',
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (opportunity_id, applicant_id)
);

-- 5. SAVED OPPORTUNITIES
CREATE TABLE IF NOT EXISTS public.saved_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, opportunity_id)
);

-- 6. INTERNSHIP AGREEMENTS
CREATE TABLE IF NOT EXISTS public.internship_agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  employer_name TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  agreed_stipend_kes INTEGER NOT NULL DEFAULT 0,
  payment_frequency TEXT NOT NULL CHECK (payment_frequency IN ('Monthly', 'Bi-weekly', 'Weekly')) DEFAULT 'Monthly',
  working_hours TEXT NOT NULL,
  terms_summary TEXT NOT NULL,
  signed_by_employer BOOLEAN DEFAULT FALSE,
  signed_by_applicant BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL CHECK (status IN ('Draft', 'Active', 'Completed')) DEFAULT 'Draft',
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PAYMENTS (TRANSPARENCY & TRACKING ONLY — NO MONEY HELD OR TRANSFERRED)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agreement_id UUID NOT NULL REFERENCES public.internship_agreements(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  employer_name TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  internship_title TEXT NOT NULL,
  agreed_stipend_kes INTEGER NOT NULL DEFAULT 0,
  payment_frequency TEXT NOT NULL,
  expected_payment_date DATE NOT NULL,
  amount_paid_kes INTEGER NOT NULL DEFAULT 0,
  outstanding_balance_kes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('Upcoming', 'Pending', 'Paid', 'Overdue')) DEFAULT 'Upcoming',
  history JSONB DEFAULT '[]'::jsonb,
  delayed_report_note TEXT DEFAULT '',
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('alert', 'application', 'verification', 'payment', 'system')),
  link TEXT DEFAULT '',
  read BOOLEAN DEFAULT FALSE,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. REPORTS & COMPLAINTS
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reporter_name TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('employer', 'opportunity', 'payment', 'complaint')),
  target_id TEXT NOT NULL,
  target_label TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Open', 'Under Review', 'Resolved', 'Dismissed')) DEFAULT 'Open',
  admin_resolution TEXT DEFAULT '',
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles: Users read/update own profile; Admins read/manage all
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id AND role <> 'admin');
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Employers: Public can read verified employers; owner reads/updates own; admin manages all
CREATE POLICY "employers_public_verified_or_owner_admin" ON public.employers
  FOR SELECT USING (verification_status = 'verified' OR user_id = auth.uid() OR public.is_admin());
CREATE POLICY "employers_insert_own" ON public.employers
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "employers_update_own_or_admin" ON public.employers
  FOR UPDATE USING (
    (user_id = auth.uid() AND verification_status <> 'verified') -- verification status controlled by admin
    OR public.is_admin()
  );

-- Opportunities: Public reads open opportunities from verified employers; verified employers manage own
CREATE POLICY "opportunities_select_public" ON public.opportunities
  FOR SELECT USING (
    (is_open = TRUE AND EXISTS (
      SELECT 1 FROM public.employers e WHERE e.id = employer_id AND e.verification_status = 'verified'
    ))
    OR EXISTS (SELECT 1 FROM public.employers e WHERE e.id = employer_id AND e.user_id = auth.uid())
    OR public.is_admin()
  );
CREATE POLICY "opportunities_insert_verified_employer" ON public.opportunities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employers e
      WHERE e.id = employer_id AND e.user_id = auth.uid() AND e.verification_status = 'verified'
    )
  );
CREATE POLICY "opportunities_update_owner_or_admin" ON public.opportunities
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.employers e WHERE e.id = employer_id AND e.user_id = auth.uid())
    OR public.is_admin()
  );
CREATE POLICY "opportunities_delete_owner_or_admin" ON public.opportunities
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.employers e WHERE e.id = employer_id AND e.user_id = auth.uid())
    OR public.is_admin()
  );

-- Applications: Private to applicant, target employer, and admin
CREATE POLICY "applications_select_private" ON public.applications
  FOR SELECT USING (
    applicant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.opportunities o
      JOIN public.employers e ON e.id = o.employer_id
      WHERE o.id = opportunity_id AND e.user_id = auth.uid()
    )
    OR public.is_admin()
  );
CREATE POLICY "applications_insert_applicant" ON public.applications
  FOR INSERT WITH CHECK (applicant_id = auth.uid());
CREATE POLICY "applications_update_employer_or_admin" ON public.applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.opportunities o
      JOIN public.employers e ON e.id = o.employer_id
      WHERE o.id = opportunity_id AND e.user_id = auth.uid()
    )
    OR public.is_admin()
  );

-- Saved Opportunities: Strictly own user
CREATE POLICY "saved_own" ON public.saved_opportunities
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Agreements: Applicant, Employer, Admin
CREATE POLICY "agreements_select_parties" ON public.internship_agreements
  FOR SELECT USING (
    applicant_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.employers e WHERE e.id = employer_id AND e.user_id = auth.uid())
    OR public.is_admin()
  );
CREATE POLICY "agreements_manage_parties" ON public.internship_agreements
  FOR ALL USING (
    applicant_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.employers e WHERE e.id = employer_id AND e.user_id = auth.uid())
    OR public.is_admin()
  );

-- Payments: Applicant, Employer, Admin
CREATE POLICY "payments_select_parties" ON public.payments
  FOR SELECT USING (
    applicant_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.employers e WHERE e.id = employer_id AND e.user_id = auth.uid())
    OR public.is_admin()
  );
CREATE POLICY "payments_update_parties" ON public.payments
  FOR UPDATE USING (
    applicant_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.employers e WHERE e.id = employer_id AND e.user_id = auth.uid())
    OR public.is_admin()
  );
CREATE POLICY "payments_insert_employer_or_admin" ON public.payments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.employers e WHERE e.id = employer_id AND e.user_id = auth.uid())
    OR public.is_admin()
  );

-- Notifications: Strictly own user
CREATE POLICY "notifications_own" ON public.notifications
  FOR ALL USING (user_id = auth.uid() OR public.is_admin());

-- Reports: Reporter sees own; Admin sees/updates all
CREATE POLICY "reports_select_own_or_admin" ON public.reports
  FOR SELECT USING (reporter_id = auth.uid() OR public.is_admin());
CREATE POLICY "reports_insert_auth" ON public.reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "reports_update_admin" ON public.reports
  FOR UPDATE USING (public.is_admin());
