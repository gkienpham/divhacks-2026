import { MFrame } from "./parts";

// Overrides app/matches/loading.tsx (the list skeleton) for the pair screens: just the frame while the match loads.
export default function Loading() {
  return <MFrame me={{ initials: "", name: "" }} />;
}
