import 'server-only';

export const json = (body: unknown, status = 200, headers?: HeadersInit) => Response.json(body, { status, headers });
export const bad = (error: string, status = 400) => json({ error }, status);

// Object bodies only; anything else is a 400 for the caller.
export async function body(req: Request): Promise<Record<string, unknown> | null> {
  const b = await req.json().catch(() => null);
  return b && typeof b === 'object' && !Array.isArray(b) ? b : null;
}

// Route Handlers wrap their work in this: known errors keep their status, anything else is a plain 500.
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof Error && 'status' in e && typeof e.status === 'number') return bad(e.message, e.status); // MatchError
    console.error(e);
    return bad('Something went wrong', 500);
  }
}
