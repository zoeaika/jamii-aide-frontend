'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import BrandBackground from '@/app/components/BrandBackground';
import BrandLogo from '@/app/components/BrandLogo';
import GoogleLoginButton from '@/app/components/GoogleLogin';
import { authService, persistAuthSession, routeForRole } from '@/app/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login(formData.email, formData.password);
      const persistedSession = persistAuthSession(response.data);
      const resolvedRoute = routeForRole(persistedSession.user.role);
      router.push(resolvedRoute);
    } catch (submitError: any) {
      const details = submitError?.response?.data;
      const message =
        (Array.isArray(details?.non_field_errors) && details.non_field_errors[0]) ||
        (typeof details?.detail === 'string' && details.detail) ||
        (typeof details?.message === 'string' && details.message) ||
        (typeof details === 'string' && details) ||
        (submitError?.message === 'Network Error'
          ? 'Cannot reach auth server. Check NEXT_PUBLIC_API_URL and backend availability.'
          : null) ||
        (typeof submitError?.message === 'string' && submitError.message) ||
        'Sign in failed. Please check your credentials.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAuth = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('authUser');
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="brand-shell flex items-center justify-center p-4">
      <BrandBackground />
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center">
          <BrandLogo size="lg" showText={false} />
        </Link>

        <div className="surface-card p-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-brand-deep-navy">Welcome Back</h1>
            <p className="text-slate-600">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={handleResetAuth}
              className="text-xs font-medium text-slate-600 underline underline-offset-2 hover:text-brand-deep-navy"
            >
              Reset Auth
            </button>
          </div>

          <div className="mb-6">
            <GoogleLoginButton />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-brand-deep-navy">Email Address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
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
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-brand-deep-navy">Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-brand-dark-blue/45" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-base pl-10 pr-3"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-brand-dark-blue focus:ring-brand-vintage-blue" />
                <label htmlFor="remember" className="ml-2 block text-sm text-slate-700">Remember me</label>
              </div>
              <Link href="/forgot-password" className="text-sm font-medium text-brand-dark-blue hover:text-brand-deep-navy">Forgot password?</Link>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-50">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Don&apos;t have an account? <Link href="/register" className="font-semibold text-brand-dark-blue hover:text-brand-deep-navy">Sign Up</Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-slate-600 hover:text-brand-deep-navy">&larr; Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
