import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/src/authentication/AuthContext';
import { dataService } from '@/src/services/dataService';
import { isValidEmail, validatePasswordStrength } from '@/src/utils/validation';
import { useToast } from '@/src/hooks/useToast';

const DEMO_ACCOUNTS = [
  {
    id: 'usr-app-1',
    roleLabel: 'Applicant (DEMO)',
    name: 'Amina Hassan',
    email: 'amina.hassan@demo.kaziready.ke',
    note: 'ICT graduate · active agreement & payment history',
  },
  {
    id: 'usr-emp-1',
    roleLabel: 'Verified Employer (DEMO)',
    name: 'Northern Tech Hub',
    email: 'hr@northerntechhub.demo',
    note: 'Can publish listings, review applicants & update payments',
  },
  {
    id: 'usr-emp-3',
    roleLabel: 'Pending Employer (DEMO)',
    name: 'Tana Horizon Solutions',
    email: 'talent@tanahorizon.demo',
    note: 'Awaiting admin verification; publishing locked',
  },
  {
    id: 'usr-admin-1',
    roleLabel: 'Administrator (DEMO)',
    name: 'Platform Admin',
    email: 'admin@kazireadygarissa.demo',
    note: 'Approve employers, review reports & manage categories',
  },
];

export function LoginPage() {
  const { login, loginDemoQuick } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Password reset state
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStatus, setResetStatus] = useState('');

  const fromPath = (location.state as { from?: string } | null)?.from;

  const redirectByRole = (role: string) => {
    if (fromPath && !fromPath.startsWith('/dashboard')) {
      navigate(fromPath, { replace: true });
      return;
    }
    if (role === 'admin') navigate('/dashboard/admin', { replace: true });
    else if (role === 'employer') navigate('/dashboard/employer', { replace: true });
    else navigate('/dashboard/applicant', { replace: true });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isValidEmail(email)) return setError('Enter a valid email address.');
    if (!password) return setError('Enter your password.');

    setSubmitting(true);
    try {
      const profile = await login(email, password);
      showToast('Welcome back', `Signed in as ${profile.fullName}`, 'success');
      redirectByRole(profile.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoQuickLogin = async (userId: string) => {
    setError('');
    setSubmitting(true);
    try {
      const profile = await loginDemoQuick(userId);
      showToast('Demo Session Active', `Signed in as ${profile.fullName}`, 'success');
      redirectByRole(profile.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetStatus('');

    if (!isValidEmail(resetEmail)) return setError('Enter your registered email address.');
    if (!dataService.isSupabaseMode()) {
      const pwErr = validatePasswordStrength(newPassword);
      if (pwErr) return setError(pwErr);
    }

    setSubmitting(true);
    try {
      const msg = await dataService.resetPassword(resetEmail, newPassword);
      setResetStatus(msg);
      showToast('Password Reset', msg, 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Login / Reset Form */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-7 sm:p-8">
          <p className="text-xs font-semibold text-[#0F9D83]">
            {dataService.isSupabaseMode() ? 'Supabase Authentication' : 'Local Demonstration Mode'}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-[#10243A]">
            {resetMode ? 'Reset Your Password' : 'Sign In to KaziReady Garissa'}
          </h1>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resetStatus && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#0F9D83]/30 bg-[#0F9D83]/10 p-3 text-xs text-[#10243A]">
              <CheckCircle2 className="h-4 w-4 text-[#0F9D83] shrink-0 mt-0.5" />
              <span>{resetStatus}</span>
            </div>
          )}

          {resetMode ? (
            <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#10243A] mb-1">
                  Registered Email *
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-[#0F9D83] focus:outline-none"
                  required
                />
              </div>

              {!dataService.isSupabaseMode() && (
                <div>
                  <label className="block text-xs font-semibold text-[#10243A] mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 chars with letter & number"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-[#0F9D83] focus:outline-none"
                    required
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setResetMode(false);
                    setError('');
                    setResetStatus('');
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-[#10243A]"
                >
                  Back to Login
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-[#0F9D83] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0B7D68]"
                >
                  {submitting ? 'Updating...' : 'Reset Password'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#10243A] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-[#0F9D83] focus:outline-none"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#10243A]">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetMode(true);
                      setError('');
                    }}
                    className="text-xs font-medium text-[#0F9D83] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-[#0F9D83] focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-[#10243A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A3656] disabled:opacity-60"
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>

              <p className="text-center text-xs text-slate-600 pt-2">
                New to KaziReady Garissa?{' '}
                <Link to="/register" className="font-semibold text-[#0F9D83] hover:underline">
                  Create an Applicant or Employer account
                </Link>
              </p>
            </form>
          )}
        </div>

        {/* Demo Quick Access for Evaluators (Local Demo Mode Only) */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-7 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0F9D83]">
            <KeyRound className="h-4 w-4" />
            Hackathon Demonstration Access (DEMO)
          </div>
          <h2 className="mt-1 text-lg font-bold text-[#10243A]">
            One-Click Demo Role Sign-In
          </h2>
          <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
            Test every user journey immediately. All sample accounts below are marked <strong>DEMO</strong>.
            (Standard demo password if signing in manually: <code className="font-mono text-[#10243A]">KaziDemo2026!</code>)
          </p>

          {!dataService.isSupabaseMode() ? (
            <div className="mt-5 space-y-3">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleDemoQuickLogin(acc.id)}
                  disabled={submitting}
                  className="w-full flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-[#F5F8FA] p-3.5 text-left hover:border-[#0F9D83] transition-colors group"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-[#0F9D83] block">
                      {acc.roleLabel}
                    </span>
                    <span className="text-sm font-bold text-[#10243A] block truncate">
                      {acc.name} · <span className="font-mono text-xs font-normal text-slate-500">{acc.email}</span>
                    </span>
                    <span className="text-xs text-slate-600 block mt-0.5">{acc.note}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#0F9D83] shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-500">
              Supabase mode is active. Sign in using your registered Supabase Auth email and password.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
