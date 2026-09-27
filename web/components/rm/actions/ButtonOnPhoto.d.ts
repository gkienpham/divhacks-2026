import type { ReactNode, CSSProperties } from "react";
/**
 * Button/OnPhoto — white pill for use over photography or ink.
 */
export interface ButtonOnPhotoProps { children: ReactNode; size?: "sm" | "md" | "lg"; arrow?: boolean; icon?: string; href?: string; onClick?: () => void; disabled?: boolean; style?: CSSProperties; }
export declare function ButtonOnPhoto(props: ButtonOnPhotoProps): import("react").JSX.Element;
