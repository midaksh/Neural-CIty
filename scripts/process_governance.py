#!/usr/bin/env python3
"""
Process municipal spending / budget CSVs into Governance scores.

Two indicators (60/40 composite):
  1. Spend Ratio — distance from spending/budget ratio = 1.0
     Severe extra penalty only beyond 1.36× overspend or below 0.69× underspend.

  2. Invest — per-capita municipal spend (₹ per lakh pop)

Composite = spend_ratio_score × 0.60 + invest_score × 0.40
"""

from __future__ import annotations

import csv
import glob
import json
import math
from dataclasses import asdict, dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW_GOV = ROOT / "data/raw/governance"
POPULATION_CSV = ROOT / "data/raw/population-data.csv"
OUT_JSON = ROOT / "data/processed/governance_scores.json"
PUBLIC_JSON = ROOT / "public/data/governance_scores.json"

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

POPULATION_ALIASES: dict[str, str] = {
    "Bangalore": "Bengaluru",
    "Delhi": "NCT of Delhi",
    "Visakhapatnam[4]": "Vizag",
}

SPEND_RATIO_BLEND = 0.60
INVEST_BLEND = 0.40
SPEND_RATIO_FLOOR = 10.0
INVEST_FLOOR = 15.0
SEVERE_OVERSPEND_RATIO = 1.36
SEVERE_UNDERSPEND_RATIO = 0.69
OVERSPEND_HAIRCUT_THRESHOLD = 1.10
CRORE_TO_RUPEES = 10_000_000  # 1 crore = 10^7 INR
LAKH_TO_RUPEES = 100_000


@dataclass
class BudgetRow:
    year_label: str
    spending: float
    budget: float
    ratio: float
    is_actual: bool


def parse_float(value: str | None) -> float | None:
    if value is None:
        return None
    cleaned = str(value).replace(",", "").replace('"', "").strip()
    if not cleaned:
        return None
    try:
        return float(cleaned)
    except ValueError:
        return None


def normalize_key(key: str) -> str:
    return key.strip().lower().replace(" ", "_")


def row_get(row: dict[str, str], *candidates: str) -> str | None:
    normalized = {normalize_key(k): v for k, v in row.items()}
    for cand in candidates:
        val = normalized.get(normalize_key(cand))
        if val is not None and str(val).strip():
            return str(val).strip()
    return None


def load_population() -> dict[str, int]:
    pop: dict[str, int] = {}
    with POPULATION_CSV.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            name = row["City"].strip()
            canonical = POPULATION_ALIASES.get(name, name)
            if canonical in CITY_TO_ID:
                pop[canonical] = int(float(row["Population(2011)"].replace(",", "")))
    return pop


def spending_in_rupees(spending: float, unit: str) -> float:
    if unit == "lakh":
        return spending * LAKH_TO_RUPEES
    if unit == "crore":
        return spending * CRORE_TO_RUPEES
    return spending


def detect_unit(spending: float, budget: float) -> str:
    """Infer whether amounts are rupees, lakhs, or crores."""
    peak = max(spending, budget)
    if peak >= 1e8:
        return "rupees"
    if peak >= 1e4:
        return "lakh"
    return "crore"


def parse_governance_rows(rows: list[dict[str, str]]) -> tuple[list[BudgetRow], str]:
    parsed: list[BudgetRow] = []
    unit_hint = "rupees"

    for row in rows:
        year = row_get(row, "Year", "year") or "unknown"
        spending = parse_float(
            row_get(
                row,
                "Municipal_Spending",
                "Municipal Spending",
                "Municipal Spending (Rs. lakh)",
            )
        )
        budget = parse_float(
            row_get(
                row,
                "Municipal_Budget",
                "Municipal Budget",
                "Municipal Budget (Rs. lakh)",
            )
        )
        ratio = parse_float(row_get(row, "Spending_to_Budget_Ratio"))

        if spending is None or budget is None:
            continue
        if spending <= 0 or budget <= 0:
            continue

        if ratio is None or ratio <= 0:
            ratio = spending / budget

        row_unit = detect_unit(spending, budget)
        if "lakh" in " ".join(row.keys()).lower():
            row_unit = "lakh"
        unit_hint = row_unit

        is_actual = "actual" in year.lower()
        parsed.append(
            BudgetRow(
                year_label=year,
                spending=spending,
                budget=budget,
                ratio=ratio,
                is_actual=is_actual,
            )
        )

    return parsed, unit_hint


def spend_ratio_score(
    ratio: float, floor: float = SPEND_RATIO_FLOOR
) -> float:
    """Absolute spend-ratio score on 10–100; target ratio = 1.0."""
    if ratio >= 1.0:
        dev = (ratio - 1.0) * 1.35
    else:
        dev = (1.0 - ratio) * 1.0

    if ratio > SEVERE_OVERSPEND_RATIO:
        dev += (ratio - SEVERE_OVERSPEND_RATIO) ** 2 * 2.0
    if ratio < SEVERE_UNDERSPEND_RATIO:
        dev += (SEVERE_UNDERSPEND_RATIO - ratio) ** 2 * 2.0

    return max(floor, round(100.0 - dev * 100.0, 2))


def invest_haircut(avg_ratio: float) -> float:
    if avg_ratio <= OVERSPEND_HAIRCUT_THRESHOLD:
        return 1.0
    penalty = (avg_ratio - OVERSPEND_HAIRCUT_THRESHOLD) * 1.5
    return max(0.65, 1.0 - penalty)


