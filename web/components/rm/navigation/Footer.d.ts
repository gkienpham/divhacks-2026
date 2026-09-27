import type { ReactNode, CSSProperties } from "react";
/**
 * Footer — ink 12-column footer: brand column, three link columns, photo card, bottom bar.
 * @startingPoint section="Navigation" subtitle="Ink 12-column footer" viewport="700x420"
 */
export interface FooterProps { brand?: string; blurb?: string; email?: string; columns?: { title: string; links: string[] }[]; image?: string; imageTitle?: string; year?: number; tagline?: string; legal?: ReactNode; brandNode?: ReactNode; domain?: string; showCard?: boolean; onLink?: (l: string) => void; style?: CSSProperties; }
export declare function Footer(props: FooterProps): import("react").JSX.Element;
