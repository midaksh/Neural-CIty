"use client";

interface AccidentHarmBreakdownProps {
  deaths: number;
  injuries: number;
  incidents: number;
}

export function AccidentHarmBreakdown({
  deaths,
  injuries,
  incidents,
}: AccidentHarmBreakdownProps) {
  const other = Math.max(0, incidents - deaths - injuries);
  const total = Math.max(incidents, 1);

  const segments = [
    { label: "Deaths", value: deaths, color: "var(--score-poor)" },
    { label: "Injuries", value: injuries, color: "var(--score-manageable)" },
    ...(other > 0
      ? [{ label: "Other", value: other, color: "var(--brand)" }]
      : []),
  ].filter((segment) => segment.value > 0);

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">Accidents</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
            Annual road incidents, showing share of deaths and injuries in the total count
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-extrabold leading-none tracking-tight text-foreground">
            {incidents.toLocaleString()}
          </p>
          <p className="mt-1 text-[10px] font-semibold tracking-wide text-muted uppercase">
            total incidents
          </p>
        </div>
      </div>

      <div
        className="flex h-3.5 overflow-hidden rounded-full bg-surface"
        role="img"
        aria-label="Accident harm composition"
      >
        {segments.map((segment) => (
          <div
            key={segment.label}
            className="h-full transition-all duration-700 first:rounded-l-full last:rounded-r-full"
            style={{
              width: `${(segment.value / total) * 100}%`,
              backgroundColor: segment.color,
            }}
            title={`${segment.label}: ${segment.value.toLocaleString()}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className="rounded-lg border border-border bg-card/60 px-3 py-2"
          >
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-[10px] font-medium text-muted">{segment.label}</span>
            </div>
            <p className="mt-1 text-sm font-bold text-foreground">
              {segment.value.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted">
              {((segment.value / total) * 100).toFixed(1)}% of total
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
