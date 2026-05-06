import { useRef, useEffect } from 'preact/hooks'

const W = 860
const H = 400

function makeCircle() {
  const r = 3 + Math.random() * 14
  return {
    x: r + Math.random() * (W - r * 2),
    y: r + Math.random() * (H - r * 2),
    r,
    vx: (Math.random() - 0.5) * 2.5,
    vy: (Math.random() - 0.5) * 2.5,
    hue: Math.random() * 360,
  }
}

// quality: 'high' | 'low'
// HIGH — glow + animated hues, full count
// LOW  — pixelated 1/4 scale, muted, 30% of particles

export function Canvas({ quality = 'high', particleCount = 200, visible = true }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    circles: Array.from({ length: 200 }, makeCircle),
    rafId: null,
  })

  // Grow circle pool as particleCount increases
  useEffect(() => {
    const { circles } = stateRef.current
    while (circles.length < particleCount) circles.push(makeCircle())
  }, [particleCount])

  // Keep a mutable ref so the rAF loop always reads the latest value
  const qualityRef = useRef(quality)
  const visibleRef = useRef(visible)
  const countRef   = useRef(particleCount)
  useEffect(() => { qualityRef.current = quality },       [quality])
  useEffect(() => { visibleRef.current = visible },       [visible])
  useEffect(() => { countRef.current   = particleCount }, [particleCount])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const octx = ctx
    const off = canvas

    // const off  = document.createElement('canvas')
    // off.width  = Math.floor(W / 1.2)
    // off.height = Math.floor(H / 1.2)
    // const octx = off.getContext('2d')

    const state = stateRef.current

    function render() {
      const q     = qualityRef.current
      const count = Math.min(countRef.current, state.circles.length)
      const draw  = q === 'low' ? Math.max(8, Math.floor(count * 0.3)) : count

      for (let i = 0; i < count; i++) {
        const c = state.circles[i]
        c.x += c.vx; c.y += c.vy
        if (c.x - c.r < 0)  { c.vx =  Math.abs(c.vx); c.x = c.r }
        if (c.x + c.r > W)  { c.vx = -Math.abs(c.vx); c.x = W - c.r }
        if (c.y - c.r < 0)  { c.vy =  Math.abs(c.vy); c.y = c.r }
        if (c.y + c.r > H)  { c.vy = -Math.abs(c.vy); c.y = H - c.r }
        if (q === 'high') c.hue = (c.hue + 0.3) % 360
      }

      if (q === 'low') {
        const scale = off.width / W
        octx.fillStyle = '#080808'
        octx.fillRect(0, 0, off.width, off.height)
        for (let i = 0; i < draw; i++) {
          const c = state.circles[i]
          octx.beginPath()
          // octx.arc(c.x * scale, c.y * scale, Math.max(1, c.r * scale), 0, Math.PI * 2)
          octx.arc(c.x * scale, c.y * scale, Math.max(1, c.r * scale), 0, Math.PI * 2)

          octx.fillStyle = `hsl(${c.hue},18%,26%)`
          octx.fill()
        }
        // ctx.imageSmoothingEnabled = false
        ctx.drawImage(off, 0, 0, W, H)
        ctx.fillStyle = 'rgba(239,68,68,0.04)'
        ctx.fillRect(0, 0, W, H)
      } else {
        ctx.shadowBlur = 0
        ctx.fillStyle = '#080808'
        ctx.fillRect(0, 0, W, H)
        for (let i = 0; i < draw; i++) {
          const c = state.circles[i]
          ctx.shadowBlur  = 20
          ctx.shadowColor = `hsl(${c.hue},80%,55%)`
          ctx.fillStyle   = `hsl(${c.hue},75%,62%)`
          ctx.beginPath()
          ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.shadowBlur = 0
      }

      // quality indicator bar at bottom
      ctx.fillStyle = q === 'high' ? '#4ade8055' : '#ef444455'
      ctx.fillRect(0, H - 3, W, 3)
    }

    function loop() {
      if (visibleRef.current) render()
      state.rafId = requestAnimationFrame(loop)
    }
    state.rafId = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(state.rafId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{ display: 'block', width: '100%', height: 'auto' }}
    />
  )
}
