

import { useEffect, useState, useCallback } from "react";

const CELL_COLORS = ["#1e1e1e", "#14532d", "#eab308", "#f97316", "#ef4444"];
const CELL_LABELS = ["No data", "Low (0–25%)", "Moderate (25–50%)", "Elevated (50–75%)", "High (75–100%)"];
const DAYS        = ["S", "M", "T", "W", "T", "F", "S"];


function normaliseScore(raw) {
  const n = parseFloat(raw);
  if (isNaN(n)) return null;
  return n <= 1 ? n : n / 100;
}

function scoreToLevel(s) {
  if (s === null || s === undefined) return 0;
  if (s < 0.25) return 1;
  if (s < 0.5)  return 2;
  if (s < 0.75) return 3;
  return 4;
}


function buildCells(historyData) {
  const today    = new Date();
  const todayStr = today.toISOString().split("T")[0];


  const byDate = {};
  (historyData || []).forEach((d) => {
    if (!d.timestamp) return;
    try {
      const dateStr = new Date(d.timestamp).toISOString().split("T")[0];
      const score   = normaliseScore(d.burnout_score);
      if (score === null) return;
      if (byDate[dateStr] === undefined || score > byDate[dateStr]) {
        byDate[dateStr] = score;
      }
    } catch { /* skip malformed */ }
  });

  const cells = [];
  for (let i = 27; i >= 0; i--) {
    const d       = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const score   = byDate[dateStr] !== undefined ? byDate[dateStr] : null;
    cells.push({
      date:    dateStr,
      score,
      level:   scoreToLevel(score),
      label:   d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }),
      isToday: dateStr === todayStr,
    });
  }
  return cells;
}


