import { currentProfileId } from '@/lib/session';
import { actOnMatch, getMatch, type Action } from '@/lib/matches';
import { bad, body, handle, json } from '../../_http';

const ACTIONS: Action[] = ['like', 'unlike', 'pass', 'meetup', 'agreement', 'confirm', 'simulate-confirm', 'lock'];
type Ctx = { params: Promise<{ id: string }> };

async function ids(ctx: Ctx) {
  const me = await currentProfileId();
  const id = Number((await ctx.params).id);
  return { me, id: Number.isInteger(id) && id > 0 ? id : null };
}

export const GET = (_req: Request, ctx: Ctx) =>
  handle(async () => {
    const { me, id } = await ids(ctx);
    if (!me) return bad('No profile yet', 401);
    const match = id && (await getMatch(me, id));
    return match ? json({ match }, 200, { 'cache-control': 'no-store' }) : bad('Not found', 404);
  });

export const POST = (req: Request, ctx: Ctx) =>
  handle(async () => {
    const { me, id } = await ids(ctx);
    if (!me) return bad('No profile yet', 401);
    const b = await body(req);
    if (!b || !ACTIONS.includes(b.action as Action)) return bad(`action: one of ${ACTIONS.join(', ')}`);
    const { action, ...payload } = b;
    const match = id && (await actOnMatch(me, id, action as Action, payload));
    return match ? json({ match }) : bad('Not found', 404);
  });
