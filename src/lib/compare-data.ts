import { cities } from "@/data/cities";
import {
  convenienceIndicatorsByCityId,
  convenienceScoresByCityId,
} from "@/data/convenience-scores";
import {
  governanceIndicatorsByCityId,
  governanceScoresByCityId,
} from "@/data/governance-scores";
import {
  safetyIndicatorsByCityId,
  safetyScoresByCityId,
} from "@/data/safety-scores";
import { overallScoresByCityId } from "@/data/overall-scores";

export interface CompareIndicator {
  label: string;
  score: number;
}

export interface CompareCategory {
  title: string;
  score: number;
  indicators: CompareIndicator[];
}

export interface CityCompareData {
  cityId: string;
  cityName: string;
  overall: number;
  categories: CompareCategory[];
  chartPoints: { label: string; value: number }[];
}

export function getCityCompareData(cityId: string): CityCompareData | null {
  const city = cities.find((c) => c.id === cityId);
  const overall = overallScoresByCityId[cityId]?.score;
  const safety = safetyScoresByCityId[cityId];
  const convenience = convenienceScoresByCityId[cityId];
  const governance = governanceScoresByCityId[cityId];
  const safetyInd = safetyIndicatorsByCityId[cityId];
  const convenienceInd = convenienceIndicatorsByCityId[cityId];
  const governanceInd = governanceIndicatorsByCityId[cityId];

  if (
    !city ||
    overall == null ||
    !safety ||
    !convenience ||
    !governance ||
    !safetyInd ||
    !convenienceInd ||
    !governanceInd
  ) {
    return null;
  }

  const categories: CompareCategory[] = [
    {
      title: "Safety",
      score: safety.score,
      indicators: [
        {
          label: "Acci",
          score: safetyInd.accidents?.score ?? 0,
        },
        {
          label: "Infra",
          score: safetyInd.infrastructure?.score ?? 0,
        },
      ],
    },
    {
      title: "Convenience",
      score: convenience.score,
      indicators: [
        {
          label: "Spat",
          score: convenienceInd.spatial?.score ?? 0,
        },
        {
          label: "Access",
          score: convenienceInd.access?.score ?? 0,
        },
      ],
    },
    {
      title: "Governance",
      score: governance.score,
      indicators: [
        {
          label: "Ratio",
          score: governanceInd.spendRatio?.score ?? 0,
        },
        {
          label: "Invest",
          score: governanceInd.invest?.score ?? 0,
        },
      ],
    },
  ];

  return {
    cityId,
    cityName: city.name,
    overall,
    categories,
    chartPoints: [
      { label: "Overall", value: overall },
      ...categories.map((c) => ({ label: c.title, value: c.score })),
    ],
  };
}
