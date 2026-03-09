import React, { useState, useEffect, useRef, useCallback } from "react";

const THEMES = {
  LOW: {
    accent:        "#22c55e",
    accentSoft:    "rgba(34,197,94,0.12)",
    accentBorder:  "rgba(34,197,94,0.35)",
    accentGlow:    "rgba(34,197,94,0.25)",
    ekgColor:      "#22c55e",
    ringColor:     "rgba(34,197,94,0.4)",
    coreGlow:      "rgba(34,197,94,0.4)",
    iconStroke:    "#22c55e",
    tag:           "✅ All Clear",
    title:         "You\'re Doing Great!",
    sectionLabel:  "Your healthy stats",
    ctaLabel:      "🎉  Keep It Up!",
    ctaBg:         "#22c55e",
    ctaHover:      "#16a34a",
    ctaGlow:       "rgba(34,197,94,0.45)",
    ctaTextColor:  "#000",
    showContinue:  false,
  },
  MEDIUM: {
    accent:        "#eab308",
    accentSoft:    "rgba(234,179,8,0.10)",
    accentBorder:  "rgba(234,179,8,0.35)",
    accentGlow:    "rgba(234,179,8,0.22)",
    ekgColor:      "#eab308",
    ringColor:     "rgba(234,179,8,0.35)",
    coreGlow:      "rgba(234,179,8,0.35)",
    iconStroke:    "#eab308",
    tag:           "⚡ Heads Up",
    title:         "Watch Your Pace",
    sectionLabel:  "Metrics to keep an eye on",
    ctaLabel:      "👍  Got It, I\'ll Manage",
    ctaBg:         "#eab308",
    ctaHover:      "#ca8a04",
    ctaGlow:       "rgba(234,179,8,0.4)",
    ctaTextColor:  "#000",
    showContinue:  false,
  },
  HIGH: {
    accent:        "#ef4444",
    accentSoft:    "rgba(239,68,68,0.10)",
    accentBorder:  "rgba(239,68,68,0.35)",
    accentGlow:    "rgba(239,68,68,0.25)",
    ekgColor:      "#ef4444",
    ringColor:     "rgba(239,68,68,0.4)",
    coreGlow:      "rgba(239,68,68,0.4)",
    iconStroke:    "#ef4444",
    tag:           "⚠ Critical Alert",
    title:         "Burnout Risk Detected",
    sectionLabel:  "Metrics that triggered this warning",
    ctaLabel:      "☕  Take a Break",
    ctaBg:         "#22c55e",
    ctaHover:      "#16a34a",
    ctaGlow:       "rgba(34,197,94,0.45)",
    ctaTextColor:  "#000",
    showContinue:  true,
  },
};

function EkgLine({ color }) {
  const path = "M0,24 L80,24 L100,24 L115,6 L130,42 L145,4 L160,44 L172,24 L200,24 L280,24 L300,24 L315,6 L330,42 L345,4 L360,44 L372,24 L400,24 L480,24 L495,6 L510,42 L520,4 L530,44 L540,24 L560,24";
  return (
    <svg width="100%" height="48" viewBox="0 0 560 48" preserveAspectRatio="none" style={{ display: "block" }}>
      {[12, 24, 36].map((y) => (
        <line key={y} x1="0" y1={y} x2="560" y2={y} stroke={color + "14"} strokeWidth="1" />
      ))}
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray: 1200, strokeDashoffset: 1200, animation: "ekgDraw 1.8s cubic-bezier(0.4,0,0.2,1) forwards" }} />
      <circle r="4" fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
        <animateMotion dur="1.8s" repeatCount="indefinite" path={path} />
      </circle>
      <style>{`@keyframes ekgDraw { to { stroke-dashoffset: 0; } }`}</style>
    </svg>
  );
}

