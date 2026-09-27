import type { ReactNode, CSSProperties } from "react";
/**
 * AISummaryTag — tiny outline pill "AI summary" placed on every piece of AI-written text.
 */
export interface AISummaryTagProps { label?: string; onDark?: boolean; style?: CSSProperties; }
export declare function AISummaryTag(props: AISummaryTagProps): import("react").JSX.Element;
