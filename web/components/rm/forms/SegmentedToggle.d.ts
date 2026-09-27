import type { ReactNode, CSSProperties } from "react";
/**
 * SegmentedToggle — pill with 2–5 options; active segment is ink with off-white text.
 */
export interface SegmentedToggleProps { options: string[]; value?: string; defaultValue?: string; onChange?: (v: string) => void; size?: "sm" | "md"; onDark?: boolean; style?: CSSProperties; }
export declare function SegmentedToggle(props: SegmentedToggleProps): import("react").JSX.Element;
