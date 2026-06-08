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
          <div className="flex items-center gap-2 rounded-xl border border-sky-300/60 bg-[#d6eaf0] px-3.5 py-2.5 shadow-[0_2px_12px_rgba(186,230,253,0.35),0_0_20px_rgba(214,234,240,0.5)] backdrop-blur-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/10 text-slate-900">
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
            <span className="text-xs font-semibold text-slate-900">
              Copied to clipboard
            </span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
