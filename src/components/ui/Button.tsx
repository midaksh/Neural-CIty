"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outline" | "ghost" | "primary" | "glass";
  children: ReactNode;
}

export function Button({
  variant = "outline",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className="inline-flex"
    >
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200",
          variant === "outline" &&
            "border border-border bg-card text-foreground hover:border-brand/40 hover:text-brand active:border-brand active:bg-brand active:text-white",
          variant === "ghost" &&
            "border border-transparent text-muted hover:text-brand active:text-brand-active",
          variant === "primary" &&
            "border border-brand bg-brand text-white hover:bg-brand-hover active:bg-brand-active",
          variant === "glass" &&
            "glass text-foreground hover:border-brand/30 hover:text-brand active:border-brand active:bg-brand active:text-white",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    </motion.div>
  );
}
