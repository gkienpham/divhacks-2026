import type { ReactNode, CSSProperties } from "react";
/**
 * Field — 48px text input / select / textarea with 16.8px radius, --border, ink border on focus.
 */
export interface FieldProps { label?: ReactNode; hint?: ReactNode; placeholder?: string; value?: string; defaultValue?: string; onChange?: (e: import("react").ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void; type?: string; as?: "input" | "select" | "textarea"; options?: string[]; rows?: number; error?: string; disabled?: boolean; name?: string; focused?: boolean; style?: CSSProperties; }
export declare function Field(props: FieldProps): import("react").JSX.Element;
