'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Building2, CalendarClock, LogOut } from 'lucide-react';
import BrandLogo from '@/app/components/BrandLogo';
import { clearAuthStorage, getAccountVerificationState, getRoleValue, isOrganizationRole, routeForRole } from '@/app/lib/api';
import { readStoredAccountRole } from '@/app/lib/clientStorage';

export default function OrganizationAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const hasCheckedAuth = useSyncExternalStore(() => () => {}, () => true, () => false);
  const accountRole = useSyncExternalStore(() => () => {}, readStoredAccountRole, () => null);
  const [verificationState, setVerificationState] = useState(getAccountVerificationState({ role: accountRole || undefined }));
  const [resolvedRole, setResolvedRole] = useState<string | null>(accountRole);

  useEffect(() => {
    if (!hasCheckedAuth) {
      return;
    }

    if (!accountRole) {
      router.replace('/login');
      return;
    }

    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('authUser') || localStorage.getItem('user') : null;
    let nextRole = accountRole;
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        nextRole = getRoleValue(parsed as Record<string, unknown>) || accountRole || '';
        setResolvedRole(nextRole);
        setVerificationState(getAccountVerificationState(parsed));
      } catch {
        setVerificationState(getAccountVerificationState({ role: accountRole || undefined }));
      }
    }

    if (!isOrganizationRole(nextRole)) {
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('authUser') || localStorage.getItem('user') : null;
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser) as Record<string, unknown>;
          const fallbackRole = String(
            (parsed.role as string | undefined) ||
            (parsed.raw_role as string | undefined) ||
            (parsed.user && typeof parsed.user === 'object' ? ((parsed.user as Record<string, unknown>).role as string | undefined) : '') ||
            (parsed.user && typeof parsed.user === 'object' ? ((parsed.user as Record<string, unknown>).raw_role as string | undefined) : '') ||
            ''
          ).trim();
          if (isOrganizationRole(fallbackRole)) {
            setResolvedRole(fallbackRole);
            return;
          }
        } catch {
          // ignore
        }
      }
      router.replace(routeForRole(nextRole));
    }
  }, [accountRole, hasCheckedAuth, router]);

  if (!hasCheckedAuth || !isOrganizationRole(resolvedRole || accountRole)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-600">Loading organization portal...</p>
      </div>
    );
  }

  if (verificationState.isPending) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
          <div className="w-full max-w-xl rounded-2xl border border-purple-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-purple-700">
              <Building2 className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-brand-deep-navy">Your organization account is pending verification</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Your organization admin account has been created successfully. You can still enter the portal, but most management actions remain limited until an administrator approves the account.
            </p>
            <div className="mt-6 rounded-lg border border-purple-100 bg-purple-50 p-4 text-sm text-purple-800">
              Until verification is complete, you will mainly be able to review your portal status and wait for approval. Nurse and appointment management actions will remain unavailable.
            </div>
          </div>

          <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-deep-navy">Portal access while pending</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>• You can access your portal and confirm your account is pending review.</li>
              <li>• Nurse and appointment management features stay limited.</li>
              <li>• An administrator will unlock full access after verification.</li>
            </ul>
          </div>
        </div>
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
