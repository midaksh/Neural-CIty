#!/usr/bin/env python3
"""
Process OSM signals-and-signs CSVs into normalized 0–100 safety infrastructure scores.

Metrics:
  1. per_100k = (total_infrastructure / population) * 100_000
  2. signals_per_km2 = traffic_signal_count / area_km2

Bands (same as Neural City public interpretation):
  0–35   → poor
  35–65  → manageable
  65+    → good
"""

from __future__ import annotations

import csv
import json
import glob
from dataclasses import dataclass, asdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW_SIGNALS = ROOT / "data/raw/safety/signals-and-signs"
POPULATION_CSV = ROOT / "data/raw/population-data.csv"
AREA_CSV = ROOT / "data/raw/india_cities_area.csv"
OUT_JSON = ROOT / "data/processed/signals_scores.json"
PUBLIC_JSON = ROOT / "public/data/signals_scores.json"

# Folder slug → canonical city name (matches Neural City + reference CSVs)
FOLDER_TO_CITY: dict[str, str] = {
    "blr": "Bengaluru",
    "ahm": "Ahmedabad",
    "gur": "Gurgaon",
    "vizag": "Vizag",
    "lucknow": "Lucknow",
    "hyd": "Hyderabad",
    "indore": "Indore",
    "delhi": "NCT of Delhi",
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

# population-data.csv name → canonical city
POPULATION_ALIASES: dict[str, str] = {
    "Bangalore": "Bengaluru",
    "Delhi": "NCT of Delhi",
    "Visakhapatnam[4]": "Vizag",
    "Gurgaon": "Gurgaon",
}


@dataclass
class InfraCounts:
    traffic_signals: int = 0
    stop_signs: int = 0
    crossings: int = 0
    traffic_calming: int = 0
    total_infrastructure: int = 0


def parse_int(value: str) -> int:
    cleaned = value.replace(",", "").replace('"', "").strip()
    if not cleaned or cleaned in {"―", "–", "-", "—"}:
        return 0
    return int(float(cleaned))


def in_india(lat: str, lon: str) -> bool:
    try:
        la, lo = float(lat), float(lon)
        return 6.0 <= la <= 37.0 and 68.0 <= lo <= 98.0
    except (TypeError, ValueError):
        return False


def is_traffic_signal(row: dict[str, str]) -> bool:
    if (row.get("highway") or "").strip() == "traffic_signals":
        return True
    return bool((row.get("traffic_signals") or "").strip())


def is_stop_sign(row: dict[str, str]) -> bool:
    return (row.get("highway") or "").strip() == "stop"


def is_crossing(row: dict[str, str]) -> bool:
    if (row.get("highway") or "").strip() == "crossing":
        return True
    return bool((row.get("crossing") or "").strip())


def is_traffic_calming(row: dict[str, str]) -> bool:
    return bool((row.get("traffic_calming") or "").strip())


def count_infrastructure(rows: list[dict[str, str]]) -> InfraCounts:
    signals = stops = crossings = calming = 0

    for row in rows:
        sig = is_traffic_signal(row)
        stop = is_stop_sign(row)
        cross = is_crossing(row)
        calm = is_traffic_calming(row)

        if sig:
            signals += 1
        if stop:
            stops += 1
        if cross:
            crossings += 1
        if calm:
            calming += 1

    # Total unique safety-related assets (a node can contribute multiple types)
    total = 0
    for row in rows:
        if is_traffic_signal(row) or is_stop_sign(row) or is_crossing(row) or is_traffic_calming(row):
            total += 1

    return InfraCounts(
        traffic_signals=signals,
        stop_signs=stops,
        crossings=crossings,
        traffic_calming=calming,
        total_infrastructure=total,
    )


def load_population() -> dict[str, int]:
    pop: dict[str, int] = {}
    with POPULATION_CSV.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            name = row["City"].strip()
            canonical = POPULATION_ALIASES.get(name, name)
            if canonical in CITY_TO_ID:
                pop[canonical] = parse_int(row["Population(2011)"])
    return pop


def load_area() -> dict[str, float]:
    area: dict[str, float] = {}
    with AREA_CSV.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            area[row["City"].strip()] = float(row["Area_km2"])
    return area


def load_city_rows(folder: str) -> list[dict[str, str]]:
    pattern = RAW_SIGNALS / folder / "*.csv"
    files = glob.glob(str(pattern))
    if not files:
        raise FileNotFoundError(f"No CSV found for folder {folder}")
    with open(files[0], newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    return [r for r in rows if in_india(r.get("@lat", ""), r.get("@lon", ""))]


def normalize_min_max(values: dict[str, float]) -> dict[str, float]:
    if not values:
        return {}
    vmin = min(values.values())
    vmax = max(values.values())
    if vmax == vmin:
        return {k: 50.0 for k in values}
    return {k: round(((v - vmin) / (vmax - vmin)) * 100, 2) for k, v in values.items()}


def score_band(score: float) -> str:
    if score <= 35:
        return "poor"
    if score <= 65:
        return "manageable"
    return "good"


def main() -> None:
    population = load_population()
    area = load_area()

    raw_records: list[dict] = []

    for folder, city_name in FOLDER_TO_CITY.items():
        rows = load_city_rows(folder)
        counts = count_infrastructure(rows)
        pop = population[city_name]
        km2 = area[city_name]

        per_100k = (counts.total_infrastructure / pop) * 100_000
        signals_per_km2 = counts.traffic_signals / km2

        raw_records.append(
            {
                "city_id": CITY_TO_ID[city_name],
                "city_name": city_name,
                "source_folder": folder,
                "osm_nodes_in_india": len(rows),
                "population_2011": pop,
                "area_km2": km2,
                "counts": asdict(counts),
                "raw_metrics": {
                    "infrastructure_per_100k_population": round(per_100k, 4),
                    "traffic_signals_per_km2": round(signals_per_km2, 4),
                },
            }
        )

    per_capita_raw = {
        r["city_id"]: r["raw_metrics"]["infrastructure_per_100k_population"] for r in raw_records
    }
    density_raw = {
        r["city_id"]: r["raw_metrics"]["traffic_signals_per_km2"] for r in raw_records
    }

    per_capita_scores = normalize_min_max(per_capita_raw)
    density_scores = normalize_min_max(density_raw)

    for record in raw_records:
        cid = record["city_id"]
        pc = per_capita_scores[cid]
        dn = density_scores[cid]
        composite = round((pc + dn) / 2, 2)

        record["normalized_scores"] = {
            "per_capita_score": pc,
            "signal_density_score": dn,
            "composite_score": composite,
        }
        record["bands"] = {
            "per_capita": score_band(pc),
            "signal_density": score_band(dn),
            "composite": score_band(composite),
        }

    raw_records.sort(key=lambda r: r["normalized_scores"]["composite_score"], reverse=True)
    for i, record in enumerate(raw_records, start=1):
        record["safety_rank"] = i

    output = {
        "metadata": {
            "sector": "Safety — Signals & Signs (OpenStreetMap)",
            "source": "data/raw/safety/signals-and-signs/*/interpreter.csv",
            "population_source": "data/raw/population-data.csv (Census 2011)",
            "area_source": "data/raw/india_cities_area.csv",
            "metrics": {
                "infrastructure_per_100k": "(traffic_signals + stops + crossings + calming) / population × 100,000",
                "traffic_signals_per_km2": "traffic_signal_count / city_area_km²",
            },
            "normalization": "Min–max scaled to 0–100 across 11 cities; higher = better coverage",
            "bands": {"poor": "0–35", "manageable": "35–65", "good": "65+"},
            "cities_processed": len(raw_records),
            "note": "Jhansi excluded — no OSM signals dataset provided",
        },
        "cities": raw_records,
    }

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_JSON.parent.mkdir(parents=True, exist_ok=True)

    with OUT_JSON.open("w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)
    with PUBLIC_JSON.open("w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

    print(f"Wrote {OUT_JSON}")
    print(f"Wrote {PUBLIC_JSON}")
    print("\nComposite rankings:")
    for r in raw_records:
        s = r["normalized_scores"]["composite_score"]
        b = r["bands"]["composite"]
        print(
            f"  #{r['safety_rank']:2} {r['city_name']:<14} "
            f"composite={s:5.1f} ({b})  "
            f"per100k={r['raw_metrics']['infrastructure_per_100k_population']:.2f}  "
            f"sig/km²={r['raw_metrics']['traffic_signals_per_km2']:.2f}"
        )


if __name__ == "__main__":
    main()
