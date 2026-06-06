"use client";

import { useId } from "react";

interface ScoreLineChartProps {
  points: { label: string; value: number }[];
}

function buildSmoothPath(
  coords: { x: number; y: number }[],
): string {
  if (coords.length === 0) return "";
  if (coords.length === 1) {
    return `M ${coords[0].x} ${coords[0].y}`;
  }

  let path = `M ${coords[0].x} ${coords[0].y}`;

  for (let i = 0; i < coords.length - 1; i++) {
    const current = coords[i];
    const next = coords[i + 1];
    const midX = (current.x + next.x) / 2;
    path += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
  }

  return path;
}

export function ScoreLineChart({ points }: ScoreLineChartProps) {
  const chartId = useId().replace(/:/g, "");
  const width = 640;
  const height = 168;
  const padLeft = 36;
  const padRight = 16;
  const padTop = 16;
  const padBottom = 32;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const coords = points.map((point, index) => {
    const x =
      points.length === 1
        ? padLeft + chartW / 2
        : padLeft + (index / (points.length - 1)) * chartW;
    const y = padTop + chartH - (point.value / 100) * chartH;
    return { ...point, x, y };
  });

  const linePath = buildSmoothPath(coords);
  const areaPath = `${linePath} L ${coords[coords.length - 1]?.x ?? padLeft} ${
    padTop + chartH
  } L ${coords[0]?.x ?? padLeft} ${padTop + chartH} Z`;

  const fillId = `compareLineFill-${chartId}`;
  const strokeId = `compareLineStroke-${chartId}`;

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
      <div className="border-b border-border/60 px-4 py-3">
        <p className="text-xs font-semibold tracking-wide text-foreground">
          Score breakdown
        </p>
        <p className="mt-0.5 text-[10px] text-muted">
          Overall and category performance
        </p>
      </div>

      <div className="px-3 py-4 md:px-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full"
          role="img"
          aria-label="Score trend across categories"
        >
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f37021" stopOpacity="0.22" />
              <stop offset="65%" stopColor="#f37021" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#f37021" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f37021" />
              <stop offset="100%" stopColor="#ff9a4d" />
            </linearGradient>
          </defs>

          {[0, 25, 50, 75, 100].map((tick) => {
            const y = padTop + chartH - (tick / 100) * chartH;
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={tick === 0 ? 0.12 : 0.06}
                  strokeDasharray={tick === 0 ? undefined : "4 6"}
                />
                <text
                  x={padLeft - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-muted text-[9px] font-medium"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill={`url(#${fillId})`} />
          <path
            d={linePath}
            fill="none"
            stroke={`url(#${strokeId})`}
            strokeWidth={2.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {coords.map((point) => (
            <g key={point.label}>
              <circle
                cx={point.x}
                cy={point.y}
                r={7}
                fill="var(--color-card, #fff)"
                stroke="#f37021"
                strokeWidth={2}
              />
              <circle cx={point.x} cy={point.y} r={2.5} fill="#f37021" />
              <text
                x={point.x}
                y={height - 8}
                textAnchor="middle"
                className="fill-muted text-[9px] font-medium"
              >
                {point.label}
              </text>
              <text
                x={point.x}
                y={point.y - 12}
                textAnchor="middle"
                className="fill-foreground text-[9px] font-semibold"
              >
                {Math.round(point.value)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
