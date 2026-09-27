import type { ReactNode, CSSProperties } from "react";
/**
 * CTABand — ink 28px-radius closing band with eyebrow, H2, lead and pill actions; optional photo.
 * @startingPoint section="Cards" subtitle="Ink closing band" viewport="700x420"
 */
export interface CTABandProps { eyebrow?: ReactNode; title?: ReactNode; lead?: ReactNode; actions?: ReactNode; image?: string; minHeight?: number; style?: CSSProperties; }
export declare function CTABand(props: CTABandProps): import("react").JSX.Element;
