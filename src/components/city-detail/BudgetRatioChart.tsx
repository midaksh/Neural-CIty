"use client";

import type { CityDetailData } from "@/lib/city-detail-data";

interface BudgetRatioChartProps {
  rows: CityDetailData["governanceRaw"]["year_rows"];
}

export function BudgetRatioChart({ rows }: BudgetRatioChartProps) {
  const width = 520;
  const height = 180;
  const padLeft = 36;
  const padRight = 16;
  const padTop = 20;
  const padBottom = 44;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const minRatio = 0.85;
  const maxRatio = 1.15;
  const coords = rows.map((row, index) => {
    const x =
      rows.length === 1
        ? padLeft + chartW / 2
        : padLeft + (index / (rows.length - 1)) * chartW;
    const normalized =
      (Math.min(maxRatio, Math.max(minRatio, row.ratio)) - minRatio) /
      (maxRatio - minRatio);
    const y = padTop + chartH - normalized * chartH;
    return { ...row, x, y };
  });

  const linePath = coords
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Budget spending to budget ratio over time"
      >
        <line
          x1={padLeft}
          y1={padTop + chartH - ((1 - minRatio) / (maxRatio - minRatio)) * chartH}
          x2={width - padRight}
          y2={padTop + chartH - ((1 - minRatio) / (maxRatio - minRatio)) * chartH}
          stroke="currentColor"
          strokeOpacity={0.12}
          strokeDasharray="4 5"
        />
        <text
          x={padLeft - 8}
          y={padTop + chartH - ((1 - minRatio) / (maxRatio - minRatio)) * chartH + 3}
          textAnchor="end"
          className="fill-muted text-[9px]"
        >
          1.0 target
        </text>

        <path
          d={linePath}
          fill="none"
          stroke="#f37021"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {coords.map((point) => (
          <g key={point.year}>
            <circle
              cx={point.x}
              cy={point.y}
              r={5}
              fill="var(--card)"
              stroke={point.is_actual ? "#f37021" : "var(--muted-foreground)"}
              strokeWidth={2}
            />
            <text
              x={point.x}
              y={height - 10}
              textAnchor="middle"
              className="fill-muted text-[8px] font-medium"
            >
              {point.year.replace(" (Actual)", "").replace(" (BE)", "").replace(" (RBE)", "")}
            </text>
            <text
              x={point.x}
              y={point.y - 10}
              textAnchor="middle"
              className="fill-foreground text-[9px] font-semibold"
            >
              {point.ratio.toFixed(2)}
            </text>
          </g>
        ))}
      </svg>
      <p className="mt-1 text-[10px] text-muted">
        Solid dots = actual year rows · Outlined = budget estimates · Ratio 1.0 is the fiscal target
      </p>
    </div>
  );
}
