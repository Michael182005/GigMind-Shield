import { useState, useEffect, useRef, useCallback } from "react";

// ── EKG heartbeat SVG line that draws itself left-to-right ───────────────────
function EkgLine({ color = "#ef4444" }) {
  return (
    <svg
      width="100%" height="48" viewBox="0 0 560 48" preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      {/* Static grid lines */}
      {[12, 24, 36].map((y) => (
        <line key={y} x1="0" y1={y} x2="560" y2={y}
          stroke={color + "14"} strokeWidth="1" />
      ))}
      {/* Heartbeat path — the iconic EKG spike */}
      <path
        d="M0,24 L80,24 L100,24 L115,6 L130,42 L145,4 L160,44 L172,24 L200,24 L280,24 L300,24 L315,6 L330,42 L345,4 L360,44 L372,24 L400,24 L480,24 L495,6 L510,42 L520,4 L530,44 L540,24 L560,24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 1200,
          strokeDashoffset: 1200,
          animation: "ekgDraw 1.8s cubic-bezier(0.4,0,0.2,1) forwards",
        }}
      />
      {/* Moving glow dot */}
      <circle r="4" fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
        <animateMotion
          dur="1.8s"
          repeatCount="indefinite"
          path="M0,24 L80,24 L100,24 L115,6 L130,42 L145,4 L160,44 L172,24 L200,24 L280,24 L300,24 L315,6 L330,42 L345,4 L360,44 L372,24 L400,24 L480,24 L495,6 L510,42 L520,4 L530,44 L540,24 L560,24"
        />
      </circle>
      <style>{`
        @keyframes ekgDraw {
          to { stroke-dash-offset: 0; }
        }
      `}</style>
    </svg>
  );
}

