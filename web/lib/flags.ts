import "server-only";
// AI_OFF=1 → no Gemini text anywhere: AIOffBadge + rule-based reasons (PROJECT.md §7).
export const AI_OFF = ["1", "true"].includes((process.env.AI_OFF ?? "").toLowerCase());
