import { draftMode } from 'next/headers';
import LandingPageClient from '@/app/components/LandingPageClient';
import { getLandingPageContent } from '@/app/lib/cms/landing';

export default async function LandingPage() {
  const draft = await draftMode();
  const content = await getLandingPageContent({ preview: draft.isEnabled });

  return <LandingPageClient content={content} isPreview={draft.isEnabled} />;
}
