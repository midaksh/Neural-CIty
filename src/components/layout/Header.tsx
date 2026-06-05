"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SocialPill } from "@/components/ui/SocialPill";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/BrandIcons";

const GITHUB_URL = "https://github.com/midaksh";
const LINKEDIN_URL = "https://www.linkedin.com/in/midakshpandita";

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-md"
    >
      <div className="flex h-14 items-center justify-between gap-3 px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 lg:hidden"
        >
          <Image
            src="/MP.png"
            alt="MP logo"
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
          <span className="text-xs font-semibold text-foreground">
            Neural City
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-2">
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
