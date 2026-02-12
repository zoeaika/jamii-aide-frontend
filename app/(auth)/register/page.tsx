'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import BrandBackground from '@/components/BrandBackground';
import BrandLogo from '@/components/BrandLogo';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    accountType: 'PRIMARY_USER', // or HEALTHCARE_NURSE
  });

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  // DEMO MODE - Skip API call, just proceed
  try {
    // Store user data in localStorage for demo
    localStorage.setItem('demoUser', JSON.stringify({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.accountType  // Changed from accountType to formData.accountType
    }));
    
    // Mock a small delay to feel real
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Redirect based on account type
    if (formData.accountType === 'ADMIN') {  // Changed here
      router.push('/admin/dashboard');
    } else if (formData.accountType === 'HEALTHCARE_NURSE') {
      router.push('/nurse/dashboard');
    } else {
      router.push('/dashboard');  // PRIMARY_USER goes here
    }
  } catch (err) {
    setError('Something went wrong. Please try again.');
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
          <p className="text-slate-600 mb-6">
            Your account has been successfully created. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="brand-shell flex items-center justify-center p-4">
      <BrandBackground />
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-8">
          <BrandLogo size="lg" showText={false} />
        </Link>

        {/* Register Card */}
        <div className="bg-brand-soft-white border border-brand-vintage-blue/50 rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-brand-deep-navy mb-2">Create Account</h1>
            <p className="text-slate-600">Start caring for your loved ones today</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Account Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-brand-deep-navy mb-3">
              I am a:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, accountType: 'PRIMARY_USER' })}
                className={`p-4 border-2 rounded-lg text-left transition ${
                  formData.accountType === 'PRIMARY_USER'
                    ? 'border-brand-dark-blue bg-brand-vintage-blue/35'
                    : 'border-slate-300 hover:border-brand-dark-blue/40'
                }`}
              >
                <div className="font-semibold text-brand-deep-navy">Family Member</div>
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
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-brand-deep-navy mb-2">
                Full Name
              </label>
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

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-deep-navy mb-2">
                Email Address
              </label>
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

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-brand-deep-navy mb-2">
                Phone Number
              </label>
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

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-deep-navy mb-2">
                Password
              </label>
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-deep-navy mb-2">
                Confirm Password
              </label>
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

            {/* Terms */}
            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-brand-dark-blue focus:ring-brand-sweet-rose border-slate-300 rounded mt-1"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-slate-700">
                I agree to the{' '}
                <Link href="/terms" className="text-brand-dark-blue hover:text-brand-deep-navy font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-brand-dark-blue hover:text-brand-deep-navy font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="mt-8 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-dark-blue hover:text-brand-deep-navy font-semibold">
              Sign In
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-slate-600 hover:text-brand-deep-navy">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
