import { draftMode } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const draft = await draftMode();
  draft.disable();

  const redirectTo = new URL('/', request.url);
  return NextResponse.redirect(redirectTo);
}
