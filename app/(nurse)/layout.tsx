'use client';

import Link from 'next/link';
import { LayoutDashboard, Calendar, Users, DollarSign, User, LogOut, Menu, X, Clock3 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import BrandLogo from '@/app/components/BrandLogo';
import { getAccountVerificationState } from '@/app/lib/api';

export default function NurseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [verificationState, setVerificationState] = useState(getAccountVerificationState());

  useEffect(() => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('authUser') || localStorage.getItem('user') : null;
    if (!storedUser) {
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      setVerificationState(getAccountVerificationState(parsed));
    } catch {
      setVerificationState(getAccountVerificationState());
    }
  }, []);

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: '/nurse/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/nurse/schedule', icon: Calendar, label: 'Schedule' },
    { href: '/nurse/patients', icon: Users, label: 'My Patients' },
    { href: '/nurse/earnings', icon: DollarSign, label: 'Earnings' },
    { href: '/nurse/profile', icon: User, label: 'Profile' },
  ];

  if (verificationState.isPending) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
          <div className="w-full max-w-xl rounded-2xl border border-amber-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Clock3 className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-brand-deep-navy">Your nurse account is pending verification</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Your account has been created successfully. You can still enter your portal, but most nurse management actions remain limited until an administrator approves your account.
            </p>
            <div className="mt-6 rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
              Until verification is complete, you will mainly be able to review your account status and wait for approval. Patient and schedule actions will remain unavailable.
            </div>
          </div>

          <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-deep-navy">Portal access while pending</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>• You can access your portal and see your account status.</li>
              <li>• Patient records, scheduling, and management actions stay limited.</li>
              <li>• An administrator will unlock full access after verification.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-brand-soft-white border-b border-brand-vintage-blue/50 z-50">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center">
            <BrandLogo size="sm" />
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-brand-soft-white border-r border-brand-vintage-blue/50 z-50 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-6">
          <Link href="/" className="mb-8 flex items-center">
            <BrandLogo size="md" />
          </Link>
          
          <div className="mb-6 rounded-lg bg-brand-neon-green/20 p-3">
            <p className="text-xs font-medium text-brand-deep-navy">HEALTHCARE NURSE</p>
            <p className="mt-1 text-sm font-semibold text-brand-deep-navy">Account</p>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive(item.href)
                      ? 'bg-brand-neon-green/25 text-brand-deep-navy'
                      : 'text-gray-700 hover:bg-brand-neon-green/20 hover:text-brand-deep-navy'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <Link
              href="/login"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span>Logout</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
