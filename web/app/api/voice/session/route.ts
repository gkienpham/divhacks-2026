import { handle, json } from '../../_http';

export const dynamic = 'force-dynamic';

// Short-lived signed URL for the ElevenLabs agent (Agents Platform, GET .../get-signed-url). Keys never leave the server.
export const GET = () =>
  handle(async () => {
    const { ELEVENLABS_API_KEY: key, ELEVENLABS_AGENT_ID: agent } = process.env;
    const headers = { 'cache-control': 'no-store' };
    if (!key || !agent) return json({ configured: false }, 200, headers); // not an error: the client falls back to typing
    const res = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agent)}`, {
      headers: { 'xi-api-key': key },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return json({ configured: true, error: 'ElevenLabs did not return a session' }, 502, headers);
    const { signed_url } = await res.json();
    return json({ signedUrl: signed_url }, 200, headers);
  });
