'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, CheckCircle, Phone, Lock, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import BrandLogo from '@/app/components/BrandLogo';

const trustPoints = [
  {
    icon: Shield,
    title: 'Verified & supervised nurses',
    body: 'Every nurse is licensed by the Nursing Council of Kenya, certificate of good conduct verified, and continuously supervised.',
  },
  {
    icon: Phone,
    title: 'Always a real person',
    body: 'You can always call a human — not a chatbot, not a call centre.',
  },
  {
    icon: FileText,
    title: 'Accountable visit reports',
    body: 'Visit reports are time-stamped and submitted before the nurse leaves the home. You will know if a visit happened, and how it went.',
  },
  {
    icon: CheckCircle,
    title: 'No surprise fees',
    body: 'We bill in your currency. We never charge for missed visits. No hidden or surprise fees.',
  },
  {
    icon: Lock,
    title: 'Your data stays in Kenya',
    body: "Your loved one's data lives on encrypted servers in Kenya, compliant with the Kenya Data Protection Act.",
  },
];

const serviceTiers = [
  {
    tier: '01',
    name: 'Wellness Visit',
    duration: '60–90 min',
    description: 'Routine in-home check-in. Vital signs, medication review, observation, conversation, and a written report submitted before the nurse leaves.',
    bestFor: 'Monthly check-ins on a relative who is generally well but lives alone or far from family.',
  },
  {
    tier: '02',
    name: 'Care Visit',
    duration: '2 hrs',
    description: 'All wellness elements plus support with daily living, mobility help, hygiene assistance, light meal supervision, and an environmental safety check.',
    bestFor: 'Weekly support for an elder with reduced mobility, early cognitive decline, or post-illness recovery.',
  },
  {
    tier: '03',
    name: 'Chronic Condition Visit',
    duration: '2–3 hrs',
    description: "Disease-specific monitoring per a structured clinical care plan agreed with your loved one's treating physician. Includes condition-specific education.",
    bestFor: 'Diabetes, hypertension, post-surgical recovery, ongoing wound care, or palliative observation.',
  },
  {
    tier: '04',
    name: 'Daily Care',
    duration: 'Day or evening shift',
    description: "Structured daily presence, morning or evening. Continuity with the same primary nurse is prioritised.",
    bestFor: 'Recently discharged patients, rapid decline, or families who need a daily anchor.',
  },
  {
    tier: '05',
    name: 'Live-in Care',
    duration: '24/7',
    description: 'A nurse or experienced caregiver present around the clock, with structured handovers between shifts and a designated lead nurse coordinating the care plan.',
    bestFor: 'End-of-life care, complex post-operative recovery, advanced dementia, or full dependency.',
  },
  {
    tier: '06',
    name: 'Emergency Accompaniment',
    duration: 'On call',
    description: 'A nurse accompanies your loved one to a hospital appointment, ER visit, or admission and reports back to you in real time.',
    bestFor: 'Specialist appointments, hospital admissions, ER visits where the family wants a clinical advocate present.',
  },
];

const tierCardStyles = {
  badge: 'bg-rose-50 text-rose-700 ring-rose-100',
  card: 'border-rose-100 bg-gradient-to-br from-white via-rose-50/60 to-pink-50/70',
  detail: 'text-blue-700',
};

