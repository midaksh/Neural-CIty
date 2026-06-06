import type { SectorOption } from "@/types/city";

export const sectorOptions: SectorOption[] = [
  {
    value: "overall_score",
    label: "Overall Score",
    description:
      "Composite street outcome score from Neural City primary data — not yet layered in this prototype.",
  },
  {
    value: "safety",
    label: "Safety",
    description:
      "Traffic signals, signs, crossings, and calming infrastructure from OpenStreetMap, normalized per capita and by area.",
  },
  {
    value: "convenience",
    label: "Convenience",
    description:
      "Public transport access and street-level convenience indicators — dataset processing pending.",
  },
  {
    value: "governance",
    label: "Governance",
    description:
      "Municipal spend and budget-efficiency signals — dataset processing pending.",
  },
];
