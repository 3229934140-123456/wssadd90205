import { useRef, useEffect } from "react"

interface RadarDataItem {
  label: string
  value: number
}

interface RadarChartProps {
  data: RadarDataItem[]
  size?: number
}

export default function RadarChart({ data, size = 200 }: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length < 3) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, size, size)

    const cx = size / 2
    const cy = size / 2
    const maxRadius = size / 2 - 30
    const n = data.length
    const levels = [25, 50, 75, 100]
    const angleStep = (2 * Math.PI) / n
    const startAngle = -Math.PI / 2

    function getVertex(index: number, radius: number) {
      const angle = startAngle + index * angleStep
      return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      }
    }

    ctx.strokeStyle = "#CBD5E1"
    ctx.lineWidth = 0.5

    for (const level of levels) {
      const r = (level / 100) * maxRadius
      ctx.beginPath()
      for (let i = 0; i <= n; i++) {
        const v = getVertex(i % n, r)
        if (i === 0) ctx.moveTo(v.x, v.y)
        else ctx.lineTo(v.x, v.y)
      }
      ctx.closePath()
      ctx.stroke()
    }

    ctx.strokeStyle = "#E2E8F0"
    ctx.lineWidth = 0.5
    for (let i = 0; i < n; i++) {
      const v = getVertex(i, maxRadius)
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(v.x, v.y)
      ctx.stroke()
    }

    ctx.beginPath()
    for (let i = 0; i <= n; i++) {
      const r = (data[i % n].value / 100) * maxRadius
      const v = getVertex(i % n, r)
      if (i === 0) ctx.moveTo(v.x, v.y)
      else ctx.lineTo(v.x, v.y)
    }
    ctx.closePath()
    ctx.fillStyle = "rgba(15,118,110,0.2)"
    ctx.fill()
    ctx.strokeStyle = "#0F766E"
    ctx.lineWidth = 2
    ctx.stroke()

    for (let i = 0; i < n; i++) {
      const r = (data[i].value / 100) * maxRadius
      const v = getVertex(i, r)
      ctx.beginPath()
      ctx.arc(v.x, v.y, 3, 0, 2 * Math.PI)
      ctx.fillStyle = "#0F766E"
      ctx.fill()
    }

    ctx.fillStyle = "#1E293B"
    ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    for (let i = 0; i < n; i++) {
      const v = getVertex(i, maxRadius + 16)
      ctx.fillText(data[i].label, v.x, v.y)
    }
  }, [data, size])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="rounded-lg"
    />
  )
}
