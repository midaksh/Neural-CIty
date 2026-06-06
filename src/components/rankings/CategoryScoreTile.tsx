"use client";

import { motion } from "framer-motion";
import { cn, getScoreBandStyles } from "@/lib/utils";

interface CategoryScoreTileProps {
  label: string;
  title?: string;
  score: number | null;
  index?: number;
}

export function CategoryScoreTile({
  label,
  title,
  score,
  index = 0,
}: CategoryScoreTileProps) {
  const hasScore = score !== null;
  const bandStyles = hasScore ? getScoreBandStyles(score) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.28 }}
      title={
        title
          ? hasScore
            ? `${title}: ${score.toFixed(1)} (${bandStyles?.label})`
            : `${title}: pending`
          : label
      }
      className={cn(
        "flex min-w-[52px] flex-col items-center justify-center rounded-lg border px-2 py-1.5 text-center",
        hasScore && bandStyles
          ? cn(bandStyles.bg, bandStyles.border)
          : "border-border bg-surface/80",
      )}
    >
      <span className="text-[9px] font-medium tracking-wide text-muted uppercase">
        {label}
      </span>
      {hasScore && bandStyles ? (
        <span className={cn("mt-0.5 text-[11px] font-semibold", bandStyles.text)}>
          {score.toFixed(1)}
        </span>
      ) : (
        <span className="mt-0.5 text-[11px] font-medium text-muted">N/A</span>
      )}
    </motion.div>
  );
}
