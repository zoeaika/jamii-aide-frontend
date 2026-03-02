'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Shield, Clock, CheckCircle } from 'lucide-react';
import BrandLogo from '@/app/components/BrandLogo';
import BrandBackground from '@/app/components/BrandBackground';
import type { LandingPageContent } from '@/app/lib/cms/landing';

type LandingPageClientProps = {
  content: LandingPageContent;
  isPreview: boolean;
};

export default function LandingPageClient({
  content,
  isPreview,
}: LandingPageClientProps) {
  const [waitlistName, setWaitlistName] = React.useState('');
  const [waitlistEmail, setWaitlistEmail] = React.useState('');
  const [waitlistStatus, setWaitlistStatus] = React.useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  async function handleWaitlistSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWaitlistStatus({ type: 'idle', message: '' });

    try {
      const payload = {
        name: waitlistName.trim(),
        email: waitlistEmail.trim(),
        source: 'landing_page',
      };

      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Waitlist request failed');
      }

      setWaitlistStatus({
        type: 'success',
        message: "You're on the list. We will notify you before full access opens.",
      });
      setWaitlistName('');
      setWaitlistEmail('');
    } catch {
      setWaitlistStatus({
        type: 'error',
        message: 'Could not submit right now. Please try again shortly.',
      });
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-brand-canvas to-brand-soft-white">
      <BrandBackground className="opacity-40" />
      {isPreview && (
        <div className="sticky top-0 z-[60] bg-amber-400 px-4 py-2 text-center text-sm font-semibold text-black">
          Preview mode enabled.
          {' '}
          <Link href="/api/draft/disable" className="underline">
            Exit preview
          </Link>
        </div>
      )}

      <nav className="sticky top-0 z-50 bg-brand-soft-white/95 shadow-sm backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <BrandLogo size="md" />
            </Link>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition">How It Works</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition">Pricing</a>
              <a href="#waitlist" className="text-gray-700 hover:text-blue-600 transition">Waitlist</a>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[url('/brand/Jamii-aide-background-image.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/30" />
      </section>

      <section className="relative z-10 min-h-screen bg-blue-800 text-white flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              {content.heroTitle}
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white/90">
              {content.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#waitlist" className="px-6 sm:px-8 py-3 sm:py-4 bg-brand-soft-white text-brand-dark-blue rounded-lg font-semibold hover:bg-white transition text-center">
                Join Waitlist
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative py-20 bg-brand-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {content.featuresTitle}
            </h2>
            <p className="text-xl text-gray-600">
              {content.featuresSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-blue-50 rounded-xl hover:shadow-lg transition">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Verified HealthCare Professionals
              </h3>
              <p className="text-gray-600 mb-4">
                Every Healthcare professional is background-checked, MOH-trained, and community-verified. Choose by gender, age, location, and ratings.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Certificate of Good Conduct</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Chief&apos;s approval letter</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>MOH health training certified</span>
                </li>
              </ul>
            </div>

            <div className="p-8 bg-green-50 rounded-xl hover:shadow-lg transition">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Complete Health Records
              </h3>
              <p className="text-gray-600 mb-4">
                Store medical history, prescriptions, insurance details, and doctor visits all in one secure place.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Medical conditions & allergies</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Prescription management</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Vitals tracking over time</span>
                </li>
              </ul>
            </div>

            <div className="p-8 bg-purple-50 rounded-xl hover:shadow-lg transition">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Seamless Coordination
              </h3>
              <p className="text-gray-600 mb-4">
                Book appointments, arrange transportation, and get real-time updates all from your phone.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Schedule HCP visits with reminders</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Real-time GPS tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Integrated pharmacy delivery</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-slate-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple as 1-2-3
            </h2>
            <p className="text-xl text-gray-600">
              Start caring for your loved ones in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Create Family Profile
              </h3>
              <p className="text-gray-600">
                Add your loved one&apos;s details, medical history, insurance, and emergency contacts in one secure profile.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Choose Your HCP
              </h3>
              <p className="text-gray-600">
                Browse verified Health Care Professionals, check ratings, and book appointments based on your preferences.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Stay Connected
              </h3>
              <p className="text-gray-600">
                Get real-time updates, medical reports, and photos. Coordinate care from anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-brand-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {content.pricingTitle}
            </h2>
            <p className="text-xl text-gray-600">
              {content.pricingSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="p-8 border-2 border-gray-200 rounded-xl hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Basic</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">Pay as you go</span>
              </div>
              <p className="text-gray-600 mb-6">Perfect for occasional needs</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Access to all CHWs</span>
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Medical records storage</span>
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Pay per service</span>
                </li>
              </ul>
              <Link href="/register" className="block w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold text-center">
                Get Started
              </Link>
            </div>

            <div className="p-8 border-2 border-gray-200 rounded-xl hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Monthly</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">KES 3,000</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-gray-600 mb-6">For routine monitoring</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>1 monthly CHW visit</span>
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Unlimited prescription refills</span>
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>10% off additional services</span>
                </li>
              </ul>
              <Link href="/register" className="block w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-center">
                Choose Plan
              </Link>
            </div>

            <div className="p-8 border-2 border-blue-600 rounded-xl shadow-xl relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Weekly</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">KES 8,000</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-gray-600 mb-6">For close monitoring</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>4 CHW visits per month</span>
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Dedicated CHW assignment</span>
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>20% off additional services</span>
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Priority emergency response</span>
                </li>
              </ul>
              <Link href="/register" className="block w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-center">
                Choose Plan
              </Link>
            </div>

            <div className="p-8 border-2 border-gray-200 rounded-xl hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Daily Care</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">KES 20,000</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-gray-600 mb-6">For intensive care needs</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Daily CHW visits (2hrs each)</span>
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Medication administration</span>
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Meal prep assistance</span>
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>24/7 emergency support</span>
                </li>
              </ul>
              <Link href="/register" className="block w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold text-center">
                Choose Plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="waitlist" className="py-20 bg-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 border border-slate-200">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 text-center">
              {content.waitlistTitle}
            </h2>
            <p className="text-gray-600 text-center mb-8">
              {content.waitlistSubtitle}
            </p>

            <form onSubmit={handleWaitlistSubmit} className="grid gap-4">
              <div>
                <label htmlFor="waitlist-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full name
                </label>
                <input
                  id="waitlist-name"
                  type="text"
                  value={waitlistName}
                  onChange={(event) => setWaitlistName(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div>
                <label htmlFor="waitlist-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  value={waitlistEmail}
                  onChange={(event) => setWaitlistEmail(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-lg bg-blue-700 text-white py-3 font-semibold hover:bg-blue-800 transition"
              >
                Join Waitlist
              </button>
            </form>

            {waitlistStatus.type !== 'idle' && (
              <p
                className={`mt-4 text-sm text-center ${
                  waitlistStatus.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {waitlistStatus.message}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 bg-brand-dark-blue">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            {content.ctaTitle}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {content.ctaSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="px-8 py-4 bg-brand-soft-white text-brand-dark-blue rounded-lg hover:bg-white transition text-lg font-semibold">
              Create Free Account
            </Link>
            <Link href="/contact" className="px-8 py-4 bg-brand-deep-navy text-white rounded-lg hover:bg-black transition text-lg font-semibold border-2 border-white">
              Talk to Our Team
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <BrandLogo size="sm" className="[&>span:last-child]:text-white" />
              </div>
              <p className="text-sm text-gray-400">
                {content.footerTagline}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><a href="#waitlist" className="hover:text-white transition">Waitlist</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><Link href="/register?type=chw" className="hover:text-white transition">Become a HCP</Link></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Jamii Aide. All rights reserved. | Proudly serving families across Kenya</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
