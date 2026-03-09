import { useEffect, useRef, useState } from "react";

const AXES = [
  { key: "hours_worked",       label: "Hours",    max: 100, invert: false },
  { key: "stress_level",       label: "Stress",   max: 10,  invert: false },
  { key: "jobs_completed",     label: "Jobs",     max: 50,  invert: false },
  { key: "days_without_break", label: "No Break", max: 30,  invert: false },
  { key: "rating",             label: "Rating",   max: 5,   invert: true  },
];

const RISK_CONFIG = {
  HIGH:   { color: "#ef4444", label: "HIGH RISK"   },
  MEDIUM: { color: "#eab308", label: "MEDIUM RISK" },
  LOW:    { color: "#22c55e", label: "LOW RISK"    },
};


function rRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}


function drawMiniRadar(ctx, cx, cy, R, formData, riskColor) {
  const N    = AXES.length;
  const step = (Math.PI * 2) / N;

  [0.33, 0.66, 1].forEach((frac) => {
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const a = step * i;
      const x = cx + R * frac * Math.sin(a);
      const y = cy - R * frac * Math.cos(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth   = 1;
    ctx.stroke();
  });

  for (let i = 0; i < N; i++) {
    const a = step * i;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R * Math.sin(a), cy - R * Math.cos(a));
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth   = 1;
    ctx.stroke();
  }

  const hasData = formData && Object.values(formData).some((v) => Number(v) > 0);
  if (hasData) {
    const normed = AXES.map(({ key, max, invert }) => {
      const raw = Math.min(Math.max(Number(formData[key]) || 0, 0), max);
      return invert ? 1 - raw / max : raw / max;
    });
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const a = step * i;
      const r = R * normed[i];
      i === 0 ? ctx.moveTo(cx + r * Math.sin(a), cy - r * Math.cos(a))
              : ctx.lineTo(cx + r * Math.sin(a), cy - r * Math.cos(a));
    }
    ctx.closePath();
    ctx.fillStyle   = riskColor + "28";
    ctx.fill();
    ctx.strokeStyle = riskColor;
    ctx.lineWidth   = 2;
    ctx.stroke();
    for (let i = 0; i < N; i++) {
      const a = step * i;
      const r = R * normed[i];
      ctx.beginPath();
      ctx.arc(cx + r * Math.sin(a), cy - r * Math.cos(a), 3, 0, Math.PI * 2);
      ctx.fillStyle = riskColor;
      ctx.fill();
    }
  }

  for (let i = 0; i < N; i++) {
    const a = step * i;
    ctx.fillStyle    = "rgba(255,255,255,0.38)";
    ctx.font         = "bold 9px monospace";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(AXES[i].label.toUpperCase(), cx + (R + 15) * Math.sin(a), cy - (R + 15) * Math.cos(a));
  }
}


