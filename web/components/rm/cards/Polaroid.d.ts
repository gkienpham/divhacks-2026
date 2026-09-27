import type { ReactNode, CSSProperties } from "react";
/**
 * Polaroid — white-framed tilted photo with the one allowed shadow and an optional Caveat note beside it.
 */
export interface PolaroidProps { image?: string; placeholder?: string; rotate?: number; width?: number; height?: number; caption?: ReactNode; note?: ReactNode; notePlacement?: "left" | "right"; media?: ReactNode; style?: CSSProperties; }
export declare function Polaroid(props: PolaroidProps): import("react").JSX.Element;
