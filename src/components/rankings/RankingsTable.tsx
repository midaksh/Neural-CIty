"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cities } from "@/data/cities";
import {
  safetyCoverageByCityId,
  safetyIndicatorsByCityId,
  safetyScoresByCityId,
} from "@/data/safety-scores";
import type {
  City,
  CityCoverage,
  CitySectorScore,
  SafetyIndicators,
  Sector,
} from "@/types/city";
import { RankingRow } from "@/components/rankings/RankingRow";
import { SortPills } from "@/components/rankings/SortPills";
import { ScoreLegend } from "@/components/rankings/ScoreLegend";

function getSectorScore(cityId: string, sector: Sector): CitySectorScore | null {
  if (sector === "safety") {
    return safetyScoresByCityId[cityId] ?? null;
  }
  return null;
}

function getSafetyIndicators(cityId: string): SafetyIndicators | null {
  return safetyIndicatorsByCityId[cityId] ?? null;
}

function getCoverage(cityId: string, sector: Sector): CityCoverage | null {
  if (sector === "safety") {
    return safetyCoverageByCityId[cityId] ?? null;
  }
  return null;
}

function orderCities(list: City[], sector: Sector): City[] {
  if (sector !== "safety") {
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }

  return [...list].sort((a, b) => {
    const scoreA = getSectorScore(a.id, sector)?.score ?? -1;
    const scoreB = getSectorScore(b.id, sector)?.score ?? -1;
    return scoreB - scoreA;
  });
}

export function RankingsTable() {
  const [sector, setSector] = useState<Sector>("overall_score");

  const orderedCities = useMemo(
    () => orderCities(cities, sector),
    [sector],
  );

  const scoredCount = useMemo(() => {
    if (sector !== "safety") return 0;
    return orderedCities.filter((city) => getSectorScore(city.id, sector)).length;
  }, [orderedCities, sector]);

  const hasRankings = sector === "safety" && scoredCount > 0;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45 }}
        className="mb-2 text-center"
      >
        <h2 className="text-base font-semibold tracking-tight text-foreground md:text-lg">
          City Rankings
        </h2>
        <p className="mt-1.5 text-xs text-muted">
          {cities.length} cities compared by street-level outcomes
        </p>
      </motion.div>

      <SortPills value={sector} onChange={setSector} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.45 }}
        className="glass overflow-hidden rounded-2xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface/60 text-left text-xs font-medium tracking-wider text-muted uppercase">
                <th className="p-2.5 md:p-3">Rank</th>
                <th className="p-2.5 md:p-3">City</th>
                <th className="p-2.5 md:p-3 text-center">Score</th>
                <th className="p-2.5 md:p-3">Coverage</th>
                <th className="p-2.5 md:p-3 text-right">Performance</th>
              </tr>
            </thead>
            <tbody>
              {orderedCities.map((city, index) => (
                <RankingRow
                  key={city.id}
                  city={city}
                  displayRank={hasRankings ? index + 1 : null}
                  sector={sector}
                  sectorScore={getSectorScore(city.id, sector)}
                  safetyIndicators={getSafetyIndicators(city.id)}
                  coverage={getCoverage(city.id, sector)}
                  index={index}
                />
              ))}
            </tbody>
          </table>
        </div>

        {sector === "safety" && scoredCount > 0 && (
          <div className="border-t border-border bg-surface/40 px-4 py-3">
            <p className="text-[11px] text-muted">
              Infrastructure scores from OSM signals &amp; signs. Data pts = mapped
              OSM nodes. Accidents indicator pending NCRB processing across{" "}
              {scoredCount} cities.
            </p>
          </div>
        )}

        {sector !== "safety" && (
          <div className="border-t border-border bg-surface/40 px-4 py-3">
            <p className="text-[11px] text-muted">
              No scores for this sector yet. Select{" "}
              <span className="font-medium text-foreground">Safety</span> to view
              processed OpenStreetMap infrastructure data.
            </p>
          </div>
        )}
      </motion.div>

      {sector === "safety" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.45 }}
        >
          <ScoreLegend />
        </motion.div>
      )}
    </section>
  );
}
