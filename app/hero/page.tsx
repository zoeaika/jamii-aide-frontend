import Link from 'next/link';

export default function HeroMessagePage() {
  return (
    <main className="min-h-screen bg-blue-800 text-white flex items-center">
      <section className="w-full py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              Professional In-Home Healthcare for Your Loved Ones
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white/90">
              Connect with qualified nurses for personalized care at home. Track health, manage appointments, and ensure the best care for your family.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="px-6 sm:px-8 py-3 sm:py-4 bg-brand-soft-white text-brand-dark-blue rounded-lg font-semibold hover:bg-white transition text-center">
                Get Started
              </Link>
            </div>
            <div className="mt-6">
              <Link href="/" className="text-white/80 hover:text-white underline underline-offset-4">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
