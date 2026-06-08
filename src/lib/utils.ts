import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ScoreBand = "poor" | "manageable" | "good";

export function getScoreBand(score: number): ScoreBand {
  if (score <= 35) return "poor";
  if (score <= 65) return "manageable";
  return "good";
}

export interface ScoreBandStyles {
  text: string;
  bg: string;
  border: string;
  dot: string;
  label: string;
}

const bandStyles: Record<ScoreBand, ScoreBandStyles> = {
  poor: {
    text: "text-score-poor",
    bg: "bg-score-poor-muted",
    border: "border-score-poor/35",
    dot: "bg-score-poor",
    label: "Poor",
  },
  manageable: {
    text: "text-score-manageable",
    bg: "bg-score-manageable-muted",
    border: "border-score-manageable/35",
    dot: "bg-score-manageable",
    label: "Manageable",
  },
  good: {
    text: "text-score-good",
    bg: "bg-score-good-muted",
    border: "border-score-good/35",
    dot: "bg-score-good",
    label: "Good",
  },
};

export function getScoreBandStyles(score: number): ScoreBandStyles {
  return bandStyles[getScoreBand(score)];
}

export function getScoreBandStylesByBand(band: ScoreBand): ScoreBandStyles {
  return bandStyles[band];
}

/** Format municipal spend or similar INR amounts per resident. */
export function formatInrPerResident(amount: number): string {
  if (!Number.isFinite(amount)) return "N/A";
  if (amount >= 100_000) {
    return `₹${(amount / 100_000).toLocaleString("en-IN", { maximumFractionDigits: 2 })} lakh`;
  }
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}
