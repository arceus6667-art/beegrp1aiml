import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const CYAN = "#22e6ff";
const WHITE = "#ffffff";

// Reuse the same node positions for visual continuity
const NODES = [
  { x: 200, y: 200 }, { x: 500, y: 200 }, { x: 500, y: 420 }, { x: 820, y: 420 },
  { x: 960, y: 540 }, { x: 1100, y: 420 }, { x: 1420, y: 420 }, { x: 1420, y: 200 },
  { x: 1720, y: 200 }, { x: 200, y: 880 }, { x: 500, y: 880 }, { x: 500, y: 660 },
  { x: 820, y: 660 }, { x: 1100, y: 660 }, { x: 1420, y: 660 }, { x: 1420, y: 880 },
  { x: 1720, y: 880 }, { x: 960, y: 200 }, { x: 960, y: 880 },
];
const EDGES: [number, number][] = [
  [0, 1], [1, 17], [17, 7], [7, 8],
  [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7],
  [9, 10], [10, 11], [11, 12], [12, 4], [4, 13], [13, 14], [14, 15], [15, 16],
  [10, 18], [18, 15],
  [2, 11], [6, 14],
];
const buildPath = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  if (a.x === b.x || a.y === b.y) return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  const midX = (a.x + b.x) / 2;
  return `M ${a.x} ${a.y} L ${midX} ${a.y} L ${midX} ${b.y} L ${b.x} ${b.y}`;
};

// Components placed along edges — R, L, C, diode glyphs
const COMPONENTS = [
  { type: "R", x: 350, y: 200, edge: 0 },
  { type: "L", x: 670, y: 420, edge: 3 },
  { type: "C", x: 1260, y: 420, edge: 5 },
  { type: "D", x: 1570, y: 200, edge: 2 },
  { type: "R", x: 350, y: 880, edge: 10 },
  { type: "C", x: 970, y: 660, edge: 14 },
  { type: "L", x: 1570, y: 880, edge: 17 },
  { type: "D", x: 500, y: 770, edge: 19 },
];

const CompGlyph = ({ type, x, y, lit }: { type: string; x: number; y: number; lit: number }) => {
  const color = lit > 0.5 ? WHITE : CYAN;
  const glow = `drop-shadow(0 0 ${6 + lit * 12}px ${CYAN})`;
  if (type === "R")
    return (
      <g style={{ filter: glow }}>
        <rect x={x - 22} y={y - 8} width={44} height={16} fill="#000" stroke={color} strokeWidth={2} rx={2} />
        <text x={x} y={y + 4} textAnchor="middle" fontSize={11} fontFamily="JetBrains Mono" fill={color} fontWeight={700}>R</text>
      </g>
    );
  if (type === "L")
    return (
      <g style={{ filter: glow }}>
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={x - 18 + i * 12} cy={y} r={6} fill="none" stroke={color} strokeWidth={2} />
        ))}
      </g>
    );
  if (type === "C")
    return (
      <g style={{ filter: glow }}>
        <line x1={x - 4} y1={y - 14} x2={x - 4} y2={y + 14} stroke={color} strokeWidth={3} />
        <line x1={x + 4} y1={y - 14} x2={x + 4} y2={y + 14} stroke={color} strokeWidth={3} />
      </g>
    );
  // Diode
  return (
    <g style={{ filter: glow }}>
      <polygon points={`${x - 12},${y - 10} ${x - 12},${y + 10} ${x + 8},${y}`} fill="#000" stroke={color} strokeWidth={2} />
      <line x1={x + 8} y1={y - 10} x2={x + 8} y2={y + 10} stroke={color} strokeWidth={2} />
    </g>
  );
};

