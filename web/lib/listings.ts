import 'server-only';
import { query } from './db';

export type Trust = 'fair' | 'above' | 'check' | null;

export interface Listing {
  zpid: string;
  neighborhood: string;
  address: string;
  beds: number;
  baths: number | null;
  sqft: number | null;
  price: number; // whole-unit monthly rent (for isBuilding: the "from" price)
  perRoom: number; // round(price / greatest(beds, 1))
  isBuilding: boolean; // UI prefixes "from"
  availabilityDate: string | null; // 'YYYY-MM-DD'
  firstSeen: string; // ISO
  lastSeen: string; // ISO
  link: string;
  broker: string | null;
  homeType: string | null;
  medianRent: number | null;
  medianPerRoom: number | null;
  medianN: number | null;
  trust: Trust;
  images: string[]; // only https://photos.zillowstatic.com/ urls
}

export interface ListingFilters {
  neighborhood?: string;
  beds?: '2' | '3+';
  minPerRoom?: number;
  maxPerRoom?: number;
  fairOnly?: boolean;
  page?: number; // 1-based
  pageSize?: number; // default 24
}

// Every listing query starts here: latest median per (area, beds) from the
// continuous aggregate, joined onto listings and shaped exactly as `Listing`.
// `thumbnail` is deliberately never selected (some rows hold keyed Maps URLs).
const LISTING_CTE = `
with med as (
  select distinct on (neighborhood, beds) neighborhood, beds, median_rent, n
  from rent_by_area_daily
  order by neighborhood, beds, day desc
),
rows as (
  select l.zpid, l.neighborhood, l.address,
         l.beds::int as beds, l.baths::float8 as baths, l.sqft::int as sqft,
         l.price::int as price,
         round(l.price::float8 / greatest(l.beds, 1))::int as "perRoom",
         l.is_building as "isBuilding",
         l.availability_date::text as "availabilityDate",
         to_json(l.first_seen) #>> '{}' as "firstSeen",
         to_json(l.last_seen) #>> '{}' as "lastSeen",
         l.link, l.broker, l.home_type as "homeType",
         case when m.n >= 3 then round(m.median_rent)::int end as "medianRent",
         case when m.n >= 3 then round(m.median_rent / greatest(l.beds, 1))::int end as "medianPerRoom",
         m.n::int as "medianN",
         case when m.median_rent is null or m.n < 3 then null
              when l.price <= 0.6 * m.median_rent then 'check'
              when l.price > 1.15 * m.median_rent then 'above'
              else 'fair' end as trust,
         coalesce((select jsonb_agg(u) from jsonb_array_elements_text(l.images) u
                   where u like 'https://photos.zillowstatic.com/%'), '[]'::jsonb) as images
  from listings l
  left join med m on m.neighborhood = l.neighborhood and m.beds = l.beds
)`;

export async function listListings(f: ListingFilters = {}): Promise<{ listings: Listing[]; total: number }> {
  const pageSize = Math.min(Math.max(1, f.pageSize ?? 24), 100);
  const page = Math.max(1, f.page ?? 1);
  const rows = await query<Listing & { total: number }>(
    `${LISTING_CTE}
     select r.*, count(*) over()::int as total
     from rows r
     where ($1::text is null or r.neighborhood = $1)
       and ($2::int is null or r.beds = $2)
       and ($3::int is null or r.beds >= $3)
       and ($4::int is null or r."perRoom" >= $4)
       and ($5::int is null or r."perRoom" <= $5)
       and (not $6::bool or r.trust = 'fair')
     order by (jsonb_array_length(r.images) > 0) desc, r."lastSeen" desc, r.zpid
     limit $7 offset $8`,
    [
      f.neighborhood ?? null,
      f.beds === '2' ? 2 : null,
      f.beds === '3+' ? 3 : null,
      f.minPerRoom ?? null,
      f.maxPerRoom ?? null,
      f.fairOnly ?? false,
      pageSize,
      (page - 1) * pageSize,
    ],
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- strip the window count off each row
  return { listings: rows.map(({ total, ...l }) => l), total: rows[0]?.total ?? 0 };
}

export async function getListing(zpid: string): Promise<Listing | null> {
  const rows = await query<Listing>(`${LISTING_CTE} select * from rows where zpid = $1`, [zpid]);
  return rows[0] ?? null;
}

export function getPriceHistory(zpid: string): Promise<{ time: string; price: number }[]> {
  return query(
    `select to_json(time) #>> '{}' as time, price::int as price
     from listing_snapshots where zpid = $1 order by time`,
    [zpid],
  );
}

export async function getListingStats(): Promise<{ listings: number; neighborhoods: number; lastSeen: string }> {
  const [row] = await query<{ listings: number; neighborhoods: number; lastSeen: string }>(
    `select count(*)::int as listings, count(distinct neighborhood)::int as neighborhoods,
            to_json(max(last_seen)) #>> '{}' as "lastSeen" from listings`,
  );
  return row;
}

// Ordered by listing count. `cover` is one listing in the area that has photos
// (a 'fair' one when possible) for the landing-page card; null if none has photos.
export function getNeighborhoods(): Promise<
  { neighborhood: string; count: number; medianPerRoom: number | null; cover: Listing | null }[]
> {
  return query(
    `${LISTING_CTE}
     select a.neighborhood, a.count, a."medianPerRoom",
            (select to_jsonb(r) from rows r
             where r.neighborhood = a.neighborhood and jsonb_array_length(r.images) > 0
             order by coalesce(r.trust = 'fair', false) desc, r."lastSeen" desc, r.zpid
             limit 1) as cover
     from (
       select neighborhood, count(*)::int as count,
              round(percentile_cont(0.5) within group (order by price::float8 / greatest(beds, 1)))::int as "medianPerRoom"
       from listings group by neighborhood
     ) a
     order by a.count desc, a.neighborhood`,
  );
}
