import type { ReactNode, CSSProperties } from "react";
/**
 * FrostedPill — small pill over photos: ink 45% with 12px blur, or white 90%.
 */
export interface FrostedPillProps { children: ReactNode; variant?: "ink" | "white"; icon?: string; dot?: string; size?: "sm" | "md"; style?: CSSProperties; }
export declare function FrostedPill(props: FrostedPillProps): import("react").JSX.Element;
