import { GarissaLocation } from '@/src/types';

export const GARISSA_LOCATIONS: GarissaLocation[] = [
  'Garissa Town',
  'Dadaab',
  'Balambala',
  'Fafi',
  'Ijara',
  'Lagdera',
  'Hulugho',
];

export const DEFAULT_CATEGORIES: string[] = [
  'ICT and Technology',
  'Business and Finance',
  'Education',
  'Healthcare',
  'Engineering',
  'Agriculture',
  'Administration',
  'Data Entry',
  'Community Development',
];

export const DOCUMENT_CHECKLIST_ITEMS = [
  {
    id: 'cv_resume',
    label: 'Updated CV / Resume (PDF or Word)',
    description: 'Tailored 1-2 page summary of education, TVET skills, projects, and referees.',
  },
  {
    id: 'national_id',
    label: 'Identification Document (National ID / Alien ID / Refugee ID)',
    description: 'Valid government-issued identification where applicable for onboarding.',
  },
  {
    id: 'academic_certs',
    label: 'Academic Certificates / TVET Transcripts',
    description: 'KNEC, university, or vocational training transcripts and recommendation letter.',
  },
  {
    id: 'internship_agreement',
    label: 'Signed Internship or Attachment Agreement',
    description: 'Written scope, duration, supervisor details, and agreed stipend terms.',
  },
  {
    id: 'tax_statutory',
    label: 'KRA PIN & Statutory Details (Where Applicable)',
    description: 'Needed for paid formal internships or employment payroll compliance in Kenya.',
  },
];

export const OFFICIAL_GOVERNMENT_LINKS = [
  {
    title: 'Ministry of Labour and Social Protection (Kenya)',
    url: 'https://www.labour.go.ke/',
    summary: 'Employment regulations, labour standards, and workplace compliance resources.',
  },
  {
    title: 'Directorate of Immigration Services (eCitizen)',
    url: 'https://fns.immigration.go.ke/',
    summary: 'Official portal for foreign national services and work permit categories where legally required.',
  },
  {
    title: 'National Industrial Training Authority (NITA)',
    url: 'https://www.nita.go.ke/',
    summary: 'Industrial attachment standards, TVET accreditation, and apprenticeship guidelines.',
  },
  {
    title: 'Department of Refugee Services (Kenya)',
    url: 'https://refugee.go.ke/',
    summary: 'Official documentation and movement/employment guidance for registered refugees.',
  },
  {
    title: 'Garissa County Government',
    url: 'https://garissa.go.ke/',
    summary: 'County youth affairs, local trade licensing, and regional public services.',
  },
];

export const CONTACT_CONFIG = {
  email: import.meta.env.VITE_CONTACT_EMAIL || 'support@kazireadygarissa.demo',
  phone: import.meta.env.VITE_CONTACT_PHONE || '+254 700 000 000 (Demo Line)',
  office:
    import.meta.env.VITE_CONTACT_OFFICE ||
    'Garissa County Youth Employment & Legal Access Desk (Demo Location)',
  county: 'Garissa County, Kenya',
  hours: 'Monday – Friday, 8:00 AM – 5:00 PM EAT',
};