const faqs = [
  {
    q: 'Can my loved one refuse care?',
    a: 'Yes, always. Even when you are paying for and arranging the care, the person receiving it must consent. We will help you navigate that conversation if it is difficult.',
  },
  {
    q: 'How do I know the visit actually happened?',
    a: 'Visit reports are time-stamped and geo-tagged on submission. There will be random spot-checks by the local Operations Lead. If a visit did not happen, you are not charged, and we will investigate why immediately.',
  },
  {
    q: 'What if I am not happy with the matched nurse?',
    a: "You can request a different nurse at any time. We understand the value of a personality match for home care services — for your loved one as well as yourself. Continuity matters, but never at the cost of your trust or their comfort.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        className="w-full flex justify-between items-center py-5 text-left gap-4"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="text-gray-900 font-medium">{q}</span>
        {open ? (
          <ChevronUp className="h-5 w-5 text-brand-dark-blue flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-brand-dark-blue flex-shrink-0" />
        )}
      </button>
      {open && <p className="pb-5 text-gray-600 leading-relaxed">{a}</p>}
    </div>
  );
}


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <BrandLogo size="md" />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#for-families" className="text-sm text-gray-600 hover:text-brand-dark-blue transition font-medium">For Families</a>
              <a href="#care-services" className="text-sm text-gray-600 hover:text-brand-dark-blue transition font-medium">Care Services</a>
              <a href="#for-nurses" className="text-sm text-gray-600 hover:text-brand-dark-blue transition font-medium">For Nurses</a>
              <a href="#faq" className="text-sm text-gray-600 hover:text-brand-dark-blue transition font-medium">FAQs</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-gray-600 hover:text-brand-dark-blue font-medium transition hidden sm:block">
                Sign in
              </Link>
              <Link href="/register" className="text-sm bg-brand-dark-blue text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-brand-deep-navy transition">
                Book a consultation
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Image */}
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[url('/brand/Jamii-aide-background-image.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/30" />
      </section>

      {/* Hero Content */}
      <section id="for-families" className="relative z-10 min-h-screen bg-blue-800 text-white flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              Worried about someone in Kenya?{' '}
              <span className="text-brand-sweet-rose">Let&apos;s talk.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-8 text-white/90">
              A free 30-minute consultation. No commitment. Just a conversation about what you need.
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-4 bg-brand-soft-white text-brand-dark-blue rounded-lg font-semibold hover:bg-white transition text-lg"
            >
              Book a consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Why Families Trust Us — asymmetric layout */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-16">
            {/* Left — sticky heading */}
            <div className="lg:col-span-2 lg:sticky lg:top-24 self-start">
              <p className="text-brand-dark-blue text-xs font-bold tracking-widest uppercase mb-4">Trust</p>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight mb-6">
                Why families<br />trust us
              </h2>
              <p className="text-gray-500 leading-relaxed">
                Five things that make us different from the alternatives.
              </p>
            </div>
            {/* Right — list */}
            <div className="lg:col-span-3">
              <ul className="divide-y divide-gray-100">
                {trustPoints.map(({ icon: Icon, title, body }, i) => (
                  <li key={title} className="flex gap-6 py-8 first:pt-0">
                    <span className="text-5xl font-black text-gray-100 w-10 flex-shrink-0 leading-none select-none mt-1">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-brand-dark-blue rounded-md flex items-center justify-center flex-shrink-0">
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-bold text-gray-900">{title}</h3>
                      </div>
                      <p className="text-gray-500 leading-relaxed text-sm">{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-20 bg-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-10">Who we serve</h2>
          <div className="grid md:grid-cols-2 gap-10 text-left">
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-semibold text-brand-dark-blue mb-4">Diaspora families</h3>
              <p className="text-gray-600 leading-relaxed">
                Families across the UK, US, Canada, Europe, the Gulf States, and beyond — caring for loved ones in Kenya from afar.
                From routine monthly wellness visits to round-the-clock palliative care, we stand by your side with what your loved one needs today and what they may need tomorrow.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-semibold text-brand-dark-blue mb-4">Families across Kenya</h3>
              <p className="text-gray-600 leading-relaxed">
                You might be living a few towns away from your family. Through our platform, we help you care for your elderly loved ones across Kenya — with the same trust foundation, the same reporting, and the same human support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Care Services */}
      <section id="care-services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Six tiers of care, scaled to what your loved one needs</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From routine monthly check-ins to live-in palliative presence, our services move with the needs that arise in your loved one&apos;s life. You can change tiers at any time.
            </p>
            <p className="mt-4 text-sm text-gray-500 max-w-2xl mx-auto">
              Every tier includes a vetted nurse or caregiver, structured visit, real-time reporting, your dedicated Family Care Coordinator, and 24/7 emergency support.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceTiers.map(({ tier, name, duration, description, bestFor }) => {
              const style = tierCardStyles;

              return (
                <div
                  key={tier}
                  className={`flex flex-col min-h-[320px] p-8 rounded-xl border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${style.card}`}
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ring-1 ring-inset ${style.badge}`}>
                      Tier {tier}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{name}</h3>
                  <p className={`text-sm font-semibold mb-3 ${style.detail}`}>{duration}</p>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1">{description}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-700">Best for: </span>
                      {bestFor}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/register"
              className="inline-block px-8 py-4 bg-brand-dark-blue text-white rounded-lg font-semibold hover:bg-brand-deep-navy transition text-lg"
            >
              See full service tiers →
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Honest, upfront pricing</h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mb-6">
            A monthly subscription covers the platform, your family care coordinator, scheduling, reporting, and 24/7 support.
            Visit fees are added per completed visit, on the tier you choose.
          </p>
          <p className="text-gray-500 text-sm max-w-xl mx-auto mb-10">
            Full pricing is shared during your free consultation, once we understand what your loved one actually needs.
            We do not list rate cards on this page because matching you to the right tier matters.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-brand-dark-blue text-white rounded-lg font-semibold hover:bg-brand-deep-navy transition text-lg"
          >
            Book a free consultation
          </Link>
        </div>
      </section>

      {/* For Nurses */}
      <section id="for-nurses" className="py-24 bg-brand-deep-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-brand-sweet-rose text-xs font-bold tracking-widest uppercase mb-6">For Nurses & Caregivers</p>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight max-w-3xl">
              Professional nursing, with the respect<br />
              <span className="text-brand-sweet-rose">you&apos;ve earned.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-white/10">
            <div className="bg-brand-deep-navy p-10">
              <h3 className="text-xl font-black text-white mb-8 pb-6 border-b border-white/10">Why nurses choose Jamii Aide</h3>
              <ul className="space-y-5">
                {[
                  'Predictable bi-monthly payments to your M-Pesa, with itemised payslips. No chasing.',
                  'Verified clients only. No unsafe assignments. No off-platform payments.',
                  'A real person to call — your Local Operations Lead, not a help desk.',
                  'Clinical indemnity cover for in-scope work.',
                  'Career path: Nurse → Senior Nurse → City Operations Lead.',
                  'Monthly group debrief led by a registered counsellor. Always confidential.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-brand-neon-green flex-shrink-0 mt-1" />
                    <span className="text-white/80 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-brand-deep-navy p-10">
              <h3 className="text-xl font-black text-white mb-8 pb-6 border-b border-white/10">Who we look for</h3>
              <p className="text-white/50 text-sm mb-6">
                We are deliberately selective — roughly one in four applicants is offered a place after assessment.
              </p>
              <ul className="space-y-5">
                {[
                  'Active, unrestricted Nursing Council of Kenya licence.',
                  'Current Certificate of Good Conduct.',
                  'Two strong professional references we can phone.',
                  'At least one year of post-qualification clinical experience.',
                  'Commitment to documentation, punctuality, and dignified care.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-brand-neon-green flex-shrink-0 mt-1" />
                    <span className="text-white/80 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12">
            <Link
              href="/register"
              className="inline-block px-8 py-4 bg-brand-sweet-rose text-white rounded-lg font-black text-lg hover:opacity-90 transition"
            >
              Begin my application
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-16">
            <div className="lg:col-span-2 lg:sticky lg:top-24 self-start">
              <p className="text-brand-dark-blue text-xs font-bold tracking-widest uppercase mb-4">FAQs</p>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight mb-6">
                Common<br />questions
              </h2>
              <Link href="/register" className="text-brand-dark-blue font-bold text-sm hover:underline underline-offset-4">
                See all FAQs →
              </Link>
            </div>
            <div className="lg:col-span-3">
              <div className="divide-y divide-gray-200">
                {faqs.map((item) => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA — neon green */}
      <section className="bg-brand-neon-green py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <h2 className="text-5xl sm:text-6xl font-black text-brand-deep-navy leading-tight">
              Worried about<br />someone in<br />Kenya?
            </h2>
            <div>
              <p className="text-brand-deep-navy/70 text-xl mb-8 leading-relaxed">
                A free 30-minute consultation. No commitment. Just a conversation about what you need.
              </p>
              <Link
                href="/register"
                className="inline-block px-8 py-4 bg-brand-deep-navy text-white rounded-lg font-black text-lg hover:opacity-90 transition"
              >
                Book a consultation
              </Link>
              <p className="mt-4 text-brand-deep-navy/50 text-sm">Call +254 [number] · Mon–Sat, 06:00–22:00 EAT</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-deep-navy text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-1">
              <div className="mb-4">
                <BrandLogo size="sm" className="[&>span:last-child]:text-white" />
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Connecting families across borders through trusted healthcare coordination.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-widest uppercase text-white mb-5">Families</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#for-families" className="hover:text-white transition">Why Jamii Aide</a></li>
                <li><a href="#care-services" className="hover:text-white transition">Care Services</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-widest uppercase text-white mb-5">Nurses</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#for-nurses" className="hover:text-white transition">Why Join Us</a></li>
                <li><Link href="/register" className="hover:text-white transition">Apply Now</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-widest uppercase text-white mb-5">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-xs text-gray-600">
            <p>&copy; 2024 Jamii Aide. All rights reserved. | Proudly serving families across Kenya</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
