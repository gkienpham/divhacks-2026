import type { ReactNode, CSSProperties } from "react";
/**
 * VerifiedBadge — small outline pill with a check for identity verification.
 */
export interface VerifiedBadgeProps { variant?: "student" | "enrollment"; label?: string; onDark?: boolean; style?: CSSProperties; }
export declare function VerifiedBadge(props: VerifiedBadgeProps): import("react").JSX.Element;
