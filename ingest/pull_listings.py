# /// script
# requires-python = ">=3.11"
# dependencies = ["psycopg[binary]>=3.2"]
# ///
"""Pull NYC rentals from SearchApi's Zillow engine into Tiger Data.

Every API response is cached in data/raw/<tag>/ (gitignored), so re-running
never re-spends a request; loading always rebuilds from the whole cache.

  uv run ingest/pull_listings.py                       # load cache only (0 requests)
  uv run ingest/pull_listings.py --max-requests 20     # fetch page 1 of every area, then load
  uv run ingest/pull_listings.py --max-requests 60 --max-pages 4
  uv run ingest/pull_listings.py --tag sun-06 --max-pages 1 --max-requests 5 --areas Astoria Bushwick
  uv run ingest/pull_listings.py --selftest            # parser checks, no network/DB
"""
import argparse
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
API = "https://www.searchapi.io/api/v1/search"
BEDS_MIN = 2
RENT_MAX = 7000  # whole-apartment rent; ~$2.3k/room for a 3BR

# Newcomer/student-friendly areas. Value = the query Zillow resolves.
AREAS = {
    "Morningside Heights": "Morningside Heights, New York, NY",
    "Harlem": "Harlem, New York, NY",
    "Washington Heights": "Washington Heights, New York, NY",
    "Upper West Side": "Upper West Side, New York, NY",
    "Upper East Side": "Upper East Side, New York, NY",
    "East Village": "East Village, New York, NY",
    "Lower East Side": "Lower East Side, New York, NY",
    "Astoria": "Astoria, New York, NY",
    "Long Island City": "Long Island City, New York, NY",
    "Sunnyside": "Sunnyside, Queens, NY",
    "Ridgewood": "Ridgewood, Queens, NY",
    "Jackson Heights": "Jackson Heights, Queens, NY",
    "Williamsburg": "Williamsburg, Brooklyn, NY",
    "Greenpoint": "Greenpoint, Brooklyn, NY",
    "Bushwick": "Bushwick, Brooklyn, NY",
    "Bedford-Stuyvesant": "Bedford-Stuyvesant, Brooklyn, NY",
    "Crown Heights": "Crown Heights, Brooklyn, NY",
    "Prospect Heights": "Prospect Heights, Brooklyn, NY",
    "Flatbush": "Flatbush, Brooklyn, NY",
    "Sunset Park": "Sunset Park, Brooklyn, NY",
    "Mott Haven": "Mott Haven, Bronx, NY",
    "Fordham": "Fordham, Bronx, NY",
    "Kingsbridge": "Kingsbridge, Bronx, NY",
    "St. George": "St. George, Staten Island, NY",
}
# Outside NYC: only pulled with --near-nyc, and only if NYC alone is too thin.
NEAR_NYC = {
    "Jersey City": "Jersey City, NJ",
    "Hoboken": "Hoboken, NJ",
    "Union City": "Union City, NJ",
    "Yonkers": "Yonkers, NY",
}
ALL_AREAS = {**AREAS, **NEAR_NYC}

# ponytail: zip-prefix check is approximate (Manhattan/SI/Bronx 100-104, Queens/Brooklyn
# 111-114 + 116, Queens 11004-5; excludes Nassau 110xx/115xx). Swap in the full NYC zip list if edge cases show up.
NYC_ZIP3 = {"100", "101", "102", "103", "104", "111", "112", "113", "114", "116"}


def is_nyc_zip(z):
    z = str(z or "")
    return len(z) == 5 and z.isdigit() and (z[:3] in NYC_ZIP3 or z in {"11004", "11005"})


def slug(area):
    return re.sub(r"[^a-z0-9]+", "-", area.lower()).strip("-")


def load_env():
    env = ROOT / ".env"
    for line in env.read_text().splitlines() if env.exists() else []:
        k, sep, v = line.partition("=")
        if sep and k.strip() and not k.startswith("#"):
            os.environ.setdefault(k.strip(), v.strip())


def dollars(s):
    digits = re.sub(r"[^\d]", "", str(s or "").split(".")[0])
    return int(digits) if digits else None


# ---------- fetch ----------

