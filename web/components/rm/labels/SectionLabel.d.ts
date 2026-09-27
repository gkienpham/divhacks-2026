import type { ReactNode, CSSProperties } from "react";
/**
 * SectionLabel — "01" section number in --brand next to an eyebrow label; numbers each homepage section.
 */
export interface SectionLabelProps { number?: string; children: ReactNode; onDark?: boolean; /** On --sand surfaces muted grey is 4.35:1; this switches the label to --foreground. */ onSand?: boolean; style?: CSSProperties; }
export declare function SectionLabel(props: SectionLabelProps): import("react").JSX.Element;
