"use client";

import { motion } from "framer-motion";
import { Bot } from "lucide-react";

export function FloatingChatButton() {
  return (
    <motion.button
      type="button"
      aria-label="Open chat"
      initial={{ opacity: 0, scale: 0.9, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.7, type: "spring", stiffness: 280, damping: 22 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      className="glass fixed right-5 bottom-5 z-50 flex h-14 w-14 items-center justify-center rounded-full text-foreground transition-colors hover:border-brand/30 active:border-brand active:bg-brand active:text-white"
    >
      <Bot className="h-6 w-6" />
    </motion.button>
  );
}
