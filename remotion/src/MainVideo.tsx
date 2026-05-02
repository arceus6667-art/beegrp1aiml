import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/JetBrainsMono";
import { Scene1Circuit } from "./scenes/Scene1Circuit";
import { Scene2Pulse } from "./scenes/Scene2Pulse";
import { Scene3Sphere } from "./scenes/Scene3Sphere";
import { Scene4Explosion } from "./scenes/Scene4Explosion";
import { Scene5UI } from "./scenes/Scene5UI";

loadFont("normal", { weights: ["400", "700"], subsets: ["latin"] });

// Persistent vignette + grain across the whole boot
const Vignette = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30, 130, 150], [1, 0.7, 0.4, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.85) 100%)",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

export const MainVideo = () => {
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* Scene 1: 0-60 (0-2s) circuit lines */}
      <Sequence from={0} durationInFrames={70}>
        <Scene1Circuit />
      </Sequence>

      {/* Scene 2: 50-120 (1.7-4s) pulses + components light up */}
      <Sequence from={50} durationInFrames={75}>
        <Scene2Pulse />
      </Sequence>

      {/* Scene 3: 105-150 (3.5-5s) convergence into sphere */}
      <Sequence from={105} durationInFrames={48}>
        <Scene3Sphere />
      </Sequence>

      {/* Scene 4: 145-165 (4.8-5.5s) explosion to white */}
      <Sequence from={145} durationInFrames={22}>
        <Scene4Explosion />
      </Sequence>

      {/* Scene 5: 160-180 (5.3-6s) UI reveal */}
      <Sequence from={160} durationInFrames={20}>
        <Scene5UI />
      </Sequence>

      <Vignette />
    </AbsoluteFill>
  );
};
