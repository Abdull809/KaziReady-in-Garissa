export type UserRole = 'applicant' | 'employer' | 'admin';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type ApplicationStatus =
  | 'Pending'
  | 'Under Review'
  | 'Shortlisted'
  | 'Accepted'
  | 'Rejected';

export type OpportunityType = 'Internship' | 'Job' | 'Attachment';

export type PaymentStatus = 'Upcoming' | 'Pending' | 'Paid' | 'Overdue';

export type PaymentFrequency = 'Monthly' | 'Bi-weekly' | 'Weekly';

export type ReportTargetType = 'employer' | 'opportunity' | 'payment' | 'complaint';

export type ReportStatus = 'Open' | 'Under Review' | 'Resolved' | 'Dismissed';

export type GarissaLocation =
  | 'Garissa Town'
  | 'Dadaab'
  | 'Balambala'
  | 'Fafi'
  | 'Ijara'
  | 'Lagdera'
  | 'Hulugho';

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone: string;
  location: GarissaLocation | string;
  education: string;
  institution: string;
  skills: string[];
  bio: string;
  cvFileName: string;
  documentChecklist: Record<string, boolean>;
  isSuspended?: boolean;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Employer {
  id: string;
  userId: string;
  organizationName: string;
  registrationNumber: string;
  sector: string;
  location: GarissaLocation | string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  description: string;
  verificationDocumentName: string;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  employerId: string;
  title: string;
  opportunityType: OpportunityType;
  category: string;
  location: GarissaLocation | string;
  description: string;
  requirements: string[];
  skillsRequired: string[];
  isPaid: boolean;
  stipendMonthlyKes: number;
  deadline: string;
  isOpen: boolean;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  opportunityId: string;
  applicantId: string;
  fullName: string;
  email: string;
  phone: string;
  education: string;
  institution: string;
  skills: string[];
  cvFileName: string;
  coverLetter: string;
  status: ApplicationStatus;
  employerNotes?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavedOpportunity {
  id: string;
  userId: string;
  opportunityId: string;
  createdAt: string;
}

export interface InternshipAgreement {
  id: string;
  applicationId: string;
  opportunityId: string;
  employerId: string;
  applicantId: string;
  title: string;
  employerName: string;
  applicantName: string;
  startDate: string;
  endDate: string;
  agreedStipendKes: number;
  paymentFrequency: PaymentFrequency;
  workingHours: string;
  termsSummary: string;
  signedByEmployer: boolean;
  signedByApplicant: boolean;
  status: 'Draft' | 'Active' | 'Completed';
  isDemo?: boolean;
  createdAt: string;
}

export interface PaymentHistoryEntry {
  id: string;
  date: string;
  amountKes: number;
  reference: string;
  note: string;
}

export interface PaymentRecord {
  id: string;
  agreementId: string;
  opportunityId: string;
  employerId: string;
  applicantId: string;
  employerName: string;
  applicantName: string;
  internshipTitle: string;
  agreedStipendKes: number;
  paymentFrequency: PaymentFrequency;
  expectedPaymentDate: string;
  amountPaidKes: number;
  outstandingBalanceKes: number;
  status: PaymentStatus;
  history: PaymentHistoryEntry[];
  delayedReportNote?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'alert' | 'application' | 'verification' | 'payment' | 'system';
  link?: string;
  read: boolean;
  isDemo?: boolean;
  createdAt: string;
}

export interface ReportRecord {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: ReportTargetType;
  targetId: string;
  targetLabel: string;
  reason: string;
  details: string;
  status: ReportStatus;
  adminResolution?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}
