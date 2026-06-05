"use client";

import { cn, getScoreBandStylesByBand } from "@/lib/utils";

const legendItems = [
  { band: "poor" as const, range: "0–35" },
  { band: "manageable" as const, range: "35–65" },
  { band: "good" as const, range: "65+" },
];

export function ScoreLegend() {
  return (
    <div className="mt-5 flex flex-wrap justify-start gap-2">
      {legendItems.map(({ band, range }) => {
        const styles = getScoreBandStylesByBand(band);
        return (
          <span
            key={band}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium",
              styles.bg,
              styles.border,
              styles.text,
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", styles.dot)} />
            {range} {styles.label}
          </span>
        );
      })}
    </div>
  );
}
