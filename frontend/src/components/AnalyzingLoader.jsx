import { useEffect, useState } from "react";

const STEPS = [
  "Collecting worker metrics...",
  "Running burnout model...",
  "Calculating risk score...",
  "Generating recommendations...",
  "Finalizing analysis...",
];

export default function AnalyzingLoader() {
  const [stepIndex, setStepIndex] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 600);

    const dotTimer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);

    return () => {
      clearInterval(stepTimer);
      clearInterval(dotTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111] border border-[#f97316]/30 rounded-2xl p-10 flex flex-col items-center gap-7 shadow-[0_0_60px_rgba(249,115,22,0.15)] w-full max-w-sm mx-4">


        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-[#1e1e1e]" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#f97316] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-t-transparent border-r-[#f97316]/40 border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-7 h-7 text-[#f97316]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>


        <div className="flex flex-col items-center gap-1.5 text-center">
          <h2 className="text-white font-black text-lg tracking-wide">
            Analyzing Burnout Risk{dots}
          </h2>
          <p className="text-[#555] text-xs uppercase tracking-[0.2em]">
            GigMind AI Engine
          </p>
        </div>


        <div className="w-full flex flex-col gap-2">
          {STEPS.map((step, i) => (
            <div
              key={step}
              className="flex items-center gap-3 transition-all duration-300"
            >
              <div className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center">
                {i < stepIndex ? (
                  <svg className="w-4 h-4 text-[#22c55e]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : i === stepIndex ? (
                  <div className="w-2 h-2 rounded-full bg-[#f97316] shadow-[0_0_8px_#f97316] animate-pulse" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-[#2a2a2a]" />
                )}
              </div>
              <span
                className={`text-xs font-mono transition-all duration-300 ${
                  i < stepIndex
                    ? "text-[#22c55e]"
                    : i === stepIndex
                    ? "text-[#e8e8e8]"
                    : "text-[#333]"
                }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>


        <div className="w-full bg-[#1e1e1e] rounded-full h-1 overflow-hidden">
          <div
            className="h-full bg-[#f97316] rounded-full transition-all duration-500 shadow-[0_0_8px_#f97316]"
            style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}