// Shared by server pages and client screens. Fixed time zones so SSR and hydration agree.
export const usd = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

export const seenOn = (iso: string) => // non-breaking space: "Sep 26" never splits across lines
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" }).replace(" ", "\u00a0");

// 'YYYY-MM-DD' (a calendar date, no time zone) → "Oct 15"
export const day = (ymd: string) =>
  new Date(ymd + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export const listingHref = (zpid: string) => "/listings/" + encodeURIComponent(zpid);

// "2827 46th St APT 3L, Astoria, NY 11103" → "2827 46th St APT 3L"
export const street = (address: string) => address.split(",")[0];

export const bedsLabel = (beds: number) => (beds === 0 ? "Studio" : `${beds} BR`);

// ponytail: static approximate rates for the display-only currency toggle; swap for a daily rate if it ever matters.
export const RATES: Record<string, number> = { USD: 1, INR: 88, CNY: 7.1, KRW: 1390, EUR: 0.86 };
export const money = (usdAmount: number, cur = "USD") =>
  cur === "USD"
    ? usd(usdAmount)
    : new Intl.NumberFormat("en-US", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(usdAmount * RATES[cur]);

// score.ts answer text for HabitBar's "You {you} · {name} {them}": lowercase the first letter (not the pronoun "I"),
// and glue en dashes with word joiners so "23:00–00:00" or "1–2/month" never wraps mid-range.
export const said = (s: string) =>
  s.split(", ").map((x) => (/^I\b/.test(x) ? x : x.charAt(0).toLowerCase() + x.slice(1))).join(", ").replace(/–/g, "\u2060–\u2060");
