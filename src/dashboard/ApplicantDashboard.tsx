import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  Wallet,
  FileCheck2,
  Bell,
  UserCog,
  CheckSquare,
  Square,
  Download,
  Flag,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { DashboardLayout, DashboardTabItem } from '@/src/layouts/DashboardLayout';
import { useAuth } from '@/src/authentication/AuthContext';
import { dataService } from '@/src/services/dataService';
import {
  Application,
  Employer,
  InternshipAgreement,
  NotificationItem,
  Opportunity,
  PaymentRecord,
  SavedOpportunity,
} from '@/src/types';
import {
  calculateProfileCompletion,
  calculateSkillMatch,
  downloadTextFile,
  formatDate,
  formatKes,
  generateSampleAgreementText,
} from '@/src/utils/formatters';
import { DOCUMENT_CHECKLIST_ITEMS, GARISSA_LOCATIONS } from '@/src/utils/constants';
import { OpportunityCard } from '@/src/components/OpportunityCard';
import { ApplyModal } from '@/src/components/ApplyModal';
import { useToast } from '@/src/hooks/useToast';

export function ApplicantDashboard() {
  const { user, updateUserProfile } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedItems, setSavedItems] = useState<SavedOpportunity[]>([]);
  const [agreements, setAgreements] = useState<InternshipAgreement[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [applyTarget, setApplyTarget] = useState<Opportunity | null>(null);
  const [delayModalPayment, setDelayModalPayment] = useState<PaymentRecord | null>(null);
  const [delayNote, setDelayNote] = useState('');

  // Profile edit state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Garissa Town');
  const [education, setEducation] = useState('');
  const [institution, setInstitution] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [bio, setBio] = useState('');
  const [cvFileName, setCvFileName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const loadDashboard = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [opps, emps, apps, saved, agrs, pays, notifs] = await Promise.all([
        dataService.getOpportunities(false),
        dataService.getEmployers(),
        dataService.getApplications(),
        dataService.getSavedOpportunities(user.id),
        dataService.getAgreements(),
        dataService.getPayments(),
        dataService.getNotifications(user.id),
      ]);
      setOpportunities(opps);
      setEmployers(emps);
      setApplications(apps.filter((a) => a.applicantId === user.id));
      setSavedItems(saved);
      setAgreements(agrs.filter((a) => a.applicantId === user.id));
      setPayments(pays.filter((p) => p.applicantId === user.id));
      setNotifications(notifs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setLocation(user.location || 'Garissa Town');
      setEducation(user.education || '');
      setInstitution(user.institution || '');
      setSkillsText((user.skills || []).join(', '));
      setBio(user.bio || '');
      setCvFileName(user.cvFileName || '');
    }
  }, [user]);

  const employerMap = useMemo(() => new Map(employers.map((e) => [e.id, e])), [employers]);
  const oppMap = useMemo(() => new Map(opportunities.map((o) => [o.id, o])), [opportunities]);
  const savedIds = useMemo(() => new Set(savedItems.map((s) => s.opportunityId)), [savedItems]);
  const appliedIds = useMemo(() => new Set(applications.map((a) => a.opportunityId)), [applications]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const profileCompletion = calculateProfileCompletion(user);

  const recommendedOpps = useMemo(() => {
    if (!user) return [];
    return [...opportunities]
      .sort(
        (a, b) =>
          calculateSkillMatch(user.skills, b.skillsRequired).percentage -
          calculateSkillMatch(user.skills, a.skillsRequired).percentage
      )
      .slice(0, 3);
  }, [opportunities, user]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((a) => a.status === 'Pending' || a.status === 'Under Review').length,
      shortlisted: applications.filter((a) => a.status === 'Shortlisted').length,
      accepted: applications.filter((a) => a.status === 'Accepted').length,
    };
  }, [applications]);

  const tabs: DashboardTabItem[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
    {
      id: 'applications',
      label: 'My Applications',
      icon: <Briefcase className="h-4 w-4" />,
      badgeCount: applications.length,
    },
    {
      id: 'saved',
      label: 'Saved Listings',
      icon: <Bookmark className="h-4 w-4" />,
      badgeCount: savedItems.length,
    },
    { id: 'payments', label: 'Agreements & Payments', icon: <Wallet className="h-4 w-4" /> },
    { id: 'checklist', label: 'Documentation Checklist', icon: <FileCheck2 className="h-4 w-4" /> },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="h-4 w-4" />,
      badgeCount: unreadCount,
    },
    { id: 'profile', label: 'Edit Profile', icon: <UserCog className="h-4 w-4" /> },
  ];

  const handleToggleSave = async (oppId: string) => {
    if (!user) return;
    const saved = await dataService.toggleSaveOpportunity(user.id, oppId);
    await loadDashboard();
    showToast(saved ? 'Opportunity saved' : 'Removed from saved', undefined, 'success');
  };

  const handleToggleDocItem = async (id: string) => {
    if (!user) return;
    const current = user.documentChecklist || {};
    const updated = { ...current, [id]: !current[id] };
    await updateUserProfile({ documentChecklist: updated });
    showToast('Checklist updated', undefined, 'success');
  };

  const handleSignAgreement = async (agreementId: string) => {
    await dataService.signAgreement(agreementId, 'applicant');
    await loadDashboard();
    showToast('Agreement Signed', 'Your signature has been recorded.', 'success');
  };

  const handleReportDelayedPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !delayModalPayment || !delayNote.trim()) return;
    await dataService.reportDelayedPayment(delayModalPayment.id, user, delayNote);
    setDelayModalPayment(null);
    setDelayNote('');
    await loadDashboard();
    showToast(
      'Delayed Payment Reported',
      'Your report has been logged for administrator review.',
      'success'
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Validation Error', 'Full name cannot be empty.', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      await updateUserProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        location,
        education: education.trim(),
        institution: institution.trim(),
        skills: skillsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        bio: bio.trim(),
        cvFileName: cvFileName.trim(),
      });
      showToast('Profile Saved', 'Your applicant profile has been updated.', 'success');
    } catch (err) {
      showToast('Update Failed', err instanceof Error ? err.message : 'Error saving profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'Accepted':
      case 'Paid':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Shortlisted':
      case 'Under Review':
        return 'text-[#0F9D83] bg-[#0F9D83]/10 border-[#0F9D83]/30';
      case 'Overdue':
      case 'Rejected':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-amber-700 bg-amber-50 border-amber-200';
    }
  };

  return (
    <DashboardLayout
      roleLabel="Applicant / Student Workspace"
      breadcrumb="Applicant Dashboard"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {loading ? (
        <div className="space-y-4">
          <div className="h-28 rounded-xl border border-slate-200 bg-white animate-pulse" />
          <div className="h-64 rounded-xl border border-slate-200 bg-white animate-pulse" />
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Welcome & Profile Completion */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <p className="text-xs font-semibold text-[#0F9D83]">
                    {user?.location || 'Garissa County'} · {user?.institution || 'TVET / Graduate Profile'}
                  </p>
                  <h1 className="mt-1 text-2xl font-extrabold text-[#10243A]">
                    Welcome, {user?.fullName}
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Track your applications, document readiness, skill matches, and stipend schedules.
                  </p>
                </div>

                <div className="w-full lg:w-72 rounded-lg border border-slate-200 bg-[#F5F8FA] p-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-[#10243A]">Profile Completion</span>
                    <span className="font-mono font-bold text-[#0F9D83] tabular-nums">
                      {profileCompletion}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-xs bg-white overflow-hidden">
                    <div
                      className="h-full bg-[#0F9D83]"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="mt-2.5 text-xs font-semibold text-[#10243A] hover:text-[#0F9D83]"
                  >
                    Update skills &amp; CV →
                  </button>
                </div>
              </div>

              {/* 4 KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Applications', value: stats.total },
                  { label: 'Pending / In Review', value: stats.pending },
                  { label: 'Shortlisted', value: stats.shortlisted },
                  { label: 'Accepted', value: stats.accepted },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-xl border border-slate-200 bg-white p-5"
                  >
                    <p className="text-xs font-medium text-slate-500">{kpi.label}</p>
                    <p className="mt-2 font-mono text-2xl font-bold text-[#10243A] tabular-nums">
                      {kpi.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Recommended Internships by Skill Match */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#10243A]">
                      Recommended Opportunities (Skill Matched)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Ranked by comparing your profile skills with verified employer requirements.
                    </p>
                  </div>
                  <Link
                    to="/opportunities"
                    className="text-xs font-semibold text-[#0F9D83] hover:underline"
                  >
                    Browse All
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendedOpps.map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      employer={employerMap.get(opp.employerId)}
                      applicantSkills={user?.skills || []}
                      isSaved={savedIds.has(opp.id)}
                      hasApplied={appliedIds.has(opp.id)}
                      onToggleSave={handleToggleSave}
                      onApplyClick={(o) => setApplyTarget(o)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#10243A]">Application Tracker</h2>
                  <p className="text-xs text-slate-500">
                    Real-time statuses updated by verified employers.
                  </p>
                </div>
                <Link
                  to="/opportunities"
                  className="rounded-lg bg-[#0F9D83] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0B7D68]"
                >
                  Apply to More
                </Link>
              </div>

              {applications.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-sm text-slate-600">You have not submitted any applications yet.</p>
                  <Link
                    to="/opportunities"
                    className="mt-4 inline-block rounded-lg bg-[#10243A] px-4 py-2 text-xs font-semibold text-white"
                  >
                    Find Opportunities
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#F5F8FA] text-xs font-semibold text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3">Role Title</th>
                        <th className="px-5 py-3">Employer</th>
                        <th className="px-5 py-3">Applied On</th>
                        <th className="px-5 py-3">CV Attached</th>
                        <th className="px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {applications.map((app) => {
                        const opp = oppMap.get(app.opportunityId);
                        const emp = opp ? employerMap.get(opp.employerId) : undefined;
                        return (
                          <tr key={app.id} className="hover:bg-[#F5F8FA]/60">
                            <td className="px-5 py-3.5 font-semibold text-[#10243A]">
                              <Link to={`/opportunities/${app.opportunityId}`} className="hover:text-[#0F9D83]">
                                {opp?.title || app.opportunityId}
                              </Link>
                            </td>
                            <td className="px-5 py-3.5 text-slate-700">
                              {emp?.organizationName || 'Verified Employer'}
                            </td>
                            <td className="px-5 py-3.5 font-mono text-xs text-slate-600 tabular-nums">
                              {formatDate(app.createdAt)}
                            </td>
                            <td className="px-5 py-3.5 text-xs text-slate-600">
                              {app.cvFileName}
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-semibold ${statusColor(
                                  app.status
                                )}`}
                              >
                                {app.status}
                              </span>
                              {app.employerNotes && (
                                <p className="mt-1 text-xs text-slate-500">{app.employerNotes}</p>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAVED OPPORTUNITIES */}
          {activeTab === 'saved' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#10243A]">Saved Opportunities</h2>
              {savedItems.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                  <p className="text-sm text-slate-600">No saved opportunities yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedItems
                    .map((s) => oppMap.get(s.opportunityId))
                    .filter((o): o is Opportunity => Boolean(o))
                    .map((opp) => (
                      <OpportunityCard
                        key={opp.id}
                        opportunity={opp}
                        employer={employerMap.get(opp.employerId)}
                        applicantSkills={user?.skills || []}
                        isSaved={true}
                        hasApplied={appliedIds.has(opp.id)}
                        onToggleSave={handleToggleSave}
                        onApplyClick={(o) => setApplyTarget(o)}
                      />
                    ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AGREEMENTS & PAYMENT TRACKER */}
          {activeTab === 'payments' && (
            <div className="space-y-8">
              {/* Disclaimer */}
              <div className="rounded-xl border border-slate-200 bg-[#10243A] text-white p-5 text-xs sm:text-sm">
                <strong>Payment Transparency Notice:</strong> This ledger tracks agreed internship stipends, due dates, and employer-recorded disbursements for accountability. KaziReady Garissa does <strong>not</strong> hold, process, or transfer user funds.
              </div>

              {/* Agreements */}
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-bold text-[#10243A] mb-4">My Internship Agreements</h2>
                {agreements.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    No internship agreements issued yet. Once an employer accepts your application and issues an agreement, it will appear here.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {agreements.map((agr) => (
                      <div
                        key={agr.id}
                        className="rounded-lg border border-slate-200 bg-[#F5F8FA] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-semibold text-[#0F9D83]">{agr.status}</span>
                            <span>·</span>
                            <span className="font-mono tabular-nums">
                              {formatDate(agr.startDate)} – {formatDate(agr.endDate)}
                            </span>
                          </div>
                          <h3 className="mt-1 text-base font-bold text-[#10243A]">
                            {agr.title} — {agr.employerName}
                          </h3>
                          <p className="mt-1 text-xs text-slate-600 max-w-2xl">{agr.termsSummary}</p>
                          <p className="mt-2 font-mono text-xs font-semibold text-[#10243A] tabular-nums">
                            Agreed Stipend: {formatKes(agr.agreedStipendKes)} ({agr.paymentFrequency}) · Hours: {agr.workingHours}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              downloadTextFile(
                                `Agreement_${agr.id}.txt`,
                                generateSampleAgreementText(agr)
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#10243A] hover:bg-slate-50"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download Copy
                          </button>

                          {!agr.signedByApplicant ? (
                            <button
                              type="button"
                              onClick={() => handleSignAgreement(agr.id)}
                              className="rounded-lg bg-[#0F9D83] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0B7D68]"
                            >
                              Sign Agreement
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F9D83] px-2">
                              <CheckCircle2 className="h-4 w-4" />
                              Signed
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Tracker */}
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-bold text-[#10243A] mb-4">Stipend Payment Tracker</h2>
                {payments.length === 0 ? (
                  <p className="text-sm text-slate-600">No tracked stipend schedules yet.</p>
                ) : (
                  <div className="space-y-4">
                    {payments.map((pay) => (
                      <div key={pay.id} className="rounded-lg border border-slate-200 p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                          <div>
                            <h3 className="text-base font-bold text-[#10243A]">
                              {pay.internshipTitle}
                            </h3>
                            <p className="text-xs text-slate-600">{pay.employerName}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${statusColor(
                                pay.status
                              )}`}
                            >
                              {pay.status}
                            </span>
                            {pay.outstandingBalanceKes > 0 && (
                              <button
                                type="button"
                                onClick={() => setDelayModalPayment(pay)}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                              >
                                <Flag className="h-3.5 w-3.5" />
                                Report Delayed Payment
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
                          <div>
                            <span className="text-slate-500 block">Agreed Stipend</span>
                            <span className="font-mono font-bold text-[#10243A] tabular-nums">
                              {formatKes(pay.agreedStipendKes)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Frequency</span>
                            <span className="font-semibold text-[#10243A]">
                              {pay.paymentFrequency}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Expected Date</span>
                            <span className="font-mono font-semibold text-[#10243A] tabular-nums">
                              {formatDate(pay.expectedPaymentDate)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Amount Paid</span>
                            <span className="font-mono font-bold text-[#0F9D83] tabular-nums">
                              {formatKes(pay.amountPaidKes)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Outstanding Balance</span>
                            <span className="font-mono font-bold text-[#10243A] tabular-nums">
                              {formatKes(pay.outstandingBalanceKes)}
                            </span>
                          </div>
                        </div>

                        {pay.history.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-slate-100">
                            <p className="text-xs font-semibold text-slate-600 mb-2">
                              Payment History
                            </p>
                            <div className="space-y-1.5">
                              {pay.history.map((h) => (
                                <div
                                  key={h.id}
                                  className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 bg-[#F5F8FA] rounded-md px-3 py-2"
                                >
                                  <span>
                                    <strong className="font-mono text-[#10243A]">{h.reference}</strong> ·{' '}
                                    {h.note}
                                  </span>
                                  <span className="font-mono font-semibold text-[#0F9D83] tabular-nums">
                                    {formatKes(h.amountKes)} ({formatDate(h.date)})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: DOCUMENTATION CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-[#10243A]">
                    Work Document Readiness Checklist
                  </h2>
                  <p className="text-xs text-slate-500">
                    Keep your essential employment documents ready before applying.
                  </p>
                </div>
                <Link
                  to="/documentation"
                  className="rounded-lg bg-[#10243A] px-4 py-2 text-xs font-semibold text-white"
                >
                  Open Full Documentation Centre
                </Link>
              </div>

              <div className="space-y-3">
                {DOCUMENT_CHECKLIST_ITEMS.map((item) => {
                  const checked = Boolean(user?.documentChecklist?.[item.id]);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleDocItem(item.id)}
                      className={`w-full flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
                        checked
                          ? 'border-[#0F9D83]/50 bg-[#0F9D83]/5'
                          : 'border-slate-200 hover:bg-[#F5F8FA]'
                      }`}
                    >
                      {checked ? (
                        <CheckSquare className="h-5 w-5 text-[#0F9D83] shrink-0 mt-0.5" />
                      ) : (
                        <Square className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="text-sm font-semibold text-[#10243A] block">
                          {item.label}
                        </span>
                        <span className="text-xs text-slate-600">{item.description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[#10243A]">
                  Notifications &amp; Opportunity Alerts
                </h2>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!user) return;
                      await dataService.markAllNotificationsRead(user.id);
                      await loadDashboard();
                    }}
                    className="text-xs font-semibold text-[#0F9D83] hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className="text-sm text-slate-600 py-6 text-center">No notifications yet.</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`rounded-lg border p-4 flex items-start justify-between gap-4 ${
                        n.read ? 'border-slate-200 bg-white' : 'border-[#0F9D83]/40 bg-[#0F9D83]/5'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-[#10243A]">{n.title}</p>
                        <p className="mt-1 text-xs text-slate-600">{n.message}</p>
                        <p className="mt-1.5 font-mono text-[11px] text-slate-400">
                          {formatDate(n.createdAt)}
                        </p>
                      </div>
                      {!n.read && (
                        <button
                          type="button"
                          onClick={async () => {
                            await dataService.markNotificationRead(n.id);
                            await loadDashboard();
                          }}
                          className="text-xs font-semibold text-[#0F9D83] shrink-0"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: PROFILE EDITOR */}
          {activeTab === 'profile' && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 max-w-3xl">
              <h2 className="text-lg font-bold text-[#10243A] mb-1">Edit Applicant Profile</h2>
              <p className="text-xs text-slate-500 mb-6">
                Keeping your skills and CV updated improves your Skill Match score on opportunities.
              </p>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#10243A] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#10243A] mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#10243A] mb-1">
                      Garissa Location
                    </label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
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
                      Education Qualification
                    </label>
                    <input
                      type="text"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      placeholder="e.g. Diploma in ICT"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#10243A] mb-1">
                    Institution / TVET / University
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#10243A] mb-1">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    placeholder="e.g. Networking, Data Entry, Excel, React"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#10243A] mb-1">
                    Bio / Career Summary
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#10243A] mb-1">
                    Default CV File
                  </label>
                  <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-[#F5F8FA] p-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#10243A]">
                      <Upload className="h-3.5 w-3.5 text-[#0F9D83]" />
                      Upload CV
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setCvFileName(file.name);
                        }}
                      />
                    </label>
                    <span className="text-xs text-slate-600 truncate">
                      {cvFileName || 'No CV uploaded yet'}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="rounded-lg bg-[#0F9D83] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0B7D68]"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}
        </>
      )}

      <ApplyModal
        opportunity={applyTarget}
        employer={applyTarget ? employerMap.get(applyTarget.employerId) : undefined}
        isOpen={Boolean(applyTarget)}
        onClose={() => setApplyTarget(null)}
        onSuccess={loadDashboard}
      />

      {/* Delayed Payment Report Modal */}
      {delayModalPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#10243A]/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-[#10243A]">Report Delayed Stipend Payment</h3>
              <button
                type="button"
                onClick={() => setDelayModalPayment(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 mb-4 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Reporting {delayModalPayment.internshipTitle} ({formatKes(delayModalPayment.outstandingBalanceKes)} outstanding).
              </span>
            </div>
            <form onSubmit={handleReportDelayedPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#10243A] mb-1">
                  Details of Delay *
                </label>
                <textarea
                  rows={3}
                  value={delayNote}
                  onChange={(e) => setDelayNote(e.target.value)}
                  placeholder="Describe when the payment was expected and any communication with the employer..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDelayModalPayment(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Submit Delay Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
