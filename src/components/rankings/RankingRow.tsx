"use client";

import { motion } from "framer-motion";
import type { City, ScoreCategory } from "@/types/city";
import { PerformanceTags } from "@/components/rankings/PerformanceTags";
import { cn } from "@/lib/utils";

interface RankingRowProps {
  city: City;
  displayRank: number;
  sortBy: ScoreCategory;
  index: number;
}

function getHighlightKey(
  sortBy: ScoreCategory,
): keyof Omit<City["scores"], "overall"> | null {
  const map: Record<
    ScoreCategory,
    keyof Omit<City["scores"], "overall"> | null
  > = {
    overall_score: null,
    cleanliness: "cleanliness",
    walkability: "walkability",
    road_quality: "roadQuality",
    dust_control: "dustControl",
    encroachment_control: "encroachmentControl",
    aesthetics: "aesthetics",
  };
  return map[sortBy];
}

function getSortScore(city: City, sortBy: ScoreCategory): number {
  switch (sortBy) {
    case "cleanliness":
      return city.scores.cleanliness;
    case "walkability":
      return city.scores.walkability;
    case "road_quality":
      return city.scores.roadQuality;
    case "dust_control":
      return city.scores.dustControl;
    case "encroachment_control":
      return city.scores.encroachmentControl;
    case "aesthetics":
      return city.scores.aesthetics;
    default:
      return city.scores.overall;
  }
}

export function RankingRow({
  city,
  displayRank,
  sortBy,
  index,
}: RankingRowProps) {
  const highlightKey = getHighlightKey(sortBy);
  const activeScore = getSortScore(city, sortBy);

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.4,
        delay: index * 0.04,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ backgroundColor: "var(--elevated)" }}
      className={cn(
        "cursor-pointer border-b border-border transition-colors",
        displayRank === 1 && "border-b-2",
      )}
    >
      <td className="p-3 md:p-4">
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-brand md:text-xl">
            #{displayRank}
          </span>
        </div>
      </td>

      <td className="p-3 md:p-4">
        <div>
          <p className="text-base font-semibold text-foreground md:text-lg">
            {city.name}
          </p>
          <p className="mt-1 text-xs text-muted">
            pts • km • wards
          </p>
        </div>
      </td>

      <td className="p-3 md:p-4">
        <div className="flex flex-col items-center">
          <motion.span
            key={`${city.id}-${activeScore}`}
            initial={{ scale: 0.9, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="text-2xl font-bold text-brand md:text-3xl"
          >
            {activeScore.toFixed(1)}
          </motion.span>
          <span className="text-xs text-muted">/100.0</span>
        </div>
      </td>

      <td className="p-3 md:p-4">
        <PerformanceTags scores={city.scores} highlightKey={highlightKey} />
      </td>
    </motion.tr>
  );
}

export { getSortScore };
