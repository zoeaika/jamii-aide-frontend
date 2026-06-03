import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import BrandBackground from '@/app/components/BrandBackground';
import BrandLogo from '@/app/components/BrandLogo';

const providerNames: Record<string, string> = {
  stripe: 'Stripe',
  paypal: 'PayPal',
  pesapal: 'Pesapal',
  mpesa: 'M-Pesa',
};

type FoundingMemberSuccessPageProps = {
  searchParams?: Promise<{
    provider?: string;
  }>;
};

export default async function FoundingMemberSuccessPage({ searchParams }: FoundingMemberSuccessPageProps) {
  const params = await searchParams;
  const provider = providerNames[String(params?.provider || '').toLowerCase()] || 'your payment provider';

  return (
    <main className="brand-shell flex items-center justify-center p-4">
      <BrandBackground />
      <section className="surface-card relative w-full max-w-xl p-8 text-center sm:p-10">
        <Link href="/" className="mb-8 inline-flex items-center justify-center">
          <BrandLogo size="md" />
        </Link>
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-brand-deep-navy">
          Founder access reserved
        </h1>
        <p className="mt-4 text-slate-600">
          Thank you for becoming a Jamii Aide founding member. Your payment is being confirmed by {provider}, and we will follow up with next steps before full access opens.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/#waitlist" className="btn-primary px-6 py-3">
            Join waitlist too
          </Link>
          <a
            href="mailto:Saidika@jamiiaide.com"
            className="rounded-lg border border-brand-dark-blue px-6 py-3 font-semibold text-brand-dark-blue transition hover:bg-brand-vintage-blue/30"
          >
            Contact our team
          </a>
        </div>
      </section>
    </main>
  );
}
