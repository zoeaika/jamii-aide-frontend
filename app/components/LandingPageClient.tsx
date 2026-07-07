'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Shield, Clock, CheckCircle, Menu, X, Info, CreditCard, Smartphone } from 'lucide-react';
import BrandLogo from '@/app/components/BrandLogo';
import BrandBackground from '@/app/components/BrandBackground';
import type { LandingPageContent } from '@/app/lib/cms/landing';

type LandingPageClientProps = {
  content: LandingPageContent;
};

const PHONE_COUNTRY_CODES = [
  { code: '+355', label: 'Albania (+355)' },
  { code: '+213', label: 'Algeria (+213)' },
  { code: '+376', label: 'Andorra (+376)' },
  { code: '+244', label: 'Angola (+244)' },
  { code: '+1264', label: 'Anguilla (+1264)' },
  { code: '+1268', label: 'Antigua & Barbuda (+1268)' },
  { code: '+54', label: 'Argentina (+54)' },
  { code: '+374', label: 'Armenia (+374)' },
  { code: '+297', label: 'Aruba (+297)' },
  { code: '+61', label: 'Australia (+61)' },
  { code: '+672', label: 'Australian External Territories (+672)' },
  { code: '+43', label: 'Austria (+43)' },
  { code: '+994', label: 'Azerbaijan (+994)' },
  { code: '+1242', label: 'Bahamas (+1242)' },
  { code: '+973', label: 'Bahrain (+973)' },
  { code: '+880', label: 'Bangladesh (+880)' },
  { code: '+1246', label: 'Barbados (+1246)' },
  { code: '+375', label: 'Belarus (+375)' },
  { code: '+32', label: 'Belgium (+32)' },
  { code: '+501', label: 'Belize (+501)' },
  { code: '+229', label: 'Benin (+229)' },
  { code: '+1441', label: 'Bermuda (+1441)' },
  { code: '+975', label: 'Bhutan (+975)' },
  { code: '+591', label: 'Bolivia (+591)' },
  { code: '+387', label: 'Bosnia & Herzegovina (+387)' },
  { code: '+267', label: 'Botswana (+267)' },
  { code: '+55', label: 'Brazil (+55)' },
  { code: '+246', label: 'British Indian Ocean Territory (+246)' },
  { code: '+1', label: 'British Virgin Islands (+1284)' },
  { code: '+673', label: 'Brunei (+673)' },
  { code: '+359', label: 'Bulgaria (+359)' },
  { code: '+226', label: 'Burkina Faso (+226)' },
  { code: '+257', label: 'Burundi (+257)' },
  { code: '+855', label: 'Cambodia (+855)' },
  { code: '+237', label: 'Cameroon (+237)' },
  { code: '+1', label: 'Canada (+1)' },
  { code: '+238', label: 'Cape Verde (+238)' },
  { code: '+1', label: 'Cayman Islands (+1345)' },
  { code: '+236', label: 'Central African Republic (+236)' },
  { code: '+235', label: 'Chad (+235)' },
  { code: '+56', label: 'Chile (+56)' },
  { code: '+86', label: 'China (+86)' },
  { code: '+57', label: 'Colombia (+57)' },
  { code: '+269', label: 'Comoros (+269)' },
  { code: '+242', label: 'Republic of the Congo (+242)' },
  { code: '+243', label: 'Democratic Republic of the Congo (+243)' },
  { code: '+682', label: 'Cook Islands (+682)' },
  { code: '+506', label: 'Costa Rica (+506)' },
  { code: '+385', label: 'Croatia (+385)' },
  { code: '+53', label: 'Cuba (+53)' },
  { code: '+357', label: 'Cyprus (+357)' },
  { code: '+420', label: 'Czech Republic (+420)' },
  { code: '+45', label: 'Denmark (+45)' },
  { code: '+253', label: 'Djibouti (+253)' },
  { code: '+1', label: 'Dominica (+1767)' },
  { code: '+1', label: 'Dominican Republic (+1809)' },
  { code: '+593', label: 'Ecuador (+593)' },
  { code: '+20', label: 'Egypt (+20)' },
  { code: '+503', label: 'El Salvador (+503)' },
  { code: '+240', label: 'Equatorial Guinea (+240)' },
  { code: '+291', label: 'Eritrea (+291)' },
  { code: '+372', label: 'Estonia (+372)' },
  { code: '+251', label: 'Ethiopia (+251)' },
  { code: '+500', label: 'Falkland Islands (+500)' },
  { code: '+298', label: 'Faroe Islands (+298)' },
  { code: '+679', label: 'Fiji (+679)' },
  { code: '+358', label: 'Finland (+358)' },
  { code: '+33', label: 'France (+33)' },
  { code: '+689', label: 'French Polynesia (+689)' },
  { code: '+594', label: 'French Guiana (+594)' },
  { code: '+241', label: 'Gabon (+241)' },
  { code: '+220', label: 'Gambia (+220)' },
  { code: '+995', label: 'Georgia (+995)' },
  { code: '+49', label: 'Germany (+49)' },
  { code: '+233', label: 'Ghana (+233)' },
  { code: '+350', label: 'Gibraltar (+350)' },
  { code: '+30', label: 'Greece (+30)' },
  { code: '+1', label: 'Grenada (+1473)' },
  { code: '+590', label: 'Guadeloupe (+590)' },
  { code: '+1671', label: 'Guam (+1671)' },
  { code: '+502', label: 'Guatemala (+502)' },
  { code: '+224', label: 'Guinea (+224)' },
  { code: '+245', label: 'Guinea-Bissau (+245)' },
  { code: '+592', label: 'Guyana (+592)' },
  { code: '+509', label: 'Haiti (+509)' },
  { code: '+504', label: 'Honduras (+504)' },
  { code: '+852', label: 'Hong Kong (+852)' },
  { code: '+36', label: 'Hungary (+36)' },
  { code: '+354', label: 'Iceland (+354)' },
  { code: '+91', label: 'India (+91)' },
  { code: '+62', label: 'Indonesia (+62)' },
  { code: '+98', label: 'Iran (+98)' },
  { code: '+964', label: 'Iraq (+964)' },
  { code: '+353', label: 'Ireland (+353)' },
  { code: '+972', label: 'Israel (+972)' },
  { code: '+39', label: 'Italy (+39)' },
  { code: '+1876', label: 'Jamaica (+1876)' },
  { code: '+81', label: 'Japan (+81)' },
  { code: '+962', label: 'Jordan (+962)' },
  { code: '+7', label: 'Kazakhstan (+7)' },
  { code: '+254', label: 'Kenya (+254)' },
  { code: '+856', label: 'Laos (+856)' },
  { code: '+371', label: 'Latvia (+371)' },
  { code: '+423', label: 'Liechtenstein (+423)' },
  { code: '+370', label: 'Lithuania (+370)' },
  { code: '+352', label: 'Luxembourg (+352)' },
  { code: '+261', label: 'Madagascar (+261)' },
  { code: '+265', label: 'Malawi (+265)' },
  { code: '+60', label: 'Malaysia (+60)' },
  { code: '+960', label: 'Maldives (+960)' },
  { code: '+356', label: 'Malta (+356)' },
  { code: '+692', label: 'Marshall Islands (+692)' },
  { code: '+596', label: 'Martinique (+596)' },
  { code: '+222', label: 'Mauritania (+222)' },
  { code: '+230', label: 'Mauritius (+230)' },
  { code: '+52', label: 'Mexico (+52)' },
  { code: '+373', label: 'Moldova (+373)' },
  { code: '+377', label: 'Monaco (+377)' },
  { code: '+976', label: 'Mongolia (+976)' },
  { code: '+382', label: 'Montenegro (+382)' },
  { code: '+1664', label: 'Montserrat (+1664)' },
  { code: '+212', label: 'Morocco (+212)' },
  { code: '+258', label: 'Mozambique (+258)' },
  { code: '+95', label: 'Myanmar (+95)' },
  { code: '+264', label: 'Namibia (+264)' },
  { code: '+674', label: 'Nauru (+674)' },
  { code: '+977', label: 'Nepal (+977)' },
  { code: '+31', label: 'Netherlands (+31)' },
  { code: '+687', label: 'New Caledonia (+687)' },
  { code: '+64', label: 'New Zealand (+64)' },
  { code: '+505', label: 'Nicaragua (+505)' },
  { code: '+227', label: 'Niger (+227)' },
  { code: '+234', label: 'Nigeria (+234)' },
  { code: '+47', label: 'Norway (+47)' },
  { code: '+968', label: 'Oman (+968)' },
  { code: '+92', label: 'Pakistan (+92)' },
  { code: '+680', label: 'Palau (+680)' },
  { code: '+970', label: 'Palestine (+970)' },
  { code: '+507', label: 'Panama (+507)' },
  { code: '+675', label: 'Papua New Guinea (+675)' },
  { code: '+51', label: 'Peru (+51)' },
  { code: '+63', label: 'Philippines (+63)' },
  { code: '+48', label: 'Poland (+48)' },
  { code: '+351', label: 'Portugal (+351)' },
  { code: '+1', label: 'Puerto Rico (+1)' },
  { code: '+974', label: 'Qatar (+974)' },
  { code: '+40', label: 'Romania (+40)' },
  { code: '+7', label: 'Russia (+7)' },
  { code: '+250', label: 'Rwanda (+250)' },
  { code: '+685', label: 'Samoa (+685)' },
  { code: '+378', label: 'San Marino (+378)' },
  { code: '+239', label: 'São Tomé & Príncipe (+239)' },
  { code: '+966', label: 'Saudi Arabia (+966)' },
  { code: '+221', label: 'Senegal (+221)' },
  { code: '+381', label: 'Serbia (+381)' },
  { code: '+248', label: 'Seychelles (+248)' },
  { code: '+232', label: 'Sierra Leone (+232)' },
  { code: '+65', label: 'Singapore (+65)' },
  { code: '+421', label: 'Slovakia (+421)' },
  { code: '+386', label: 'Slovenia (+386)' },
  { code: '+677', label: 'Solomon Islands (+677)' },
  { code: '+252', label: 'Somalia (+252)' },
  { code: '+27', label: 'South Africa (+27)' },
  { code: '+82', label: 'South Korea (+82)' },
  { code: '+211', label: 'South Sudan (+211)' },
  { code: '+34', label: 'Spain (+34)' },
  { code: '+94', label: 'Sri Lanka (+94)' },
  { code: '+249', label: 'Sudan (+249)' },
  { code: '+597', label: 'Suriname (+597)' },
  { code: '+46', label: 'Sweden (+46)' },
  { code: '+41', label: 'Switzerland (+41)' },
  { code: '+886', label: 'Taiwan (+886)' },
  { code: '+992', label: 'Tajikistan (+992)' },
  { code: '+66', label: 'Thailand (+66)' },
  { code: '+216', label: 'Tunisia (+216)' },
  { code: '+90', label: 'Turkey (+90)' },
  { code: '+993', label: 'Turkmenistan (+993)' },
  { code: '+688', label: 'Tuvalu (+688)' },
  { code: '+256', label: 'Uganda (+256)' },
  { code: '+380', label: 'Ukraine (+380)' },
  { code: '+971', label: 'United Arab Emirates (+971)' },
  { code: '+44', label: 'United Kingdom (+44)' },
  { code: '+1', label: 'United States (+1)' },
  { code: '+598', label: 'Uruguay (+598)' },
  { code: '+998', label: 'Uzbekistan (+998)' },
  { code: '+678', label: 'Vanuatu (+678)' },
  { code: '+379', label: 'Vatican City (+379)' },
  { code: '+58', label: 'Venezuela (+58)' },
  { code: '+84', label: 'Vietnam (+84)' },
  { code: '+670', label: 'East Timor (+670)' },
  { code: '+263', label: 'Zimbabwe (+263)' },
];

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidLocalPhone = (phone: string) => /^\d{6,12}$/.test(phone);
const isValidE164Phone = (phone: string) => /^\+[1-9]\d{7,14}$/.test(phone);

