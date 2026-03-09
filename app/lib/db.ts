import { Pool } from 'pg';

declare global {
  var __jamiiPgPool: Pool | undefined;
  var __jamiiWaitlistInitPromise: Promise<void> | undefined;
}

const createPool = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set.');
  }

  return new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : undefined,
  });
};

export const getPgPool = (): Pool => {
  if (!global.__jamiiPgPool) {
    global.__jamiiPgPool = createPool();
  }
  return global.__jamiiPgPool;
};

if (process.env.NODE_ENV !== 'production' && !global.__jamiiPgPool) {
  global.__jamiiPgPool = createPool();
}

export async function ensureWaitlistTable(): Promise<void> {
  if (global.__jamiiWaitlistInitPromise) {
    return global.__jamiiWaitlistInitPromise;
  }

  global.__jamiiWaitlistInitPromise = getPgPool()
    .query(`
      CREATE TABLE IF NOT EXISTS public.waitlist_signups (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        accepts_promotional BOOLEAN NOT NULL DEFAULT FALSE,
        source TEXT NOT NULL DEFAULT 'landing_page',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)
    .then(() =>
      getPgPool().query(`
        ALTER TABLE public.waitlist_signups
        ADD COLUMN IF NOT EXISTS phone TEXT;
      `),
    )
    .then(() =>
      getPgPool().query(`
        ALTER TABLE public.waitlist_signups
        ALTER COLUMN phone SET DEFAULT '';
      `),
    )
    .then(() =>
      getPgPool().query(`
        UPDATE public.waitlist_signups
        SET phone = ''
        WHERE phone IS NULL;
      `),
    )
    .then(() =>
      getPgPool().query(`
        ALTER TABLE public.waitlist_signups
        ALTER COLUMN phone SET NOT NULL;
      `),
    )
    .then(() =>
      getPgPool().query(`
        ALTER TABLE public.waitlist_signups
        ADD COLUMN IF NOT EXISTS accepts_promotional BOOLEAN NOT NULL DEFAULT FALSE;
      `),
    )
    .then(() => undefined);

  return global.__jamiiWaitlistInitPromise;
}
