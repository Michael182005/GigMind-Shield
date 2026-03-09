import { useEffect, useState } from "react";

const PALETTE = {
  HIGH:   { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.35)",  icon: "⚠" },
  MEDIUM: { color: "#eab308", bg: "rgba(234,179,8,0.12)",  border: "rgba(234,179,8,0.35)",  icon: "◉" },
  LOW:    { color: "#22c55e", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.35)",  icon: "✓" },
  INFO:   { color: "#f97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.35)", icon: "⚡" },
};

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const p = PALETTE[toast.type] || PALETTE.INFO;

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 20);
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 320);
    }, 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 320);
  };

  return (
 
    <div
      onClick={handleDismiss}
      style={{
        background:  p.bg,
        border:      `1px solid ${p.border}`,
        opacity:     visible ? 1 : 0,
        transform:   visible ? "translateX(0)" : "translateX(40px)",
        transition:  "opacity 300ms ease, transform 300ms cubic-bezier(0.34,1.2,0.64,1)",
        position:    "relative",     
        overflow:    "hidden",
        cursor:      "pointer",
        minWidth:    "260px",
        maxWidth:    "320px",
        borderRadius: "12px",
        padding:     "12px 16px 16px",
        boxShadow:   "0 8px 32px rgba(0,0,0,0.4)",
        fontFamily:  "'JetBrains Mono', monospace",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        <span style={{ color: p.color, fontSize: "14px", fontWeight: 900, flexShrink: 0, marginTop: "1px" }}>
          {p.icon}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: p.color, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 3px" }}>
            {toast.title}
          </p>
          <p style={{ color: "#888", fontSize: "11px", lineHeight: "1.5", margin: 0 }}>
            {toast.message}
          </p>
        </div>
      </div>


      <div
        style={{
          position:   "absolute",
          bottom:     0,
          left:       0,
          right:      0,
          height:     "3px",
          background: "#1a1a1a",
        }}
      >
        <div
          style={{
            height:     "100%",
            background: p.color,
            boxShadow:  `0 0 6px ${p.color}`,
            animation:  "toastTimer 4.5s linear forwards",
          }}
        />
      </div>
    </div>
  );
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom:   "24px",
        right:    "24px",
        zIndex:   1000,
        display:  "flex",
        flexDirection: "column",
        gap:      "8px",
        alignItems: "flex-end",
      }}
    >
      <style>{`
        @keyframes toastTimer {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (title, message, type = "INFO") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}