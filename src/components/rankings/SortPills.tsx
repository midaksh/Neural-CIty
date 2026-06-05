"use client";

import { motion } from "framer-motion";
import type { ScoreCategory } from "@/types/city";
import { sortOptions } from "@/data/cities";
import { cn } from "@/lib/utils";

interface SortPillsProps {
  value: ScoreCategory;
  onChange: (value: ScoreCategory) => void;
}

export function SortPills({ value, onChange }: SortPillsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.45 }}
      className="mb-5"
    >
      <p className="mb-2.5 text-left text-[10px] font-medium tracking-wide text-muted uppercase">
        Sort by
      </p>
      <div className="pill-scroll flex justify-start gap-1.5 overflow-x-auto pb-1 md:flex-wrap">
        {sortOptions.map((option) => {
          const isActive = value === option.value;

          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "shrink-0 rounded-full px-3 py-2 text-xs font-medium transition-all duration-200",
                isActive
                  ? "border border-[#f37021] bg-[#f37021] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
                  : "glass text-muted hover:border-brand/25 hover:text-foreground active:border-[#f37021] active:bg-[#f37021] active:text-white",
              )}
            >
              {option.label}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
