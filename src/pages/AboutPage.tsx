import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, Wallet, Globe, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '@/src/components/ImageWithFallback';

export function AboutPage() {
  const sdgs = [
    {
      code: 'SDG 4',
      title: 'Quality Education',
      desc: 'Supports TVET students and university graduates in transitioning from classroom theory into practical, supervised industrial attachments.',
    },
    {
      code: 'SDG 8',
      title: 'Decent Work & Economic Growth',
      desc: 'Promotes safe working conditions, written internship agreements, and transparent stipend commitments across Garissa County.',
    },
    {
      code: 'SDG 10',
      title: 'Reduced Inequalities',
      desc: 'Extends verified opportunity discovery to youth across rural sub-counties and provides clear documentation guidance for eligible non-citizens and refugees.',
    },
    {
      code: 'SDG 17',
      title: 'Partnerships for the Goals',
      desc: 'Connects local SMEs, community networks, TVET institutions, and public documentation resources in one accountable ecosystem.',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-14">
      {/* Intro Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch rounded-xl border border-slate-200 bg-white p-7 sm:p-10">
        <div className="lg:col-span-7 flex flex-col justify-center">
          <p className="text-xs font-semibold text-[#0F9D83]">
            About KaziReady Garissa · Track 02 Legal &amp; Financial Access
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#10243A] leading-tight">
            Closing the Trust, Documentation, and Opportunity Gap in Garissa County.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            Young people, TVET trainees, and university graduates across Garissa County possess growing technical and community skills—yet many encounter fragmented hiring channels, unverified employers, confusing workplace paperwork, and informal stipend arrangements that go unpaid.
          </p>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            KaziReady Garissa addresses these challenges with one integrated platform built around employer verification, skill matching, documentation readiness, and transparent stipend tracking.
          </p>
        </div>
        <div className="lg:col-span-5">
          <div className="h-full min-h-[260px] overflow-hidden rounded-xl border border-slate-200">
            <ImageWithFallback
              src="/src/assets/images/tvet_skills_workshop_1795596254638.jpg"
              alt="TVET technician working in modern training workspace"
              className="h-full w-full object-cover"
              fallbackLabel="Garissa Youth Skills & Opportunity"
            />
          </div>
        </div>
      </div>

      {/* Core Challenges Addressed */}
      <div>
        <h2 className="text-2xl font-bold text-[#10243A] mb-6">
          Key Regional Challenges We Address
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Youth Unemployment & Limited Internships',
              desc: 'Many local placements rely on word-of-mouth rather than open, merit-based discovery across Garissa Town, Dadaab, Balambala, Fafi, Ijara, Lagdera, and Hulugho.',
            },
            {
              title: 'Employer Verification Challenges',
              desc: 'Job seekers struggle to distinguish legitimate organisations from unverified listings or fee-charging scams. Administrator verification ensures only vetted employers publish.',
            },
            {
              title: 'Documentation Barriers',
              desc: 'Students and eligible non-citizens often miss placements due to unclear CV expectations, missing attachment letters, or confusion over identification and permit rules.',
            },
            {
              title: 'Payment Transparency Challenges',
              desc: 'Verbal stipend promises frequently lead to delayed or disputed allowances. Written agreements and shared payment schedules create clear accountability.',
            },
            {
              title: 'Skill Visibility for TVET Graduates',
              desc: 'By matching candidate skills directly to employer requirements, KaziReady highlights practical readiness rather than informal connections.',
            },
            {
              title: 'Accountability & Escalation',
              desc: 'Integrated reporting lets applicants flag suspicious listings or overdue stipends directly to platform administrators.',
            },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-base font-bold text-[#10243A]">{c.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mission, Vision, Expected Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-200 bg-[#10243A] text-white p-7">
          <ShieldCheck className="h-7 w-7 text-[#0F9D83]" />
          <h2 className="mt-4 text-xl font-bold">Our Mission</h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            To connect young people in Garissa County with verified employers, practical work documentation guidance, and transparent internship payment tracking so skills lead reliably to dignified income.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-7">
          <FileText className="h-7 w-7 text-[#0F9D83]" />
          <h2 className="mt-4 text-xl font-bold text-[#10243A]">Our Vision</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            A trusted regional labour ecosystem in Northern Kenya where every TVET trainee, graduate, and employer collaborates through verified credentials, clear written agreements, and fair compensation.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-7">
          <Wallet className="h-7 w-7 text-[#0F9D83]" />
          <h2 className="mt-4 text-xl font-bold text-[#10243A]">Expected Impact</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Faster discovery of legitimate local placements, stronger legal and documentation readiness among youth, higher employer trust, and fewer undocumented or unpaid stipend disputes.
          </p>
        </div>
      </div>

      {/* Sustainable Development Goals Alignment */}
      <div className="rounded-xl border border-slate-200 bg-white p-7 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0F9D83] mb-2">
          <Globe className="h-4 w-4" />
          Global Development Alignment
        </div>
        <h2 className="text-2xl font-bold text-[#10243A] mb-6">
          Aligned with UN Sustainable Development Goals
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sdgs.map((sdg) => (
            <div key={sdg.code} className="rounded-lg border border-slate-200 bg-[#F5F8FA] p-5">
              <span className="font-mono text-sm font-bold text-[#0F9D83]">{sdg.code}</span>
              <h3 className="mt-1 text-base font-bold text-[#10243A]">{sdg.title}</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">{sdg.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Prototype developed for Track 02 – Legal &amp; Financial Access. All sample accounts and vacancies are marked DEMO.
          </p>
          <Link
            to="/opportunities"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0F9D83] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0B7D68]"
          >
            Explore Demo Opportunities
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
