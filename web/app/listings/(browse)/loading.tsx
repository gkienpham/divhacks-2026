import { ListingSkeleton } from "@/components/shared";

export default function Loading() {
  return (
    <div style={{ padding: "184px 48px 112px", display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", columnGap: 16, rowGap: 48 }}>
      {Array.from({ length: 6 }, (_, i) => <ListingSkeleton key={i} />)}
    </div>
  );
}