function drawReportCard(canvas, { score, riskLevel, formData, workerInfo }) {
  const W   = canvas.width;  
  const H   = canvas.height;  
  const ctx = canvas.getContext("2d");
  const cfg = RISK_CONFIG[(riskLevel || "").toUpperCase()] || RISK_CONFIG.LOW;
  const pct = score !== null ? Math.round(score * 100) : 0;
  const wi  = workerInfo || {};


  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, "#0a0a0a");
  bgGrad.addColorStop(1, "#111111");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);


  const topGrad = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, 340);
  topGrad.addColorStop(0, cfg.color + "16");
  topGrad.addColorStop(1, "transparent");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, W, H);


  ctx.strokeStyle = cfg.color + "50";
  ctx.lineWidth   = 1.5;
  ctx.strokeRect(1, 1, W - 2, H - 2);


  ctx.fillStyle   = "#f97316";
  ctx.shadowColor = "#f97316";
  ctx.shadowBlur  = 14;
  rRect(ctx, 28, 28, 32, 32, 7);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(47, 36); ctx.lineTo(41, 47); ctx.lineTo(45, 47);
  ctx.lineTo(39, 58); ctx.lineTo(51, 44); ctx.lineTo(46, 44);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle    = "#e8e8e8";
  ctx.font         = "bold 15px monospace";
  ctx.textAlign    = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("GIGMIND", 70, 41);
  ctx.fillStyle = "#f97316";
  ctx.fillText(" SHIELD", 70 + ctx.measureText("GIGMIND").width, 41);

  ctx.fillStyle = "#444";
  ctx.font      = "9px monospace";
  ctx.fillText("BURNOUT INTELLIGENCE PLATFORM", 70, 57);

  ctx.fillStyle    = "#444";
  ctx.font         = "9px monospace";
  ctx.textAlign    = "right";
  ctx.fillText(new Date().toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" }), W - 28, 44);


  ctx.strokeStyle = "#1e1e1e";
  ctx.lineWidth   = 1;
  ctx.beginPath(); ctx.moveTo(28, 76); ctx.lineTo(W - 28, 76); ctx.stroke();


  const hasIdentity = wi.name?.trim();

  if (hasIdentity) {

    const avatarX = 28 + 28;
    const avatarY = 130;
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, 28, 0, Math.PI * 2);
    ctx.fillStyle = cfg.color + "22";
    ctx.fill();
    ctx.strokeStyle = cfg.color + "60";
    ctx.lineWidth   = 1.5;
    ctx.stroke();


    const initials = wi.name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    ctx.fillStyle    = cfg.color;
    ctx.font         = "bold 16px monospace";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials, avatarX, avatarY);


    ctx.fillStyle    = "#e8e8e8";
    ctx.font         = "bold 18px monospace";
    ctx.textAlign    = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(wi.name.trim(), 28 + 28 + 28 + 14, 118);

    if (wi.job_title) {
      ctx.fillStyle = "#888";
      ctx.font      = "12px monospace";
      ctx.fillText(wi.job_title, 28 + 28 + 28 + 14, 136);
    }


    let pillX = 28 + 28 + 28 + 14;
    const pillY = 153;
    const pillH = 18;

    if (wi.platform) {
      const pText  = wi.platform.toUpperCase();
      const pWidth = ctx.measureText(pText).width + 16;
      ctx.font = "bold 9px monospace";
      ctx.fillStyle = cfg.color + "22";
      rRect(ctx, pillX, pillY - 13, pWidth, pillH, 4);
      ctx.fill();
      ctx.strokeStyle = cfg.color + "50";
      ctx.lineWidth   = 1;
      rRect(ctx, pillX, pillY - 13, pWidth, pillH, 4);
      ctx.stroke();
      ctx.fillStyle    = cfg.color;
      ctx.textBaseline = "middle";
      ctx.fillText(pText, pillX + 8, pillY - 4);
      pillX += pWidth + 8;
    }


    if (wi.location) {
      ctx.fillStyle    = "#555";
      ctx.font         = "9px monospace";
      ctx.textBaseline = "middle";
      ctx.fillText(`📍 ${wi.location}`, pillX, pillY - 4);
    }
  } else {

    ctx.fillStyle    = "#333";
    ctx.font         = "10px monospace";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ANONYMOUS WORKER", W / 2, 130);
  }


  ctx.strokeStyle = "#1e1e1e";
  ctx.lineWidth   = 1;
  ctx.beginPath(); ctx.moveTo(28, 185); ctx.lineTo(W - 28, 185); ctx.stroke();

 
  ctx.textAlign    = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle    = "#555";
  ctx.font         = "bold 10px monospace";
  ctx.fillText("BURNOUT SCORE", W / 2, 215);


  ctx.shadowColor = cfg.color;
  ctx.shadowBlur  = 30;
  ctx.fillStyle   = cfg.color;
  ctx.font        = "bold 88px monospace";
  ctx.fillText(`${pct}%`, W / 2, 305);
  ctx.shadowBlur  = 0;


  const bW = 140, bH = 28;
  const bX = W / 2 - bW / 2, bY = 316;
  ctx.fillStyle = cfg.color + "20"; rRect(ctx, bX, bY, bW, bH, 14); ctx.fill();
  ctx.strokeStyle = cfg.color + "60"; ctx.lineWidth = 1; rRect(ctx, bX, bY, bW, bH, 14); ctx.stroke();
  ctx.fillStyle    = cfg.color;
  ctx.font         = "bold 10px monospace";
  ctx.textBaseline = "middle";
  ctx.fillText(cfg.label, W / 2, bY + bH / 2);


  ctx.strokeStyle = "#1e1e1e"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(28, 360); ctx.lineTo(W - 28, 360); ctx.stroke();


  ctx.fillStyle    = "#555";
  ctx.font         = "bold 10px monospace";
  ctx.textAlign    = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("BURNOUT DIMENSIONS", W / 2, 386);

  drawMiniRadar(ctx, W / 2, 460, 72, formData, cfg.color);


  ctx.strokeStyle = "#1e1e1e"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(28, 548); ctx.lineTo(W - 28, 548); ctx.stroke();


  const stats = [
    { label: "Hours / Week", value: formData?.hours_worked       ? `${formData.hours_worked}h`        : "—" },
    { label: "Jobs Done",    value: formData?.jobs_completed     ? `${formData.jobs_completed}`        : "—" },
    { label: "No Break",     value: formData?.days_without_break ? `${formData.days_without_break}d`  : "—" },
    { label: "Stress",       value: formData?.stress_level       ? `${formData.stress_level}/10`      : "—" },
  ];
  const colW = (W - 56) / stats.length;
  stats.forEach((s, i) => {
    const cx2 = 28 + colW * i + colW / 2;
    ctx.fillStyle    = "#444"; ctx.font = "9px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillText(s.label.toUpperCase(), cx2, 574);
    ctx.fillStyle = "#e8e8e8"; ctx.font = "bold 14px monospace";
    ctx.fillText(s.value, cx2, 596);
    if (i < stats.length - 1) {
      ctx.strokeStyle = "#1e1e1e"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(28 + colW * (i + 1), 556); ctx.lineTo(28 + colW * (i + 1), 604); ctx.stroke();
    }
  });


  ctx.strokeStyle = "#1e1e1e"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(28, 626); ctx.lineTo(W - 28, 626); ctx.stroke();

  ctx.fillStyle    = "#333"; ctx.font = "9px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("Generated by GigMind Shield · Burnout Intelligence Platform", W / 2, 644);

  ctx.strokeStyle = cfg.color + "55"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(28, H - 18); ctx.lineTo(W - 28, H - 18); ctx.stroke();
}


