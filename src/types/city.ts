export type Sector =
  | "overall_score"
  | "safety"
  | "convenience"
  | "governance";

export interface City {
  id: string;
  name: string;
}

export interface SectorOption {
  value: Sector;
  label: string;
}

export interface CitySectorScore {
  score: number;
  band: "poor" | "manageable" | "good";
}

export interface SafetyIndicators {
  infrastructure: CitySectorScore | null;
  accidents: CitySectorScore | null;
}

export interface ConvenienceIndicators {
  spatial: CitySectorScore | null;
  access: CitySectorScore | null;
}

export interface CityCoverage {
  dataPoints: number | null;
}
