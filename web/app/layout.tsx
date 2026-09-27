import type { Metadata } from "next";
import { DM_Sans, Caveat } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], weight: ["400", "500"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: ["400"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.roomme.tech"), // absolute og:image URLs for link previews (roomme.tech redirects here)
  title: "RoomMe",
  description: "Meet the roommate before the lease. Habit-based roommate matching for NYC.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dmSans.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
