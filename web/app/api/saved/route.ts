import { ensureProfileId } from '@/lib/session';
import { setSaved } from '@/lib/profiles';
import { getListing } from '@/lib/listings';
import { bad, body, handle, json } from '../_http';

export const POST = (req: Request) =>
  handle(async () => {
    const b = await body(req);
    if (!b || typeof b.zpid !== 'string' || typeof b.saved !== 'boolean') return bad('{ zpid: string, saved: boolean } expected');
    if (!(await getListing(b.zpid))) return bad('zpid: unknown listing');
    return json({ saved: await setSaved(await ensureProfileId(), b.zpid, b.saved) });
  });
