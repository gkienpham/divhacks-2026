import type { ReactNode, CSSProperties } from "react";
/**
 * HabitTag — Chip variant naming one habit ("Early riser", "Cooks daily").
 */
export interface HabitTagProps { children: ReactNode; icon?: string; tone?: "default" | "active" | "sand" | "onPhoto"; shared?: boolean; style?: CSSProperties; }
export declare function HabitTag(props: HabitTagProps): import("react").JSX.Element;
