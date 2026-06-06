"use client";

import { motion, AnimatePresence } from "framer-motion";

interface WinnerModalProps {
  open: boolean;
  winnerName: string;
  onClose: () => void;
}

export function WinnerModal({ open, winnerName, onClose }: WinnerModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl border border-border bg-card px-8 py-8 text-center shadow-xl"
          >
            <p className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Winner
            </p>
            <p className="mt-3 text-xl font-semibold text-brand md:text-2xl">
              {winnerName}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
