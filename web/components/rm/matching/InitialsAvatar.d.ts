import type { ReactNode, CSSProperties } from "react";
/**
 * InitialsAvatar — sand circle with ink initials; replaces every face before a mutual match.
 */
export interface InitialsAvatarProps { initials?: string; name?: string; size?: number; onDark?: boolean; tone?: "sand" | "card"; style?: CSSProperties; }
export declare function InitialsAvatar(props: InitialsAvatarProps): import("react").JSX.Element;
