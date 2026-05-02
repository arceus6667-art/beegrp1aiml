import { FlowMode } from "./EnergyPlant";
import { Battery, BatteryCharging, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimulationBarProps {
  mode: FlowMode;
  setMode: (m: FlowMode) => void;
  storageLevel: number;
  gridLoad: number;
  rate: number;
}

const MODES: { id: FlowMode; label: string; sub: string; Icon: typeof Zap; color: string; ring: string }[] = [
  { id: "charging",    label: "Charging",    sub: "Surplus → Storage",   Icon: BatteryCharging, color: "hsl(var(--efficiency))", ring: "shadow-glow-green" },
  { id: "discharging", label: "Discharging", sub: "Storage → Grid",      Icon: Battery,         color: "hsl(var(--energy))",     ring: "shadow-glow" },
  { id: "peak",        label: "Peak Demand", sub: "All sources active",  Icon: Zap,             color: "hsl(var(--load))",       ring: "shadow-glow-orange" },
];

export const SimulationBar = ({ mode, setMode, storageLevel, gridLoad, rate }: SimulationBarProps) => {
  return (
    <div className="glass-panel-strong holo-border rounded-2xl p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-mono-tech text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Energy Flow Mode</h3>
          <p className="text-base font-bold">Live Simulation Control</p>
        </div>
        <div className="flex items-center gap-2 font-mono-tech text-[10px]">
          <span className="text-muted-foreground">FLOW RATE</span>
          <span className="text-energy text-glow-cyan font-bold">{rate.toFixed(2)} MW/s</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {MODES.map((m) => {
          const active = m.id === mode;
          return (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={cn(
                "group relative rounded-xl p-4 text-left transition-all duration-300 overflow-hidden border",
                active ? "bg-white border-transparent" : "bg-white/40 border-border/50 hover:bg-white/70"
              )}
              style={active ? { boxShadow: `0 0 0 1.5px ${m.color}, 0 10px 30px ${m.color}55`} : {}}>
              {/* shimmer */}
              {active && (
                <div className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${m.color}40 50%, transparent 100%)`,
                    backgroundSize: "200% 100%",
                    animation: "shimmer 3s linear infinite",
                  }} />
              )}
              <div className="relative flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{ background: active ? m.color : `${m.color}22`, color: active ? "white" : m.color }}>
                  <m.Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">{m.label}</div>
                  <div className="font-mono-tech text-[9px] uppercase tracking-wider text-muted-foreground">{m.sub}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Storage + Grid bars */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between font-mono-tech text-[9px] uppercase tracking-wider mb-1">
            <span className="text-muted-foreground">Storage Reserve</span>
            <span className="text-efficiency">{storageLevel.toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden relative">
            <div className="h-full gradient-efficiency transition-all duration-700"
              style={{ width: `${storageLevel}%`, boxShadow: "0 0 10px hsl(var(--efficiency))" }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between font-mono-tech text-[9px] uppercase tracking-wider mb-1">
            <span className="text-muted-foreground">Grid Load</span>
            <span className="text-load">{gridLoad.toFixed(1)} MW</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full gradient-load transition-all duration-700"
              style={{ width: `${Math.min(100, (gridLoad / 50) * 100)}%`, boxShadow: "0 0 10px hsl(var(--load))" }} />
          </div>
        </div>
      </div>
    </div>
  );
};