def normalize_sqrt_min_max(
    values: dict[str, float], floor: float = INVEST_FLOOR
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


def load_city_csv(folder: str) -> list[dict[str, str]]:
    pattern = RAW_GOV / folder / "*.csv"
    files = glob.glob(str(pattern))
    if not files:
        raise FileNotFoundError(f"No CSV found for folder {folder}")
    with open(files[0], newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def main() -> None:
    population = load_population()
    raw_records: list[dict] = []

    for folder, city_name in FOLDER_TO_CITY.items():
        rows = load_city_csv(folder)
        budget_rows, unit_hint = parse_governance_rows(rows)

        if not budget_rows:
            raise ValueError(f"No valid budget rows for {city_name}")

        avg_ratio = sum(r.ratio for r in budget_rows) / len(budget_rows)
        ratio_score = spend_ratio_score(avg_ratio)

        latest = budget_rows[-1]
        unit = unit_hint
        if unit == "rupees" and latest.spending < 1e8:
            unit = "crore"

        latest_spend_rupees = spending_in_rupees(latest.spending, unit)
        pop = population[city_name]
        spend_per_100k = (latest_spend_rupees / pop) * 100_000
        haircut = invest_haircut(avg_ratio)
        invest_raw = spend_per_100k * haircut

        notes: list[str] = []
        if unit == "crore":
            notes.append("Amounts scaled from crore to rupees (values < 1e8)")
        if avg_ratio > SEVERE_OVERSPEND_RATIO:
            notes.append("Severe overspend — spend-ratio score floored at minimum")
        if len(budget_rows) == 1:
            notes.append("Single valid year — lower confidence")

        raw_records.append(
            {
                "city_id": CITY_TO_ID[city_name],
                "city_name": city_name,
                "source_folder": folder,
                "budget_years_used": len(budget_rows),
                "population_2011": pop,
                "unit_detected": unit,
                "notes": notes,
                "year_rows": [
                    {
                        "year": r.year_label,
                        "spending": r.spending,
                        "budget": r.budget,
                        "ratio": round(r.ratio, 4),
                        "is_actual": r.is_actual,
                    }
                    for r in budget_rows
                ],
                "raw_metrics": {
                    "avg_spending_to_budget_ratio": round(avg_ratio, 4),
                    "latest_spending_rupees": round(latest_spend_rupees, 2),
                    "spend_per_100k_residents": round(spend_per_100k, 2),
                    "invest_haircut_multiplier": round(haircut, 4),
                    "invest_raw_per_100k": round(invest_raw, 2),
                    "spend_ratio_score_absolute": ratio_score,
                },
            }
        )

    invest_raw_map = {
        r["city_id"]: r["raw_metrics"]["invest_raw_per_100k"] for r in raw_records
    }
    invest_scores = normalize_sqrt_min_max(invest_raw_map)

    for record in raw_records:
        cid = record["city_id"]
        spend_ratio = record["raw_metrics"]["spend_ratio_score_absolute"]
        invest = invest_scores[cid]
        composite = round(
            spend_ratio * SPEND_RATIO_BLEND + invest * INVEST_BLEND, 2
        )

        record["normalized_scores"] = {
            "spend_ratio_score": spend_ratio,
            "invest_score": invest,
            "composite_score": composite,
        }
        record["bands"] = {
            "spend_ratio": score_band(spend_ratio),
            "invest": score_band(invest),
            "composite": score_band(composite),
        }

    raw_records.sort(
        key=lambda r: r["normalized_scores"]["composite_score"], reverse=True
    )
    for i, record in enumerate(raw_records, start=1):
        record["governance_rank"] = i
        record["band"] = record["bands"]["composite"]

    output = {
        "metadata": {
            "sector": "Governance — Municipal Budget Discipline & Investment",
            "source": "data/raw/governance/*/*_municipal_spending_budget_ratio.csv",
            "population_source": "data/raw/population-data.csv (Census 2011)",
            "indicators": {
                "spend_ratio": (
                    "Distance from spending/budget ratio = 1.0; overspend penalized "
                    "1.35× vs underspend; extra penalty beyond ratio "
                    f"{SEVERE_OVERSPEND_RATIO} or below {SEVERE_UNDERSPEND_RATIO}; "
                    f"floor {SPEND_RATIO_FLOOR}"
                ),
                "invest": (
                    "Latest municipal spending per lakh residents; sqrt min–max to "
                    f"{INVEST_FLOOR}–100; haircut when avg ratio > {OVERSPEND_HAIRCUT_THRESHOLD}"
                ),
            },
            "formula": {
                "avg_ratio": "Mean of valid non-zero year rows per city",
                "spend_ratio": "100 − asymmetric_deviation×100, floor 10",
                "invest_raw": "latest_spend_rupees / pop × 100k × overspend_haircut",
                "composite": (
                    f"spend_ratio×{SPEND_RATIO_BLEND} + invest×{INVEST_BLEND}"
                ),
            },
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
    print("\nGovernance rankings (composite = 60% Spend Ratio + 40% Invest):")
    for r in raw_records:
        ns = r["normalized_scores"]
        rm = r["raw_metrics"]
        print(
            f"  #{r['governance_rank']:2} {r['city_name']:<14} "
            f"composite={ns['composite_score']:5.1f} ({r['band']})  "
            f"ratio={ns['spend_ratio_score']:5.1f} invest={ns['invest_score']:5.1f}  "
            f"avg={rm['avg_spending_to_budget_ratio']:.3f}"
        )


if __name__ == "__main__":
    main()
