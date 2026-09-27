import type { ReactNode, CSSProperties } from "react";
/**
 * ChatBubble — message bubble for agent previews: ink for the agent, white + border for people. No tails.
 */
export interface ChatBubbleProps { from?: "agent" | "person"; name?: string; initials?: string; time?: string; children: ReactNode; aiSummary?: boolean; align?: "left" | "right"; avatarTone?: "sand" | "card"; style?: CSSProperties; }
export declare function ChatBubble(props: ChatBubbleProps): import("react").JSX.Element;
