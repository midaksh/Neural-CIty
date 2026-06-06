"use client";

import { cn, getScoreBandStyles } from "@/lib/utils";

interface ConvenienceScorePanelProps {
  spatialScore: number;
  accessScore: number;
  coverageDensity: number;
  convenienceRank: number;
  totalCities: number;
}

function ScoreMetricCard({
  label,
  score,
  description,
}: {
  label: string;
  score: number;
  description: string;
}) {
  const clamped = Math.min(100, Math.max(0, score));
  const bandStyles = getScoreBandStyles(clamped);

  return (
    <div className="rounded-xl border border-border bg-card/60 px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{description}</p>
        </div>
        <p className={cn("shrink-0 text-2xl font-extrabold tracking-tight", bandStyles.text)}>
          {Math.round(clamped)}
          <span className="text-sm font-semibold text-muted">/100</span>
        </p>
      </div>
      <div className="mt-3">
        <div className="flex items-end gap-1.5">
          {Array.from({ length: 10 }).map((_, index) => {
            const segmentStart = index * 10;
            const segmentEnd = segmentStart + 10;
            let fillPercent = 0;

            if (clamped >= segmentEnd) {
              fillPercent = 100;
            } else if (clamped > segmentStart) {
              fillPercent = ((clamped - segmentStart) / 10) * 100;
            }

            return (
              <div
                key={index}
                className="relative w-full overflow-hidden rounded-sm bg-surface"
                style={{ height: `${8 + index * 1.6}px` }}
                title={`${segmentStart}-${segmentEnd}`}
              >
                <div
                  className={cn("absolute inset-y-0 left-0 rounded-sm", bandStyles.dot)}
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-1.5 flex justify-between text-[9px] font-medium text-muted">
          <span>0</span>
          <span>{clamped.toFixed(1)}</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
}

export function ConvenienceScorePanel({
  spatialScore,
  accessScore,
  coverageDensity,
  convenienceRank,
  totalCities,
}: ConvenienceScorePanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <ScoreMetricCard
        label="Spatial coverage"
        score={spatialScore}
        description="Weighted stops per km². Rewards land-area coverage."
      />
      <ScoreMetricCard
        label="Resident access"
        score={accessScore}
        description="Weighted stops per 100k population."
      />
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card/70 px-4 py-3">
          <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
            Coverage density
          </p>
          <p className="mt-1 text-lg font-bold tracking-tight text-foreground">
            {coverageDensity.toFixed(1)}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">weighted stops / km²</p>
        </div>
        <div className="rounded-xl border border-border bg-card/70 px-4 py-3">
          <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
            Convenience rank
          </p>
          <p className="mt-1 text-lg font-bold tracking-tight text-foreground">
            #{convenienceRank}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">of {totalCities} cities</p>
        </div>
      </div>
    </div>
  );
}
