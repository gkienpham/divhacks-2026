import type { ReactNode, CSSProperties } from "react";
/**
 * Chip — filter chip; active = ink fill, inactive = white with border and muted text.
 */
export interface ChipProps { children: ReactNode; active?: boolean; icon?: string; size?: "sm" | "md"; onClick?: () => void; style?: CSSProperties; }
export declare function Chip(props: ChipProps): import("react").JSX.Element;
