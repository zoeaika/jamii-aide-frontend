'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Shield, Clock, CheckCircle, Menu, X, Info } from 'lucide-react';
import BrandLogo from '@/app/components/BrandLogo';
import BrandBackground from '@/app/components/BrandBackground';
import type { LandingPageContent } from '@/app/lib/cms/landing';

type LandingPageClientProps = {
  content: LandingPageContent;
};

const PHONE_COUNTRY_CODES = [
  { code: '+254', label: 'Kenya (+254)' },
  { code: '+256', label: 'Uganda (+256)' },
  { code: '+255', label: 'Tanzania (+255)' },
  { code: '+250', label: 'Rwanda (+250)' },
  { code: '+1', label: 'United States (+1)' },
  { code: '+44', label: 'United Kingdom (+44)' },
  { code: '+971', label: 'UAE (+971)' },
];

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidLocalPhone = (phone: string) => /^\d{6,12}$/.test(phone);
const isValidE164Phone = (phone: string) => /^\+[1-9]\d{7,14}$/.test(phone);

export default function LandingPageClient({ content }: LandingPageClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [waitlistName, setWaitlistName] = React.useState('');
  const [waitlistEmail, setWaitlistEmail] = React.useState('');
  const [waitlistPhoneCountryCode, setWaitlistPhoneCountryCode] = React.useState('+254');
  const [waitlistPhone, setWaitlistPhone] = React.useState('');
  const [waitlistVisitorType, setWaitlistVisitorType] = React.useState('');
  const [waitlistVisitorTypeOther, setWaitlistVisitorTypeOther] = React.useState('');
  const [acceptsPromotional, setAcceptsPromotional] = React.useState(false);
  const [waitlistErrors, setWaitlistErrors] = React.useState<{
    email?: string;
    phone?: string;
    visitorType?: string;
    visitorTypeOther?: string;
  }>({});
  const [waitlistStatus, setWaitlistStatus] = React.useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  async function handleWaitlistSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWaitlistStatus({ type: 'idle', message: '' });
    setWaitlistErrors({});

    const normalizedEmail = waitlistEmail.trim().toLowerCase();
    const normalizedPhone = waitlistPhone.replace(/\D/g, '');
    const combinedPhone = `${waitlistPhoneCountryCode}${normalizedPhone}`;
    const nextErrors: {
      email?: string;
      phone?: string;
      visitorType?: string;
      visitorTypeOther?: string;
    } = {};

    if (!isValidEmail(normalizedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!isValidLocalPhone(normalizedPhone) || !isValidE164Phone(combinedPhone)) {
      nextErrors.phone = 'Enter a valid number for the selected country.';
    }
    if (!waitlistVisitorType) {
      nextErrors.visitorType = 'Please select what best describes you.';
    }
    if (waitlistVisitorType === 'OTHER' && !waitlistVisitorTypeOther.trim()) {
      nextErrors.visitorTypeOther = 'Please specify the "Other" option.';
    }

    if (nextErrors.email || nextErrors.phone || nextErrors.visitorType || nextErrors.visitorTypeOther) {
      setWaitlistErrors(nextErrors);
      return;
    }

    try {
      const payload = {
        name: waitlistName.trim(),
        email: normalizedEmail,
        phone: combinedPhone,
        acceptsPromotional,
        visitorType: waitlistVisitorType,
        visitorTypeOther: waitlistVisitorType === 'OTHER' ? waitlistVisitorTypeOther.trim() : '',
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
      setWaitlistPhoneCountryCode('+254');
      setWaitlistPhone('');
      setWaitlistVisitorType('');
      setWaitlistVisitorTypeOther('');
      setAcceptsPromotional(false);
      setWaitlistErrors({});
    } catch {
      setWaitlistStatus({
        type: 'error',
        message: 'Could not submit right now. Please try again shortly.',
      });
    }
  }

  return (
    <div className="relative isolate min-h-screen bg-gradient-to-b from-brand-canvas to-brand-soft-white">
      <BrandBackground className="opacity-40" />
      <nav className="sticky top-0 z-50 bg-brand-soft-white/95 shadow-sm backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/#hero" className="flex items-center">
              <BrandLogo size="md" />
            </Link>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition">How It Works</a>
              <a href="#app-preview" className="text-gray-700 hover:text-blue-600 transition">App Preview</a>
              <a href="#waitlist" className="text-gray-700 hover:text-blue-600 transition">Waitlist</a>
            </div>
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-slate-100 hover:text-blue-700 transition"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-menu"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div id="mobile-nav-menu" className="md:hidden border-t border-slate-200 py-3">
              <div className="flex flex-col">
                <a
                  href="#features"
                  className="rounded-lg px-3 py-3 text-gray-700 hover:bg-slate-100 hover:text-blue-700 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="rounded-lg px-3 py-3 text-gray-700 hover:bg-slate-100 hover:text-blue-700 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </a>
                <a
                  href="#app-preview"
                  className="rounded-lg px-3 py-3 text-gray-700 hover:bg-slate-100 hover:text-blue-700 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  App Preview
                </a>
                <a
                  href="#waitlist"
                  className="rounded-lg px-3 py-3 text-gray-700 hover:bg-slate-100 hover:text-blue-700 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Waitlist
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>
      <section id="hero" className="relative overflow-hidden">
        <Image
          src="/brand/Jamii-aide-background-image.png"
          alt=""
          width={1328}
          height={757}
          priority
          className="block h-auto w-full"
          aria-hidden="true"
        />
      </section>

      <section className="min-h-screen bg-blue-700 flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight text-white">
              {content.heroTitle}
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-blue-100">
              {content.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#waitlist" className="w-full sm:w-auto sm:min-w-[300px] px-8 sm:px-12 py-4 sm:py-5 bg-brand-soft-white text-brand-dark-blue rounded-lg text-lg sm:text-xl font-bold hover:bg-white transition text-center">
                Join Waitlist
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative py-14 sm:py-20 bg-brand-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              {content.featuresTitle}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              {content.featuresSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-6 sm:p-8 bg-blue-50 rounded-xl hover:shadow-lg transition">
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

            <div className="p-6 sm:p-8 bg-green-50 rounded-xl hover:shadow-lg transition">
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

            <div className="p-6 sm:p-8 bg-purple-50 rounded-xl hover:shadow-lg transition">
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
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Simple as 1-2-3
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Start caring for your loved ones in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
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
                Book Your Appointment
              </h3>
              <p className="text-gray-600">
                Select verified Health Care Professionals, check ratings, and book appointments with preferences recommendations.
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

      <section id="app-preview" className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Mobile Web App Preview
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              A quick look at how Jamii Aide works in your mobile browser.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { src: '/images/screenshots/mobile/home-preview.png', label: 'Mobile Home Preview' },
              { src: '/images/screenshots/mobile/care-request-appointment-14promax.png', label: 'Care Request Appointment' },
            ].map((item) => (
              <figure key={item.src} className="mx-auto w-full max-w-[320px]">
                <div className="rounded-[2.5rem] border border-slate-300 bg-slate-900 p-3 shadow-xl">
                  <div className="relative overflow-hidden rounded-[2rem] bg-slate-100">
                    <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-slate-900" />
                    <div className="relative aspect-[9/19.5] w-full">
                      <Image
                        src={item.src}
                        alt={item.label}
                        fill
                        sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 86vw"
                        className="object-contain object-top"
                      />
                    </div>
                  </div>
                </div>
                <figcaption className="px-2 pt-4 text-center text-sm font-medium text-slate-700">
                  {item.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="waitlist" className="py-14 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 border border-slate-200">
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
                  onChange={(event) => {
                    setWaitlistEmail(event.target.value);
                    if (waitlistErrors.email) {
                      setWaitlistErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                  required
                />
                {waitlistErrors.email && (
                  <p className="mt-2 text-xs text-red-700">{waitlistErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="waitlist-phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone number
                </label>
                <div className="grid grid-cols-[minmax(0,10rem)_1fr] gap-2">
                  <select
                    id="waitlist-phone-country"
                    value={waitlistPhoneCountryCode}
                    onChange={(event) => {
                      setWaitlistPhoneCountryCode(event.target.value);
                      if (waitlistErrors.phone) {
                        setWaitlistErrors((prev) => ({ ...prev, phone: undefined }));
                      }
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Phone country code"
                  >
                    {PHONE_COUNTRY_CODES.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <input
                    id="waitlist-phone"
                    type="tel"
                    value={waitlistPhone}
                    onChange={(event) => {
                      const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 12);
                      setWaitlistPhone(digitsOnly);
                      if (waitlistErrors.phone) {
                        setWaitlistErrors((prev) => ({ ...prev, phone: undefined }));
                      }
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="712345678"
                    inputMode="numeric"
                    pattern="[0-9]{6,12}"
                    maxLength={12}
                    required
                  />
                </div>
                {waitlistErrors.phone && (
                  <p className="mt-2 text-xs text-red-700">{waitlistErrors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="waitlist-visitor-type" className="block text-sm font-medium text-gray-700 mb-2">
                  I am a
                </label>
                <select
                  id="waitlist-visitor-type"
                  value={waitlistVisitorType}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setWaitlistVisitorType(nextValue);
                    if (nextValue !== 'OTHER') {
                      setWaitlistVisitorTypeOther('');
                    }
                    if (waitlistErrors.visitorType || waitlistErrors.visitorTypeOther) {
                      setWaitlistErrors((prev) => ({ ...prev, visitorType: undefined, visitorTypeOther: undefined }));
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
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
                {waitlistErrors.visitorType && (
                  <p className="mt-2 text-xs text-red-700">{waitlistErrors.visitorType}</p>
                )}

                {waitlistVisitorType === 'OTHER' && (
                  <div className="mt-3">
                    <label htmlFor="waitlist-visitor-type-other" className="block text-sm font-medium text-gray-700 mb-2">
                      Please specify
                    </label>
                    <input
                      id="waitlist-visitor-type-other"
                      type="text"
                      value={waitlistVisitorTypeOther}
                      onChange={(event) => {
                        setWaitlistVisitorTypeOther(event.target.value);
                        if (waitlistErrors.visitorTypeOther) {
                          setWaitlistErrors((prev) => ({ ...prev, visitorTypeOther: undefined }));
                        }
                      }}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Type here..."
                      required
                    />
                    {waitlistErrors.visitorTypeOther && (
                      <p className="mt-2 text-xs text-red-700">{waitlistErrors.visitorTypeOther}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <label htmlFor="waitlist-promotional" className="flex items-start gap-3">
                  <input
                    id="waitlist-promotional"
                    type="checkbox"
                    checked={acceptsPromotional}
                    onChange={(event) => setAcceptsPromotional(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to receive promotional content from Jamii Aide.
                  </span>
                </label>
                <p className="mt-2 flex items-start gap-2 text-xs text-gray-600">
                  <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-700" />
                  <span>
                    Optional: this includes platform updates, announcements, and occasional product news.
                  </span>
                </p>
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

      <section className="py-14 sm:py-20 bg-brand-dark-blue">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {content.ctaTitle}
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-8">
            {content.ctaSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#waitlist" className="px-8 py-4 bg-brand-soft-white text-brand-dark-blue rounded-lg hover:bg-white transition text-lg font-semibold">
              Join Waitlist
            </a>
            <a href="mailto:Saidika@jamiiaide.com" className="px-8 py-4 bg-brand-deep-navy text-white rounded-lg hover:bg-black transition text-lg font-semibold border-2 border-white">
              Talk to Our Team
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center md:text-left">
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
                <li><a href="mailto:Saidika@jamiiaide.com" className="hover:text-white transition">Contact</a></li>
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



