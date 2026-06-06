"use client";

import { useState } from "react";
import { GitCompare, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { CitySelectDropdown } from "@/components/compare/CitySelectDropdown";
import { CityComparisonPanel } from "@/components/compare/CityComparisonPanel";
import { getCityCompareData } from "@/lib/compare-data";

type ViewState = "form" | "loading" | "results";

export function ComparePageContent() {
  const [cityAId, setCityAId] = useState<string | null>(null);
  const [cityBId, setCityBId] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>("form");
  const [resultIds, setResultIds] = useState<{ a: string; b: string } | null>(
    null,
  );

  const canCompare =
    cityAId !== null && cityBId !== null && cityAId !== cityBId;

  const cityAData = resultIds ? getCityCompareData(resultIds.a) : null;
  const cityBData = resultIds ? getCityCompareData(resultIds.b) : null;

  function handleCompare() {
    if (!canCompare || !cityAId || !cityBId) return;

    setView("loading");

    window.setTimeout(() => {
      setResultIds({ a: cityAId, b: cityBId });
      setView("results");
    }, 1500);
  }

  if (view === "form") {
    return (
      <div className="compare-form-shell relative z-0 flex min-h-[calc(100vh-3.5rem)] flex-col">
        <section className="relative z-10 mx-auto w-full max-w-4xl shrink-0 px-4 pt-8 pb-6 text-center md:px-6 md:pt-10 md:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center"
          >
            <p className="mb-2.5 text-[10px] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs">
              Proof of Concept
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Compare Cities
            </h1>
            <p className="mt-2 max-w-lg text-xs leading-relaxed text-muted md:text-sm">
              Pick the cities for a street fight.
            </p>
          </motion.div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-16 md:px-8"
        >
          <div className="flex w-full max-w-3xl flex-col items-center">
            <div className="flex w-full flex-col items-stretch justify-center gap-8 sm:flex-row sm:items-end sm:gap-5">
              <CitySelectDropdown
                value={cityAId}
                onChange={setCityAId}
                excludeCityId={cityBId}
                placeholder="City A"
              />

              <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center self-center rounded-full border border-border/80 bg-card/80 text-brand shadow-sm backdrop-blur-sm sm:mb-1">
                <GitCompare className="h-5 w-5" aria-hidden />
              </div>

              <CitySelectDropdown
                value={cityBId}
                onChange={setCityBId}
                excludeCityId={cityAId}
                placeholder="City B"
              />
            </div>

            <button
              type="button"
              disabled={!canCompare}
              onClick={handleCompare}
              className="mt-10 rounded-xl bg-[#f37021] px-10 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(243,112,33,0.35)] transition-all hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
            >
              Compare
            </button>
          </div>
        </motion.section>
      </div>
    );
  }

  return (
    <>
      <section className="mx-auto max-w-4xl px-4 pt-8 pb-6 text-center md:px-6 md:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <p className="mb-2.5 text-[10px] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs">
            Proof of Concept
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Compare Cities
          </h1>
          <p className="mt-2 max-w-lg text-xs leading-relaxed text-muted md:text-sm">
            Pick the cities for a street fight.
          </p>
        </motion.div>
      </section>

      {view === "loading" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex min-h-[50vh] flex-col items-center justify-center"
        >
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="mt-4 text-sm font-medium text-muted">Fetching data...</p>
        </motion.div>
      )}

      {view === "results" && cityAData && cityBData && (
        <section className="mx-auto max-w-5xl px-4 pb-16 md:px-8">
          <CityComparisonPanel data={cityAData} index={0} />

          <div className="border-t border-border" />

          <CityComparisonPanel data={cityBData} index={1} />
        </section>
      )}
    </>
  );
}
