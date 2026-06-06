import { cities } from "@/data/cities";
import {
  convenienceCoverageByCityId,
  convenienceIndicatorsByCityId,
  convenienceScoresByCityId,
} from "@/data/convenience-scores";
import {
  governanceCoverageByCityId,
  governanceIndicatorsByCityId,
  governanceScoresByCityId,
} from "@/data/governance-scores";
import {
  overallCoverageByCityId,
  overallScoresByCityId,
} from "@/data/overall-scores";
import {
  safetyCoverageByCityId,
  safetyIndicatorsByCityId,
  safetyScoresByCityId,
} from "@/data/safety-scores";
import type { CitySectorScore } from "@/types/city";
import accidentsData from "../../public/data/accidents_scores.json";
import convenienceData from "../../public/data/convenience_scores.json";
import governanceData from "../../public/data/governance_scores.json";
import signalsData from "../../public/data/signals_scores.json";

type Band = CitySectorScore["band"];

interface SignalsCity {
  city_id: string;
  city_name: string;
  osm_nodes_in_india: number;
  population_2011: number;
  area_km2: number;
  counts: {
    traffic_signals: number;
    stop_signs: number;
    crossings: number;
    traffic_calming: number;
    total_infrastructure: number;
  };
  raw_metrics: {
    infrastructure_per_100k_population: number;
    traffic_signals_per_km2: number;
  };
  normalized_scores: {
    per_capita_score: number;
    signal_density_score: number;
    composite_score: number;
  };
  safety_rank: number;
}

interface AccidentsCity {
  city_id: string;
  city_name: string;
  source: string;
  data_year: number | string;
  annualization: string;
  notes: string;
  population_2011: number;
  annual_counts: {
    deaths: number;
    injuries: number;
    incidents: number;
  };
  computed: {
    harm_score: number;
    danger_rate_per_100k: number;
    severity_index: number;
    final_score: number;
  };
  band: Band;
  accidents_rank: number;
}

interface ConvenienceCity {
  city_id: string;
  city_name: string;
  osm_nodes_in_india: number;
  area_km2: number;
  population_2011: number;
  counts: {
    bus: number;
    railway: number;
    metro: number;
    unclassified: number;
  };
  raw_metrics: {
    weighted_stops: number;
    coverage_density: number;
    access_per_100k: number;
  };
  normalized_scores: {
    spatial_score: number;
    access_score: number;
    composite_score: number;
  };
  convenience_rank: number;
}

interface GovernanceYearRow {
  year: string;
  spending: number;
  budget: number;
  ratio: number;
  is_actual: boolean;
}

interface GovernanceCity {
  city_id: string;
  city_name: string;
  budget_years_used: number;
  population_2011: number;
  unit_detected: string;
  notes: string[];
  year_rows: GovernanceYearRow[];
  raw_metrics: {
    avg_spending_to_budget_ratio: number;
    latest_spending_rupees: number;
    spend_per_100k_residents: number;
    invest_haircut_multiplier: number;
  };
  normalized_scores: {
    spend_ratio_score: number;
    invest_score: number;
    composite_score: number;
  };
  governance_rank: number;
}

export interface CityDetailData {
  cityId: string;
  cityName: string;
  population2011: number;
  areaKm2: number;
  overall: CitySectorScore;
  overallRank: number;
  totalCities: number;
  safety: CitySectorScore;
  convenience: CitySectorScore;
  governance: CitySectorScore;
  safetyIndicators: NonNullable<(typeof safetyIndicatorsByCityId)[string]>;
  convenienceIndicators: NonNullable<(typeof convenienceIndicatorsByCityId)[string]>;
  governanceIndicators: NonNullable<(typeof governanceIndicatorsByCityId)[string]>;
  coverage: {
    overall: number;
    safety: number;
    convenience: number;
    governance: number;
  };
  ranks: {
    overall: number;
    safety: number;
    convenience: number;
    governance: number;
    accidents: number;
    infrastructure: number;
  };
  signals: SignalsCity;
  accidents: AccidentsCity;
  convenienceRaw: ConvenienceCity;
  governanceRaw: GovernanceCity;
  notes: string[];
}

const signalsById = Object.fromEntries(
  (signalsData.cities as SignalsCity[]).map((city) => [city.city_id, city]),
);

const accidentsById = Object.fromEntries(
  (accidentsData.cities as AccidentsCity[]).map((city) => [city.city_id, city]),
);

const convenienceById = Object.fromEntries(
  (convenienceData.cities as ConvenienceCity[]).map((city) => [city.city_id, city]),
);

const governanceById = Object.fromEntries(
  (governanceData.cities as GovernanceCity[]).map((city) => [city.city_id, city]),
);

function computeOverallRank(cityId: string): number {
  const ranked = cities
    .map((city) => ({
      id: city.id,
      score: overallScoresByCityId[city.id]?.score ?? -1,
    }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score);

  return ranked.findIndex((entry) => entry.id === cityId) + 1;
}

export function getCityIds(): string[] {
  return cities.map((city) => city.id);
}

export function getCityDetailData(cityId: string): CityDetailData | null {
  const city = cities.find((entry) => entry.id === cityId);
  const overall = overallScoresByCityId[cityId];
  const safety = safetyScoresByCityId[cityId];
  const convenience = convenienceScoresByCityId[cityId];
  const governance = governanceScoresByCityId[cityId];
  const safetyIndicators = safetyIndicatorsByCityId[cityId];
  const convenienceIndicators = convenienceIndicatorsByCityId[cityId];
  const governanceIndicators = governanceIndicatorsByCityId[cityId];
  const signals = signalsById[cityId];
  const accidents = accidentsById[cityId];
  const convenienceRaw = convenienceById[cityId];
  const governanceRaw = governanceById[cityId];

  if (
    !city ||
    !overall ||
    !safety ||
    !convenience ||
    !governance ||
    !safetyIndicators ||
    !convenienceIndicators ||
    !governanceIndicators ||
    !signals ||
    !accidents ||
    !convenienceRaw ||
    !governanceRaw
  ) {
    return null;
  }

  const notes: string[] = [];
  if (accidents.notes) notes.push(accidents.notes);
  notes.push(...governanceRaw.notes);

  return {
    cityId,
    cityName: city.name,
    population2011: signals.population_2011,
    areaKm2: signals.area_km2,
    overall,
    overallRank: computeOverallRank(cityId),
    totalCities: cities.length,
    safety,
    convenience,
    governance,
    safetyIndicators,
    convenienceIndicators,
    governanceIndicators,
    coverage: {
      overall: overallCoverageByCityId[cityId]?.dataPoints ?? 0,
      safety: safetyCoverageByCityId[cityId]?.dataPoints ?? 0,
      convenience: convenienceCoverageByCityId[cityId]?.dataPoints ?? 0,
      governance: governanceCoverageByCityId[cityId]?.dataPoints ?? 0,
    },
    ranks: {
      overall: computeOverallRank(cityId),
      safety: signals.safety_rank,
      convenience: convenienceRaw.convenience_rank,
      governance: governanceRaw.governance_rank,
      accidents: accidents.accidents_rank,
      infrastructure: signals.safety_rank,
    },
    signals,
    accidents,
    convenienceRaw,
    governanceRaw,
    notes: notes.filter(Boolean),
  };
}
