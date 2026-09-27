import type { ReactNode, CSSProperties } from "react";
/**
 * Button/Ink — primary ink pill with off-white text and trailing arrow; the default CTA on light and photo backgrounds.
 */
export interface ButtonInkProps { children: ReactNode; size?: "sm" | "md" | "lg"; arrow?: boolean; icon?: string; href?: string; onClick?: () => void; disabled?: boolean; type?: "button" | "submit"; fullWidth?: boolean; style?: CSSProperties; }
export declare function ButtonInk(props: ButtonInkProps): import("react").JSX.Element;
