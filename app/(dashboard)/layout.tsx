'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Users,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
} from 'lucide-react';
import BrandLogo from '@/app/components/BrandLogo';
import { clearAuthStorage, isEndUserRole, notificationService, routeForRole } from '@/app/lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [accountRole, setAccountRole] = useState<string | null>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem('authUser') || localStorage.getItem('user');
      if (!rawUser) {
        setAccountRole(null);
      } else {
        const parsedUser = JSON.parse(rawUser);
        setAccountRole(String(parsedUser?.role || ''));
      }
    } catch {
      setAccountRole(null);
    } finally {
      setHasCheckedAuth(true);
    }
  }, []);

  useEffect(() => {
    if (!hasCheckedAuth) {
      return;
    }

    if (!accountRole) {
      router.replace('/login');
      return;
    }

    if (!isEndUserRole(accountRole)) {
      router.replace(routeForRole(accountRole));
    }
  }, [accountRole, hasCheckedAuth, router]);

  useEffect(() => {
    if (!isEndUserRole(accountRole)) {
      return;
    }

    const loadUnreadCount = async () => {
      try {
        const response = await notificationService.unreadCount();
        const count = Number(response?.data?.unread_count ?? response?.data?.count ?? 0);
        setUnreadCount(Number.isFinite(count) ? count : 0);
      } catch {
        setUnreadCount(0);
      }
    };

    void loadUnreadCount();
  }, [accountRole, pathname]);

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/family', icon: Users, label: 'Family Members' },
    { href: '/dashboard/appointments', icon: Calendar, label: 'Appointments' },
    { href: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
    { href: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  if (!hasCheckedAuth || !isEndUserRole(accountRole)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-600">Loading your account...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-brand-soft-white border-b border-brand-vintage-blue/50 z-50">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center">
            <BrandLogo size="sm" />
          </Link>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
            {isSidebarOpen ? <X className="h-6 w-6 text-gray-600" /> : <Menu className="h-6 w-6 text-gray-600" />}
          </button>
        </div>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-brand-soft-white border-r border-brand-vintage-blue/50 z-50 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-6">
          <Link href="/" className="mb-8 flex items-center">
            <BrandLogo size="md" className="hidden lg:inline-flex" />
            <BrandLogo size="sm" className="inline-flex lg:hidden" />
          </Link>

          <div className="mb-6 rounded-lg bg-brand-vintage-blue/30 p-3">
            <p className="text-xs font-medium text-brand-dark-blue">{accountRole.toUpperCase()}</p>
            <p className="mt-1 text-sm font-semibold text-brand-deep-navy">Account</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isNotifications = item.href === '/dashboard/notifications';
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-brand-vintage-blue/40 text-brand-dark-blue'
                      : 'text-gray-700 hover:bg-brand-vintage-blue/30 hover:text-brand-dark-blue'
                  }`}
                >
                  <span className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </span>
                  {isNotifications && unreadCount > 0 && (
                    <span className="min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-xs font-semibold flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <Link
              href="/login"
              onClick={() => {
                clearAuthStorage();
                setIsSidebarOpen(false);
              }}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span>Logout</span>
            </Link>
          </div>
        </div>
      </aside>

      <main className="lg:ml-64 md:pt-[6rem] pt-[7rem] lg:pt-0 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
