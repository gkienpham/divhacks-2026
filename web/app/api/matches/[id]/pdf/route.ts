import { getMe } from '@/lib/profiles';
import { getMatch } from '@/lib/matches';
import { getPriceHistory } from '@/lib/listings';
import { agreementPdf } from '@/lib/agreement-pdf';
import { bad, handle } from '../../../_http';

// The House Agreement as a downloaded PDF (the Locked screen's Download PDF).
export const GET = (_req: Request, ctx: { params: Promise<{ id: string }> }) =>
  handle(async () => {
    const me = await getMe();
    if (!me) return bad('No profile yet', 401);
    const id = Number((await ctx.params).id);
    const m = Number.isSafeInteger(id) && id > 0 ? await getMatch(me.id, id) : null;
    if (!m?.agreement) return bad('Not found', 404);
    const history = m.listing ? await getPriceHistory(m.listing.zpid) : [];
    const pdf = await agreementPdf({ me, m, history });
    return new Response(Buffer.from(pdf), {
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `attachment; filename="roomme-house-agreement-${m.id}.pdf"`,
        'cache-control': 'no-store',
      },
    });
  });
