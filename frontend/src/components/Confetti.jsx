import { useEffect, useRef } from "react";

const COLORS = ["#22c55e", "#f97316", "#eab308", "#3b82f6", "#a855f7", "#ec4899", "#fff"];

function rand(a, b) { return a + Math.random() * (b - a); }

export default function Confetti({ active }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");

    const particles = Array.from({ length: 130 }, () => ({
      x:       rand(canvas.width * 0.15, canvas.width * 0.85),
      y:       rand(-100, -5),
      vx:      rand(-3.5, 3.5),
      vy:      rand(2, 6),
      size:    rand(5, 12),
      color:   COLORS[Math.floor(Math.random() * COLORS.length)],
      angle:   rand(0, Math.PI * 2),
      spin:    rand(-0.14, 0.14),
      isRect:  Math.random() > 0.5,
      opacity: 1,
    }));

    let startTime = null;
    const DURATION = 3000;

    const animate = (ts) => {
      if (!startTime) startTime = ts;
      const elapsed  = ts - startTime;
      const fadeRatio = Math.max(0, 1 - elapsed / DURATION);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x     += p.vx;
        p.y     += p.vy;
        p.vy    += 0.1;
        p.angle += p.spin;

        ctx.save();
        ctx.globalAlpha = fadeRatio;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;

        if (p.isRect) {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      if (elapsed < DURATION) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (canvas) {
        const ctx2 = canvas.getContext("2d");
        ctx2.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:       "fixed",
        inset:          0,
        pointerEvents:  "none",
        zIndex:         9999,
        display:        active ? "block" : "none",
      }}
    />
  );
}