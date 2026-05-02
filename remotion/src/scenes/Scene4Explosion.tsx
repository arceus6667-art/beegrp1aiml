import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

const CYAN = "#22e6ff";
const WHITE = "#ffffff";

export const Scene4Explosion = () => {
  const frame = useCurrentFrame();
  // 22 frames total
  const t = frame / 22;

  const flashR = interpolate(frame, [0, 8, 16], [220, 1600, 2400], { extrapolateRight: "clamp" });
  const whiteOpacity = interpolate(frame, [4, 12, 22], [0, 1, 1], { extrapolateRight: "clamp" });

  // Radial light rays
  const rays = Array.from({ length: 24 }, (_, i) => i);

  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="explode-grad">
            <stop offset="0%" stopColor={WHITE} stopOpacity={1} />
            <stop offset="35%" stopColor={WHITE} stopOpacity={0.9} />
            <stop offset="60%" stopColor={CYAN} stopOpacity={0.7} />
            <stop offset="100%" stopColor={CYAN} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* Light rays */}
        <g style={{ transformOrigin: "960px 540px", transform: `rotate(${frame * 3}deg)` }}>
          {rays.map((i) => (
            <rect
              key={i}
              x={960}
              y={540 - 2}
              width={interpolate(frame, [0, 14], [0, 1800])}
              height={4}
              fill={WHITE}
              opacity={interpolate(frame, [0, 6, 16], [0, 0.8, 0])}
              style={{
                transformOrigin: "960px 540px",
                transform: `rotate(${(i * 360) / rays.length}deg)`,
                filter: `drop-shadow(0 0 8px ${CYAN})`,
              }}
            />
          ))}
        </g>

        {/* Expanding shockwave ring */}
        <circle
          cx={960}
          cy={540}
          r={flashR}
          fill="url(#explode-grad)"
          opacity={interpolate(frame, [0, 6, 18], [1, 1, 0.3])}
        />
        {/* Thin shockwave outline */}
        {[0, 4, 8].map((d) => (
          <circle
            key={d}
            cx={960}
            cy={540}
            r={interpolate(frame - d, [0, 14], [50, 1800], { extrapolateLeft: "clamp" })}
            fill="none"
            stroke={WHITE}
            strokeWidth={3}
            opacity={interpolate(frame - d, [0, 8, 16], [1, 0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
            style={{ filter: `drop-shadow(0 0 12px ${CYAN})` }}
          />
        ))}
      </svg>
      {/* White flash overlay */}
      <AbsoluteFill style={{ background: WHITE, opacity: whiteOpacity }} />
    </AbsoluteFill>
  );
};
