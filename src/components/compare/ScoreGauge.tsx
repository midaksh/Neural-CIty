"use client";

interface ScoreGaugeProps {
  score: number;
  label?: string;
}

export function ScoreGauge({ score, label = "Overall Score" }: ScoreGaugeProps) {
  const clamped = Math.min(100, Math.max(0, score));
  const radius = 72;
  const stroke = 14;
  const cx = 100;
  const cy = 100;
  const circumference = Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-2xl bg-[hsl(0_0%_8%)] px-6 py-8 text-white">
      <p className="mb-4 text-xs font-medium tracking-wide text-white/70 uppercase">
        {label}
      </p>
      <div className="relative w-full max-w-[200px]">
        <svg
          viewBox="0 0 200 120"
          className="w-full"
          aria-hidden
        >
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="#f37021"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
            style={{ filter: "drop-shadow(0 0 8px rgba(243,112,33,0.45))" }}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-2 flex flex-col items-center">
          <span className="text-4xl font-bold tracking-tight">
            {score.toFixed(1)}
          </span>
          <span className="mt-0.5 text-xs text-white/60">/ 100</span>
        </div>
      </div>
    </div>
  );
}
