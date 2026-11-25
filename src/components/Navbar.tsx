import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '@/src/authentication/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardPath =
    user?.role === 'admin'
      ? '/dashboard/admin'
      : user?.role === 'employer'
      ? '/dashboard/employer'
      : '/dashboard/applicant';

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium whitespace-nowrap shrink-0 transition-colors pb-0.5 border-b-2 ${
      isActive
        ? 'text-[#10243A] border-[#0F9D83]'
        : 'text-slate-600 border-transparent hover:text-[#10243A] hover:border-slate-300'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <Link
          to="/"
          className="focus-visible:outline-2 focus-visible:outline-[#0F9D83] rounded-md"
          onClick={() => setMobileOpen(false)}
        >
          <Logo />
        </Link>

        {/* Zone 2: Primary Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/opportunities" className={navLinkClass}>
            Opportunities
          </NavLink>
          <NavLink to="/for-employers" className={navLinkClass}>
            For Employers
          </NavLink>
          <Link
            to="/#how-it-works"
            className="text-sm font-medium text-slate-600 hover:text-[#10243A] whitespace-nowrap shrink-0 transition-colors pb-0.5 border-b-2 border-transparent hover:border-slate-300"
          >
            How It Works
          </Link>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            Contact
          </NavLink>
        </nav>

        {/* Zone 3: Auth / Primary Action */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          {user ? (
            <>
              <Link
                to={dashboardPath}
                className="inline-flex items-center gap-2 rounded-lg bg-[#10243A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1A3656] transition-colors whitespace-nowrap shrink-0"
              >
                <LayoutDashboard className="h-4 w-4 text-[#0F9D83]" />
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#10243A] whitespace-nowrap shrink-0"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-[#10243A] hover:text-[#0F9D83] transition-colors whitespace-nowrap shrink-0"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-[#0F9D83] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B7D68] transition-colors whitespace-nowrap shrink-0"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-[#10243A] hover:bg-slate-100"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <div className="flex flex-col space-y-2.5">
            <Link to="/" onClick={() => setMobileOpen(false)} className="py-1.5 text-sm font-medium text-[#10243A]">
              Home
            </Link>
            <Link to="/opportunities" onClick={() => setMobileOpen(false)} className="py-1.5 text-sm font-medium text-[#10243A]">
              Opportunities
            </Link>
            <Link to="/for-employers" onClick={() => setMobileOpen(false)} className="py-1.5 text-sm font-medium text-[#10243A]">
              For Employers
            </Link>
            <Link to="/#how-it-works" onClick={() => setMobileOpen(false)} className="py-1.5 text-sm font-medium text-[#10243A]">
              How It Works
            </Link>
            <Link to="/documentation" onClick={() => setMobileOpen(false)} className="py-1.5 text-sm font-medium text-[#10243A]">
              Documentation Assistant
            </Link>
            <Link to="/about" onClick={() => setMobileOpen(false)} className="py-1.5 text-sm font-medium text-[#10243A]">
              About
            </Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)} className="py-1.5 text-sm font-medium text-[#10243A]">
              Contact
            </Link>
          </div>
          <div className="pt-3 border-t border-slate-200 flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center rounded-lg bg-[#10243A] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#10243A]"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center rounded-lg bg-[#0F9D83] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