def fetch(area, page, tag, key):
    params = {"engine": "zillow", "q": ALL_AREAS[area], "listing_status": "for_rent",
              "beds_min": BEDS_MIN, "rent_max": RENT_MAX, "page": page, "api_key": key}
    with urllib.request.urlopen(f"{API}?{urllib.parse.urlencode(params)}", timeout=60) as r:
        data = json.load(r)
    if data.get("error"):
        raise RuntimeError(f"{area} p{page}: {data['error']}")
    data["_area"] = area  # which of our areas this page belongs to
    out = RAW / tag / f"{slug(area)}_p{page}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data))
    zillow_path = urllib.parse.urlparse(data["search_metadata"].get("request_url", "")).path
    print(f"  fetched {area} p{page}: {len(data.get('properties', []))} props, "
          f"{data.get('pagination', {}).get('total_pages')} pages  [{zillow_path}]")
    return data


def total_pages(area, tag):
    p1 = RAW / tag / f"{slug(area)}_p1.json"
    return json.loads(p1.read_text()).get("pagination", {}).get("total_pages", 1) if p1.exists() else None


def fetch_all(areas, tag, max_pages, budget, key):
    """Breadth-first: page 1 of every area before any page 2, so a small budget still covers all areas."""
    used = 0
    for page in range(1, max_pages + 1):
        for area in areas:
            if (RAW / tag / f"{slug(area)}_p{page}.json").exists():
                continue
            if page > 1 and (total_pages(area, tag) or 0) < page:
                continue
            if used >= budget:
                return used
            fetch(area, page, tag, key)
            used += 1
    return used


# ---------- parse ----------

def parse(data):
    """SearchApi Zillow response -> (fetched_at, [listing rows]). Buildings expand to one row per unit type."""
    area = data["_area"]
    fetched_at = data["search_metadata"]["created_at"]
    rows = []
    for p in data.get("properties", []):
        if not (p.get("zpid") and p.get("address") and p.get("link")):
            continue
        if area not in NEAR_NYC and not is_nyc_zip(p.get("zipcode")):
            continue  # NYC areas keep NYC listings only, even if Zillow's search drifts
        base = {
            "neighborhood": area, "address": p["address"], "street": p.get("street"),
            "unit": p.get("unit"), "city": p.get("city"), "zipcode": p.get("zipcode"),
            "home_type": p.get("home_type"), "broker": p.get("broker"),
            "latitude": p.get("latitude"), "longitude": p.get("longitude"),
            "link": p["link"], "thumbnail": p.get("thumbnail"),
            "images": json.dumps(p.get("images") or []),
            "availability_date": (p.get("availability_date") or "")[:10] or None,
            "days_on_zillow": p.get("days_on_zillow"),
        }
        if p.get("units"):  # building: "from $X" per bed count
            for u in p["units"]:
                beds, price = dollars(u.get("beds")), dollars(u.get("price"))
                if beds is not None and beds >= BEDS_MIN and price:
                    rows.append({**base, "zpid": f"{p['zpid']}:{beds}br", "beds": beds, "baths": None,
                                 "sqft": None, "price": price, "is_building": True,
                                 "room_for_rent": bool(u.get("room_for_rent"))})
        else:
            price = int(p["extracted_price"]) if p.get("extracted_price") else dollars(p.get("price"))
            if price:
                rows.append({**base, "zpid": str(p["zpid"]), "beds": p.get("beds"), "baths": p.get("baths"),
                             "sqft": p.get("sqft"), "price": price, "is_building": False,
                             "room_for_rent": False})
    return fetched_at, [r for r in rows if r["price"] <= RENT_MAX]


# ---------- load ----------

UPSERT = """
insert into listings (zpid, neighborhood, address, street, unit, city, zipcode, beds, baths, sqft, price,
  is_building, room_for_rent, home_type, broker, availability_date, latitude, longitude, link, thumbnail,
  images, first_seen, last_seen)
values (%(zpid)s, %(neighborhood)s, %(address)s, %(street)s, %(unit)s, %(city)s, %(zipcode)s, %(beds)s,
  %(baths)s, %(sqft)s, %(price)s, %(is_building)s, %(room_for_rent)s, %(home_type)s, %(broker)s,
  %(availability_date)s, %(latitude)s, %(longitude)s, %(link)s, %(thumbnail)s, %(images)s::jsonb,
  %(t)s, %(t)s)
on conflict (zpid) do update set
  price = excluded.price, beds = excluded.beds, baths = excluded.baths, sqft = excluded.sqft,
  broker = excluded.broker, availability_date = excluded.availability_date, link = excluded.link,
  thumbnail = excluded.thumbnail, images = excluded.images, last_seen = excluded.last_seen,
  first_seen = least(listings.first_seen, excluded.first_seen)
where listings.last_seen <= excluded.last_seen
"""
SNAPSHOT = """
insert into listing_snapshots (time, zpid, neighborhood, beds, price, days_on_zillow)
values (%(t)s, %(zpid)s, %(neighborhood)s, %(beds)s, %(price)s, %(days_on_zillow)s)
on conflict do nothing
"""


