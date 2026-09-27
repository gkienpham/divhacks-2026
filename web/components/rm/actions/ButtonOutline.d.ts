import type { ReactNode, CSSProperties } from "react";
/**
 * Button/Outline — secondary pill with 1px ink-20% border that darkens to ink on hover.
 */
export interface ButtonOutlineProps { children: ReactNode; size?: "sm" | "md" | "lg"; arrow?: boolean; icon?: string; onDark?: boolean; href?: string; onClick?: () => void; disabled?: boolean; style?: CSSProperties; }
export declare function ButtonOutline(props: ButtonOutlineProps): import("react").JSX.Element;
