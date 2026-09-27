import 'server-only';
import { rootCertificates } from 'node:tls';
import { Pool } from 'pg';
import { TIGER_CA } from './tiger-ca';

// Tiger Data has no connection pooler: one connection per serverless instance,
// reused across warm invocations and across dev HMR (stashed on globalThis).
const g = globalThis as typeof globalThis & { __roommePool?: Pool };

function makePool() {
  // pg lets the URL's sslmode override the `ssl` option below, so drop it from the URL
  // and verify the server fully (chain + hostname) against the public roots plus Tiger's CA.
  const url = new URL(process.env.DATABASE_URL ?? '');
  url.searchParams.delete('sslmode');
  return new Pool({
    connectionString: url.toString(),
    ssl: { ca: [...rootCertificates, TIGER_CA] },
    max: 1,
    idleTimeoutMillis: 10_000,
  });
}

export const pool: Pool = g.__roommePool ?? makePool();
if (process.env.NODE_ENV !== 'production') g.__roommePool = pool;

export async function query<T>(text: string, params: unknown[] = []): Promise<T[]> {
  const { rows } = await pool.query(text, params);
  return rows as T[];
}
