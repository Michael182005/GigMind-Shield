import { useEffect, useState } from "react";
import { getRecommendation } from "../services/api";

const ICONS = {
  LOW: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  MEDIUM: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  HIGH: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 8v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
};

const PALETTES = {
  LOW: { color: "#22c55e", bg: "rgba(34,197,94,0.07)", border: "rgba(34,197,94,0.25)" },
  MEDIUM: { color: "#eab308", bg: "rgba(234,179,8,0.07)", border: "rgba(234,179,8,0.25)" },
  HIGH: { color: "#ef4444", bg: "rgba(239,68,68,0.07)", border: "rgba(239,68,68,0.25)" },
};

function tipBullets(text) {
  if (!text) return [];
  return text
    .split(/[.•\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);
}

export default function RecommendationCard({ score, riskLevel }) {
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);

  const riskKey = (riskLevel || "").toUpperCase();
  const palette = PALETTES[riskKey] || PALETTES.LOW;
  const icon = ICONS[riskKey] || ICONS.LOW;

  useEffect(() => {
    if (score === null || score === undefined) return;
    setLoading(true);
    getRecommendation(score)
      .then((data) => setAdvice(data?.recommendation || data?.message || JSON.stringify(data)))
      .catch(() => setAdvice("Could not load recommendation. Please try again."))
      .finally(() => setLoading(false));
  }, [score]);

  const bullets = advice ? tipBullets(advice) : [];

  return (
    <div
      className="rounded-xl p-6 flex flex-col gap-4 shadow-lg transition-all hover:scale-[1.01]"
      style={{
        background: score !== null && score !== undefined ? palette.bg : "#111",
        border: `1px solid ${score !== null && score !== undefined ? palette.border : "#1e1e1e"}`,
      }}
    >
      <div className="flex items-center gap-3">
        <span className="w-2 h-2 rounded-full" style={{ background: palette.color, boxShadow: `0 0 8px ${palette.color}` }} />
        <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[#e8e8e8]">
          AI Recommendation
        </h2>
      </div>

      {score === null || score === undefined ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <svg className="w-12 h-12 text-[#2a2a2a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-xs text-[#444] uppercase tracking-widest text-center">
            Submit a prediction to receive personalized advice
          </p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: palette.color, borderTopColor: "transparent" }} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="shrink-0 mt-0.5" style={{ color: palette.color }}>
              {icon}
            </div>
            <div className="flex flex-col gap-1">
              <span
                className="text-xs font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full w-fit"
                style={{ color: palette.color, background: `${palette.color}15`, border: `1px solid ${palette.color}40` }}
              >
                {riskKey} RISK DETECTED
              </span>
              <p className="text-[#aaa] text-sm leading-relaxed mt-1">{advice}</p>
            </div>
          </div>

          {bullets.length > 1 && (
            <div className="border-t border-[#1e1e1e] pt-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#555] mb-3 font-semibold">
                Action Items
              </p>
              <ul className="flex flex-col gap-2">
                {bullets.slice(0, 4).map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#888]">
                    <span
                      className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: palette.color }}
                    />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}