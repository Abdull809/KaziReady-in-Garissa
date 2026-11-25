import {
  Application,
  ApplicationStatus,
  ContactSubmission,
  Employer,
  InternshipAgreement,
  NotificationItem,
  Opportunity,
  PaymentFrequency,
  PaymentRecord,
  PaymentStatus,
  Profile,
  ReportRecord,
  ReportStatus,
  ReportTargetType,
  SavedOpportunity,
  UserRole,
  VerificationStatus,
} from '@/src/types';
import { createInitialDemoState, DemoDatabaseState, hashPassword } from './demoSeed';
import { isSupabaseConfigured, supabase } from './supabaseClient';

const STORAGE_KEY = 'kaziready_garissa_db_v1';
const SESSION_USER_KEY = 'kaziready_garissa_session_uid';

function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

async function getDemoDb(): Promise<DemoDatabaseState> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as DemoDatabaseState;
    } catch {
      // fall through to re-seed
    }
  }
  const initial = await createInitialDemoState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveDemoDb(db: DemoDatabaseState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// Supabase row mappers
function mapProfileFromRow(row: Record<string, unknown>): Profile {
  return {
    id: String(row.id),
    email: String(row.email || ''),
    fullName: String(row.full_name || ''),
    role: (row.role as UserRole) || 'applicant',
    phone: String(row.phone || ''),
    location: String(row.location || 'Garissa Town'),
    education: String(row.education || ''),
    institution: String(row.institution || ''),
    skills: Array.isArray(row.skills) ? (row.skills as string[]) : [],
    bio: String(row.bio || ''),
    cvFileName: String(row.cv_file_name || ''),
    documentChecklist: (row.document_checklist as Record<string, boolean>) || {},
    isSuspended: Boolean(row.is_suspended),
    isDemo: Boolean(row.is_demo),
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
  };
}

function mapEmployerFromRow(row: Record<string, unknown>): Employer {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    organizationName: String(row.organization_name || ''),
    registrationNumber: String(row.registration_number || ''),
    sector: String(row.sector || ''),
    location: String(row.location || 'Garissa Town'),
    contactName: String(row.contact_name || ''),
    contactEmail: String(row.contact_email || ''),
    contactPhone: String(row.contact_phone || ''),
    website: String(row.website || ''),
    description: String(row.description || ''),
    verificationDocumentName: String(row.verification_document_name || ''),
    verificationStatus: (row.verification_status as VerificationStatus) || 'pending',
    verificationNotes: String(row.verification_notes || ''),
    isDemo: Boolean(row.is_demo),
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
  };
}

function mapOpportunityFromRow(row: Record<string, unknown>): Opportunity {
  return {
    id: String(row.id),
    employerId: String(row.employer_id),
    title: String(row.title || ''),
    opportunityType: (row.opportunity_type as Opportunity['opportunityType']) || 'Internship',
    category: String(row.category || ''),
    location: String(row.location || 'Garissa Town'),
    description: String(row.description || ''),
    requirements: Array.isArray(row.requirements) ? (row.requirements as string[]) : [],
    skillsRequired: Array.isArray(row.skills_required) ? (row.skills_required as string[]) : [],
    isPaid: Boolean(row.is_paid),
    stipendMonthlyKes: Number(row.stipend_monthly_kes || 0),
    deadline: String(row.deadline || ''),
    isOpen: row.is_open !== false,
    isDemo: Boolean(row.is_demo),
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
  };
}

function mapApplicationFromRow(row: Record<string, unknown>): Application {
  return {
    id: String(row.id),
    opportunityId: String(row.opportunity_id),
    applicantId: String(row.applicant_id),
    fullName: String(row.full_name || ''),
    email: String(row.email || ''),
    phone: String(row.phone || ''),
    education: String(row.education || ''),
    institution: String(row.institution || ''),
    skills: Array.isArray(row.skills) ? (row.skills as string[]) : [],
    cvFileName: String(row.cv_file_name || ''),
    coverLetter: String(row.cover_letter || ''),
    status: (row.status as ApplicationStatus) || 'Pending',
    employerNotes: String(row.employer_notes || ''),
    isDemo: Boolean(row.is_demo),
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
  };
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: 'applicant' | 'employer';
  phone: string;
  location: string;
  organizationName?: string;
  registrationNumber?: string;
  sector?: string;
}

