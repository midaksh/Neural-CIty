"use client";

import { motion } from "framer-motion";
import type {
  City,
  CityCoverage,
  CitySectorScore,
  SafetyIndicators,
  Sector,
} from "@/types/city";
import { CategoryScoreTile } from "@/components/rankings/CategoryScoreTile";
import { cn, getScoreBandStyles } from "@/lib/utils";

interface RankingRowProps {
  city: City;
  displayRank: number | null;
  sector: Sector;
  sectorScore: CitySectorScore | null;
  safetyIndicators: SafetyIndicators | null;
  coverage: CityCoverage | null;
  index: number;
}

export function RankingRow({
  city,
  displayRank,
  sector,
  sectorScore,
  safetyIndicators,
  coverage,
  index,
}: RankingRowProps) {
  const hasScore = sectorScore !== null;
  const scoreStyles = hasScore ? getScoreBandStyles(sectorScore.score) : null;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.03,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "border-b border-border transition-colors hover:bg-elevated/50",
        displayRank === 1 && "border-b-2",
      )}
    >
      <td className="p-2.5 md:p-3">
        <div className="flex flex-col items-center">
          {displayRank !== null ? (
            <span className="text-sm font-bold text-muted md:text-base">
              #{displayRank}
            </span>
          ) : (
            <span className="text-sm font-medium text-muted">—</span>
          )}
        </div>
      </td>

      <td className="p-2.5 md:p-3">
        <p className="text-sm font-semibold text-foreground">{city.name}</p>
      </td>

      <td className="p-2.5 md:p-3">
        <div className="flex flex-col items-center">
          {hasScore && scoreStyles ? (
            <>
              <motion.span
                key={`${city.id}-${sector}-${sectorScore.score}`}
                initial={{ scale: 0.95, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={cn("text-lg font-bold md:text-xl", scoreStyles.text)}
              >
                {sectorScore.score.toFixed(1)}
              </motion.span>
              <span className="mt-0.5 text-[10px] text-muted">/100.0</span>
            </>
          ) : (
            <span className="text-sm font-medium text-muted">—</span>
          )}
        </div>
      </td>

      <td className="p-2.5 md:p-3">
        {coverage?.dataPoints != null ? (
          <p className="text-[11px] text-muted">
            Data pts:{" "}
            <span className="text-foreground/80">
              {coverage.dataPoints.toLocaleString()}
            </span>
          </p>
        ) : (
          <p className="text-[11px] text-muted">Data pts: —</p>
        )}
      </td>

      <td className="p-2.5 md:p-3">
        {sector === "safety" && safetyIndicators ? (
          <div className="flex flex-wrap justify-end gap-1.5 md:gap-2">
            <CategoryScoreTile
              label="Acci"
              title="Accidents"
              score={safetyIndicators.accidents?.score ?? null}
              index={0}
            />
            <CategoryScoreTile
              label="Infra"
              title="Infrastructure"
              score={safetyIndicators.infrastructure?.score ?? null}
              index={1}
            />
          </div>
        ) : (
          <div className="flex justify-end">
            <span className="text-[11px] font-medium text-muted">Pending</span>
          </div>
        )}
      </td>
    </motion.tr>
  );
}
