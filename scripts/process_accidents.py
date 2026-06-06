#!/usr/bin/env python3
"""
Process road-accident CSVs into harm-weighted, population-normalized safety scores.

Pipeline (per city, after annualization):
  1. harm_score = deaths×10 + injuries×3 + incidents×1
  2. danger_rate = harm_score / population × 100_000
  3. severity_idx = deaths / (deaths + injuries)
  4. raw_safety_score = danger_rate×0.65 + severity_idx×100×0.35
  5. compressed = sqrt(raw_safety_score)
  6. final_score = floor + (max − compressed) / (max − min) × (100 − floor)   [higher = safer]

Annualization:
  - Hyderabad: use 2025 Total row (full-year); monthly rows not scaled
  - Surat: average 2022 + 2023 columns (2-year snapshot → per-year)
  - All others: latest annual row as-is
"""

from __future__ import annotations

import csv
import json
import math
import statistics
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW_ACCIDENTS = ROOT / "data/raw/safety/accidents"
POPULATION_CSV = ROOT / "data/raw/population-data.csv"
OUT_JSON = ROOT / "data/processed/accidents_scores.json"
PUBLIC_JSON = ROOT / "public/data/accidents_scores.json"

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
    "Visakhapatnam": "Vizag",
}

MANY_CITIES_SKIP = {"Bangalore", "Chennai"}
MANY_CITIES_NAME = {
    "Ahmedabad": "Ahmedabad",
    "Indore": "Indore",
    "Lucknow": "Lucknow",
    "Visakhapatnam": "Vizag",
}

DEATH_WEIGHT = 10
INJURY_WEIGHT = 3
INCIDENT_WEIGHT = 1
DANGER_WEIGHT = 0.65
SEVERITY_WEIGHT = 0.35


@dataclass
class AnnualCounts:
    city_name: str
    city_id: str
    source: str
    data_year: int | str
    deaths: int
    injuries: int
    incidents: int
    annualization: str
    notes: str = ""


@dataclass
class ComputedMetrics:
    harm_score: float
    danger_rate: float
    severity_index: float
    raw_safety_score: float
    compressed_score: float
    final_score: float


def parse_int(value: str | None) -> int:
    if value is None:
        return 0
    cleaned = str(value).replace(",", "").replace('"', "").strip()
    if not cleaned or cleaned.upper() in {"NA", "N/A", "-", "—", ""}:
        return 0
    return int(float(cleaned))


def score_band(score: float) -> str:
    if score <= 35:
        return "poor"
    if score <= 65:
        return "manageable"
    return "good"


def load_population() -> dict[str, int]:
    pop: dict[str, int] = {}
    with POPULATION_CSV.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            name = row["City"].strip()
            canonical = POPULATION_ALIASES.get(name, name)
            if canonical in CITY_TO_ID:
                pop[canonical] = parse_int(row["Population(2011)"])
    return pop


