import { useEffect, useRef } from "react";


const AXES = [
  { key: "hours_worked",       label: "Hours",     max: 100, invert: false },
  { key: "stress_level",       label: "Stress",    max: 10,  invert: false },
  { key: "jobs_completed",     label: "Jobs",      max: 50,  invert: false },
  { key: "days_without_break", label: "No Break",  max: 30,  invert: false },
  { key: "rating",             label: "Rating",    max: 5,   invert: true  },
];

const RISK_COLORS = {
  HIGH:   { fill: "rgba(239,68,68,0.18)",  stroke: "#ef4444", glow: "#ef4444" },
  MEDIUM: { fill: "rgba(234,179,8,0.18)",  stroke: "#eab308", glow: "#eab308" },
  LOW:    { fill: "rgba(34,197,94,0.18)",  stroke: "#22c55e", glow: "#22c55e" },
  NONE:   { fill: "rgba(249,115,22,0.12)", stroke: "#f97316", glow: "#f97316" },
};

function polarToCartesian(cx, cy, r, angleRad) {
  return {
    x: cx + r * Math.sin(angleRad),
    y: cy - r * Math.cos(angleRad),
  };
}

function drawRadar(canvas, values, riskLevel, animated) {
  const ctx  = canvas.getContext("2d");
  const W    = canvas.width;
  const H    = canvas.height;
  const cx   = W / 2;
  const cy   = H / 2;
  const R    = Math.min(W, H) * 0.36; 
  const N    = AXES.length;
  const step = (Math.PI * 2) / N;

  const colors = RISK_COLORS[(riskLevel || "NONE").toUpperCase()] || RISK_COLORS.NONE;

  ctx.clearRect(0, 0, W, H);


  [0.25, 0.5, 0.75, 1].forEach((frac) => {
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const angle = step * i;
      const pt    = polarToCartesian(cx, cy, R * frac, angle);
      i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth   = 1;
    ctx.stroke();


    if (frac < 1) {
      ctx.fillStyle  = "#333";
      ctx.font       = "8px monospace";
      ctx.textAlign  = "center";
      ctx.fillText(`${Math.round(frac * 100)}%`, cx, cy - R * frac - 3);
    }
  });

 
  for (let i = 0; i < N; i++) {
    const angle = step * i;
    const outer = polarToCartesian(cx, cy, R, angle);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(outer.x, outer.y);
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth   = 1;
    ctx.stroke();

 
    const labelPt = polarToCartesian(cx, cy, R + 18, angle);
    ctx.fillStyle  = "#666";
    ctx.font       = "9px monospace";
    ctx.textAlign  = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(AXES[i].label.toUpperCase(), labelPt.x, labelPt.y);
  }


  const hasValues = values && Object.keys(values).some((k) => Number(values[k]) > 0);

  if (hasValues) {
    const normalised = AXES.map(({ key, max, invert }) => {
      const raw = Math.min(Math.max(Number(values[key]) || 0, 0), max);
      const n   = raw / max;
      return invert ? 1 - n : n;
    });


    const scaled = normalised.map((n) => n * animated);


    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const angle = step * i;
      const pt    = polarToCartesian(cx, cy, R * scaled[i], angle);
      i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();
    ctx.fillStyle   = colors.fill;
    ctx.fill();


    ctx.save();
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur  = 10;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const angle = step * i;
      const pt    = polarToCartesian(cx, cy, R * scaled[i], angle);
      i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth   = 2;
    ctx.stroke();
    ctx.restore();


    for (let i = 0; i < N; i++) {
      const angle = step * i;
      const pt    = polarToCartesian(cx, cy, R * scaled[i], angle);
      ctx.save();
      ctx.shadowColor = colors.glow;
      ctx.shadowBlur  = 8;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = colors.stroke;
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();


      const pct = Math.round(scaled[i] * 100);
      const labelPt = polarToCartesian(cx, cy, R * scaled[i] + 11, angle);
      ctx.fillStyle  = colors.stroke;
      ctx.font       = "bold 8px monospace";
      ctx.textAlign  = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${pct}%`, labelPt.x, labelPt.y);
    }
  }


  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fillStyle = "#2a2a2a";
  ctx.fill();
}

export default function RadarChart({ formData, riskLevel }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const startRef  = useRef(null);
  const DURATION  = 900; 

  const hasData = formData && Object.values(formData).some((v) => Number(v) > 0);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;

    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed  = ts - startRef.current;
      const progress = Math.min(elapsed / DURATION, 1);

      const eased    = 1 - Math.pow(1 - progress, 3);

      const canvas = canvasRef.current;
      if (canvas) drawRadar(canvas, formData, riskLevel, eased);

      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [formData, riskLevel]);


  const legend = AXES.map(({ key, label, max, invert }) => {
    const raw = Math.min(Math.max(Number(formData?.[key]) || 0, 0), max);
    const pct = Math.round((invert ? 1 - raw / max : raw / max) * 100);
    return { label, pct };
  });

  const colors = RISK_COLORS[(riskLevel || "NONE").toUpperCase()] || RISK_COLORS.NONE;

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5 flex flex-col gap-4 hover:border-[#2a2a2a] transition-all">


      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: colors.stroke, boxShadow: `0 0 8px ${colors.glow}` }}
          />
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[#e8e8e8]">
            Burnout Dimension Radar
          </h2>
        </div>
        <span className="text-[9px] font-mono text-[#444] border border-[#2a2a2a] px-2 py-0.5 rounded uppercase tracking-widest">
          5-Axis
        </span>
      </div>


      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={260}
          height={260}
          className="w-full max-w-[260px]"
        />
      </div>


      {hasData ? (
        <div className="grid grid-cols-5 gap-1">
          {legend.map(({ label, pct }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-0.5 rounded-lg py-1.5 px-1"
              style={{ background: "#0d0d0d", border: "1px solid #1e1e1e" }}
            >
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#555]">{label}</span>
              <span className="text-[11px] font-black tabular-nums" style={{ color: colors.stroke }}>
                {pct}%
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-[#444] uppercase tracking-widest text-center py-2 font-mono">
          Fill the form to see your burnout dimensions
        </p>
      )}
    </div>
  );
}