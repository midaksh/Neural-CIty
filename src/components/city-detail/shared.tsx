import { cn, getScoreBandStyles } from "@/lib/utils";
import type { CitySectorScore } from "@/types/city";
import type { LucideIcon } from "lucide-react";

export function BandBadge({ band }: { band: CitySectorScore["band"] }) {
  const styles = getScoreBandStyles(band === "poor" ? 20 : band === "manageable" ? 50 : 80);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
        styles.bg,
        styles.border,
        styles.text,
      )}
    >
      {styles.label}
    </span>
  );
}

export function DetailSection({
  icon: Icon,
  title,
  subtitle,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("glass overflow-hidden rounded-2xl", className)}>
      <div className="border-b border-border/70 px-5 py-4 md:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground md:text-lg">
              {title}
            </h3>
            {subtitle ? (
              <p className="mt-0.5 text-xs leading-relaxed text-muted">{subtitle}</p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}

export function ScoreProgressBar({
  label,
  score,
  description,
}: {
  label: string;
  score: number;
  description?: string;
}) {
  const clamped = Math.min(100, Math.max(0, score));
  const bandStyles = getScoreBandStyles(clamped);

  return (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          {description ? (
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{description}</p>
          ) : null}
        </div>
        <p className="shrink-0 text-sm font-bold text-foreground">
          {Math.round(clamped)}
          <span className="font-medium text-muted">/100</span>
        </p>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-surface">
        <div
          className={cn("h-full rounded-full transition-all duration-700", bandStyles.dot)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/70 px-4 py-3">
      <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-1 text-lg font-bold tracking-tight text-foreground">{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-muted">{hint}</p> : null}
    </div>
  );
}

export function NoteCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-brand/20 bg-brand-muted/40 px-4 py-3 text-xs leading-relaxed text-foreground/90">
      {children}
    </div>
  );
}
