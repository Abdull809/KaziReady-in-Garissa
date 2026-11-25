import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/src/authentication/AuthContext';
import { DEFAULT_CATEGORIES, GARISSA_LOCATIONS } from '@/src/utils/constants';
import { isValidEmail, isValidKenyanPhone, validatePasswordStrength } from '@/src/utils/validation';
import { useToast } from '@/src/hooks/useToast';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const initialRole = searchParams.get('role') === 'employer' ? 'employer' : 'applicant';

  const [role, setRole] = useState<'applicant' | 'employer'>(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState<string>('Garissa Town');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Employer-specific fields
  const [organizationName, setOrganizationName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [sector, setSector] = useState<string>(DEFAULT_CATEGORIES[0]);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) return setError('Full name is required.');
    if (!isValidEmail(email)) return setError('Please enter a valid email address.');
    if (!isValidKenyanPhone(phone)) return setError('Enter a valid Kenyan phone number (e.g. +254 712 345 678).');
    const pwErr = validatePasswordStrength(password);
    if (pwErr) return setError(pwErr);
    if (password !== confirmPassword) return setError('Passwords do not match.');

    if (role === 'employer') {
      if (!organizationName.trim()) return setError('Organisation name is required for employers.');
      if (!registrationNumber.trim()) return setError('Registration or permit number is required.');
    }

    setSubmitting(true);
    try {
      const profile = await register({
        role,
        fullName,
        email,
        phone,
        location,
        password,
        organizationName: role === 'employer' ? organizationName : undefined,
        registrationNumber: role === 'employer' ? registrationNumber : undefined,
        sector: role === 'employer' ? sector : undefined,
      });

      showToast('Account Created', `Welcome to KaziReady Garissa, ${profile.fullName}!`, 'success');
      if (profile.role === 'employer') navigate('/dashboard/employer', { replace: true });
      else navigate('/dashboard/applicant', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
      <div className="rounded-xl border border-slate-200 bg-white p-7 sm:p-8">
        <p className="text-xs font-semibold text-[#0F9D83]">Create Account</p>
        <h1 className="mt-1 text-2xl font-extrabold text-[#10243A]">
          Register on KaziReady Garissa
        </h1>
        <p className="mt-1.5 text-xs text-slate-600">
          Choose Applicant / Student to discover verified opportunities, or Employer to onboard your organisation.
        </p>

        {/* Role Selector (Strictly Applicant or Employer — Never Public Admin) */}
        <div className="mt-6 grid grid-cols-2 gap-3 p-1 rounded-lg bg-[#F5F8FA] border border-slate-200">
          <button
            type="button"
            onClick={() => setRole('applicant')}
            className={`rounded-md py-2.5 px-3 text-sm font-semibold transition-colors ${
              role === 'applicant'
                ? 'bg-[#10243A] text-white'
                : 'text-slate-600 hover:text-[#10243A]'
            }`}
          >
            Applicant / Student
          </button>
          <button
            type="button"
            onClick={() => setRole('employer')}
            className={`rounded-md py-2.5 px-3 text-sm font-semibold transition-colors ${
              role === 'employer'
                ? 'bg-[#10243A] text-white'
                : 'text-slate-600 hover:text-[#10243A]'
            }`}
          >
            Employer Organisation
          </button>
        </div>

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#10243A] mb-1">
                {role === 'employer' ? 'Contact Person Full Name *' : 'Full Name *'}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Abdullahi Noor"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-[#0F9D83] focus:outline-none"
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
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-[#0F9D83] focus:outline-none"
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
                placeholder="+254 712 345 678"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-[#0F9D83] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#10243A] mb-1">
                Garissa Sub-County *
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-[#0F9D83] focus:outline-none"
              >
                {GARISSA_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {role === 'employer' && (
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <p className="text-xs font-bold text-[#10243A]">Organisation Details (Verification Required Before Publishing)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#10243A] mb-1">
                    Organisation Name *
                  </label>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="e.g. Garissa Digital Enterprise"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-[#0F9D83] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#10243A] mb-1">
                    Business / NGO Registration No. *
                  </label>
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="e.g. BN-123456"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-[#0F9D83] focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#10243A] mb-1">
                  Primary Sector
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-[#0F9D83] focus:outline-none"
                >
                  {DEFAULT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#10243A] mb-1">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, letters & numbers"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-[#0F9D83] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#10243A] mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-[#0F9D83] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-[#F5F8FA] p-3 flex items-start gap-2.5 text-xs text-slate-600">
            <ShieldAlert className="h-4 w-4 text-[#10243A] shrink-0 mt-0.5" />
            <span>
              Public registration is restricted to Applicants and Employers. Administrator roles are provisioned internally for platform governance.
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#0F9D83] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0B7D68] disabled:opacity-60"
          >
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className="text-center text-xs text-slate-600 pt-1">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-[#0F9D83] hover:underline">
              Sign in here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
