import type { ReactNode, CSSProperties } from "react";
/**
 * MatchScore — 60px deterministic match % with "match · math, not AI" and a "How it’s scored" link.
 */
export interface MatchScoreProps { value?: number; caption?: string; linkLabel?: string; onHowScored?: () => void; showLink?: boolean; onDark?: boolean; style?: CSSProperties; }
export declare function MatchScore(props: MatchScoreProps): import("react").JSX.Element;
