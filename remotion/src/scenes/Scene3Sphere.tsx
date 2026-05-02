import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

const CYAN = "#22e6ff";
const WHITE = "#ffffff";

const NODES = [
  { x: 200, y: 200 }, { x: 500, y: 200 }, { x: 500, y: 420 }, { x: 820, y: 420 },
  { x: 960, y: 540 }, { x: 1100, y: 420 }, { x: 1420, y: 420 }, { x: 1420, y: 200 },
  { x: 1720, y: 200 }, { x: 200, y: 880 }, { x: 500, y: 880 }, { x: 500, y: 660 },
  { x: 820, y: 660 }, { x: 1100, y: 660 }, { x: 1420, y: 660 }, { x: 1420, y: 880 },
  { x: 1720, y: 880 }, { x: 960, y: 200 }, { x: 960, y: 880 },
];

const CENTER = { x: 960, y: 540 };

export const Scene3Sphere = () => {
  const frame = useCurrentFrame();
  const total = 48;
  const t = frame / total;

  // Energy converges from each node to center
  const conv = interpolate(frame, [0, 28], [0, 1], { extrapolateRight: "clamp" });
  // Sphere appears + grows
  const sphere = interpolate(frame, [16, 40], [0, 1], { extrapolateRight: "clamp" });
  const sphereR = interpolate(sphere, [0, 1], [0, 220]);
  const sphereGlow = interpolate(sphere, [0, 1], [0, 1]);

  // Camera-like dolly: scale entire scene slightly
  const dolly = interpolate(frame, [0, total], [1, 1.18]);

  // Whole-frame brightness
  const bgGlow = interpolate(frame, [0, total], [0.05, 0.35]);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 50%, rgba(34,230,255,${bgGlow}) 0%, #000814 40%, #000 100%)`,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0, transform: `scale(${dolly})`, transformOrigin: "center" }}
      >
        <defs>
          <radialGradient id="sphere-core">
            <stop offset="0%" stopColor={WHITE} stopOpacity={1} />
            <stop offset="30%" stopColor={WHITE} stopOpacity={0.9} />
            <stop offset="55%" stopColor={CYAN} stopOpacity={0.9} />
            <stop offset="100%" stopColor={CYAN} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="sphere-halo">
            <stop offset="0%" stopColor={CYAN} stopOpacity={0.6} />
            <stop offset="100%" stopColor={CYAN} stopOpacity={0} />
          </radialGradient>
          <filter id="bigblur">
            <feGaussianBlur stdDeviation="20" />
          </filter>
        </defs>

        {/* Edges fading away as energy converges */}
        <g opacity={interpolate(frame, [0, 24], [0.5, 0])}>
          {NODES.map((n, i) =>
            i === 4 ? null : (
              <line
                key={i}
                x1={n.x}
                y1={n.y}
                x2={CENTER.x}
                y2={CENTER.y}
                stroke={CYAN}
                strokeWidth={1}
                opacity={0.4}
              />
            )
          )}
        </g>

        {/* Energy streams: each node sends a particle toward center */}
        {NODES.map((n, i) => {
          if (i === 4) return null;
          const start = (i % 6) * 1.2;
          const localT = interpolate(frame - start, [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const ease = localT * localT * (3 - 2 * localT); // smoothstep
          const px = n.x + (CENTER.x - n.x) * ease;
          const py = n.y + (CENTER.y - n.y) * ease;
          const tail = 60;
          const tx = n.x + (CENTER.x - n.x) * Math.max(0, ease - 0.08);
          const ty = n.y + (CENTER.y - n.y) * Math.max(0, ease - 0.08);
          const op = interpolate(localT, [0, 0.1, 0.85, 1], [0, 1, 1, 0]);
          return (
            <g key={i} opacity={op}>
              <line x1={tx} y1={ty} x2={px} y2={py} stroke={CYAN} strokeWidth={3} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${CYAN})` }} />
              <circle cx={px} cy={py} r={6} fill={WHITE} style={{ filter: `drop-shadow(0 0 12px ${WHITE})` }} />
            </g>
          );
        })}

        {/* Outer halo */}
        {sphere > 0 && (
          <circle cx={CENTER.x} cy={CENTER.y} r={sphereR * 2.4} fill="url(#sphere-halo)" opacity={sphereGlow} />
        )}
        {/* Energy ring orbiting */}
        {sphere > 0.2 && (
          <g
            style={{
              transformOrigin: `${CENTER.x}px ${CENTER.y}px`,
              transform: `rotate(${frame * 6}deg)`,
            }}
          >
            <ellipse
              cx={CENTER.x}
              cy={CENTER.y}
              rx={sphereR * 1.4}
              ry={sphereR * 0.4}
              fill="none"
              stroke={CYAN}
              strokeWidth={2}
              opacity={0.9 * sphereGlow}
              style={{ filter: `drop-shadow(0 0 12px ${CYAN})` }}
            />
          </g>
        )}
        {sphere > 0.3 && (
          <g
            style={{
              transformOrigin: `${CENTER.x}px ${CENTER.y}px`,
              transform: `rotate(${-frame * 4 + 60}deg)`,
            }}
          >
            <ellipse
              cx={CENTER.x}
              cy={CENTER.y}
              rx={sphereR * 1.3}
              ry={sphereR * 0.35}
              fill="none"
              stroke={WHITE}
              strokeWidth={1.5}
              opacity={0.7 * sphereGlow}
              style={{ filter: `drop-shadow(0 0 8px ${CYAN})` }}
            />
          </g>
        )}
        {/* Core sphere */}
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={sphereR}
          fill="url(#sphere-core)"
          style={{ filter: `drop-shadow(0 0 ${40 * sphereGlow}px ${CYAN})` }}
        />
        {/* White hot core */}
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={sphereR * 0.45 * (1 + Math.sin(frame * 0.4) * 0.06)}
          fill={WHITE}
          opacity={sphereGlow}
        />

        {/* Lens flare horizontal streak (Apple-grade) */}
        {sphere > 0.5 && (
          <ellipse
            cx={CENTER.x}
            cy={CENTER.y}
            rx={900 * sphereGlow}
            ry={3}
            fill={WHITE}
            opacity={0.7 * sphereGlow}
          />
        )}
      </svg>
    </AbsoluteFill>
  );
};
