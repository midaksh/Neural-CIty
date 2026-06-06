import type { CityCoverage, CitySectorScore } from "@/types/city";
import convenienceData from "../../public/data/convenience_scores.json";

type ConveniencePayload = {
  cities: Array<{
    city_id: string;
    osm_nodes_in_india: number;
    normalized_scores: {
      spatial_score: number;
      access_score: number;
      composite_score: number;
    };
    bands: {
      spatial: "poor" | "manageable" | "good";
      access: "poor" | "manageable" | "good";
      composite: "poor" | "manageable" | "good";
    };
  }>;
};

const payload = convenienceData as ConveniencePayload;

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

export const convenienceScoresByCityId: Record<string, CitySectorScore> =
  Object.fromEntries(
    payload.cities.map((city) => [
      city.city_id,
      toSectorScore(
        city.normalized_scores.composite_score,
        city.bands.composite,
      ),
    ]),
  );

export const convenienceIndicatorsByCityId: Record<
  string,
  { spatial: CitySectorScore; access: CitySectorScore }
> = Object.fromEntries(
  payload.cities.map((city) => [
    city.city_id,
    {
      spatial: toSectorScore(
        city.normalized_scores.spatial_score,
        city.bands.spatial,
      ),
      access: toSectorScore(
        city.normalized_scores.access_score,
        city.bands.access,
      ),
    },
  ]),
);

export const convenienceCoverageByCityId: Record<string, CityCoverage> =
  Object.fromEntries(
    payload.cities.map((city) => [
      city.city_id,
      { dataPoints: city.osm_nodes_in_india },
    ]),
  );
