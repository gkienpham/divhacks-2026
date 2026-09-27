import type { CSSProperties } from "react";
/**
 * Wordmark — "RoomMe" in DM Sans 500 with a line icon of a house split into two rooms.
 */
export interface WordmarkProps { onDark?: boolean; size?: number; showIcon?: boolean; style?: CSSProperties; }
export declare function Wordmark(props: WordmarkProps): import("react").JSX.Element;
/** The house split into two rooms, on its own (the app icon and link preview use it). */
export declare function WordmarkIcon(props: { size?: number; color?: string; strokeWidth?: number }): import("react").JSX.Element;
