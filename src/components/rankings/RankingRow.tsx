"use client";

import { motion } from "framer-motion";
import type {
  City,
  CityCoverage,
  CitySectorScore,
  ConvenienceIndicators,
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
  convenienceIndicators: ConvenienceIndicators | null;
  coverage: CityCoverage | null;
  index: number;
}

export function RankingRow({
  city,
  displayRank,
  sector,
  sectorScore,
  safetyIndicators,
  convenienceIndicators,
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
        "group border-b border-border transition-colors hover:bg-elevated/50",
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
        <div className="inline-flex flex-col">
          <span className="text-lg font-semibold tracking-tight text-foreground md:text-lg">
            {city.name}
          </span>
          <span className="city-name-arrow mt-1.5" aria-hidden />
        </div>
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
                className={cn("text-xl font-bold md:text-2xl", scoreStyles.text)}
              >
                {sectorScore.score.toFixed(1)}
              </motion.span>
              <span className="mt-0.5 text-[11px] text-muted">/100.0</span>
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
        ) : sector === "convenience" && convenienceIndicators ? (
          <div className="flex flex-wrap justify-end gap-1.5 md:gap-2">
            <CategoryScoreTile
              label="Spat"
              title="Spatial coverage (per km²)"
              score={convenienceIndicators.spatial?.score ?? null}
              index={0}
            />
            <CategoryScoreTile
              label="Access"
              title="Resident access (per lakh pop)"
              score={convenienceIndicators.access?.score ?? null}
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
