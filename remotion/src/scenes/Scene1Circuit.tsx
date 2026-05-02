import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

const CYAN = "#22e6ff";
const CYAN_DIM = "rgba(34, 230, 255, 0.5)";

// Hand-laid circuit graph. Each segment draws progressively as a stroke-dashoffset reveal.
const NODES: { x: number; y: number }[] = [
  { x: 200, y: 200 },   // 0
  { x: 500, y: 200 },   // 1
  { x: 500, y: 420 },   // 2
  { x: 820, y: 420 },   // 3
  { x: 960, y: 540 },   // 4 center
  { x: 1100, y: 420 },  // 5
  { x: 1420, y: 420 },  // 6
  { x: 1420, y: 200 },  // 7
  { x: 1720, y: 200 },  // 8
  { x: 200, y: 880 },   // 9
  { x: 500, y: 880 },   // 10
  { x: 500, y: 660 },   // 11
  { x: 820, y: 660 },   // 12
  { x: 1100, y: 660 },  // 13
  { x: 1420, y: 660 },  // 14
  { x: 1420, y: 880 },  // 15
  { x: 1720, y: 880 },  // 16
  { x: 960, y: 200 },   // 17
  { x: 960, y: 880 },   // 18
];

// Edges with orthogonal routing for circuit feel
const EDGES: [number, number][] = [
  [0, 1], [1, 17], [17, 7], [7, 8],
  [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7],
  [9, 10], [10, 11], [11, 12], [12, 4], [4, 13], [13, 14], [14, 15], [15, 16],
  [10, 18], [18, 15],
  [2, 11], [6, 14],
];

const buildPath = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  // L-shaped path for circuit aesthetic
  if (a.x === b.x || a.y === b.y) return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  const midX = (a.x + b.x) / 2;
  return `M ${a.x} ${a.y} L ${midX} ${a.y} L ${midX} ${b.y} L ${b.x} ${b.y}`;
};

export const Scene1Circuit = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, #021018 0%, #000 75%)" }}>
      {/* Subtle backdrop grid */}
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="grid1" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(34,230,255,0.06)" strokeWidth="1" />
          </pattern>
          <filter id="glow1" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="strong-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="1920" height="1080" fill="url(#grid1)" opacity={interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" })} />

        {/* Edges drawing in, staggered */}
        <g filter="url(#glow1)">
          {EDGES.map(([ai, bi], i) => {
            const a = NODES[ai];
            const b = NODES[bi];
            const d = buildPath(a, b);
            const start = 4 + i * 1.6;
            const drawDur = 18;
            const progress = interpolate(frame, [start, start + drawDur], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const length = 2400;
            return (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={CYAN}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={length}
                strokeDashoffset={length * (1 - progress)}
                opacity={progress > 0 ? 0.95 : 0}
              />
            );
          })}
        </g>

        {/* Nodes pop in after edges reach them */}
        <g filter="url(#strong-glow)">
          {NODES.map((n, i) => {
            const popStart = 14 + i * 1.5;
            const scale = interpolate(frame, [popStart, popStart + 8, popStart + 18], [0, 1.6, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const pulse = 1 + Math.sin((frame - popStart) * 0.25) * 0.1;
            const isCenter = i === 4;
            const r = (isCenter ? 12 : 6) * scale * pulse;
            return (
              <g key={i}>
                <circle cx={n.x} cy={n.y} r={r * 2.5} fill={CYAN} opacity={0.15 * scale} />
                <circle cx={n.x} cy={n.y} r={r} fill={isCenter ? "#fff" : CYAN} />
                {isCenter && scale > 0.5 && (
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={r * 4}
                    fill="none"
                    stroke={CYAN}
                    strokeWidth={1}
                    opacity={interpolate((frame - popStart) % 30, [0, 30], [0.6, 0])}
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* Tiny bracket marks at corners */}
        <g stroke={CYAN_DIM} strokeWidth={1.5} fill="none" opacity={interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" })}>
          <path d="M 80 80 L 80 130 M 80 80 L 130 80" />
          <path d="M 1840 80 L 1840 130 M 1840 80 L 1790 80" />
          <path d="M 80 1000 L 80 950 M 80 1000 L 130 1000" />
          <path d="M 1840 1000 L 1840 950 M 1840 1000 L 1790 1000" />
        </g>
      </svg>

      {/* Boot status text top-left */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 100,
          fontFamily: "JetBrains Mono, monospace",
          color: CYAN,
          fontSize: 14,
          letterSpacing: 4,
          opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" }),
          textShadow: `0 0 8px ${CYAN}`,
        }}
      >
        AETHER-GRID :: COLD BOOT // 0x4F2A
      </div>
    </AbsoluteFill>
  );
};