function PulsingIcon({ theme, riskLevel }) {
  return (
    <div style={{ position: "relative", width: "80px", height: "80px", margin: "0 auto" }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{
          position: "absolute", inset: `${-i * 12}px`, borderRadius: "50%",
          border: `1px solid ${theme.ringColor}`,
          animation: `ringPulse 2s ease-out ${i * 0.3}s infinite`,
        }} />
      ))}
      <div style={{
        width: "80px", height: "80px", borderRadius: "50%",
        background: theme.accentSoft,
        border: `2px solid ${theme.accent}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 32px ${theme.coreGlow}, inset 0 0 20px ${theme.accentSoft}`,
        animation: "coreGlow 2s ease-in-out infinite",
      }}>
        {riskLevel === "LOW" && (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={theme.iconStroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        )}
        {riskLevel === "MEDIUM" && (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={theme.iconStroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
        {riskLevel === "HIGH" && (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={theme.iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )}
      </div>
    </div>
  );
}

function StatPill({ icon, label, value, theme, flagged }) {
  return (
    <div style={{
      background: flagged ? theme.accentSoft : "rgba(255,255,255,0.03)",
      border: `1px solid ${flagged ? theme.accentBorder : "#1e1e1e"}`,
      borderRadius: "8px", padding: "10px 14px",
      display: "flex", alignItems: "center", gap: "10px",
    }}>
      <span style={{ fontSize: "18px" }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "10px", color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0, fontFamily: "monospace" }}>{label}</p>
        <p style={{ fontSize: "13px", fontWeight: 700, color: flagged ? theme.accent : "#888", margin: 0, fontFamily: "monospace" }}>{value}</p>
      </div>
      {flagged && (
        <span style={{
          fontSize: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em",
          color: theme.accent, background: theme.accentSoft,
          border: `1px solid ${theme.accentBorder}`, borderRadius: "4px", padding: "2px 6px",
        }}>
          { flagged === "LOW" ? "HEALTHY" : flagged === "MEDIUM" ? "WATCH" : "OVER LIMIT" }
        </span>
      )}
    </div>
  );
}

function VisualHealthPanel({ hours, days, stress, riskLevel, theme }) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimate(true), 140); return () => clearTimeout(t); }, []);

  const brainFill = Math.max(0, Math.min(100, Math.round(100 - (stress / 10) * 100)));
  const bodyFill  = Math.max(0, Math.min(100, Math.round(100 - (hours  / 80) * 100)));
  const restFill  = Math.max(0, Math.min(100, Math.round(100 - (days   / 20) * 100)));

  const barColor = (fill) => fill > 55 ? "#22c55e" : fill > 28 ? "#eab308" : "#ef4444";
  const batteries = [
    { icon: "🧠", label: "Brain", fill: brainFill },
    { icon: "💪", label: "Body",  fill: bodyFill  },
    { icon: "🛌", label: "Rest",  fill: restFill  },
  ];

  const stories = {
    LOW: [
      { tag: "NOW",    emoji: "😊", label: "Right Now",   sublabel: "Feeling balanced",    bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.3)",  tagColor: "#22c55e" },
      { tag: "KEEP",   emoji: "💪", label: "Keep Going",  sublabel: "Momentum is yours",   bg: "rgba(34,197,94,0.05)",  border: "rgba(34,197,94,0.2)",  tagColor: "#22c55e" },
      { tag: "FUTURE", emoji: "⭐", label: "Long Term",   sublabel: "Sustainable success", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.4)",  tagColor: "#22c55e" },
    ],
    MEDIUM: [
      { tag: "NOW",  emoji: stress >= 6 ? "😐" : "🙂", label: "Right Now",   sublabel: "Slightly stretched", bg: "rgba(234,179,8,0.08)",  border: "rgba(234,179,8,0.3)",  tagColor: "#eab308" },
      { tag: "RISK", emoji: "😰",                        label: "If You Push", sublabel: "Tension builds up",  bg: "rgba(234,179,8,0.12)",  border: "rgba(234,179,8,0.45)", tagColor: "#eab308" },
      { tag: "GOAL", emoji: "😌",                        label: "With Rest",   sublabel: "Back to your best",  bg: "rgba(34,197,94,0.07)",  border: "rgba(34,197,94,0.25)", tagColor: "#22c55e" },
    ],
    HIGH: [
      { tag: "NOW",  emoji: stress >= 8 ? "😵" : "😰", label: "Right Now",       sublabel: stress >= 8 ? "Critically overloaded" : "Running on empty", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.3)", tagColor: "#ef4444" },
      { tag: "RISK", emoji: "💀",                         label: "If You Continue", sublabel: "Total crash incoming",  bg: "rgba(239,68,68,0.14)", border: "rgba(239,68,68,0.5)", tagColor: "#ef4444" },
      { tag: "GOAL", emoji: "✨",                         label: "After a Break",   sublabel: "Recharged and ready",   bg: "rgba(34,197,94,0.07)", border: "rgba(34,197,94,0.3)", tagColor: "#22c55e" },
    ],
  };

  const panels = stories[riskLevel] || stories.HIGH;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.15em", color: "#444", margin: 0 }}>Your current capacity</p>
        {batteries.map((b) => (
          <div key={b.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "15px", width: "20px", textAlign: "center", flexShrink: 0 }}>{b.icon}</span>
            <span style={{ fontSize: "9px", color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", width: "36px", flexShrink: 0, fontFamily: "monospace" }}>{b.label}</span>
            <div style={{ flex: 1, height: "8px", background: "#1e1e1e", borderRadius: "999px", overflow: "hidden", position: "relative" }}>
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: animate ? `${b.fill}%` : "0%",
                background: barColor(b.fill), borderRadius: "999px",
                boxShadow: b.fill < 30 ? `0 0 6px ${barColor(b.fill)}` : "none",
                transition: "width 1000ms cubic-bezier(0.4,0,0.2,1)",
              }} />
              <div style={{ position: "absolute", left: "25%", top: 0, bottom: 0, width: "1px", background: "#2a2a2a" }} />
            </div>
            <span style={{ fontSize: "9px", color: barColor(b.fill), fontFamily: "monospace", fontWeight: 700, width: "34px", textAlign: "right", flexShrink: 0 }}>
              {b.fill}%
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", alignItems: "center", gap: "6px" }}>
        {panels.map((p, i) => (
          <React.Fragment key={p.label}>
            <div style={{
              background: p.bg, border: `1px solid ${p.border}`, borderRadius: "10px",
              padding: "12px 8px", textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
              opacity: animate ? 1 : 0, transform: animate ? "translateY(0)" : "translateY(8px)",
              transition: `opacity 400ms ease ${i * 120}ms, transform 400ms ease ${i * 120}ms`,
            }}>
              <span style={{ fontSize: "7px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: p.tagColor, fontFamily: "monospace" }}>{p.tag}</span>
              <span style={{ fontSize: "28px", lineHeight: 1, filter: riskLevel === "HIGH" && i === 1 ? "drop-shadow(0 0 6px rgba(239,68,68,0.6))" : "none" }}>{p.emoji}</span>
              <div>
                <p style={{ fontSize: "9px", fontWeight: 700, color: "#e8e8e8", margin: "0 0 2px", fontFamily: "monospace" }}>{p.label}</p>
                <p style={{ fontSize: "8px", color: "#555", margin: 0, lineHeight: 1.4 }}>{p.sublabel}</p>
              </div>
            </div>
            {i < 2 && <span style={{ color: "#2a2a2a", fontSize: "14px", textAlign: "center", flexShrink: 0 }}>{"→"}</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

const HOLD_MS = 2800;
function HoldToConfirmButton({ onConfirm, disabled }) {
  const [progress, setProgress] = useState(0);
  const [holding,  setHolding]  = useState(false);
  const startRef = useRef(null);
  const rafRef   = useRef(null);
  const doneRef  = useRef(false);

  const tick = useCallback(() => {
    if (!startRef.current) return;
    const pct = Math.min(((Date.now() - startRef.current) / HOLD_MS) * 100, 100);
    setProgress(pct);
    if (pct < 100) { rafRef.current = requestAnimationFrame(tick); }
    else if (!doneRef.current) { doneRef.current = true; setTimeout(() => onConfirm(), 120); }
  }, [onConfirm]);

  const startHold = (e) => {
    e.preventDefault();
    if (disabled || doneRef.current) return;
    startRef.current = Date.now(); doneRef.current = false;
    setHolding(true); rafRef.current = requestAnimationFrame(tick);
  };
  const endHold = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (!doneRef.current) { setProgress(0); setHolding(false); startRef.current = null; }
  };
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const label = progress >= 100 ? "✓ Confirmed" : holding ? `Hold… ${Math.round(progress)}%` : "Continue at My Own Risk";

  return (
    <button onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold}
      onTouchStart={startHold} onTouchEnd={endHold} disabled={disabled}
      style={{
        position: "relative", overflow: "hidden", flex: 1,
        padding: "13px 18px", borderRadius: "10px",
        border: `1px solid ${holding ? "rgba(239,68,68,0.7)" : "rgba(239,68,68,0.35)"}`,
        background: "rgba(239,68,68,0.06)", color: holding ? "#ef4444" : "#555",
        fontSize: "11px", fontWeight: 700, fontFamily: "\'JetBrains Mono\', monospace",
        textTransform: "uppercase", letterSpacing: "0.12em",
        cursor: disabled ? "not-allowed" : "pointer",
        userSelect: "none", WebkitUserSelect: "none",
        transition: "color 200ms, border-color 200ms",
      }}>
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: `${progress}%`, background: "rgba(239,68,68,0.18)",
        transition: holding ? "none" : "width 300ms ease", zIndex: 0,
      }} />
      <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
      {!holding && progress === 0 && (
        <span style={{ position: "absolute", bottom: "3px", left: 0, right: 0, fontSize: "8px", color: "#444", textAlign: "center", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          hold to confirm
        </span>
      )}
    </button>
  );
}

export default function BurnoutWarningModal({ formData, riskLevel = "HIGH", onBreak, onContinue }) {
  const [visible,    setVisible]    = useState(false);
  const [confirming, setConfirming] = useState(false);

  const level = (riskLevel || "HIGH").toUpperCase();
  const T     = THEMES[level] || THEMES.HIGH;

  useEffect(() => { const t = setTimeout(() => setVisible(true), 30); return () => clearTimeout(t); }, []);

  const handlePrimary  = () => { setVisible(false); setTimeout(onBreak, 300); };
  const handleContinue = () => { setConfirming(true); setVisible(false); setTimeout(onContinue, 300); };

  const h = Number(formData?.hours_worked       || 0);
  const d = Number(formData?.days_without_break || 0);
  const s = Number(formData?.stress_level       || 0);

  const statsMap = {
    LOW: [
      { icon: "⏱", label: "Hours / Week",  value: `${h}h`,     flagged: h <= 50 ? "LOW" : "MEDIUM" },
      { icon: "📅", label: "Days No Break", value: `${d} days`, flagged: d <= 7  ? "LOW" : "MEDIUM" },
      { icon: "🧠", label: "Stress Level",  value: `${s} / 10`, flagged: s <= 4  ? "LOW" : "MEDIUM" },
    ],
    MEDIUM: [
      { icon: "⏱", label: "Hours / Week",  value: `${h}h`,     flagged: h > 55  ? "MEDIUM" : null },
      { icon: "📅", label: "Days No Break", value: `${d} days`, flagged: d > 7   ? "MEDIUM" : null },
      { icon: "🧠", label: "Stress Level",  value: `${s} / 10`, flagged: s >= 5  ? "MEDIUM" : null },
    ],
    HIGH: [
      { icon: "⏱", label: "Hours / Week",  value: `${h}h`,     flagged: h > 60  ? "HIGH" : null },
      { icon: "📅", label: "Days No Break", value: `${d} days`, flagged: d > 10  ? "HIGH" : null },
      { icon: "🧠", label: "Stress Level",  value: `${s} / 10`, flagged: s >= 7  ? "HIGH" : null },
    ],
  };

  return (
    <>
      <div onClick={handlePrimary} style={{
        position: "fixed", inset: 0, zIndex: 9700,
        background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)",
        opacity: visible ? 1 : 0, transition: "opacity 300ms ease",
      }} />

      <div onClick={(e) => e.stopPropagation()} style={{
        position: "fixed", top: "50%", left: "50%",
        transform: visible ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.88)",
        zIndex: 9800,
        width: "min(520px, calc(100vw - 32px))",
        background: "#0d0d0d",
        border: `1px solid ${T.accentBorder}`,
        borderRadius: "16px", overflow: "hidden",
        boxShadow: `0 0 80px ${T.accentGlow}, 0 32px 80px rgba(0,0,0,0.8)`,
        opacity: visible ? 1 : 0,
        transition: "transform 320ms cubic-bezier(0.34,1.2,0.64,1), opacity 300ms ease",
        fontFamily: "\'JetBrains Mono\', monospace",
        maxHeight: "92vh", overflowY: "auto",
      }}>
        <div style={{
          background: `linear-gradient(180deg, ${T.accentSoft} 0%, transparent 100%)`,
          borderBottom: `1px solid ${T.accentBorder}`, overflow: "hidden",
        }}>
          <EkgLine color={T.ekgColor} />
        </div>

        <div style={{ padding: "32px 28px 28px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", textAlign: "center" }}>
            <PulsingIcon theme={T} riskLevel={level} />
            <div style={{ width: "100%" }}>
              <p style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em", color: T.accent, margin: "0 0 8px" }}>
                {T.tag}
              </p>
              <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#e8e8e8", margin: "0 0 16px", lineHeight: 1.2 }}>
                {T.title}
              </h2>
              <VisualHealthPanel hours={h} days={d} stress={s} riskLevel={level} theme={T} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.15em", color: "#444", margin: 0 }}>{T.sectionLabel}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {(statsMap[level] || statsMap.HIGH).map((st) => (
                <StatPill key={st.label} icon={st.icon} label={st.label} value={st.value} theme={T} flagged={st.flagged} />
              ))}
            </div>
          </div>

          <div style={{ height: "1px", background: "#1a1a1a" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button onClick={handlePrimary} style={{
              padding: "14px", borderRadius: "10px", border: "none",
              background: T.ctaBg, color: T.ctaTextColor,
              fontSize: "12px", fontWeight: 700, fontFamily: "\'JetBrains Mono\', monospace",
              textTransform: "uppercase", letterSpacing: "0.15em", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              boxShadow: `0 0 24px ${T.ctaGlow}`, transition: "background 200ms, box-shadow 200ms",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = T.ctaHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = T.ctaBg; }}>
              {T.ctaLabel}
            </button>
            {T.showContinue && (
              <div style={{ display: "flex", gap: "10px" }}>
                <HoldToConfirmButton onConfirm={handleContinue} disabled={confirming} />
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ringPulse { 0%{transform:scale(1);opacity:0.7;} 100%{transform:scale(1.5);opacity:0;} }
        @keyframes coreGlow  { 0%,100%{opacity:1;} 50%{opacity:0.75;} }
      `}</style>
    </>
  );
}