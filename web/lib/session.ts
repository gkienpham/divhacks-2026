import 'server-only';
import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { query } from './db';

// Anonymous identity: the httpOnly rm_uid cookie holds profiles.session_token (a uuid), never the numeric id.
// OAuth later: resolve the id from the provider's session here; nothing else in the app changes.
const COOKIE = 'rm_uid';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Read-only, so it's safe in Server Components.
export async function currentProfileId(): Promise<number | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !UUID.test(token)) return null;
  const [row] = await query<{ id: number }>('select id::int as id from profiles where session_token = $1', [token]);
  return row?.id ?? null;
}

// Route Handlers only (sets a cookie): creates the anonymous profile on first write.
export async function ensureProfileId(): Promise<number> {
  const existing = await currentProfileId();
  if (existing) return existing;
  const token = randomUUID();
  const [row] = await query<{ id: number }>(
    `insert into profiles (name, session_token) values ('You', $1) returning id::int as id`,
    [token],
  );
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  return row.id;
}
