import { currentProfileId } from '@/lib/session';
import { chatTurn } from '@/lib/matches';
import type { ChatLine } from '@/lib/ai';
import { bad, body, handle, json } from '../../../_http';

const BY: ChatLine['by'][] = ['me', 'them', 'roomme'];

// 6A chat. The page sends { as, chat } (the whole chat; nothing is stored) and gets the next line: { text, ai }.
export const POST = (req: Request, ctx: { params: Promise<{ id: string }> }) =>
  handle(async () => {
    const me = await currentProfileId();
    if (!me) return bad('No profile yet', 401);
    const id = Number((await ctx.params).id);
    const b = await body(req);
    if (b?.as !== 'them' && b?.as !== 'roomme') return bad('as: them or roomme');
    const raw = Array.isArray(b.chat) ? (b.chat as Record<string, unknown>[]) : null;
    if (!raw || !raw.every((x) => x && BY.includes(x.by as ChatLine['by']) && typeof x.text === 'string' && x.text.trim())) return bad('chat: [{ by, text }]');
    const chat = raw.slice(-30).map((x) => ({ by: x.by as ChatLine['by'], text: (x.text as string).trim().slice(0, 500) }));
    const line = Number.isSafeInteger(id) && id > 0 ? await chatTurn(me, id, b.as, chat) : null;
    return line ? json(line) : bad('Not found', 404);
  });