// ── Pulsing concentric ring icon ──────────────────────────────────────────────
function PulsingWarningIcon() {
  return (
    <div style={{ position: "relative", width: "80px", height: "80px", margin: "0 auto" }}>
      {/* Rings */}
      {[1, 2, 3].map((i) => (
        <div key={i} style={{
          position: "absolute",
          inset: `${-i * 12}px`,
          borderRadius: "50%",
          border: "1px solid rgba(239,68,68,0.4)",
          animation: `ringPulse 2s ease-out ${i * 0.3}s infinite`,
        }} />
      ))}
      {/* Core circle */}
      <div style={{
        width: "80px", height: "80px", borderRadius: "50%",
        background: "rgba(239,68,68,0.12)",
        border: "2px solid rgba(239,68,68,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 32px rgba(239,68,68,0.4), inset 0 0 20px rgba(239,68,68,0.08)",
        animation: "coreGlow 2s ease-in-out infinite",
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
          stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
    </div>
  );
}



function DangerStat({ icon, label, value, threshold, color }) {
  const isOver = color === "red";
  return (
    <div style={{
      background: isOver ? "rgba(239,68,68,0.08)" : "rgba(234,179,8,0.07)",
      border: `1px solid ${isOver ? "rgba(239,68,68,0.3)" : "rgba(234,179,8,0.3)"}`,
      borderRadius: "8px", padding: "10px 14px",
      display: "flex", alignItems: "center", gap: "10px",
    }}>
      <span style={{ fontSize: "18px" }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "10px", color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0, fontFamily: "monospace" }}>
          {label}
        </p>
        <p style={{ fontSize: "13px", fontWeight: 700, color: isOver ? "#ef4444" : "#eab308", margin: 0, fontFamily: "monospace" }}>
          {value}
        </p>
      </div>
      {isOver && (
        <span style={{
          fontSize: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em",
          color: "#ef4444", background: "rgba(239,68,68,0.15)",
          border: "1px solid rgba(239,68,68,0.35)", borderRadius: "4px", padding: "2px 6px",
        }}>
          OVER LIMIT
        </span>
      )}
    </div>
  );
}


const HOLD_MS = 2800;

function HoldToConfirmButton({ onConfirm, disabled }) {
  const [progress, setProgress]   = useState(0);  
  const [holding,  setHolding]    = useState(false);
  const startRef  = useRef(null);
  const rafRef    = useRef(null);
  const doneRef   = useRef(false);

  const tick = useCallback(() => {
    if (!startRef.current) return;
    const elapsed = Date.now() - startRef.current;
    const pct     = Math.min((elapsed / HOLD_MS) * 100, 100);
    setProgress(pct);
    if (pct < 100) {
      rafRef.current = requestAnimationFrame(tick);
    } else if (!doneRef.current) {
      doneRef.current = true;
      setTimeout(() => onConfirm(), 120);
    }
  }, [onConfirm]);

  const startHold = (e) => {
    e.preventDefault();
    if (disabled || doneRef.current) return;
    startRef.current = Date.now();
    doneRef.current  = false;
    setHolding(true);
    rafRef.current = requestAnimationFrame(tick);
  };

  const endHold = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (!doneRef.current) {
      setProgress(0);
      setHolding(false);
      startRef.current = null;
    }
  };

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const label = progress >= 100
    ? "✓ Confirmed"
    : holding
      ? `Hold… ${Math.round(progress)}%`
      : "Continue at My Own Risk";

  return (
    <button
      onMouseDown={startHold}
      onMouseUp={endHold}
      onMouseLeave={endHold}
      onTouchStart={startHold}
      onTouchEnd={endHold}
      disabled={disabled}
      style={{
        position:     "relative",
        overflow:     "hidden",
        flex:         1,
        padding:      "13px 18px",
        borderRadius: "10px",
        border:       `1px solid ${holding ? "rgba(239,68,68,0.7)" : "rgba(239,68,68,0.35)"}`,
        background:   "rgba(239,68,68,0.06)",
        color:        holding ? "#ef4444" : "#888",
        fontSize:     "11px",
        fontWeight:   700,
        fontFamily:   "'JetBrains Mono', monospace",
        textTransform:"uppercase",
        letterSpacing:"0.12em",
        cursor:       disabled ? "not-allowed" : "pointer",
        userSelect:   "none",
        transition:   "color 200ms, border-color 200ms",
        WebkitUserSelect: "none",
      }}
    >

      <div style={{
        position:   "absolute",
        left:       0, top: 0, bottom: 0,
        width:      `${progress}%`,
        background: "rgba(239,68,68,0.18)",
        transition: holding ? "none" : "width 300ms ease",
        zIndex:     0,
      }} />
      <span style={{ position: "relative", zIndex: 1 }}>{label}</span>

      {!holding && progress === 0 && (
        <span style={{
          position: "absolute", bottom: "3px", left: 0, right: 0,
          fontSize: "8px", color: "#555", textAlign: "center",
          letterSpacing: "0.08em", textTransform: "uppercase",
        }}>
          hold to confirm
        </span>
      )}
    </button>
  );
}