export const dataService = {
  isSupabaseMode(): boolean {
    return isSupabaseConfigured;
  },

  async resetDemoDatabase(): Promise<void> {
    const fresh = await createInitialDemoState();
    saveDemoDb(fresh);
    sessionStorage.removeItem(SESSION_USER_KEY);
  },

  async getCurrentUserProfile(): Promise<Profile | null> {
    if (isSupabaseConfigured && supabase) {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      if (error || !data) return null;
      return mapProfileFromRow(data);
    }

    const uid = sessionStorage.getItem(SESSION_USER_KEY);
    if (!uid) return null;
    const db = await getDemoDb();
    return db.profiles.find((p) => p.id === uid) || null;
  },

  async login(email: string, password: string): Promise<Profile> {
    const normalizedEmail = email.trim().toLowerCase();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (error || !data.user) {
        throw new Error(error?.message || 'Invalid email or password.');
      }
      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      if (profError || !profData) {
        throw new Error('Account profile could not be loaded.');
      }
      const profile = mapProfileFromRow(profData);
      if (profile.isSuspended) {
        await supabase.auth.signOut();
        throw new Error('This account has been suspended by an administrator.');
      }
      return profile;
    }

    const db = await getDemoDb();
    const profile = db.profiles.find((p) => p.email.toLowerCase() === normalizedEmail);
    if (!profile) {
      throw new Error('No account found with that email address.');
    }
    if (profile.isSuspended) {
      throw new Error('This account is suspended. Contact platform support.');
    }
    const candidateHash = await hashPassword(password);
    if (db.credentials[normalizedEmail] !== candidateHash) {
      throw new Error('Incorrect password. Please try again.');
    }
    sessionStorage.setItem(SESSION_USER_KEY, profile.id);
    return profile;
  },

  async loginDemoQuick(userId: string): Promise<Profile> {
    const db = await getDemoDb();
    const profile = db.profiles.find((p) => p.id === userId);
    if (!profile) throw new Error('Demo account not found.');
    if (profile.isSuspended) throw new Error('This demo account is currently suspended.');
    sessionStorage.setItem(SESSION_USER_KEY, profile.id);
    return profile;
  },

  async register(payload: RegisterPayload): Promise<Profile> {
    // Hard guard: never allow public registration as admin
    if ((payload.role as string) === 'admin') {
      throw new Error('Public administrator registration is disabled for security.');
    }
    const normalizedEmail = payload.email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: payload.password,
      });
      if (signUpError || !signUpData.user) {
        throw new Error(signUpError?.message || 'Registration failed.');
      }
      const newProfileRow = {
        id: signUpData.user.id,
        email: normalizedEmail,
        full_name: payload.fullName.trim(),
        role: payload.role,
        phone: payload.phone.trim(),
        location: payload.location,
        education: '',
        institution: '',
        skills: [],
        bio: '',
        cv_file_name: '',
        document_checklist: {},
        is_demo: false,
      };
      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .insert(newProfileRow)
        .select()
        .single();
      if (profError || !profData) {
        throw new Error(profError?.message || 'Failed to create user profile.');
      }
      if (payload.role === 'employer') {
        await supabase.from('employers').insert({
          user_id: signUpData.user.id,
          organization_name: payload.organizationName?.trim() || `${payload.fullName} Organisation`,
          registration_number: payload.registrationNumber?.trim() || 'PENDING-REG',
          sector: payload.sector || 'ICT and Technology',
          location: payload.location,
          contact_name: payload.fullName.trim(),
          contact_email: normalizedEmail,
          contact_phone: payload.phone.trim(),
          verification_status: 'pending',
        });
      }
      return mapProfileFromRow(profData);
    }

    const db = await getDemoDb();
    if (db.profiles.some((p) => p.email.toLowerCase() === normalizedEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const now = new Date().toISOString();
    const userId = generateId('usr');
    const newProfile: Profile = {
      id: userId,
      email: normalizedEmail,
      fullName: payload.fullName.trim(),
      role: payload.role,
      phone: payload.phone.trim(),
      location: payload.location,
      education: '',
      institution: payload.role === 'employer' ? payload.organizationName?.trim() || '' : '',
      skills: [],
      bio: '',
      cvFileName: '',
      documentChecklist: {},
      isDemo: false,
      createdAt: now,
      updatedAt: now,
    };

    db.profiles.push(newProfile);
    db.credentials[normalizedEmail] = await hashPassword(payload.password);

    if (payload.role === 'employer') {
      const empId = generateId('emp');
      const orgName = payload.organizationName?.trim() || `${payload.fullName.trim()} Organisation`;
      db.employers.push({
        id: empId,
        userId,
        organizationName: orgName,
        registrationNumber: payload.registrationNumber?.trim() || 'PENDING-SUBMISSION',
        sector: payload.sector || 'ICT and Technology',
        location: payload.location,
        contactName: payload.fullName.trim(),
        contactEmail: normalizedEmail,
        contactPhone: payload.phone.trim(),
        website: '',
        description: '',
        verificationDocumentName: '',
        verificationStatus: 'pending',
        verificationNotes: 'Submit registration details and verification document for admin review.',
        isDemo: false,
        createdAt: now,
        updatedAt: now,
      });

      // Notify admins of new employer registration
      const admins = db.profiles.filter((p) => p.role === 'admin');
      for (const admin of admins) {
        db.notifications.unshift({
          id: generateId('not'),
          userId: admin.id,
          title: 'New Employer Registered',
          message: `${orgName} registered and requires verification review before publishing listings.`,
          type: 'verification',
          link: '/dashboard/admin',
          read: false,
          createdAt: now,
        });
      }
    } else {
      db.notifications.unshift({
        id: generateId('not'),
        userId,
        title: 'Welcome to KaziReady Garissa',
        message: 'Complete your skills profile and document checklist to unlock match scores.',
        type: 'system',
        link: '/dashboard/applicant',
        read: false,
        createdAt: now,
      });
    }

    saveDemoDb(db);
    sessionStorage.setItem(SESSION_USER_KEY, newProfile.id);
    return newProfile;
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    sessionStorage.removeItem(SESSION_USER_KEY);
  },

  async resetPassword(email: string, newPassword?: string): Promise<string> {
    const normalizedEmail = email.trim().toLowerCase();
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail);
      if (error) throw new Error(error.message);
      return 'Password reset instructions sent to your email address.';
    }

    const db = await getDemoDb();
    const profile = db.profiles.find((p) => p.email.toLowerCase() === normalizedEmail);
    if (!profile) {
      throw new Error('No registered account matches that email address.');
    }
    if (!newPassword) {
      return 'Account verified. Enter your new password below to complete the reset.';
    }
    db.credentials[normalizedEmail] = await hashPassword(newPassword);
    saveDemoDb(db);
    return 'Password updated successfully. You can now sign in with your new password.';
  },

  async updateProfile(profileId: string, updates: Partial<Profile>): Promise<Profile> {
    if (isSupabaseConfigured && supabase) {
      const payload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.fullName !== undefined) payload.full_name = updates.fullName;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.location !== undefined) payload.location = updates.location;
      if (updates.education !== undefined) payload.education = updates.education;
      if (updates.institution !== undefined) payload.institution = updates.institution;
      if (updates.skills !== undefined) payload.skills = updates.skills;
      if (updates.bio !== undefined) payload.bio = updates.bio;
      if (updates.cvFileName !== undefined) payload.cv_file_name = updates.cvFileName;
      if (updates.documentChecklist !== undefined) payload.document_checklist = updates.documentChecklist;

      const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', profileId)
        .select()
        .single();
      if (error || !data) throw new Error(error?.message || 'Failed to update profile.');
      return mapProfileFromRow(data);
    }

    const db = await getDemoDb();
    const idx = db.profiles.findIndex((p) => p.id === profileId);
    if (idx === -1) throw new Error('Profile not found.');
    // Never allow client-side role escalation
    const { role: _ignoredRole, ...safeUpdates } = updates;
    db.profiles[idx] = {
      ...db.profiles[idx],
      ...safeUpdates,
      updatedAt: new Date().toISOString(),
    };
    saveDemoDb(db);
    return db.profiles[idx];
  },

  // --- READ QUERIES ---
  async getAllProfiles(): Promise<Profile[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      return (data || []).map(mapProfileFromRow);
    }
    const db = await getDemoDb();
    return [...db.profiles];
  },

  async getEmployers(): Promise<Employer[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('employers').select('*').order('created_at', { ascending: false });
      return (data || []).map(mapEmployerFromRow);
    }
    const db = await getDemoDb();
    return [...db.employers];
  },

  async getEmployerByUserId(userId: string): Promise<Employer | null> {
    const employers = await this.getEmployers();
    return employers.find((e) => e.userId === userId) || null;
  },

  async updateEmployer(employerId: string, updates: Partial<Employer>): Promise<Employer> {
    if (isSupabaseConfigured && supabase) {
      const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updates.organizationName !== undefined) payload.organization_name = updates.organizationName;
      if (updates.registrationNumber !== undefined) payload.registration_number = updates.registrationNumber;
      if (updates.sector !== undefined) payload.sector = updates.sector;
      if (updates.location !== undefined) payload.location = updates.location;
      if (updates.contactName !== undefined) payload.contact_name = updates.contactName;
      if (updates.contactEmail !== undefined) payload.contact_email = updates.contactEmail;
      if (updates.contactPhone !== undefined) payload.contact_phone = updates.contactPhone;
      if (updates.website !== undefined) payload.website = updates.website;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.verificationDocumentName !== undefined) {
        payload.verification_document_name = updates.verificationDocumentName;
      }
      const { data, error } = await supabase
        .from('employers')
        .update(payload)
        .eq('id', employerId)
        .select()
        .single();
      if (error || !data) throw new Error(error?.message || 'Could not update employer profile.');
      return mapEmployerFromRow(data);
    }

    const db = await getDemoDb();
    const idx = db.employers.findIndex((e) => e.id === employerId);
    if (idx === -1) throw new Error('Employer record not found.');
    const { verificationStatus: _ignoredStatus, ...safeUpdates } = updates;
    const prev = db.employers[idx];
    db.employers[idx] = {
      ...prev,
      ...safeUpdates,
      // If a rejected employer resubmits documents, set status back to pending for admin review
      verificationStatus:
        prev.verificationStatus === 'rejected' && updates.verificationDocumentName
          ? 'pending'
          : prev.verificationStatus,
      updatedAt: new Date().toISOString(),
    };

    if (updates.verificationDocumentName) {
      const admins = db.profiles.filter((p) => p.role === 'admin');
      for (const admin of admins) {
        db.notifications.unshift({
          id: generateId('not'),
          userId: admin.id,
          title: 'Employer Verification Document Submitted',
          message: `${db.employers[idx].organizationName} uploaded ${updates.verificationDocumentName} for review.`,
          type: 'verification',
          link: '/dashboard/admin',
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    saveDemoDb(db);
    return db.employers[idx];
  },

  async setEmployerVerification(
    employerId: string,
    status: VerificationStatus,
    notes: string,
    adminProfile: Profile
  ): Promise<Employer> {
    if (adminProfile.role !== 'admin') {
      throw new Error('Only administrators can approve or reject employer verification.');
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('employers')
        .update({
          verification_status: status,
          verification_notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', employerId)
        .select()
        .single();
      if (error || !data) throw new Error(error?.message || 'Verification update failed.');
      return mapEmployerFromRow(data);
    }

    const db = await getDemoDb();
    const idx = db.employers.findIndex((e) => e.id === employerId);
    if (idx === -1) throw new Error('Employer not found.');
    db.employers[idx] = {
      ...db.employers[idx],
      verificationStatus: status,
      verificationNotes: notes,
      updatedAt: new Date().toISOString(),
    };

    db.notifications.unshift({
      id: generateId('not'),
      userId: db.employers[idx].userId,
      title:
        status === 'verified'
          ? 'Employer Verification Approved'
          : status === 'rejected'
          ? 'Employer Verification Rejected'
          : 'Employer Verification Updated',
      message:
        status === 'verified'
          ? `${db.employers[idx].organizationName} is now verified and can publish public opportunities.`
          : `Verification status updated to ${status}. ${notes}`,
      type: 'verification',
      link: '/dashboard/employer',
      read: false,
      createdAt: new Date().toISOString(),
    });

    saveDemoDb(db);
    return db.employers[idx];
  },

  async getOpportunities(includeUnverified = false): Promise<Opportunity[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });
      return (data || []).map(mapOpportunityFromRow);
    }
    const db = await getDemoDb();
    if (includeUnverified) return [...db.opportunities];
    const verifiedEmpIds = new Set(
      db.employers.filter((e) => e.verificationStatus === 'verified').map((e) => e.id)
    );
    return db.opportunities.filter((o) => o.isOpen && verifiedEmpIds.has(o.employerId));
  },

  async createOpportunity(
    employerId: string,
    payload: Omit<Opportunity, 'id' | 'employerId' | 'createdAt' | 'updatedAt'>
  ): Promise<Opportunity> {
    if (isSupabaseConfigured && supabase) {
      const { data: empData } = await supabase
        .from('employers')
        .select('verification_status, organization_name')
        .eq('id', employerId)
        .single();
      if (!empData || empData.verification_status !== 'verified') {
        throw new Error('Only verified employers can publish public opportunities.');
      }
      const { data, error } = await supabase
        .from('opportunities')
        .insert({
          employer_id: employerId,
          title: payload.title,
          opportunity_type: payload.opportunityType,
          category: payload.category,
          location: payload.location,
          description: payload.description,
          requirements: payload.requirements,
          skills_required: payload.skillsRequired,
          is_paid: payload.isPaid,
          stipend_monthly_kes: payload.isPaid ? payload.stipendMonthlyKes : 0,
          deadline: payload.deadline,
          is_open: payload.isOpen,
        })
        .select()
        .single();
      if (error || !data) throw new Error(error?.message || 'Failed to publish opportunity.');
      return mapOpportunityFromRow(data);
    }

    const db = await getDemoDb();
    const employer = db.employers.find((e) => e.id === employerId);
    if (!employer || employer.verificationStatus !== 'verified') {
      throw new Error('Unverified employers cannot publish public opportunities. Await admin approval.');
    }

    const now = new Date().toISOString();
    const newOpp: Opportunity = {
      ...payload,
      id: generateId('opp'),
      employerId,
      stipendMonthlyKes: payload.isPaid ? payload.stipendMonthlyKes : 0,
      createdAt: now,
      updatedAt: now,
    };
    db.opportunities.unshift(newOpp);

    // Opportunity alerts for matching applicants (matching skills or location)
    const matchingApplicants = db.profiles.filter((p) => {
      if (p.role !== 'applicant') return false;
      const locMatch = p.location.toLowerCase() === newOpp.location.toLowerCase();
      const skillMatch = newOpp.skillsRequired.some((req) =>
        p.skills.some((s) => s.toLowerCase() === req.toLowerCase())
      );
      return locMatch || skillMatch;
    });

    for (const appUser of matchingApplicants) {
      db.notifications.unshift({
        id: generateId('not'),
        userId: appUser.id,
        title: `New Opportunity Alert: ${newOpp.title}`,
        message: `${employer.organizationName} posted a ${newOpp.opportunityType} in ${newOpp.location}.`,
        type: 'alert',
        link: `/opportunities/${newOpp.id}`,
        read: false,
        createdAt: now,
      });
    }

    saveDemoDb(db);
    return newOpp;
  },

  async updateOpportunity(opportunityId: string, updates: Partial<Opportunity>): Promise<Opportunity> {
    if (isSupabaseConfigured && supabase) {
      const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.opportunityType !== undefined) payload.opportunity_type = updates.opportunityType;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.location !== undefined) payload.location = updates.location;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.requirements !== undefined) payload.requirements = updates.requirements;
      if (updates.skillsRequired !== undefined) payload.skills_required = updates.skillsRequired;
      if (updates.isPaid !== undefined) payload.is_paid = updates.isPaid;
      if (updates.stipendMonthlyKes !== undefined) payload.stipend_monthly_kes = updates.stipendMonthlyKes;
      if (updates.deadline !== undefined) payload.deadline = updates.deadline;
      if (updates.isOpen !== undefined) payload.is_open = updates.isOpen;

      const { data, error } = await supabase
        .from('opportunities')
        .update(payload)
        .eq('id', opportunityId)
        .select()
        .single();
      if (error || !data) throw new Error(error?.message || 'Failed to update opportunity.');
      return mapOpportunityFromRow(data);
    }

    const db = await getDemoDb();
    const idx = db.opportunities.findIndex((o) => o.id === opportunityId);
    if (idx === -1) throw new Error('Opportunity not found.');
    db.opportunities[idx] = {
      ...db.opportunities[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveDemoDb(db);
    return db.opportunities[idx];
  },

  async deleteOpportunity(opportunityId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('opportunities').delete().eq('id', opportunityId);
      if (error) throw new Error(error.message);
      return;
    }

    const db = await getDemoDb();
    db.opportunities = db.opportunities.filter((o) => o.id !== opportunityId);
    db.savedOpportunities = db.savedOpportunities.filter((s) => s.opportunityId !== opportunityId);
    saveDemoDb(db);
  },

  // --- APPLICATIONS ---
  async getApplications(): Promise<Application[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
      return (data || []).map(mapApplicationFromRow);
    }
    const db = await getDemoDb();
    return [...db.applications];
  },

  async submitApplication(
    payload: Omit<Application, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<Application> {
    if (isSupabaseConfigured && supabase) {
      const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('opportunity_id', payload.opportunityId)
        .eq('applicant_id', payload.applicantId)
        .maybeSingle();
      if (existing) {
        throw new Error('You have already submitted an application for this opportunity.');
      }
      const { data, error } = await supabase
        .from('applications')
        .insert({
          opportunity_id: payload.opportunityId,
          applicant_id: payload.applicantId,
          full_name: payload.fullName,
          email: payload.email,
          phone: payload.phone,
          education: payload.education,
          institution: payload.institution,
          skills: payload.skills,
          cv_file_name: payload.cvFileName,
          cover_letter: payload.coverLetter,
          status: 'Pending',
        })
        .select()
        .single();
      if (error || !data) throw new Error(error?.message || 'Application submission failed.');
      return mapApplicationFromRow(data);
    }

    const db = await getDemoDb();
    const duplicate = db.applications.some(
      (a) => a.opportunityId === payload.opportunityId && a.applicantId === payload.applicantId
    );
    if (duplicate) {
      throw new Error('You have already submitted an application for this opportunity.');
    }

    const opp = db.opportunities.find((o) => o.id === payload.opportunityId);
    if (!opp) throw new Error('Opportunity not found.');
    const emp = db.employers.find((e) => e.id === opp.employerId);
    if (!emp || emp.verificationStatus !== 'verified') {
      throw new Error('Applications are only accepted for verified employer listings.');
    }

    const now = new Date().toISOString();
    const newApp: Application = {
      ...payload,
      id: generateId('app'),
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
    };
    db.applications.unshift(newApp);

    db.notifications.unshift({
      id: generateId('not'),
      userId: emp.userId,
      title: `New Application: ${opp.title}`,
      message: `${payload.fullName} submitted an application (${payload.cvFileName}).`,
      type: 'application',
      link: '/dashboard/employer',
      read: false,
      createdAt: now,
    });

    db.notifications.unshift({
      id: generateId('not'),
      userId: payload.applicantId,
      title: `Application Sent: ${opp.title}`,
      message: `Your application to ${emp.organizationName} has been recorded as Pending.`,
      type: 'application',
      link: '/dashboard/applicant',
      read: false,
      createdAt: now,
    });

    saveDemoDb(db);
    return newApp;
  },

  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
    employerNotes?: string
  ): Promise<Application> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('applications')
        .update({
          status,
          employer_notes: employerNotes ?? '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .select()
        .single();
      if (error || !data) throw new Error(error?.message || 'Status update failed.');
      return mapApplicationFromRow(data);
    }

    const db = await getDemoDb();
    const idx = db.applications.findIndex((a) => a.id === applicationId);
    if (idx === -1) throw new Error('Application not found.');
    const now = new Date().toISOString();
    db.applications[idx] = {
      ...db.applications[idx],
      status,
      employerNotes: employerNotes !== undefined ? employerNotes : db.applications[idx].employerNotes,
      updatedAt: now,
    };

    const opp = db.opportunities.find((o) => o.id === db.applications[idx].opportunityId);
    db.notifications.unshift({
      id: generateId('not'),
      userId: db.applications[idx].applicantId,
      title: `Application Status Updated: ${status}`,
      message: `Your application for ${opp?.title || 'an opportunity'} is now ${status}.`,
      type: 'application',
      link: '/dashboard/applicant',
      read: false,
      createdAt: now,
    });

    saveDemoDb(db);
    return db.applications[idx];
  },

  // --- SAVED OPPORTUNITIES ---
  async getSavedOpportunities(userId: string): Promise<SavedOpportunity[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('saved_opportunities')
        .select('*')
        .eq('user_id', userId);
      return (data || []).map((row) => ({
        id: String(row.id),
        userId: String(row.user_id),
        opportunityId: String(row.opportunity_id),
        createdAt: String(row.created_at),
      }));
    }
    const db = await getDemoDb();
    return db.savedOpportunities.filter((s) => s.userId === userId);
  },

  async toggleSaveOpportunity(userId: string, opportunityId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { data: existing } = await supabase
        .from('saved_opportunities')
        .select('id')
        .eq('user_id', userId)
        .eq('opportunity_id', opportunityId)
        .maybeSingle();
      if (existing) {
        await supabase.from('saved_opportunities').delete().eq('id', existing.id);
        return false;
      }
      await supabase
        .from('saved_opportunities')
        .insert({ user_id: userId, opportunity_id: opportunityId });
      return true;
    }

    const db = await getDemoDb();
    const existingIdx = db.savedOpportunities.findIndex(
      (s) => s.userId === userId && s.opportunityId === opportunityId
    );
    if (existingIdx !== -1) {
      db.savedOpportunities.splice(existingIdx, 1);
      saveDemoDb(db);
      return false;
    }
    db.savedOpportunities.push({
      id: generateId('sav'),
      userId,
      opportunityId,
      createdAt: new Date().toISOString(),
    });
    saveDemoDb(db);
    return true;
  },

  // --- INTERNSHIP AGREEMENTS ---
  async getAgreements(): Promise<InternshipAgreement[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('internship_agreements')
        .select('*')
        .order('created_at', { ascending: false });
      return (data || []).map((r) => ({
        id: String(r.id),
        applicationId: String(r.application_id),
        opportunityId: String(r.opportunity_id),
        employerId: String(r.employer_id),
        applicantId: String(r.applicant_id),
        title: String(r.title),
        employerName: String(r.employer_name),
        applicantName: String(r.applicant_name),
        startDate: String(r.start_date),
        endDate: String(r.end_date),
        agreedStipendKes: Number(r.agreed_stipend_kes || 0),
        paymentFrequency: r.payment_frequency as PaymentFrequency,
        workingHours: String(r.working_hours),
        termsSummary: String(r.terms_summary),
        signedByEmployer: Boolean(r.signed_by_employer),
        signedByApplicant: Boolean(r.signed_by_applicant),
        status: r.status as InternshipAgreement['status'],
        isDemo: Boolean(r.is_demo),
        createdAt: String(r.created_at),
      }));
    }
    const db = await getDemoDb();
    return [...db.agreements];
  },

  async createAgreement(
    payload: Omit<InternshipAgreement, 'id' | 'createdAt' | 'status'>
  ): Promise<InternshipAgreement> {
    const db = await getDemoDb();
    const now = new Date().toISOString();
    const status: InternshipAgreement['status'] =
      payload.signedByEmployer && payload.signedByApplicant ? 'Active' : 'Draft';
    const newAgreement: InternshipAgreement = {
      ...payload,
      id: generateId('agr'),
      status,
      createdAt: now,
    };
    db.agreements.unshift(newAgreement);

    // Also create initial tracked payment schedule if stipend > 0
    if (payload.agreedStipendKes > 0) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 30);
      db.payments.unshift({
        id: generateId('pay'),
        agreementId: newAgreement.id,
        opportunityId: payload.opportunityId,
        employerId: payload.employerId,
        applicantId: payload.applicantId,
        employerName: payload.employerName,
        applicantName: payload.applicantName,
        internshipTitle: `${payload.title} (Cycle 1)`,
        agreedStipendKes: payload.agreedStipendKes,
        paymentFrequency: payload.paymentFrequency,
        expectedPaymentDate: expectedDate.toISOString().slice(0, 10),
        amountPaidKes: 0,
        outstandingBalanceKes: payload.agreedStipendKes,
        status: 'Upcoming',
        history: [],
        createdAt: now,
        updatedAt: now,
      });
    }

    db.notifications.unshift({
      id: generateId('not'),
      userId: payload.applicantId,
      title: `Internship Agreement Issued: ${payload.title}`,
      message: `${payload.employerName} issued an internship agreement for your review and signature.`,
      type: 'application',
      link: '/dashboard/applicant',
      read: false,
      createdAt: now,
    });

    saveDemoDb(db);
    return newAgreement;
  },

  async signAgreement(agreementId: string, signerRole: 'applicant' | 'employer'): Promise<InternshipAgreement> {
    const db = await getDemoDb();
    const idx = db.agreements.findIndex((a) => a.id === agreementId);
    if (idx === -1) throw new Error('Agreement not found.');
    const agr = { ...db.agreements[idx] };
    if (signerRole === 'applicant') agr.signedByApplicant = true;
    if (signerRole === 'employer') agr.signedByEmployer = true;
    if (agr.signedByApplicant && agr.signedByEmployer) {
      agr.status = 'Active';
    }
    db.agreements[idx] = agr;
    saveDemoDb(db);
    return agr;
  },

  // --- PAYMENTS ---
  async getPayments(): Promise<PaymentRecord[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('payments')
        .select('*')
        .order('expected_payment_date', { ascending: false });
      return (data || []).map((r) => ({
        id: String(r.id),
        agreementId: String(r.agreement_id),
        opportunityId: String(r.opportunity_id),
        employerId: String(r.employer_id),
        applicantId: String(r.applicant_id),
        employerName: String(r.employer_name),
        applicantName: String(r.applicant_name),
        internshipTitle: String(r.internship_title),
        agreedStipendKes: Number(r.agreed_stipend_kes || 0),
        paymentFrequency: r.payment_frequency as PaymentFrequency,
        expectedPaymentDate: String(r.expected_payment_date),
        amountPaidKes: Number(r.amount_paid_kes || 0),
        outstandingBalanceKes: Number(r.outstanding_balance_kes || 0),
        status: r.status as PaymentStatus,
        history: Array.isArray(r.history) ? r.history : [],
        delayedReportNote: String(r.delayed_report_note || ''),
        isDemo: Boolean(r.is_demo),
        createdAt: String(r.created_at),
        updatedAt: String(r.updated_at),
      }));
    }
    const db = await getDemoDb();
    return [...db.payments];
  },

  async updatePaymentRecord(
    paymentId: string,
    amountAddedKes: number,
    reference: string,
    note: string,
    explicitStatus?: PaymentStatus
  ): Promise<PaymentRecord> {
    const db = await getDemoDb();
    const idx = db.payments.findIndex((p) => p.id === paymentId);
    if (idx === -1) throw new Error('Payment record not found.');

    const current = db.payments[idx];
    const now = new Date().toISOString();
    const newPaid = Math.min(current.agreedStipendKes, Math.max(0, current.amountPaidKes + amountAddedKes));
    const newBalance = Math.max(0, current.agreedStipendKes - newPaid);
    const derivedStatus: PaymentStatus =
      explicitStatus || (newBalance === 0 ? 'Paid' : newPaid > 0 ? 'Pending' : current.status);

    const updatedHistory =
      amountAddedKes > 0
        ? [
            ...current.history,
            {
              id: generateId('ph'),
              date: now.slice(0, 10),
              amountKes: amountAddedKes,
              reference: reference.trim() || `TRK-${Date.now().toString().slice(-6)}`,
              note: note.trim() || 'Stipend disbursement recorded by employer.',
            },
          ]
        : current.history;

    db.payments[idx] = {
      ...current,
      amountPaidKes: newPaid,
      outstandingBalanceKes: newBalance,
      status: derivedStatus,
      history: updatedHistory,
      updatedAt: now,
    };

    db.notifications.unshift({
      id: generateId('not'),
      userId: current.applicantId,
      title: `Payment Tracker Updated: ${current.internshipTitle}`,
      message: `${current.employerName} updated stipend status to ${derivedStatus} (Paid: KES ${newPaid.toLocaleString()}).`,
      type: 'payment',
      link: '/dashboard/applicant',
      read: false,
      createdAt: now,
    });

    saveDemoDb(db);
    return db.payments[idx];
  },

  async reportDelayedPayment(
    paymentId: string,
    reporter: Profile,
    note: string
  ): Promise<PaymentRecord> {
    const db = await getDemoDb();
    const idx = db.payments.findIndex((p) => p.id === paymentId);
    if (idx === -1) throw new Error('Payment record not found.');
    const now = new Date().toISOString();
    const payment = db.payments[idx];
    db.payments[idx] = {
      ...payment,
      status: payment.outstandingBalanceKes > 0 ? 'Overdue' : payment.status,
      delayedReportNote: note.trim(),
      updatedAt: now,
    };

    db.reports.unshift({
      id: generateId('rep'),
      reporterId: reporter.id,
      reporterName: reporter.fullName,
      targetType: 'payment',
      targetId: payment.id,
      targetLabel: `${payment.internshipTitle} — ${payment.employerName}`,
      reason: 'Delayed stipend payment reported',
      details: note.trim(),
      status: 'Open',
      adminResolution: '',
      createdAt: now,
      updatedAt: now,
    });

    const admins = db.profiles.filter((p) => p.role === 'admin');
    for (const admin of admins) {
      db.notifications.unshift({
        id: generateId('not'),
        userId: admin.id,
        title: 'Delayed Payment Reported',
        message: `${reporter.fullName} reported a delay on ${payment.internshipTitle}.`,
        type: 'payment',
        link: '/dashboard/admin',
        read: false,
        createdAt: now,
      });
    }

    saveDemoDb(db);
    return db.payments[idx];
  },

  // --- NOTIFICATIONS ---
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return (data || []).map((r) => ({
        id: String(r.id),
        userId: String(r.user_id),
        title: String(r.title),
        message: String(r.message),
        type: r.type as NotificationItem['type'],
        link: String(r.link || ''),
        read: Boolean(r.read),
        isDemo: Boolean(r.is_demo),
        createdAt: String(r.created_at),
      }));
    }
    const db = await getDemoDb();
    return db.notifications.filter((n) => n.userId === userId);
  },

  async markNotificationRead(notificationId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
      return;
    }
    const db = await getDemoDb();
    const idx = db.notifications.findIndex((n) => n.id === notificationId);
    if (idx !== -1) {
      db.notifications[idx].read = true;
      saveDemoDb(db);
    }
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('notifications').update({ read: true }).eq('user_id', userId);
      return;
    }
    const db = await getDemoDb();
    db.notifications = db.notifications.map((n) =>
      n.userId === userId ? { ...n, read: true } : n
    );
    saveDemoDb(db);
  },

  // --- REPORTS & COMPLAINTS ---
  async getReports(): Promise<ReportRecord[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      return (data || []).map((r) => ({
        id: String(r.id),
        reporterId: String(r.reporter_id),
        reporterName: String(r.reporter_name),
        targetType: r.target_type as ReportTargetType,
        targetId: String(r.target_id),
        targetLabel: String(r.target_label),
        reason: String(r.reason),
        details: String(r.details),
        status: r.status as ReportStatus,
        adminResolution: String(r.admin_resolution || ''),
        isDemo: Boolean(r.is_demo),
        createdAt: String(r.created_at),
        updatedAt: String(r.updated_at),
      }));
    }
    const db = await getDemoDb();
    return [...db.reports];
  },

  async createReport(payload: {
    reporterId: string;
    reporterName: string;
    targetType: ReportTargetType;
    targetId: string;
    targetLabel: string;
    reason: string;
    details: string;
  }): Promise<ReportRecord> {
    const db = await getDemoDb();
    const now = new Date().toISOString();
    const report: ReportRecord = {
      id: generateId('rep'),
      ...payload,
      status: 'Open',
      adminResolution: '',
      createdAt: now,
      updatedAt: now,
    };
    db.reports.unshift(report);

    const admins = db.profiles.filter((p) => p.role === 'admin');
    for (const admin of admins) {
      db.notifications.unshift({
        id: generateId('not'),
        userId: admin.id,
        title: `New ${payload.targetType} Report`,
        message: `${payload.reporterName} flagged ${payload.targetLabel}: ${payload.reason}`,
        type: 'system',
        link: '/dashboard/admin',
        read: false,
        createdAt: now,
      });
    }

    saveDemoDb(db);
    return report;
  },

  async updateReportStatus(
    reportId: string,
    status: ReportStatus,
    adminResolution: string
  ): Promise<ReportRecord> {
    const db = await getDemoDb();
    const idx = db.reports.findIndex((r) => r.id === reportId);
    if (idx === -1) throw new Error('Report not found.');
    db.reports[idx] = {
      ...db.reports[idx],
      status,
      adminResolution,
      updatedAt: new Date().toISOString(),
    };
    saveDemoDb(db);
    return db.reports[idx];
  },

  // --- ADMIN CATEGORIES & USER MODERATION ---
  async getCategories(): Promise<string[]> {
    const db = await getDemoDb();
    return [...db.categories];
  },

  async addCategory(category: string): Promise<string[]> {
    const trimmed = category.trim();
    if (!trimmed) throw new Error('Category name cannot be empty.');
    const db = await getDemoDb();
    if (db.categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error('This category already exists.');
    }
    db.categories.push(trimmed);
    saveDemoDb(db);
    return [...db.categories];
  },

  async removeCategory(category: string): Promise<string[]> {
    const db = await getDemoDb();
    db.categories = db.categories.filter((c) => c !== category);
    saveDemoDb(db);
    return [...db.categories];
  },

  async toggleSuspendUser(userId: string, adminProfile: Profile): Promise<Profile> {
    if (adminProfile.role !== 'admin') {
      throw new Error('Only administrators can manage user account access.');
    }
    if (userId === adminProfile.id) {
      throw new Error('You cannot suspend your own administrator account.');
    }
    const db = await getDemoDb();
    const idx = db.profiles.findIndex((p) => p.id === userId);
    if (idx === -1) throw new Error('User not found.');
    db.profiles[idx] = {
      ...db.profiles[idx],
      isSuspended: !db.profiles[idx].isSuspended,
      updatedAt: new Date().toISOString(),
    };
    saveDemoDb(db);
    return db.profiles[idx];
  },

  async submitContactForm(payload: Omit<ContactSubmission, 'id' | 'createdAt'>): Promise<ContactSubmission> {
    const db = await getDemoDb();
    const entry: ContactSubmission = {
      id: generateId('msg'),
      ...payload,
      createdAt: new Date().toISOString(),
    };
    db.contactSubmissions.unshift(entry);
    saveDemoDb(db);
    return entry;
  },
};
