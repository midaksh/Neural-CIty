import type { CityCompareData } from "@/lib/compare-data";
import type { ExportPayload } from "@/lib/export/types";

function formatDelta(a: number, b: number): string {
  const diff = a - b;
  const sign = diff > 0 ? "+" : "";
  return `${sign}${diff.toFixed(1)}`;
}

export function buildCompareExportPayload(
  cityA: CityCompareData,
  cityB: CityCompareData,
  shareUrl: string,
): ExportPayload {
  const pillarRows = [
    {
      label: "Overall",
      a: cityA.overall,
      b: cityB.overall,
    },
    ...cityA.categories.map((category, index) => ({
      label: category.title,
      a: category.score,
      b: cityB.categories[index]?.score ?? 0,
    })),
  ];

  const headToHeadRows = pillarRows.map(({ label, a, b }) => [
    label,
    a.toFixed(1),
    b.toFixed(1),
    formatDelta(a, b),
    a > b ? cityA.cityName : a < b ? cityB.cityName : "Tie",
  ]);

  const indicatorRows: (string | number)[][] = [];

  for (let i = 0; i < cityA.categories.length; i += 1) {
    const catA = cityA.categories[i];
    const catB = cityB.categories[i];
    if (!catA || !catB) continue;

    for (let j = 0; j < catA.indicators.length; j += 1) {
      const indA = catA.indicators[j];
      const indB = catB.indicators[j];
      if (!indA || !indB) continue;

      indicatorRows.push([
        catA.title,
        indA.label,
        indA.score.toFixed(1),
        indB.score.toFixed(1),
        formatDelta(indA.score, indB.score),
      ]);
    }
  }

  return {
    kind: "compare",
    documentTitle: `${cityA.cityName} vs ${cityB.cityName}`,
    subtitle: "Head-to-head street intelligence comparison across Safety, Convenience, and Governance",
    filenameBase: `neural-city-compare-${cityA.cityId}-vs-${cityB.cityId}`,
    shareUrl,
    meta: [
      { label: "City A", value: cityA.cityName },
      { label: "City B", value: cityB.cityName },
      { label: "City A overall", value: cityA.overall.toFixed(1) },
      { label: "City B overall", value: cityB.overall.toFixed(1) },
    ],
    tables: [
      {
        title: "Pillar comparison",
        subtitle: "Higher score wins each row",
        headers: ["Pillar", cityA.cityName, cityB.cityName, "Difference", "Leader"],
        rows: headToHeadRows,
      },
      {
        title: "Indicator comparison",
        subtitle: "Sub-scores within each pillar",
        headers: ["Pillar", "Indicator", cityA.cityName, cityB.cityName, "Difference"],
        rows: indicatorRows,
      },
    ],
  };
}
