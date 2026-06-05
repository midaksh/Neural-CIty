"use client";

import { motion } from "framer-motion";
import { BookOpen, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  return (
    <section className="mx-auto max-w-4xl px-4 pt-10 pb-10 text-center md:px-8 md:pt-10 md:pb-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          className="mb-3 text-xs font-semibold tracking-[0.22em] text-brand uppercase md:text-sm"
        >
          Proof of Concept
        </motion.p>

        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-[1.15] lg:text-[3.12rem]">
          State of Indian Streets 2026
        </h1>

        <p className="mt-1 max-w-xl text-base leading-relaxed text-muted md:mt-2 md:text-lg">
          Outcome based automated street assessment.
        </p>

      </motion.div>
    </section>
  );
}
