"use client";

interface TransportMixChartProps {
  bus: number;
  metro: number;
  railway: number;
}

export function TransportMixChart({ bus, metro, railway }: TransportMixChartProps) {
  const segments = [
    { label: "Bus stops", value: bus, color: "#f37021" },
    { label: "Metro stations", value: metro, color: "var(--score-manageable)" },
    { label: "Railway stations", value: railway, color: "var(--score-good)" },
  ].filter((segment) => segment.value > 0);

  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  const maxValue = Math.max(...segments.map((segment) => segment.value), 1);
  const barMaxWidth = 100;

  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
            Total mapped stops
          </p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">
            {total.toLocaleString()}
          </p>
        </div>
        <p className="max-w-[140px] text-right text-[11px] leading-relaxed text-muted">
          Share of each mode in the OSM transport inventory
        </p>
      </div>

      <div className="space-y-4">
        {segments.map((segment) => {
          const barWidth = (segment.value / maxValue) * barMaxWidth;

          return (
            <div key={segment.label}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-xs font-medium text-foreground">{segment.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-foreground">
                    {segment.value.toLocaleString()}
                  </span>
                  <span className="ml-1.5 text-[11px] text-muted">
                    {((segment.value / total) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="relative h-8 overflow-hidden rounded-lg bg-surface">
                <div
                  className="flex h-full items-center rounded-lg px-2.5 transition-all duration-700"
                  style={{
                    width: `${barWidth}%`,
                    minWidth: segment.value > 0 ? "3.5rem" : 0,
                    backgroundColor: segment.color,
                  }}
                >
                  <span className="truncate text-[10px] font-semibold text-white">
                    {segment.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
