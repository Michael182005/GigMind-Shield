import { useState, useEffect, useRef } from "react";
import WorkerForm            from "../components/WorkerForm";
import BurnoutGauge          from "../components/BurnoutGauge";
import HistoryChart          from "../components/HistoryChart";
import RecommendationCard    from "../components/RecommendationCard";
import AnalyzingLoader       from "../components/AnalyzingLoader";
import AlertBanner           from "../components/AlertBanner";
import ComparisonCard        from "../components/ComparisonCard";
import HeatmapCalendar       from "../components/HeatmapCalendar";
import Confetti              from "../components/Confetti";
import RadarChart            from "../components/RadarChart";
import BurnoutWarningModal   from "../components/BurnoutWarningModal";
import { ToastContainer, useToast } from "../components/Toast";
import { getHistory, predictBurnout } from "../services/api";
import ReportCard            from "../components/ReportCard";


const DARK = {
  pageBg: "#0a0a0a", headerBg: "#0d0d0d", headerBdr: "#1a1a1a",
  cardBg: "#111111", cardBdr: "#1e1e1e", surfaceBg: "#0d0d0d",
  textPrimary: "#e8e8e8", textMuted: "#666666", textFaint: "#333333",
  accent: "#f97316", accentGlow: "rgba(249,115,22,0.35)",
  green: "#22c55e", yellow: "#eab308", red: "#ef4444",
};
const DIM = {
  pageBg: "#0f1623", headerBg: "#131d2e", headerBdr: "#1e2d42",
  cardBg: "#162033", cardBdr: "#1e2d42", surfaceBg: "#0f1623",
  textPrimary: "#dce6f0", textMuted: "#6b8299", textFaint: "#2d3f52",
  accent: "#f97316", accentGlow: "rgba(249,115,22,0.35)",
  green: "#22c55e", yellow: "#eab308", red: "#ef4444",
};


function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const prevRef = useRef(0);
  useEffect(() => {
    if (typeof target !== "number") return;
    const from = prevRef.current;
    prevRef.current = target;
    if (from === target) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p    = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + (target - from) * ease));
      if (p < 1) requestAnimationFrame(step);
      else setValue(target);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}


function StatCard({ label, numericValue, suffix = "", color, t }) {
  const animated = useCountUp(numericValue ?? 0);
  return (
    <div style={{
      background: t.cardBg, border: `1px solid ${t.cardBdr}`,
      borderRadius: "8px", padding: "12px 16px",
      transition: "background 400ms, border-color 400ms",
    }}>
      <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: t.textMuted, margin: "0 0 4px", fontFamily: "monospace" }}>
        {label}
      </p>
      <p style={{ fontSize: "14px", fontWeight: 700, margin: 0, color: color || t.textPrimary, fontFamily: "monospace" }}>
        {animated}{suffix}
      </p>
    </div>
  );
}


