import { useState, useEffect } from "react";

const CONFIG = {
  HIGH: {
    bg:      "rgba(239,68,68,0.08)",
    border:  "rgba(239,68,68,0.3)",
    color:   "#ef4444",
    glow:    "0 0 30px rgba(239,68,68,0.15)",
    title:   "⚠ Critical Burnout Risk Detected",
    message: "This worker shows HIGH burnout indicators. Immediate workload reduction and a mental health check-in are strongly recommended.",
  },
  MEDIUM: {
    bg:      "rgba(234,179,8,0.07)",
    border:  "rgba(234,179,8,0.3)",
    color:   "#eab308",
    glow:    "0 0 30px rgba(234,179,8,0.1)",
    title:   "Notice: Moderate Burnout Risk",
    message: "Burnout indicators are elevated. Consider scheduling breaks and monitoring workload over the next week.",
  },
};

export default function AlertBanner({ riskLevel }) {
  const [dismissed, setDismissed] = useState(false);
  const [visible,   setVisible]   = useState(false);

  useEffect(() => {

    setDismissed(false);
    setVisible(false);
    if (!riskLevel || !CONFIG[riskLevel.toUpperCase()]) return;
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [riskLevel]);

  const key = riskLevel?.toUpperCase();
  const cfg = CONFIG[key];


  if (!cfg || dismissed) return null;

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => setDismissed(true), 300);
  };

  return (
    <div
      style={{
        background:  cfg.bg,
        border:      `1px solid ${cfg.border}`,
        boxShadow:   cfg.glow,
        borderRadius: "12px",
        padding:     "12px 16px",
        marginBottom: "8px",
        display:     "flex",
        alignItems:  "flex-start",
        gap:         "12px",
        opacity:     visible ? 1 : 0,
        transform:   visible ? "translateY(0)" : "translateY(-10px)",
        transition:  "opacity 300ms ease, transform 300ms cubic-bezier(0.34,1.2,0.64,1)",
        fontFamily:  "'JetBrains Mono', monospace",
      }}
    >

      <svg
        style={{ color: cfg.color, flexShrink: 0, marginTop: "2px", width: "18px", height: "18px" }}
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>


      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: cfg.color, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 3px" }}>
          {cfg.title}
        </p>
        <p style={{ color: "#888", fontSize: "11px", lineHeight: "1.6", margin: 0 }}>
          {cfg.message}
        </p>
      </div>


      <span
        className="animate-pulse"
        style={{
          width:      "8px",
          height:     "8px",
          borderRadius: "50%",
          background: cfg.color,
          boxShadow:  `0 0 8px ${cfg.color}`,
          flexShrink: 0,
          marginTop:  "4px",
        }}
      />


      <button
        onClick={handleDismiss}
        style={{
          background: "none",
          border:     "none",
          cursor:     "pointer",
          color:      "#555",
          padding:    0,
          flexShrink: 0,
          lineHeight: 1,
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = "#e8e8e8"}
        onMouseLeave={(e) => e.currentTarget.style.color = "#555"}
      >
        <svg style={{ width: "16px", height: "16px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}