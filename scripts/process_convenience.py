#!/usr/bin/env python3
"""
Process OSM public-transport CSVs into weighted catchment convenience scores.

Fair-trade dual exposure model:
  1. Spatial coverage  = weighted_stops / city_area_km²
     (transit catchment packed into the city's land area — favours dense mesh)

  2. Resident access   = weighted_stops / population × 100,000
     (weighted stops per lakh residents — fair to sprawled cities like Gurgaon)

  weighted_stops = bus×1.0 + railway×6.25 + metro×4.0
  composite_score = spatial_score×0.55 + access_score×0.45

Both sub-scores sqrt-compressed and min–max scaled to 15–100 before blending.
"""

from __future__ import annotations

import csv
import glob
import json
import math
from dataclasses import asdict, dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW_CONVENIENCE = ROOT / "data/raw/convenience"
AREA_CSV = ROOT / "data/raw/india_cities_area.csv"
POPULATION_CSV = ROOT / "data/raw/population-data.csv"
OUT_JSON = ROOT / "data/processed/convenience_scores.json"
PUBLIC_JSON = ROOT / "public/data/convenience_scores.json"

FOLDER_TO_CITY: dict[str, str] = {
    "blr": "Bengaluru",
    "ahm": "Ahmedabad",
    "gur": "Gurgaon",
    "vizag": "Vizag",
    "lucknow": "Lucknow",
    "hyd": "Hyderabad",
    "indore": "Indore",
    "del": "NCT of Delhi",
    "chennai": "Chennai",
    "surat": "Surat",
    "mumbai": "Mumbai",
}

CITY_TO_ID: dict[str, str] = {
    "Bengaluru": "bengaluru",
    "Ahmedabad": "ahmedabad",
    "Gurgaon": "gurgaon",
    "Vizag": "vizag",
    "Lucknow": "lucknow",
    "Hyderabad": "hyderabad",
    "Indore": "indore",
    "NCT of Delhi": "delhi",
    "Chennai": "chennai",
    "Surat": "surat",
    "Mumbai": "mumbai",
}

POPULATION_ALIASES: dict[str, str] = {
    "Bangalore": "Bengaluru",
    "Delhi": "NCT of Delhi",
    "Visakhapatnam[4]": "Vizag",
}

BUS_WEIGHT = 1.0
RAILWAY_WEIGHT = 6.25
METRO_WEIGHT = 4.0
SPATIAL_BLEND = 0.55
ACCESS_BLEND = 0.45
SCORE_FLOOR = 15.0

METRO_STATION_TAGS = frozenset({"subway", "metro", "monorail"})
RAILWAY_TAGS = frozenset({"station", "halt"})


@dataclass
class StopCounts:
    bus: int = 0
    railway: int = 0
    metro: int = 0
    unclassified: int = 0

    @property
    def weighted_stops(self) -> float:
        return (
            self.bus * BUS_WEIGHT
            + self.railway * RAILWAY_WEIGHT
            + self.metro * METRO_WEIGHT
        )


def parse_int(value: str) -> int:
    cleaned = value.replace(",", "").replace('"', "").strip()
    return int(float(cleaned))


def in_india(lat: str, lon: str) -> bool:
    try:
        la, lo = float(lat), float(lon)
        return 6.0 <= la <= 37.0 and 68.0 <= lo <= 98.0
    except (TypeError, ValueError):
        return False


def classify_stop(row: dict[str, str]) -> str | None:
    station = (row.get("station") or "").strip().lower()
    railway = (row.get("railway") or "").strip().lower()
    highway = (row.get("highway") or "").strip().lower()

    if station in METRO_STATION_TAGS:
        return "metro"
    if railway in RAILWAY_TAGS:
        return "railway"
    if railway == "stop":
        return "metro"
    if highway == "bus_stop":
        return "bus"
    return None


def count_stops(rows: list[dict[str, str]]) -> StopCounts:
    counts = StopCounts()
    for row in rows:
        kind = classify_stop(row)
        if kind == "bus":
            counts.bus += 1
        elif kind == "railway":
            counts.railway += 1
        elif kind == "metro":
            counts.metro += 1
        else:
            counts.unclassified += 1
    return counts


def load_area() -> dict[str, float]:
    area: dict[str, float] = {}
    with AREA_CSV.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            area[row["City"].strip()] = float(row["Area_km2"])
    return area


def load_population() -> dict[str, int]:
    pop: dict[str, int] = {}
    with POPULATION_CSV.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            name = row["City"].strip()
            canonical = POPULATION_ALIASES.get(name, name)
            if canonical in CITY_TO_ID:
                pop[canonical] = parse_int(row["Population(2011)"])
    return pop


