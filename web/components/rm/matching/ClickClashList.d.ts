import type { ReactNode, CSSProperties } from "react";
/**
 * ClickClashList — "You’ll click" (3 rows, check) beside "You’ll clash" (2 rows, --watch dot).
 */
export interface ClickClashListProps { click: ReactNode[]; clash: ReactNode[]; aiWritten?: boolean; style?: CSSProperties; }
export declare function ClickClashList(props: ClickClashListProps): import("react").JSX.Element;
