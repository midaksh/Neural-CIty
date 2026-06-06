"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { GitHubIcon } from "@/components/ui/BrandIcons";

const GITHUB_REPO_URL = "https://github.com/midaksh/Neural-CIty";
const NOTION_DOC_URL =
  "https://app.notion.com/p/Neural-City-Assignment-376804b9116f8060a505cd07b46b1dcb?source=copy_link";

interface SourceLinkPillProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  ariaLabel: string;
}

function SourceLinkPill({ href, label, icon, ariaLabel }: SourceLinkPillProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      initial={false}
      whileHover={{ y: -4 }}
      whileTap={{ y: 2, scale: 0.972 }}
      transition={{ type: "spring", stiffness: 520, damping: 26, mass: 0.82 }}
      className="liquid-glass-cta inline-flex w-full max-w-md flex-row items-center justify-center gap-3"
    >
      <span className="liquid-glass-cta__ambient" aria-hidden />
      <span className="relative z-[1] flex h-6 w-6 shrink-0 items-center justify-center [&>img]:h-6 [&>img]:w-6 [&>svg]:h-6 [&>svg]:w-6">
        {icon}
      </span>
      <span className="relative z-[1] shrink-0 text-lg font-bold tracking-tight text-foreground md:text-xl">
        {label}
      </span>
    </motion.a>
  );
}

export function DataSourcesPageContent() {
  return (
    <div className="compare-form-shell relative z-0 flex min-h-[calc(100vh-3.5rem)] flex-col">
      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 pt-6 md:px-8 md:pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>
      </div>

      <section className="relative z-10 mx-auto w-full max-w-4xl shrink-0 px-4 pt-6 pb-6 text-center md:px-6 md:pt-8 md:pb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <p className="mb-2.5 text-[10px] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs">
            Proof of Concept
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Data Sources
          </h1>
          <p className="mt-2 max-w-lg text-xs leading-relaxed text-muted md:text-sm">
            Project repository and documentation for Neural City street intelligence.
          </p>
        </motion.div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-4 pb-16 md:gap-8 md:px-8"
      >
        <SourceLinkPill
          href={GITHUB_REPO_URL}
          label="GitHub"
          icon={<GitHubIcon className="h-6 w-6" />}
          ariaLabel="Open Neural City on GitHub"
        />
        <SourceLinkPill
          href={NOTION_DOC_URL}
          label="Notion Doc"
          icon={
            <Image
              src="/notion-svgrepo-com.svg"
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
              aria-hidden
            />
          }
          ariaLabel="Open Neural City Notion documentation"
        />
      </motion.section>
    </div>
  );
}
