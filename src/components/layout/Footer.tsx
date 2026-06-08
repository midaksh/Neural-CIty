"use client";

import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-auto border-t border-border bg-card"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:flex-row sm:items-start sm:justify-between md:px-8">
        <div>
          <p className="text-sm font-semibold text-foreground">Neural City</p>
          <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted">
            City Data Stack. GeoAI Analytics with Street Level Data. Export profiles and comparisons as PDF or CSV.
          </p>
        </div>

        <div className="sm:text-right">
          <p className="mb-1.5 text-xs font-semibold text-foreground">Contact</p>
          <a
            href="mailto:midakshpandita@gmail.com"
            className="text-xs text-muted transition-colors hover:text-brand active:text-brand-active"
          >
            midakshpandita@gmail.com
          </a>
        </div>
      </div>
    </motion.footer>
  );
}
