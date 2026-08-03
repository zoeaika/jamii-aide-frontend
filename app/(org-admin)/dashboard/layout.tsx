'use client';

import { useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Building2, CalendarClock, LogOut } from 'lucide-react';
import BrandLogo from '@/app/components/BrandLogo';
import { clearAuthStorage, routeForRole } from '@/app/lib/api';
import { readStoredAccountRole } from '@/app/lib/clientStorage';

const isOrganizationAdminRole = (role?: string | null) =>
  String(role || '').trim().toUpperCase() === 'ORGANIZATION_ADMIN';

export default function OrganizationAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const hasCheckedAuth = useSyncExternalStore(() => () => {}, () => true, () => false);
  const accountRole = useSyncExternalStore(() => () => {}, readStoredAccountRole, () => null);

  useEffect(() => {
    if (!hasCheckedAuth) {
      return;
    }

    if (!accountRole) {
      router.replace('/login');
      return;
    }

    if (!isOrganizationAdminRole(accountRole)) {
      router.replace(routeForRole(accountRole));
    }
  }, [accountRole, hasCheckedAuth, router]);

  if (!hasCheckedAuth || !isOrganizationAdminRole(accountRole)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-600">Loading organization portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard/organization-admin" className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">
              ORG ADMIN
            </span>
          </Link>

          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/dashboard/organization-admin"
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition ${
                pathname === '/dashboard/organization-admin'
                  ? 'bg-purple-100 text-purple-800'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Building2 className="h-4 w-4" />
              Portal
            </Link>
            <Link
              href="/dashboard/organization-admin#appointments"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              <CalendarClock className="h-4 w-4" />
              Appointments
            </Link>
            <Link
              href="/login"
              onClick={() => clearAuthStorage()}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