const surveyAudiences = [
  'Kenyans living abroad who manage the health and wellbeing of an elderly family member back home.',
  'People based in Kenya who live in a major city while supporting an elderly family member in another town or county.',
];

const conceptPoints = [
  'A vetted Kenyan caregiver can provide basic care, companionship, and regular home visits.',
  'A qualified nurse can support medication management, vital signs monitoring, doctor coordination, and pharmacy refills.',
  'Families receive weekly updates through the platform, with payments handled in all major currencies, including KES. Care personnel are paid in local currency',
];

const surveyFormUrl = 'https://forms.gle/NPKj1nU3Wu13bxCg6';
type CheckoutProvider = 'stripe' | 'paypal' | 'pesapal' | 'mpesa';

const checkoutOptions: Array<{
  provider: CheckoutProvider;
  name: string;
  endpoint: string;
  description: string;
  icon: typeof CreditCard;
}> = [
  {
    provider: 'stripe',
    name: 'Stripe',
    endpoint: '/api/checkout/founding-member',
    description: 'Secure card checkout for full member access',
    icon: CreditCard,
  },
  {
    provider: 'paypal',
    name: 'PayPal',
    endpoint: '/api/checkout/paypal',
    description: 'PayPal wallet and card checkout',
    icon: CreditCard,
  },
  {
    provider: 'pesapal',
    name: 'Pesapal',
    endpoint: '/api/checkout/pesapal',
    description: 'Regional card and mobile money checkout',
    icon: CreditCard,
  },
  {
    provider: 'mpesa',
    name: 'M-Pesa',
    endpoint: '/api/checkout/mpesa',
    description: 'STK Push to mobile number',
    icon: Smartphone,
  },
];

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
  const [checkoutStatus, setCheckoutStatus] = React.useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
    provider?: CheckoutProvider;
  }>({ type: 'idle', message: '' });
  const [mpesaPhone, setMpesaPhone] = React.useState('');
  const [mpesaPhoneError, setMpesaPhoneError] = React.useState('');
  const [isMpesaPhonePromptOpen, setIsMpesaPhonePromptOpen] = React.useState(false);

  async function handleFounderCheckout(provider: CheckoutProvider, endpoint: string) {
    const normalizedMpesaPhone = mpesaPhone.replace(/\D/g, '');
    setMpesaPhoneError('');

    if (provider === 'mpesa' && !normalizedMpesaPhone) {
      setMpesaPhoneError('Enter your mobile number to receive the STK Push.');
      setCheckoutStatus({
        type: 'error',
        message: 'Enter your mobile number to receive the STK Push.',
        provider,
      });
      return false;
    }

    setCheckoutStatus({ type: 'loading', message: 'Opening secure checkout...', provider });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: provider === 'mpesa' && normalizedMpesaPhone ? { 'Content-Type': 'application/json' } : undefined,
        body: provider === 'mpesa' && normalizedMpesaPhone ? JSON.stringify({ phone: normalizedMpesaPhone }) : undefined,
      });
      const payload = (await response.json()) as { ok?: boolean; url?: string; message?: string };

      if (!response.ok || (!payload.url && !(provider === 'mpesa' && payload.ok))) {
        throw new Error(payload.message || 'Could not start checkout.');
      }

      if (payload.url) {
        window.location.href = payload.url;
        return true;
      }

      setCheckoutStatus({
        type: 'success',
        provider,
        message: payload.message || 'Check your phone for the M-Pesa prompt.',
      });
      return true;
    } catch (error) {
      setCheckoutStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not start checkout. Please try again.',
        provider,
      });
      return false;
    }
  }

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
        message: 'Thank you. We will start coordinating bookings as soon as nurses are signed up.',
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
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition">How It Works</a>
              <a href="#app-preview" className="text-gray-700 hover:text-blue-600 transition">App Preview</a>
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition">Features</a>
              <a href="#founder-pricing" className="text-gray-700 hover:text-blue-600 transition">Pricing</a>
              <a href="#waitlist" className="text-gray-700 hover:text-blue-600 transition">Join now</a>
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
                  href="#survey"
                  className="rounded-lg px-3 py-3 text-gray-700 hover:bg-slate-100 hover:text-blue-700 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Survey
                </a>
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
                  href="#founder-pricing"
                  className="rounded-lg px-3 py-3 text-gray-700 hover:bg-slate-100 hover:text-blue-700 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </a>
                <a
                  href="#waitlist"
                  className="rounded-lg px-3 py-3 text-gray-700 hover:bg-slate-100 hover:text-blue-700 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Join now
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
                Join now
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
                Verified Home Care Professionals
              </h3>
              <p className="text-gray-600 mb-4">
                Every home care professional has gone through a background check, the nurses are professionally trained, certified and registered with the Nurses Council of Kenya. Selection criteria includes gender, age, location, language and ratings.
              </p>
            </div>

            <div className="p-6 sm:p-8 bg-green-50 rounded-xl hover:shadow-lg transition">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Complete Health Records
              </h3>
              <p className="text-gray-600 mb-4">
                Keep track of health checks, nutrition and wellbeing reports in one place. With this history, doctor visits are a breeze and if your family member is accompanied by a nurse, you are rest assured the doctor gets an accurate picture of their day to day. If in need of assisted admission, store active prescriptions, allergy information and insurance details in one secure place.
              </p>
            </div>

            <div className="p-6 sm:p-8 bg-purple-50 rounded-xl hover:shadow-lg transition">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Payments and Coordination
              </h3>
              <p className="text-gray-600 mb-4">
                Do you need ad hoc or weekly check-ins, or round the clock care for your family member? Book appointments with ease, arrange transportation and get updates in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Put your mind at ease
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Let us help you care for your loved ones.
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
                Have your loved one&apos;s needs, medical history, medications, location, and emergency contacts under one secure profile.
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
                Check the ratings and reviews of candidates, select the caregiver of choice, and book the appointment.
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
                Get updates in real-time through visit reports, plus photos or videos. We enable you to coordinate and confirm care from wherever you are.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="survey" className="relative bg-gradient-to-br from-blue-800 via-cyan-700 to-emerald-600 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/40 bg-white shadow-2xl">
            <div className="h-3 bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300" />
            <div className="p-6 sm:p-8 lg:p-10">
              {/* Removed legacy survey title/heading/button per content update */}

              <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
                <div>
                  <p className="mb-3 text-sm font-bold uppercase tracking-wide text-cyan-700">
                    Who this is for
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl mb-4">
                    Are you managing care for an elderly loved one from afar?
                  </h3>
                  <p className="text-lg text-gray-600">
                    We are here to help families who need coordinated health care services for elderly relatives across Kenya while they live far away locally, or  abroad.
                  </p>
                  <p className="mt-4 text-lg text-gray-600">
                    Your answers will directly shape what we build, who we hire, and the variety of services Jamii Aide provides.
                  </p>
                  <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm font-semibold text-yellow-900">
                    We are offering a discount. Join now!
                  </div>
                </div>

                <div className="grid gap-5">
                  {surveyAudiences.map((item, index) => (
                    <div
                      key={item}
                      className={`rounded-lg border p-5 shadow-sm ${
                        index === 0
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-emerald-200 bg-emerald-50'
                      }`}
                    >
                      <div
                        className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold text-white ${
                          index === 0 ? 'bg-blue-700' : 'bg-emerald-600'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 border-t border-slate-200 pt-8">
                <div className="mb-7 max-w-3xl">
                  <p className="mb-3 text-sm font-bold uppercase tracking-wide text-cyan-700">
                    The concept
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                    One coordinated platform for care at home
                  </h3>
                  <p className="text-lg text-gray-600">
                    Jamii Aide connects you with a verified nurse or caregiver who provides regular home visits to your elderly relative based on their care needs.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  {conceptPoints.map((item, index) => (
                    <div
                      key={item}
                      className={`rounded-lg border p-5 ${
                        index === 0
                          ? 'border-pink-200 bg-pink-50'
                          : index === 1
                            ? 'border-cyan-200 bg-cyan-50'
                            : 'border-green-200 bg-green-50'
                      }`}
                    >
                      <CheckCircle
                        className={`mb-4 h-6 w-6 ${
                          index === 0
                            ? 'text-pink-600'
                            : index === 1
                              ? 'text-cyan-700'
                              : 'text-green-600'
                        }`}
                      />
                      <p className="text-gray-700">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="app-preview" className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Platform Preview
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Professional In-Home Healthcare for Your Loved Ones. Connect with qualified nurses/caregivers for personalized care at home. Track health, manage appointments, and ensure the best care for your family.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 justify-items-center">
            {[
              { src: '/images/screenshots/mobile/home-preview.png', label: 'Mobile Home Preview' },
              { src: '/images/screenshots/mobile/Screenshot 2026-03-09 120318.png', label: 'Appointment Flow Preview' },
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

      <section id="founder-pricing" className="relative overflow-hidden bg-slate-950 py-14 text-white sm:py-20">
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Join now to access founding member benefits
            </h2>
          </div>

          <div className="grid gap-6 lg:items-start">
            <div className="rounded-lg border border-white/15 bg-white/95 p-4 text-slate-950 shadow-2xl sm:p-6">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                    Choose payment method
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-950">
                    Pre-order Checkout
                  </h3>
                </div>
                <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                  Secure card checkout for full member access
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
              {checkoutOptions.map((option) => {
                const isLoading =
                  checkoutStatus.type === 'loading' && checkoutStatus.provider === option.provider;
                const Icon = option.icon;
                const logoSrc = option.provider === 'pesapal' ? '/images/pesapal-logo.png' : `/images/${option.provider}-logo.svg`;

                return (
                  <button
                    key={option.provider}
                    type="button"
                    onClick={() =>
                      option.provider === 'mpesa'
                        ? setIsMpesaPhonePromptOpen(true)
                        : handleFounderCheckout(option.provider, option.endpoint)
                    }
                    disabled={checkoutStatus.type === 'loading'}
                    className="group min-h-[12rem] rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span className="block text-lg font-bold text-gray-900">
                      Pay with {option.name}
                    </span>
                    <div className="my-5 flex justify-center">
                      <img src={logoSrc} alt={`${option.name} logo`} className="h-10 w-auto object-contain" />
                    </div>
                    <span className="block text-sm text-gray-600 max-w-[18rem] mx-auto">
                      {option.description}
                    </span>
                    <span className="mt-5 inline-flex rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                      {isLoading ? 'Opening checkout...' : 'Reserve member access'}
                    </span>
                  </button>
                );
              })}

              {isMpesaPhonePromptOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">M-Pesa STK Push</h4>
                        <p className="mt-1 text-sm text-slate-600">Enter your mobile number to get the M-Pesa prompt.</p>
                      </div>
                      <button
                        type="button"
                        className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50"
                        onClick={() => setIsMpesaPhonePromptOpen(false)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <label className="block text-sm font-medium text-slate-700">Mobile number</label>
                    <input
                      type="tel"
                      value={mpesaPhone}
                      onChange={(event) => setMpesaPhone(event.target.value)}
                      placeholder="2547XXXXXXXX"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-200"
                    />
                    {mpesaPhoneError ? (
                      <p className="mt-2 text-sm text-red-600">{mpesaPhoneError}</p>
                    ) : null}

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                        onClick={() => setIsMpesaPhonePromptOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                        onClick={async () => {
                          const success = await handleFounderCheckout('mpesa', '/api/checkout/mpesa');
                          if (success) {
                            setIsMpesaPhonePromptOpen(false);
                          }
                        }}
                        disabled={checkoutStatus.type === 'loading'}
                      >
                        {checkoutStatus.type === 'loading' && checkoutStatus.provider === 'mpesa'
                          ? 'Sending STK Push...'
                          : 'Send STK Push'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {checkoutStatus.type === 'error' && (
                <p className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {checkoutStatus.message}
                </p>
              )}
              {checkoutStatus.type === 'success' && (
                <p className="sm:col-span-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                  {checkoutStatus.message}
                </p>
              )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 text-center bg-slate-50">
        <h3 className="text-2xl font-bold mb-8">Payment Methods</h3>
        <div className="flex justify-center gap-8 flex-wrap">
          <img src="/images/stripe-logo.svg" alt="Stripe" className="h-12" />
          <img src="/images/paypal-logo.svg" alt="PayPal" className="h-12" />
          <img src="/images/pesapal-logo.png" alt="Pesapal" className="h-12" />
          <img src="/images/mpesa-logo.svg" alt="M-Pesa" className="h-12" />
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
                      <option key={`${item.code}-${item.label}`} value={item.code}>
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
                Join now
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
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#waitlist" className="px-8 py-4 bg-brand-soft-white text-brand-dark-blue rounded-lg hover:bg-white transition text-lg font-semibold">
              Join now
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
                <li><a href="#waitlist" className="hover:text-white transition">Join now</a></li>
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



