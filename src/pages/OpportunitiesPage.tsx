import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { dataService } from '@/src/services/dataService';
import { Employer, Opportunity } from '@/src/types';
import { GARISSA_LOCATIONS } from '@/src/utils/constants';
import { calculateSkillMatch } from '@/src/utils/formatters';
import { OpportunityCard } from '@/src/components/OpportunityCard';
import { ApplyModal } from '@/src/components/ApplyModal';
import { useAuth } from '@/src/authentication/AuthContext';
import { useToast } from '@/src/hooks/useToast';

export function OpportunitiesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [applyTarget, setApplyTarget] = useState<Opportunity | null>(null);

  // Filters
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  const [paidFilter, setPaidFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [deadlineFilter, setDeadlineFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'stipend' | 'match'>('newest');

  const loadMarketplace = async () => {
    setLoading(true);
    try {
      const [opps, emps, cats] = await Promise.all([
        dataService.getOpportunities(false),
        dataService.getEmployers(),
        dataService.getCategories(),
      ]);
      setOpportunities(opps);
      setEmployers(emps);
      setCategories(cats);

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
    loadMarketplace();
  }, [user?.id]);

  const employerMap = useMemo(() => new Map(employers.map((e) => [e.id, e])), [employers]);

  const filteredOpportunities = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = opportunities.filter((opp) => {
      const emp = employerMap.get(opp.employerId);
      const matchesQuery =
        !q ||
        opp.title.toLowerCase().includes(q) ||
        opp.description.toLowerCase().includes(q) ||
        (emp?.organizationName.toLowerCase().includes(q) ?? false);
      const matchesLocation = !locationFilter || opp.location === locationFilter;
      const matchesCategory = !categoryFilter || opp.category === categoryFilter;
      const matchesType = !typeFilter || opp.opportunityType === typeFilter;
      const matchesPaid =
        paidFilter === 'all' ||
        (paidFilter === 'paid' && opp.isPaid) ||
        (paidFilter === 'unpaid' && !opp.isPaid);
      const matchesDeadline = !deadlineFilter || opp.deadline <= deadlineFilter;

      return (
        matchesQuery &&
        matchesLocation &&
        matchesCategory &&
        matchesType &&
        matchesPaid &&
        matchesDeadline
      );
    });

    if (sortBy === 'stipend') {
      return [...list].sort((a, b) => b.stipendMonthlyKes - a.stipendMonthlyKes);
    }
    if (sortBy === 'match' && user?.role === 'applicant') {
      return [...list].sort(
        (a, b) =>
          calculateSkillMatch(user.skills, b.skillsRequired).percentage -
          calculateSkillMatch(user.skills, a.skillsRequired).percentage
      );
    }
    return list;
  }, [
    opportunities,
    employerMap,
    query,
    locationFilter,
    categoryFilter,
    typeFilter,
    paidFilter,
    deadlineFilter,
    sortBy,
    user,
  ]);

  const resetFilters = () => {
    setQuery('');
    setLocationFilter('');
    setCategoryFilter('');
    setTypeFilter('');
    setPaidFilter('all');
    setDeadlineFilter('');
    setSortBy('newest');
    setSearchParams({});
  };

  const handleToggleSave = async (oppId: string) => {
    if (!user) {
      showToast('Sign in required', 'Sign in to bookmark opportunities.', 'info');
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
    showToast(saved ? 'Saved to dashboard' : 'Removed from saved', undefined, 'success');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#0F9D83]">
            Verified Listings · Sample Vacancies Marked DEMO
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-[#10243A]">
            Opportunities Marketplace
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            Search internships, industrial attachments, and entry-level jobs published by administrator-verified employers across Garissa County.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-600 tabular-nums">
          Showing {filteredOpportunities.length} of {opportunities.length} verified openings
        </div>
      </div>

      {/* Filter Panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-[#10243A]">
            <SlidersHorizontal className="h-4 w-4 text-[#0F9D83]" />
            Search &amp; Filter Opportunities
          </span>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#10243A]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Title or Employer
            </label>
            <div className="relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, skill, or employer..."
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm focus:border-[#0F9D83] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Garissa Sub-County
            </label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0F9D83] focus:outline-none"
            >
              <option value="">All Locations</option>
              {GARISSA_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0F9D83] focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Opportunity Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0F9D83] focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="Internship">Internship</option>
              <option value="Job">Job</option>
              <option value="Attachment">Attachment</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Stipend Arrangement
            </label>
            <select
              value={paidFilter}
              onChange={(e) => setPaidFilter(e.target.value as 'all' | 'paid' | 'unpaid')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0F9D83] focus:outline-none"
            >
              <option value="all">Paid &amp; Unpaid</option>
              <option value="paid">Paid Stipend Only</option>
              <option value="unpaid">Unpaid / Academic</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deadline Before
            </label>
            <input
              type="date"
              value={deadlineFilter}
              onChange={(e) => setDeadlineFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0F9D83] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'stipend' | 'match')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0F9D83] focus:outline-none"
            >
              <option value="newest">Most Recent</option>
              <option value="stipend">Highest Stipend (KES)</option>
              {user?.role === 'applicant' && (
                <option value="match">Best Skill Match %</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-xl border border-slate-200 bg-white animate-pulse" />
          ))}
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <h3 className="text-lg font-bold text-[#10243A]">No Matching Opportunities Found</h3>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
            Try clearing one or more filters or broadening your Garissa sub-county selection.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 rounded-lg bg-[#0F9D83] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B7D68]"
          >
            Show All Opportunities
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opp) => (
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

      <ApplyModal
        opportunity={applyTarget}
        employer={applyTarget ? employerMap.get(applyTarget.employerId) : undefined}
        isOpen={Boolean(applyTarget)}
        onClose={() => setApplyTarget(null)}
        onSuccess={loadMarketplace}
      />
    </div>
  );
}
