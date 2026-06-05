"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SocialPill } from "@/components/ui/SocialPill";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/BrandIcons";

const GITHUB_URL = "https://github.com/midaksh";
const LINKEDIN_URL = "https://www.linkedin.com/in/midakshpandita";

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className="flex min-w-0 items-center gap-3"
        >
          <Image
            src="/MP.png"
            alt="MP logo"
            width={40}
            height={40}
            className="shrink-0 rounded-full object-cover"
            priority
          />
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-semibold tracking-wide text-foreground">
              Neural City
            </p>
            <p className="text-xs text-muted">Street Intelligence</p>
          </div>
        </motion.div>

        <div className="flex shrink-0 items-center gap-2">
          <SocialPill
            href={GITHUB_URL}
            icon={<GitHubIcon />}
            label="midaksh"
            ariaLabel="midaksh on GitHub"
          />
          <SocialPill
            href={LINKEDIN_URL}
            icon={<LinkedInIcon />}
            label="LinkedIn"
            ariaLabel="midaksh on LinkedIn"
          />
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}
