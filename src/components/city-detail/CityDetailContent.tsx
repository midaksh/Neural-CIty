"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Bus,
  Database,
  Landmark,
  Shield,
  TrendingUp,
} from "lucide-react";
import { ScoreGauge } from "@/components/compare/ScoreGauge";
import { BudgetRatioChart } from "@/components/city-detail/BudgetRatioChart";
import { AccidentHarmBreakdown } from "@/components/city-detail/AccidentHarmBreakdown";
import { ConvenienceScorePanel } from "@/components/city-detail/ConvenienceScorePanel";
import { TransportMixChart } from "@/components/city-detail/TransportMixChart";
import {
  BandBadge,
  DetailSection,
  NoteCallout,
  ScoreProgressBar,
  StatCard,
} from "@/components/city-detail/shared";
import type { CityDetailData } from "@/lib/city-detail-data";
import { useExportShare } from "@/context/ExportShareContext";
import { buildCityExportPayload } from "@/lib/export/build-city-payload";
import { cn, formatInrPerResident, getScoreBandStyles } from "@/lib/utils";
import type { CitySectorScore } from "@/types/city";

function PillarCard({
  title,
  score,
  rank,
  total,
  delay,
}: {
  title: string;
  score: CitySectorScore;
  rank: number;
  total: number;
  delay: number;
}) {
  const styles = getScoreBandStyles(score.score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-xl border border-border bg-card/80 p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <BandBadge band={score.band} />
      </div>
      <p className={cn("mt-3 text-3xl font-bold tracking-tight", styles.text)}>
        {score.score.toFixed(1)}
      </p>
      <p className="mt-1 text-[11px] text-muted">Rank #{rank} of {total}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
        <div
          className={cn("h-full rounded-full", styles.dot)}
          style={{ width: `${score.score}%` }}
        />
      </div>
    </motion.div>
  );
}

