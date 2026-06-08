"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CitySelectDropdown } from "@/components/compare/CitySelectDropdown";

export function CityDetailsPageContent() {
  const router = useRouter();
  const [cityId, setCityId] = useState<string | null>(null);

  function handleViewDetails() {
    if (!cityId) return;
    router.push(`/city/${cityId}`);
  }

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
            Explore City Details
          </h1>
          <p className="mt-2 max-w-lg text-xs leading-relaxed text-muted md:text-sm">
            Select a city to view its safety, convenience, and governance profile. Export the full report as PDF or CSV from the header.
          </p>
        </motion.div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-16 md:px-8"
      >
        <div className="flex w-full max-w-md flex-col items-center">
          <CitySelectDropdown
            value={cityId}
            onChange={setCityId}
            excludeCityId={null}
            placeholder="Choose a city"
          />

          <button
            type="button"
            disabled={!cityId}
            onClick={handleViewDetails}
            className="mt-10 rounded-xl bg-[#f37021] px-10 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(243,112,33,0.35)] transition-all hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
          >
            View Details
          </button>
        </div>
      </motion.section>
    </div>
  );
}
