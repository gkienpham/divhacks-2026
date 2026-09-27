import type { ReactNode, CSSProperties } from "react";
/**
 * Header — fixed site header: transparent over the hero, ink 92% + 12px blur after scroll, or light on inner pages.
 */
export interface HeaderProps { variant?: "transparent" | "scrolled" | "light"; items?: string[]; active?: string; onNavigate?: (item: string) => void; ctaLabel?: string; onCta?: () => void; brand?: ReactNode; ctaVariant?: "ink" | "onPhoto"; showSearch?: boolean; showCta?: boolean; right?: ReactNode; onBrand?: () => void; fixed?: boolean; style?: CSSProperties; }
export declare function Header(props: HeaderProps): import("react").JSX.Element;
