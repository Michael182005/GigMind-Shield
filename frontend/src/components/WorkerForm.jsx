import { useState, useEffect, useCallback } from "react";
import { predictBurnout, parseNaturalLanguage } from "../services/api";

const PROFILES = [
  { label: "— Custom Input —",     value: "custom",    data: null },
  { label: "🚗  Ride Share Driver", value: "rideshare", data: { hours_worked: 68, rating: 4.1, jobs_completed: 32, days_without_break: 14, stress_level: 7 } },
  { label: "📦  Delivery Courier",  value: "delivery",  data: { hours_worked: 72, rating: 3.8, jobs_completed: 45, days_without_break: 18, stress_level: 8 } },
  { label: "💻  Freelance Designer",value: "designer",  data: { hours_worked: 55, rating: 4.6, jobs_completed: 12, days_without_break: 8,  stress_level: 5 } },
  { label: "📝  Content Creator",   value: "creator",   data: { hours_worked: 48, rating: 4.2, jobs_completed: 20, days_without_break: 5,  stress_level: 4 } },
  { label: "🔧  Freelance Developer",value: "dev",      data: { hours_worked: 62, rating: 4.8, jobs_completed: 8,  days_without_break: 10, stress_level: 6 } },
];

const EMPTY_FORM     = { hours_worked: "", rating: "", jobs_completed: "", days_without_break: "", stress_level: 5 };
const EMPTY_IDENTITY = { name: "", job_title: "", platform: "", location: "" };

const FIELDS = [
  { name: "hours_worked",       label: "Hours Worked / Week",      placeholder: "e.g. 52" },
  { name: "rating",             label: "Performance Rating (1–5)",  placeholder: "e.g. 3.5" },
  { name: "jobs_completed",     label: "Jobs Completed",            placeholder: "e.g. 18" },
  { name: "days_without_break", label: "Days Without Break",        placeholder: "e.g. 12" },
];

const NLP_EXAMPLES = [
  "I worked 68 hours this week, completed 32 deliveries, no days off in 2 weeks, feeling very stressed",
  "14 hour shifts for 10 days straight, 45 jobs done, rating around 3.8, extremely burnt out",
  "Light week — 40 hours, 8 projects, took 2 days off, stress is pretty low, rated 4.6 by clients",
];

function getStressBg(l)     { const s = Number(l); return s <= 3 ? "rgba(34,197,94,0.06)"  : s <= 6 ? "rgba(249,115,22,0.06)" : "rgba(239,68,68,0.07)"; }
function getStressBorder(l) { const s = Number(l); return s <= 3 ? "rgba(34,197,94,0.25)"  : s <= 6 ? "#1e1e1e"               : "rgba(239,68,68,0.25)"; }
function getStressColor(l)  { const s = Number(l); return s <= 3 ? "#22c55e"                : s <= 6 ? "#f97316"               : "#ef4444"; }
function getStressLabel(l)  { const s = Number(l); return s <= 3 ? "Low"                    : s <= 6 ? "Moderate"              : "High"; }

const inputClass = "w-full bg-[#0d0d0d] border border-[#2a2a2a] text-[#e8e8e8] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-all placeholder-[#444]";
const labelClass = "block text-xs font-semibold uppercase tracking-widest text-[#666] mb-1.5";

function InlineToast({ message, type = "success", onDismiss }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 30);
    const t2 = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 300); }, 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  const color  = type === "success" ? "#22c55e" : "#ef4444";
  const bg     = type === "success" ? "rgba(34,197,94,0.08)"  : "rgba(239,68,68,0.08)";
  const border = type === "success" ? "rgba(34,197,94,0.25)"  : "rgba(239,68,68,0.25)";
  return (
    <div style={{
      background: bg, border: `1px solid ${border}`, borderRadius: "8px", padding: "10px 14px",
      display: "flex", alignItems: "center", gap: "10px",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-6px)",
      transition: "opacity 280ms ease, transform 280ms ease", fontFamily: "'JetBrains Mono', monospace",
    }}>
      <span style={{ color, fontWeight: 900, fontSize: "13px" }}>{type === "success" ? "✓" : "✕"}</span>
      <p style={{ color, fontSize: "11px", fontWeight: 600, margin: 0, flex: 1 }}>{message}</p>
      <button onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: "12px", padding: 0 }}>✕</button>
    </div>
  );
}


