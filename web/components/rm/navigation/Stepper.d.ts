import type { ReactNode, CSSProperties } from "react";
/**
 * Stepper — 4 steps joined by a 1px line with 56px outline icon circles.
 */
export interface StepperProps { steps: { icon: string; title: string; text?: string }[]; current?: number; style?: CSSProperties; }
export declare function Stepper(props: StepperProps): import("react").JSX.Element;
