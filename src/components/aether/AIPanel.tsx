import { useEffect, useState } from "react";
import { Brain, Sparkles, TrendingUp, Activity } from "lucide-react";
import { FlowMode } from "./EnergyPlant";

const INSIGHTS_BY_MODE: Record<FlowMode, string[]> = {
  charging: [
    "Solar surplus detected · routing 1.6 MW to Li-ion cluster A",
    "Predicted demand peak in 2h 14min · pre-charging hydrogen reserves",
    "Wind output rising 12% · increasing battery absorption rate",
    "Optimal charge window identified · efficiency gain +3.2%",
  ],
  discharging: [
    "Releasing 2.1 MW from battery cluster · grid frequency stabilized",
    "Hydrogen fuel cell engaged · carbon offset +480 kg/h",
    "Load balancing across 4 substations · variance reduced 18%",
    "Discharge curve optimized · cycle wear minimized",
  ],
  peak: [
    "PEAK EVENT · all storage vectors discharging at 92% capacity",
    "Demand response activated · 340 kW shifted from non-critical loads",
    "Supercapacitor handling transient spikes · response time 8ms",
    "Predictive model: peak duration 41 min · reserves sufficient",
  ],
};

export const AIPanel = ({ mode }: { mode: FlowMode }) => {
  const [tick, setTick] = useState(0);
  const [confidence, setConfidence] = useState(94.2);
  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setConfidence(90 + Math.random() * 8);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const insights = INSIGHTS_BY_MODE[mode];
  const current = insights[tick % insights.length];

  return (
    <div className="glass-panel-strong holo-border rounded-2xl p-5 animate-fade-in relative overflow-hidden">
      {/* Background holographic blob */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full gradient-tech opacity-20 blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-energy opacity-15 blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="relative h-10 w-10 rounded-xl gradient-tech flex items-center justify-center shadow-glow-purple">
              <Brain className="h-5 w-5 text-white" />
              <div className="absolute inset-0 rounded-xl border border-white/30" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm">AI Energy Manager</h3>
                <Sparkles className="h-3 w-3 text-tech" />
              </div>
              <p className="font-mono-tech text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Neural Optimization Engine</p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono-tech text-[9px] uppercase tracking-wider text-muted-foreground">Confidence</div>
            <div className="font-mono-tech text-lg font-bold text-tech">{confidence.toFixed(1)}%</div>
          </div>
        </div>

        {/* Live decision */}
        <div className="rounded-xl bg-white/60 border border-border/50 p-3 mb-3 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 gradient-tech" />
          <div className="flex items-start gap-2 pl-2">
            <Activity className="h-3.5 w-3.5 text-tech mt-0.5 flex-shrink-0 animate-pulse-glow" />
            <div className="flex-1">
              <div className="font-mono-tech text-[9px] uppercase tracking-wider text-tech mb-0.5">Decision · Real-time</div>
              <p key={tick} className="text-xs leading-relaxed animate-fade-in">{current}</p>
            </div>
          </div>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Optimization", value: "+12.4%", Icon: TrendingUp, color: "text-efficiency" },
            { label: "Decisions/min", value: "847", Icon: Brain, color: "text-tech" },
            { label: "Forecast acc.", value: "98.1%", Icon: Sparkles, color: "text-energy" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-white/40 border border-border/40 p-2">
              <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                <s.Icon className="h-2.5 w-2.5" />
                <span className="font-mono-tech text-[8px] uppercase tracking-wider">{s.label}</span>
              </div>
              <div className={`font-mono-tech text-sm font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Predictive timeline */}
        <div className="mt-3">
          <div className="flex justify-between font-mono-tech text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5">
            <span>Predictive Load · Next 6h</span>
            <span className="text-tech">ML-FORECAST</span>
          </div>
          <svg viewBox="0 0 240 40" className="w-full h-10">
            <defs>
              <linearGradient id="ai-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--tech))" stopOpacity="0.5" />
                <stop offset="100%" stopColor="hsl(var(--tech))" stopOpacity="0" />
              </linearGradient>
            </defs>
            {(() => {
              const pts = Array.from({ length: 24 }, (_, i) => {
                const x = (i / 23) * 240;
                const y = 20 + Math.sin(i * 0.6 + tick) * 8 + Math.cos(i * 0.3) * 4;
                return `${x},${y}`;
              }).join(" ");
              return (
                <>
                  <polyline points={`0,40 ${pts} 240,40`} fill="url(#ai-grad)" />
                  <polyline points={pts} fill="none" stroke="hsl(var(--tech))" strokeWidth="1.5"
                    style={{ filter: "drop-shadow(0 0 4px hsl(var(--tech)))" }} />
                </>
              );
            })()}
          </svg>
        </div>
      </div>
    </div>
  );
};
