import Link from 'next/link';
import { CreditCard } from 'lucide-react';
import BrandBackground from '@/app/components/BrandBackground';
import BrandLogo from '@/app/components/BrandLogo';

export default function FoundingMemberCancelPage() {
  return (
    <main className="brand-shell flex items-center justify-center p-4">
      <BrandBackground />
      <section className="surface-card relative w-full max-w-xl p-8 text-center sm:p-10">
        <Link href="/" className="mb-8 inline-flex items-center justify-center">
          <BrandLogo size="md" />
        </Link>
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700">
          <CreditCard className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-brand-deep-navy">
          Checkout was cancelled
        </h1>
        <p className="mt-4 text-slate-600">
          No payment was taken. You can return to the founder offer whenever you are ready.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/#founder-pricing" className="btn-primary px-6 py-3">
            Return to founder offer
          </Link>
          <Link
            href="/#waitlist"
            className="rounded-lg border border-brand-dark-blue px-6 py-3 font-semibold text-brand-dark-blue transition hover:bg-brand-vintage-blue/30"
          >
            Join waitlist
          </Link>
        </div>
      </section>
    </main>
  );
}
