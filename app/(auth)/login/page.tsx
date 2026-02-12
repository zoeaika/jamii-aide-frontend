'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import BrandBackground from '@/components/BrandBackground';
import BrandLogo from '@/components/BrandLogo';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    accountType: 'PRIMARY_USER',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (formData.accountType === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (formData.accountType === 'HEALTHCARE_NURSE') {
        router.push('/nurse/dashboard');
      } else {
        router.push('/dashboard');
      }
    }, 1000);
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

          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium text-brand-deep-navy">I am a:</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, accountType: 'PRIMARY_USER' })}
                className={`rounded-lg border-2 p-3 text-left transition ${
                  formData.accountType === 'PRIMARY_USER'
                    ? 'border-brand-dark-blue bg-brand-vintage-blue/35'
                    : 'border-slate-300 hover:border-brand-dark-blue/40'
                }`}
              >
                <div className="text-sm font-semibold text-brand-deep-navy">Family</div>
                <div className="mt-1 text-xs text-slate-600">User portal</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, accountType: 'HEALTHCARE_NURSE' })}
                className={`rounded-lg border-2 p-3 text-left transition ${
                  formData.accountType === 'HEALTHCARE_NURSE'
                    ? 'border-brand-neon-green bg-brand-neon-green/20'
                    : 'border-slate-300 hover:border-brand-neon-green/50'
                }`}
              >
                <div className="text-sm font-semibold text-brand-deep-navy">Nurse</div>
                <div className="mt-1 text-xs text-slate-600">Nurse portal</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, accountType: 'ADMIN' })}
                className={`rounded-lg border-2 p-3 text-left transition ${
                  formData.accountType === 'ADMIN'
                    ? 'border-brand-sweet-rose bg-brand-sweet-rose/20'
                    : 'border-slate-300 hover:border-brand-sweet-rose/50'
                }`}
              >
                <div className="text-sm font-semibold text-brand-deep-navy">Admin</div>
                <div className="mt-1 text-xs text-slate-600">Admin portal</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-brand-deep-navy">
                Email Address
              </label>
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
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-brand-deep-navy">
                Password
              </label>
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
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-brand-dark-blue focus:ring-brand-vintage-blue"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-slate-700">
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm font-medium text-brand-dark-blue hover:text-brand-deep-navy">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-brand-dark-blue hover:text-brand-deep-navy">
              Sign Up
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-slate-600 hover:text-brand-deep-navy">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