export function CityDetailContent({ data }: { data: CityDetailData }) {
  const { setExportPayload } = useExportShare();
  const populationLabel = `${(data.population2011 / 1_000_000).toFixed(2)}M`;
  const areaLabel = `${data.areaKm2.toLocaleString()} km²`;

  useEffect(() => {
    const shareUrl = `${window.location.origin}/city/${data.cityId}`;
    setExportPayload(buildCityExportPayload(data, shareUrl));
    return () => setExportPayload(null);
  }, [data, setExportPayload]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-6"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to city list
        </Link>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="glass mb-6 overflow-hidden rounded-2xl p-5 md:p-6"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(220px,280px)_1fr] lg:items-stretch">
          <ScoreGauge score={data.overall.score} fillHeight />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-brand uppercase">
                City Profile
              </p>
              <BandBadge band={data.overall.band} />
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {data.cityName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Street-level intelligence across safety, convenience, and governance,
              ranked #{data.overallRank} overall among {data.totalCities} cities in this proof of concept.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Population (2011)" value={populationLabel} hint="Census baseline" />
              <StatCard label="City area" value={areaLabel} />
              <StatCard
                label="Data points"
                value={data.coverage.overall.toLocaleString()}
                hint="Across all sectors"
              />
              <StatCard
                label="Overall rank"
                value={`#${data.overallRank}`}
                hint={`of ${data.totalCities} cities`}
              />
            </div>
          </div>
        </div>
      </motion.section>

      <section className="mb-6 grid gap-3 sm:grid-cols-3">
        <PillarCard
          title="Safety"
          score={data.safety}
          rank={data.ranks.safety}
          total={data.totalCities}
          delay={0.05}
        />
        <PillarCard
          title="Convenience"
          score={data.convenience}
          rank={data.ranks.convenience}
          total={data.totalCities}
          delay={0.1}
        />
        <PillarCard
          title="Governance"
          score={data.governance}
          rank={data.ranks.governance}
          total={data.totalCities}
          delay={0.15}
        />
      </section>

      <div className="space-y-6">
        <DetailSection
          icon={Shield}
          title="Safety"
          subtitle="Road infrastructure from OpenStreetMap and annual accident harm outcomes"
        >
          <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
            <div className="flex flex-col gap-4">
              <ScoreProgressBar
                label="Infrastructure"
                score={data.safetyIndicators.infrastructure?.score ?? 0}
                description="Signals, signs, crossings & calming. OSM coverage per capita and density"
              />
              <ScoreProgressBar
                label="Accidents"
                score={data.safetyIndicators.accidents?.score ?? 0}
                description="Inverted harm score from deaths, injuries & incidents (higher = safer)"
              />
              <div className="mt-auto">
                <NoteCallout>
                  Accident data year: {data.accidents.data_year} · Source:{" "}
                  {data.accidents.source.split("/").slice(-1)[0] ?? "city report"}
                </NoteCallout>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <AccidentHarmBreakdown
                deaths={data.accidents.annual_counts.deaths}
                injuries={data.accidents.annual_counts.injuries}
                incidents={data.accidents.annual_counts.incidents}
              />
              <div className="mt-auto grid grid-cols-2 gap-3">
                <StatCard
                  label="Danger rate"
                  value={`${data.accidents.computed.danger_rate_per_100k.toFixed(1)}`}
                  hint="per 100k residents"
                />
                <StatCard
                  label="Accidents rank"
                  value={`#${data.ranks.accidents}`}
                  hint={`of ${data.totalCities} cities`}
                />
              </div>
            </div>
          </div>
        </DetailSection>

        <DetailSection
          icon={Bus}
          title="Convenience"
          subtitle="Public transport reach from OpenStreetMap: spatial coverage vs resident access"
        >
          <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
            <div className="flex flex-col gap-4">
              <ConvenienceScorePanel
                spatialScore={data.convenienceIndicators.spatial?.score ?? 0}
                accessScore={data.convenienceIndicators.access?.score ?? 0}
                coverageDensity={data.convenienceRaw.raw_metrics.coverage_density}
                convenienceRank={data.ranks.convenience}
                totalCities={data.totalCities}
              />
              <div className="mt-auto">
                <NoteCallout>
                  Composite blends 55% spatial + 45% access. Bus, rail, and metro stops are weighted
                  by catchment radius (bus 1×, metro 4×, railway 6.25×).
                </NoteCallout>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <TransportMixChart
                bus={data.convenienceRaw.counts.bus}
                metro={data.convenienceRaw.counts.metro}
                railway={data.convenienceRaw.counts.railway}
              />
              <div className="mt-auto grid grid-cols-2 gap-3">
                <StatCard
                  label="Weighted stops"
                  value={data.convenienceRaw.raw_metrics.weighted_stops.toFixed(0)}
                />
                <StatCard
                  label="Access per 100k"
                  value={data.convenienceRaw.raw_metrics.access_per_100k.toFixed(1)}
                />
              </div>
            </div>
          </div>
        </DetailSection>

        <DetailSection
          icon={Landmark}
          title="Governance"
          subtitle="Municipal budget discipline and per-capita investment capacity"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <ScoreProgressBar
                label="Spend ratio"
                score={data.governanceIndicators.spendRatio?.score ?? 0}
                description="Distance from spending/budget ratio of 1.0. Overspend penalized asymmetrically"
              />
              <ScoreProgressBar
                label="Investment"
                score={data.governanceIndicators.invest?.score ?? 0}
                description="Latest municipal spend per resident, sqrt-scaled across cohort"
              />
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Spend per resident"
                  value={formatInrPerResident(
                    data.governanceRaw.raw_metrics.spend_per_resident_rupees,
                  )}
                  hint="Latest year municipal spend"
                />
                <StatCard
                  label="Avg spend ratio"
                  value={data.governanceRaw.raw_metrics.avg_spending_to_budget_ratio.toFixed(3)}
                />
                <StatCard
                  label="Budget years"
                  value={String(data.governanceRaw.budget_years_used)}
                  hint="Used in calculation"
                />
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">
                Spending-to-budget ratio timeline
              </p>
              <BudgetRatioChart rows={data.governanceRaw.year_rows} />
            </div>
          </div>
        </DetailSection>

        <DetailSection
          icon={Database}
          title="Data & methodology"
          subtitle="Coverage, sector ranks, and important notes for this city"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Safety data pts" value={data.coverage.safety.toLocaleString()} />
            <StatCard label="Convenience data pts" value={data.coverage.convenience.toLocaleString()} />
            <StatCard label="Governance data pts" value={data.coverage.governance.toLocaleString()} />
            <StatCard label="Infra rank" value={`#${data.ranks.infrastructure}`} />
          </div>

          {data.notes.length > 0 ? (
            <div className="mt-5 space-y-2">
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                Important notes
              </p>
              {data.notes.map((note) => (
                <NoteCallout key={note}>{note}</NoteCallout>
              ))}
            </div>
          ) : null}

          <div className="mt-5 rounded-xl border border-border bg-surface/50 px-4 py-3 text-xs leading-relaxed text-muted">
            <p className="font-medium text-foreground">About this profile</p>
            <p className="mt-1.5">
              Scores are normalized 0–100 across {data.totalCities} Indian cities in this proof of
              concept. Population uses Census 2011; OSM layers reflect mapped public infrastructure,
              not ground-truth completeness. Governance figures use municipal budget CSVs with
              unit detection per city.
            </p>
          </div>
        </DetailSection>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/60 px-5 py-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Building2 className="h-4 w-4 text-brand" />
            <span>Want to compare {data.cityName} with another city?</span>
          </div>
          <Link
            href="/compare"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Open compare tool
          </Link>
        </div>
      </div>
    </div>
  );
}
