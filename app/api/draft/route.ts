import { draftMode } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const isSafeSlug = (value: string) => value.startsWith('/') && !value.startsWith('//');

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret');
  const slug = url.searchParams.get('slug') || '/';

  if (!process.env.NEXT_PREVIEW_SECRET || secret !== process.env.NEXT_PREVIEW_SECRET) {
    return NextResponse.json({ message: 'Invalid preview secret.' }, { status: 401 });
  }

  const target = isSafeSlug(slug) ? slug : '/';

  const draft = await draftMode();
  draft.enable();

  return NextResponse.redirect(new URL(target, request.url));
}
