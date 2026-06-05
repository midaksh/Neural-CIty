"use client";

import { motion } from "framer-motion";
import type { CityScores } from "@/types/city";
import { performanceMetrics } from "@/data/cities";
import { cn, getScoreBandStyles } from "@/lib/utils";

interface PerformanceTagsProps {
  scores: CityScores;
  highlightKey?: keyof Omit<CityScores, "overall"> | null;
}

export function PerformanceTags({ scores, highlightKey }: PerformanceTagsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-1.5 md:gap-2">
      {performanceMetrics.map((metric, index) => {
        const value = scores[metric.key];
        const isHighlighted = highlightKey === metric.key;
        const bandStyles = getScoreBandStyles(value);

        return (
          <motion.div
            key={metric.key}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03, duration: 0.28 }}
            title={`${metric.fullLabel}: ${value.toFixed(1)} (${bandStyles.label})`}
            className={cn(
              "flex min-w-[46px] flex-col items-center rounded-md border px-1.5 py-0.5 text-center transition-colors",
              bandStyles.bg,
              bandStyles.border,
              isHighlighted && "border-2 shadow-sm",
            )}
          >
            <span className="text-[9px] font-medium tracking-wide text-muted uppercase">
              {metric.label}
            </span>
            <span className={cn("text-[11px] font-semibold", bandStyles.text)}>
              {value.toFixed(1)}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
