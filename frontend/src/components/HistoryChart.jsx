import { useEffect, useRef, useState } from "react";
import {
  Chart, LineElement, PointElement, LineController,
  CategoryScale, LinearScale, Tooltip, Filler,
} from "chart.js";

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Filler);


function parseScore(raw) {
  const n = parseFloat(raw);
  if (isNaN(n)) return null;
  return n <= 1 ? parseFloat((n * 100).toFixed(1)) : parseFloat(n.toFixed(1));
}

function buildChartConfig(ctx, labels, scores) {
  const grad = ctx.createLinearGradient(0, 0, 0, 320);
  grad.addColorStop(0, "rgba(249,115,22,0.28)");
  grad.addColorStop(1, "rgba(249,115,22,0)");
  return {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Burnout Score (%)",
        data: scores,
        borderColor: "#f97316", borderWidth: 2.5,
        pointBackgroundColor: "#f97316", pointBorderColor: "#111",
        pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 8,
        tension: 0.45, fill: true, backgroundColor: grad,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1a1a1a", borderColor: "#2a2a2a", borderWidth: 1,
          titleColor: "#e8e8e8", bodyColor: "#f97316", padding: 12,
          callbacks: { label: (c) => ` Score: ${c.parsed.y}%` },
        },
      },
      scales: {
        x: { grid: { color: "#1a1a1a" }, ticks: { color: "#555", font: { size: 11, family: "monospace" } }, border: { color: "#2a2a2a" } },
        y: { min: 0, max: 100, grid: { color: "#1a1a1a" }, ticks: { color: "#555", font: { size: 11, family: "monospace" }, callback: (v) => `${v}%` }, border: { color: "#2a2a2a" } },
      },
      animation: { duration: 700, easing: "easeInOutQuart" },
    },
  };
}

function ExpandedModal({ labels, scores, onClose }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t); }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !labels?.length) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvas.getContext("2d");
    chartRef.current = new Chart(ctx, buildChartConfig(ctx, labels, scores));
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [labels, scores]);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 280); };

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <div onClick={handleClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", opacity: visible ? 1 : 0, transition: "opacity 280ms ease" }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ transform: visible ? "scale(1) translateY(0)" : "scale(0.92) translateY(24px)", opacity: visible ? 1 : 0, transition: "transform 300ms cubic-bezier(0.34,1.56,0.64,1), opacity 280ms ease", width: "100%", maxWidth: "860px" }}
        className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-6 sm:p-8 flex flex-col gap-5 shadow-[0_0_80px_rgba(249,115,22,0.12)]">

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" style={{ boxShadow: "0 0 10px #f97316" }} />
              <h2 className="text-base font-black uppercase tracking-[0.15em] text-[#e8e8e8]">Burnout Trend Analysis</h2>
            </div>
            <p className="text-[11px] text-[#555] font-mono ml-5 uppercase tracking-widest">
              Full history · {scores?.length ?? 0} data point{scores?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={handleClose}
            className="w-9 h-9 rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] flex items-center justify-center text-[#555] hover:text-[#e8e8e8] hover:border-[#f97316] transition-all duration-200 group">
            <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {scores && scores.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Peak",    value: `${Math.max(...scores).toFixed(1)}%`, color: "#ef4444" },
              { label: "Average", value: `${(scores.reduce((a,b) => a+b,0)/scores.length).toFixed(1)}%`, color: "#eab308" },
              { label: "Latest",  value: `${scores[scores.length-1].toFixed(1)}%`, color: "#f97316" },
              { label: "Lowest",  value: `${Math.min(...scores).toFixed(1)}%`, color: "#22c55e" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg px-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                <span className="text-[10px] uppercase tracking-widest text-[#555] font-mono">{s.label}</span>
                <span className="text-xs font-black text-[#e8e8e8] font-mono">{s.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="relative w-full" style={{ height: "340px" }}>
          <canvas ref={canvasRef} />
        </div>

        <p className="text-center text-[10px] text-[#333] uppercase tracking-[0.2em] font-mono">
          Press <kbd className="border border-[#2a2a2a] px-1.5 py-0.5 rounded text-[#555]">Esc</kbd> or click outside to close
        </p>
      </div>
    </div>
  );
}


export default function HistoryChart({ history = [] }) {
  const canvasRef  = useRef(null);
  const chartRef   = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [chartData, setChartData] = useState({ labels: [], scores: [] });


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!history || history.length === 0) {
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
      setChartData({ labels: [], scores: [] });
      return;
    }

    const labels = history.map((d, i) =>
      d.timestamp
        ? new Date(d.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : `Run ${i + 1}`
    );
    const scores = history
      .map((d) => parseScore(d.burnout_score))
      .filter((s) => s !== null);

    setChartData({ labels, scores });

    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvas.getContext("2d");
    chartRef.current = new Chart(ctx, buildChartConfig(ctx, labels, scores));

    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [history]);

  const empty = !history || history.length === 0;

  return (
    <>
      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6 shadow-lg hover:border-[#2a2a2a] transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#f97316] shadow-[0_0_8px_#f97316]" />
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[#e8e8e8]">Burnout History</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#444] border border-[#2a2a2a] px-2 py-0.5 rounded">
              {history.length} records
            </span>
            {!empty && (
              <button onClick={() => setExpanded(true)} title="Expand chart"
                className="w-7 h-7 rounded-md border border-[#2a2a2a] bg-[#0d0d0d] flex items-center justify-center text-[#555] hover:text-[#f97316] hover:border-[#f97316] transition-all duration-200">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className={`relative h-56 ${!empty ? "cursor-pointer group" : ""}`}
          onClick={() => { if (!empty) setExpanded(true); }}>

          {empty && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <svg className="w-10 h-10 text-[#2a2a2a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-xs text-[#444] uppercase tracking-widest">No history yet — run your first analysis</p>
            </div>
          )}

          <canvas ref={canvasRef} className={`${empty ? "opacity-0" : "opacity-100"} transition-opacity group-hover:opacity-80 duration-200`} />

          {!empty && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="flex items-center gap-2 bg-[#0d0d0d]/90 border border-[#2a2a2a] px-4 py-2 rounded-lg">
                <svg className="w-4 h-4 text-[#f97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span className="text-xs font-mono uppercase tracking-widest text-[#e8e8e8]">Click to expand</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <ExpandedModal
          labels={chartData.labels}
          scores={chartData.scores}
          onClose={() => setExpanded(false)}
        />
      )}
    </>
  );
}