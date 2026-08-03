'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import BrandBackground from '@/app/components/BrandBackground';
import BrandLogo from '@/app/components/BrandLogo';
import GoogleLoginButton from '@/app/components/GoogleLogin';
import { authService, getAccountVerificationState, isOrganizationRole, persistAuthSession, routeForRole } from '@/app/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [accountType, setAccountType] = useState<'user' | 'nurse' | 'organization'>('user');
  const [organizationName, setOrganizationName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const splitName = (fullName: string) => {
    const clean = fullName.trim().replace(/\s+/g, ' ');
    const [firstName, ...rest] = clean.split(' ');
    return {
      first_name: firstName || 'User',
      last_name: rest.join(' ') || 'Account',
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (accountType === 'organization' && !organizationName.trim()) {
      setError('Organization name is required for organization sign-up.');
      return;
    }

    setIsLoading(true);

    try {
      const { first_name, last_name } = splitName(formData.name);
      const payload: Record<string, unknown> = {
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        first_name,
        last_name,
        role: 'USER',
      };

      if (accountType === 'nurse') {
        payload.account_type = 'NURSE';
        payload.is_active = false;
        payload.is_verified = false;
        payload.verification_status = 'PENDING';
        payload.status = 'PENDING_VERIFICATION';
      }

      if (accountType === 'organization') {
        payload.account_type = 'ORGANIZATION_ADMIN';
        payload.organization_name = organizationName.trim();
        payload.organization_display_name = organizationName.trim();
        payload.business_name = organizationName.trim();
        payload.is_active = false;
        payload.is_verified = false;
        payload.verification_status = 'PENDING';
        payload.status = 'PENDING_VERIFICATION';
        payload.is_organization_admin = true;
        payload.is_org_admin = true;
      }

      const response = await authService.register(payload);
      const sessionUser = {
        ...(response.data?.user || {}),
        ...(response.data || {}),
        role: accountType === 'organization' ? 'ORGANIZATION_ADMIN' : accountType === 'nurse' ? 'NURSE' : 'USER',
        raw_role: accountType === 'organization' ? 'ORGANIZATION_ADMIN' : accountType === 'nurse' ? 'NURSE' : 'USER',
        account_type: accountType === 'organization' ? 'ORGANIZATION_ADMIN' : accountType === 'nurse' ? 'NURSE' : 'USER',
        organization_name: accountType === 'organization' ? organizationName.trim() : (response.data?.user?.organization_name || response.data?.organization_name || ''),
        organization_display_name: accountType === 'organization' ? organizationName.trim() : (response.data?.user?.organization_display_name || response.data?.organization_display_name || ''),
        business_name: accountType === 'organization' ? organizationName.trim() : (response.data?.user?.business_name || response.data?.business_name || ''),
        is_organization_admin: accountType === 'organization' ? true : Boolean(response.data?.user?.is_organization_admin || response.data?.is_organization_admin),
        is_org_admin: accountType === 'organization' ? true : Boolean(response.data?.user?.is_org_admin || response.data?.is_org_admin),
        is_active: response.data?.user?.is_active ?? response.data?.is_active ?? false,
        is_verified: response.data?.user?.is_verified ?? response.data?.is_verified ?? false,
        verification_status: response.data?.user?.verification_status ?? response.data?.verification_status ?? 'PENDING',
        status: response.data?.user?.status ?? response.data?.status ?? 'PENDING_VERIFICATION',
      };
      const { user } = persistAuthSession({ ...response.data, user: sessionUser, account_type: sessionUser.account_type });
      const verificationState = getAccountVerificationState(user);
      const rawRole = String((response.data?.user?.role || response.data?.role || user?.role || '')).trim();
      const normalizedRole = rawRole.toUpperCase();

      setSuccess(true);
      setTimeout(() => {
        if (accountType === 'organization' || isOrganizationRole(normalizedRole)) {
          router.push('/dashboard/organization-admin');
          return;
        }
        if (accountType === 'nurse' && verificationState.isPending) {
          router.push('/nurse/dashboard');
          return;
        }
        router.push(routeForRole(user.role));
      }, 600);
    } catch (submitError: any) {
      const details = submitError?.response?.data;
      const firstFieldError =
        details && typeof details === 'object'
          ? Object.values(details).find((value) => Array.isArray(value) && value.length > 0)
          : null;
      const message =
        (Array.isArray(firstFieldError) && String(firstFieldError[0])) ||
        (typeof details?.detail === 'string' && details.detail) ||
        (typeof details?.message === 'string' && details.message) ||
        (typeof details === 'string' && details) ||
        (submitError?.message === 'Network Error'
          ? 'Cannot reach auth server. Check NEXT_PUBLIC_API_URL and backend availability.'
          : null) ||
        'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="brand-shell flex items-center justify-center p-4">
        <BrandBackground />
        <div className="relative bg-brand-soft-white border border-brand-vintage-blue/50 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-brand-neon-green/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-brand-dark-blue" />
          </div>
          <h2 className="text-2xl font-bold text-brand-deep-navy mb-2">Account Created!</h2>
          <p className="text-slate-600 mb-6">Your account has been successfully created. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="brand-shell flex items-center justify-center p-4">
      <BrandBackground />
      <div className="relative w-full max-w-md">
        <Link href="/" className="flex items-center justify-center mb-8">
          <BrandLogo size="lg" showText={false} />
        </Link>

        <div className="bg-brand-soft-white border border-brand-vintage-blue/50 rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-brand-deep-navy mb-2">Create Account</h1>
            <p className="text-slate-600">Start caring for your loved ones today</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="mb-6 rounded-xl border border-brand-vintage-blue/40 bg-brand-vintage-blue/15 p-4">
            <p className="mb-3 text-sm font-semibold text-brand-deep-navy">Choose how you&apos;d like to join</p>
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => setAccountType('user')}
                className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
                  accountType === 'user'
                    ? 'border-brand-dark-blue bg-brand-dark-blue text-white shadow-sm'
                    : 'border-slate-300 bg-white text-brand-deep-navy hover:border-brand-vintage-blue'
                }`}
              >
                I&apos;m looking for care
              </button>
              <button
                type="button"
                onClick={() => setAccountType('nurse')}
                className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
                  accountType === 'nurse'
                    ? 'border-brand-dark-blue bg-brand-dark-blue text-white shadow-sm'
                    : 'border-slate-300 bg-white text-brand-deep-navy hover:border-brand-vintage-blue'
                }`}
              >
                I&apos;m a Nurse
              </button>
              <button
                type="button"
                onClick={() => setAccountType('organization')}
                className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
                  accountType === 'organization'
                    ? 'border-brand-dark-blue bg-brand-dark-blue text-white shadow-sm'
                    : 'border-slate-300 bg-white text-brand-deep-navy hover:border-brand-vintage-blue'
                }`}
              >
                I&apos;m registering an Organization
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {accountType === 'nurse' && 'Nurse accounts are created as pending verification and can enter their portal, but most nurse actions stay limited until approval.'}
              {accountType === 'organization' && 'Organization sign-up creates a pending organization admin profile that can enter the portal, but most management actions stay limited until approval.'}
              {accountType === 'user' && 'Public registrations default to a regular family user account.'}
            </p>
          </div>

          {accountType === 'organization' && (
            <div className="mb-6">
              <label htmlFor="organizationName" className="mb-2 block text-sm font-medium text-brand-deep-navy">
                Organization Name
              </label>
              <input
                id="organizationName"
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="input-base w-full"
                placeholder="Sunrise Care Home"
              />
            </div>
          )}

          <div className="mb-6">
            <GoogleLoginButton mode="signup_with" />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-brand-deep-navy mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-brand-dark-blue/45" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-base pl-10 pr-3"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-deep-navy mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-brand-dark-blue/45" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-base pl-10 pr-3"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-brand-deep-navy mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-brand-dark-blue/45" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-base pl-10 pr-3"
                  placeholder="+254 712 345 678"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-deep-navy mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-brand-dark-blue/45" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-base pl-10 pr-3"
                  placeholder="Min. 8 characters"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-deep-navy mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-brand-dark-blue/45" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="input-base pl-10 pr-3"
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-brand-dark-blue focus:ring-brand-sweet-rose border-slate-300 rounded mt-1"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-slate-700">
                I agree to the <Link href="/terms" className="text-brand-dark-blue hover:text-brand-deep-navy font-medium">Terms of Service</Link> and{' '}
                <Link href="/privacy" className="text-brand-dark-blue hover:text-brand-deep-navy font-medium">Privacy Policy</Link>
              </label>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-50">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Already have an account? <Link href="/login" className="text-brand-dark-blue hover:text-brand-deep-navy font-semibold">Sign In</Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-slate-600 hover:text-brand-deep-navy">&larr; Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