function VisualHealthWarning({ hours, days, stress }) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimate(true), 120); return () => clearTimeout(t); }, []);


  const brainDep  = Math.min(100, Math.round((stress / 10) * 100));
  const bodyDep   = Math.min(100, Math.round((hours  / 80) * 100));
  const restDep   = Math.min(100, Math.round((days   / 20) * 100));


  const brainFill = 100 - brainDep;
  const bodyFill  = 100 - bodyDep;
  const restFill  = 100 - restDep;

  const barColor = (fill) =>
    fill > 50 ? "#22c55e" : fill > 25 ? "#eab308" : "#ef4444";

  const batteries = [
    { icon: "🧠", label: "Brain",   fill: brainFill, emoji: brainFill < 30 ? "🔴" : brainFill < 55 ? "🟡" : "🟢" },
    { icon: "💪", label: "Body",    fill: bodyFill,  emoji: bodyFill  < 30 ? "🔴" : bodyFill  < 55 ? "🟡" : "🟢" },
    { icon: "🛌", label: "Rest",    fill: restFill,  emoji: restFill  < 30 ? "🔴" : restFill  < 55 ? "🟡" : "🟢" },
  ];

  const storyPanels = [
    {
      emoji:    stress >= 8 ? "😵‍💫" : stress >= 6 ? "😰" : "😟",
      label:    "Right Now",
      sublabel: stress >= 8 ? "Critically overloaded" : "Running on empty",
      bg:       "rgba(239,68,68,0.08)",
      border:   "rgba(239,68,68,0.3)",
      tag:      "NOW",
      tagColor: "#ef4444",
    },
    {
      emoji:    "💀",
      label:    "If You Continue",
      sublabel: "Total crash incoming",
      bg:       "rgba(239,68,68,0.14)",
      border:   "rgba(239,68,68,0.5)",
      tag:      "RISK",
      tagColor: "#ef4444",
    },
    {
      emoji:    "✨",
      label:    "After a Break",
      sublabel: "Recharged & ready",
      bg:       "rgba(34,197,94,0.07)",
      border:   "rgba(34,197,94,0.3)",
      tag:      "GOAL",
      tagColor: "#22c55e",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", width: "100%" }}>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.15em", color: "#444", margin: 0 }}>
          Your current capacity
        </p>
        {batteries.map((b) => (
          <div key={b.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "16px", width: "22px", textAlign: "center", flexShrink: 0 }}>{b.icon}</span>
            <span style={{ fontSize: "9px", color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", width: "36px", flexShrink: 0, fontFamily: "monospace" }}>
              {b.label}
            </span>

            <div style={{ flex: 1, height: "8px", background: "#1e1e1e", borderRadius: "999px", overflow: "hidden", position: "relative" }}>

              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: animate ? `${b.fill}%` : "0%",
                background: barColor(b.fill),
                borderRadius: "999px",
                boxShadow: b.fill < 30 ? `0 0 6px ${barColor(b.fill)}` : "none",
                transition: "width 1000ms cubic-bezier(0.4,0,0.2,1)",
              }} />

              <div style={{ position: "absolute", left: "25%", top: 0, bottom: 0, width: "1px", background: "#333" }} />
            </div>
            <span style={{ fontSize: "11px", width: "28px", textAlign: "right", flexShrink: 0 }}>{b.emoji}</span>
            <span style={{ fontSize: "9px", color: barColor(b.fill), fontFamily: "monospace", fontWeight: 700, width: "32px", textAlign: "right", flexShrink: 0 }}>
              {b.fill}%
            </span>
          </div>
        ))}
      </div>


      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", alignItems: "center", gap: "6px" }}>
        {storyPanels.map((p, i) => (
          <>
            <div key={p.label} style={{
              background: p.bg,
              border: `1px solid ${p.border}`,
              borderRadius: "10px",
              padding: "12px 8px",
              textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
              opacity: animate ? 1 : 0,
              transform: animate ? "translateY(0)" : "translateY(8px)",
              transition: `opacity 400ms ease ${i * 120}ms, transform 400ms ease ${i * 120}ms`,
            }}>

              <span style={{ fontSize: "7px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: p.tagColor, fontFamily: "monospace" }}>
                {p.tag}
              </span>

              <span style={{ fontSize: "28px", lineHeight: 1, filter: i === 1 ? "drop-shadow(0 0 6px rgba(239,68,68,0.6))" : "none" }}>
                {p.emoji}
              </span>
              <div>
                <p style={{ fontSize: "9px", fontWeight: 700, color: "#e8e8e8", margin: "0 0 2px", fontFamily: "monospace" }}>{p.label}</p>
                <p style={{ fontSize: "8px", color: "#555", margin: 0, lineHeight: 1.4 }}>{p.sublabel}</p>
              </div>
            </div>

            {i < 2 && (
              <span key={`arrow-${i}`} style={{ color: "#333", fontSize: "14px", textAlign: "center", flexShrink: 0 }}>→</span>
            )}
          </>
        ))}
      </div>

    </div>
  );
}


