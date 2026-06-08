import type { CityDetailData } from "@/lib/city-detail-data";
import { formatInrPerResident } from "@/lib/utils";
import type { ExportPayload } from "@/lib/export/types";

export function buildCityExportPayload(
  data: CityDetailData,
  shareUrl: string,
): ExportPayload {
  const populationLabel = `${(data.population2011 / 1_000_000).toFixed(2)}M`;
  const budgetUnitLabel =
    data.governanceRaw.unit_detected === "crore"
      ? "crore INR"
      : data.governanceRaw.unit_detected === "lakh"
        ? "lakh INR"
        : "INR";
  const governanceRows = data.governanceRaw.year_rows.map((row) => [
    row.year,
    row.spending.toFixed(2),
    row.budget.toFixed(2),
    row.ratio.toFixed(3),
    row.is_actual ? "Actual" : "Budget",
  ]);

  return {
    kind: "city",
    documentTitle: `${data.cityName} City Profile`,
    subtitle: `Street-level intelligence across safety, convenience, and governance · Rank #${data.overallRank} of ${data.totalCities}`,
    filenameBase: `neural-city-${data.cityId}-profile`,
    shareUrl,
    meta: [
      { label: "City", value: data.cityName },
      { label: "Population (2011)", value: populationLabel },
      { label: "Area", value: `${data.areaKm2.toLocaleString()} km²` },
      { label: "Overall rank", value: `#${data.overallRank} of ${data.totalCities}` },
      { label: "Data points", value: data.coverage.overall.toLocaleString() },
      {
        label: "Municipal spend per resident",
        value: formatInrPerResident(data.governanceRaw.raw_metrics.spend_per_resident_rupees),
      },
    ],
    tables: [
      {
        title: "Pillar scores",
        subtitle: "Normalized 0–100 across the 11-city cohort",
        headers: ["Pillar", "Score", "Band", "Rank"],
        rows: [
          ["Overall", data.overall.score.toFixed(1), data.overall.band, `#${data.overallRank}`],
          ["Safety", data.safety.score.toFixed(1), data.safety.band, `#${data.ranks.safety}`],
          [
            "Convenience",
            data.convenience.score.toFixed(1),
            data.convenience.band,
            `#${data.ranks.convenience}`,
          ],
          [
            "Governance",
            data.governance.score.toFixed(1),
            data.governance.band,
            `#${data.ranks.governance}`,
          ],
        ],
      },
      {
        title: "Safety breakdown",
        subtitle: "OpenStreetMap infrastructure and annual accident harm outcomes",
        headers: ["Indicator", "Score", "Detail"],
        rows: [
          [
            "Infrastructure",
            (data.safetyIndicators.infrastructure?.score ?? 0).toFixed(1),
            `${data.signals.counts.total_infrastructure.toLocaleString()} OSM assets · ${data.signals.raw_metrics.infrastructure_per_100k_population.toFixed(1)} per 100k`,
          ],
          [
            "Accidents",
            (data.safetyIndicators.accidents?.score ?? 0).toFixed(1),
            `${data.accidents.annual_counts.deaths} deaths · ${data.accidents.annual_counts.injuries} injuries · ${data.accidents.annual_counts.incidents} incidents (${data.accidents.data_year})`,
          ],
          [
            "Danger rate",
            data.accidents.computed.danger_rate_per_100k.toFixed(1),
            "Harm-weighted rate per 100k residents",
          ],
        ],
      },
      {
        title: "Convenience breakdown",
        subtitle: "Public transport spatial coverage and resident access",
        headers: ["Indicator", "Score", "Detail"],
        rows: [
          [
            "Spatial coverage",
            (data.convenienceIndicators.spatial?.score ?? 0).toFixed(1),
            `${data.convenienceRaw.raw_metrics.coverage_density.toFixed(2)} weighted stops / km²`,
          ],
          [
            "Resident access",
            (data.convenienceIndicators.access?.score ?? 0).toFixed(1),
            `${data.convenienceRaw.raw_metrics.access_per_100k.toFixed(1)} weighted stops per 100k`,
          ],
          [
            "Transport mix",
            "—",
            `Bus ${data.convenienceRaw.counts.bus.toLocaleString()} · Metro ${data.convenienceRaw.counts.metro.toLocaleString()} · Railway ${data.convenienceRaw.counts.railway.toLocaleString()}`,
          ],
        ],
      },
      {
        title: "Governance breakdown",
        subtitle: "Municipal budget discipline and per-capita investment",
        headers: ["Indicator", "Score", "Detail"],
        rows: [
          [
            "Spend ratio",
            (data.governanceIndicators.spendRatio?.score ?? 0).toFixed(1),
            `Avg ratio ${data.governanceRaw.raw_metrics.avg_spending_to_budget_ratio.toFixed(3)}`,
          ],
          [
            "Investment",
            (data.governanceIndicators.invest?.score ?? 0).toFixed(1),
            `${formatInrPerResident(data.governanceRaw.raw_metrics.spend_per_resident_rupees)} per resident (latest municipal spend)`,
          ],
        ],
      },
      {
        title: "Budget timeline",
        subtitle: `Spending-to-budget ratio by fiscal year (amounts in ${budgetUnitLabel} as per source CSV)`,
        headers: ["Year", "Spending", "Budget", "Ratio", "Type"],
        rows: governanceRows,
      },
      ...(data.notes.length > 0
        ? [
            {
              title: "Notes",
              headers: ["Note"],
              rows: data.notes.map((note) => [note]),
            },
          ]
        : []),
    ],
  };
}
