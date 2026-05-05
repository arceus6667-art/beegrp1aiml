import { useEffect, useMemo, useState } from "react";
import { TopBar, TickerBar } from "@/components/aether/TopBar";
import { TelemetryCard, useTelemetry } from "@/components/aether/TelemetryCard";
import { EnergyPlant, FlowMode, PlantNodeId } from "@/components/aether/EnergyPlant";
import { TechRadar } from "@/components/aether/TechRadar";
import { SimulationBar } from "@/components/aether/SimulationBar";
import { AIPanel } from "@/components/aether/AIPanel";
import { NodeSimulationPanel } from "@/components/aether/NodeSimulationPanel";

const Index = () => {
  const [mode, setMode] = useState<FlowMode>("charging");
  const [activeTech, setActiveTech] = useState(0);
  const [openNode, setOpenNode] = useState<PlantNodeId | null>(null);

  // Telemetry streams (drift to mode)
  const baseLoad = mode === "peak" ? 42 : mode === "discharging" ? 32 : 22;
  const baseEff = mode === "peak" ? 88 : 94;
  const gridLoad = useTelemetry(baseLoad, 5, 50, 0.04);
  const storage = useTelemetry(mode === "charging" ? 78 : mode === "discharging" ? 55 : 45, 0, 100, 0.02);
  const efficiency = useTelemetry(baseEff, 70, 100, 0.015);
  const voltage = useTelemetry(415, 380, 450, 0.01);
  const powerFactor = useTelemetry(0.96, 0.85, 1, 0.008);

  const flowRate = mode === "peak" ? 4.2 : mode === "discharging" ? 2.8 : 1.6;

  const hydrogen = useMemo(() => 60 + Math.sin(Date.now() / 8000) * 10, []);
  const [hydroLevel, setHydroLevel] = useState(hydrogen);
  useEffect(() => {
    const id = setInterval(() => setHydroLevel(60 + Math.sin(Date.now() / 8000) * 15), 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="min-h-screen p-4 md:p-6">
      {/* Ambient orbs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-energy/10 blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-tech/10 blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-efficiency/10 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-[1600px] mx-auto space-y-4">
        <TopBar />
        <TickerBar />

        <div className="grid grid-cols-12 gap-4">
          {/* LEFT — Telemetry */}
          <aside className="col-span-12 lg:col-span-3 space-y-3">
            <div className="font-mono-tech text-[10px] uppercase tracking-[0.3em] text-muted-foreground px-2">
              ◢ Real-Time Telemetry
            </div>
            <TelemetryCard label="Grid Load"        unit="MW"  variant="load"
              value={gridLoad.value} history={gridLoad.history} min={5} max={50}
              status={gridLoad.value > 40 ? "critical" : gridLoad.value > 30 ? "warning" : "stable"} />
            <TelemetryCard label="Storage Capacity" unit="MWh" variant="efficiency"
              value={storage.value * 0.42} history={storage.history.map(v => v * 0.42)} min={0} max={42}
              status={storage.value < 25 ? "critical" : "stable"} />
            <TelemetryCard label="Efficiency"       unit="%"   variant="efficiency"
              value={efficiency.value} history={efficiency.history} min={70} max={100} decimals={1}
              status={efficiency.value < 80 ? "warning" : "stable"} />
            <TelemetryCard label="Voltage"          unit="V"   variant="energy"
              value={voltage.value} history={voltage.history} min={380} max={450} decimals={0} />
            <TelemetryCard label="Power Factor"     unit="cos φ" variant="tech"
              value={powerFactor.value} history={powerFactor.history} min={0.85} max={1} decimals={3}
              status={powerFactor.value < 0.9 ? "warning" : "stable"} />
          </aside>

          {/* CENTER — 3D Plant */}
          <section className="col-span-12 lg:col-span-6">
            <div className="glass-panel-strong holo-border rounded-2xl overflow-hidden h-[560px] relative">
              <EnergyPlant mode={mode} storageLevel={storage.value} hydrogenLevel={hydroLevel} onNodeClick={setOpenNode} />
            </div>
          </section>

          {/* RIGHT — Tech Radar + AI */}
          <aside className="col-span-12 lg:col-span-3 space-y-4">
            <div className="font-mono-tech text-[10px] uppercase tracking-[0.3em] text-muted-foreground px-2">
              ◢ Storage Technologies
            </div>
            <TechRadar activeIndex={activeTech} onSelect={setActiveTech} />
          </aside>

          {/* BOTTOM ROW */}
          <div className="col-span-12 lg:col-span-8">
            <SimulationBar mode={mode} setMode={setMode}
              storageLevel={storage.value} gridLoad={gridLoad.value} rate={flowRate} />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <AIPanel mode={mode} />
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between glass-panel rounded-2xl px-5 py-2.5 font-mono-tech text-[9px] uppercase tracking-widest text-muted-foreground">
          <span>AETHER-GRID · Digital Twin Engine</span>
          <span>© 2026 · ENERGY OPS · ALL SYSTEMS NOMINAL</span>
          <span className="text-energy">● TELEMETRY 1Hz</span>
        </footer>
      </div>

      {openNode && <NodeSimulationPanel nodeId={openNode} onClose={() => setOpenNode(null)} />}
    </main>
  );
};

export default Index;
