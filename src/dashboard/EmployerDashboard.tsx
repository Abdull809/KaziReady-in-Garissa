import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  Wallet,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Pencil,
  Trash2,
  Upload,
  FileText,
  X,
} from 'lucide-react';
import { DashboardLayout, DashboardTabItem } from '@/src/layouts/DashboardLayout';
import { useAuth } from '@/src/authentication/AuthContext';
import { dataService } from '@/src/services/dataService';
import {
  Application,
  ApplicationStatus,
  Employer,
  InternshipAgreement,
  Opportunity,
  OpportunityType,
  PaymentFrequency,
  PaymentRecord,
  PaymentStatus,
} from '@/src/types';
import { GARISSA_LOCATIONS } from '@/src/utils/constants';
import { calculateSkillMatch, formatDate, formatKes } from '@/src/utils/formatters';
import { DonutBreakdownChart } from '@/src/components/Charts';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { useToast } from '@/src/hooks/useToast';

export function EmployerDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [employer, setEmployer] = useState<Employer | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [agreements, setAgreements] = useState<InternshipAgreement[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Org verification form state
  const [orgName, setOrgName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [sector, setSector] = useState('');
  const [orgLocation, setOrgLocation] = useState('Garissa Town');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [orgDesc, setOrgDesc] = useState('');
  const [verificationDocName, setVerificationDocName] = useState('');

  // Opportunity create/edit form
  const [editingOppId, setEditingOppId] = useState<string | null>(null);
  const [showOppForm, setShowOppForm] = useState(false);
  const [oppTitle, setOppTitle] = useState('');
  const [oppType, setOppType] = useState<OpportunityType>('Internship');
  const [oppCategory, setOppCategory] = useState('ICT and Technology');
  const [oppLocation, setOppLocation] = useState('Garissa Town');
  const [oppDesc, setOppDesc] = useState('');
  const [oppRequirements, setOppRequirements] = useState('');
  const [oppSkills, setOppSkills] = useState('');
  const [oppIsPaid, setOppIsPaid] = useState(true);
  const [oppStipend, setOppStipend] = useState('8000');
  const [oppDeadline, setOppDeadline] = useState('2026-12-30');

  // Delete confirmation
  const [deleteOppTarget, setDeleteOppTarget] = useState<Opportunity | null>(null);

  // Agreement modal
  const [agreementAppTarget, setAgreementAppTarget] = useState<Application | null>(null);
  const [agrStartDate, setAgrStartDate] = useState('2026-12-01');
  const [agrEndDate, setAgrEndDate] = useState('2027-02-28');
  const [agrStipend, setAgrStipend] = useState('8000');
  const [agrFreq, setAgrFreq] = useState<PaymentFrequency>('Monthly');
  const [agrHours, setAgrHours] = useState('Monday – Friday, 8:30 AM – 4:30 PM EAT');
  const [agrTerms, setAgrTerms] = useState('');

  // Payment update modal
  const [paymentEditTarget, setPaymentEditTarget] = useState<PaymentRecord | null>(null);
  const [payAmountAdded, setPayAmountAdded] = useState('0');
  const [payRef, setPayRef] = useState('');
  const [payNote, setPayNote] = useState('');
  const [payStatusOverride, setPayStatusOverride] = useState<PaymentStatus>('Paid');

  const loadEmployerWorkspace = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [emp, allOpps, allApps, allAgrs, allPays, cats] = await Promise.all([
        dataService.getEmployerByUserId(user.id),
        dataService.getOpportunities(true),
        dataService.getApplications(),
        dataService.getAgreements(),
        dataService.getPayments(),
        dataService.getCategories(),
      ]);
      setEmployer(emp);
      setCategories(cats);

      if (emp) {
        const myOpps = allOpps.filter((o) => o.employerId === emp.id);
        const myOppIds = new Set(myOpps.map((o) => o.id));
        setOpportunities(myOpps);
        setApplications(allApps.filter((a) => myOppIds.has(a.opportunityId)));
        setAgreements(allAgrs.filter((a) => a.employerId === emp.id));
        setPayments(allPays.filter((p) => p.employerId === emp.id));

        setOrgName(emp.organizationName);
        setRegNumber(emp.registrationNumber);
        setSector(emp.sector);
        setOrgLocation(emp.location);
        setContactName(emp.contactName);
        setContactEmail(emp.contactEmail);
        setContactPhone(emp.contactPhone);
        setWebsite(emp.website || '');
        setOrgDesc(emp.description);
        setVerificationDocName(emp.verificationDocumentName);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployerWorkspace();
  }, [user?.id]);

  const isVerified = employer?.verificationStatus === 'verified';
  const oppMap = useMemo(() => new Map(opportunities.map((o) => [o.id, o])), [opportunities]);

  const tabs: DashboardTabItem[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'verification', label: 'Organisation & Verification', icon: <Building2 className="h-4 w-4" /> },
    {
      id: 'opportunities',
      label: 'Opportunities',
      icon: <Briefcase className="h-4 w-4" />,
      badgeCount: opportunities.length,
    },
    {
      id: 'applicants',
      label: 'Applicants',
      icon: <Users className="h-4 w-4" />,
      badgeCount: applications.length,
    },
    { id: 'agreements', label: 'Agreements & Payments', icon: <Wallet className="h-4 w-4" /> },
  ];

  const handleSaveOrganisation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employer) return;
    if (!orgName.trim() || !regNumber.trim()) {
      showToast('Validation Error', 'Organisation name and registration number are required.', 'error');
      return;
    }
    await dataService.updateEmployer(employer.id, {
      organizationName: orgName.trim(),
      registrationNumber: regNumber.trim(),
      sector,
      location: orgLocation,
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      website: website.trim(),
      description: orgDesc.trim(),
      verificationDocumentName: verificationDocName.trim(),
    });
    await loadEmployerWorkspace();
    showToast(
      'Organisation Updated',
      'Your organisation profile and verification details have been saved.',
      'success'
    );
  };

  const openCreateOppForm = () => {
    setEditingOppId(null);
    setOppTitle('');
    setOppType('Internship');
    setOppCategory(categories[0] || 'ICT and Technology');
    setOppLocation(employer?.location || 'Garissa Town');
    setOppDesc('');
    setOppRequirements('');
    setOppSkills('');
    setOppIsPaid(true);
    setOppStipend('8000');
    setOppDeadline('2026-12-30');
    setShowOppForm(true);
  };

  const openEditOppForm = (opp: Opportunity) => {
    setEditingOppId(opp.id);
    setOppTitle(opp.title);
    setOppType(opp.opportunityType);
    setOppCategory(opp.category);
    setOppLocation(opp.location);
    setOppDesc(opp.description);
    setOppRequirements(opp.requirements.join('\n'));
    setOppSkills(opp.skillsRequired.join(', '));
    setOppIsPaid(opp.isPaid);
    setOppStipend(String(opp.stipendMonthlyKes));
    setOppDeadline(opp.deadline);
    setShowOppForm(true);
  };

  const handleSaveOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employer) return;
    if (!isVerified) {
      showToast(
        'Verification Required',
        'Unverified employers cannot publish public opportunities.',
        'error'
      );
      return;
    }

    const reqList = oppRequirements
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);
    const skillList = oppSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!oppTitle.trim() || !oppDesc.trim() || reqList.length === 0 || skillList.length === 0) {
      showToast(
        'Missing Fields',
        'Provide title, description, at least one requirement, and skills.',
        'error'
      );
      return;
    }

    try {
      if (editingOppId) {
        await dataService.updateOpportunity(editingOppId, {
          title: oppTitle.trim(),
          opportunityType: oppType,
          category: oppCategory,
          location: oppLocation,
          description: oppDesc.trim(),
          requirements: reqList,
          skillsRequired: skillList,
          isPaid: oppIsPaid,
          stipendMonthlyKes: oppIsPaid ? Number(oppStipend || 0) : 0,
          deadline: oppDeadline,
        });
        showToast('Opportunity Updated', 'Changes saved to the marketplace.', 'success');
      } else {
        await dataService.createOpportunity(employer.id, {
          title: oppTitle.trim(),
          opportunityType: oppType,
          category: oppCategory,
          location: oppLocation,
          description: oppDesc.trim(),
          requirements: reqList,
          skillsRequired: skillList,
          isPaid: oppIsPaid,
          stipendMonthlyKes: oppIsPaid ? Number(oppStipend || 0) : 0,
          deadline: oppDeadline,
          isOpen: true,
        });
        showToast(
          'Opportunity Published',
          'Listing is now live and matching applicants have been alerted.',
          'success'
        );
      }
      setShowOppForm(false);
      await loadEmployerWorkspace();
    } catch (err) {
      showToast('Action Blocked', err instanceof Error ? err.message : 'Unable to save listing.', 'error');
    }
  };

  const handleDeleteOpportunity = async () => {
    if (!deleteOppTarget) return;
    await dataService.deleteOpportunity(deleteOppTarget.id);
    setDeleteOppTarget(null);
    await loadEmployerWorkspace();
    showToast('Listing Deleted', 'The opportunity was removed.', 'success');
  };

  const handleUpdateAppStatus = async (appId: string, status: ApplicationStatus) => {
    await dataService.updateApplicationStatus(appId, status);
    await loadEmployerWorkspace();
    showToast('Status Updated', `Candidate status changed to ${status}.`, 'success');
  };

  const handleCreateAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employer || !agreementAppTarget) return;
    const opp = oppMap.get(agreementAppTarget.opportunityId);
    await dataService.createAgreement({
      applicationId: agreementAppTarget.id,
      opportunityId: agreementAppTarget.opportunityId,
      employerId: employer.id,
      applicantId: agreementAppTarget.applicantId,
      title: opp?.title || 'Internship Placement',
      employerName: employer.organizationName,
      applicantName: agreementAppTarget.fullName,
      startDate: agrStartDate,
      endDate: agrEndDate,
      agreedStipendKes: Number(agrStipend || 0),
      paymentFrequency: agrFreq,
      workingHours: agrHours.trim(),
      termsSummary:
        agrTerms.trim() ||
        `Structured ${opp?.opportunityType || 'Internship'} placement at ${employer.organizationName}.`,
      signedByEmployer: true,
      signedByApplicant: false,
    });
    setAgreementAppTarget(null);
    await loadEmployerWorkspace();
    showToast(
      'Internship Agreement Created',
      'Sent to applicant for signature and added to payment tracker.',
      'success'
    );
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentEditTarget) return;
    await dataService.updatePaymentRecord(
      paymentEditTarget.id,
      Number(payAmountAdded || 0),
      payRef,
      payNote,
      payStatusOverride
    );
    setPaymentEditTarget(null);
    setPayAmountAdded('0');
    setPayRef('');
    setPayNote('');
    await loadEmployerWorkspace();
    showToast('Payment Record Updated', 'Stipend tracker has been updated.', 'success');
  };

  const appStatusSegments = useMemo(() => {
    const counts: Record<ApplicationStatus, number> = {
      Pending: 0,
      'Under Review': 0,
      Shortlisted: 0,
      Accepted: 0,
      Rejected: 0,
    };
    for (const a of applications) counts[a.status] = (counts[a.status] || 0) + 1;
    return [
      { label: 'Pending', value: counts.Pending, color: '#D97706' },
      { label: 'Under Review', value: counts['Under Review'], color: '#10243A' },
      { label: 'Shortlisted', value: counts.Shortlisted, color: '#0F9D83' },
      { label: 'Accepted', value: counts.Accepted, color: '#16A34A' },
      { label: 'Rejected', value: counts.Rejected, color: '#DC2626' },
    ];
  }, [applications]);

  return (
    <DashboardLayout
      roleLabel="Employer Workspace"
      breadcrumb="Employer Dashboard"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {loading ? (
        <div className="space-y-4">
          <div className="h-24 rounded-xl border border-slate-200 bg-white animate-pulse" />
          <div className="h-64 rounded-xl border border-slate-200 bg-white animate-pulse" />
        </div>
      ) : (
        <>
          {/* Verification Status Banner */}
          <div
            className={`mb-6 rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isVerified
                ? 'border-[#0F9D83]/40 bg-white'
                : employer?.verificationStatus === 'rejected'
                ? 'border-red-200 bg-red-50'
                : 'border-amber-200 bg-amber-50'
            }`}
          >
            <div className="flex items-start gap-3">
              {isVerified ? (
                <ShieldCheck className="h-6 w-6 text-[#0F9D83] shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="h-6 w-6 text-amber-700 shrink-0 mt-0.5" />
              )}
              <div>
                <h2 className="text-sm font-bold text-[#10243A]">
                  {employer?.organizationName} — Verification Status:{' '}
                  <span className="uppercase">{employer?.verificationStatus || 'pending'}</span>
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  {isVerified
                    ? 'Your organisation is verified. You can publish public opportunities and manage agreements.'
                    : 'Unverified employers cannot publish public opportunities. Submit your registration document below for administrator approval.'}
                </p>
              </div>
            </div>
            {!isVerified && (
              <button
                type="button"
                onClick={() => setActiveTab('verification')}
                className="rounded-lg bg-[#10243A] px-4 py-2 text-xs font-semibold text-white shrink-0"
              >
                Review Verification Details
              </button>
            )}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Published Listings', value: opportunities.length },
                  { label: 'Total Applicants', value: applications.length },
                  {
                    label: 'Shortlisted / Accepted',
                    value: applications.filter(
                      (a) => a.status === 'Shortlisted' || a.status === 'Accepted'
                    ).length,
                  },
                  { label: 'Active Agreements', value: agreements.length },
                ].map((k) => (
                  <div key={k.label} className="rounded-xl border border-slate-200 bg-white p-5">
                    <p className="text-xs font-medium text-slate-500">{k.label}</p>
                    <p className="mt-2 font-mono text-2xl font-bold text-[#10243A] tabular-nums">
                      {k.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DonutBreakdownChart
                  title="Applicant Pipeline Breakdown"
                  subtitle="Status across all your published opportunities"
                  segments={appStatusSegments}
                />

                <div className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#10243A]">Quick Actions</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Manage postings, review candidates, and record stipend schedules.
                    </p>
                  </div>
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('opportunities');
                        if (isVerified) openCreateOppForm();
                      }}
                      disabled={!isVerified}
                      className="rounded-lg bg-[#0F9D83] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0B7D68] disabled:opacity-50"
                    >
                      + Publish Opportunity
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('applicants')}
                      className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-[#10243A] hover:bg-slate-50"
                    >
                      Review Applicants ({applications.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('agreements')}
                      className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-[#10243A] hover:bg-slate-50"
                    >
                      Update Stipend Payments
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('verification')}
                      className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-[#10243A] hover:bg-slate-50"
                    >
                      Edit Organisation Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORGANISATION & VERIFICATION */}
          {activeTab === 'verification' && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 max-w-3xl">
              <h2 className="text-lg font-bold text-[#10243A]">
                Organisation Profile &amp; Verification Documents
              </h2>
              <p className="mt-1 text-xs text-slate-600 mb-6">
                Administrators review these details before awarding the Verified Employer badge.
              </p>

              <form onSubmit={handleSaveOrganisation} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#10243A] mb-1">
                      Organisation Name *
                    </label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#10243A] mb-1">
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#10243A] mb-1">Sector</label>
                    <select
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#10243A] mb-1">
                      Primary Garissa Location
                    </label>
                    <select
                      value={orgLocation}
                      onChange={(e) => setOrgLocation(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      {GARISSA_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#10243A] mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#10243A] mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#10243A] mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#10243A] mb-1">
                      Website (Optional)
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#10243A] mb-1">
                    Organisation Description
                  </label>
                  <textarea
                    rows={3}
                    value={orgDesc}
                    onChange={(e) => setOrgDesc(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#10243A] mb-1">
                    Verification Supporting Document (Business Permit / Certificate)
                  </label>
                  <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-[#F5F8FA] p-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#10243A]">
                      <Upload className="h-3.5 w-3.5 text-[#0F9D83]" />
                      Upload Document
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setVerificationDocName(file.name);
                        }}
                      />
                    </label>
                    <span className="text-xs text-slate-600 truncate">
                      {verificationDocName || 'No verification document uploaded yet'}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="rounded-lg bg-[#0F9D83] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0B7D68]"
                >
                  Save &amp; Submit Verification Details
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: OPPORTUNITIES MANAGER */}
          {activeTab === 'opportunities' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#10243A]">Manage Published Opportunities</h2>
                  <p className="text-xs text-slate-500">
                    {isVerified
                      ? 'Create, edit, or close internship and job listings.'
                      : 'Publishing is disabled until your organisation is verified by an administrator.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openCreateOppForm}
                  disabled={!isVerified}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F9D83] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0B7D68] disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Publish Opportunity
                </button>
              </div>

              {showOppForm && (
                <form
                  onSubmit={handleSaveOpportunity}
                  className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <h3 className="text-base font-bold text-[#10243A]">
                      {editingOppId ? 'Edit Opportunity' : 'Publish New Opportunity'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowOppForm(false)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#10243A] mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={oppTitle}
                        onChange={(e) => setOppTitle(e.target.value)}
                        placeholder="e.g. ICT Support Intern"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#10243A] mb-1">
                        Type *
                      </label>
                      <select
                        value={oppType}
                        onChange={(e) => setOppType(e.target.value as OpportunityType)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        <option value="Internship">Internship</option>
                        <option value="Job">Job</option>
                        <option value="Attachment">Attachment</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#10243A] mb-1">
                        Category *
                      </label>
                      <select
                        value={oppCategory}
                        onChange={(e) => setOppCategory(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#10243A] mb-1">
                        Garissa Location *
                      </label>
                      <select
                        value={oppLocation}
                        onChange={(e) => setOppLocation(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        {GARISSA_LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#10243A] mb-1">
                        Deadline *
                      </label>
                      <input
                        type="date"
                        value={oppDeadline}
                        onChange={(e) => setOppDeadline(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#10243A] mb-1">
                        Paid Stipend?
                      </label>
                      <select
                        value={oppIsPaid ? 'paid' : 'unpaid'}
                        onChange={(e) => setOppIsPaid(e.target.value === 'paid')}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        <option value="paid">Paid Stipend</option>
                        <option value="unpaid">Unpaid / Academic</option>
                      </select>
                    </div>
                    {oppIsPaid && (
                      <div>
                        <label className="block text-xs font-semibold text-[#10243A] mb-1">
                          Monthly Stipend (KES)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={oppStipend}
                          onChange={(e) => setOppStipend(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#10243A] mb-1">
                      Description *
                    </label>
                    <textarea
                      rows={3}
                      value={oppDesc}
                      onChange={(e) => setOppDesc(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#10243A] mb-1">
                        Requirements (one per line) *
                      </label>
                      <textarea
                        rows={3}
                        value={oppRequirements}
                        onChange={(e) => setOppRequirements(e.target.value)}
                        placeholder="Diploma in ICT&#10;Basic networking skills"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#10243A] mb-1">
                        Required Skills (comma-separated) *
                      </label>
                      <textarea
                        rows={3}
                        value={oppSkills}
                        onChange={(e) => setOppSkills(e.target.value)}
                        placeholder="Networking, Windows & Linux, Customer Support"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowOppForm(false)}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-[#0F9D83] px-5 py-2 text-xs font-semibold text-white hover:bg-[#0B7D68]"
                    >
                      {editingOppId ? 'Save Changes' : 'Publish Opportunity'}
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {opportunities.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
                    No opportunities published yet.
                  </div>
                ) : (
                  opportunities.map((opp) => (
                    <div
                      key={opp.id}
                      className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-xs text-slate-500">
                          {opp.opportunityType} · {opp.category} · {opp.location}
                        </p>
                        <h3 className="text-base font-bold text-[#10243A] mt-0.5">{opp.title}</h3>
                        <p className="mt-1 font-mono text-xs text-slate-600 tabular-nums">
                          {opp.isPaid ? formatKes(opp.stipendMonthlyKes) : 'Unpaid'} · Deadline:{' '}
                          {formatDate(opp.deadline)} · {opp.isOpen ? 'Open' : 'Closed'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditOppForm(opp)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#10243A] hover:bg-slate-50"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteOppTarget(opp)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: APPLICANTS REVIEW */}
          {activeTab === 'applicants' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#10243A]">Applicant Review Queue</h2>
              {applications.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
                  No applications received yet.
                </div>
              ) : (
                applications.map((app) => {
                  const opp = oppMap.get(app.opportunityId);
                  const match = opp
                    ? calculateSkillMatch(app.skills, opp.skillsRequired)
                    : { percentage: 0 };
                  return (
                    <div
                      key={app.id}
                      className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold text-[#0F9D83]">
                            Applied for: {opp?.title || app.opportunityId} · Skill Match:{' '}
                            <span className="font-mono tabular-nums">{match.percentage}%</span>
                          </p>
                          <h3 className="mt-1 text-base font-bold text-[#10243A]">{app.fullName}</h3>
                          <p className="text-xs text-slate-600">
                            {app.education} · {app.institution} · {app.phone} · {app.email}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={app.status}
                            onChange={(e) =>
                              handleUpdateAppStatus(app.id, e.target.value as ApplicationStatus)
                            }
                            aria-label={`Change status for ${app.fullName}`}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#10243A]"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                          </select>

                          {(app.status === 'Shortlisted' || app.status === 'Accepted') && (
                            <button
                              type="button"
                              onClick={() => {
                                setAgreementAppTarget(app);
                                setAgrStipend(String(opp?.stipendMonthlyKes || 8000));
                                setAgrTerms('');
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#10243A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1A3656]"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Issue Agreement
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="rounded-lg bg-[#F5F8FA] p-4 text-xs text-slate-700 space-y-1.5">
                        <p>
                          <strong>Skills:</strong> {app.skills.join(', ')}
                        </p>
                        <p>
                          <strong>CV File:</strong> <span className="font-mono">{app.cvFileName}</span>
                        </p>
                        <p>
                          <strong>Cover Letter:</strong> {app.coverLetter}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 5: AGREEMENTS & PAYMENTS */}
          {activeTab === 'agreements' && (
            <div className="space-y-8">
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-bold text-[#10243A] mb-4">Internship Agreements</h2>
                {agreements.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    No internship agreements issued yet. Accept or shortlist a candidate under Applicants to issue an agreement.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {agreements.map((agr) => (
                      <div
                        key={agr.id}
                        className="rounded-lg border border-slate-200 bg-[#F5F8FA] p-4 flex flex-wrap items-center justify-between gap-4"
                      >
                        <div>
                          <p className="text-xs font-semibold text-[#0F9D83]">
                            {agr.status} · Applicant Signed: {agr.signedByApplicant ? 'Yes' : 'Pending'}
                          </p>
                          <h3 className="text-sm font-bold text-[#10243A]">
                            {agr.applicantName} — {agr.title}
                          </h3>
                          <p className="font-mono text-xs text-slate-600 tabular-nums">
                            {formatKes(agr.agreedStipendKes)} / {agr.paymentFrequency} ·{' '}
                            {formatDate(agr.startDate)} – {formatDate(agr.endDate)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-bold text-[#10243A] mb-1">
                  Stipend Payment Records (Tracking Only)
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  Record stipend disbursements to keep payment timelines transparent for interns.
                </p>

                {payments.length === 0 ? (
                  <p className="text-sm text-slate-600">No payment schedules created yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F5F8FA] border-b border-slate-200 text-slate-600 font-semibold">
                        <tr>
                          <th className="px-4 py-3">Intern</th>
                          <th className="px-4 py-3">Role / Cycle</th>
                          <th className="px-4 py-3">Agreed</th>
                          <th className="px-4 py-3">Paid</th>
                          <th className="px-4 py-3">Balance</th>
                          <th className="px-4 py-3">Due Date</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {payments.map((pay) => (
                          <tr key={pay.id}>
                            <td className="px-4 py-3 font-semibold text-[#10243A]">
                              {pay.applicantName}
                            </td>
                            <td className="px-4 py-3 text-slate-700">{pay.internshipTitle}</td>
                            <td className="px-4 py-3 font-mono tabular-nums">
                              {formatKes(pay.agreedStipendKes)}
                            </td>
                            <td className="px-4 py-3 font-mono font-semibold text-[#0F9D83] tabular-nums">
                              {formatKes(pay.amountPaidKes)}
                            </td>
                            <td className="px-4 py-3 font-mono tabular-nums">
                              {formatKes(pay.outstandingBalanceKes)}
                            </td>
                            <td className="px-4 py-3 font-mono tabular-nums">
                              {formatDate(pay.expectedPaymentDate)}
                            </td>
                            <td className="px-4 py-3 font-semibold">{pay.status}</td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setPaymentEditTarget(pay);
                                  setPayAmountAdded(String(pay.outstandingBalanceKes));
                                  setPayStatusOverride('Paid');
                                }}
                                className="rounded-md bg-[#10243A] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#1A3656]"
                              >
                                Update
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteOppTarget)}
        title="Delete Opportunity Listing?"
        message={`Are you sure you want to delete "${deleteOppTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Listing"
        destructive
        onConfirm={handleDeleteOpportunity}
        onCancel={() => setDeleteOppTarget(null)}
      />

      {/* Issue Agreement Modal */}
      {agreementAppTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#10243A]/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#10243A]">
                Issue Internship Agreement — {agreementAppTarget.fullName}
              </h3>
              <button
                type="button"
                onClick={() => setAgreementAppTarget(null)}
                className="p-1 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAgreement} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#10243A] mb-1">Start Date</label>
                  <input
                    type="date"
                    value={agrStartDate}
                    onChange={(e) => setAgrStartDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#10243A] mb-1">End Date</label>
                  <input
                    type="date"
                    value={agrEndDate}
                    onChange={(e) => setAgrEndDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#10243A] mb-1">
                    Agreed Stipend (KES)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={agrStipend}
                    onChange={(e) => setAgrStipend(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#10243A] mb-1">Frequency</label>
                  <select
                    value={agrFreq}
                    onChange={(e) => setAgrFreq(e.target.value as PaymentFrequency)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Bi-weekly">Bi-weekly</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#10243A] mb-1">Working Hours</label>
                <input
                  type="text"
                  value={agrHours}
                  onChange={(e) => setAgrHours(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#10243A] mb-1">
                  Summary of Terms
                </label>
                <textarea
                  rows={2}
                  value={agrTerms}
                  onChange={(e) => setAgrTerms(e.target.value)}
                  placeholder="Outline mentorship, deliverables, and stipend payment day..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAgreementAppTarget(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0F9D83] px-4 py-2 text-xs font-semibold text-white"
                >
                  Create &amp; Sign Agreement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Payment Modal */}
      {paymentEditTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#10243A]/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#10243A]">
                Update Stipend Payment Record
              </h3>
              <button
                type="button"
                onClick={() => setPaymentEditTarget(null)}
                className="p-1 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleUpdatePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#10243A] mb-1">
                  Amount Disbursed Now (KES)
                </label>
                <input
                  type="number"
                  min={0}
                  max={paymentEditTarget.outstandingBalanceKes}
                  value={payAmountAdded}
                  onChange={(e) => setPayAmountAdded(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#10243A] mb-1">
                  Payment Status
                </label>
                <select
                  value={payStatusOverride}
                  onChange={(e) => setPayStatusOverride(e.target.value as PaymentStatus)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#10243A] mb-1">
                  Payment Reference / Receipt No.
                </label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. MPESA-REF-001"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#10243A] mb-1">Note</label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="e.g. Monthly stipend settled"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentEditTarget(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0F9D83] px-4 py-2 text-xs font-semibold text-white"
                >
                  Save Payment Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
