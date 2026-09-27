import type { ReactNode, CSSProperties } from "react";
/**
 * ContradictionCallout — sand card quoting two conflicting answers verbatim with sources and a draft question. It asks; it never accuses.
 * @startingPoint section="Matching" subtitle="Ask about two conflicting answers" viewport="700x520"
 */
export interface ContradictionCalloutProps { eyebrow?: string; answers: { source: string; quote: string }[]; question?: string; onSend?: (q: string) => void; onSkip?: () => void; sent?: boolean; style?: CSSProperties; }
export declare function ContradictionCallout(props: ContradictionCalloutProps): import("react").JSX.Element;