function HeatGrid({ cells, cellSize = 10, gap = 3, showDayLabels = false }) {
  const [tooltip, setTooltip] = useState(null);
  const weeks = [];
  for (let w = 0; w < Math.ceil(cells.length / 7); w++) {
    weeks.push(cells.slice(w * 7, w * 7 + 7));
  }

  return (
    <div onMouseLeave={() => setTooltip(null)}>
      {showDayLabels && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(7, ${cellSize}px)`, gap: `${gap}px`, marginBottom: "6px" }}>
          {DAYS.map((d, i) => (
            <span key={i} style={{ fontSize: "9px", textAlign: "center", color: "#444", fontFamily: "monospace", textTransform: "uppercase" }}>{d}</span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: `${gap}px` }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "grid", gridTemplateColumns: `repeat(7, ${cellSize}px)`, gap: `${gap}px` }}>
            {week.map((cell, di) => (
              <div key={di}
                style={{
                  width: `${cellSize}px`, height: `${cellSize}px`, borderRadius: "2px",
                  background: CELL_COLORS[cell.level],
                  outline:    cell.isToday ? "1.5px solid #f97316" : "none",
                  outlineOffset: "1px",
                  boxShadow:  cell.level >= 3 ? `0 0 4px ${CELL_COLORS[cell.level]}90` : "none",
                  cursor: "pointer", transition: "transform 150ms ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.4)"; setTooltip({ x: e.clientX, y: e.clientY, cell }); }}
                onMouseMove={(e)  => setTooltip((p) => p ? { ...p, x: e.clientX, y: e.clientY } : null)}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; setTooltip(null); }}
              />
            ))}
          </div>
        ))}
      </div>

      {tooltip && (
        <div style={{
          position: "fixed", top: tooltip.y - 62, left: tooltip.x - 60,
          zIndex: 99999, pointerEvents: "none",
          background: "#1a1a1a", border: "1px solid #2a2a2a",
          borderRadius: "8px", padding: "8px 12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.7)", whiteSpace: "nowrap",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <p style={{ color: "#888", fontSize: "10px", margin: "0 0 3px" }}>
            {tooltip.cell.label}
            {tooltip.cell.isToday && <span style={{ color: "#f97316", marginLeft: "6px", fontWeight: 700 }}>TODAY</span>}
          </p>
          <p style={{ color: CELL_COLORS[tooltip.cell.level], fontSize: "12px", fontWeight: 900, margin: 0 }}>
            {tooltip.cell.score !== null
              ? `${(tooltip.cell.score * 100).toFixed(1)}% · ${CELL_LABELS[tooltip.cell.level]}`
              : "No data yet"}
          </p>
        </div>
      )}
    </div>
  );
}


function CalendarStats({ cells }) {
  const withData   = cells.filter((c) => c.score !== null);
  const highRisk   = cells.filter((c) => c.level === 4).length;
  const avgScore   = withData.length
    ? (withData.reduce((s, c) => s + c.score, 0) / withData.length * 100).toFixed(1)
    : null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
      {[
        { label: "Active Days",     value: withData.length, suffix: "",   color: "#f97316" },
        { label: "Avg Score",       value: avgScore ?? "—", suffix: avgScore ? "%" : "", color: "#eab308" },
        { label: "High Risk Days",  value: highRisk,        suffix: "",   color: "#ef4444" },
      ].map((s) => (
        <div key={s.label} style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "10px 12px", textAlign: "center" }}>
          <p style={{ fontSize: "9px", color: "#444", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px", fontFamily: "monospace" }}>{s.label}</p>
          <p style={{ fontSize: "18px", fontWeight: 900, color: s.color, margin: 0, fontFamily: "monospace" }}>{s.value}{s.suffix}</p>
        </div>
      ))}
    </div>
  );
}


export default function HeatmapCalendar({ history = [] }) {
  const [cells,    setCells]    = useState(() => buildCells([]));
  const [expanded, setExpanded] = useState(false);
  const [visible,  setVisible]  = useState(false);


  useEffect(() => {
    setCells(buildCells(history));
  }, [history]);

  const openModal  = () => { setExpanded(true); setTimeout(() => setVisible(true), 20); };
  const closeModal = useCallback(() => {
    setVisible(false);
    setTimeout(() => setExpanded(false), 280);
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const h = (e) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [expanded, closeModal]);

  const realDays = cells.filter((c) => c.score !== null).length;

  return (
    <>

      <div style={{
        background: "#111", border: "1px solid #1e1e1e",
        borderRadius: "12px", padding: "16px",
        display: "flex", flexDirection: "column", gap: "12px",
        transition: "border-color 200ms",
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = "#2a2a2a"}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = "#1e1e1e"}>


        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f97316", boxShadow: "0 0 8px #f97316", flexShrink: 0 }} />
            <h2 style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#e8e8e8", margin: 0 }}>
              Burnout Heatmap
            </h2>
            <span style={{
              fontSize: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em",
              color: realDays > 0 ? "#22c55e" : "#444",
              border: `1px solid ${realDays > 0 ? "#22c55e40" : "#2a2a2a"}`,
              borderRadius: "4px", padding: "1px 6px", fontFamily: "monospace",
            }}>
              {realDays} / 28 days
            </span>
          </div>

          <button onClick={openModal} style={{
            background: "transparent", border: "1px solid #2a2a2a", borderRadius: "6px",
            padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center",
            gap: "5px", color: "#555", fontSize: "9px", fontFamily: "monospace",
            textTransform: "uppercase", letterSpacing: "0.1em",
            transition: "color 200ms, border-color 200ms",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#f97316"; e.currentTarget.style.borderColor = "#f97316"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#555";    e.currentTarget.style.borderColor = "#2a2a2a"; }}>
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
            Expand
          </button>
        </div>


        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <HeatGrid cells={cells} cellSize={10} gap={3} showDayLabels={false} />

          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
            <span style={{ fontSize: "9px", color: "#444", fontFamily: "monospace", textTransform: "uppercase" }}>Low</span>
            {CELL_COLORS.map((c, i) => (
              <div key={i} title={CELL_LABELS[i]} style={{ width: "10px", height: "10px", borderRadius: "2px", background: c, boxShadow: i >= 3 ? `0 0 3px ${c}` : "none" }} />
            ))}
            <span style={{ fontSize: "9px", color: "#444", fontFamily: "monospace", textTransform: "uppercase" }}>High</span>
            <span style={{ marginLeft: "auto", fontSize: "9px", color: "#444", fontFamily: "monospace" }}>
              {realDays === 0 ? "Run an analysis to populate" : "Last 28 days"}
            </span>
          </div>

          {realDays === 0 && (
            <div style={{
              background: "rgba(249,115,22,0.05)", border: "1px dashed rgba(249,115,22,0.2)",
              borderRadius: "8px", padding: "10px", textAlign: "center",
            }}>
              <p style={{ color: "#555", fontSize: "10px", margin: 0, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                No predictions yet — all cells will light up after your first analysis
              </p>
            </div>
          )}
        </div>
      </div>


      {expanded && (
        <div onClick={closeModal} style={{
          position: "fixed", inset: 0, zIndex: 9000,
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: visible ? 1 : 0, transition: "opacity 280ms ease",
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "#111", border: "1px solid #2a2a2a", borderRadius: "16px", padding: "28px",
            display: "flex", flexDirection: "column", gap: "20px",
            boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
            minWidth: "340px", maxWidth: "90vw",
            transform: visible ? "scale(1)" : "scale(0.93)",
            transition: "transform 280ms cubic-bezier(0.34,1.2,0.64,1)",
            fontFamily: "'JetBrains Mono', monospace",
          }}>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f97316", boxShadow: "0 0 8px #f97316" }} />
                <h2 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#e8e8e8", margin: 0 }}>
                  Burnout Heatmap
                </h2>
                <span style={{ fontSize: "9px", color: "#444", border: "1px solid #2a2a2a", borderRadius: "4px", padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Last 28 Days · {realDays} with data
                </span>
              </div>
              <button onClick={closeModal} style={{
                background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px",
                width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#555", transition: "color 200ms, border-color 200ms",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#e8e8e8"; e.currentTarget.style.borderColor = "#555"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#555";    e.currentTarget.style.borderColor = "#2a2a2a"; }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <CalendarStats cells={cells} />
            <HeatGrid cells={cells} cellSize={22} gap={5} showDayLabels={true} />

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "10px", color: "#444", textTransform: "uppercase", letterSpacing: "0.1em" }}>Less</span>
              {CELL_COLORS.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "14px", height: "14px", borderRadius: "3px", background: c, boxShadow: i >= 3 ? `0 0 5px ${c}` : "none" }} />
                  <span style={{ fontSize: "9px", color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>{CELL_LABELS[i]}</span>
                </div>
              ))}
              <span style={{ fontSize: "10px", color: "#444", textTransform: "uppercase", letterSpacing: "0.1em" }}>More</span>
            </div>

            <p style={{ fontSize: "9px", color: "#333", textAlign: "center", margin: 0, textTransform: "uppercase", letterSpacing: "0.15em" }}>
              Press Esc or click outside to close
            </p>
          </div>
        </div>
      )}
    </>
  );
}