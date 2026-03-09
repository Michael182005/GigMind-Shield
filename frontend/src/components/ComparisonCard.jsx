import { useEffect, useState } from "react";

const BENCHMARKS = {
  platform_avg:   0.54,
  industry_avg:   0.61,
  healthy_target: 0.35,
};

function AnimatedBar({ pct, color, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setWidth(pct * 100), delay);
    return () => clearTimeout(timer);
  }, [pct, delay]);

  return (
    <div style={{ height: "8px", width: "100%", background: "#1a1a1a", borderRadius: "999px", overflow: "hidden" }}>
      <div style={{
        height:       "100%",
        width:        `${width}%`,
        background:   color,
        boxShadow:    `0 0 6px ${color}`,
        borderRadius: "999px",
        transition:   "width 900ms cubic-bezier(0.34,1,0.64,1)",
      }} />
    </div>
  );
}

export default function ComparisonCard({ score }) {
  const display = score !== null && score !== undefined;
  const pct     = display ? Math.min(Math.max(score, 0), 1) : 0;

  const scoreColor = pct >= 0.71 ? "#ef4444" : pct >= 0.41 ? "#eab308" : "#22c55e";
  const vsAvg      = display ? ((pct - BENCHMARKS.platform_avg) * 100) : null;
  const better     = vsAvg !== null && vsAvg < 0;

  const rows = [
    { label: "Your Score",       value: display ? pct : 0, text: display ? `${(pct * 100).toFixed(1)}%` : "--",                           color: scoreColor, delay: 0   },
    { label: "Platform Average", value: BENCHMARKS.platform_avg,   text: `${(BENCHMARKS.platform_avg   * 100).toFixed(1)}%`, color: "#f97316",  delay: 120 },
    { label: "Industry Average", value: BENCHMARKS.industry_avg,   text: `${(BENCHMARKS.industry_avg   * 100).toFixed(1)}%`, color: "#8b5cf6",  delay: 240 },
    { label: "Healthy Target",   value: BENCHMARKS.healthy_target, text: `${(BENCHMARKS.healthy_target * 100).toFixed(1)}%`, color: "#22c55e",  delay: 360 },
  ];

  return (
    <div style={{
      background:    "#111",
      border:        "1px solid #1e1e1e",
      borderRadius:  "12px",
      padding:       "20px",
      display:       "flex",
      flexDirection: "column",
      gap:           "16px",
    }}
    className="hover:border-[#2a2a2a] transition-all"
    >

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full"
            style={{ background: "#8b5cf6", boxShadow: "0 0 8px #8b5cf6" }} />
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[#e8e8e8]">
            Score Comparison
          </h2>
        </div>
        <span className="text-[9px] font-mono text-[#444] border border-[#2a2a2a] px-2 py-0.5 rounded uppercase tracking-widest">
          Benchmark
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#555]">
                {row.label}
              </span>
              <span className="text-xs font-black tabular-nums" style={{ color: row.color }}>
                {row.text}
              </span>
            </div>
            <AnimatedBar pct={row.value} color={row.color} delay={row.delay} />
          </div>
        ))}
      </div>


      {display && vsAvg !== null && (
        <div style={{
          background:   better ? "rgba(34,197,94,0.08)"  : "rgba(239,68,68,0.08)",
          border:       `1px solid ${better ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
          borderRadius: "8px",
          padding:      "8px 12px",
          display:      "flex",
          alignItems:   "center",
          gap:          "8px",
        }}>
          <svg style={{ width: "14px", height: "14px", color: better ? "#22c55e" : "#ef4444", flexShrink: 0 }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d={better ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
          </svg>
          <p className="text-[10px] font-mono m-0" style={{ color: better ? "#22c55e" : "#ef4444" }}>
            {better
              ? `${Math.abs(vsAvg).toFixed(1)}% below platform average`
              : `${vsAvg.toFixed(1)}% above platform average`}
          </p>
        </div>
      )}

      {!display && (
        <p className="text-[10px] text-[#444] uppercase tracking-widest text-center py-2 font-mono">
          Submit a prediction to compare
        </p>
      )}
    </div>
  );
}