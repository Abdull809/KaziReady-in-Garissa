import React, { useEffect, useState } from 'react';
import { X, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/authentication/AuthContext';
import { dataService } from '@/src/services/dataService';
import { Employer, Opportunity } from '@/src/types';
import { isValidEmail, isValidKenyanPhone } from '@/src/utils/validation';
import { useToast } from '@/src/hooks/useToast';

interface ApplyModalProps {
  opportunity: Opportunity | null;
  employer?: Employer;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApplyModal({
  opportunity,
  employer,
  isOpen,
  onClose,
  onSuccess,
}: ApplyModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [education, setEducation] = useState('');
  const [institution, setInstitution] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [cvFileName, setCvFileName] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setEducation(user.education || '');
      setInstitution(user.institution || '');
      setSkillsText((user.skills || []).join(', '));
      setCvFileName(user.cvFileName || '');
      setCoverLetter('');
      setError('');
      setConfirmed(false);
    }
  }, [isOpen, user]);

  if (!isOpen || !opportunity) return null;

  if (!user) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#10243A]/50 p-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#10243A]">Sign In to Apply</h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Create an Applicant account or sign in to submit your application for{' '}
            <strong className="text-[#10243A]">{opportunity.title}</strong> and track its progress in real time.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/login', { state: { from: `/opportunities/${opportunity.id}` } });
              }}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#10243A] hover:bg-slate-50"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/register');
              }}
              className="flex-1 rounded-lg bg-[#0F9D83] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0B7D68]"
            >
              Register Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user.role !== 'applicant') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#10243A]/50 p-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-[#10243A]">Applicant Account Required</h3>
            <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-slate-600">
            You are currently signed in as an <strong>{user.role}</strong>. Sign in with an Applicant account to submit job or internship applications.
          </p>
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-[#10243A] px-4 py-2 text-sm font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('CV file size must be under 5 MB.');
        return;
      }
      setCvFileName(file.name);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) return setError('Full name is required.');
    if (!isValidEmail(email)) return setError('Enter a valid email address.');
    if (!isValidKenyanPhone(phone)) return setError('Enter a valid Kenyan phone number (e.g. +254 712 345 678).');
    if (!education.trim()) return setError('Education qualification is required.');
    if (!institution.trim()) return setError('Institution or school name is required.');
    const parsedSkills = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parsedSkills.length === 0) return setError('List at least one skill separated by commas.');
    if (!cvFileName.trim()) return setError('Please upload or attach your CV filename.');
    if (coverLetter.trim().length < 25) {
      return setError('Please write a brief cover letter (at least 25 characters).');
    }

    setSubmitting(true);
    try {
      await dataService.submitApplication({
        opportunityId: opportunity.id,
        applicantId: user.id,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        education: education.trim(),
        institution: institution.trim(),
        skills: parsedSkills,
        cvFileName: cvFileName.trim(),
        coverLetter: coverLetter.trim(),
      });
      setConfirmed(true);
      showToast('Application Submitted', `Your application for ${opportunity.title} has been saved.`, 'success');
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to submit application.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#10243A]/50 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-modal-title"
    >
      <div className="my-8 w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <p className="text-xs font-medium text-[#0F9D83]">
              {employer?.organizationName || 'Verified Employer'} · {opportunity.location}
            </p>
            <h3 id="apply-modal-title" className="mt-1 text-xl font-bold text-[#10243A]">
              Apply for {opportunity.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close application form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {confirmed ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-[#0F9D83] mx-auto" />
            <h4 className="mt-4 text-lg font-bold text-[#10243A]">Application Confirmed</h4>
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
              Your application for <strong>{opportunity.title}</strong> has been submitted to{' '}
              <strong>{employer?.organizationName}</strong> with status <strong>Pending</strong>.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/dashboard/applicant');
                }}
                className="rounded-lg bg-[#10243A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A3656]"
              >
                Track in My Dashboard
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#10243A] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0F9D83] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#10243A] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0F9D83] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#10243A] mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0F9D83] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#10243A] mb-1">
                  Highest Education / Qualification *
                </label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. Diploma in ICT"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0F9D83] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#10243A] mb-1">
                  Institution / TVET / University *
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. North Eastern National Polytechnic"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0F9D83] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#10243A] mb-1">
                  Key Skills (comma-separated) *
                </label>
                <input
                  type="text"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="e.g. Networking, Excel, React"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0F9D83] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#10243A] mb-1">
                CV Upload (PDF / DOCX) *
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-[#F5F8FA] p-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs font-semibold text-[#10243A] hover:bg-slate-50 shrink-0">
                  <Upload className="h-4 w-4 text-[#0F9D83]" />
                  Choose CV File
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                <span className="text-xs text-slate-600 truncate">
                  {cvFileName ? `Attached: ${cvFileName}` : 'No CV file selected yet'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#10243A] mb-1">
                Cover Letter / Motivation *
              </label>
              <textarea
                rows={4}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Explain why your skills and training fit this role in Garissa County..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0F9D83] focus:outline-none"
                required
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[#0F9D83] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0B7D68] disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
