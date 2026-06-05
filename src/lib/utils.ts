import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getScoreBand(score: number): "poor" | "manageable" | "good" {
  if (score <= 35) return "poor";
  if (score <= 65) return "manageable";
  return "good";
}
