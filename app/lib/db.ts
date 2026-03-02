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
        source TEXT NOT NULL DEFAULT 'landing_page',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)
    .then(() => undefined);

  return global.__jamiiWaitlistInitPromise;
}
