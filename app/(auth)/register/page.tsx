'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import BrandBackground from '@/app/components/BrandBackground';
import BrandLogo from '@/app/components/BrandLogo';
import GoogleLoginButton from '@/app/components/GoogleLogin';
import { authService } from '@/app/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    visitorType: '',
    visitorTypeOther: '',
    password: '',
    confirmPassword: '',
    accountType: 'END_USER',
  });

  const routeByRole = (role: string) => {
    if (role === 'ADMIN') {
      router.push('/admin/dashboard');
      return;
    }
    if (role === 'HEALTHCARE_NURSE') {
      router.push('/nurse/dashboard');
      return;
    }
    router.push('/dashboard');
  };

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

    if (!formData.visitorType) {
      setError('Please select what best describes you.');
      return;
    }

    if (formData.visitorType === 'OTHER' && !formData.visitorTypeOther.trim()) {
      setError('Please specify the "Other" option.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const { first_name, last_name } = splitName(formData.name);
      const payload = {
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        first_name,
        last_name,
        role: formData.accountType,
      };

      const response = await authService.register(payload);
      const accessToken = response.data?.access_token;
      const refreshToken = response.data?.refresh_token;
      const user = response.data?.user;

      if (!accessToken || !refreshToken || !user) {
        throw new Error('Invalid registration response. Missing tokens or user payload.');
      }

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('signup_visitor_type', formData.visitorType);
      if (formData.visitorType === 'OTHER') {
        localStorage.setItem('signup_visitor_type_other', formData.visitorTypeOther.trim());
      } else {
        localStorage.removeItem('signup_visitor_type_other');
      }

      setSuccess(true);
      setTimeout(() => routeByRole(user.role || formData.accountType), 600);
    } catch (submitError: any) {
      const details = submitError?.response?.data;
      const firstFieldError =
        details && typeof details === 'object'
          ? Object.values(details).find((value) => Array.isArray(value) && value.length > 0)
          : null;
      const message =
        (Array.isArray(firstFieldError) && String(firstFieldError[0])) ||
        (typeof details?.detail === 'string' && details.detail) ||
        (typeof details === 'string' && details) ||
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

          <div className="mb-6">
            <label className="block text-sm font-medium text-brand-deep-navy mb-3">I am a:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, accountType: 'END_USER' })}
                className={`p-4 border-2 rounded-lg text-left transition ${
                  formData.accountType === 'END_USER'
                    ? 'border-brand-dark-blue bg-brand-vintage-blue/35'
                    : 'border-slate-300 hover:border-brand-dark-blue/40'
                }`}
              >
                <div className="font-semibold text-brand-deep-navy">End User</div>
                <div className="text-xs text-slate-600 mt-1">Care for loved ones</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, accountType: 'HEALTHCARE_NURSE' })}
                className={`p-4 border-2 rounded-lg text-left transition ${
                  formData.accountType === 'HEALTHCARE_NURSE'
                    ? 'border-brand-dark-blue bg-brand-vintage-blue/35'
                    : 'border-slate-300 hover:border-brand-dark-blue/40'
                }`}
              >
                <div className="font-semibold text-brand-deep-navy">Healthcare Nurse</div>
                <div className="text-xs text-slate-600 mt-1">Provide care services</div>
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">Role is unified as `END_USER`.</p>
          </div>

          <div className="mb-6">
            <GoogleLoginButton />
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
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-base pl-10 pr-3"
                  placeholder="+254 712 345 678"
                />
              </div>
            </div>

            <div>
              <label htmlFor="visitorType" className="block text-sm font-medium text-brand-deep-navy mb-2">
                I am a
              </label>
              <select
                id="visitorType"
                required
                value={formData.visitorType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    visitorType: e.target.value,
                    visitorTypeOther: e.target.value === 'OTHER' ? formData.visitorTypeOther : '',
                  })
                }
                className="input-base px-3"
              >
                <option value="" disabled>
                  Select one...
                </option>
                <option value="FAMILY_MEMBER">Family member</option>
                <option value="HOME_CARE_FACILITY">Home care facility</option>
                <option value="NURSE">Nurse</option>
                <option value="CAREGIVER">Caregiver</option>
                <option value="PHYSIOTHERAPIST">Physiotherapist</option>
                <option value="OTHER">Other</option>
              </select>

              {formData.visitorType === 'OTHER' && (
                <div className="mt-3">
                  <label htmlFor="visitorTypeOther" className="block text-sm font-medium text-brand-deep-navy mb-2">
                    Please specify
                  </label>
                  <input
                    id="visitorTypeOther"
                    type="text"
                    required
                    value={formData.visitorTypeOther}
                    onChange={(e) => setFormData({ ...formData, visitorTypeOther: e.target.value })}
                    className="input-base px-3"
                    placeholder="Type here..."
                  />
                </div>
              )}
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
