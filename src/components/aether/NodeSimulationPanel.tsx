import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Sun, Wind, BatteryCharging, Atom, Zap, Flame } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, ReferenceDot,
} from "recharts";
import { Slider } from "@/components/ui/slider";

export type NodeId = "solar" | "wind" | "battery" | "hydrogen" | "core" | "grid";

interface Props {
  nodeId: NodeId;
  onClose: () => void;
}

const NODE_META: Record<NodeId, {
  name: string; subtitle: string; icon: any; accent: string; sliderLabel: string;
  metricLabel: string; metricUnit: string; max: number;
}> = {
  solar:    { name: "Solar Array",       subtitle: "PV-FIELD-01 · 2.4 MW",   icon: Sun,             accent: "amber",   sliderLabel: "Solar Irradiance Intensity", metricLabel: "Irradiance",       metricUnit: "W/m²", max: 2.4 },
  wind:     { name: "Wind Farm",         subtitle: "TURBINE-ARRAY · 1.8 MW", icon: Wind,            accent: "cyan",    sliderLabel: "Wind Speed Intensity",       metricLabel: "Wind Speed",       metricUnit: "m/s",  max: 1.8 },
  battery:  { name: "Li-Ion Battery",    subtitle: "STORAGE-BANK · 76%",     icon: BatteryCharging, accent: "green",   sliderLabel: "Discharge Rate",             metricLabel: "State of Charge",  metricUnit: "%",    max: 1.82 },
  hydrogen: { name: "Hydrogen Storage",  subtitle: "FUEL-CELL · 69%",        icon: Flame,           accent: "purple",  sliderLabel: "Fuel Cell Load",             metricLabel: "H₂ Flow Rate",     metricUnit: "kg/h", max: 1.4 },
  core:     { name: "Core Reactor",      subtitle: "AETHER-01",              icon: Atom,            accent: "white",   sliderLabel: "Reactor Load Demand",        metricLabel: "Reactor Output",   metricUnit: "MW",   max: 7.0 },
  grid:     { name: "Grid Out",          subtitle: "EXPORT-NODE",            icon: Zap,             accent: "orange",  sliderLabel: "Grid Export Level",          metricLabel: "Export",           metricUnit: "MW",   max: 5.0 },
};

const ACCENT_VARS: Record<string, { hsl: string; rgba: string }> = {
  amber:  { hsl: "45 100% 60%",   rgba: "rgba(255, 191, 0, 0.6)" },
  cyan:   { hsl: "190 100% 60%",  rgba: "rgba(0, 220, 255, 0.6)" },
  green:  { hsl: "150 80% 55%",   rgba: "rgba(40, 220, 140, 0.6)" },
  purple: { hsl: "280 85% 70%",   rgba: "rgba(190, 110, 255, 0.6)" },
  white:  { hsl: "200 100% 90%",  rgba: "rgba(180, 230, 255, 0.7)" },
  orange: { hsl: "30 100% 60%",   rgba: "rgba(255, 140, 40, 0.6)" },
};

function compute(nodeId: NodeId, x: number) {
  const t = x / 100;
  switch (nodeId) {
    case "solar":    return 2.4 * Math.sin(t * Math.PI);
    case "wind":     return 1.8 * Math.pow(t, 1.5);
    case "battery": {
      const eff = t < 0.2 ? t * 3 : 1;
      return 0.76 * 2.4 * t * eff;
    }
    case "hydrogen": return t < 0.7 ? 1.4 * (t / 0.7) : 1.4;
    case "grid":     return 5.0 * t;
    case "core": {
      const s = 2.4 * Math.sin(t * Math.PI);
      const w = 1.8 * Math.pow(t, 1.5);
      const b = 0.76 * 2.4 * t * (t < 0.2 ? t * 3 : 1);
      const h = t < 0.7 ? 1.4 * (t / 0.7) : 1.4;
      return s + w + b + h;
    }
  }
}

