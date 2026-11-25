import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ShieldCheck, MapPin, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Employer, Opportunity } from '@/src/types';
import { calculateSkillMatch, formatDate, formatKes } from '@/src/utils/formatters';

interface OpportunityCardProps {
  opportunity: Opportunity;
  employer?: Employer;
  applicantSkills?: string[];
  isSaved?: boolean;
  hasApplied?: boolean;
  onToggleSave?: (opportunityId: string) => void;
  onApplyClick?: (opportunity: Opportunity) => void;
}

export function OpportunityCard({
  opportunity,
  employer,
  applicantSkills,
  isSaved = false,
  hasApplied = false,
  onToggleSave,
  onApplyClick,
}: OpportunityCardProps) {
  const isVerified = employer?.verificationStatus === 'verified';
  const match =
    applicantSkills && applicantSkills.length > 0
      ? calculateSkillMatch(applicantSkills, opportunity.skillsRequired)
      : null;

  return (
    <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-[#0F9D83]/60">
      <div>
        {/* Clean unboxed metadata kicker */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 min-w-0 truncate">
            {opportunity.isDemo && (
              <>
                <span className="font-mono font-semibold text-[#10243A]">DEMO</span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span className="font-medium text-[#0F9D83]">{opportunity.opportunityType}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{opportunity.category}</span>
          </div>

          {onToggleSave && (
            <button
              type="button"
              onClick={() => onToggleSave(opportunity.id)}
              className={`rounded-lg p-1.5 transition-colors shrink-0 ${
                isSaved
                  ? 'text-[#0F9D83] bg-[#0F9D83]/10'
                  : 'text-slate-400 hover:text-[#10243A] hover:bg-slate-100'
              }`}
              aria-label={isSaved ? 'Remove from saved opportunities' : 'Save opportunity'}
              title={isSaved ? 'Saved' : 'Save opportunity'}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-[#10243A] leading-snug">
          <Link
            to={`/opportunities/${opportunity.id}`}
            className="hover:text-[#0F9D83] transition-colors"
          >
            {opportunity.title}
          </Link>
        </h3>

        {/* Employer + Trust */}
        <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-700">
          <span className="font-medium truncate">
            {employer?.organizationName || 'Verified Partner (DEMO)'}
          </span>
          {isVerified && (
            <span
              className="inline-flex items-center gap-1 text-xs font-medium text-[#0F9D83] shrink-0"
              title="Employer verified by KaziReady Garissa administrator"
            >
              <ShieldCheck className="h-4 w-4" />
              Verified
            </span>
          )}
        </div>

        {/* Description */}
        <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-2">
          {opportunity.description}
        </p>

        {/* Key Metadata Grid */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block">Location</span>
            <span className="mt-0.5 inline-flex items-center gap-1 font-medium text-[#10243A]">
              <MapPin className="h-3.5 w-3.5 text-[#0F9D83]" />
              {opportunity.location}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Monthly Stipend</span>
            <span className="mt-0.5 block font-mono font-semibold text-[#10243A] tabular-nums">
              {opportunity.isPaid && opportunity.stipendMonthlyKes > 0
                ? `${formatKes(opportunity.stipendMonthlyKes)} / mo`
                : 'Unpaid'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Deadline</span>
            <span className="mt-0.5 inline-flex items-center gap-1 font-mono text-slate-700 tabular-nums">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              {formatDate(opportunity.deadline)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Requirements</span>
            <span className="mt-0.5 block text-slate-700 truncate" title={opportunity.requirements.join('; ')}>
              {opportunity.requirements[0] || 'See details'}
            </span>
          </div>
        </div>

        {/* Skill Match Meter for Signed-in Applicants */}
        {match && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">Skill Match</span>
              <span className="font-mono font-semibold text-[#0F9D83] tabular-nums">
                {match.percentage}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-xs bg-[#F5F8FA] overflow-hidden">
              <div
                className="h-full bg-[#0F9D83] transition-all"
                style={{ width: `${match.percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3">
        <Link
          to={`/opportunities/${opportunity.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#10243A] hover:bg-slate-50 transition-colors whitespace-nowrap"
        >
          View Details
        </Link>

        {hasApplied ? (
          <span className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-600 whitespace-nowrap">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#0F9D83]" />
            Applied
          </span>
        ) : onApplyClick ? (
          <button
            type="button"
            onClick={() => onApplyClick(opportunity)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0F9D83] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0B7D68] transition-colors whitespace-nowrap"
          >
            Apply Now
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <Link
            to={`/opportunities/${opportunity.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0F9D83] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0B7D68] transition-colors whitespace-nowrap"
          >
            Apply Now
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </article>
  );
}
