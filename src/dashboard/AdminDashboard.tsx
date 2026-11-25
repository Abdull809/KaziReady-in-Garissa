import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  Flag,
  Briefcase,
  Users,
  Tags,
  CheckCircle2,
  XCircle,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { DashboardLayout, DashboardTabItem } from '@/src/layouts/DashboardLayout';
import { useAuth } from '@/src/authentication/AuthContext';
import { dataService } from '@/src/services/dataService';
import {
  Application,
  Employer,
  Opportunity,
  Profile,
  ReportRecord,
  ReportStatus,
  VerificationStatus,
} from '@/src/types';
import { GARISSA_LOCATIONS } from '@/src/utils/constants';
import { formatDate, formatKes } from '@/src/utils/formatters';
import { DonutBreakdownChart, HorizontalBarChart } from '@/src/components/Charts';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { useToast } from '@/src/hooks/useToast';

export function AdminDashboard() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [newCategory, setNewCategory] = useState('');
  const [verificationNotes, setVerificationNotes] = useState<Record<string, string>>({});
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});

  // Confirm dialogs
  const [rejectTarget, setRejectTarget] = useState<Employer | null>(null);
  const [deleteOppTarget, setDeleteOppTarget] = useState<Opportunity | null>(null);
  const [suspendUserTarget, setSuspendUserTarget] = useState<Profile | null>(null);
  const [confirmResetDemo, setConfirmResetDemo] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [profs, emps, opps, apps, reps, cats] = await Promise.all([
        dataService.getAllProfiles(),
        dataService.getEmployers(),
        dataService.getOpportunities(true),
        dataService.getApplications(),
        dataService.getReports(),
        dataService.getCategories(),
      ]);
      setProfiles(profs);
      setEmployers(emps);
      setOpportunities(opps);
      setApplications(apps);
      setReports(reps);
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const pendingVerifications = employers.filter((e) => e.verificationStatus === 'pending');
  const openReports = reports.filter((r) => r.status === 'Open' || r.status === 'Under Review');

  const tabs: DashboardTabItem[] = [
    { id: 'overview', label: 'Overview & Analytics', icon: <LayoutDashboard className="h-4 w-4" /> },
    {
      id: 'verifications',
      label: 'Employer Verifications',
      icon: <ShieldCheck className="h-4 w-4" />,
      badgeCount: pendingVerifications.length,
    },
    {
      id: 'reports',
      label: 'Reports & Complaints',
      icon: <Flag className="h-4 w-4" />,
      badgeCount: openReports.length,
    },
    { id: 'opportunities', label: 'Opportunities', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'users', label: 'Users & Applications', icon: <Users className="h-4 w-4" /> },
    { id: 'categories', label: 'Categories & Settings', icon: <Tags className="h-4 w-4" /> },
  ];

  const employerMap = useMemo(() => new Map(employers.map((e) => [e.id, e])), [employers]);
  const oppMap = useMemo(() => new Map(opportunities.map((o) => [o.id, o])), [opportunities]);

  const locationChartData = useMemo(() => {
    return GARISSA_LOCATIONS.map((loc) => ({
      label: loc,
      value: opportunities.filter((o) => o.location === loc).length,
      color: '#0F9D83',
    }));
  }, [opportunities]);

  const verificationChartSegments = useMemo(() => {
    return [
      {
        label: 'Verified',
        value: employers.filter((e) => e.verificationStatus === 'verified').length,
        color: '#0F9D83',
      },
      {
        label: 'Pending',
        value: employers.filter((e) => e.verificationStatus === 'pending').length,
        color: '#D97706',
      },
      {
        label: 'Rejected',
        value: employers.filter((e) => e.verificationStatus === 'rejected').length,
        color: '#DC2626',
      },
    ];
  }, [employers]);

  const handleVerifyEmployer = async (emp: Employer, status: VerificationStatus) => {
    if (!user) return;
    const notes =
      verificationNotes[emp.id] ||
      (status === 'verified'
        ? 'Approved by KaziReady Garissa administrator.'
        : 'Verification declined pending valid documentation.');
    await dataService.setEmployerVerification(emp.id, status, notes, user);
    setRejectTarget(null);
    await loadAdminData();
    showToast(
      `Employer ${status === 'verified' ? 'Approved' : 'Rejected'}`,
      `${emp.organizationName} is now ${status}.`,
      'success'
    );
  };

  const handleUpdateReport = async (rep: ReportRecord, status: ReportStatus) => {
    const resolution =
      resolutionNotes[rep.id] || `Marked as ${status} by administrator.`;
    await dataService.updateReportStatus(rep.id, status, resolution);
    await loadAdminData();
    showToast('Report Updated', `Report status set to ${status}.`, 'success');
  };

  const handleToggleOpportunityOpen = async (opp: Opportunity) => {
    await dataService.updateOpportunity(opp.id, { isOpen: !opp.isOpen });
    await loadAdminData();
    showToast(
      opp.isOpen ? 'Listing Closed' : 'Listing Reopened',
      `${opp.title} has been updated.`,
      'success'
    );
  };

  const handleDeleteOpp = async () => {
    if (!deleteOppTarget) return;
    await dataService.deleteOpportunity(deleteOppTarget.id);
    setDeleteOppTarget(null);
    await loadAdminData();
    showToast('Opportunity Removed', 'Listing deleted by administrator.', 'success');
  };

  const handleToggleSuspend = async () => {
    if (!user || !suspendUserTarget) return;
    await dataService.toggleSuspendUser(suspendUserTarget.id, user);
    setSuspendUserTarget(null);
    await loadAdminData();
    showToast('Account Updated', 'User access status updated.', 'success');
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      const updated = await dataService.addCategory(newCategory);
      setCategories(updated);
      setNewCategory('');
      showToast('Category Added', undefined, 'success');
    } catch (err) {
      showToast('Error', err instanceof Error ? err.message : 'Could not add category.', 'error');
    }
  };

  const handleRemoveCategory = async (cat: string) => {
    const updated = await dataService.removeCategory(cat);
    setCategories(updated);
    showToast('Category Removed', undefined, 'success');
  };

  const handleResetDemo = async () => {
    await dataService.resetDemoDatabase();
    setConfirmResetDemo(false);
    await refreshUser();
    showToast('Demo Data Reset', 'Initial DEMO dataset has been restored.', 'success');
  };

  return (
    <DashboardLayout
      roleLabel="Administrator Governance Console"
      breadcrumb="Admin Dashboard"
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
          {/* TAB 1: OVERVIEW & CHARTS */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Total Users', value: profiles.length },
                  { label: 'Total Employers', value: employers.length },
                  { label: 'Opportunities', value: opportunities.length },
                  { label: 'Applications', value: applications.length },
                  { label: 'Pending Verifications', value: pendingVerifications.length },
                  { label: 'Reported Issues', value: openReports.length },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium text-slate-500">{kpi.label}</p>
                    <p className="mt-2 font-mono text-2xl font-bold text-[#10243A] tabular-nums">
                      {kpi.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <HorizontalBarChart
                  title="Opportunities by Garissa Sub-County"
                  subtitle="Distribution of listings across the 7 Garissa County sub-counties"
                  data={locationChartData}
                />
                <DonutBreakdownChart
                  title="Employer Verification Status"
                  subtitle="Proportion of verified vs. pending organisations"
                  segments={verificationChartSegments}
                />
              </div>
            </div>
          )}

          {/* TAB 2: EMPLOYER VERIFICATIONS */}
          {activeTab === 'verifications' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-[#10243A]">Employer Verification Queue</h2>
                <p className="text-xs text-slate-500">
                  Only administrators can approve or reject employer verification requests.
                </p>
              </div>

              {employers.map((emp) => (
                <div
                  key={emp.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-[#0F9D83] uppercase">
                        Status: {emp.verificationStatus} · {emp.location}
                      </p>
                      <h3 className="mt-1 text-base font-bold text-[#10243A]">
                        {emp.organizationName}
                      </h3>
                      <p className="text-xs text-slate-600">
                        Reg No: <span className="font-mono">{emp.registrationNumber}</span> · Contact:{' '}
                        {emp.contactName} ({emp.contactEmail} / {emp.contactPhone})
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        Submitted Document:{' '}
                        <strong className="font-mono text-[#10243A]">
                          {emp.verificationDocumentName || 'None uploaded'}
                        </strong>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {emp.verificationStatus !== 'verified' && (
                        <button
                          type="button"
                          onClick={() => handleVerifyEmployer(emp, 'verified')}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F9D83] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0B7D68]"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve Employer
                        </button>
                      )}
                      {emp.verificationStatus !== 'rejected' && (
                        <button
                          type="button"
                          onClick={() => setRejectTarget(emp)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={verificationNotes[emp.id] ?? emp.verificationNotes ?? ''}
                      onChange={(e) =>
                        setVerificationNotes((prev) => ({ ...prev, [emp.id]: e.target.value }))
                      }
                      placeholder="Optional administrator review note..."
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: REPORTS & COMPLAINTS */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#10243A]">
                Reported Listings, Employers &amp; Delayed Stipends
              </h2>
              {reports.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
                  No reports or complaints filed.
                </div>
              ) : (
                reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="rounded-xl border border-slate-200 bg-white p-6 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-red-600 uppercase">
                          {rep.targetType} Report · {rep.status}
                        </p>
                        <h3 className="text-base font-bold text-[#10243A] mt-0.5">
                          {rep.targetLabel}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Reported by {rep.reporterName} on {formatDate(rep.createdAt)} · Reason:{' '}
                          <strong>{rep.reason}</strong>
                        </p>
                      </div>

                      <select
                        value={rep.status}
                        onChange={(e) => handleUpdateReport(rep, e.target.value as ReportStatus)}
                        aria-label={`Update status for report ${rep.id}`}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#10243A]"
                      >
                        <option value="Open">Open</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Dismissed">Dismissed</option>
                      </select>
                    </div>

                    <p className="text-xs text-slate-700 bg-[#F5F8FA] rounded-lg p-3">
                      {rep.details}
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={resolutionNotes[rep.id] ?? rep.adminResolution ?? ''}
                        onChange={(e) =>
                          setResolutionNotes((prev) => ({ ...prev, [rep.id]: e.target.value }))
                        }
                        placeholder="Record resolution note..."
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateReport(rep, rep.status)}
                        className="rounded-lg bg-[#10243A] px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: OPPORTUNITIES MODERATION */}
          {activeTab === 'opportunities' && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-bold text-[#10243A]">All Platform Opportunities</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F8FA] border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Employer</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Stipend</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {opportunities.map((opp) => (
                      <tr key={opp.id}>
                        <td className="px-4 py-3 font-semibold text-[#10243A]">{opp.title}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {employerMap.get(opp.employerId)?.organizationName || opp.employerId}
                        </td>
                        <td className="px-4 py-3">{opp.location}</td>
                        <td className="px-4 py-3 font-mono tabular-nums">
                          {opp.isPaid ? formatKes(opp.stipendMonthlyKes) : 'Unpaid'}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {opp.isOpen ? 'Open' : 'Closed'}
                        </td>
                        <td className="px-4 py-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleOpportunityOpen(opp)}
                            className="rounded-md border border-slate-200 px-2.5 py-1 font-semibold hover:bg-slate-50"
                          >
                            {opp.isOpen ? 'Close' : 'Reopen'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteOppTarget(opp)}
                            className="rounded-md border border-red-200 px-2.5 py-1 font-semibold text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: USERS & APPLICATIONS */}
          {activeTab === 'users' && (
            <div className="space-y-8">
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-lg font-bold text-[#10243A]">Registered Users</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F5F8FA] border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Access</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {profiles.map((p) => (
                        <tr key={p.id}>
                          <td className="px-4 py-3 font-semibold text-[#10243A]">{p.fullName}</td>
                          <td className="px-4 py-3 font-mono">{p.email}</td>
                          <td className="px-4 py-3 capitalize">{p.role}</td>
                          <td className="px-4 py-3">{p.location}</td>
                          <td className="px-4 py-3 font-semibold">
                            {p.isSuspended ? (
                              <span className="text-red-600">Suspended</span>
                            ) : (
                              <span className="text-[#0F9D83]">Active</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {p.role !== 'admin' && (
                              <button
                                type="button"
                                onClick={() => setSuspendUserTarget(p)}
                                className="rounded-md border border-slate-200 px-2.5 py-1 font-semibold hover:bg-slate-50"
                              >
                                {p.isSuspended ? 'Restore' : 'Suspend'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-lg font-bold text-[#10243A]">All Applications</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F5F8FA] border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Applicant</th>
                        <th className="px-4 py-3">Opportunity</th>
                        <th className="px-4 py-3">Submitted</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {applications.map((a) => (
                        <tr key={a.id}>
                          <td className="px-4 py-3 font-semibold text-[#10243A]">{a.fullName}</td>
                          <td className="px-4 py-3">
                            {oppMap.get(a.opportunityId)?.title || a.opportunityId}
                          </td>
                          <td className="px-4 py-3 font-mono tabular-nums">
                            {formatDate(a.createdAt)}
                          </td>
                          <td className="px-4 py-3 font-semibold">{a.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CATEGORIES & DEMO SETTINGS */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-bold text-[#10243A] mb-3">
                  Manage Opportunity Categories
                </h2>
                <form onSubmit={handleAddCategory} className="flex gap-2 mb-5">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Add new category..."
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-[#0F9D83] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0B7D68]"
                  >
                    Add
                  </button>
                </form>

                <div className="divide-y divide-slate-200">
                  {categories.map((cat) => (
                    <div key={cat} className="py-2.5 flex items-center justify-between text-sm">
                      <span className="text-[#10243A] font-medium">{cat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(cat)}
                        className="text-xs text-red-600 hover:underline inline-flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {!dataService.isSupabaseMode() && (
                <div className="rounded-xl border border-slate-200 bg-white p-6 h-fit">
                  <h2 className="text-lg font-bold text-[#10243A] mb-2">
                    Demonstration Data Controls
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed mb-5">
                    Restore all sample DEMO employers, opportunities, applications, agreements, payments, and reports back to their initial hackathon state.
                  </p>
                  <button
                    type="button"
                    onClick={() => setConfirmResetDemo(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset Local Demo Database
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={Boolean(rejectTarget)}
        title="Reject Employer Verification?"
        message={`Reject "${rejectTarget?.organizationName}"? They will not be able to publish public opportunities until approved.`}
        confirmLabel="Reject Employer"
        destructive
        onConfirm={() => rejectTarget && handleVerifyEmployer(rejectTarget, 'rejected')}
        onCancel={() => setRejectTarget(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteOppTarget)}
        title="Delete Opportunity?"
        message={`Remove "${deleteOppTarget?.title}" permanently from the marketplace?`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteOpp}
        onCancel={() => setDeleteOppTarget(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(suspendUserTarget)}
        title={suspendUserTarget?.isSuspended ? 'Restore User Account?' : 'Suspend User Account?'}
        message={`Change access status for "${suspendUserTarget?.fullName}" (${suspendUserTarget?.email})?`}
        confirmLabel={suspendUserTarget?.isSuspended ? 'Restore Access' : 'Suspend Access'}
        destructive={!suspendUserTarget?.isSuspended}
        onConfirm={handleToggleSuspend}
        onCancel={() => setSuspendUserTarget(null)}
      />

      <ConfirmDialog
        isOpen={confirmResetDemo}
        title="Reset Demo Database?"
        message="This will clear any newly created test records in localStorage and restore the initial DEMO dataset."
        confirmLabel="Reset Demo Data"
        destructive
        onConfirm={handleResetDemo}
        onCancel={() => setConfirmResetDemo(false)}
      />
    </DashboardLayout>
  );
}
