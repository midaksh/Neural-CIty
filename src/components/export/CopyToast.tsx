"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useExportShare } from "@/context/ExportShareContext";

export function CopyToast() {
  const { toastVisible } = useExportShare();

  return (
    <AnimatePresence>
      {toastVisible ? (
        <motion.div
          initial={{ opacity: 0, y: -10, x: -8 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -8, x: -8 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed top-[4.25rem] left-4 z-[60] lg:left-[calc(272px+1rem)]"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-card/95 px-3.5 py-2.5 shadow-lg backdrop-blur-md">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f37021]/15 text-[#f37021]">
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
            <span className="text-xs font-semibold text-foreground">
              Copied to clipboard
            </span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
