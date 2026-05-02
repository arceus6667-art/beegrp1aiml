import { useMemo } from "react";

export type FlowMode = "charging" | "discharging" | "peak";

interface EnergyPlantProps {
  mode: FlowMode;
  storageLevel: number; // 0-100
  hydrogenLevel: number;
}

/**
 * 3D-ish isometric energy plant rendered with SVG + CSS transforms.
 * Solar panels, wind turbines (input) -> battery + hydrogen storage -> grid output.
 * Particles flow along paths to visualize charging / discharging cycle.
 */
export const EnergyPlant = ({ mode, storageLevel, hydrogenLevel }: EnergyPlantProps) => {
  const flowSpeed = mode === "peak" ? "1.6s" : mode === "discharging" ? "2.2s" : "3s";
  const particleCount = mode === "peak" ? 8 : 6;

  // direction: charging => sources to storage; discharging/peak => storage to grid emphasized
  const inDir = mode === "discharging" ? "reverse" : "normal";
  const outDir = mode === "charging" ? "reverse" : "normal";

  const inParticles = useMemo(() => Array.from({ length: particleCount }), [particleCount]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Backdrop grid */}
      <div className="absolute inset-0 grid-pattern opacity-60" />
      {/* Holographic floor disc */}
      <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[85%] h-32 rounded-[50%] gradient-holo blur-2xl" />
      <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[60%] h-20 rounded-[50%] bg-energy/20 blur-3xl animate-pulse-glow" />

      {/* Scanline */}
      <div className="absolute inset-x-0 h-24 scanline opacity-30 pointer-events-none" style={{ animation: "scan 6s linear infinite" }} />

      <svg viewBox="0 0 800 520" className="relative w-full h-full max-w-5xl drop-shadow-[0_20px_40px_hsl(var(--energy)/0.25)]">
        <defs>
          <linearGradient id="panel-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(220 40% 25%)" />
            <stop offset="100%" stopColor="hsl(220 50% 15%)" />
          </linearGradient>
          <linearGradient id="cyan-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--energy))" />
            <stop offset="100%" stopColor="hsl(190 100% 70%)" />
          </linearGradient>
          <linearGradient id="green-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--efficiency))" />
            <stop offset="100%" stopColor="hsl(165 80% 65%)" />
          </linearGradient>
          <linearGradient id="purple-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--tech))" />
            <stop offset="100%" stopColor="hsl(290 85% 75%)" />
          </linearGradient>
          <linearGradient id="orange-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--load))" />
            <stop offset="100%" stopColor="hsl(40 100% 65%)" />
          </linearGradient>
          <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--energy))" stopOpacity="1" />
            <stop offset="50%" stopColor="hsl(var(--energy))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--energy))" stopOpacity="0" />
          </radialGradient>
          <filter id="soft-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection paths */}
        <g stroke="hsl(var(--energy) / 0.35)" strokeWidth="2" fill="none" strokeDasharray="4 6">
          {/* Solar -> core */}
          <path id="path-solar" d="M 130 130 C 250 150, 320 230, 400 270" />
          {/* Wind -> core */}
          <path id="path-wind"  d="M 670 130 C 560 150, 480 220, 400 270" />
          {/* core -> battery */}
          <path id="path-batt"  d="M 400 290 C 350 360, 280 400, 200 430" />
          {/* core -> hydrogen */}
          <path id="path-hydro" d="M 400 290 C 450 360, 520 400, 600 430" />
          {/* core -> grid output */}
          <path id="path-grid"  d="M 400 290 C 400 380, 400 430, 400 480" />
        </g>

        {/* SOLAR ARRAY (top-left) */}
        <g transform="translate(70 80)" filter="url(#soft-glow)">
          <g style={{ transformOrigin: "60px 50px", transform: "rotate(-8deg) skewX(-8deg)" }}>
            {[0, 1, 2].map((r) =>
              [0, 1, 2, 3].map((c) => (
                <rect key={`s-${r}-${c}`} x={c * 28} y={r * 22} width="24" height="18" rx="2"
                  fill="url(#panel-grad)" stroke="hsl(var(--energy) / 0.6)" strokeWidth="0.5" />
              ))
            )}
            {/* shine */}
            {[0, 1, 2].map((r) =>
              [0, 1, 2, 3].map((c) => (
                <rect key={`sh-${r}-${c}`} x={c * 28 + 2} y={r * 22 + 2} width="6" height="2" fill="hsl(var(--energy) / 0.7)" />
              ))
            )}
          </g>
          <text x="60" y="92" textAnchor="middle" className="font-mono-tech" fontSize="9" fill="hsl(var(--muted-foreground))">SOLAR ARRAY</text>
          <text x="60" y="104" textAnchor="middle" className="font-mono-tech" fontSize="11" fontWeight="700" fill="hsl(var(--energy))">2.4 MW</text>
        </g>

        {/* WIND TURBINES (top-right) */}
        <g transform="translate(610 60)" filter="url(#soft-glow)">
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(${i * 60} ${i % 2 === 0 ? 0 : 14})`}>
              {/* Tower */}
              <polygon points="28,30 32,30 36,110 24,110" fill="hsl(0 0% 95%)" stroke="hsl(var(--border))" />
              {/* Blades - rotating */}
              <g style={{ transformOrigin: "30px 30px", animation: "blade-spin 2.5s linear infinite" }}>
                <ellipse cx="30" cy="10" rx="3" ry="22" fill="url(#cyan-grad)" />
                <ellipse cx="30" cy="10" rx="3" ry="22" fill="url(#cyan-grad)" transform="rotate(120 30 30)" />
                <ellipse cx="30" cy="10" rx="3" ry="22" fill="url(#cyan-grad)" transform="rotate(240 30 30)" />
                <circle cx="30" cy="30" r="3.5" fill="hsl(var(--energy))" />
              </g>
            </g>
          ))}
          <text x="60" y="135" textAnchor="middle" className="font-mono-tech" fontSize="9" fill="hsl(var(--muted-foreground))">WIND FARM</text>
          <text x="60" y="147" textAnchor="middle" className="font-mono-tech" fontSize="11" fontWeight="700" fill="hsl(var(--energy))">1.8 MW</text>
        </g>

        {/* CENTRAL CORE / PLANT */}
        <g transform="translate(400 280)" filter="url(#soft-glow)">
          {/* Outer holo ring */}
          <circle r="78" fill="none" stroke="hsl(var(--energy) / 0.25)" strokeWidth="1" strokeDasharray="2 4"
            style={{ transformOrigin: "0 0", animation: "spin-slow 20s linear infinite" }} />
          <circle r="62" fill="none" stroke="hsl(var(--tech) / 0.3)" strokeWidth="1" strokeDasharray="6 3"
            style={{ transformOrigin: "0 0", animation: "spin-slow 14s linear infinite reverse" }} />
          {/* Glow halo */}
          <circle r="90" fill="url(#core-glow)" opacity="0.7" />
          {/* Reactor body */}
          <ellipse cx="0" cy="14" rx="50" ry="14" fill="hsl(200 30% 85%)" opacity="0.6" />
          <rect x="-44" y="-30" width="88" height="50" rx="10" fill="hsl(0 0% 100%)" stroke="hsl(var(--energy) / 0.6)" strokeWidth="1.5" />
          <rect x="-38" y="-24" width="76" height="38" rx="6" fill="url(#cyan-grad)" opacity="0.15" />
          {/* Core */}
          <circle cx="0" cy="-5" r="14" fill="url(#cyan-grad)" style={{ animation: "pulse-glow 2s ease-in-out infinite" }} />
          <circle cx="0" cy="-5" r="6" fill="hsl(0 0% 100%)" />
          {/* Top spire */}
          <polygon points="-8,-30 8,-30 4,-50 -4,-50" fill="hsl(0 0% 95%)" stroke="hsl(var(--energy))" />
          <circle cx="0" cy="-52" r="3" fill="hsl(var(--energy))" style={{ animation: "pulse-glow 1.2s ease-in-out infinite" }} />
          {/* Label */}
          <text x="0" y="40" textAnchor="middle" className="font-mono-tech" fontSize="10" fontWeight="700" fill="hsl(var(--foreground))">CORE REACTOR</text>
          <text x="0" y="52" textAnchor="middle" className="font-mono-tech" fontSize="8" fill="hsl(var(--muted-foreground))">AETHER-01</text>
        </g>

        {/* BATTERY STORAGE (bottom-left) */}
        <g transform="translate(140 410)" filter="url(#soft-glow)">
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${i * 30} 0)`}>
              <rect x="0" y="0" width="24" height="50" rx="3" fill="hsl(0 0% 100%)" stroke="hsl(var(--efficiency) / 0.6)" strokeWidth="1" />
              {/* fill */}
              <rect x="2" y={2 + (50 - 4) * (1 - storageLevel / 100)} width="20"
                height={(50 - 4) * (storageLevel / 100)} rx="2" fill="url(#green-grad)" opacity="0.85" />
              <rect x="8" y="-4" width="8" height="4" rx="1" fill="hsl(var(--efficiency))" />
            </g>
          ))}
          <text x="42" y="68" textAnchor="middle" className="font-mono-tech" fontSize="9" fill="hsl(var(--muted-foreground))">Li-ION BATTERY</text>
          <text x="42" y="80" textAnchor="middle" className="font-mono-tech" fontSize="11" fontWeight="700" fill="hsl(var(--efficiency))">{storageLevel.toFixed(0)}%</text>
        </g>

        {/* HYDROGEN TANKS (bottom-right) */}
        <g transform="translate(560 405)" filter="url(#soft-glow)">
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(${i * 40} 0)`}>
              <rect x="0" y="8" width="30" height="48" rx="15" fill="hsl(0 0% 100%)" stroke="hsl(var(--tech) / 0.6)" strokeWidth="1" />
              <rect x="3" y={11 + (42) * (1 - hydrogenLevel / 100)} width="24"
                height={42 * (hydrogenLevel / 100)} rx="12" fill="url(#purple-grad)" opacity="0.7" />
              <text x="15" y="38" textAnchor="middle" fontSize="10" fontWeight="700" fill="hsl(0 0% 100%)" className="font-mono-tech">H₂</text>
              <rect x="11" y="2" width="8" height="8" rx="2" fill="hsl(var(--tech))" />
            </g>
          ))}
          <text x="35" y="74" textAnchor="middle" className="font-mono-tech" fontSize="9" fill="hsl(var(--muted-foreground))">HYDROGEN</text>
          <text x="35" y="86" textAnchor="middle" className="font-mono-tech" fontSize="11" fontWeight="700" fill="hsl(var(--tech))">{hydrogenLevel.toFixed(0)}%</text>
        </g>

        {/* GRID OUTPUT (bottom-center) */}
        <g transform="translate(370 470)" filter="url(#soft-glow)">
          <rect x="0" y="0" width="60" height="36" rx="6" fill="hsl(0 0% 100%)" stroke="hsl(var(--load) / 0.6)" />
          {/* pylons */}
          <polygon points="6,8 12,8 16,28 2,28" fill="none" stroke="hsl(var(--load))" />
          <polygon points="22,8 28,8 32,28 18,28" fill="none" stroke="hsl(var(--load))" />
          <polygon points="38,8 44,8 48,28 34,28" fill="none" stroke="hsl(var(--load))" />
          <line x1="9" y1="4" x2="55" y2="4" stroke="hsl(var(--load))" strokeWidth="1.5" />
          <text x="30" y="52" textAnchor="middle" className="font-mono-tech" fontSize="9" fill="hsl(var(--muted-foreground))">GRID OUT</text>
        </g>

        {/* Animated flow particles on each path */}
        {[
          { path: "path-solar", dir: inDir, color: "hsl(var(--energy))" },
          { path: "path-wind",  dir: inDir, color: "hsl(var(--energy))" },
          { path: "path-batt",  dir: outDir, color: "hsl(var(--efficiency))" },
          { path: "path-hydro", dir: outDir, color: "hsl(var(--tech))" },
          { path: "path-grid",  dir: mode === "charging" ? "reverse" : "normal", color: "hsl(var(--load))" },
        ].map((line, li) =>
          inParticles.map((_, i) => (
            <circle key={`${li}-${i}`} r="2.5" fill={line.color} style={{ filter: `drop-shadow(0 0 6px ${line.color})` }}>
              <animateMotion
                dur={flowSpeed}
                repeatCount="indefinite"
                begin={`${(i * 0.3).toFixed(2)}s`}
                keyPoints={line.dir === "reverse" ? "1;0" : "0;1"}
                keyTimes="0;1"
              >
                <mpath href={`#${line.path}`} />
              </animateMotion>
            </circle>
          ))
        )}
      </svg>

      {/* Mode badge */}
      <div className="absolute top-4 left-4 glass-panel-strong rounded-full px-4 py-1.5 flex items-center gap-2 animate-fade-in">
        <span className="h-2 w-2 rounded-full bg-energy animate-pulse-glow" />
        <span className="font-mono-tech text-[10px] tracking-[0.3em] uppercase">
          {mode === "charging" ? "Charging Cycle" : mode === "discharging" ? "Discharging" : "Peak Demand"}
        </span>
      </div>
      {/* Tag */}
      <div className="absolute top-4 right-4 glass-panel-strong rounded-full px-4 py-1.5 animate-fade-in">
        <span className="font-mono-tech text-[10px] tracking-[0.3em] uppercase text-energy">● LIVE TWIN</span>
      </div>
    </div>
  );
};
