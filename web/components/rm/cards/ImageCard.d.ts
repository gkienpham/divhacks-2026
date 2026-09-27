import type { ReactNode, CSSProperties } from "react";
/**
 * ImageCard — full-bleed photo card, 21.6px radius, ink gradient, title bottom-left, frosted pill top-left, hover zoom + arrow.
 * @startingPoint section="Cards" subtitle="Photo card with gradient and hover arrow" viewport="700x460"
 */
export interface ImageCardProps { image?: string; placeholder?: string; title?: ReactNode; subtitle?: ReactNode; meta?: ReactNode; pill?: ReactNode; tags?: ReactNode; height?: number | string; width?: number | string; radius?: number; onClick?: () => void; href?: string; children?: ReactNode; forceHover?: boolean; media?: ReactNode; titleSize?: number; style?: CSSProperties; }
export declare function ImageCard(props: ImageCardProps): import("react").JSX.Element;
