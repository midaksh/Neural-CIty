"use client";

interface RoadHarmBreakdownChartProps {
  deaths: number;
  injuries: number;
  incidents: number;
}

export function RoadHarmBreakdownChart({
  deaths,
  injuries,
  incidents,
}: RoadHarmBreakdownChartProps) {
  const other = Math.max(0, incidents - deaths - injuries);
  const segments = [
    { label: "Deaths", value: deaths, color: "var(--score-poor)" },
    { label: "Injuries", value: injuries, color: "var(--score-manageable)" },
    ...(other > 0
      ? [{ label: "Other incidents", value: other, color: "var(--brand)" }]
      : []),
  ].filter((segment) => segment.value > 0);

  const total = Math.max(incidents, 1);
  const size = 168;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulated = 0;
  const arcs = segments.map((segment) => {
    const length = (segment.value / total) * circumference;
    const arc = {
      ...segment,
      length,
      rotation: (accumulated / total) * 360,
    };
    accumulated += segment.value;
    return arc;
  });

  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-center">
        <div className="relative shrink-0">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Road harm breakdown">
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="var(--surface)"
              strokeWidth={stroke}
            />
            {arcs.map((arc) => (
              <circle
                key={arc.label}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={stroke}
                strokeDasharray={`${arc.length} ${circumference - arc.length}`}
                strokeDashoffset={circumference * 0.25}
                transform={`rotate(${arc.rotation} ${cx} ${cy})`}
                strokeLinecap="butt"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">Total</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {incidents.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted">incidents</p>
          </div>
        </div>

        <div className="w-full min-w-[180px] space-y-3 sm:w-auto">
          {segments.map((segment) => (
            <div key={segment.label} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-xs font-medium text-foreground">{segment.label}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-foreground">
                  {segment.value.toLocaleString()}
                </span>
                <span className="ml-1.5 text-[11px] text-muted">
                  ({((segment.value / total) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
          <p className="border-t border-border/70 pt-2 text-[11px] leading-relaxed text-muted">
            {deaths.toLocaleString()} deaths and {injuries.toLocaleString()} injuries recorded out of{" "}
            {incidents.toLocaleString()} total annual road incidents.
          </p>
        </div>
      </div>
    </div>
  );
}
