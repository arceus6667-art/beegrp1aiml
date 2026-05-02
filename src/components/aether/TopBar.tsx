import { useEffect, useState } from "react";
import { Activity, Cpu, Wifi, Zap } from "lucide-react";

export const TopBar = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const ts = time.toISOString().slice(11, 19) + " UTC";

  return (
    <header className="glass-panel-strong rounded-2xl px-5 py-3 flex items-center justify-between gap-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 rounded-xl gradient-energy flex items-center justify-center shadow-glow">
          <Zap className="h-5 w-5 text-white" />
          <div className="absolute inset-0 rounded-xl border border-white/40" />
          <div className="absolute -inset-1 rounded-xl border border-energy/30 animate-pulse-glow" />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="font-bold text-base sm:text-lg tracking-tight">AETHER-GRID</h1>
            <span className="font-mono-tech text-[10px] uppercase tracking-[0.3em] text-energy">Energy System</span>
          </div>
          <p className="font-mono-tech text-[9px] uppercase tracking-wider text-muted-foreground">v3.2 · Smart Grid Operator</p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-5 font-mono-tech text-[10px] uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <Activity className="h-3 w-3 text-efficiency" />
          <span className="text-muted-foreground">UPLINK</span>
          <span className="text-efficiency">SYNCED</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Cpu className="h-3 w-3 text-energy" />
          <span className="text-muted-foreground">NODES</span>
          <span className="text-energy">128/128</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wifi className="h-3 w-3 text-tech" />
          <span className="text-muted-foreground">LATENCY</span>
          <span className="text-tech">8ms</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="font-mono-tech text-[9px] uppercase tracking-wider text-muted-foreground">System Time</div>
          <div className="font-mono-tech text-sm font-bold text-energy text-glow-cyan tabular-nums">{ts}</div>
        </div>
      </div>
    </header>
  );
};

export const TickerBar = () => {
  const items = [
    "● GRID FREQUENCY 50.02 Hz NOMINAL",
    "● SOLAR ARRAY-7 OUTPUT +4.2%",
    "● WIND FARM δ AT 87% CAPACITY",
    "● BATTERY CLUSTER B CHARGING",
    "● H₂ TANK 03 PRESSURE STABLE",
    "● AI MODEL v4.7 RUNNING",
    "● DEMAND FORECAST 96.4% CONFIDENCE",
    "● CARBON OFFSET 12.4 t TODAY",
  ];
  const content = [...items, ...items].join("   ◆   ");
  return (
    <div className="glass-panel rounded-full px-4 py-1.5 overflow-hidden whitespace-nowrap animate-fade-in">
      <div className="inline-block font-mono-tech text-[10px] tracking-widest text-muted-foreground"
        style={{ animation: "ticker 60s linear infinite" }}>
        {content}
      </div>
    </div>
  );
};
