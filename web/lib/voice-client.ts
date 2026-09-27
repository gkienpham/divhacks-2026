// ElevenLabs voice interview, browser side. /api/voice/session mints the signed URL from the server-only keys.
// The SDK is imported on first use, so it stays out of the page bundle. Audio streams to the agent and is never stored here.
export interface VoiceHandlers {
  onStart?: () => void; // connected (mic granted): start the countdown now
  onLine: (text: string) => void; // one finished line the user said; the agent's lines are dropped
  onEnd: (error?: string) => void; // over: stopped, the agent hung up, or it failed to start
}

// Returns stop(). Safe to call more than once, or before the session has connected.
export function startVoiceSession(signedUrl: string, { onStart, onLine, onEnd }: VoiceHandlers): () => void {
  let session: { endSession(): Promise<void> } | null = null;
  let stopped = false;
  import("@elevenlabs/client")
    .then(({ Conversation }) =>
      Conversation.startSession({
        signedUrl,
        onConnect: () => { if (!stopped) onStart?.(); },
        onMessage: ({ role, message }) => { if (!stopped && role === "user" && message.trim()) onLine(message.trim()); },
        onDisconnect: (d) => onEnd(d.reason === "error" ? d.message : undefined),
      }),
    )
    .then(
      (s) => { session = s; if (stopped) s.endSession().catch(() => {}); },
      (e) => onEnd(e instanceof Error ? e.message : String(e)),
    );
  return () => {
    if (stopped) return;
    stopped = true;
    session?.endSession().catch(() => {});
  };
}