export const Scene2Pulse = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title pop-in
  const t1Spring = spring({ frame: frame - 4, fps, config: { damping: 18, stiffness: 120 } });
  const t1Out = interpolate(frame, [55, 70], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t1Op = t1Spring * t1Out;

  const t2Spring = spring({ frame: frame - 28, fps, config: { damping: 18, stiffness: 120 } });
  const t2Out = interpolate(frame, [60, 72], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t2Op = t2Spring * t2Out;

  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="glow2" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <radialGradient id="pulse-grad">
            <stop offset="0%" stopColor={WHITE} stopOpacity={1} />
            <stop offset="40%" stopColor={CYAN} stopOpacity={0.9} />
            <stop offset="100%" stopColor={CYAN} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* Persistent edges (continued from scene 1) */}
        <g>
          {EDGES.map(([ai, bi], i) => {
            const a = NODES[ai];
            const b = NODES[bi];
            const d = buildPath(a, b);
            const brighten = interpolate(frame, [0, 30, 60], [0.7, 1, 1], { extrapolateRight: "clamp" });
            return <path key={i} d={d} fill="none" stroke={CYAN} strokeWidth={2} opacity={0.55 * brighten} style={{ filter: "drop-shadow(0 0 4px " + CYAN + ")" }} />;
          })}
        </g>

        {/* Energy pulses traveling along edges (using <animateMotion> via path offsets approximated in SVG) */}
        <g>
          {EDGES.map(([ai, bi], i) => {
            const a = NODES[ai];
            const b = NODES[bi];
            // Compute three waypoints to emulate L-path
            const useL = !(a.x === b.x || a.y === b.y);
            const midX = (a.x + b.x) / 2;
            const waypoints = useL ? [a, { x: midX, y: a.y }, { x: midX, y: b.y }, b] : [a, b];
            // Animate along whole path with normalized t
            const launch = (i * 2) % 26; // staggered
            const cycle = 38;
            const local = ((frame - launch) % cycle + cycle) % cycle;
            const tt = local / cycle;
            // Find segment
            const segs: number[] = [];
            let total = 0;
            for (let k = 0; k < waypoints.length - 1; k++) {
              const dx = waypoints[k + 1].x - waypoints[k].x;
              const dy = waypoints[k + 1].y - waypoints[k].y;
              const len = Math.hypot(dx, dy);
              segs.push(len);
              total += len;
            }
            let target = tt * total;
            let px = waypoints[0].x;
            let py = waypoints[0].y;
            for (let k = 0; k < segs.length; k++) {
              if (target <= segs[k]) {
                const f = target / segs[k];
                px = waypoints[k].x + (waypoints[k + 1].x - waypoints[k].x) * f;
                py = waypoints[k].y + (waypoints[k + 1].y - waypoints[k].y) * f;
                break;
              }
              target -= segs[k];
              px = waypoints[k + 1].x;
              py = waypoints[k + 1].y;
            }
            const visible = interpolate(frame, [launch, launch + 4, launch + cycle - 4, launch + cycle], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <g key={i} opacity={visible}>
                <circle cx={px} cy={py} r={18} fill="url(#pulse-grad)" />
                <circle cx={px} cy={py} r={4} fill={WHITE} style={{ filter: `drop-shadow(0 0 8px ${WHITE})` }} />
              </g>
            );
          })}
        </g>

        {/* Nodes still present, brighter */}
        <g>
          {NODES.map((n, i) => {
            const isCenter = i === 4;
            const pulse = 1 + Math.sin(frame * 0.25 + i) * 0.15;
            return (
              <g key={i}>
                <circle cx={n.x} cy={n.y} r={(isCenter ? 14 : 7) * pulse} fill={isCenter ? WHITE : CYAN} style={{ filter: `drop-shadow(0 0 ${isCenter ? 18 : 10}px ${CYAN})` }} />
              </g>
            );
          })}
        </g>

        {/* Components light up */}
        <g>
          {COMPONENTS.map((c, i) => {
            const litStart = 8 + i * 3;
            const lit = interpolate(frame, [litStart, litStart + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return <CompGlyph key={i} type={c.type} x={c.x} y={c.y} lit={lit} />;
          })}
        </g>

        {/* Component labels */}
        <g fontFamily="JetBrains Mono" fontSize={11} fill={CYAN} opacity={interpolate(frame, [22, 36], [0, 0.85], { extrapolateRight: "clamp" })}>
          {COMPONENTS.map((c, i) => (
            <text key={i} x={c.x} y={c.y + 32} textAnchor="middle" letterSpacing={2}>
              {c.type}{i + 1}
            </text>
          ))}
        </g>
      </svg>

      {/* Boot text — center-left, kinetic */}
      <div
        style={{
          position: "absolute",
          left: 100,
          bottom: 180,
          fontFamily: "JetBrains Mono, monospace",
          color: WHITE,
          fontSize: 38,
          fontWeight: 700,
          letterSpacing: 2,
          opacity: t1Op,
          transform: `translateX(${interpolate(t1Spring, [0, 1], [-30, 0])}px)`,
          textShadow: `0 0 20px ${CYAN}, 0 0 40px ${CYAN}`,
        }}
      >
        <span style={{ color: CYAN }}>{">"} </span>Initializing Energy Network<span style={{ opacity: 0.4 }}>...</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 100,
          bottom: 120,
          fontFamily: "JetBrains Mono, monospace",
          color: WHITE,
          fontSize: 38,
          fontWeight: 700,
          letterSpacing: 2,
          opacity: t2Op,
          transform: `translateX(${interpolate(t2Spring, [0, 1], [-30, 0])}px)`,
          textShadow: `0 0 20px ${CYAN}, 0 0 40px ${CYAN}`,
        }}
      >
        <span style={{ color: CYAN }}>{">"} </span>Calibrating Systems<span style={{ opacity: 0.4 }}>...</span>
      </div>

      {/* Status code top-right */}
      <div
        style={{
          position: "absolute",
          top: 100,
          right: 100,
          fontFamily: "JetBrains Mono, monospace",
          color: CYAN,
          fontSize: 14,
          letterSpacing: 4,
          textAlign: "right",
          opacity: 0.9,
          textShadow: `0 0 8px ${CYAN}`,
        }}
      >
        NODES {String(Math.min(128, Math.floor(interpolate(frame, [0, 60], [12, 128])))).padStart(3, "0")}/128
        <br />
        FLUX {(interpolate(frame, [0, 60], [0.42, 0.97])).toFixed(2)} ⚡
      </div>
    </AbsoluteFill>
  );
};
