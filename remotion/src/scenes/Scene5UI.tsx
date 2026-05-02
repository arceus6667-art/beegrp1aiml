import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const CYAN = "#22e6ff";
const FG = "#0d2032";

// A simplified holographic preview of the AETHER-GRID main UI for the final reveal.
export const Scene5UI = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth fade from white into UI
  const whiteFade = interpolate(frame, [0, 10], [1, 0], { extrapolateRight: "clamp" });

  const titleSpring = spring({ frame: frame - 4, fps, config: { damping: 200 } });
  const titleY = interpolate(titleSpring, [0, 1], [20, 0]);
  const titleOp = titleSpring;

  const panelSpring = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  const panelOp = panelSpring;

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at top, #d6f3fb 0%, #f2f9fc 50%, #f7fbfd 100%)",
      }}
    >
      {/* Subtle grid */}
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="g5" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(34,230,255,0.18)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="url(#g5)" opacity={0.7} />
      </svg>

      {/* Header bar */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 60,
          right: 60,
          height: 90,
          borderRadius: 24,
          background: "rgba(255,255,255,0.7)",
          border: "1.5px solid rgba(34,230,255,0.35)",
          boxShadow: "0 20px 60px -20px rgba(34,150,200,0.3)",
          display: "flex",
          alignItems: "center",
          padding: "0 30px",
          opacity: panelOp,
          transform: `translateY(${interpolate(panelOp, [0, 1], [10, 0])}px)`,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${CYAN}, #5cdcff)`,
            boxShadow: `0 0 24px ${CYAN}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 800,
            fontSize: 28,
            fontFamily: "JetBrains Mono",
          }}
        >
          ⚡
        </div>
        <div style={{ marginLeft: 18 }}>
          <div style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 28, color: FG, letterSpacing: 1 }}>
            AETHER-GRID
          </div>
          <div style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: CYAN, letterSpacing: 4, textTransform: "uppercase" }}>
            Energy System · Online
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 30, fontFamily: "JetBrains Mono", fontSize: 14, color: FG, letterSpacing: 3 }}>
          <span><span style={{ color: "#1bc47d" }}>● </span>UPLINK SYNCED</span>
          <span><span style={{ color: CYAN }}>● </span>NODES 128/128</span>
          <span><span style={{ color: "#9756e8" }}>● </span>LATENCY 8ms</span>
        </div>
      </div>

      {/* Three panels */}
      {[
        { x: 60, w: 480, accent: "#ff8a3d", title: "TELEMETRY", val: "32.4 MW" },
        { x: 580, w: 760, accent: CYAN, title: "CORE REACTOR", val: "AETHER-01" },
        { x: 1380, w: 480, accent: "#9756e8", title: "AI MANAGER", val: "94.2%" },
      ].map((p, i) => {
        const s = spring({ frame: frame - (10 + i * 2), fps, config: { damping: 200 } });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 200,
              left: p.x,
              width: p.w,
              height: 540,
              borderRadius: 24,
              background: "rgba(255,255,255,0.75)",
              border: "1.5px solid rgba(34,230,255,0.3)",
              boxShadow: `0 30px 80px -30px rgba(34,150,200,0.35)`,
              padding: 30,
              opacity: s,
              transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px) scale(${interpolate(s, [0, 1], [0.97, 1])})`,
            }}
          >
            <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, letterSpacing: 5, color: "#5b7280", textTransform: "uppercase" }}>
              {p.title}
            </div>
            <div
              style={{
                marginTop: 10,
                fontFamily: "JetBrains Mono",
                fontWeight: 700,
                fontSize: 56,
                color: p.accent,
                textShadow: `0 0 18px ${p.accent}55`,
                letterSpacing: 1,
              }}
            >
              {p.val}
            </div>
            {/* Mini bars */}
            <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 12 }}>
              {[0, 1, 2, 3].map((b) => {
                const w = 40 + (Math.sin(b * 1.7 + i) * 0.5 + 0.5) * 50;
                return (
                  <div key={b} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 60, fontFamily: "JetBrains Mono", fontSize: 10, color: "#5b7280", letterSpacing: 2 }}>
                      M{b + 1}
                    </div>
                    <div style={{ flex: 1, height: 6, background: "rgba(34,230,255,0.12)", borderRadius: 3, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${w}%`,
                          background: `linear-gradient(90deg, ${p.accent}, ${p.accent}88)`,
                          boxShadow: `0 0 8px ${p.accent}`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Centered hero strapline */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "JetBrains Mono",
          color: FG,
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div style={{ fontSize: 14, letterSpacing: 12, color: CYAN, textTransform: "uppercase" }}>
          System Online
        </div>
        <div style={{ fontSize: 44, fontWeight: 700, marginTop: 14, letterSpacing: 4 }}>
          WELCOME TO AETHER-GRID
        </div>
      </div>

      {/* White fade-in overlay */}
      <AbsoluteFill style={{ background: "white", opacity: whiteFade, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
