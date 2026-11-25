import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { CONTACT_CONFIG } from '@/src/utils/constants';

export function Footer() {
  return (
    <footer className="bg-[#10243A] text-slate-300 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo variant="light" />
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              From Skills to Opportunities. From Opportunities to Income.
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Track 02 – Legal &amp; Financial Access · Garissa County, Kenya
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/opportunities" className="hover:text-white transition-colors">
                  Browse Opportunities
                </Link>
              </li>
              <li>
                <Link to="/for-employers" className="hover:text-white transition-colors">
                  For Employers
                </Link>
              </li>
              <li>
                <Link to="/documentation" className="hover:text-white transition-colors">
                  Work Documentation Assistant
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">About &amp; Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About KaziReady Garissa
                </Link>
              </li>
              <li>
                <Link to="/#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact &amp; FAQ
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Garissa Support Desk</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>{CONTACT_CONFIG.office}</li>
              <li>{CONTACT_CONFIG.county}</li>
              <li>{CONTACT_CONFIG.email}</li>
              <li>{CONTACT_CONFIG.phone}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} KaziReady Garissa. Sample listings, profiles, and testimonials are marked DEMO for hackathon demonstration.
          </p>
          <p>
            Payment tracker records stipend schedules only and does not hold or transfer funds.
          </p>
        </div>
      </div>
    </footer>
  );
}
