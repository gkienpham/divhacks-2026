import type { ReactNode, CSSProperties } from "react";
/**
 * Eyebrow — 11px uppercase label with 0.18em tracking led by a 6px --brand dot; sits above every H1/H2.
 */
export interface EyebrowProps { children: ReactNode; dot?: boolean; onDark?: boolean; /** On --sand surfaces muted grey is 4.35:1; this switches the text to --foreground. */ onSand?: boolean; style?: CSSProperties; }
export declare function Eyebrow(props: EyebrowProps): import("react").JSX.Element;
