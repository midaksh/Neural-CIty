"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { isNavItemActive } from "@/lib/navigation";
import { bottomNavItems, mainNavItems } from "@/data/navigation";

function NavButton({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}) {
  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </>
  );

  const className = cn(
    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
    isActive
      ? "bg-[#f37021] text-white shadow-[0_4px_14px_rgba(243,112,33,0.35)]"
      : "text-muted hover:bg-surface hover:text-foreground active:bg-[#f37021] active:text-white",
  );

  if (href === "#") {
    return (
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        className={className}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <motion.div whileTap={{ scale: 0.98 }}>
      <Link href={href} className={className}>
        {content}
      </Link>
    </motion.div>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-3 left-3 z-40 hidden h-[calc(100vh-1.5rem)] w-[248px] lg:block">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="sidebar-panel flex h-full flex-col rounded-3xl bg-card p-4"
      >
        <div className="mb-6 flex items-center gap-2.5 px-1 pt-1">
          <Image
            src="/MP.png"
            alt="MP logo"
            width={36}
            height={36}
            className="rounded-full object-cover"
            priority
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              Neural City
            </p>
            <p className="text-[11px] text-muted">Street Intelligence</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {mainNavItems.map((item) => (
            <NavButton
              key={item.id}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={isNavItemActive(pathname, item)}
            />
          ))}
        </nav>

        <div className="mt-auto space-y-1 border-t border-border pt-4">
          {bottomNavItems.map((item) => (
            <NavButton
              key={item.id}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={isNavItemActive(pathname, item)}
            />
          ))}

          <div className="mt-3 rounded-2xl bg-surface p-3">
            <p className="text-[11px] font-semibold text-foreground">
              Proof of Concept
            </p>
            <p className="mt-0.5 text-[10px] leading-relaxed text-muted">
              Neural City dashboard
            </p>
          </div>
        </div>
      </motion.div>
    </aside>
  );
}