export default function ReportCard({ score, riskLevel, formData, workerInfo, onClose }) {
  const canvasRef             = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 20); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawReportCard(canvas, { score, riskLevel, formData, workerInfo });
  }, [score, riskLevel, formData, workerInfo]);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 280); };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const workerSlug = workerInfo?.name
      ? workerInfo.name.trim().toLowerCase().replace(/\s+/g, "-") + "-"
      : "";
    const url = canvas.toDataURL("image/png");
    const a   = document.createElement("a");
    a.href     = url;
    a.download = `gigmind-${workerSlug}report-${Date.now()}.png`;
    a.click();
  };

  const cfg = RISK_CONFIG[(riskLevel || "").toUpperCase()] || RISK_CONFIG.LOW;

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9500,
        background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: visible ? 1 : 0, transition: "opacity 280ms ease", padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: "16px",
          transform: visible ? "scale(1)" : "scale(0.92)",
          transition: "transform 280ms cubic-bezier(0.34,1.2,0.64,1)",
        }}
      >

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", maxWidth: "560px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: cfg.color, boxShadow: `0 0 8px ${cfg.color}`, display: "inline-block" }} />
            <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#e8e8e8", fontFamily: "monospace" }}>
              {workerInfo?.name ? `${workerInfo.name}'s Report Card` : "Report Card"}
            </span>
          </div>
          <button onClick={handleClose} style={{
            background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px",
            width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#555",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#e8e8e8"; e.currentTarget.style.borderColor = "#555"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#555";    e.currentTarget.style.borderColor = "#2a2a2a"; }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>


        <canvas
          ref={canvasRef} width={560} height={800}
          style={{
            borderRadius: "16px", border: `1px solid ${cfg.color}30`,
            boxShadow: `0 0 60px ${cfg.color}20, 0 24px 80px rgba(0,0,0,0.8)`,
            maxWidth: "100%", maxHeight: "72vh",
          }}
        />


        <div style={{ display: "flex", gap: "10px", width: "100%", maxWidth: "560px" }}>
          <button onClick={handleDownload} style={{
            flex: 1, background: "#f97316", border: "none", borderRadius: "10px", padding: "12px",
            cursor: "pointer", color: "#000", fontSize: "11px", fontWeight: 700, fontFamily: "monospace",
            textTransform: "uppercase", letterSpacing: "0.15em",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            boxShadow: "0 0 20px rgba(249,115,22,0.35)", transition: "background 200ms",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#ea6a0c"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#f97316"}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PNG
          </button>
          <button onClick={handleClose} style={{
            flex: 1, background: "transparent", border: "1px solid #2a2a2a", borderRadius: "10px", padding: "12px",
            cursor: "pointer", color: "#666", fontSize: "11px", fontWeight: 700, fontFamily: "monospace",
            textTransform: "uppercase", letterSpacing: "0.15em", transition: "color 200ms, border-color 200ms",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#e8e8e8"; e.currentTarget.style.borderColor = "#555"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#666";    e.currentTarget.style.borderColor = "#2a2a2a"; }}>
            Close
          </button>
        </div>

        <p style={{ fontSize: "9px", color: "#333", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.15em", margin: 0 }}>
          Press Esc or click outside to close
        </p>
      </div>
    </div>
  );
}