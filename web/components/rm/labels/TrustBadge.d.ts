import type { ReactNode, CSSProperties } from "react";
/**
 * TrustBadge — price/listing trust status: dot + label pill. Meaning always lives in the text.
 */
export interface TrustBadgeProps { status?: "fair" | "above" | "check"; label?: string; surface?: "white" | "frosted"; style?: CSSProperties; }
export declare function TrustBadge(props: TrustBadgeProps): import("react").JSX.Element;
