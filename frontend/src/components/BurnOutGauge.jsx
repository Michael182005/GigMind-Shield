import { useEffect, useRef, useState } from "react";

const COLORS = {
  LOW:    { stroke: "#22c55e", glow: "#22c55e", label: "LOW RISK",    bg: "rgba(34,197,94,0.08)"  },
  MEDIUM: { stroke: "#eab308", glow: "#eab308", label: "MEDIUM RISK", bg: "rgba(234,179,8,0.08)"  },
  HIGH:   { stroke: "#ef4444", glow: "#ef4444", label: "HIGH RISK",   bg: "rgba(239,68,68,0.08)"  },
};

function getRiskColor(risk) {
  if (!risk) return COLORS.LOW;
  return COLORS[risk.toUpperCase()] || COLORS.LOW;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function drawGauge(ctx, W, H, animPct, color, display) {
  const cx  = W / 2;
  const cy  = H / 2;
  const r   = W * 0.38;
  const lw  = W * 0.065;

  ctx.clearRect(0, 0, W, H);


  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 2.25);
  ctx.strokeStyle = "#1e1e1e";
  ctx.lineWidth   = lw;
  ctx.lineCap     = "round";
  ctx.stroke();

 
  if (display && animPct > 0) {
    const end = Math.PI * 0.75 + animPct * Math.PI * 1.5;
    ctx.save();
    ctx.shadowColor = color.glow;
    ctx.shadowBlur  = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI * 0.75, end);
    ctx.strokeStyle = color.stroke;
    ctx.lineWidth   = lw;
    ctx.lineCap     = "round";
    ctx.stroke();
    ctx.restore();
  }


  for (let i = 0; i <= 10; i++) {
    const angle = Math.PI * 0.75 + (i / 10) * Math.PI * 1.5;
    const inner = r - lw / 2 - 6;
    const outer = r + lw / 2 + 4;
    ctx.beginPath();
    ctx.moveTo(cx + inner * Math.cos(angle), cy + inner * Math.sin(angle));
    ctx.lineTo(cx + outer * Math.cos(angle), cy + outer * Math.sin(angle));
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth   = i % 5 === 0 ? 2 : 1;
    ctx.stroke();
  }
}

export default function BurnoutGauge({ score, riskLevel }) {
  const canvasRef   = useRef(null);
  const rafRef      = useRef(null);   
  const startRef    = useRef(null);   
  const fromRef     = useRef(0);      

  const [animatedPct, setAnimatedPct] = useState(0);

  const display = score !== null && score !== undefined;
  const targetPct = display ? Math.min(Math.max(score, 0), 1) : 0;
  const color     = getRiskColor(riskLevel);

  const DURATION = 1800;


  useEffect(() => {
 
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const from = fromRef.current; 
    startRef.current = null;     

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;

      const elapsed  = timestamp - startRef.current;
      const progress = Math.min(elapsed / DURATION, 1);     
      const eased    = easeOutCubic(progress);                  
      const current  = from + (targetPct - from) * eased;      

      fromRef.current = current;
      setAnimatedPct(current);


      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        drawGauge(ctx, canvas.width, canvas.height, current, color, display);
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {

        fromRef.current = targetPct;
        setAnimatedPct(targetPct);
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          drawGauge(ctx, canvas.width, canvas.height, targetPct, color, display);
        }
      }
    };

    rafRef.current = requestAnimationFrame(animate);


    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [targetPct, color, display]);

  return (
    <div
      className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6 flex flex-col items-center justify-center gap-3 shadow-lg hover:border-[#2a2a2a] transition-all"
      style={{ background: display ? color.bg : undefined }}
    >

      <div className="flex items-center gap-3 w-full mb-1">
        <span
          className="w-2 h-2 rounded-full"
          style={{
            background:  display ? color.stroke : "#444",
            boxShadow:   display ? `0 0 8px ${color.glow}` : "none",
          }}
        />
        <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[#e8e8e8]">
          Burnout Risk Gauge
        </h2>
      </div>


      <div className="relative w-48 h-48">
        <canvas ref={canvasRef} width={192} height={192} className="w-full h-full" />

        <div className="absolute inset-0 flex flex-col items-center justify-center">

          <span
            className="text-4xl font-black tabular-nums tracking-tight"
            style={{ color: display ? color.stroke : "#444" }}
          >
            {display ? Math.round(animatedPct * 100) : "--"}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#555] mt-0.5">
            score
          </span>
        </div>
      </div>

      {display ? (
        <div className="flex flex-col items-center gap-1">
          <span
            className="text-xs font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full border"
            style={{
              color:       color.stroke,
              borderColor: color.stroke,
              background:  color.bg,
              textShadow:  `0 0 10px ${color.glow}`,
            }}
          >
            {color.label}
          </span>
          <p className="text-[11px] text-[#555] mt-1">
            Burnout probability:{" "}
            <span className="text-[#e8e8e8] font-semibold">
              {(animatedPct * 100).toFixed(1)}%
            </span>
          </p>
        </div>
      ) : (
        <p className="text-xs text-[#444] uppercase tracking-widest">Awaiting analysis</p>
      )}
    </div>
  );
}