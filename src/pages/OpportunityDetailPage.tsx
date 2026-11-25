import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Calendar,
  Wallet,
  Bookmark,
  Flag,
  CheckCircle2,
  X,
} from 'lucide-react';
import { dataService } from '@/src/services/dataService';
import { Employer, Opportunity } from '@/src/types';
import { calculateSkillMatch, formatDate, formatKes } from '@/src/utils/formatters';
import { ApplyModal } from '@/src/components/ApplyModal';
import { useAuth } from '@/src/authentication/AuthContext';
import { useToast } from '@/src/hooks/useToast';

export function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);

  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTargetType, setReportTargetType] = useState<'opportunity' | 'employer'>('opportunity');
  const [reportReason, setReportReason] = useState('Misleading stipend or terms');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const loadDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [opps, emps] = await Promise.all([
        dataService.getOpportunities(true),
        dataService.getEmployers(),
      ]);
      const found = opps.find((o) => o.id === id) || null;
      setOpportunity(found);
      if (found) {
        setEmployer(emps.find((e) => e.id === found.employerId) || null);
      }
      if (user && found) {
        const [saved, apps] = await Promise.all([
          dataService.getSavedOpportunities(user.id),
          dataService.getApplications(),
        ]);
        setIsSaved(saved.some((s) => s.opportunityId === found.id));
        setHasApplied(apps.some((a) => a.applicantId === user.id && a.opportunityId === found.id));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id, user?.id]);

  const handleToggleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!opportunity) return;
    const saved = await dataService.toggleSaveOpportunity(user.id, opportunity.id);
    setIsSaved(saved);
    showToast(saved ? 'Opportunity saved' : 'Removed from saved', undefined, 'success');
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Sign in required', 'Please sign in to submit a report.', 'info');
      navigate('/login');
      return;
    }
    if (!opportunity || !reportDetails.trim()) {
      showToast('Details required', 'Please describe the issue before submitting.', 'error');
      return;
    }
    setSubmittingReport(true);
    try {
      await dataService.createReport({
        reporterId: user.id,
        reporterName: user.fullName,
        targetType: reportTargetType,
        targetId: reportTargetType === 'employer' && employer ? employer.id : opportunity.id,
        targetLabel:
          reportTargetType === 'employer' && employer
            ? employer.organizationName
            : `${opportunity.title} (${employer?.organizationName || 'Employer'})`,
        reason: reportReason,
        details: reportDetails.trim(),
      });
      showToast('Report Submitted', 'An administrator will review this report.', 'success');
      setShowReportModal(false);
      setReportDetails('');
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="h-64 rounded-xl border border-slate-200 bg-white animate-pulse" />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#10243A]">Opportunity Not Found</h1>
        <p className="mt-2 text-sm text-slate-600">
          This listing may have been closed or removed.
        </p>
        <Link
          to="/opportunities"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0F9D83] px-4 py-2 text-sm font-semibold text-white"
        >
          Back to Opportunities
        </Link>
      </div>
    );
  }

  const skillMatch =
    user?.role === 'applicant'
      ? calculateSkillMatch(user.skills, opportunity.skillsRequired)
      : null;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/opportunities"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#10243A] mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Opportunities
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Opportunity Content */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-7">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                {opportunity.isDemo && (
                  <>
                    <span className="font-mono font-bold text-[#10243A]">DEMO</span>
                    <span aria-hidden="true">·</span>
                  </>
                )}
                <span className="font-semibold text-[#0F9D83]">{opportunity.opportunityType}</span>
                <span aria-hidden="true">·</span>
                <span>{opportunity.category}</span>
              </div>

              <button
                type="button"
                onClick={handleToggleSave}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isSaved
                    ? 'border-[#0F9D83] bg-[#0F9D83]/10 text-[#0F9D83]'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Saved' : 'Save Listing'}
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10243A]">
              {opportunity.title}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-700">
              <span className="font-semibold">{employer?.organizationName}</span>
              {employer?.verificationStatus === 'verified' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F9D83]">
                  <ShieldCheck className="h-4 w-4" />
                  Verified Employer
                </span>
              )}
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Location</span>
                <span className="mt-1 inline-flex items-center gap-1.5 font-semibold text-[#10243A]">
                  <MapPin className="h-4 w-4 text-[#0F9D83]" />
                  {opportunity.location}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Agreed Monthly Stipend</span>
                <span className="mt-1 inline-flex items-center gap-1.5 font-mono font-bold text-[#10243A] tabular-nums">
                  <Wallet className="h-4 w-4 text-[#0F9D83]" />
                  {opportunity.isPaid && opportunity.stipendMonthlyKes > 0
                    ? `${formatKes(opportunity.stipendMonthlyKes)} / month`
                    : 'Unpaid'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Application Deadline</span>
                <span className="mt-1 inline-flex items-center gap-1.5 font-mono font-semibold text-[#10243A] tabular-nums">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {formatDate(opportunity.deadline)}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 space-y-5">
              <div>
                <h2 className="text-base font-bold text-[#10243A] mb-2">Role Overview</h2>
                <p className="text-sm text-slate-700 leading-relaxed">{opportunity.description}</p>
              </div>

              <div>
                <h2 className="text-base font-bold text-[#10243A] mb-2">Requirements</h2>
                <ul className="space-y-2 text-sm text-slate-700">
                  {opportunity.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#0F9D83] shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-base font-bold text-[#10243A] mb-2">Required Skills</h2>
                <p className="text-sm text-slate-700">
                  {opportunity.skillsRequired.join(' · ')}
                </p>
              </div>
            </div>
          </div>

          {skillMatch && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-[#10243A]">Your Skill Match Analysis</h2>
                <span className="font-mono text-lg font-bold text-[#0F9D83] tabular-nums">
                  {skillMatch.percentage}%
                </span>
              </div>
              <div className="h-2 w-full rounded-xs bg-[#F5F8FA] overflow-hidden mb-3">
                <div className="h-full bg-[#0F9D83]" style={{ width: `${skillMatch.percentage}%` }} />
              </div>
              <p className="text-xs text-slate-600">
                Matched skills:{' '}
                <strong className="text-[#10243A]">
                  {skillMatch.matched.length > 0 ? skillMatch.matched.join(', ') : 'None yet — update your profile skills'}
                </strong>
                {skillMatch.missing.length > 0 && (
                  <>
                    {' '}
                    · Skills to highlight or learn:{' '}
                    <span className="text-slate-700">{skillMatch.missing.join(', ')}</span>
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar: Apply & Employer Verification Trust */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-bold text-[#10243A]">Ready to Apply?</h2>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Submit your CV, qualifications, and cover letter directly to this verified employer.
            </p>
            <div className="mt-5">
              {hasApplied ? (
                <div className="rounded-lg bg-[#F5F8FA] border border-slate-200 p-3 text-center text-sm font-semibold text-[#0F9D83]">
                  Application Already Submitted
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowApply(true)}
                  className="w-full rounded-lg bg-[#0F9D83] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0B7D68] transition-colors"
                >
                  Apply Now
                </button>
              )}
            </div>
            <Link
              to="/documentation"
              className="mt-3 block text-center text-xs font-medium text-[#10243A] hover:text-[#0F9D83]"
            >
              Review Work Documentation Checklist
            </Link>
          </div>

          {employer && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-bold text-[#10243A]">Employer Verification</h2>
              <p className="mt-2 text-sm font-semibold text-[#10243A]">
                {employer.organizationName}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Reg No: <span className="font-mono">{employer.registrationNumber}</span> · {employer.sector}
              </p>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                {employer.description}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Trust Status</span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#0F9D83]">
                  <ShieldCheck className="h-4 w-4" />
                  {employer.verificationStatus === 'verified' ? 'Verified' : employer.verificationStatus}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="mt-5 w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                <Flag className="h-3.5 w-3.5" />
                Report Suspicious Listing or Employer
              </button>
            </div>
          )}
        </div>
      </div>

      <ApplyModal
        opportunity={opportunity}
        employer={employer || undefined}
        isOpen={showApply}
        onClose={() => setShowApply(false)}
        onSuccess={loadDetail}
      />

      {/* Report Modal */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#10243A]/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#10243A]">Report Suspicious Activity</h3>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#10243A] mb-1">
                  What are you reporting?
                </label>
                <select
                  value={reportTargetType}
                  onChange={(e) => setReportTargetType(e.target.value as 'opportunity' | 'employer')}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="opportunity">This Opportunity Listing</option>
                  <option value="employer">This Employer Organisation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#10243A] mb-1">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="Misleading stipend or terms">Misleading stipend or terms</option>
                  <option value="Requested upfront application fee">Requested upfront application fee</option>
                  <option value="Suspected fake organisation">Suspected fake organisation</option>
                  <option value="Other compliance concern">Other compliance concern</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#10243A] mb-1">
                  Details *
                </label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Provide factual details for the KaziReady administrator..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                >
                  {submittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