function metricValue(nodeId: NodeId, x: number) {
  const t = x / 100;
  switch (nodeId) {
    case "solar":    return Math.round(t * 1000);
    case "wind":     return +(t * 25).toFixed(1);
    case "battery":  return +(76 - t * 30).toFixed(1);
    case "hydrogen": return +(t * 12).toFixed(2);
    case "grid":     return +(5 * t).toFixed(2);
    case "core":     return +(compute("core", x) as number).toFixed(2);
  }
}

export const NodeSimulationPanel = ({ nodeId, onClose }: Props) => {
  const meta = NODE_META[nodeId];
  const Icon = meta.icon;
  const accent = ACCENT_VARS[meta.accent];
  const [intensity, setIntensity] = useState(50);
  const [animOut, setAnimOut] = useState(0);

  const data = useMemo(() => {
    return Array.from({ length: 51 }, (_, i) => {
      const x = i * 2;
      return { x, y: +(compute(nodeId, x) as number).toFixed(3) };
    });
  }, [nodeId]);

  const output = compute(nodeId, intensity) as number;
  const peak = Math.max(...data.map((d) => d.y));
  const efficiency = peak > 0 ? Math.min(100, (output / peak) * 100) : 0;
  const efficiencyLoss = +(100 - efficiency).toFixed(1);
  const energyToCore = +(output * 0.92).toFixed(2); // 8% transmission loss

  // Animated number effect
  useEffect(() => {
    let raf: number;
    const start = animOut;
    const target = output;
    const startTime = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - startTime) / 350);
      setAnimOut(start + (target - start) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [output]);

  const accentStyle = { color: `hsl(${accent.hsl})` } as React.CSSProperties;
  const glow = accent.rgba;

  return (
    <div
      className="fixed inset-0 z-[100] animate-in fade-in duration-300 overflow-y-auto"
      style={{
        background:
          "radial-gradient(circle at 20% 10%, rgba(10,30,60,0.95), #0a0f1e 60%)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/3 w-[700px] h-[700px] rounded-full blur-3xl pointer-events-none -z-10 opacity-40"
        style={{ background: `radial-gradient(circle, ${glow}, transparent 70%)` }}
      />

      <div className="relative max-w-[1500px] mx-auto p-6 md:p-8 text-white">
        {/* HEADER */}
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors text-sm font-mono"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>

          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center w-14 h-14 rounded-xl border backdrop-blur-md"
              style={{
                borderColor: `hsl(${accent.hsl} / 0.5)`,
                background: `hsl(${accent.hsl} / 0.1)`,
                boxShadow: `0 0 30px ${glow}`,
              }}
            >
              <Icon className="w-7 h-7" style={accentStyle} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{meta.name}</h1>
              <p className="text-xs tracking-[0.3em] uppercase text-white/50 font-mono">{meta.subtitle}</p>
            </div>
          </div>

          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md font-mono text-xs uppercase tracking-widest"
            style={{
              borderColor: `hsl(${accent.hsl} / 0.5)`,
              background: `hsl(${accent.hsl} / 0.1)`,
              color: `hsl(${accent.hsl})`,
            }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: `hsl(${accent.hsl})` }} />
            {intensity > 5 ? "Active" : "Standby"}
          </div>
        </header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT — CONTROLS */}
          <div className="col-span-12 lg:col-span-5">
            <div
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
              style={{ boxShadow: `0 0 40px hsl(${accent.hsl} / 0.15) inset` }}
            >
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-mono mb-2">
                ◢ Control Input
              </div>
              <h2 className="text-lg font-semibold mb-6">{meta.sliderLabel}</h2>

              <div className="mb-2 flex justify-between font-mono text-xs text-white/60">
                <span>0%</span>
                <span style={accentStyle} className="text-2xl font-bold">{intensity}%</span>
                <span>100%</span>
              </div>
              <Slider
                value={[intensity]}
                onValueChange={(v) => setIntensity(v[0])}
                min={0}
                max={100}
                step={1}
                className="my-4"
              />

              <div className="mt-8 grid grid-cols-1 gap-3">
                <MetricCard
                  label="Energy Contributed to Core"
                  value={`${energyToCore.toFixed(2)} MW`}
                  glow={glow}
                  accent={accent.hsl}
                />
                <MetricCard
                  label="Efficiency Loss"
                  value={`${efficiencyLoss.toFixed(1)} %`}
                  glow={glow}
                  accent={accent.hsl}
                />
                <MetricCard
                  label={`Current ${meta.metricLabel}`}
                  value={`${metricValue(nodeId, intensity)} ${meta.metricUnit}`}
                  glow={glow}
                  accent={accent.hsl}
                />
              </div>
            </div>
          </div>

          {/* RIGHT — GRAPH */}
          <div className="col-span-12 lg:col-span-7">
            <div
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 h-full"
              style={{ boxShadow: `0 0 40px hsl(${accent.hsl} / 0.15) inset` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-mono">◢ Live Power Curve</div>
                  <h2 className="text-lg font-semibold">Energy Output vs Intensity</h2>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs text-white/50">Output</div>
                  <div className="text-2xl font-bold" style={accentStyle}>{animOut.toFixed(2)} MW</div>
                </div>
              </div>

              <div className="h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <defs>
                      <linearGradient id={`grad-${nodeId}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={`hsl(${accent.hsl})`} stopOpacity={0.5} />
                        <stop offset="100%" stopColor={`hsl(${accent.hsl})`} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                    <XAxis dataKey="x" stroke="rgba(255,255,255,0.4)" fontSize={11} unit="%" />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} unit=" MW" />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(10,15,30,0.9)",
                        border: `1px solid hsl(${accent.hsl} / 0.5)`,
                        borderRadius: 8,
                        fontFamily: "monospace",
                      }}
                      labelFormatter={(v) => `Intensity: ${v}%`}
                      formatter={(v: number) => [`${v.toFixed(2)} MW`, "Output"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="y"
                      stroke={`hsl(${accent.hsl})`}
                      strokeWidth={2.5}
                      fill={`url(#grad-${nodeId})`}
                      isAnimationActive={false}
                    />
                    <ReferenceDot
                      x={intensity}
                      y={output}
                      r={6}
                      fill={`hsl(${accent.hsl})`}
                      stroke="white"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* BOTTOM — STATS BAR */}
          <div className="col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <StatCard label="Peak Output" value={`${peak.toFixed(2)} MW`} accent={accent.hsl} glow={glow} />
            <StatCard label="Current Contribution" value={`${output.toFixed(2)} MW`} accent={accent.hsl} glow={glow} />
            <StatCard label="Efficiency" value={`${efficiency.toFixed(1)} %`} accent={accent.hsl} glow={glow} />
            <StatCard label="Status" value={intensity > 5 ? "ACTIVE" : "STANDBY"} accent={accent.hsl} glow={glow} />
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, accent, glow }: { label: string; value: string; accent: string; glow: string }) => (
  <div
    className="rounded-xl border border-white/10 bg-black/30 backdrop-blur p-4 transition-all hover:bg-black/40"
    style={{ boxShadow: `0 0 20px ${glow.replace("0.6", "0.15")}` }}
  >
    <div className="text-[10px] uppercase tracking-[0.25em] text-white/50 font-mono mb-1">{label}</div>
    <div className="text-2xl font-bold font-mono tabular-nums" style={{ color: `hsl(${accent})` }}>
      {value}
    </div>
  </div>
);

const StatCard = ({ label, value, accent, glow }: { label: string; value: string; accent: string; glow: string }) => (
  <div
    className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5 relative overflow-hidden"
    style={{ boxShadow: `0 0 30px ${glow.replace("0.6", "0.2")}` }}
  >
    <div
      className="absolute inset-0 opacity-30 pointer-events-none"
      style={{ background: `radial-gradient(circle at 50% 100%, hsl(${accent} / 0.4), transparent 70%)` }}
    />
    <div className="relative">
      <div className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-mono mb-2">{label}</div>
      <div className="text-2xl md:text-3xl font-bold font-mono" style={{ color: `hsl(${accent})`, textShadow: `0 0 20px hsl(${accent} / 0.6)` }}>
        {value}
      </div>
    </div>
  </div>
);

export default NodeSimulationPanel;
