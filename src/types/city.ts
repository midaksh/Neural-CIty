export type ScoreCategory =
  | "overall_score"
  | "cleanliness"
  | "walkability"
  | "road_quality"
  | "dust_control"
  | "encroachment_control"
  | "aesthetics";

export interface CityScores {
  overall: number;
  cleanliness: number;
  walkability: number;
  roadQuality: number;
  dustControl: number;
  encroachmentControl: number;
  aesthetics: number;
}

export interface City {
  id: string;
  rank: number;
  name: string;
  scores: CityScores;
  coverage: {
    points: number;
    kilometers: number;
    wards: number;
  };
}

export interface SortOption {
  value: ScoreCategory;
  label: string;
}
