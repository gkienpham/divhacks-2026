import type { ReactNode, CSSProperties } from "react";
/**
 * FilterBar — white pill with 4 dropdown segments split by hairlines and an ink button at the end.
 * @startingPoint section="Forms" subtitle="Four-segment search pill" viewport="700x420"
 */
export interface FilterBarProps { segments?: { label: string; value: string; options?: string[] }[]; actionLabel?: string; onAction?: (values: string[]) => void; onChange?: (label: string, value: string) => void; style?: CSSProperties; }
export declare function FilterBar(props: FilterBarProps): import("react").JSX.Element;
