import { useEffect, useMemo, useRef, useState } from "react";
import {
  Sun, Wind, Atom, BatteryCharging, Zap, Flame, ArrowLeft,
  Brain, Activity, Sparkles, AlertTriangle, Gauge,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot,
} from "recharts";

// ─────────────────────────────────────────────────────────────
// NODE CONFIG
// ─────────────────────────────────────────────────────────────
const NODES = {
  solar:    { id: "solar",    name: "Solar Array",      value: "2.4 MW", icon: Sun,            color: "#f59e0b", colorRgba: "245,158,11",  optimal: [55, 75], pos: { col: "1 / 5",  row: "1" } },
  wind:     { id: "wind",     name: "Wind Farm",        value: "1.8 MW", icon: Wind,           color: "#22d3ee", colorRgba: "34,211,238",  optimal: [60, 85], pos: { col: "9 / 13", row: "1" } },
  core:     { id: "core",     name: "Core Reactor",     value: "AETHER-01", icon: Atom,        color: "#e2f3ff", colorRgba: "226,243,255", optimal: [50, 70], pos: { col: "5 / 9",  row: "2" } },
  battery:  { id: "battery",  name: "Li-Ion Battery",   value: "76%",    icon: BatteryCharging, color: "#22c55e", colorRgba: "34,197,94",  optimal: [30, 70], pos: { col: "1 / 5",  row: "3" } },
  grid:     { id: "grid",     name: "Grid Out",         value: "EXPORT", icon: Zap,            color: "#fb923c", colorRgba: "251,146,60",  optimal: [40, 80], pos: { col: "5 / 9",  row: "3" } },
  hydrogen: { id: "hydrogen", name: "Hydrogen",         value: "69%",    icon: Flame,          color: "#a855f7", colorRgba: "168,85,247",  optimal: [40, 65], pos: { col: "9 / 13", row: "3" } },
};
const NODE_ORDER = ["solar", "wind", "core", "battery", "grid", "hydrogen"];

