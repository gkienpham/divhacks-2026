import type { ReactNode, CSSProperties } from "react";
/**
 * Accordion — FAQ rows split by ink-10% lines; 32px circle icon fills with ink when open.
 */
export interface AccordionProps { items: { q: ReactNode; a: ReactNode }[]; defaultOpen?: number | null; multiple?: boolean; style?: CSSProperties; }
export declare function Accordion(props: AccordionProps): import("react").JSX.Element;
