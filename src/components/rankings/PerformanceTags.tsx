"use client";

import { motion } from "framer-motion";
import type { CityScores } from "@/types/city";
import { performanceMetrics } from "@/data/cities";
import { cn } from "@/lib/utils";

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

        return (
          <motion.div
            key={metric.key}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03, duration: 0.28 }}
            title={`${metric.fullLabel}: ${value.toFixed(1)}`}
            className={cn(
              "flex min-w-[52px] flex-col items-center rounded-lg border px-2 py-1 text-center transition-colors",
              isHighlighted
                ? "border-brand/40 bg-brand-muted"
                : "border-border bg-elevated/80",
            )}
          >
            <span className="text-[10px] font-medium tracking-wide text-muted uppercase">
              {metric.label}
            </span>
            <span className="text-xs font-semibold text-brand md:text-sm">
              {value.toFixed(1)}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
