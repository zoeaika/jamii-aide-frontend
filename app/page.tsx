import LandingPageClient from '@/app/components/LandingPageClient';
import { defaultLandingPageContent } from '@/app/lib/cms/landing';

export default function LandingPage() {
  return <LandingPageClient content={defaultLandingPageContent} />;
}