export default function WorkerForm({
  onResult,
  onLoading,
  onFormChange,
  onBurnoutWarning,  
  systemOnline = true,
}) {
  const [profile,        setProfile]        = useState("custom");
  const [form,           setForm]           = useState(EMPTY_FORM);
  const [identity,       setIdentity]       = useState(EMPTY_IDENTITY);
  const [errors,         setErrors]         = useState({});
  const [loading,        setLoading]        = useState(false);
  const [mode,           setMode]           = useState("form");
  const [nlpText,        setNlpText]        = useState("");
  const [nlpLoading,     setNlpLoading]     = useState(false);
  const [nlpToast,       setNlpToast]       = useState(null);
  const [aiFilledFields, setAiFilledFields] = useState(new Set());

  useEffect(() => {
    if (onFormChange) onFormChange({ ...form, ...identity });
  }, [form, identity]);

  const handleProfileChange = (e) => {
    const val    = e.target.value;
    const preset = PROFILES.find((p) => p.value === val);
    setProfile(val);
    setErrors({});
    setForm(preset?.data ? { ...preset.data } : { ...EMPTY_FORM });
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    if (profile !== "custom") setProfile("custom");
  };

  const handleIdentityChange = (e) => {
    setIdentity((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!identity.name.trim())
      e.name = "Worker name is required";
    if (!form.hours_worked || Number(form.hours_worked) < 0 || Number(form.hours_worked) > 168)
      e.hours_worked = "Enter hours between 0–168";
    if (!form.rating || Number(form.rating) < 1 || Number(form.rating) > 5)
      e.rating = "Rating must be 1–5";
    if (!form.jobs_completed || Number(form.jobs_completed) < 0)
      e.jobs_completed = "Enter a valid job count";
    if (!form.days_without_break || Number(form.days_without_break) < 0)
      e.days_without_break = "Enter valid days";
    return e;
  };


  const buildPayload = useCallback((continueAtRisk = false) => ({
    hours_worked:       Number(form.hours_worked),
    rating:             Number(form.rating),
    jobs_completed:     Number(form.jobs_completed),
    days_without_break: Number(form.days_without_break),
    stress_level:       Number(form.stress_level),
    name:               identity.name.trim(),
    job_title:          identity.job_title.trim()  || null,
    platform:           identity.platform.trim()   || null,
    location:           identity.location.trim()   || null,
    ...(continueAtRisk ? { continue_at_risk: true } : {}),
  }), [form, identity]);

  const handleSubmit = useCallback(async () => {
    if (loading || !systemOnline) return;
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setLoading(true);
    onLoading(true);

    const t0            = Date.now();
    const payload       = buildPayload(false);
    const controller    = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), 15000);

    try {
      const result     = await predictBurnout(payload);
      const responseMs = Date.now() - t0;


      if (onBurnoutWarning) {
        onBurnoutWarning(payload, { ...result, responseMs });
      } else {
        onResult(result, responseMs, payload);
      }
    } catch (err) {
      console.error("Prediction error:", err);
      const isTimeout = err.name === "AbortError" || err.code === "ECONNABORTED";
      const is422     = err?.response?.status === 422;
      const msg = isTimeout
        ? "Timed out — is the backend running? Run: uvicorn main:app --reload"
        : is422
          ? "Validation error — check all fields are filled correctly"
          : err?.response?.data?.detail
            ? String(err.response.data.detail)
            : "Cannot reach backend — run: uvicorn main:app --reload";
      setNlpToast({ message: msg, type: "error" });
    } finally {
      clearTimeout(timeoutHandle);
      setLoading(false);
      onLoading(false);
    }
  }, [form, identity, loading, systemOnline, onResult, onLoading, onBurnoutWarning, buildPayload]);


  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); handleSubmit(); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [handleSubmit]);


  const handleNlpParse = async () => {
    if (!nlpText.trim() || nlpLoading) return;
    setNlpLoading(true);
    setNlpToast(null);
    try {
      const data   = await parseNaturalLanguage(nlpText.trim());
      const parsed = data?.parsed_data;
      if (!parsed) throw new Error("No parsed data returned");
      const newForm = {
        hours_worked:       parsed.hours_worked       ?? form.hours_worked,
        rating:             parsed.rating             ?? form.rating,
        jobs_completed:     parsed.jobs_completed     ?? form.jobs_completed,
        days_without_break: parsed.days_without_break ?? form.days_without_break,
        stress_level:       parsed.stress_level       ?? form.stress_level,
      };
      const filled = new Set(Object.keys(parsed).filter((k) => parsed[k] !== null && parsed[k] !== undefined));
      setForm(newForm);
      setProfile("custom");
      setErrors({});
      setAiFilledFields(filled);
      setTimeout(() => setAiFilledFields(new Set()), 2000);
      setNlpToast({ message: "✦ AI extracted worker data successfully", type: "success" });
    } catch (err) {
      console.error("NLP parse error:", err);
      setNlpToast({ message: "Could not parse text — try rephrasing", type: "error" });
    } finally {
      setNlpLoading(false);
    }
  };

  const stressBg     = getStressBg(form.stress_level);
  const stressBorder = getStressBorder(form.stress_level);
  const stressColor  = getStressColor(form.stress_level);
  const stressLabel  = getStressLabel(form.stress_level);

  return (
    <div style={{
      background:    stressBg,
      border:        `1px solid ${stressBorder}`,
      borderRadius:  "12px",
      padding:       "24px",
      display:       "flex",
      flexDirection: "column",
      gap:           "20px",
      boxShadow:     "0 4px 24px rgba(0,0,0,0.3)",
      transition:    "background 600ms ease, border-color 600ms ease",
      position:      "relative",
      overflow:      "hidden",
    }}>


      {!systemOnline && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          background: "rgba(0,0,0,0.82)", backdropFilter: "blur(3px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px",
          borderRadius: "12px",
        }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "2px solid #ef4444", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 28px #ef444460" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <p style={{ color: "#ef4444", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", margin: 0 }}>Access Denied</p>
          <p style={{ color: "#555", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.12em", margin: 0, textAlign: "center", lineHeight: 1.8 }}>
            System is offline<br/>Use power switch to resume
          </p>
        </div>
      )}


      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full" style={{ background: "#f97316", boxShadow: "0 0 8px #f97316" }} />
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[#e8e8e8]">Worker Input</h2>
        </div>
        <span className="text-[9px] font-mono text-[#444] border border-[#2a2a2a] px-2 py-0.5 rounded">Ctrl + ↵</span>
      </div>


      <div style={{ background: "rgba(249,115,22,0.04)", border: "1px solid rgba(249,115,22,0.15)", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#f97316" strokeWidth="2" strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#f97316" }}>Worker Identity</span>
          <span style={{ fontSize: "9px", color: "#555", marginLeft: "auto", fontFamily: "monospace" }}>Name required</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <label className={labelClass}>Full Name <span style={{ color: "#ef4444" }}>*</span></label>
            <input type="text" name="name" value={identity.name} onChange={handleIdentityChange} placeholder="e.g. Arjun Kumar" className={inputClass}
              style={errors.name ? { borderColor: "#ef4444", boxShadow: "0 0 0 2px rgba(239,68,68,0.15)" } : {}} />
            {errors.name && <p className="text-[#ef4444] text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className={labelClass}>Job Title</label>
            <input type="text" name="job_title" value={identity.job_title} onChange={handleIdentityChange} placeholder="e.g. Delivery Driver" className={inputClass} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <label className={labelClass}>Platform</label>
            <input type="text" name="platform" value={identity.platform} onChange={handleIdentityChange} placeholder="e.g. Uber, Fiverr" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input type="text" name="location" value={identity.location} onChange={handleIdentityChange} placeholder="e.g. Chennai" className={inputClass} />
          </div>
        </div>
      </div>


      <div style={{ display: "flex", background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "3px", gap: "2px" }}>
        {[{ key: "form", label: "⊞  Form Mode" }, { key: "ai", label: "✦  AI Chat Mode" }].map(({ key, label }) => (
          <button key={key} onClick={() => setMode(key)} style={{
            flex: 1, padding: "7px 0", borderRadius: "6px", border: "none", cursor: "pointer",
            fontSize: "10px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
            textTransform: "uppercase", letterSpacing: "0.12em",
            transition: "background 250ms, color 250ms, box-shadow 250ms",
            background: mode === key ? "#f97316" : "transparent",
            color:      mode === key ? "#000"    : "#555",
            boxShadow:  mode === key ? "0 0 12px rgba(249,115,22,0.4)" : "none",
          }}>{label}</button>
        ))}
      </div>


      {mode === "ai" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "rgba(249,115,22,0.04)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: "10px", padding: "16px" }}>
          <span style={{ fontSize: "10px", color: "#f97316", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>✦ Describe Your Work Situation</span>
          <textarea value={nlpText} onChange={(e) => setNlpText(e.target.value)}
            placeholder={"Describe your work situation in plain English...\ne.g. I worked 14 hours today, completed 30 deliveries and feel extremely stressed"}
            rows={4}
            style={{ width: "100%", background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "12px 14px", color: "#e8e8e8", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box", transition: "border-color 200ms" }}
            onFocus={(e) => e.currentTarget.style.borderColor = "#f97316"}
            onBlur={(e)  => e.currentTarget.style.borderColor = "#2a2a2a"}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "9px", color: "#444", textTransform: "uppercase", letterSpacing: "0.12em" }}>Try an example:</span>
            {NLP_EXAMPLES.map((ex, i) => (
              <button key={i} onClick={() => setNlpText(ex)} style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", color: "#555", fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", textAlign: "left", lineHeight: 1.5, transition: "color 200ms, border-color 200ms" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#f97316"; e.currentTarget.style.borderColor = "#f97316"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#555";    e.currentTarget.style.borderColor = "#2a2a2a"; }}>"{ex}"</button>
            ))}
          </div>
          <button onClick={handleNlpParse} disabled={nlpLoading || !nlpText.trim()} style={{ background: nlpLoading || !nlpText.trim() ? "#2a1a0a" : "#f97316", border: "none", borderRadius: "8px", padding: "10px", cursor: nlpLoading || !nlpText.trim() ? "not-allowed" : "pointer", color: nlpLoading || !nlpText.trim() ? "#555" : "#000", fontSize: "11px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.15em", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: nlpLoading || !nlpText.trim() ? "none" : "0 0 16px rgba(249,115,22,0.3)", transition: "background 250ms, color 250ms, box-shadow 250ms" }}
            onMouseEnter={(e) => { if (!nlpLoading && nlpText.trim()) e.currentTarget.style.background = "#ea6a0c"; }}
            onMouseLeave={(e) => { if (!nlpLoading && nlpText.trim()) e.currentTarget.style.background = "#f97316"; }}>
            {nlpLoading ? (<><svg style={{ width: "14px", height: "14px", animation: "spin 0.7s linear infinite" }} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" /><path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Analyzing Text…</>) : <>✦ Analyze Text</>}
          </button>
          {nlpToast && <InlineToast message={nlpToast.message} type={nlpToast.type} onDismiss={() => setNlpToast(null)} />}
          <p style={{ fontSize: "9px", color: "#444", margin: 0, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.1em" }}>AI will auto-fill the fields below — you can still edit them before submitting</p>
        </div>
      )}


      <div>
        <label className={labelClass}>Load Worker Profile</label>
        <select value={profile} onChange={handleProfileChange}
          className="w-full bg-[#0d0d0d] border border-[#2a2a2a] text-[#e8e8e8] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[#f97316] transition-all cursor-pointer"
          style={{ appearance: "none" }}>
          {PROFILES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        {profile !== "custom" && <p className="text-[10px] text-[#f97316] mt-1.5 font-mono">✓ Profile loaded — edit any field or submit directly</p>}
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <div key={f.name}>
            <label className={labelClass}>{f.label}</label>
            <input type="number" name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} className={inputClass}
              style={aiFilledFields.has(f.name) ? { borderColor: "#22c55e", boxShadow: "0 0 0 2px rgba(34,197,94,0.2)", transition: "border-color 400ms, box-shadow 400ms" } : {}} />
            {errors[f.name] && <p className="text-[#f97316] text-xs mt-1">{errors[f.name]}</p>}
          </div>
        ))}
      </div>


      <div>
        <label className={labelClass}>
          Stress Level — <span style={{ color: stressColor, fontWeight: 700 }}>{form.stress_level}</span>{" "}/ 10{" "}
          <span style={{ color: stressColor, background: stressBg, border: `1px solid ${stressColor}40`, borderRadius: "999px", fontSize: "9px", padding: "1px 7px", marginLeft: "6px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", transition: "color 400ms, background 400ms" }}>
            {stressLabel}
          </span>
        </label>
        <input type="range" name="stress_level" min={1} max={10} value={form.stress_level} onChange={handleChange}
          className="w-full cursor-pointer mt-2 h-1.5 rounded-full bg-[#2a2a2a]"
          style={{ accentColor: aiFilledFields.has("stress_level") ? "#22c55e" : stressColor, transition: "accent-color 400ms" }} />
        <div className="flex justify-between text-[10px] text-[#444] mt-1">
          {[1,2,3,4,5,6,7,8,9,10].map((n) => (
            <span key={n} style={{ color: Number(form.stress_level) === n ? stressColor : "#444", fontWeight: Number(form.stress_level) === n ? 700 : 400, transition: "color 300ms" }}>{n}</span>
          ))}
        </div>
      </div>


      <button onClick={handleSubmit} disabled={loading || !systemOnline}
        className="w-full text-black font-bold text-sm uppercase tracking-widest py-3 rounded-md transition-all duration-200 active:scale-[0.98]"
        style={{ background: loading || !systemOnline ? "#7a3c10" : "#f97316", boxShadow: loading || !systemOnline ? "none" : "0 0 20px rgba(249,115,22,0.35)", cursor: loading || !systemOnline ? "not-allowed" : "pointer" }}
        onMouseEnter={(e) => { if (!loading && systemOnline) e.currentTarget.style.background = "#ea6a0c"; }}
        onMouseLeave={(e) => { if (!loading && systemOnline) e.currentTarget.style.background = "#f97316"; }}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Analyzing…
          </span>
        ) : !systemOnline ? "System Offline" : "Run Burnout Analysis"}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}