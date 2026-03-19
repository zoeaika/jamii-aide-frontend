import { NextRequest, NextResponse } from 'next/server';
import { getPgPool } from '@/app/lib/db';

type WaitlistRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  accepts_promotional: boolean;
  visitor_type: string;
  visitor_type_other: string;
  source: string;
  created_at: string;
};

const MAX_LIMIT = 5000;
const DEFAULT_LIMIT = 1000;

const parseLimit = (value: string | null): number => {
  if (!value) {
    return DEFAULT_LIMIT;
  }
  const numeric = Number.parseInt(value, 10);
  if (Number.isNaN(numeric) || numeric <= 0) {
    return DEFAULT_LIMIT;
  }
  return Math.min(numeric, MAX_LIMIT);
};

const toCsvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

const toCsv = (rows: WaitlistRow[]): string => {
  const header = [
    'id',
    'name',
    'email',
    'phone',
    'accepts_promotional',
    'visitor_type',
    'visitor_type_other',
    'source',
    'created_at',
  ];
  const body = rows.map((row) =>
    [
      toCsvCell(row.id),
      toCsvCell(row.name),
      toCsvCell(row.email),
      toCsvCell(row.phone),
      toCsvCell(String(row.accepts_promotional)),
      toCsvCell(row.visitor_type),
      toCsvCell(row.visitor_type_other),
      toCsvCell(row.source),
      toCsvCell(row.created_at),
    ].join(','),
  );
  return [header.join(','), ...body].join('\n');
};

const isAuthorized = (request: NextRequest): boolean => {
  const configuredToken = process.env.WAITLIST_EXPORT_TOKEN;
  if (!configuredToken) {
    return false;
  }

  const headerToken = request.headers.get('x-admin-export-token');
  if (headerToken && headerToken === configuredToken) {
    return true;
  }

  const auth = request.headers.get('authorization');
  if (!auth?.toLowerCase().startsWith('bearer ')) {
    return false;
  }

  return auth.slice(7).trim() === configuredToken;
};

export async function GET(request: NextRequest) {
  if (!process.env.WAITLIST_EXPORT_TOKEN) {
    return NextResponse.json(
      { message: 'WAITLIST_EXPORT_TOKEN is not configured.' },
      { status: 503 },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = (searchParams.get('format') || 'json').toLowerCase();
  const limit = parseLimit(searchParams.get('limit'));

  if (format !== 'json' && format !== 'csv') {
    return NextResponse.json(
      { message: 'Invalid format. Use json or csv.' },
      { status: 400 },
    );
  }

  try {
    const result = await getPgPool().query<WaitlistRow>(
      `
        SELECT
          id::text,
          name,
          email,
          phone,
          accepts_promotional,
          visitor_type,
          visitor_type_other,
          source,
          created_at::text
        FROM public.waitlist_signups
        ORDER BY created_at DESC
        LIMIT $1;
      `,
      [limit],
    );

    if (format === 'csv') {
      const csv = toCsv(result.rows);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="waitlist_signups.csv"',
          'Cache-Control': 'no-store',
        },
      });
    }

    return NextResponse.json(
      { count: result.rows.length, items: result.rows },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  } catch (error) {
    console.error('Waitlist export failed:', error);
    return NextResponse.json(
      { message: 'Could not export waitlist signups.' },
      { status: 500 },
    );
  }
}
