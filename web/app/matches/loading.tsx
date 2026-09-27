import { MatchSkeleton } from "./TopMatchesScreen";

export default function Loading() {
  return (
    <div style={{ width: 1440, margin: "0 auto", padding: "184px 48px 112px", display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 16 }}>
      {Array.from({ length: 6 }, (_, i) => <MatchSkeleton key={i} />)}
    </div>
  );
}
