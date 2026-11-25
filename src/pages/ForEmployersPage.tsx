import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileCheck2, Users, Wallet, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '@/src/components/ImageWithFallback';
import { useAuth } from '@/src/authentication/AuthContext';

export function ForEmployersPage() {
  const { user } = useAuth();

  return (
    <div>
      <section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-center">
              <p className="text-xs font-semibold text-[#0F9D83]">
                For Garissa County Organisations &amp; SMEs
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#10243A] leading-tight">
                Hire Skilled Youth with Verified Trust and Clear Agreements.
              </h1>
              <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-2xl">
                Connect with motivated TVET students and university graduates across Garissa County. Streamline verification, review skill-matched applicants, issue written internship agreements, and maintain transparent stipend logs.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  to={user?.role === 'employer' ? '/dashboard/employer' : '/register?role=employer'}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0F9D83] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0B7D68]"
                >
                  {user?.role === 'employer' ? 'Open Employer Dashboard' : 'Register as an Employer'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/documentation"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-[#10243A] hover:bg-slate-50"
                >
                  View Agreement Templates
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="h-full min-h-[260px] overflow-hidden rounded-xl border border-slate-200">
                <ImageWithFallback
                  src="/src/assets/images/employer_team_office_1795596254794.jpg"
                  alt="Employer team reviewing internship contracts"
                  className="h-full w-full object-cover"
                  fallbackLabel="Verified Employers in Garissa"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <ShieldCheck className="h-6 w-6 text-[#0F9D83]" />,
              title: 'Employer Verification Badge',
              desc: 'Submit your business or NGO registration document once. After administrator approval, your Verified badge boosts candidate trust.',
            },
            {
              icon: <Users className="h-6 w-6 text-[#0F9D83]" />,
              title: 'Skill-Matched Shortlisting',
              desc: 'Review structured applicant profiles, CVs, institutions, and skill match percentages in one unified applicant queue.',
            },
            {
              icon: <FileCheck2 className="h-6 w-6 text-[#0F9D83]" />,
              title: 'Structured Internship Agreements',
              desc: 'Define start/end dates, working hours, mentorship expectations, and monthly KES stipends before onboarding.',
            },
            {
              icon: <Wallet className="h-6 w-6 text-[#0F9D83]" />,
              title: 'Transparent Payment Logs',
              desc: 'Update stipend disbursement records and payment references cleanly. KaziReady tracks records only and never holds funds.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-6">
              {item.icon}
              <h2 className="mt-4 text-base font-bold text-[#10243A]">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
