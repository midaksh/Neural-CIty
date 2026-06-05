"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MapPinOff } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-12">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-[#f37021]/30 blur-[100px]"
            animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/3 -right-16 h-80 w-80 rounded-full bg-violet-500/20 blur-[110px]"
            animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-rose-500/15 blur-[90px]"
            animate={{ x: [0, 25, 0], y: [0, -20, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-[#f37021]/10 via-transparent to-violet-500/10"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex max-w-md flex-col items-center text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f37021]/15 text-brand"
          >
            <MapPinOff className="h-8 w-8" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-[#f37021] via-[#ff9a5a] to-violet-400 bg-clip-text text-6xl font-bold tracking-tighter text-transparent md:text-7xl"
          >
            404
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-3 text-lg font-semibold text-foreground md:text-xl"
          >
            Page not found
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-sm leading-relaxed text-muted"
          >
            The street, ward, or route you are looking for does not exist in this
            dashboard yet.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-[#f37021] px-5 py-2.5 text-sm font-medium text-white shadow-[0_4px_20px_rgba(243,112,33,0.4)] transition-colors hover:bg-[#f5833d] active:bg-[#d9621a]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Overview
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
