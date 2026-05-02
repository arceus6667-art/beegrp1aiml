import { useMemo } from "react";

interface Tech {
  name: string;
  short: string;
  // Each metric 0-100 (normalized)
  energyDensity: number;
  powerDensity: number;
  cycleLife: number;
  efficiency: number;
  color: string;
}

const TECHS: Tech[] = [
  { name: "Lithium-Ion",    short: "Li-ion",   energyDensity: 85, powerDensity: 70, cycleLife: 70, efficiency: 92, color: "hsl(var(--energy))" },
  { name: "Supercapacitor", short: "S-Cap",    energyDensity: 20, powerDensity: 98, cycleLife: 99, efficiency: 95, color: "hsl(var(--load))" },
  { name: "Flow Battery",   short: "Flow",     energyDensity: 55, powerDensity: 45, cycleLife: 90, efficiency: 78, color: "hsl(var(--efficiency))" },
  { name: "Hydrogen",       short: "H₂",       energyDensity: 95, powerDensity: 35, cycleLife: 60, efficiency: 55, color: "hsl(var(--tech))" },
];

const METRICS = ["Energy Density", "Power Density", "Cycle Life", "Efficiency"] as const;

export const TechRadar = ({ activeIndex, onSelect }: { activeIndex: number; onSelect: (i: number) => void }) => {
  const cx = 130, cy = 130, r = 95;
  const angles = METRICS.map((_, i) => (i / METRICS.length) * Math.PI * 2 - Math.PI / 2);

  const polygon = (t: Tech) => {
    const vals = [t.energyDensity, t.powerDensity, t.cycleLife, t.efficiency];
    return vals.map((v, i) => {
      const rr = (v / 100) * r;
      const x = cx + Math.cos(angles[i]) * rr;
      const y = cy + Math.sin(angles[i]) * rr;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  };

  const active = TECHS[activeIndex];
  const activeMetrics = useMemo(
    () => [
      { label: "Energy Density", val: active.energyDensity },
      { label: "Power Density",  val: active.powerDensity },
      { label: "Cycle Life",     val: active.cycleLife },
      { label: "Efficiency",     val: active.efficiency },
    ],
    [active]
  );

  return (
    <div className="glass-panel holo-border rounded-2xl p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-mono-tech text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Tech Comparison</h3>
          <p className="text-sm font-bold mt-0.5">Storage Profiles</p>
        </div>
        <span className="font-mono-tech text-[9px] tracking-widest text-energy">RADAR · 4D</span>
      </div>

      <svg viewBox="0 0 260 260" className="w-full">
        {/* Concentric web */}
        {[0.25, 0.5, 0.75, 1].map((s) => {
          const pts = angles.map((a) => {
            const x = cx + Math.cos(a) * r * s;
            const y = cy + Math.sin(a) * r * s;
            return `${x},${y}`;
          }).join(" ");
          return <polygon key={s} points={pts} fill="none" stroke="hsl(var(--energy) / 0.18)" strokeWidth="1" />;
        })}
        {/* Spokes */}
        {angles.map((a, i) => (
          <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r}
            stroke="hsl(var(--energy) / 0.2)" strokeWidth="1" />
        ))}
        {/* All techs ghost */}
        {TECHS.map((t, i) =>
          i === activeIndex ? null : (
            <polygon key={t.name} points={polygon(t)} fill={t.color} fillOpacity="0.05"
              stroke={t.color} strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 3" />
          )
        )}
        {/* Active tech */}
        <polygon points={polygon(active)} fill={active.color} fillOpacity="0.25"
          stroke={active.color} strokeWidth="2"
          style={{ filter: `drop-shadow(0 0 8px ${active.color})` }} />
        {/* Vertices */}
        {angles.map((a, i) => {
          const v = [active.energyDensity, active.powerDensity, active.cycleLife, active.efficiency][i];
          const rr = (v / 100) * r;
          return <circle key={i} cx={cx + Math.cos(a) * rr} cy={cy + Math.sin(a) * rr} r="3.5"
            fill="hsl(0 0% 100%)" stroke={active.color} strokeWidth="2" />;
        })}
        {/* Axis labels */}
        {METRICS.map((m, i) => {
          const a = angles[i];
          const x = cx + Math.cos(a) * (r + 18);
          const y = cy + Math.sin(a) * (r + 18);
          return (
            <text key={m} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
              className="font-mono-tech" fontSize="8" fill="hsl(var(--muted-foreground))" letterSpacing="1">
              {m.toUpperCase()}
            </text>
          );
        })}
      </svg>

      {/* Tech selector */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        {TECHS.map((t, i) => {
          const active = i === activeIndex;
          return (
            <button key={t.name} onClick={() => onSelect(i)}
              className={`group relative rounded-xl px-3 py-2 text-left transition-all duration-300 border ${
                active ? "bg-white shadow-soft border-transparent" : "border-border/50 hover:bg-white/50"
              }`}
              style={active ? { boxShadow: `0 0 0 1px ${t.color}, 0 6px 20px ${t.color}40` } : {}}>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: t.color, boxShadow: active ? `0 0 8px ${t.color}` : "none" }} />
                <span className="font-mono-tech text-[10px] uppercase tracking-wider">{t.short}</span>
              </div>
              <p className="text-[9px] text-muted-foreground mt-0.5 truncate">{t.name}</p>
            </button>
          );
        })}
      </div>

      {/* Metrics readout */}
      <div className="mt-3 space-y-1.5">
        {activeMetrics.map((m) => (
          <div key={m.label} className="flex items-center gap-2">
            <span className="font-mono-tech text-[9px] uppercase tracking-wider text-muted-foreground w-24">{m.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${m.val}%`, background: active.color, boxShadow: `0 0 8px ${active.color}` }} />
            </div>
            <span className="font-mono-tech text-[10px] tabular-nums w-8 text-right" style={{ color: active.color }}>{m.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
