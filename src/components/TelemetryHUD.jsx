import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

/* ═══════════════════════════════════════════════════════════
   TELEMETRY HUD — Ultra-premium metrics with sparklines
   ═══════════════════════════════════════════════════════════ */

function Sparkline({ data, color, width = 70, height = 22 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = width * 2
    canvas.height = height * 2
    ctx.scale(2, 2)
    ctx.clearRect(0, 0, width, height)

    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    const step = width / (data.length - 1)

    // Fill gradient
    ctx.beginPath()
    ctx.moveTo(0, height)
    data.forEach((v, i) => {
      const x = i * step
      const y = height - ((v - min) / range) * (height - 4) - 2
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    const grad = ctx.createLinearGradient(0, 0, 0, height)
    grad.addColorStop(0, color + '25')
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.fill()

    // Line
    ctx.beginPath()
    data.forEach((v, i) => {
      const x = i * step
      const y = height - ((v - min) / range) * (height - 4) - 2
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.lineJoin = 'round'
    ctx.stroke()

    // Glow dot on last point
    const lastX = (data.length - 1) * step
    const lastY = height - ((data[data.length - 1] - min) / range) * (height - 4) - 2
    ctx.beginPath()
    ctx.arc(lastX, lastY, 2, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
    ctx.beginPath()
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2)
    ctx.fillStyle = color + '30'
    ctx.fill()
  }, [data, color, width, height])

  return <canvas ref={canvasRef} style={{ width, height }} />
}

function AnimatedValue({ value, decimals = 1 }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const end = parseFloat(value)
    const start = display
    const dur = 1200
    const t0 = Date.now()
    const step = () => {
      const p = Math.min((Date.now() - t0) / dur, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setDisplay(+(start + (end - start) * e).toFixed(decimals))
      if (p < 1) requestAnimationFrame(step)
    }
    step()
  }, [value])

  return <>{display}</>
}

function MetricCard({ label, value, unit, icon, color, sparkData, delay }) {
  return (
    <motion.div
      className="glass-panel p-3.5 hud-corner scan-line"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="metric-icon" style={{ background: color + '12', border: `1px solid ${color}30` }}>
          <span>{icon}</span>
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[9px] tracking-[2px] text-aether-dim mb-1">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="font-orbitron text-xl font-bold" style={{ color, textShadow: `0 0 8px ${color}60` }}>
              <AnimatedValue value={value} />
            </span>
            <span className="font-mono text-[10px] text-aether-dim">{unit}</span>
          </div>
        </div>
        {/* Sparkline */}
        <div className="flex-shrink-0 mt-3">
          <Sparkline data={sparkData} color={color} />
        </div>
      </div>
      {/* Progress bar */}
      <div className="mt-2.5 h-[2px] bg-aether-border/20 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}60)`, boxShadow: `0 0 6px ${color}40` }}
          initial={{ width: '0%' }}
          animate={{ width: `${Math.min((parseFloat(value) / (unit === '%' || unit === 'pf' ? 100 : 3000)) * 100, 100)}%` }}
          transition={{ delay: delay + 0.3, duration: 1.2, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  )
}

export default function TelemetryHUD({ telemetry, aiMode }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Generate mock sparkline data
  const spark = (base, variance, len = 12) =>
    Array.from({ length: len }, () => base + (Math.random() - 0.5) * variance * 2)

  return (
    <div className="space-y-3 h-full flex flex-col">
      {/* Header */}
      <div className="glass-panel p-3.5 flex items-center justify-between">
        <div>
          <h2 className="font-orbitron text-[11px] font-bold tracking-[3px] text-aether-cyan glow-cyan">
            TELEMETRY
          </h2>
          <p className="font-mono text-[8px] text-aether-dim mt-0.5 tracking-wider">REAL-TIME GRID MONITORING</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aether-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-aether-green" />
            </span>
            <span className="font-mono text-[8px] text-aether-green tracking-[2px]">LIVE</span>
          </div>
          <p className="font-mono text-[10px] text-aether-dim mt-0.5">
            {time.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false })} IST
          </p>
        </div>
      </div>

      {/* Metrics */}
      <MetricCard label="GRID LOAD" value={telemetry.gridLoad} unit="MW" icon="⚡" color="#3b82f6"
        sparkData={spark(847, 50)} delay={0.3} />
      <MetricCard label="STORAGE CAPACITY" value={telemetry.storage} unit="MWh" icon="🔋" color="#00ff88"
        sparkData={spark(2341, 100)} delay={0.4} />
      <MetricCard label="SYSTEM EFFICIENCY" value={telemetry.efficiency} unit="%" icon="📊" color="#00f0ff"
        sparkData={spark(94, 3)} delay={0.5} />
      <MetricCard label="VOLTAGE" value={telemetry.voltage} unit="V" icon="⚡" color="#ffd700"
        sparkData={spark(220, 8)} delay={0.6} />
      <MetricCard label="POWER FACTOR" value={telemetry.powerFactor} unit="pf" icon="〰️" color="#a855f7"
        sparkData={spark(0.96, 0.03)} delay={0.7} />

      {/* System Status */}
      <motion.div
        className={`glass-panel p-3.5 mt-auto ${aiMode ? 'border-aether-cyan/20' : 'border-aether-green/15'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            aiMode ? 'bg-aether-cyan/10 border border-aether-cyan/25' : 'bg-aether-green/10 border border-aether-green/25'
          }`}>
            <span className={`w-3 h-3 rounded-full ${aiMode ? 'bg-aether-cyan animate-pulse-glow' : 'bg-aether-green'}`}
              style={{ boxShadow: aiMode ? '0 0 12px rgba(0,240,255,0.6)' : '0 0 8px rgba(0,255,136,0.5)' }} />
          </div>
          <div>
            <p className="font-mono text-[8px] text-aether-dim tracking-wider">System Status</p>
            <p className={`font-orbitron text-[12px] font-bold ${aiMode ? 'text-aether-cyan glow-cyan' : 'text-aether-green glow-green'}`}>
              {aiMode ? 'AI CORE ACTIVE' : 'ALL SYSTEMS NOMINAL'}
            </p>
            <p className="font-mono text-[8px] text-aether-dim mt-0.5">
              FREQ: {telemetry.frequency} Hz · LOAD: {((telemetry.gridLoad / 1000) * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
