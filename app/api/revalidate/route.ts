import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

type RevalidateRequest = {
  secret?: string;
  path?: string;
  tag?: string;
};

export async function POST(request: NextRequest) {
  let payload: RevalidateRequest = {};

  try {
    payload = (await request.json()) as RevalidateRequest;
  } catch {
    return NextResponse.json({ message: 'Invalid JSON payload.' }, { status: 400 });
  }

  if (!process.env.REVALIDATE_SECRET || payload.secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid revalidation secret.' }, { status: 401 });
  }

  if (payload.tag) {
    revalidateTag(payload.tag, 'max');
    return NextResponse.json({ revalidated: true, mode: 'tag', value: payload.tag });
  }

  const path = payload.path || '/';
  revalidatePath(path);
  return NextResponse.json({ revalidated: true, mode: 'path', value: path });
}