// ─────────────────────────────────────────────────────────────
// FORMULAS
// ─────────────────────────────────────────────────────────────
const sigmoid = (x) => 1 / (1 + Math.exp(-x));
function output(id, intensity, all) {
  const i = intensity / 100;
  switch (id) {
    case "solar":    return +(2.4 * Math.sin(i * Math.PI)).toFixed(3);
    case "wind":     return +(1.8 * Math.pow(i, 1.5)).toFixed(3);
    case "battery":  return +(0.76 * 2.4 * i).toFixed(3);
    case "hydrogen": return +(1.4 * sigmoid((i - 0.5) * 8)).toFixed(3);
    case "grid":     return +(5.0 * i).toFixed(3);
    case "core":
      if (!all) return 0;
      return +(["solar","wind","battery","hydrogen"].reduce((s, k) => s + output(k, all[k], all), 0)).toFixed(3);
    default: return 0;
  }
}
function efficiency(id, intensity) {
  const [lo, hi] = NODES[id].optimal;
  if (intensity >= lo && intensity <= hi) return 95 + Math.random() * 4;
  const dist = intensity < lo ? lo - intensity : intensity - hi;
  return Math.max(35, 95 - dist * 1.4);
}
const optimalMid = (id) => {
  const [lo, hi] = NODES[id].optimal;
  return Math.round((lo + hi) / 2);
};

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
export default function ProjectAimlA() {
  const [intensities, setIntensities] = useState({
    solar: 65, wind: 70, battery: 50, hydrogen: 55, grid: 60, core: 60,
  });
  const [openNode, setOpenNode] = useState(null);
  const [manual, setManual] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto drift in non-manual mode
  useEffect(() => {
    if (manual) return;
    const t = setInterval(() => {
      setIntensities((s) => {
        const next = { ...s };
        for (const k of Object.keys(NODES)) {
          if (k === "core") continue;
          const drift = (Math.random() - 0.5) * 4;
          next[k] = Math.max(0, Math.min(100, +(s[k] + drift).toFixed(1)));
        }
        return next;
      });
    }, 1500);
    return () => clearInterval(t);
  }, [manual]);

  const totalOutput = useMemo(
    () => ["solar","wind","battery","hydrogen"].reduce((s,k) => s + output(k, intensities[k]), 0),
    [intensities]
  );
  const avgEfficiency = useMemo(
    () => Object.keys(NODES).filter(k=>k!=="core").reduce((s,k)=>s+efficiency(k, intensities[k]),0) / 5,
    [intensities]
  );
  const gridStability = Math.max(60, Math.min(99.9, 80 + (avgEfficiency - 70) * 0.4));
  const systemHealth = Math.max(70, Math.min(100, avgEfficiency + 4));

  const autoOptimize = () => {
    const target = {};
    for (const k of Object.keys(NODES)) target[k] = optimalMid(k);
    // smoothly animate
    const start = { ...intensities };
    const t0 = performance.now();
    const dur = 1200;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const ease = 1 - Math.pow(1 - k, 3);
      const next = {};
      for (const key of Object.keys(target)) {
        next[key] = +(start[key] + (target[key] - start[key]) * ease).toFixed(1);
      }
      setIntensities(next);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  return (
    <div className="min-h-screen flex flex-col font-mono text-white" style={{ background: "#050b18" }}>
      {/* Ambient bg */}
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-60"
        style={{ background: "radial-gradient(circle at 20% 10%, rgba(34,211,238,0.12), transparent 50%), radial-gradient(circle at 80% 90%, rgba(168,85,247,0.10), transparent 50%)" }} />

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10 backdrop-blur-md bg-black/30 sticky top-0 z-40">
        <div className="font-bold text-lg tracking-widest" style={{ color: "#22d3ee", textShadow: "0 0 12px rgba(34,211,238,0.6)" }}>
          PROJECT AIML-A
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-white/70 tabular-nums">
            {now.toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour12: false })} IST
          </span>
          <span className="flex items-center gap-2 px-3 py-1 rounded-full border border-green-400/40 bg-green-400/10 text-green-300 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live Twin
          </span>
        </div>
      </nav>

      {/* MAIN GRID */}
      <main className="flex-1 grid grid-cols-12 gap-6 p-6">
        {/* Node map */}
        <section className="col-span-12 lg:col-span-8 relative">
          <div className="text-[10px] uppercase tracking-[0.3em] text-white/50 mb-3">◢ Digital Twin · Node Map</div>
          <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 min-h-[560px] overflow-hidden">
            {/* Connection lines (SVG) */}
            <ConnectionLines />
            <div className="relative grid grid-cols-12 grid-rows-3 gap-4 h-[500px]">
              {NODE_ORDER.map((id) => (
                <NodeCard
                  key={id}
                  node={NODES[id]}
                  intensity={intensities[id]}
                  realtime={
                    id === "core"
                      ? totalOutput.toFixed(2) + " MW"
                      : output(id, intensities[id]).toFixed(2) + " MW"
                  }
                  onClick={() => setOpenNode(id)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* AI Manager */}
        <aside className="col-span-12 lg:col-span-4">
          <AIManager
            health={systemHealth}
            stability={gridStability}
            total={totalOutput}
            efficiency={avgEfficiency}
            manual={manual}
            setManual={setManual}
            onOptimize={autoOptimize}
            intensities={intensities}
          />
        </aside>
      </main>

      {/* FOOTER */}
      <footer className="text-center text-xs py-4 border-t border-cyan-400/40 text-white/70">
        <div className="text-cyan-300 tracking-widest">PROJECT AIML-A | AETHER-01</div>
        <div>© 2026 AIML-A GRP-1 | All Rights Reserved</div>
      </footer>

      {/* SIM PANEL */}
      {openNode && (
        <NodeSimPanel
          nodeId={openNode}
          intensity={intensities[openNode]}
          setIntensity={(v) => setIntensities((s) => ({ ...s, [openNode]: v }))}
          allIntensities={intensities}
          onClose={() => setOpenNode(null)}
        />
      )}

      <style>{`
        @keyframes dashflow { to { stroke-dashoffset: -40; } }
        @keyframes pulseRing { 0%,100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.15); opacity: 0.9; } }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes typewriter { from { width: 0 } to { width: 100% } }
        .anim-slideup { animation: slideUp 0.4s ease-out; }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CONNECTION LINES
// ─────────────────────────────────────────────────────────────
function ConnectionLines() {
  // Approximate positions matching the grid (in % of container)
  const center = { x: 50, y: 50 };
  const points = {
    solar:    { x: 16,  y: 18 },
    wind:     { x: 84,  y: 18 },
    battery:  { x: 16,  y: 82 },
    grid:     { x: 50,  y: 82 },
    hydrogen: { x: 84,  y: 82 },
  };
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
      {Object.entries(points).map(([id, p]) => (
        <line
          key={id}
          x1={p.x} y1={p.y} x2={center.x} y2={center.y}
          stroke={NODES[id].color} strokeWidth="0.25"
          strokeDasharray="1.5 1.2"
          opacity="0.7"
          style={{ animation: "dashflow 2s linear infinite", filter: `drop-shadow(0 0 1px ${NODES[id].color})` }}
        />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// NODE CARD
// ─────────────────────────────────────────────────────────────
function NodeCard({ node, intensity, realtime, onClick }) {
  const Icon = node.icon;
  return (
    <button
      onClick={onClick}
      style={{
        gridColumn: node.pos.col,
        gridRow: node.pos.row,
        borderColor: `rgba(${node.colorRgba}, 0.45)`,
        boxShadow: `0 0 30px rgba(${node.colorRgba}, 0.25), inset 0 0 20px rgba(${node.colorRgba}, 0.08)`,
      }}
      className="group relative rounded-xl border bg-white/5 backdrop-blur-md p-4 text-left transition-all duration-300 hover:scale-[1.04] hover:bg-white/10 flex flex-col justify-between overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ background: `radial-gradient(circle at 30% 20%, rgba(${node.colorRgba},0.4), transparent 60%)` }}
      />
      <div className="relative flex items-center gap-2">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `rgba(${node.colorRgba},0.15)`, boxShadow: `0 0 14px rgba(${node.colorRgba},0.6)` }}
        >
          <Icon className="w-5 h-5" style={{ color: node.color }} />
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-[0.3em] text-white/50">{node.id}</div>
          <div className="font-bold text-sm leading-tight">{node.name}</div>
        </div>
      </div>
      <div className="relative flex items-end justify-between mt-2">
        <div>
          <div className="text-[9px] uppercase tracking-widest text-white/40">Output</div>
          <div className="text-lg font-bold tabular-nums" style={{ color: node.color, textShadow: `0 0 10px rgba(${node.colorRgba},0.6)` }}>
            {realtime}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] uppercase tracking-widest text-white/40">Load</div>
          <div className="text-sm font-bold tabular-nums text-white/90">{intensity.toFixed(0)}%</div>
        </div>
      </div>
      {/* pulse ring */}
      <div
        className="absolute -inset-1 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ border: `1px solid ${node.color}`, animation: "pulseRing 1.6s ease-in-out infinite" }}
      />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// AI MANAGER
// ─────────────────────────────────────────────────────────────
const AI_RECS = [
  "Increase solar load to 65% — peak irradiance window detected",
  "Wind variance high — buffer via Li-Ion cluster A",
  "Hydrogen reserves optimal — hold current fuel cell load",
  "Grid frequency drift 0.04Hz — engage stabilization protocol",
  "Predicted demand surge in 14m — pre-charge battery to 82%",
  "Reactor coolant nominal — efficiency gain +3.1%",
  "Carbon offset target met — 480 kg/h sequestered",
  "Storage cycle wear minimized — discharge curve optimized",
];
const AI_ALERTS = [
  "[OK] Neural mesh sync — 847 decisions/min",
  "[INFO] Predictive model recalibrated · Δ +0.8%",
  "[WARN] Solar PV-12 micro-inverter degraded 2%",
  "[OK] Hydrogen pressure stable · 350 bar",
  "[INFO] Demand response shifted 340 kW",
  "[OK] All sub-stations within tolerance",
];

function AIManager({ health, stability, total, efficiency, manual, setManual, onOptimize, intensities }) {
  const [recIdx, setRecIdx] = useState(0);
  const [alerts, setAlerts] = useState([AI_ALERTS[0]]);

  useEffect(() => {
    const t = setInterval(() => setRecIdx((i) => (i + 1) % AI_RECS.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setAlerts((a) => {
        const next = AI_ALERTS[(a.length) % AI_ALERTS.length];
        return [next, ...a].slice(0, 5);
      });
    }, 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-300" style={{ filter: "drop-shadow(0 0 6px #a855f7)" }} />
          <h2 className="font-bold tracking-widest text-sm">🤖 AI MANAGER</h2>
        </div>
        <span className="text-[9px] uppercase tracking-widest text-white/50">Neural · v4.2</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Stat label="System Health" value={health.toFixed(1) + "%"} color="#22c55e" />
        <Stat label="Grid Stability" value={stability.toFixed(2) + "%"} color="#22d3ee" />
        <Stat label="Total Output" value={total.toFixed(2) + " MW"} color="#f59e0b" />
        <Stat label="Efficiency" value={efficiency.toFixed(1) + "%"} color="#a855f7" />
      </div>

      {/* Recommendations */}
      <div className="rounded-xl border border-white/10 bg-black/30 p-3">
        <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-cyan-300 mb-2">
          <Sparkles className="w-3 h-3" /> AI Recommendations
        </div>
        <p key={recIdx} className="text-xs leading-relaxed anim-slideup">{AI_RECS[recIdx]}</p>
      </div>

      {/* Alerts log */}
      <div className="rounded-xl border border-white/10 bg-black/30 p-3 flex-1 min-h-[140px]">
        <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-orange-300 mb-2">
          <AlertTriangle className="w-3 h-3" /> Live Alert Log
        </div>
        <ul className="space-y-1.5">
          {alerts.map((a, i) => (
            <li
              key={a + i}
              className="text-[11px] text-white/80 overflow-hidden whitespace-nowrap"
              style={{ animation: i === 0 ? "typewriter 0.7s steps(40, end)" : undefined }}
            >
              <span className="text-white/40">▸ </span>{a}
            </li>
          ))}
        </ul>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onOptimize}
          className="px-3 py-2.5 rounded-lg text-xs uppercase tracking-widest font-bold transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: "linear-gradient(135deg, rgba(34,211,238,0.25), rgba(168,85,247,0.25))",
            border: "1px solid rgba(34,211,238,0.5)",
            boxShadow: "0 0 20px rgba(34,211,238,0.4)",
            color: "#a5f3fc",
          }}
        >
          ⚡ Auto-Optimize
        </button>
        <button
          onClick={() => setManual((m) => !m)}
          className="px-3 py-2.5 rounded-lg text-xs uppercase tracking-widest font-bold transition-all duration-300"
          style={{
            background: manual ? "rgba(251,146,60,0.2)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${manual ? "rgba(251,146,60,0.6)" : "rgba(255,255,255,0.15)"}`,
            color: manual ? "#fdba74" : "#cbd5e1",
            boxShadow: manual ? "0 0 16px rgba(251,146,60,0.4)" : "none",
          }}
        >
          {manual ? "● Manual" : "○ Manual"}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div
      className="rounded-lg border border-white/10 bg-black/30 p-3"
      style={{ boxShadow: `inset 0 0 16px rgba(255,255,255,0.02)` }}
    >
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-white/50 mb-1">
        <Gauge className="w-3 h-3" /> {label}
      </div>
      <div className="text-lg font-bold tabular-nums" style={{ color, textShadow: `0 0 10px ${color}80` }}>
        {value}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SIMULATION PANEL
// ─────────────────────────────────────────────────────────────
function NodeSimPanel({ nodeId, intensity, setIntensity, allIntensities, onClose }) {
  const node = NODES[nodeId];
  const Icon = node.icon;

  const data = useMemo(() => {
    return Array.from({ length: 51 }, (_, k) => {
      const x = k * 2;
      const test = { ...allIntensities, [nodeId]: x };
      return { x, y: output(nodeId, x, test) };
    });
  }, [nodeId, allIntensities]);

  const out = output(nodeId, intensity, allIntensities);
  const eff = efficiency(nodeId, intensity);
  const health = Math.max(60, Math.min(100, eff + 3 + Math.random() * 2));
  const [lo, hi] = node.optimal;
  const inOptimal = intensity >= lo && intensity <= hi;

  const aiTip = inOptimal
    ? `${node.name} operating in optimal window (${lo}-${hi}%). Maintain current load.`
    : `Adjust load to ${optimalMid(nodeId)}% to enter optimal window (${lo}-${hi}%) for peak efficiency.`;

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto"
      style={{
        background: `radial-gradient(circle at 30% 10%, rgba(${node.colorRgba},0.18), #050b18 60%)`,
        animation: "slideUp 0.35s ease-out",
      }}
    >
      <div className="max-w-[1400px] mx-auto p-6 md:p-8 text-white font-mono">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center border"
              style={{
                borderColor: `rgba(${node.colorRgba},0.5)`,
                background: `rgba(${node.colorRgba},0.12)`,
                boxShadow: `0 0 30px rgba(${node.colorRgba},0.5)`,
              }}
            >
              <Icon className="w-6 h-6" style={{ color: node.color }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{node.name}</h1>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">{node.value} · simulation</p>
            </div>
          </div>
          <span
            className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest border"
            style={{
              borderColor: inOptimal ? "rgba(34,197,94,0.5)" : "rgba(251,146,60,0.5)",
              background: inOptimal ? "rgba(34,197,94,0.1)" : "rgba(251,146,60,0.1)",
              color: inOptimal ? "#86efac" : "#fdba74",
            }}
          >
            {inOptimal ? "● Optimal" : "▲ Sub-Optimal"}
          </span>
        </header>

        {/* Body */}
        <div className="grid grid-cols-12 gap-6">
          {/* Controls */}
          <div className="col-span-12 lg:col-span-5">
            <div
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
              style={{ boxShadow: `inset 0 0 40px rgba(${node.colorRgba},0.08)` }}
            >
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/50 mb-2">◢ Control Input</div>
              <h2 className="text-base font-semibold mb-5">Intensity</h2>

              <div className="flex justify-between text-xs text-white/60 mb-2">
                <span>0%</span>
                <span style={{ color: node.color, textShadow: `0 0 10px ${node.color}` }} className="text-3xl font-bold tabular-nums">
                  {intensity.toFixed(0)}%
                </span>
                <span>100%</span>
              </div>
              <input
                type="range"
                min={0} max={100} step={1}
                value={intensity}
                onChange={(e) => setIntensity(+e.target.value)}
                className="w-full appearance-none h-2 rounded-full outline-none cursor-pointer"
                style={{
                  background: `linear-gradient(90deg, ${node.color} 0%, ${node.color} ${intensity}%, rgba(255,255,255,0.1) ${intensity}%)`,
                }}
              />
              <div className="mt-2 text-[10px] text-white/40 flex justify-between">
                <span>Optimal: {lo}–{hi}%</span>
                <span>{nodeId === "core" ? "Aggregate" : "Direct Load"}</span>
              </div>

              <div className="grid grid-cols-1 gap-3 mt-6">
                <Metric label="Output" value={`${out.toFixed(2)} MW`} color={node.color} />
                <Metric label="Efficiency" value={`${eff.toFixed(1)} %`} color={node.color} />
                <Metric label="Health" value={`${health.toFixed(1)} %`} color={node.color} />
              </div>

              {/* AI tip */}
              <div
                className="mt-5 rounded-xl border p-4"
                style={{
                  borderColor: "rgba(34,211,238,0.4)",
                  background: "rgba(34,211,238,0.08)",
                  boxShadow: "0 0 20px rgba(34,211,238,0.15)",
                }}
              >
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-cyan-300 mb-2">
                  <Brain className="w-3 h-3" /> AI Tip
                </div>
                <p className="text-xs text-white/85 leading-relaxed mb-3">{aiTip}</p>
                <button
                  onClick={() => setIntensity(optimalMid(nodeId))}
                  className="px-3 py-1.5 rounded-md text-[10px] uppercase tracking-widest font-bold transition-all hover:scale-[1.03]"
                  style={{
                    background: "rgba(34,211,238,0.2)",
                    border: "1px solid rgba(34,211,238,0.5)",
                    color: "#a5f3fc",
                    boxShadow: "0 0 14px rgba(34,211,238,0.4)",
                  }}
                >
                  ⚡ Apply
                </button>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="col-span-12 lg:col-span-7">
            <div
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
              style={{ boxShadow: `inset 0 0 40px rgba(${node.colorRgba},0.08)` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-white/50">◢ Live Curve</div>
                  <h2 className="text-base font-semibold">Intensity vs Energy</h2>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase text-white/50">Live</div>
                  <div className="text-2xl font-bold tabular-nums" style={{ color: node.color }}>
                    {out.toFixed(2)} MW
                  </div>
                </div>
              </div>

              <div className="h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <defs>
                      <linearGradient id={`grad-${nodeId}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={node.color} stopOpacity={0.6} />
                        <stop offset="100%" stopColor={node.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />
                    <XAxis dataKey="x" stroke="rgba(255,255,255,0.4)" fontSize={11} unit="%" />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} unit=" MW" />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(5,11,24,0.95)",
                        border: `1px solid ${node.color}`,
                        borderRadius: 8,
                        fontFamily: "monospace",
                        fontSize: 12,
                      }}
                      labelFormatter={(v) => `Intensity: ${v}%`}
                      formatter={(v) => [`${(+v).toFixed(2)} MW`, "Output"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="y"
                      stroke={node.color}
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={false}
                      style={{ filter: `drop-shadow(0 0 6px ${node.color})` }}
                    />
                    <ReferenceDot
                      x={Math.round(intensity)}
                      y={out}
                      r={6}
                      fill={node.color}
                      stroke="white"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 backdrop-blur p-3">
      <div className="text-[10px] uppercase tracking-[0.25em] text-white/50 mb-1">{label}</div>
      <div className="text-2xl font-bold tabular-nums" style={{ color, textShadow: `0 0 10px ${color}80` }}>
        {value}
      </div>
    </div>
  );
}