export default function BurnoutWarningModal({ formData, onBreak, onContinue }) {
  const [visible,    setVisible]    = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  const handleBreak = () => {
    setVisible(false);
    setTimeout(onBreak, 300);
  };

  const handleContinue = async () => {
    setConfirming(true);
    setVisible(false);
    setTimeout(onContinue, 300);
  };


  const h = Number(formData?.hours_worked       || 0);
  const d = Number(formData?.days_without_break || 0);
  const s = Number(formData?.stress_level       || 0);

  const triggerStats = [
    { icon: "⏱", label: "Hours / Week",   value: `${h}h`,    color: h > 60  ? "red"    : "yellow", threshold: "60h" },
    { icon: "📅", label: "Days No Break",  value: `${d} days`, color: d > 10  ? "red"    : "yellow", threshold: "10d" },
    { icon: "🧠", label: "Stress Level",   value: `${s} / 10`, color: s >= 7  ? "red"    : "yellow", threshold: "7" },
  ];

  return (
    <>

      <div
        onClick={handleBreak}
        style={{
          position: "fixed", inset: 0, zIndex: 9700,
          background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)",
          opacity: visible ? 1 : 0, transition: "opacity 300ms ease",
        }}
      />


      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position:      "fixed",
          top:           "50%",
          left:          "50%",
          transform:     visible
            ? "translate(-50%, -50%) scale(1)"
            : "translate(-50%, -50%) scale(0.88)",
          zIndex:        9800,
          width:         "min(520px, calc(100vw - 32px))",
          background:    "#0d0d0d",
          border:        "1px solid rgba(239,68,68,0.35)",
          borderRadius:  "16px",
          overflow:      "hidden",
          boxShadow:     "0 0 80px rgba(239,68,68,0.2), 0 32px 80px rgba(0,0,0,0.8)",
          opacity:       visible ? 1 : 0,
          transition:    "transform 320ms cubic-bezier(0.34,1.2,0.64,1), opacity 300ms ease",
          fontFamily:    "'JetBrains Mono', monospace",
        }}
      >

        <div style={{
          background: "linear-gradient(180deg, rgba(239,68,68,0.1) 0%, transparent 100%)",
          borderBottom: "1px solid rgba(239,68,68,0.2)",
          padding: "0",
          overflow: "hidden",
        }}>
          <EkgLine color="#ef4444" />
        </div>


        <div style={{ padding: "32px 28px 28px", display: "flex", flexDirection: "column", gap: "24px" }}>


          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", textAlign: "center" }}>
            <PulsingWarningIcon />

            <div>
              <p style={{
                fontSize: "9px", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.3em", color: "#ef4444", margin: "0 0 8px",
              }}>
                ⚠ Critical Alert
              </p>
              <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#e8e8e8", margin: "0 0 10px", lineHeight: 1.2 }}>
                Burnout Risk Detected
              </h2>
              <VisualHealthWarning hours={h} days={d} stress={s} />
            </div>
          </div>


          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.15em", color: "#444", margin: 0 }}>
              Metrics that triggered this warning
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {triggerStats.map((stat) => (
                <DangerStat key={stat.label} {...stat} />
              ))}
            </div>
          </div>


          <div style={{ height: "1px", background: "#1e1e1e" }} />


          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

            <button
              onClick={handleBreak}
              style={{
                padding:       "14px",
                borderRadius:  "10px",
                border:        "none",
                background:    "#22c55e",
                color:         "#000",
                fontSize:      "12px",
                fontWeight:    700,
                fontFamily:    "'JetBrains Mono', monospace",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                cursor:        "pointer",
                display:       "flex",
                alignItems:    "center",
                justifyContent:"center",
                gap:           "8px",
                boxShadow:     "0 0 24px rgba(34,197,94,0.35)",
                transition:    "background 200ms, box-shadow 200ms",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#16a34a"; e.currentTarget.style.boxShadow = "0 0 32px rgba(34,197,94,0.5)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#22c55e"; e.currentTarget.style.boxShadow = "0 0 24px rgba(34,197,94,0.35)"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
              </svg>
              Take a Break — Recommended
            </button>


            <div style={{ display: "flex", gap: "8px" }}>
              <HoldToConfirmButton onConfirm={handleContinue} disabled={confirming} />
            </div>

            <p style={{
              fontSize: "9px", color: "#333", textAlign: "center", margin: 0,
              textTransform: "uppercase", letterSpacing: "0.1em",
            }}>
              Hold the danger button for 3 seconds to override the warning
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ringPulse {
          0%   { transform: scale(1);   opacity: 0.6; }
          70%  { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes coreGlow {
          0%,100% { box-shadow: 0 0 24px rgba(239,68,68,0.35), inset 0 0 16px rgba(239,68,68,0.06); }
          50%     { box-shadow: 0 0 44px rgba(239,68,68,0.55), inset 0 0 24px rgba(239,68,68,0.12); }
        }
        @keyframes ekgDraw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </>
  );
}