function SystemToggleCard({ online, onToggle, t }) {
  const [flickering, setFlickering] = useState(false);
  const handleClick = () => { setFlickering(true); setTimeout(() => { setFlickering(false); onToggle(); }, 380); };
  const color = online ? "#22c55e" : "#ef4444";
  return (
    <div onClick={handleClick} style={{
      background: t.cardBg, border: `1px solid ${color}55`,
      borderRadius: "8px", padding: "12px 16px",
      cursor: "pointer", userSelect: "none", position: "relative", overflow: "hidden",
      boxShadow: `0 0 ${online ? 14 : 22}px ${color}18`,
      transition: "border-color 600ms, box-shadow 600ms, background 400ms",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = color + "99"; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = color + "55"; }}>
      {flickering && (
        <div style={{ position: "absolute", inset: 0, background: color + "28", animation: "cardFlicker 380ms ease", pointerEvents: "none", zIndex: 1 }} />
      )}
      <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: t.textMuted, margin: "0 0 8px", fontFamily: "monospace" }}>
        System Status
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "26px", height: "26px", borderRadius: "50%",
          border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 ${online ? 12 : 8}px ${color}`, flexShrink: 0,
          animation: online ? "pwrPulse 2.2s ease-in-out infinite" : "none",
          transition: "box-shadow 600ms, border-color 600ms",
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" />
          </svg>
        </div>
        <div>
          <p style={{ fontSize: "13px", fontWeight: 700, margin: 0, color, fontFamily: "monospace", transition: "color 600ms" }}>
            {online ? "ONLINE" : "OFFLINE"}
          </p>
          <p style={{ fontSize: "9px", margin: 0, color: t.textMuted, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {online ? "Click to shut down" : "Click to restart"}
          </p>
        </div>
      </div>
    </div>
  );
}


function OfflineOverlay() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 8000, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(3px)", pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, height: "2px", background: "linear-gradient(transparent, rgba(239,68,68,0.7), transparent)", animation: "scanline 2.4s linear infinite" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 25%, rgba(239,68,68,0.1) 100%)" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}>
        <div style={{ width: "76px", height: "76px", borderRadius: "50%", border: "3px solid #ef4444", margin: "0 auto 22px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 48px #ef444480", animation: "glitchShake 1.8s infinite" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" />
          </svg>
        </div>
        <p style={{ color: "#ef4444", fontSize: "26px", fontWeight: 900, margin: "0 0 10px", letterSpacing: "0.25em", textTransform: "uppercase", animation: "glitchShake 2s infinite" }}>SYSTEM OFFLINE</p>
        <p style={{ color: "#555", fontSize: "11px", margin: "0 0 6px", letterSpacing: "0.15em", textTransform: "uppercase" }}>All burnout analysis suspended</p>
        <p style={{ color: "#333", fontSize: "10px", margin: 0, letterSpacing: "0.1em", textTransform: "uppercase" }}>Use the power switch in the stat bar to restore service</p>
      </div>
    </div>
  );
}


function BeyondLimitCard({ extraWork, extraPayout, t }) {
  const animJobs   = useCountUp(extraWork   || 0, 1600);
  const animPayout = useCountUp(extraPayout || 0, 1600);
  const [entered, setEntered] = useState(false);
  useEffect(() => { const id = setTimeout(() => setEntered(true), 60); return () => clearTimeout(id); }, []);
  return (
    <div style={{
      background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.35)",
      borderRadius: "12px", padding: "20px", position: "relative", overflow: "hidden",
      opacity: entered ? 1 : 0, transform: entered ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 500ms ease, transform 500ms ease",
      boxShadow: "0 0 32px rgba(239,68,68,0.12)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#ef4444", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: "6px", padding: "3px 10px", animation: "beyondPulse 2s ease-in-out infinite" }}>
          ⚡ Working Beyond Safe Limit
        </span>
      </div>
      <p style={{ fontSize: "11px", color: "#666", margin: "0 0 16px", lineHeight: 1.6 }}>
        This worker chose to continue beyond the safe workload threshold.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "14px" }}>
          <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#666", margin: "0 0 6px", fontFamily: "monospace" }}>Extra Work Completed</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span style={{ fontSize: "28px", fontWeight: 900, color: "#ef4444", fontFamily: "monospace", lineHeight: 1 }}>{animJobs}</span>
            <span style={{ fontSize: "13px", color: "#666", fontFamily: "monospace" }}>jobs</span>
          </div>
          <p style={{ fontSize: "9px", color: "#444", margin: "6px 0 0", textTransform: "uppercase", letterSpacing: "0.1em" }}>beyond safe limit</p>
        </div>
        <div style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: "8px", padding: "14px" }}>
          <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#666", margin: "0 0 6px", fontFamily: "monospace" }}>Extra Compensation</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#f97316", fontFamily: "monospace", lineHeight: 1 }}>₹</span>
            <span style={{ fontSize: "28px", fontWeight: 900, color: "#f97316", fontFamily: "monospace", lineHeight: 1 }}>{animPayout}</span>
          </div>
          <p style={{ fontSize: "9px", color: "#444", margin: "6px 0 0", textTransform: "uppercase", letterSpacing: "0.1em" }}>earned for extra effort</p>
        </div>
      </div>
      <style>{`@keyframes beyondPulse { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0);} 50%{box-shadow:0 0 0 4px rgba(239,68,68,0.15);} }`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [result,       setResult]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [isDark,       setIsDark]       = useState(true);
  const [showConf,     setShowConf]     = useState(false);


  const [history,      setHistory]      = useState([]);

  const [formData,     setFormData]     = useState({});
  const [showReport,   setShowReport]   = useState(false);
  const [systemOnline, setSystemOnline] = useState(true);
  const [avgResponse,  setAvgResponse]  = useState(0);


  const [showWarning,    setShowWarning]    = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [extraWork,      setExtraWork]      = useState(null);
  const [extraPayout,    setExtraPayout]    = useState(null);
  const [workedBeyond,   setWorkedBeyond]   = useState(false);

  const T = isDark ? DARK : DIM;
  const { toasts, addToast, removeToast } = useToast();

  const score = result?.burnout_score ?? null;
  const risk  = result?.risk_level   ?? null;


  const predictionsRun  = history.length;


  const namedRecords    = history.filter((h) => h.name && h.name.trim() !== "");
  const uniqueNames     = new Set(namedRecords.map((h) => h.name.trim().toLowerCase())).size;
  const workersAnalyzed = namedRecords.length > 0 ? uniqueNames : predictionsRun;

  const workerInfo = {
    name:      formData.name      || "",
    job_title: formData.job_title || "",
    platform:  formData.platform  || "",
    location:  formData.location  || "",
  };


  const refreshHistory = () => {
    getHistory()
      .then((d) => setHistory(Array.isArray(d) ? d : []))
      .catch(() => setHistory([]));
  };

  useEffect(() => { refreshHistory(); }, []);


  const handleResult = (data, responseMs) => {
    setResult(data);
    setLoading(false);

    if (typeof responseMs === "number" && responseMs > 0) {
      setAvgResponse((prev) => prev === 0 ? responseMs : Math.round(prev * 0.7 + responseMs * 0.3));
    }

    const r = (data.risk_level ?? "").toUpperCase();
    const s = data.burnout_score ?? 0;

  
    refreshHistory();

    addToast(
      `Analysis Complete · ${r} RISK`,
      `Burnout score: ${(s * 100).toFixed(1)}% — ${
        r === "HIGH"   ? "Immediate action recommended." :
        r === "MEDIUM" ? "Monitor and reduce workload."  :
        "Great work — you're in a healthy range!"
      }`,
      r || "INFO"
    );

    if (r === "LOW") { setShowConf(true); setTimeout(() => setShowConf(false), 3200); }
  };


  const handleBurnoutWarning = (payload, firstResult) => {
    setResult(firstResult);
    setLoading(false);
    setPendingPayload(payload);
    setShowWarning(true);
  };


  const handleBreak = () => {
    setShowWarning(false);
    setPendingPayload(null);
    const r = (result?.risk_level ?? "").toUpperCase();
    if (r === "LOW") {
      addToast("Keep It Up! 🎉", "Your burnout risk is low — great work maintaining a healthy pace!", "LOW");
    } else if (r === "MEDIUM") {
      addToast("Noted 👍", "Stay mindful of your workload. Small breaks go a long way.", "MEDIUM");
    } else {
      addToast("Break Recommended ☕", "Rest is important. Your risk level has been logged.", "HIGH");
    }
  };


  const handleContinue = async () => {
    setShowWarning(false);
    if (!pendingPayload) return;
    setLoading(true);
    const t0 = Date.now();
    try {
      const res        = await predictBurnout({ ...pendingPayload, continue_at_risk: true });
      const responseMs = Date.now() - t0;
      setResult(res);
      setLoading(false);
      setWorkedBeyond(true);
      if (res.extra_work   !== undefined) setExtraWork(res.extra_work);
      if (res.extra_payout !== undefined) setExtraPayout(res.extra_payout);
      if (typeof responseMs === "number") {
        setAvgResponse((prev) => prev === 0 ? responseMs : Math.round(prev * 0.7 + responseMs * 0.3));
      }
      refreshHistory();
      addToast("⚡ Working Beyond Safe Limit", `Extra jobs: ${res.extra_work ?? "—"} · Extra pay: ₹${res.extra_payout ?? "—"}`, "HIGH");
    } catch (err) {
      console.error("Continue-at-risk error:", err);
      setLoading(false);
    }
    setPendingPayload(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: T.pageBg, color: T.textPrimary, fontFamily: "'JetBrains Mono', monospace", transition: "background 400ms" }}>
      <Confetti active={showConf} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {loading && <AnalyzingLoader />}
      {!systemOnline && <OfflineOverlay />}

      {showWarning && (
        <BurnoutWarningModal
          formData={formData}
          riskLevel={result?.risk_level ?? "HIGH"}
          onBreak={handleBreak}
          onContinue={handleContinue}
        />
      )}
      {showReport && (
        <ReportCard score={score} riskLevel={risk} formData={formData} workerInfo={workerInfo} onClose={() => setShowReport(false)} />
      )}


      <header style={{
        borderBottom: `1px solid ${systemOnline ? T.headerBdr : "#ef444440"}`,
        background: systemOnline ? T.headerBg : "#0d0000",
        position: "sticky", top: 0, zIndex: 20,
        transition: "background 700ms, border-color 700ms",
      }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: systemOnline ? T.accent : "#ef4444", boxShadow: `0 0 12px ${systemOnline ? T.accentGlow : "#ef444460"}`, transition: "background 700ms" }}>
              <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <span className="text-sm font-black tracking-wider" style={{ color: T.textPrimary }}>GIGMIND</span>
              <span className="text-sm font-black tracking-wider" style={{ color: systemOnline ? T.accent : "#ef4444", transition: "color 700ms" }}> SHIELD</span>
            </div>
            {workedBeyond && (
              <span style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#ef4444", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "4px", padding: "2px 8px", animation: "beyondBadge 2s infinite" }}>
                ⚡ Beyond Safe Limit
              </span>
            )}
            {!systemOnline && (
              <span style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#ef4444", border: "1px solid #ef444460", borderRadius: "4px", padding: "2px 8px", animation: "glitchShake 2s infinite" }}>
                ⚠ OFFLINE
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {score !== null && systemOnline && (
              <button onClick={() => setShowReport(true)}
                className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest border rounded-lg px-3 py-1.5"
                style={{ color: T.textMuted, borderColor: T.cardBdr, background: "transparent", cursor: "pointer", transition: "color 200ms, border-color 200ms" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = T.accent; e.currentTarget.style.borderColor = T.accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.borderColor = T.cardBdr; }}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
                </svg>
                Share Report
              </button>
            )}
            <button onClick={() => setIsDark((d) => !d)}
              className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest border rounded-lg px-3 py-1.5"
              style={{ color: T.textMuted, borderColor: T.cardBdr, background: T.surfaceBg, cursor: "pointer", transition: "color 200ms, border-color 200ms, background 400ms" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = T.accent; e.currentTarget.style.borderColor = T.accent; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.borderColor = T.cardBdr; }}>
              {isDark ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
              <span className="hidden sm:inline">{isDark ? "Dim" : "Dark"}</span>
            </button>
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest" style={{ color: T.textMuted }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: systemOnline ? T.green : "#ef4444", transition: "background 700ms" }} />
              {systemOnline ? "API Live" : "API Offline"}
            </span>
          </div>
        </div>
      </header>


      <div className="max-w-7xl mx-auto px-6 pt-5">
        {systemOnline ? <AlertBanner riskLevel={risk} /> : (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "14px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ color: "#ef4444", fontSize: "20px" }}>⚠</span>
            <div>
              <p style={{ color: "#ef4444", fontWeight: 700, fontSize: "11px", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.15em" }}>Monitoring System Offline</p>
              <p style={{ color: "#555", fontSize: "10px", margin: 0, textTransform: "uppercase", letterSpacing: "0.1em" }}>All burnout analysis suspended — use the power switch to restore</p>
            </div>
          </div>
        )}
      </div>


      <div className="max-w-7xl mx-auto px-6 py-6">
        <span className="text-[10px] uppercase tracking-[0.3em] font-semibold" style={{ color: systemOnline ? T.accent : "#ef4444", transition: "color 700ms" }}>
          ● {systemOnline ? "Worker Analytics" : "System Suspended"}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 leading-tight" style={{ color: T.textPrimary }}>
          Burnout Detection Dashboard
        </h1>
        <p className="text-sm mt-1 max-w-lg" style={{ color: T.textMuted }}>
          Real-time AI-powered mental health monitoring for gig economy workers.
        </p>
      </div>


      <div className="max-w-7xl mx-auto px-6 mb-7">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Predictions Run"  numericValue={predictionsRun}  color={systemOnline ? T.green : "#444"} t={T} />
          <StatCard label="Avg Response"     numericValue={avgResponse}     suffix="ms"
            color={avgResponse === 0 ? T.textMuted : avgResponse < 300 ? T.green : avgResponse < 600 ? T.yellow : T.red} t={T} />
          <StatCard label="Workers Analyzed" numericValue={workersAnalyzed} color={systemOnline ? T.accent : "#444"} t={T} />
          <SystemToggleCard online={systemOnline} onToggle={() => setSystemOnline((v) => !v)} t={T} />
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">


          <div className="flex flex-col gap-5">
            <WorkerForm
              onResult={handleResult}
              onLoading={setLoading}
              onFormChange={setFormData}
              onBurnoutWarning={handleBurnoutWarning}
              systemOnline={systemOnline}
            />

            {score !== null && (
              <div style={{ background: T.cardBg, border: `1px solid ${T.cardBdr}`, borderRadius: "12px", padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: T.textMuted }}>Last Score</span>
                    <p style={{ fontSize: "22px", fontWeight: 900, margin: "2px 0 0", color: T.accent, fontFamily: "monospace" }}>
                      {(score * 100).toFixed(1)}%
                    </p>
                  </div>
                  {workerInfo.name && (
                    <div style={{ textAlign: "right", maxWidth: "55%" }}>
                      <p style={{ fontSize: "12px", fontWeight: 700, color: T.textPrimary, margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {workerInfo.name}
                      </p>
                      {workerInfo.job_title && <p style={{ fontSize: "10px", color: T.textMuted, margin: "0 0 4px" }}>{workerInfo.job_title}</p>}
                      <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                        {workerInfo.platform && (
                          <span style={{ fontSize: "9px", background: T.accent + "20", color: T.accent, border: `1px solid ${T.accent}40`, borderRadius: "4px", padding: "1px 6px", textTransform: "uppercase" }}>
                            {workerInfo.platform}
                          </span>
                        )}
                        {workerInfo.location && (
                          <span style={{ fontSize: "9px", background: "#1e1e1e", color: T.textMuted, border: `1px solid ${T.cardBdr}`, borderRadius: "4px", padding: "1px 6px" }}>
                            📍 {workerInfo.location}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {workedBeyond && extraWork !== null && (
              <BeyondLimitCard extraWork={extraWork} extraPayout={extraPayout} t={T} />
            )}

            <ComparisonCard score={score} />
          </div>


          <div className="flex flex-col gap-5">
            <BurnoutGauge score={score} riskLevel={risk} />
            <RadarChart formData={formData} riskLevel={risk} />
            <RecommendationCard score={score} riskLevel={risk} />
          </div>


          <div className="flex flex-col gap-5">


            <HistoryChart history={history} />


            <div style={{ background: T.cardBg, border: `1px solid ${T.cardBdr}`, borderRadius: "12px", padding: "20px" }}>
              <p className="text-[10px] uppercase tracking-[0.2em] mb-3 font-semibold" style={{ color: T.textMuted }}>Risk Threshold Legend</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Low Risk",    range: "0–40%",   color: T.green  },
                  { label: "Medium Risk", range: "41–70%",  color: T.yellow },
                  { label: "High Risk",   range: "71–100%", color: T.red    },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: row.color, boxShadow: `0 0 5px ${row.color}` }} />
                      <span className="text-xs" style={{ color: T.textPrimary }}>{row.label}</span>
                    </div>
                    <span className="text-[10px] font-mono" style={{ color: T.textMuted }}>{row.range}</span>
                  </div>
                ))}
              </div>
            </div>


            <HeatmapCalendar history={history} />
          </div>
        </div>
      </div>

      <footer style={{ borderTop: `1px solid ${T.headerBdr}`, padding: "16px 24px" }}>
        <p className="text-center text-[10px] uppercase tracking-[0.2em]" style={{ color: T.textFaint }}>
          GigMind Shield · Burnout Intelligence Platform · Hackathon Build
        </p>
      </footer>

      <style>{`
        @keyframes scanline     { 0%{transform:translateY(-100%);}100%{transform:translateY(100vh);} }
        @keyframes glitchShake  { 0%,100%{transform:translateX(0);opacity:1;} 20%{transform:translateX(-4px);opacity:.8;} 40%{transform:translateX(4px);opacity:.9;} 60%{transform:translateX(-2px);opacity:.75;} 80%{transform:translateX(2px);opacity:.9;} }
        @keyframes pwrPulse     { 0%,100%{box-shadow:0 0 10px #22c55e;} 50%{box-shadow:0 0 22px #22c55e,0 0 44px #22c55e35;} }
        @keyframes cardFlicker  { 0%{opacity:0;} 25%{opacity:1;} 50%{opacity:0;} 75%{opacity:1;} 100%{opacity:0;} }
        @keyframes beyondBadge  { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0);} 50%{box-shadow:0 0 0 4px rgba(239,68,68,0.2);} }
      `}</style>
    </div>
  );
}