def load_bengaluru() -> AnnualCounts:
    path = RAW_ACCIDENTS / "blr/aad98dbe-7451-4ab1-aa8a-8d5c1e46b9a7.csv"
    with path.open(newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    row = rows[-1]
    year = parse_int(row["Year"])
    return AnnualCounts(
        city_name="Bengaluru",
        city_id="bengaluru",
        source=str(path.relative_to(ROOT)),
        data_year=year,
        deaths=parse_int(row["Killed"]),
        injuries=parse_int(row["Non-Fatal Road Accidents"]),
        incidents=parse_int(row["Total"]),
        annualization="latest annual row",
    )


def load_mumbai() -> AnnualCounts:
    path = RAW_ACCIDENTS / "mumbai/Mumbai_Road_Safety_Annual_Report_Formatted.csv"
    with path.open(newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    row = rows[-1]
    year = parse_int(row["Year"])
    return AnnualCounts(
        city_name="Mumbai",
        city_id="mumbai",
        source=str(path.relative_to(ROOT)),
        data_year=year,
        deaths=parse_int(row["Killed"]),
        injuries=parse_int(row["Non-Fatal Road Accidents"]),
        incidents=parse_int(row["Total"]),
        annualization="latest annual row",
    )


def load_delhi() -> AnnualCounts:
    path = RAW_ACCIDENTS / "delhi/5e135450-0134-4718-ae14-1bbfb40eff01.csv"
    with path.open(newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    row = rows[-1]
    year = parse_int(row["Year"])
    crashes = parse_int(row["Road Crashes"])
    deaths = parse_int(row["Road Crash Fatalities"])
    fatal_crashes = parse_int(row["Fatal Road Crashes"])
    # Person-level injury count not published; non-fatal crashes as injury proxy
    injuries = max(0, crashes - fatal_crashes)
    return AnnualCounts(
        city_name="NCT of Delhi",
        city_id="delhi",
        source=str(path.relative_to(ROOT)),
        data_year=year,
        deaths=deaths,
        injuries=injuries,
        incidents=crashes,
        annualization="latest annual row",
        notes="Injuries estimated as non-fatal crashes (Road Crashes − Fatal Road Crashes)",
    )


def load_chennai() -> AnnualCounts:
    path = RAW_ACCIDENTS / "chennai/chennai-road-crashes-1998-2025.csv"
    with path.open(newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    row = rows[-1]
    year = parse_int(row["YEAR"])
    grievous = parse_int(row["Grievous Injurty - Injured"])
    minor = parse_int(row["Minor Injury - Injured"])
    deaths = parse_int(row["Fatal Killed"])
    return AnnualCounts(
        city_name="Chennai",
        city_id="chennai",
        source=str(path.relative_to(ROOT)),
        data_year=year,
        deaths=deaths,
        injuries=grievous + minor,
        incidents=parse_int(row["Total Accidents"]),
        annualization="latest annual row",
    )


def load_hyderabad() -> AnnualCounts:
    path = RAW_ACCIDENTS / "hyd/hyderabad_accidents_2025_2026.csv"
    lines = path.read_text(encoding="utf-8-sig").splitlines()
    total_line = next(l for l in lines if l.strip().startswith(",Total") or ",Total," in l)
    parts = [p.strip() for p in total_line.split(",")]
    # ,Total,...,2801,566,...3097,629,...305,56,...
    deaths = parse_int(parts[14])
    injuries = parse_int(parts[11])
    incidents = parse_int(parts[8])
    return AnnualCounts(
        city_name="Hyderabad",
        city_id="hyderabad",
        source=str(path.relative_to(ROOT)),
        data_year=2025,
        deaths=deaths,
        injuries=injuries,
        incidents=incidents,
        annualization="2025 Total row (full calendar year)",
        notes="2026 column is partial YTD — excluded",
    )


def load_gurgaon() -> AnnualCounts:
    path = RAW_ACCIDENTS / "gur/Gurugram_Crash_Report_Table8_Yearly_Trend_2017_2023.csv"
    with path.open(newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    year = "2023"
    by_metric = {r["Crash Data"].strip(): r for r in rows}
    return AnnualCounts(
        city_name="Gurgaon",
        city_id="gurgaon",
        source=str(path.relative_to(ROOT)),
        data_year=2023,
        deaths=parse_int(by_metric["Total deaths"][year]),
        injuries=parse_int(by_metric["Total Injuries"][year]),
        incidents=parse_int(by_metric["Total Crashes"][year]),
        annualization="latest year column (2023)",
    )


def load_surat() -> AnnualCounts:
    path = RAW_ACCIDENTS / "surat/Surat_Road_Accident_Data.csv"
    with path.open(newline="", encoding="utf-8-sig") as f:
        row = next(csv.DictReader(f))
    # 2-year snapshot → annual average
    deaths = round(
        (
            parse_int(row["2022 Fatalities"])
            + parse_int(row["2023 Fatalities"])
        )
        / 2
    )
    injuries = round(
        (
            parse_int(row["2022 Number of Persons Injured"])
            + parse_int(row["2023 Number of Persons Injured"])
        )
        / 2
    )
    incidents = round(
        (
            parse_int(row["2022 Number of Accidents"])
            + parse_int(row["2023 Number of Accidents"])
        )
        / 2
    )
    return AnnualCounts(
        city_name="Surat",
        city_id="surat",
        source=str(path.relative_to(ROOT)),
        data_year="2022–2023 avg",
        deaths=deaths,
        injuries=injuries,
        incidents=incidents,
        annualization="(2022 + 2023) / 2 per metric",
    )


def estimate_incidents(deaths: int, injuries: int) -> int:
    """Crash count proxy when only NCRB person totals are available."""
    if deaths == 0 and injuries == 0:
        return 0
    return deaths + max(1, round(injuries / 1.2))


def ncrb_person_counts(
    inj_row: dict[str, str], fat_row: dict[str, str]
) -> tuple[int, int, int, str]:
    mode_keys = [
        "Pedestrian",
        "Bicycles",
        "Two-wheelers",
        "Other modes of road transport (auto, bus, lorry)",
    ]

    def mode_sum(row: dict[str, str]) -> int:
        return sum(parse_int(row.get(k)) for k in mode_keys)

    inj_total = parse_int(inj_row["Total"])
    fat_total = parse_int(fat_row["Total"])
    inj_modes = mode_sum(inj_row)
    fat_modes = mode_sum(fat_row)

    # Lucknow-style rows: identical Total on both types → Total is incident count
    if inj_total > 0 and inj_total == fat_total:
        incidents = inj_total
        deaths = fat_modes if 0 < fat_modes <= incidents else max(1, round(incidents * 0.05))
        injuries = max(0, inj_modes)
        note = (
            "NCRB Total repeated across Injuries/Fatalities rows — treated as incidents; "
            "deaths/injuries from mode columns"
        )
        return deaths, injuries, incidents, note

    deaths = fat_modes if fat_modes > 0 else fat_total
    injuries = inj_modes if inj_modes > 0 else inj_total
    incidents = estimate_incidents(deaths, injuries)
    return deaths, injuries, incidents, "Incidents estimated as deaths + round(injuries / 1.2)"


def load_many_cities(city_csv_name: str, canonical: str) -> AnnualCounts:
    path = RAW_ACCIDENTS / "many-cities.csv"
    with path.open(newline="", encoding="utf-8-sig") as f:
        rows = [r for r in csv.DictReader(f) if r["City"].strip() == city_csv_name]

    years = sorted({parse_int(r["Year"]) for r in rows if parse_int(r["Year"])})
    year = years[-1]

    # Lucknow 2018 is NA — use 2017
    if city_csv_name == "Lucknow":
        year = 2017

    inj_row = next(
        r for r in rows if parse_int(r["Year"]) == year and r["Accident type"] == "Injuries"
    )
    fat_row = next(
        r for r in rows if parse_int(r["Year"]) == year and r["Accident type"] == "Fatalities"
    )
    deaths, injuries, incidents, parse_note = ncrb_person_counts(inj_row, fat_row)

    return AnnualCounts(
        city_name=canonical,
        city_id=CITY_TO_ID[canonical],
        source=f"{path.relative_to(ROOT)} ({city_csv_name}, {year})",
        data_year=year,
        deaths=deaths,
        injuries=injuries,
        incidents=incidents,
        annualization="latest annual row",
        notes=parse_note,
    )


def compute_harm(counts: AnnualCounts) -> float:
    return (
        counts.deaths * DEATH_WEIGHT
        + counts.injuries * INJURY_WEIGHT
        + counts.incidents * INCIDENT_WEIGHT
    )


def compute_metrics(counts: AnnualCounts, population: int) -> ComputedMetrics:
    harm = compute_harm(counts)
    danger_rate = (harm / population) * 100_000

    denom = counts.deaths + counts.injuries
    severity_index = counts.deaths / denom if denom > 0 else 0.0

    raw = danger_rate * DANGER_WEIGHT + severity_index * 100 * SEVERITY_WEIGHT

    return ComputedMetrics(
        harm_score=round(harm, 2),
        danger_rate=round(danger_rate, 4),
        severity_index=round(severity_index, 6),
        raw_safety_score=round(raw, 4),
        compressed_score=0.0,  # filled in second pass
        final_score=0.0,
    )


def calibrate_outlier_counts(
    counts: AnnualCounts, peer_harms: list[float]
) -> AnnualCounts:
    """Scale NCRB outliers (e.g. Lucknow 2017) to cohort level while preserving ratios."""
    harm = compute_harm(counts)
    if not peer_harms:
        return counts

    median = statistics.median(peer_harms)
    threshold = median * 2.5
    if harm <= threshold:
        return counts

    # Target ~upper-mid cohort — keeps 2017 Lucknow in scale without hitting score floor
    target = median * 1.65
    factor = target / harm

    note = counts.notes
    if note:
        note += "; "
    note += f"Harm scaled ×{factor:.3f} (NCRB outlier vs cohort median {median:.0f})"

    return AnnualCounts(
        city_name=counts.city_name,
        city_id=counts.city_id,
        source=counts.source,
        data_year=counts.data_year,
        deaths=max(1, round(counts.deaths * factor)),
        injuries=max(0, round(counts.injuries * factor)),
        incidents=max(1, round(counts.incidents * factor)),
        annualization=counts.annualization,
        notes=note,
    )


def invert_sqrt_scores(
    raw_scores: dict[str, float], floor: float = 10.0
) -> dict[str, float]:
    compressed = {cid: math.sqrt(v) for cid, v in raw_scores.items()}
    vals = list(compressed.values())
    cmin, cmax = min(vals), max(vals)

    if cmax == cmin:
        return {cid: 50.0 for cid in compressed}

    span = 100.0 - floor
    return {
        cid: round(floor + (cmax - v) / (cmax - cmin) * span, 2)
        for cid, v in compressed.items()
    }


def main() -> None:
    population = load_population()

    loaders = [
        load_bengaluru,
        load_mumbai,
        load_delhi,
        load_chennai,
        load_hyderabad,
        load_gurgaon,
        load_surat,
    ]
    counts_list: list[AnnualCounts] = [fn() for fn in loaders]

    for csv_name, canonical in MANY_CITIES_NAME.items():
        counts_list.append(load_many_cities(csv_name, canonical))

    # Calibrate NCRB outliers (Lucknow 2017 mode totals) against peer harm scores
    peer_harms = [compute_harm(c) for c in counts_list]
    counts_list = [
        calibrate_outlier_counts(c, [h for i, h in enumerate(peer_harms) if counts_list[i].city_id != c.city_id])
        for c in counts_list
    ]

    # First pass: raw metrics
    records: list[dict] = []
    raw_by_id: dict[str, float] = {}

    for counts in counts_list:
        pop = population[counts.city_name]
        metrics = compute_metrics(counts, pop)
        raw_by_id[counts.city_id] = metrics.raw_safety_score
        records.append({"counts": counts, "metrics": metrics, "population": pop})

    final_scores = invert_sqrt_scores(raw_by_id)

    output_cities: list[dict] = []
    for item in records:
        counts: AnnualCounts = item["counts"]
        metrics: ComputedMetrics = item["metrics"]
        metrics.compressed_score = round(math.sqrt(metrics.raw_safety_score), 4)
        metrics.final_score = final_scores[counts.city_id]

        output_cities.append(
            {
                "city_id": counts.city_id,
                "city_name": counts.city_name,
                "source": counts.source,
                "data_year": counts.data_year,
                "annualization": counts.annualization,
                "notes": counts.notes,
                "population_2011": item["population"],
                "annual_counts": {
                    "deaths": counts.deaths,
                    "injuries": counts.injuries,
                    "incidents": counts.incidents,
                },
                "computed": {
                    "harm_score": metrics.harm_score,
                    "danger_rate_per_100k": metrics.danger_rate,
                    "severity_index": metrics.severity_index,
                    "raw_safety_score": metrics.raw_safety_score,
                    "compressed_score": metrics.compressed_score,
                    "final_score": metrics.final_score,
                },
                "band": score_band(metrics.final_score),
                "accidents_rank": 0,
            }
        )

    output_cities.sort(key=lambda c: c["computed"]["final_score"], reverse=True)
    for i, city in enumerate(output_cities, start=1):
        city["accidents_rank"] = i

    payload = {
        "metadata": {
            "sector": "Safety — Road Accidents",
            "sources": "data/raw/safety/accidents/ (city CSVs + many-cities.csv)",
            "population_source": "data/raw/population-data.csv (Census 2011)",
            "weights": {
                "harm_score": f"deaths×{DEATH_WEIGHT} + injuries×{INJURY_WEIGHT} + incidents×{INCIDENT_WEIGHT}",
                "danger_rate": "harm_score / population × 100,000",
                "severity_index": "deaths / (deaths + injuries)",
                "raw_composite": f"danger_rate×{DANGER_WEIGHT} + severity_index×100×{SEVERITY_WEIGHT}",
                "final_score": (
                    f"invert sqrt(raw): floor + (max − √raw) / (max − min) × (100 − floor) "
                    f"— higher = safer; outliers harm-calibrated to cohort median"
                ),
            },
            "annualization": {
                "hyderabad": "2025 Total row (full year)",
                "surat": "average of 2022 and 2023 columns",
                "default": "latest annual row in city CSV",
                "many_cities": "Ahmedabad, Indore, Lucknow, Vizag — skip Bangalore & Chennai",
            },
            "bands": {"poor": "0–35", "manageable": "35–65", "good": "65+"},
            "cities_processed": len(output_cities),
        },
        "cities": output_cities,
    }

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_JSON.parent.mkdir(parents=True, exist_ok=True)
    for path in (OUT_JSON, PUBLIC_JSON):
        with path.open("w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)

    print(f"Wrote {OUT_JSON}")
    print(f"Wrote {PUBLIC_JSON}")
    print("\nAccident safety rankings (higher = safer):")
    for c in output_cities:
        comp = c["computed"]
        print(
            f"  #{c['accidents_rank']:2} {c['city_name']:<14} "
            f"score={comp['final_score']:5.1f} ({c['band']})  "
            f"year={c['data_year']}  harm={comp['harm_score']:.0f}  "
            f"danger/100k={comp['danger_rate_per_100k']:.1f}  "
            f"severity={comp['severity_index']:.3f}"
        )


if __name__ == "__main__":
    main()
