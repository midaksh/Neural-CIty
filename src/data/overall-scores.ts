import { cities } from "@/data/cities";
import {
  convenienceCoverageByCityId,
  convenienceScoresByCityId,
} from "@/data/convenience-scores";
import {
  governanceCoverageByCityId,
  governanceScoresByCityId,
} from "@/data/governance-scores";
import {
  safetyCoverageByCityId,
  safetyScoresByCityId,
} from "@/data/safety-scores";
import type { CityCoverage, CitySectorScore, OverallIndicators } from "@/types/city";

function bandFromScore(score: number): CitySectorScore["band"] {
  if (score <= 35) return "poor";
  if (score <= 65) return "manageable";
  return "good";
}

function toSectorScore(score: number): CitySectorScore {
  return {
    score,
    band: bandFromScore(score),
  };
}

const overallEntries: [string, CitySectorScore][] = [];
const overallIndicatorEntries: [string, OverallIndicators][] = [];

for (const city of cities) {
  const safety = safetyScoresByCityId[city.id];
  const convenience = convenienceScoresByCityId[city.id];
  const governance = governanceScoresByCityId[city.id];

  if (!safety || !convenience || !governance) {
    continue;
  }

  const composite = Number(
    ((safety.score + convenience.score + governance.score) / 3).toFixed(2),
  );

  overallEntries.push([city.id, toSectorScore(composite)]);
  overallIndicatorEntries.push([
    city.id,
    { safety, convenience, governance },
  ]);
}

export const overallScoresByCityId: Record<string, CitySectorScore> =
  Object.fromEntries(overallEntries);

export const overallIndicatorsByCityId: Record<string, OverallIndicators> =
  Object.fromEntries(overallIndicatorEntries);

export const overallCoverageByCityId: Record<string, CityCoverage> =
  Object.fromEntries(
    cities.map((city) => {
      const safetyPts = safetyCoverageByCityId[city.id]?.dataPoints ?? 0;
      const conveniencePts =
        convenienceCoverageByCityId[city.id]?.dataPoints ?? 0;
      const governancePts =
        governanceCoverageByCityId[city.id]?.dataPoints ?? 0;

      return [
        city.id,
        { dataPoints: safetyPts + conveniencePts + governancePts },
      ];
    }),
  );