def load_city_rows(folder: str) -> list[dict[str, str]]:
    pattern = RAW_CONVENIENCE / folder / "*.csv"
    files = glob.glob(str(pattern))
    if not files:
        raise FileNotFoundError(f"No CSV found for folder {folder}")
    with open(files[0], newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    return [r for r in rows if in_india(r.get("@lat", ""), r.get("@lon", ""))]


def normalize_sqrt_min_max(
    values: dict[str, float], floor: float = SCORE_FLOOR
) -> dict[str, float]:
    compressed = {k: math.sqrt(max(v, 0.0)) for k, v in values.items()}
    vmin = min(compressed.values())
    vmax = max(compressed.values())
    if vmax == vmin:
        return {k: 50.0 for k in compressed}
    span = 100.0 - floor
    return {
        k: round(floor + (v - vmin) / (vmax - vmin) * span, 2)
        for k, v in compressed.items()
    }


def score_band(score: float) -> str:
    if score <= 35:
        return "poor"
    if score <= 65:
        return "manageable"
    return "good"


def main() -> None:
    area = load_area()
    population = load_population()
    raw_records: list[dict] = []

    for folder, city_name in FOLDER_TO_CITY.items():
        rows = load_city_rows(folder)
        counts = count_stops(rows)
        km2 = area[city_name]
        pop = population[city_name]
        weighted = counts.weighted_stops
        spatial = weighted / km2
        access = (weighted / pop) * 100_000

        raw_records.append(
            {
                "city_id": CITY_TO_ID[city_name],
                "city_name": city_name,
                "source_folder": folder,
                "osm_nodes_in_india": len(rows),
                "area_km2": km2,
                "population_2011": pop,
                "counts": asdict(counts),
                "raw_metrics": {
                    "weighted_stops": round(weighted, 2),
                    "coverage_density": round(spatial, 4),
                    "access_per_100k": round(access, 4),
                },
            }
        )

    spatial_raw = {
        r["city_id"]: r["raw_metrics"]["coverage_density"] for r in raw_records
    }
    access_raw = {r["city_id"]: r["raw_metrics"]["access_per_100k"] for r in raw_records}

    spatial_scores = normalize_sqrt_min_max(spatial_raw)
    access_scores = normalize_sqrt_min_max(access_raw)

    for record in raw_records:
        cid = record["city_id"]
        spatial = spatial_scores[cid]
        access = access_scores[cid]
        composite = round(spatial * SPATIAL_BLEND + access * ACCESS_BLEND, 2)

        record["normalized_scores"] = {
            "spatial_score": spatial,
            "access_score": access,
            "composite_score": composite,
        }
        record["bands"] = {
            "spatial": score_band(spatial),
            "access": score_band(access),
            "composite": score_band(composite),
        }

    raw_records.sort(
        key=lambda r: r["normalized_scores"]["composite_score"], reverse=True
    )
    for i, record in enumerate(raw_records, start=1):
        record["convenience_rank"] = i
        record["band"] = record["bands"]["composite"]

    output = {
        "metadata": {
            "sector": "Convenience — Public Transport (OpenStreetMap)",
            "source": "data/raw/convenience/*/interpreter.csv",
            "area_source": "data/raw/india_cities_area.csv",
            "population_source": "data/raw/population-data.csv (Census 2011)",
            "weights": {
                "bus": f"{BUS_WEIGHT} (400m catchment baseline)",
                "railway": f"{RAILWAY_WEIGHT} (1000m catchment, r² ratio 6.25)",
                "metro": f"{METRO_WEIGHT} (800m catchment, r² ratio 4.0)",
            },
            "formula": {
                "weighted_stops": "bus×1.0 + railway×6.25 + metro×4.0",
                "coverage_density": "weighted_stops / city_area_km²",
                "access_per_100k": "weighted_stops / population × 100,000",
                "composite": (
                    f"spatial_score×{SPATIAL_BLEND} + access_score×{ACCESS_BLEND} "
                    "(fair trade: land coverage vs resident access)"
                ),
            },
            "classification": {
                "bus": "highway=bus_stop",
                "railway": "railway=station|halt",
                "metro": "station=subway|metro|monorail OR railway=stop",
            },
            "normalization": (
                "Sqrt-compress each raw metric, scale to 15–100, then blend; higher = better"
            ),
            "bands": {"poor": "0–35", "manageable": "35–65", "good": "65+"},
            "cities_processed": len(raw_records),
        },
        "cities": raw_records,
    }

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_JSON.parent.mkdir(parents=True, exist_ok=True)
    for path in (OUT_JSON, PUBLIC_JSON):
        with path.open("w", encoding="utf-8") as f:
            json.dump(output, f, indent=2)

    print(f"Wrote {OUT_JSON}")
    print(f"Wrote {PUBLIC_JSON}")
    print("\nConvenience rankings (composite = 55% spatial + 45% access):")
    for r in raw_records:
        ns = r["normalized_scores"]
        rm = r["raw_metrics"]
        print(
            f"  #{r['convenience_rank']:2} {r['city_name']:<14} "
            f"composite={ns['composite_score']:5.1f} ({r['band']})  "
            f"spatial={ns['spatial_score']:5.1f} access={ns['access_score']:5.1f}  "
            f"dens={rm['coverage_density']:.2f} acc/100k={rm['access_per_100k']:.1f}"
        )


if __name__ == "__main__":
    main()
