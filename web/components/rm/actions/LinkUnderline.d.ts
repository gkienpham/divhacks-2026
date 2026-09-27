import type { ReactNode, CSSProperties } from "react";
/**
 * Link/Underline — inline text link with 1px underline at 25% and ↗; for "Learn more", "View on Zillow ↗".
 */
export interface LinkUnderlineProps { children: ReactNode; href?: string; onClick?: () => void; onDark?: boolean; arrow?: boolean; size?: number; style?: CSSProperties; }
export declare function LinkUnderline(props: LinkUnderlineProps): import("react").JSX.Element;