def load(conn):
    pages = []
    for f in RAW.glob("*/*.json"):
        t, rows = parse(json.loads(f.read_text()))
        pages.append((t, rows))
    pages.sort(key=lambda x: x[0])  # oldest first, so the newest pull wins the upsert
    n_rows = 0
    with conn.transaction(), conn.cursor() as cur:
        for t, rows in pages:
            for r in rows:
                cur.execute(UPSERT, {**r, "t": t})
                cur.execute(SNAPSHOT, {**r, "t": t})
                n_rows += 1
    conn.execute("call refresh_continuous_aggregate('rent_by_area_daily', null, null)")
    return len(pages), n_rows


# ---------- self-check ----------

def selftest():
    z = {"zipcode": "11105"}
    data = {"_area": "Astoria", "search_metadata": {"created_at": "2026-09-26T22:44:52Z"}, "properties": [
        {"zpid": "1", "address": "a", "link": "l", "extracted_price": 4000.0, "beds": 3, **z},
        {"zpid": "2", "address": "b", "link": "l", "price": "$9,500/mo", "beds": 3, **z},  # over RENT_MAX
        {"zpid": "3", "address": "c", "link": "l", **z, "units": [
            {"price": "$5,481+", "beds": "2"}, {"price": "$4,495+", "beds": "1"}]},        # 1br unit dropped
        {"zpid": "4", "address": "d", "price": "$3,000", **z},                             # no link
        {"zpid": "5", "address": "e", "link": "l", "price": "$3,000", "beds": 2, "zipcode": "11550"},  # Nassau
        {"zpid": "6", "address": "f", "link": "l", "price": "$3,000", "beds": 2},          # no zip
    ]}
    t, rows = parse(data)
    got = {r["zpid"]: (r["price"], r["beds"], r["is_building"]) for r in rows}
    assert t == "2026-09-26T22:44:52Z"
    assert got == {"1": (4000, 3, False), "3:2br": (5481, 2, True)}, got
    assert dollars("$1,234.56") == 1234 and dollars(None) is None and dollars("Studio") is None
    assert slug("Bedford-Stuyvesant") == "bedford-stuyvesant"
    assert all(map(is_nyc_zip, ["10027", "10451", "10301", "11385", "11004"]))
    assert not any(map(is_nyc_zip, ["11550", "11001", "07302", "10701", "", None]))
    nj = {"_area": "Jersey City", "search_metadata": {"created_at": "t"},
          "properties": [{"zpid": "7", "address": "g", "link": "l", "price": "$3,000", "beds": 2, "zipcode": "07302"}]}
    assert [r["zpid"] for r in parse(nj)[1]] == ["7"]  # near-NYC areas skip the NYC guard
    print("selftest ok")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--max-requests", type=int, default=0, help="SearchApi requests to spend (default 0 = cache only)")
    ap.add_argument("--max-pages", type=int, default=1, help="pages per area (41 listings each)")
    ap.add_argument("--tag", default="initial", help="cache folder; use a new tag for a fresh price snapshot")
    ap.add_argument("--areas", nargs="*", choices=list(ALL_AREAS), metavar="AREA",
                    help="default: all NYC areas (+ near-NYC areas with --near-nyc)")
    ap.add_argument("--near-nyc", action="store_true", help="also pull areas outside NYC (fallback only)")
    ap.add_argument("--selftest", action="store_true")
    a = ap.parse_args()
    if a.selftest:
        return selftest()

    areas = a.areas or list(AREAS) + (list(NEAR_NYC) if a.near_nyc else [])
    load_env()
    if a.max_requests:
        key = os.environ.get("SEARCHAPI_KEY") or sys.exit("SEARCHAPI_KEY missing from .env")
        used = fetch_all(areas, a.tag, a.max_pages, a.max_requests, key)
        print(f"SearchApi requests used this run: {used}")

    import psycopg
    url = os.environ.get("DATABASE_URL") or sys.exit("DATABASE_URL missing from .env")
    with psycopg.connect(url, autocommit=True) as conn:
        n_pages, n_rows = load(conn)
        n_listings = conn.execute("select count(*) from listings").fetchone()[0]
    print(f"loaded {n_rows} rows from {n_pages} cached pages -> {n_listings} listings in Tiger Data "
          f"({datetime.now():%H:%M})")


if __name__ == "__main__":
    main()
