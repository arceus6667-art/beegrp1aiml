import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

/* ═══════════════════════════════════════════════════════════
   AETHER-GRID  ·  SYSTEM INITIALIZATION PRELOADER
   "cinematic transition, smooth UI reveal, Apple-level animation quality, premium product experience"
   ═══════════════════════════════════════════════════════════ */

const NODES = [
  { id: 'R1', type: 'resistor', label: 'R', x: 200, y: 200, color: '#ff6b2b' },
  { id: 'C1', type: 'capacitor', label: 'C', x: 400, y: 150, color: '#00f0ff' },
  { id: 'L1', type: 'inductor', label: 'L', x: 600, y: 200, color: '#a855f7' },
  { id: 'D1', type: 'diode', label: 'D', x: 500, y: 350, color: '#00ff88' },
  { id: 'R2', type: 'resistor', label: 'R', x: 300, y: 350, color: '#ff6b2b' },
]

const PATHS = [
  { from: 'R1', to: 'C1' },
  { from: 'C1', to: 'L1' },
  { from: 'L1', to: 'D1' },
  { from: 'D1', to: 'R2' },
  { from: 'R2', to: 'R1' },
]

export default function SystemPreloader({ onComplete }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const text1Ref = useRef(null)
  const text2Ref = useRef(null)
  const centerSphereRef = useRef(null)
  const whiteFlashRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let w, h, animId, startTime
    let particles = []

    function resize() {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Scaling helpers
    const tx = (x) => (x - 400) * (Math.min(w, h) / 600) + w / 2
    const ty = (y) => (y - 250) * (Math.min(w, h) / 600) + h / 2

    // Helper to spawn energy pulses (Scene 2)
    function spawnParticle() {
      const path = PATHS[Math.floor(Math.random() * PATHS.length)]
      const from = NODES.find(n => n.id === path.from)
      const to = NODES.find(n => n.id === path.to)
      if (!from || !to) return
      particles.push({
        x: tx(from.x), y: ty(from.y),
        toX: tx(to.x), toY: ty(to.y),
        progress: 0,
        speed: 0.02 + Math.random() * 0.015,
        size: 2 + Math.random() * 3,
        opacity: 0.8 + Math.random() * 0.2,
      })
    }

    // Helper to draw nodes
    function drawNode(node, elapsed) {
      const x = tx(node.x), y = ty(node.y)
      const size = 20

      // Scene 2 component light up
      let intensity = 0
      if (elapsed > 2 && elapsed < 4) {
        intensity = Math.min((elapsed - 2) * 2, 1)
      } else if (elapsed >= 4) {
        intensity = Math.max(1 - (elapsed - 4) * 2, 0) // Fade out nodes as energy converges
      }

      ctx.save()
      ctx.translate(x, y)
      
      // Node glow
      if (intensity > 0) {
        const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 3)
        glowGrad.addColorStop(0, node.color + Math.floor(intensity * 100).toString(16).padStart(2, '0'))
        glowGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = glowGrad
        ctx.fillRect(-size * 3, -size * 3, size * 6, size * 6)
      }

      // Draw component
      ctx.strokeStyle = node.color
      ctx.lineWidth = 2
      ctx.globalAlpha = Math.max(0.2, intensity)
      
      if (node.type === 'resistor') {
        ctx.beginPath()
        ctx.moveTo(-size, 0)
        for (let i = 0; i < 6; i++) ctx.lineTo(-size + (i + 0.5) * (size * 2 / 6), i % 2 === 0 ? -8 : 8)
        ctx.lineTo(size, 0)
        ctx.stroke()
      } else if (node.type === 'capacitor') {
        ctx.beginPath(); ctx.moveTo(-5, -12); ctx.lineTo(-5, 12); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(5, -12); ctx.lineTo(5, 12); ctx.stroke()
      } else if (node.type === 'inductor') {
        ctx.beginPath()
        for (let i = 0; i < 4; i++) ctx.arc(-12 + i * 8, 0, 4, Math.PI, 0)
        ctx.stroke()
      } else if (node.type === 'diode') {
        ctx.beginPath()
        ctx.moveTo(-8, -8); ctx.lineTo(8, 0); ctx.lineTo(-8, 8); ctx.closePath()
        ctx.stroke()
        ctx.beginPath(); ctx.moveTo(8, -8); ctx.lineTo(8, 8); ctx.stroke()
      }
      ctx.restore()
    }

    // Main animation loop
    function animate(timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = (timestamp - startTime) / 1000

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#03050a'
      ctx.fillRect(0, 0, w, h)

      // Scene 1 & 2: Draw paths
      if (elapsed < 5) {
        PATHS.forEach(p => {
          const from = NODES.find(n => n.id === p.from)
          const to = NODES.find(n => n.id === p.to)
          const x1 = tx(from.x), y1 = ty(from.y)
          const x2 = tx(to.x), y2 = ty(to.y)

          ctx.strokeStyle = 'rgba(0,240,255,0.1)'
          ctx.lineWidth = 1
          
          // Thin neon lines appear
          if (elapsed < 2) {
            ctx.setLineDash([Math.max(0, elapsed * 100), 1000])
          } else {
            ctx.setLineDash([])
          }

          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
        })
      }

      // Draw Nodes
      if (elapsed < 5) {
        NODES.forEach(n => drawNode(n, elapsed))
      }

      // Scene 2: Energy pulses
      if (elapsed > 2 && elapsed < 4.5) {
        if (Math.random() < 0.2) spawnParticle()
      }

      // Update and draw particles
      particles = particles.filter(p => {
        p.progress += p.speed
        return p.progress <= 1
      })

      particles.forEach(p => {
        const x = p.x + (p.toX - p.x) * p.progress
        const y = p.y + (p.toY - p.y) * p.progress
        
        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 240, 255, ${p.opacity})`
        ctx.shadowBlur = 10
        ctx.shadowColor = '#00f0ff'
        ctx.fill()
        ctx.shadowBlur = 0
      })

      // Scene 3: Energy converges to center
      if (elapsed > 4 && elapsed < 6) {
        const convergenceProgress = (elapsed - 4) / 2
        
        // Draw lines from nodes to center
        NODES.forEach(node => {
          ctx.beginPath()
          ctx.moveTo(tx(node.x), ty(node.y))
          ctx.lineTo(w / 2, h / 2)
          ctx.strokeStyle = `rgba(0, 240, 255, ${Math.max(0, 0.5 - convergenceProgress)})`
          ctx.lineWidth = 1 + convergenceProgress * 2
          ctx.stroke()
        })
      }

      animId = requestAnimationFrame(animate)
    }
    
    animId = requestAnimationFrame(animate)

    // Master GSAP Timeline for the cinematic sequence
    const tl = gsap.timeline({
      onComplete: () => {
        cancelAnimationFrame(animId)
        if (onComplete) onComplete()
      }
    })

    // Scene 2 Text Reveal (2s - 4s)
    tl.to(text1Ref.current, { opacity: 1, y: -10, duration: 0.5, ease: "power2.out" }, 2)
      .to(text1Ref.current, { opacity: 0, y: -20, duration: 0.5, ease: "power2.in" }, 3)
      .to(text2Ref.current, { opacity: 1, y: -10, duration: 0.5, ease: "power2.out" }, 3)
      .to(text2Ref.current, { opacity: 0, y: -20, duration: 0.5, ease: "power2.in" }, 4)

    // Scene 3: Glowing Sphere Forms (4s - 6s)
    tl.to(centerSphereRef.current, { scale: 1, opacity: 1, duration: 1.5, ease: "expo.out" }, 4)
      .to(centerSphereRef.current, { boxShadow: "0 0 100px 50px rgba(0, 240, 255, 0.8)", duration: 0.5, repeat: 1, yoyo: true }, 5)

    // Scene 4: Sphere explodes into white light, smooth fade to UI
    tl.to(centerSphereRef.current, { scale: 50, opacity: 0, duration: 0.8, ease: "power4.in" }, 6)
      .to(whiteFlashRef.current, { opacity: 1, duration: 0.5, ease: "power2.inOut" }, 6.2)
      .to(containerRef.current, { opacity: 0, duration: 0.8, ease: "power2.inOut" }, 6.7)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      tl.kill()
    }
  }, [onComplete])

  return (
    <div ref={containerRef} className="circuit-canvas" style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: '#03050a' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Scene 2 Text */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <h2 ref={text1Ref} className="font-orbitron tracking-[4px]" style={{ color: '#00f0ff', opacity: 0, textShadow: '0 0 20px rgba(0,240,255,0.8)', position: 'absolute', fontSize: '1.5rem' }}>
          Initializing Energy Network...
        </h2>
        <h2 ref={text2Ref} className="font-orbitron tracking-[4px]" style={{ color: '#00ff88', opacity: 0, textShadow: '0 0 20px rgba(0,255,136,0.8)', position: 'absolute', fontSize: '1.5rem' }}>
          Calibrating Systems...
        </h2>
      </div>

      {/* Scene 3 Center Sphere */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div 
          ref={centerSphereRef}
          style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, #ffffff 0%, #00f0ff 40%, transparent 80%)',
            boxShadow: '0 0 40px 10px rgba(0,240,255,0.6)',
            opacity: 0,
            transform: 'scale(0)'
          }}
        />
      </div>

      {/* Scene 4 White Flash */}
      <div 
        ref={whiteFlashRef}
        style={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundColor: '#ffffff', 
          opacity: 0, 
          pointerEvents: 'none',
          zIndex: 10000 
        }} 
      />
    </div>
  )
}
