"use client";

import { CategoryScoreTile } from "@/components/rankings/CategoryScoreTile";
import type { CompareCategory } from "@/lib/compare-data";

interface CategoryBreakdownCellProps {
  category: CompareCategory;
  index: number;
}

export function CategoryBreakdownCell({
  category,
  index,
}: CategoryBreakdownCellProps) {
  return (
    <div className="flex flex-1 flex-col justify-center rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">
          {category.title}
        </p>
        <p className="text-lg font-bold text-foreground">
          {category.score.toFixed(1)}
          <span className="ml-0.5 text-xs font-medium text-muted">/100</span>
        </p>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {category.indicators.map((indicator, i) => (
          <CategoryScoreTile
            key={indicator.label}
            label={indicator.label}
            score={indicator.score}
            index={index + i}
          />
        ))}
      </div>
    </div>
  );
}
