"use client";

import { motion } from "framer-motion";
import type { CompareCategory } from "@/lib/compare-data";
import { cn, getScoreBandStyles } from "@/lib/utils";

interface CategoryBreakdownCellProps {
  category: CompareCategory;
  index: number;
}

function IndicatorProgressBar({
  label,
  score,
  index,
}: {
  label: string;
  score: number;
  index: number;
}) {
  const clamped = Math.min(100, Math.max(0, score));
  const bandStyles = getScoreBandStyles(clamped);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-muted">{label}</span>
        <span className="shrink-0 text-[11px] font-semibold text-foreground">
          {Math.round(clamped)}
          <span className="font-normal text-muted">/100</span>
        </span>
      </div>
      <div className="h-3.5 overflow-hidden rounded-full bg-surface">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ delay: index * 0.06 + 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className={cn("h-full rounded-full", bandStyles.dot)}
        />
      </div>
    </motion.div>
  );
}

export function CategoryBreakdownCell({
  category,
  index,
}: CategoryBreakdownCellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      className="flex flex-col rounded-xl border border-border bg-card px-3.5 py-3.5 text-foreground sm:px-4 sm:py-4"
    >
      <div className="mb-3 flex items-baseline justify-between gap-2 border-b border-border pb-2.5">
        <p className="text-sm font-bold tracking-tight text-foreground">
          {category.title}
        </p>
        <p className="shrink-0 text-xl font-extrabold tracking-tight text-foreground">
          {Math.round(category.score)}
          <span className="text-sm font-semibold text-muted">/100</span>
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {category.indicators.map((indicator, i) => (
          <IndicatorProgressBar
            key={indicator.label}
            label={indicator.label}
            score={indicator.score}
            index={index + i}
          />
        ))}
      </div>
    </motion.div>
  );
}
