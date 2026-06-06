"use client";

interface ScoreGaugeProps {
  score: number;
  label?: string;
}

export function ScoreGauge({ score, label = "Overall Score" }: ScoreGaugeProps) {
  const clamped = Math.min(100, Math.max(0, score));
  const radius = 68;
  const stroke = 24;
  const cx = 100;
  const cy = 96;
  const circumference = Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center self-start rounded-2xl border border-brand/40 bg-card px-5 py-5 text-foreground shadow-[0_0_0_1px_rgba(243,112,33,0.25),0_0_28px_rgba(243,112,33,0.14)]">
      <p className="mb-3 text-[10px] font-semibold tracking-[0.15em] text-muted uppercase">
        {label}
      </p>
      <div className="relative w-full max-w-[188px]">
        <svg viewBox="0 0 200 112" className="w-full" aria-hidden>
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="var(--border)"
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
            style={{ filter: "drop-shadow(0 0 10px rgba(243,112,33,0.5))" }}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className="text-3xl font-bold tracking-tight text-foreground">
            {score.toFixed(1)}
          </span>
          <span className="text-[10px] text-muted">/ 100</span>
        </div>
      </div>
    </div>
  );
}
