"use client";

import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="mx-auto max-w-4xl px-4 pt-8 pb-8 text-center md:px-6 md:pt-10 md:pb-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          className="mb-2.5 text-[10px] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
        >
          Proof of Concept
        </motion.p>

        <h1 className="max-w-2xl text-2xl font-semibold tracking-tight text-foreground md:text-3xl md:leading-tight lg:text-4xl">
          State of Indian Streets 2026
        </h1>

        <p className="mt-2 max-w-lg text-xs leading-relaxed text-muted md:text-sm">
          Layering public secondary data onto street outcomes · Export city profiles and comparisons as PDF or CSV
        </p>
      </motion.div>
    </section>
  );
}
