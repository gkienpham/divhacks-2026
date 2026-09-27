import { getMe } from '@/lib/profiles';
import { handle, json } from '../_http';

export const dynamic = 'force-dynamic';

export const GET = () => handle(async () => json({ me: await getMe() }, 200, { 'cache-control': 'no-store' }));
