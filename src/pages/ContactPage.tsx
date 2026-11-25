import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { CONTACT_CONFIG } from '@/src/utils/constants';
import { isValidEmail } from '@/src/utils/validation';
import { dataService } from '@/src/services/dataService';
import { useToast } from '@/src/hooks/useToast';

const FAQS = [
  {
    q: 'Does KaziReady Garissa charge applicants to apply for internships or jobs?',
    a: 'No. Searching and applying for verified opportunities on KaziReady Garissa is completely free for young people, TVET students, and graduates. Report any employer that requests an application fee.',
  },
  {
    q: 'How are employers verified before posting opportunities?',
    a: 'Every employer submits organisation details, registration number, and supporting documentation. Unverified employers cannot publish public opportunities until an administrator reviews and approves their account.',
  },
  {
    q: 'Does KaziReady Garissa hold or transfer stipend money?',
    a: 'No. KaziReady Garissa is a payment transparency and tracking system only. It records agreed stipends, due dates, and payment history so both interns and employers have a shared written record.',
  },
  {
    q: 'Do Kenyan citizens need a work permit for internships or jobs?',
    a: 'Kenyan citizens generally do not need foreign-national work permits for ordinary employment in Kenya. Non-citizens and eligible refugees can review official Directorate of Immigration Services and Department of Refugee Services links in our Work Documentation Assistant.',
  },
];

export function ContactPage() {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Please enter your full name.');
    if (!isValidEmail(email)) return setError('Please enter a valid email address.');
    if (!subject.trim()) return setError('Please enter a subject.');
    if (message.trim().length < 15) {
      return setError('Please enter a message of at least 15 characters.');
    }

    setSubmitting(true);
    try {
      await dataService.submitContactForm({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      showToast('Message Received', 'Your inquiry has been recorded by the Garissa support desk.', 'success');
    } catch {
      setError('Could not submit your inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold text-[#0F9D83]">Support &amp; Inquiries</p>
        <h1 className="mt-1 text-3xl font-extrabold text-[#10243A]">
          Contact KaziReady Garissa
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          Questions about employer verification, internship documentation, or reporting a listing in Garissa County? Reach out below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-7">
          <h2 className="text-lg font-bold text-[#10243A] mb-5">Send a Message</h2>

          {submitted ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-[#0F9D83] mx-auto" />
              <h3 className="mt-3 text-lg font-bold text-[#10243A]">Thank You for Reaching Out</h3>
              <p className="mt-1 text-sm text-slate-600">
                Your message has been logged with our Garissa County support team.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-[#10243A] hover:bg-slate-50"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#10243A] mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Employer verification inquiry"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-[#0F9D83] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#10243A] mb-1">
                  Message *
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you?"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-[#0F9D83] focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[#0F9D83] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0B7D68] disabled:opacity-60"
              >
                {submitting ? 'Sending...' : 'Submit Message'}
              </button>
            </form>
          )}
        </div>

        {/* Configurable Contact Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-[#10243A] text-white p-7">
            <h2 className="text-lg font-bold">Garissa County Support Desk</h2>
            <p className="mt-1 text-xs text-slate-300">
              Configurable demonstration contact details (set via environment variables).
            </p>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#0F9D83] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">{CONTACT_CONFIG.office}</span>
                  <span className="text-slate-300 text-xs">{CONTACT_CONFIG.county}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-[#0F9D83] shrink-0 mt-0.5" />
                <span className="text-slate-200">{CONTACT_CONFIG.email}</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-[#0F9D83] shrink-0 mt-0.5" />
                <span className="text-slate-200">{CONTACT_CONFIG.phone}</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-[#0F9D83] shrink-0 mt-0.5" />
                <span className="text-slate-200">{CONTACT_CONFIG.hours}</span>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-[#10243A] mb-4">Frequently Asked Questions</h2>
            <div className="divide-y divide-slate-200">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between gap-3 text-left text-sm font-semibold text-[#10243A] hover:text-[#0F9D83]"
                      aria-expanded={isOpen}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-2 text-xs text-slate-600 leading-relaxed">{faq.a}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
