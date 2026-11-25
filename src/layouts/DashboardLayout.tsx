import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, ExternalLink } from 'lucide-react';
import { Logo } from '@/src/components/Logo';
import { useAuth } from '@/src/authentication/AuthContext';

export interface DashboardTabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badgeCount?: number;
}

interface DashboardLayoutProps {
  roleLabel: string;
  breadcrumb: string;
  tabs: DashboardTabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: React.ReactNode;
}

export function DashboardLayout({
  roleLabel,
  breadcrumb,
  tabs,
  activeTab,
  onTabChange,
  children,
}: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-[#F5F8FA] text-[#10243A]">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#10243A]/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#10243A] text-white flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800">
          <Link to="/" onClick={() => setSidebarOpen(false)}>
            <Logo variant="light" size="sm" />
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-300 hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-slate-800">
          <p className="text-xs font-medium text-teal-300">{roleLabel}</p>
          <p className="mt-0.5 text-sm font-semibold text-white truncate">
            {user?.fullName || 'Account'}
          </p>
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Dashboard sections">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onTabChange(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-[#0F9D83] text-white'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  {tab.icon}
                  <span className="truncate">{tab.label}</span>
                </span>
                {typeof tab.badgeCount === 'number' && tab.badgeCount > 0 && (
                  <span
                    className={`font-mono text-xs tabular-nums px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-teal-200'
                    }`}
                  >
                    {tab.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/opportunities"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <span>Browse Marketplace</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/documentation"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <span>Documentation Centre</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-lg p-2 text-[#10243A] hover:bg-slate-100"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-sm font-medium text-slate-600 truncate">
              <Link to="/" className="hover:text-[#10243A]">
                KaziReady
              </Link>{' '}
              / <span className="text-[#10243A] font-semibold">{breadcrumb}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/opportunities"
              className="hidden sm:inline-flex rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-[#10243A] hover:bg-slate-50 whitespace-nowrap"
            >
              Find Opportunities
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
