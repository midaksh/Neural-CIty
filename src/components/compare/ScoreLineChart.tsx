"use client";

interface ScoreLineChartProps {
  points: { label: string; value: number }[];
}

export function ScoreLineChart({ points }: ScoreLineChartProps) {
  const width = 560;
  const height = 140;
  const padX = 28;
  const padY = 20;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const coords = points.map((point, index) => {
    const x =
      points.length === 1
        ? padX + chartW / 2
        : padX + (index / (points.length - 1)) * chartW;
    const y = padY + chartH - (point.value / 100) * chartH;
    return { ...point, x, y };
  });

  const linePath = coords
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${coords[coords.length - 1]?.x ?? padX} ${
    padY + chartH
  } L ${coords[0]?.x ?? padX} ${padY + chartH} Z`;

  return (
    <div className="mt-4 w-full overflow-hidden rounded-xl border border-border bg-card/60 p-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Score trend across categories"
      >
        <defs>
          <linearGradient id="compareLineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f37021" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f37021" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 25, 50, 75, 100].map((tick) => {
          const y = padY + chartH - (tick / 100) * chartH;
          return (
            <g key={tick}>
              <line
                x1={padX}
                y1={y}
                x2={width - padX}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.08}
              />
              <text
                x={padX - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-muted text-[9px]"
              >
                {tick}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#compareLineFill)" />
        <path
          d={linePath}
          fill="none"
          stroke="#f37021"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {coords.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r={4} fill="#f37021" />
            <text
              x={point.x}
              y={height - 4}
              textAnchor="middle"
              className="fill-muted text-[9px]"
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
