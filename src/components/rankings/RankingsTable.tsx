"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cities } from "@/data/cities";
import type { City, ScoreCategory } from "@/types/city";
import { RankingRow, getSortScore } from "@/components/rankings/RankingRow";
import { SortPills } from "@/components/rankings/SortPills";
import { ScoreLegend } from "@/components/rankings/ScoreLegend";

function sortCities(list: City[], sortBy: ScoreCategory): City[] {
  return [...list].sort(
    (a, b) => getSortScore(b, sortBy) - getSortScore(a, sortBy),
  );
}

export function RankingsTable() {
  const [sortBy, setSortBy] = useState<ScoreCategory>("overall_score");

  const sortedCities = useMemo(
    () => sortCities(cities, sortBy),
    [sortBy],
  );

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
          {sortedCities.length} cities compared by street-level outcomes
        </p>
      </motion.div>

      <SortPills value={sortBy} onChange={setSortBy} />

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
                <th className="p-2.5 md:p-3 text-right">Performance</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {sortedCities.map((city, index) => (
                  <RankingRow
                    key={city.id}
                    city={city}
                    displayRank={index + 1}
                    sortBy={sortBy}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.45 }}
      >
        <ScoreLegend />
      </motion.div>
    </section>
  );
}
