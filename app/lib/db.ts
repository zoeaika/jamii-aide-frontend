import { Pool } from 'pg';

declare global {
  var __jamiiPgPool: Pool | undefined;
  var __jamiiWaitlistInitPromise: Promise<void> | undefined;
  var __jamiiFounderPreordersInitPromise: Promise<void> | undefined;
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
    .then(() =>
      getPgPool().query(`
        ALTER TABLE public.waitlist_signups
        ADD COLUMN IF NOT EXISTS visitor_type TEXT NOT NULL DEFAULT '';
      `),
    )
    .then(() =>
      getPgPool().query(`
        ALTER TABLE public.waitlist_signups
        ADD COLUMN IF NOT EXISTS visitor_type_other TEXT NOT NULL DEFAULT '';
      `),
    )
    .then(() => undefined);

  return global.__jamiiWaitlistInitPromise;
}

export async function ensureFounderPreordersTable(): Promise<void> {
  if (global.__jamiiFounderPreordersInitPromise) {
    return global.__jamiiFounderPreordersInitPromise;
  }

  global.__jamiiFounderPreordersInitPromise = getPgPool()
    .query(`
      CREATE TABLE IF NOT EXISTS public.founder_preorders (
        id BIGSERIAL PRIMARY KEY,
        checkout_session_id TEXT NOT NULL UNIQUE,
        payment_provider TEXT NOT NULL DEFAULT 'stripe',
        payment_intent_id TEXT,
        customer_id TEXT,
        customer_email TEXT,
        customer_name TEXT,
        amount_total INTEGER,
        currency TEXT,
        payment_status TEXT NOT NULL DEFAULT 'pending',
        status TEXT NOT NULL DEFAULT 'created',
        offer_code TEXT NOT NULL DEFAULT 'founding_member',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        paid_at TIMESTAMPTZ,
        raw_event JSONB
      );
    `)
    .then(() =>
      getPgPool().query(`
        ALTER TABLE public.founder_preorders
        ADD COLUMN IF NOT EXISTS payment_provider TEXT NOT NULL DEFAULT 'stripe';
      `),
    )
    .then(() =>
      getPgPool().query(`
        ALTER TABLE public.founder_preorders
        ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
      `),
    )
    .then(() =>
      getPgPool().query(`
        ALTER TABLE public.founder_preorders
        ADD COLUMN IF NOT EXISTS customer_id TEXT;
      `),
    )
    .then(() =>
      getPgPool().query(`
        ALTER TABLE public.founder_preorders
        ADD COLUMN IF NOT EXISTS customer_email TEXT;
      `),
    )
    .then(() =>
      getPgPool().query(`
        ALTER TABLE public.founder_preorders
        ADD COLUMN IF NOT EXISTS customer_name TEXT;
      `),
    )
    .then(() =>
      getPgPool().query(`
        ALTER TABLE public.founder_preorders
        ADD COLUMN IF NOT EXISTS amount_total INTEGER;
      `),
    )
    .then(() =>
      getPgPool().query(`
        ALTER TABLE public.founder_preorders
        ADD COLUMN IF NOT EXISTS currency TEXT;
      `),
    )
    .then(() =>
      getPgPool().query(`
        ALTER TABLE public.founder_preorders
        ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending';
      `),
    )
    .then(() =>
      getPgPool().query(`
        ALTER TABLE public.founder_preorders
        ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'created';
      `),
    )
    .then(() =>
      getPgPool().query(`
        ALTER TABLE public.founder_preorders
        ADD COLUMN IF NOT EXISTS offer_code TEXT NOT NULL DEFAULT 'founding_member';
      `),
    )
    .then(() =>
      getPgPool().query(`
        ALTER TABLE public.founder_preorders
        ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
      `),
    )
    .then(() =>
      getPgPool().query(`
        ALTER TABLE public.founder_preorders
        ADD COLUMN IF NOT EXISTS raw_event JSONB;
      `),
    )
    .then(() => undefined);

  return global.__jamiiFounderPreordersInitPromise;
}
