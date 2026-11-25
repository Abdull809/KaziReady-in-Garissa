import { InternshipAgreement, Profile } from '@/src/types';

export function formatKes(amount: number): string {
  return `KES ${Math.round(amount).toLocaleString('en-KE')}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function calculateSkillMatch(
  applicantSkills: string[],
  requiredSkills: string[]
): { percentage: number; matched: string[]; missing: string[] } {
  if (!requiredSkills || requiredSkills.length === 0) {
    return { percentage: 100, matched: [], missing: [] };
  }
  const normalizedApplicant = applicantSkills.map((s) => s.trim().toLowerCase());
  const matched: string[] = [];
  const missing: string[] = [];

  for (const req of requiredSkills) {
    const target = req.trim().toLowerCase();
    const found = normalizedApplicant.some(
      (skill) => skill === target || skill.includes(target) || target.includes(skill)
    );
    if (found) {
      matched.push(req);
    } else {
      missing.push(req);
    }
  }

  const percentage = Math.round((matched.length / requiredSkills.length) * 100);
  return { percentage, matched, missing };
}

export function calculateProfileCompletion(profile: Profile | null): number {
  if (!profile) return 0;
  const checks = [
    Boolean(profile.fullName?.trim()),
    Boolean(profile.email?.trim()),
    Boolean(profile.phone?.trim()),
    Boolean(profile.location?.trim()),
    Boolean(profile.education?.trim()),
    Boolean(profile.institution?.trim()),
    profile.skills.length > 0,
    Boolean(profile.bio?.trim()),
    Boolean(profile.cvFileName?.trim()),
  ];
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

export function generateSampleAgreementText(agreement?: Partial<InternshipAgreement>): string {
  const employer = agreement?.employerName || '[Verified Employer Organisation Name (DEMO)]';
  const applicant = agreement?.applicantName || '[Intern / Graduate Full Name]';
  const title = agreement?.title || '[Internship Role Title]';
  const start = agreement?.startDate ? formatDate(agreement.startDate) : '[Start Date]';
  const end = agreement?.endDate ? formatDate(agreement.endDate) : '[End Date]';
  const stipend =
    typeof agreement?.agreedStipendKes === 'number'
      ? formatKes(agreement.agreedStipendKes)
      : 'KES [Agreed Monthly Stipend]';
  const frequency = agreement?.paymentFrequency || 'Monthly';
  const hours = agreement?.workingHours || 'Monday – Friday, 8:00 AM – 4:30 PM EAT';

  return `====================================================================
KAZIREADY GARISSA — SAMPLE INTERNSHIP / ATTACHMENT AGREEMENT
(FOR INFORMATIONAL & TRANSPARENCY PURPOSES ONLY — NOT LEGAL ADVICE)
====================================================================

1. PARTIES TO THE AGREEMENT
   Host Organisation (Employer): ${employer}
   Intern / Trainee:             ${applicant}
   County / Location:            Garissa County, Kenya

2. POSITION & TRAINING SCOPE
   Role Title:                   ${title}
   Commencement Date:            ${start}
   Completion Date:              ${end}
   Working Hours:                ${hours}

3. MENTORSHIP & WORKPLACE RESPONSIBILITIES
   - The Host Organisation agrees to assign a qualified workplace supervisor,
     provide safe working conditions, and deliver structured practical skills
     training aligned with the internship description.
   - The Intern agrees to perform assigned learning tasks diligently, adhere to
     workplace safety and confidentiality standards, and maintain regular attendance.

4. STIPEND & PAYMENT TRANSPARENCY TERMS
   Agreed Stipend:               ${stipend}
   Payment Frequency:            ${frequency}
   Payment Tracking Notice:      Agreed payment dates and disbursed amounts may be
                                 recorded on KaziReady Garissa for transparency.
                                 KaziReady Garissa does not hold or transfer funds.

5. DOCUMENTATION & STATUTORY COMPLIANCE
   - Both parties confirm that required academic recommendation letters,
     identification documents, and statutory details (where applicable under
     Kenyan law) have been verified prior to onboarding.
   - Kenyan citizens generally do not require foreign-national work permits
     for ordinary employment or internships in Kenya.

6. TERMINATION & DISPUTE RESOLUTION
   - Either party may conclude the internship with at least seven (7) days
     written notice, or immediately for documented misconduct.
   - Unresolved stipend or workplace disputes may be escalated to the relevant
     TVET/university coordinator, Ministry of Labour office, or platform support.

7. SIGNATURES
   Employer Representative: ______________________   Date: ______________
   Intern / Trainee:        ______________________   Date: ______________

Disclaimer: This template is provided by KaziReady Garissa solely as an educational
and documentation readiness reference. Parties should consult qualified legal
counsel or the Ministry of Labour for binding legal advice.
`;
}

export function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
