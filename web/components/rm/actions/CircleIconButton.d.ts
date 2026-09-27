import type { ReactNode, CSSProperties } from "react";
/**
 * CircleIconButton — 40–56px outline circle holding one icon; carousel arrows, back-to-top, secondary icon actions.
 */
export interface CircleIconButtonProps { icon?: string; size?: number; onDark?: boolean; filled?: boolean; disabled?: boolean; label?: string; onClick?: () => void; style?: CSSProperties; }
export declare function CircleIconButton(props: CircleIconButtonProps): import("react").JSX.Element;
