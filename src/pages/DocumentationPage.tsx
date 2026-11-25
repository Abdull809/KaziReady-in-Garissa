import React, { useEffect, useState } from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  AlertTriangle,
  CheckSquare,
  Square,
  Scale,
  BookOpen,
} from 'lucide-react';
import {
  DOCUMENT_CHECKLIST_ITEMS,
  OFFICIAL_GOVERNMENT_LINKS,
} from '@/src/utils/constants';
import { downloadTextFile, generateSampleAgreementText } from '@/src/utils/formatters';
import { useAuth } from '@/src/authentication/AuthContext';
import { useToast } from '@/src/hooks/useToast';

export function DocumentationPage() {
  const { user, updateUserProfile } = useAuth();
  const { showToast } = useToast();
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [activeTopic, setActiveTopic] = useState<string>('cv');

  useEffect(() => {
    if (user?.documentChecklist) {
      setChecklist(user.documentChecklist);
    }
  }, [user]);

  const toggleItem = async (id: string) => {
    const updated = { ...checklist, [id]: !checklist[id] };
    setChecklist(updated);
    if (user) {
      try {
        await updateUserProfile({ documentChecklist: updated });
        showToast('Checklist updated', 'Your document readiness progress was saved.', 'success');
      } catch {
        showToast('Save failed', 'Could not update checklist on profile.', 'error');
      }
    }
  };

  const completedCount = DOCUMENT_CHECKLIST_ITEMS.filter((i) => checklist[i.id]).length;

  const handleDownloadSampleAgreement = () => {
    const content = generateSampleAgreementText();
    downloadTextFile('KaziReady_Garissa_Sample_Internship_Agreement.txt', content);
    showToast(
      'Sample Agreement Downloaded',
      'Review and customize the template with your host employer.',
      'success'
    );
  };

  const topics = [
    {
      id: 'cv',
      title: '1. CV Preparation',
      summary: 'Structuring an employer-ready CV for TVET students and graduates.',
      points: [
        'Keep your CV concise (1–2 pages) with clear contact details, Garissa sub-county, and career objective.',
        'List TVET modules, practical workshop projects, industrial attachment experience, and digital/technical tools.',
        'Include two verifiable referees such as a polytechnic instructor, department head, or community supervisor.',
      ],
    },
    {
      id: 'certificates',
      title: '2. Academic Certificates & Attachment Letters',
      summary: 'Preparing KNEC transcripts, university letters, and recommendation documents.',
      points: [
        'Keep clear digital PDF scans of your KCSE certificate, TVET/university transcripts, and completion letters.',
        'Students seeking mandatory industrial attachment should obtain an official introduction and insurance cover letter from their institution.',
        'Never hand over original physical certificates permanently to an employer; share verified copies for inspection.',
      ],
    },
    {
      id: 'identification',
      title: '3. Identification Documents (Where Applicable)',
      summary: 'Standard identity verification during lawful workplace onboarding.',
      points: [
        'Kenyan citizens typically present a National Identity Card (or waiting card/passport where applicable) during formal onboarding.',
        'Registered refugees and asylum seekers in Kenya use official documents issued by the Department of Refugee Services (DRS) and UNHCR where applicable.',
        'For paid placements, a KRA PIN certificate is commonly requested for statutory payroll and tax compliance.',
      ],
    },
    {
      id: 'agreements',
      title: '4. Internship Agreements & Employment Contracts',
      summary: 'Written terms protecting both trainees and host organisations.',
      points: [
        'Always request written terms specifying your role title, start and end dates, supervisor name, and working hours.',
        'Ensure any agreed stipend amount (KES) and payment schedule (monthly, bi-weekly, or weekly) are stated clearly in writing.',
        'Employment contracts for full roles should outline probation periods, leave entitlements, and notice periods consistent with Kenya’s Employment Act.',
      ],
    },
    {
      id: 'permits',
      title: '5. Work Permits, Citizens & Eligible Non-Citizens',
      summary: 'General informational overview of work authorization in Kenya.',
      points: [
        'Kenyan citizens generally do not need foreign-national work permits for ordinary employment or internships within Kenya.',
        'Foreign nationals generally require appropriate work permits or passes issued through the Directorate of Immigration Services (eCitizen) before engaging in employment.',
        'Eligible refugees and non-citizens residing in Kenya—including those in Dadaab and Garissa County—should consult official guidance from the Department of Refugee Services (DRS), Immigration Services, or accredited legal aid partners regarding current permit or pass requirements.',
      ],
    },
  ];

  const currentTopic = topics.find((t) => t.id === activeTopic) || topics[0];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-7 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold text-[#0F9D83]">
              Track 02 · Legal &amp; Financial Access
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-[#10243A]">
              Work Documentation Assistant
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              Clear, accessible guidance on workplace paperwork, written internship agreements, and official Kenyan employment documentation resources—built for youth, TVET trainees, graduates, and host employers in Garissa County.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadSampleAgreement}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F9D83] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0B7D68] transition-colors shrink-0 whitespace-nowrap"
          >
            <Download className="h-4 w-4" />
            Download Sample Internship Agreement
          </button>
        </div>

        {/* Mandatory Legal Information Disclaimer */}
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <strong>Legal Information Disclaimer:</strong> The guidance and sample agreement on this page are provided strictly for general educational and informational purposes. KaziReady Garissa does <strong>not</strong> provide formal legal representation and does <strong>not</strong> automatically determine individual legal eligibility or immigration status. Always verify current requirements through official Kenyan government agencies or qualified legal counsel.
          </div>
        </div>
      </div>

      {/* Interactive Guide + Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Topic Selector & Content */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-[#0F9D83]" />
              <h2 className="text-lg font-bold text-[#10243A]">Documentation Guidance Topics</h2>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setActiveTopic(topic.id)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors text-left ${
                    activeTopic === topic.id
                      ? 'bg-[#10243A] text-white'
                      : 'bg-[#F5F8FA] text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {topic.title}
                </button>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h3 className="text-xl font-bold text-[#10243A]">{currentTopic.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{currentTopic.summary}</p>
              <ul className="mt-4 space-y-3">
                {currentTopic.points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                    <span className="font-mono text-xs font-bold text-[#0F9D83] mt-1">
                      0{i + 1}.
                    </span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Highlighted Citizens vs Non-Citizens Clarifier */}
          <div className="rounded-xl border border-slate-200 bg-[#10243A] text-white p-6">
            <div className="flex items-start gap-3">
              <Scale className="h-6 w-6 text-[#0F9D83] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold">
                  Key Clarification: Kenyan Citizens vs. Non-Citizens
                </h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  <strong>Kenyan citizens generally do not need foreign-national work permits</strong> for ordinary employment, industrial attachments, or internships in Kenya. Foreign nationals, including eligible refugees and non-citizens seeking formal work or permits, should follow official Directorate of Immigration Services and Department of Refugee Services procedures.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Document Readiness Checklist + Official Gov Links */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-[#10243A]">Document Readiness Checklist</h2>
              <span className="font-mono text-sm font-bold text-[#0F9D83] tabular-nums">
                {completedCount}/{DOCUMENT_CHECKLIST_ITEMS.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              {user
                ? 'Tick items below to save readiness progress to your profile.'
                : 'Practice tracking your required documents here, or sign in to save your checklist.'}
            </p>

            <div className="space-y-3">
              {DOCUMENT_CHECKLIST_ITEMS.map((item) => {
                const checked = Boolean(checklist[item.id]);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className={`w-full flex items-start gap-3 rounded-lg border p-3.5 text-left transition-colors ${
                      checked
                        ? 'border-[#0F9D83]/50 bg-[#0F9D83]/5'
                        : 'border-slate-200 bg-white hover:bg-[#F5F8FA]'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="h-5 w-5 text-[#0F9D83] shrink-0 mt-0.5" />
                    ) : (
                      <Square className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="block text-sm font-semibold text-[#10243A]">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-600">
                        {item.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-[#0F9D83]" />
              <h2 className="text-lg font-bold text-[#10243A]">Official Government Information</h2>
            </div>
            <div className="space-y-3">
              {OFFICIAL_GOVERNMENT_LINKS.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-slate-200 p-3.5 hover:border-[#0F9D83] transition-colors group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#10243A] group-hover:text-[#0F9D83]">
                      {link.title}
                    </span>
                    <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-[#0F9D83] shrink-0" />
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{link.summary}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
