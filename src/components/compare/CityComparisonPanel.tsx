"use client";

import { motion } from "framer-motion";
import type { CityCompareData } from "@/lib/compare-data";
import { CategoryBreakdownCell } from "@/components/compare/CategoryBreakdownCell";
import { ScoreGauge } from "@/components/compare/ScoreGauge";
import { ScoreLineChart } from "@/components/compare/ScoreLineChart";

interface CityComparisonPanelProps {
  data: CityCompareData;
  index: number;
}

export function CityComparisonPanel({ data, index }: CityComparisonPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="py-8"
    >
      <h3 className="mb-5 text-center text-xl font-semibold tracking-tight text-foreground md:text-2xl">
        {data.cityName}
      </h3>

      <div className="grid gap-4 lg:grid-cols-[minmax(220px,280px)_1fr]">
        <ScoreGauge score={data.overall} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {data.categories.map((category, categoryIndex) => (
            <CategoryBreakdownCell
              key={category.title}
              category={category}
              index={categoryIndex}
            />
          ))}
        </div>
      </div>

      <ScoreLineChart points={data.chartPoints} />
    </motion.section>
  );
}
