import type { ReactNode, CSSProperties } from "react";
/**
 * Timeline — vertical 1px line with 10px ink dots; labelled rows for sequences (match to hand-off).
 */
export interface TimelineProps { items: { label: string; title: string; text?: string; pending?: boolean }[]; style?: CSSProperties; }
export declare function Timeline(props: TimelineProps): import("react").JSX.Element;
