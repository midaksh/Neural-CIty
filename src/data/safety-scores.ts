import type {
  CityCoverage,
  CitySectorScore,
  SafetyIndicators,
} from "@/types/city";
import signalsData from "../../public/data/signals_scores.json";

type SignalsPayload = {
  cities: Array<{
    city_id: string;
    osm_nodes_in_india: number;
    normalized_scores: { composite_score: number };
    bands: { composite: "poor" | "manageable" | "good" };
  }>;
};

const payload = signalsData as SignalsPayload;

function toSectorScore(city: SignalsPayload["cities"][number]): CitySectorScore {
  return {
    score: city.normalized_scores.composite_score,
    band: city.bands.composite,
  };
}

export const safetyIndicatorsByCityId: Record<string, SafetyIndicators> =
  Object.fromEntries(
    payload.cities.map((city) => [
      city.city_id,
      {
        infrastructure: toSectorScore(city),
        accidents: null,
      },
    ]),
  );

export const safetyCoverageByCityId: Record<string, CityCoverage> =
  Object.fromEntries(
    payload.cities.map((city) => [
      city.city_id,
      {
        dataPoints: city.osm_nodes_in_india,
      },
    ]),
  );

/** Row-level safety score — uses infrastructure until accidents data is processed. */
export const safetyScoresByCityId: Record<string, CitySectorScore> =
  Object.fromEntries(
    payload.cities.map((city) => [city.city_id, toSectorScore(city)]),
  );
