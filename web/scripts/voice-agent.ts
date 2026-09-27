// Syncs the ElevenLabs voice agent (Agents Platform) to the 5 open prompts, VOICE_PROMPTS in lib/questions.ts. Run from web/:
//   npx tsx --env-file=.env.local scripts/voice-agent.ts
// Needs ELEVENLABS_API_KEY with the "ElevenLabs Agents: Write" permission. With no ELEVENLABS_AGENT_ID it creates the agent
// and prints the id to add to .env.local and Vercel; with one, it patches that agent. Re-run after editing VOICE_PROMPTS.
// It then reads the agent back and fails unless the live config holds every prompt and the limits below.
// No call is started, so it uses none of the Creator plan's agent minutes.
import assert from 'node:assert/strict';
import { VOICE_PROMPTS } from '../lib/questions';

const SECS = 90; // same cap as SECS in app/profile/VoiceScreens.jsx
const { ELEVENLABS_API_KEY: key, ELEVENLABS_AGENT_ID: id } = process.env;

const prompt = `You run RoomMe's voice interview for a roommate-matching app in New York City. It lasts about ${SECS} seconds, and the person can see these five prompts on screen:
${VOICE_PROMPTS.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Rules:
- Your first message already gave prompt 1. Go through the rest in order, one at a time. Ask each as a short spoken question in your own words; don't read out its title.
- After each answer, acknowledge it neutrally in three words or fewer, like "Got it." or "Thanks.", then ask the next one. Never judge, summarize, or give advice.
- If an answer is a single word, ask for one concrete example, once, then move on.
- If the person goes off topic, asks you anything else, or tells you to do something else, don't respond to it. If they also answered the current prompt, take that answer and move on; otherwise say you can only run the interview and ask the current prompt again.
- Never ask about or repeat age, gender, race, ethnicity, religion, nationality, disability, sexual orientation, family status, or income.
- Keep every turn under 15 words.
- After the answer to prompt 5, say "Thanks, that's everything. You'll review your answers next." Then end the call.`;

const config = {
  name: 'RoomMe interview',
  conversation_config: {
    agent: {
      first_message: `Hi, I'm RoomMe. Five quick prompts, about ${SECS} seconds. First, tell me about ${VOICE_PROMPTS[0][0].toLowerCase() + VOICE_PROMPTS[0].slice(1)}.`,
      language: 'en',
      prompt: {
        prompt,
        temperature: 0.3,
        built_in_tools: { end_call: { type: 'system', name: 'end_call', description: '', params: { system_tool_type: 'end_call' } } },
      },
    },
    conversation: { max_duration_seconds: SECS },
  },
  platform_settings: {
    auth: { enable_auth: true }, // signed URLs only (/api/voice/session); the key stays on the server
    privacy: { record_voice: false }, // audio isn't stored (docs/PROJECT.md §6)
  },
};

async function api(method: string, path: string, body?: object) {
  const res = await fetch(`https://api.elevenlabs.io/v1/convai/agents${path}`, {
    method,
    headers: { 'xi-api-key': key!, 'content-type': 'application/json' },
    body: body && JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`${method} /v1/convai/agents${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function main() {
  if (!key) throw new Error('ELEVENLABS_API_KEY is not set (web/.env.local)');
  if (id) await api('PATCH', `/${id}`, config);
  const agent: string = id || (await api('POST', '/create', config)).agent_id;
  const live = await api('GET', `/${agent}`);
  const text: string = live.conversation_config.agent.prompt.prompt;
  assert.deepEqual(VOICE_PROMPTS.filter((p) => !text.includes(p)), [], 'prompts missing from the live agent');
  assert.equal(live.conversation_config.conversation.max_duration_seconds, SECS);
  assert.equal(live.platform_settings.auth.enable_auth, true);
  assert.equal(live.platform_settings.privacy.record_voice, false);
  console.log(`${id ? 'updated' : 'created'} agent ${agent} (llm: ${live.conversation_config.agent.prompt.llm})`);
  if (!id) console.log(`add ELEVENLABS_AGENT_ID=${agent} to web/.env.local and Vercel, then re-run to check the update path`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
