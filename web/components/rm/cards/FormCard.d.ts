import type { ReactNode, CSSProperties } from "react";
/**
 * FormCard — white 24px-radius bordered card wrapping forms and key-info lists.
 */
export interface FormCardProps { title?: ReactNode; description?: ReactNode; children?: ReactNode; footer?: ReactNode; padding?: number; stickyFooter?: boolean; style?: CSSProperties; }
export declare function FormCard(props: FormCardProps): import("react").JSX.Element;
