import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Variant = "energy" | "efficiency" | "load" | "tech";

interface TelemetryCardProps {
  label: string;
  unit: string;
  value: number;
  decimals?: number;
  min: number;
  max: number;
  variant: Variant;
  status?: "stable" | "warning" | "critical";
  history: number[];
}

const variantClass: Record<Variant, { text: string; stroke: string; glow: string; bar: string }> = {
  energy:     { text: "text-energy",     stroke: "hsl(var(--energy))",     glow: "shadow-glow",        bar: "gradient-energy" },
  efficiency: { text: "text-efficiency", stroke: "hsl(var(--efficiency))", glow: "shadow-glow-green",  bar: "gradient-efficiency" },
  load:       { text: "text-load",       stroke: "hsl(var(--load))",       glow: "shadow-glow-orange", bar: "gradient-load" },
  tech:       { text: "text-tech",       stroke: "hsl(var(--tech))",       glow: "shadow-glow-purple", bar: "gradient-tech" },
};

export const TelemetryCard = ({ label, unit, value, decimals = 1, min, max, variant, status = "stable", history }: TelemetryCardProps) => {
  const v = variantClass[variant];
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const w = 220, h = 50;
  const points = history.map((p, i) => {
    const x = (i / Math.max(1, history.length - 1)) * w;
    const norm = (p - min) / (max - min);
    const y = h - norm * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const statusDot = status === "critical" ? "bg-critical" : status === "warning" ? "bg-load" : "bg-efficiency";
  const statusText = status === "critical" ? "CRITICAL" : status === "warning" ? "WARN" : "STABLE";

  return (
    <div className="glass-panel holo-border rounded-2xl p-4 transition-all hover:scale-[1.02] duration-300 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono-tech uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse-glow", statusDot)} />
          <span className={cn("text-[9px] font-mono-tech tracking-widest",
            status === "critical" ? "text-critical" : status === "warning" ? "text-load" : "text-efficiency")}>
            {statusText}
          </span>
        </div>
      </div>
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className={cn("text-3xl font-bold font-mono-tech tabular-nums", v.text)}>
          {value.toFixed(decimals)}
        </span>
        <span className="text-xs font-mono-tech text-muted-foreground">{unit}</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10 mb-2" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${variant}-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={v.stroke} stopOpacity="0.4" />
            <stop offset="100%" stopColor={v.stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={`0,${h} ${points} ${w},${h}`} fill={`url(#grad-${variant}-${label})`} />
        <polyline points={points} fill="none" stroke={v.stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${v.stroke})` }} />
      </svg>
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-700", v.bar)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export const useTelemetry = (initial: number, min: number, max: number, volatility = 0.05) => {
  const [value, setValue] = useState(initial);
  const [history, setHistory] = useState<number[]>(() => Array(40).fill(initial));
  useEffect(() => {
    const id = setInterval(() => {
      setValue((prev) => {
        const range = max - min;
        const delta = (Math.random() - 0.5) * range * volatility;
        const target = initial + (Math.random() - 0.5) * range * 0.15;
        const next = Math.max(min, Math.min(max, prev + delta + (target - prev) * 0.05));
        setHistory((h) => [...h.slice(1), next]);
        return next;
      });
    }, 800);
    return () => clearInterval(id);
  }, [initial, min, max, volatility]);
  return { value, history };
};
