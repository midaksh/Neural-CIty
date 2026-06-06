import type { CityCoverage, CitySectorScore } from "@/types/city";
import governanceData from "../../public/data/governance_scores.json";

type GovernancePayload = {
  cities: Array<{
    city_id: string;
    budget_years_used: number;
    normalized_scores: {
      spend_ratio_score: number;
      invest_score: number;
      composite_score: number;
    };
    bands: {
      spend_ratio: "poor" | "manageable" | "good";
      invest: "poor" | "manageable" | "good";
      composite: "poor" | "manageable" | "good";
    };
  }>;
};

const payload = governanceData as GovernancePayload;

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

export const governanceScoresByCityId: Record<string, CitySectorScore> =
  Object.fromEntries(
    payload.cities.map((city) => [
      city.city_id,
      toSectorScore(
        city.normalized_scores.composite_score,
        city.bands.composite,
      ),
    ]),
  );

export const governanceIndicatorsByCityId: Record<
  string,
  { spendRatio: CitySectorScore; invest: CitySectorScore }
> = Object.fromEntries(
  payload.cities.map((city) => [
    city.city_id,
    {
      spendRatio: toSectorScore(
        city.normalized_scores.spend_ratio_score,
        city.bands.spend_ratio,
      ),
      invest: toSectorScore(
        city.normalized_scores.invest_score,
        city.bands.invest,
      ),
    },
  ]),
);

export const governanceCoverageByCityId: Record<string, CityCoverage> =
  Object.fromEntries(
    payload.cities.map((city) => [
      city.city_id,
      { dataPoints: city.budget_years_used },
    ]),
  );
