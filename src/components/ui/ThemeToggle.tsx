"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      className={cn(
        "glass relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
        "text-foreground transition-colors hover:border-brand/30 active:border-[#f37021] active:bg-[#f37021] active:text-white",
      )}
    >
      {/* Dark mode → Sun (switch to light) | Light mode → Moon (switch to dark) */}
      <Sun className="hidden h-[18px] w-[18px] dark:block" />
      <Moon className="h-[18px] w-[18px] dark:hidden" />
    </motion.button>
  );
}
