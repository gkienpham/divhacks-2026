import type { ReactNode, CSSProperties } from "react";
/**
 * HabitBar — one habit row: label, 4px ink bar on a sand track, and both people’s answers.
 */
export interface HabitBarProps { label: ReactNode; icon?: string; value?: number; you?: string; them?: string; themName?: string; style?: CSSProperties; }
export declare function HabitBar(props: HabitBarProps): import("react").JSX.Element;
