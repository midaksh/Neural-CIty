"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SocialPillProps {
  href: string;
  icon: ReactNode;
  label: string;
  ariaLabel: string;
}

export function SocialPill({ href, icon, label, ariaLabel }: SocialPillProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      className={cn(
        "glass inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-sm font-medium text-foreground",
        "transition-colors hover:border-brand/30 active:border-[#f37021] active:bg-[#f37021] active:text-white",
      )}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </motion.a>
  );
}
