import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  ShieldCheck,
  FileText,
  Wallet,
  CheckCircle2,
  ArrowRight,
  Users,
  Briefcase,
} from 'lucide-react';
import { dataService } from '@/src/services/dataService';
import { Employer, Opportunity } from '@/src/types';
import { GARISSA_LOCATIONS } from '@/src/utils/constants';
import { OpportunityCard } from '@/src/components/OpportunityCard';
import { ApplyModal } from '@/src/components/ApplyModal';
import { ImageWithFallback } from '@/src/components/ImageWithFallback';
import { useAuth } from '@/src/authentication/AuthContext';
import { useToast } from '@/src/hooks/useToast';

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [internshipQuery, setInternshipQuery] = useState('');
  const [jobQuery, setJobQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [applyTarget, setApplyTarget] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [opps, emps] = await Promise.all([
        dataService.getOpportunities(false),
        dataService.getEmployers(),
      ]);
      setOpportunities(opps);
      setEmployers(emps);

      if (user) {
        const [saved, apps] = await Promise.all([
          dataService.getSavedOpportunities(user.id),
          dataService.getApplications(),
        ]);
        setSavedIds(new Set(saved.map((s) => s.opportunityId)));
        setAppliedIds(
          new Set(apps.filter((a) => a.applicantId === user.id).map((a) => a.opportunityId))
        );
      } else {
        setSavedIds(new Set());
        setAppliedIds(new Set());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const combinedQuery = internshipQuery.trim() || jobQuery.trim();
    if (combinedQuery) params.set('q', combinedQuery);
    if (internshipQuery.trim() && !jobQuery.trim()) {
      params.set('type', 'Internship');
    } else if (jobQuery.trim() && !internshipQuery.trim()) {
      params.set('type', 'Job');
    }
    if (selectedLocation) params.set('location', selectedLocation);
    navigate(`/opportunities?${params.toString()}`);
  };

  const handleToggleSave = async (oppId: string) => {
    if (!user) {
      showToast('Sign in to save listings', 'Create an account or log in to bookmark opportunities.', 'info');
      navigate('/login');
      return;
    }
    const saved = await dataService.toggleSaveOpportunity(user.id, oppId);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (saved) next.add(oppId);
      else next.delete(oppId);
      return next;
    });
    showToast(saved ? 'Opportunity saved' : 'Removed from saved', undefined, 'success');
  };

  const employerMap = new Map(employers.map((e) => [e.id, e]));
  const featuredInternships = opportunities
    .filter((o) => o.opportunityType === 'Internship' || o.opportunityType === 'Attachment')
    .slice(0, 3);
  const featuredJobs = opportunities.filter((o) => o.opportunityType === 'Job').slice(0, 2);

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wide text-[#0F9D83] mb-3">
                  Garissa County, Kenya · Track 02 Legal &amp; Financial Access
                </p>
                <h1
                  className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#10243A] leading-[1.12]"
                  style={{ textWrap: 'balance' }}
                >
                  YOUR SKILLS DESERVE AN OPPORTUNITY.
                </h1>
                <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                  Discover internships, employment opportunities and verified employers in Garissa County.
                  Built for TVET students, graduates, and local organisations with transparent agreements and stipend tracking.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/opportunities')}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0F9D83] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0B7D68] transition-colors whitespace-nowrap"
                  >
                    Find Opportunities
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <Link
                    to={user ? '/dashboard/applicant' : '/register'}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#10243A] hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    {user ? 'Open My Dashboard' : 'Register Now'}
                  </Link>
                </div>
              </div>

              {/* Dual Search + Location Filter Bar */}
              <form
                onSubmit={handleHeroSearch}
                className="mt-8 rounded-xl border border-slate-200 bg-[#F5F8FA] p-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="hero-internship-search" className="block text-xs font-semibold text-[#10243A] mb-1">
                      Internship Search
                    </label>
                    <div className="relative">
                      <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="hero-internship-search"
                        type="text"
                        value={internshipQuery}
                        onChange={(e) => setInternshipQuery(e.target.value)}
                        placeholder="e.g. ICT Intern, Outreach"
                        className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-[#10243A] focus:border-[#0F9D83] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="hero-job-search" className="block text-xs font-semibold text-[#10243A] mb-1">
                      Job Search
                    </label>
                    <div className="relative">
                      <Briefcase className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="hero-job-search"
                        type="text"
                        value={jobQuery}
                        onChange={(e) => setJobQuery(e.target.value)}
                        placeholder="e.g. Data Entry, Support"
                        className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-[#10243A] focus:border-[#0F9D83] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="hero-location-filter" className="block text-xs font-semibold text-[#10243A] mb-1">
                      Garissa Location
                    </label>
                    <div className="relative">
                      <MapPin className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        id="hero-location-filter"
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-[#10243A] focus:border-[#0F9D83] focus:outline-none"
                      >
                        <option value="">All Sub-Counties</option>
                        {GARISSA_LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="font-medium">Quick locations:</span>
                    {['Garissa Town', 'Dadaab', 'Balambala'].map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => navigate(`/opportunities?location=${encodeURIComponent(loc)}`)}
                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-[#10243A] hover:border-[#0F9D83] hover:text-[#0F9D83] transition-colors"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="rounded-lg bg-[#10243A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1A3656] transition-colors whitespace-nowrap"
                  >
                    Search Listings
                  </button>
                </div>
              </form>
            </div>

            {/* Right Visual Slot */}
            <div className="lg:col-span-5 flex">
              <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-[#10243A] min-h-[280px] lg:min-h-full">
                <ImageWithFallback
                  src="/src/assets/images/hero_garissa_tech_1795596253764.jpg"
                  alt="Young graduates and TVET students collaborating on laptops in a bright technology workspace"
                  className="h-full w-full object-cover"
                  fallbackLabel="Garissa Youth Skills & Opportunity Hub"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED INTERNSHIPS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold text-[#0F9D83]">Sample Demonstration Listings (DEMO)</p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-[#10243A]">
              Featured Internships
            </h2>
          </div>
          <Link
            to="/opportunities?type=Internship"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F9D83] hover:text-[#0B7D68] whitespace-nowrap"
          >
            View all internships
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-xl border border-slate-200 bg-white animate-pulse p-6" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredInternships.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                employer={employerMap.get(opp.employerId)}
                applicantSkills={user?.role === 'applicant' ? user.skills : undefined}
                isSaved={savedIds.has(opp.id)}
                hasApplied={appliedIds.has(opp.id)}
                onToggleSave={handleToggleSave}
                onApplyClick={(o) => setApplyTarget(o)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. FEATURED JOBS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold text-[#0F9D83]">Entry-Level &amp; Support Roles (DEMO)</p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-[#10243A]">
              Featured Jobs
            </h2>
          </div>
          <Link
            to="/opportunities?type=Job"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F9D83] hover:text-[#0B7D68] whitespace-nowrap"
          >
            View all jobs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredJobs.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              employer={employerMap.get(opp.employerId)}
              applicantSkills={user?.role === 'applicant' ? user.skills : undefined}
              isSaved={savedIds.has(opp.id)}
              hasApplied={appliedIds.has(opp.id)}
              onToggleSave={handleToggleSave}
              onApplyClick={(o) => setApplyTarget(o)}
            />
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="bg-white border-y border-slate-200 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold text-[#0F9D83]">Structured Workflow</p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-[#10243A]">
              How KaziReady Garissa Works
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Every step is designed to protect young job seekers from unverified postings, missing paperwork, and unclear stipend terms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: '01.',
                title: 'Build Your Skills Profile',
                desc: 'Register as a TVET student or graduate, list your technical skills, and check off work readiness documents.',
              },
              {
                num: '02.',
                title: 'Match with Verified Employers',
                desc: 'Only administrator-verified employers can publish opportunities across Garissa Town, Dadaab, Balambala, Fafi, Ijara, Lagdera, and Hulugho.',
              },
              {
                num: '03.',
                title: 'Sign Clear Agreements',
                desc: 'Review role scope, working hours, and monthly KES stipend commitments with downloadable internship agreement templates.',
              },
              {
                num: '04.',
                title: 'Track Agreed Stipends',
                desc: 'View expected payment dates, recorded disbursements, and outstanding balances in a transparent tracking ledger.',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="rounded-xl border border-slate-200 bg-[#F5F8FA] p-6"
              >
                <span className="font-mono text-lg font-bold text-[#0F9D83]">{step.num}</span>
                <h3 className="mt-3 text-base font-bold text-[#10243A]">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE KAZIREADY + DOCUMENTATION + PAYMENT TRANSPARENCY */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Why Choose KaziReady (Asymmetric Bento) */}
        <div>
          <div className="max-w-2xl mb-8">
            <p className="text-xs font-semibold text-[#0F9D83]">Platform Safeguards</p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-[#10243A]">
              Why Choose KaziReady Garissa
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-7 flex flex-col justify-between">
              <div>
                <ShieldCheck className="h-8 w-8 text-[#0F9D83]" />
                <h3 className="mt-4 text-xl font-bold text-[#10243A]">
                  Verified Employers Only
                </h3>
                <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                  Employers submit registration numbers and supporting documents before gaining approval. Unverified organisations cannot publish public vacancies, reducing recruitment scams and ghost listings across Garissa County.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
                <div>
                  <span className="font-semibold text-[#10243A] block">Skill Matching</span>
                  Automatic match percentage comparing applicant skills against role requirements.
                </div>
                <div>
                  <span className="font-semibold text-[#10243A] block">Sub-County Discovery</span>
                  Dedicated filtering across all 7 Garissa County sub-counties.
                </div>
                <div>
                  <span className="font-semibold text-[#10243A] block">Community Reporting</span>
                  Any user can flag suspicious employers or delayed stipend commitments.
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-[#10243A] text-white p-7 flex flex-col justify-between">
              <div>
                <Users className="h-8 w-8 text-[#0F9D83]" />
                <h3 className="mt-4 text-xl font-bold">Built for Local Talent &amp; TVETs</h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  Bridging the gap between vocational institutions, university graduates, and verified regional employers.
                </p>
              </div>
              <div className="mt-6">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-300 hover:text-white"
                >
                  Read our mission &amp; SDG alignment
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Support & Payment Transparency Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col">
            <div className="h-52 overflow-hidden border-b border-slate-200">
              <ImageWithFallback
                src="/src/assets/images/employer_team_office_1795596254794.jpg"
                alt="Organisational leaders reviewing internship documentation"
                className="h-full w-full object-cover"
                fallbackLabel="Work Documentation Support"
              />
            </div>
            <div className="p-7 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0F9D83]">
                  <FileText className="h-4 w-4" />
                  Legal &amp; Documentation Readiness
                </div>
                <h3 className="mt-2 text-xl font-bold text-[#10243A]">
                  Work Documentation Assistant
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Step-by-step guidance on CVs, academic certificates, national IDs, internship agreements, employment contracts, and work permit rules—including guidance for eligible refugees and non-citizens, plus a downloadable sample agreement.
                </p>
              </div>
              <div className="mt-6">
                <Link
                  to="/documentation"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#10243A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1A3656]"
                >
                  Open Documentation Centre
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col">
            <div className="h-52 overflow-hidden border-b border-slate-200">
              <ImageWithFallback
                src="/src/assets/images/tvet_skills_workshop_1795596254638.jpg"
                alt="Young Kenyan technician working on computer networking hardware"
                className="h-full w-full object-cover"
                fallbackLabel="Stipend Payment Transparency"
              />
            </div>
            <div className="p-7 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0F9D83]">
                  <Wallet className="h-4 w-4" />
                  Financial Transparency Ledger
                </div>
                <h3 className="mt-2 text-xl font-bold text-[#10243A]">
                  Transparent Stipend &amp; Payment Tracking
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Interns and employers track agreed KES stipends, payment frequency, expected payment dates, amounts paid, and remaining balances in one shared record—with delayed payment reporting when terms slip.
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Note: KaziReady Garissa is a payment tracking ledger and does not hold or transfer user money.
                </p>
              </div>
              <div className="mt-6">
                <Link
                  to={user ? (user.role === 'employer' ? '/dashboard/employer' : '/dashboard/applicant') : '/login'}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-[#10243A] hover:bg-slate-50"
                >
                  {user ? 'View Payment Tracker' : 'Sign In to View Payment Tracker'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. COMMUNITY IMPACT & DEMONSTRATION TESTIMONIALS */}
      <section className="bg-white border-t border-slate-200 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold text-[#0F9D83]">Garissa County Community Impact</p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-[#10243A]">
                Connecting Talent to Dignified Local Work
              </h2>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                KaziReady Garissa is designed to reduce information asymmetry, standardize written internship agreements, and give TVET students and graduates across Garissa County a trustworthy bridge into the local labour market.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#0F9D83] shrink-0 mt-0.5" />
                  <span>Coverage across all 7 Garissa sub-counties</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#0F9D83] shrink-0 mt-0.5" />
                  <span>Aligned with SDG 4, SDG 8, SDG 10, and SDG 17</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#0F9D83] shrink-0 mt-0.5" />
                  <span>Inclusive documentation guidance for citizens and eligible non-citizens</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#10243A]">
                  Voices from the Prototype
                </h3>
                <span className="font-mono text-xs font-semibold text-slate-500">
                  DEMONSTRATION CONTENT (DEMO)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <blockquote className="rounded-xl border border-slate-200 bg-[#F5F8FA] p-5">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    “Having a verified employer badge and a written stipend schedule gives students confidence before committing three months to an attachment.”
                  </p>
                  <footer className="mt-4 pt-3 border-t border-slate-200 text-xs">
                    <span className="font-bold text-[#10243A] block">Amina Hassan (DEMO)</span>
                    <span className="text-slate-500">ICT Diploma Graduate · Garissa Town</span>
                  </footer>
                </blockquote>

                <blockquote className="rounded-xl border border-slate-200 bg-[#F5F8FA] p-5">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    “Skill matching saves our small technical team hours when shortlisting TVET trainees for hardware and web support internships.”
                  </p>
                  <footer className="mt-4 pt-3 border-t border-slate-200 text-xs">
                    <span className="font-bold text-[#10243A] block">Ibrahim Farah (DEMO)</span>
                    <span className="text-slate-500">Northern Tech Hub (DEMO) · Garissa Town</span>
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ApplyModal
        opportunity={applyTarget}
        employer={applyTarget ? employerMap.get(applyTarget.employerId) : undefined}
        isOpen={Boolean(applyTarget)}
        onClose={() => setApplyTarget(null)}
        onSuccess={loadData}
      />
    </div>
  );
}
