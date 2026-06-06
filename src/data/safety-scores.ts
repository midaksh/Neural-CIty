import type {
  CityCoverage,
  CitySectorScore,
  SafetyIndicators,
} from "@/types/city";
import accidentsData from "../../public/data/accidents_scores.json";
import signalsData from "../../public/data/signals_scores.json";

type SignalsPayload = {
  cities: Array<{
    city_id: string;
    osm_nodes_in_india: number;
    normalized_scores: { composite_score: number };
    bands: { composite: "poor" | "manageable" | "good" };
  }>;
};

type AccidentsPayload = {
  cities: Array<{
    city_id: string;
    computed: { final_score: number };
    band: "poor" | "manageable" | "good";
    annual_counts: { deaths: number; injuries: number; incidents: number };
    data_year: number | string;
  }>;
};

const signals = signalsData as SignalsPayload;
const accidents = accidentsData as AccidentsPayload;

function bandFromScore(score: number): CitySectorScore["band"] {
  if (score <= 35) return "poor";
  if (score <= 65) return "manageable";
  return "good";
}

function toSectorScore(
  score: number,
  band?: CitySectorScore["band"],
): CitySectorScore {
  return {
    score,
    band: band ?? bandFromScore(score),
  };
}

const infrastructureByCityId = Object.fromEntries(
  signals.cities.map((city) => [
    city.city_id,
    toSectorScore(
      city.normalized_scores.composite_score,
      city.bands.composite,
    ),
  ]),
);

const accidentsByCityId = Object.fromEntries(
  accidents.cities.map((city) => [
    city.city_id,
    toSectorScore(city.computed.final_score, city.band),
  ]),
);

export const safetyIndicatorsByCityId: Record<string, SafetyIndicators> =
  Object.fromEntries(
    signals.cities.map((city) => [
      city.city_id,
      {
        infrastructure: infrastructureByCityId[city.city_id] ?? null,
        accidents: accidentsByCityId[city.city_id] ?? null,
      },
    ]),
  );

export const safetyCoverageByCityId: Record<string, CityCoverage> =
  Object.fromEntries(
    signals.cities.map((city) => [
      city.city_id,
      {
        dataPoints: city.osm_nodes_in_india,
      },
    ]),
  );

/** Combined safety row score: average of infrastructure + accidents when both exist. */
export const safetyScoresByCityId: Record<string, CitySectorScore> =
  Object.fromEntries(
    signals.cities.map((city) => {
      const infra = infrastructureByCityId[city.city_id];
      const acc = accidentsByCityId[city.city_id];
      if (infra && acc) {
        const avg = (infra.score + acc.score) / 2;
        return [city.city_id, toSectorScore(Number(avg.toFixed(2)))];
      }
      return [city.city_id, infra ?? acc ?? null];
    }).filter((entry): entry is [string, CitySectorScore] => entry[1] !== null),
  );

export const accidentsMeta = accidents;
