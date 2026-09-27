-- Roomme schema (Tiger Data: Postgres + TimescaleDB). Idempotent: safe to re-run.
-- Apply: tiger db query bj9teo40nn -f db/schema.sql

-- Listings: latest known state of each Zillow rental (from SearchApi).
create table if not exists listings (
  zpid              text primary key,          -- Zillow id; building units are "<zpid>:<beds>br"
  neighborhood      text not null,             -- our search area, e.g. 'Astoria'
  address           text not null,
  street            text,
  unit              text,
  city              text,
  zipcode           text,
  beds              int,
  baths             numeric,
  sqft              int,
  price             int,                       -- monthly rent, USD (latest)
  is_building       boolean not null default false,  -- true = "from $X" building unit price
  room_for_rent     boolean not null default false,
  home_type         text,
  broker            text,
  availability_date date,
  latitude          double precision,
  longitude         double precision,
  link              text not null,             -- always send users back to the source
  thumbnail         text,
  images            jsonb not null default '[]',
  first_seen        timestamptz not null default now(),
  last_seen         timestamptz not null default now()
);
create index if not exists listings_area_beds on listings (neighborhood, beds);

-- Price history: one row per listing per pull. neighborhood/beds are copied in
-- so the continuous aggregate below needs no join.
create table if not exists listing_snapshots (
  time            timestamptz not null,
  zpid            text not null references listings (zpid),
  neighborhood    text not null,
  beds            int,
  price           int not null,
  days_on_zillow  int,
  primary key (zpid, time)
);
select create_hypertable('listing_snapshots', by_range('time', interval '7 days'), if_not_exists => true);

-- Median rent per area and bed count per day -> "fair price?" badge and scam flag.
create materialized view if not exists rent_by_area_daily
with (timescaledb.continuous, timescaledb.materialized_only = false) as
select time_bucket(interval '1 day', time) as day,
       neighborhood,
       beds,
       percentile_cont(0.5) within group (order by price) as median_rent,
       count(*) as n
from listing_snapshots
group by 1, 2, 3
with no data;

-- Real-time aggregation (materialized_only = false) covers anything not yet refreshed.
-- ponytail: offsets sized for a weekend demo; widen start_offset if history grows.
select add_continuous_aggregate_policy('rent_by_area_daily',
  start_offset => interval '30 days', end_offset => interval '1 hour',
  schedule_interval => interval '1 hour', if_not_exists => true);

-- People. Answers are jsonb until the question set is frozen (docs/PROJECT.md §5).
create table if not exists profiles (
  id              bigint generated always as identity primary key,
  name            text not null,
  phone           text unique,                 -- iMessage identity for the Photon agent; never shown to others
  is_synthetic    boolean not null default false,
  budget_max      int,                         -- per-person monthly rent
  move_in         date,
  lease_months    int,
  neighborhoods   text[] not null default '{}',
  dealbreakers    jsonb not null default '{}', -- smoking, pets, allergies...
  quick_answers   jsonb not null default '{}', -- the 10 quick-tap answers
  open_transcript text,                        -- voice-interview transcript, user-approved
  signals         jsonb not null default '{}', -- Gemini-extracted signals + contradictions
  saved_listings  text[] not null default '{}',
  created_at      timestamptz not null default now()
);

-- A pair. score is deterministic (never from the LLM); status walks the funnel.
create table if not exists matches (
  id          bigint generated always as identity primary key,
  profile_a   bigint not null references profiles (id),
  profile_b   bigint not null references profiles (id),
  score       numeric not null,
  reasons     jsonb not null default '{}',       -- click / clash reasons, Gemini card copy
  status      text not null default 'suggested'
              check (status in ('suggested', 'shortlisted', 'mutual', 'met', 'locked', 'moved_in', 'closed')),
  listing     text references listings (zpid),   -- the listing the pair locks
  created_at  timestamptz not null default now(),
  check (profile_a < profile_b),
  unique (profile_a, profile_b)
);

-- Household life after move-in (a household = a moved-in match). Feeds the "house health" chart.
create table if not exists house_events (
  time      timestamptz not null default now(),
  match_id  bigint not null references matches (id),
  actor     bigint references profiles (id),
  type      text not null,                      -- chore_done, reminder_sent, guest_notice, ...
  payload   jsonb not null default '{}'
);
select create_hypertable('house_events', by_range('time', interval '7 days'), if_not_exists => true);
create index if not exists house_events_match on house_events (match_id, time desc);
