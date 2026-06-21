import { useRef, useCallback } from "react"

interface CanvasPoint {
  id: string
  x: number
  y: number
}

interface DangerZone {
  id: string
  cx: number
  cy: number
  rx: number
  ry: number
  name: string
}

interface StandardPoint {
  id: string
  x: number
  y: number
}

interface Annotation {
  id: string
  cx: number
  cy: number
  radius: number
  label: string
}

interface FaceCanvasProps {
  points: CanvasPoint[]
  dangerZones?: DangerZone[]
  standardPoints?: StandardPoint[]
  selectedPointId?: string | null
  onAddPoint?: (x: number, y: number) => void
  onMovePoint?: (id: string, x: number, y: number) => void
  onSelectPoint?: (id: string | null) => void
  readOnly?: boolean
  showLabels?: boolean
  diffStatuses?: Map<string, "correct" | "offset" | "error">
  annotations?: Annotation[]
  onDrawAnnotation?: (cx: number, cy: number, radius: number) => void
}

const DIFF_COLORS: Record<string, string> = {
  correct: "#22c55e",
  offset: "#eab308",
  error: "#ef4444",
}

function FaceOutline() {
  return (
    <g>
      <ellipse cx={150} cy={170} rx={90} ry={115} fill="#FFF5F0" stroke="#1E293B" strokeWidth={1.2} />
      <ellipse cx={115} cy={148} rx={13} ry={7} fill="none" stroke="#1E293B" strokeWidth={1} />
      <ellipse cx={185} cy={148} rx={13} ry={7} fill="none" stroke="#1E293B" strokeWidth={1} />
      <circle cx={115} cy={148} r={3} fill="#1E293B" />
      <circle cx={185} cy={148} r={3} fill="#1E293B" />
      <path
        d="M103 132 Q115 125 127 132"
        fill="none"
        stroke="#1E293B"
        strokeWidth={1}
      />
      <path
        d="M173 132 Q185 125 197 132"
        fill="none"
        stroke="#1E293B"
        strokeWidth={1}
      />
      <path
        d="M150 158 L146 185 Q150 190 154 185 Z"
        fill="none"
        stroke="#1E293B"
        strokeWidth={0.8}
      />
      <path
        d="M130 218 Q150 230 170 218"
        fill="none"
        stroke="#1E293B"
        strokeWidth={1}
      />
      <path
        d="M60 120 Q55 165 60 210 Q63 225 72 218"
        fill="none"
        stroke="#1E293B"
        strokeWidth={1}
      />
      <path
        d="M240 120 Q245 165 240 210 Q237 225 228 218"
        fill="none"
        stroke="#1E293B"
        strokeWidth={1}
      />
      <path
        d="M60 120 Q80 58 150 45 Q220 58 240 120"
        fill="none"
        stroke="#1E293B"
        strokeWidth={1}
      />
    </g>
  )
}

export default function FaceCanvas({
  points,
  dangerZones,
  standardPoints,
  selectedPointId,
  onAddPoint,
  onMovePoint,
  onSelectPoint,
  readOnly = false,
  showLabels = true,
  diffStatuses,
  annotations,
  onDrawAnnotation,
}: FaceCanvasProps) {
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const getSvgCoords = useCallback(
    (e: React.MouseEvent<SVGSVGElement> | MouseEvent) => {
      const svg = svgRef.current
      if (!svg) return { x: 0, y: 0 }
      const rect = svg.getBoundingClientRect()
      const scaleX = 300 / rect.width
      const scaleY = 340 / rect.height
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      }
    },
    []
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (readOnly) return
      const target = e.target as SVGElement
      const pointEl = target.closest("[data-point-id]")
      if (pointEl) {
        const id = pointEl.getAttribute("data-point-id")!
        const pt = points.find((p) => p.id === id)
        if (pt) {
          const coords = getSvgCoords(e)
          dragRef.current = { id, offsetX: coords.x - pt.x, offsetY: coords.y - pt.y }
          onSelectPoint?.(id)
        }
      } else {
        const coords = getSvgCoords(e)
        const hitZone = dangerZones?.some(
          (dz) =>
            ((coords.x - dz.cx) / dz.rx) ** 2 + ((coords.y - dz.cy) / dz.ry) ** 2 <= 1
        )
        if (!hitZone) {
          onAddPoint?.(coords.x, coords.y)
        }
        onSelectPoint?.(null)
      }
    },
    [readOnly, points, dangerZones, onAddPoint, onSelectPoint, getSvgCoords]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!dragRef.current || readOnly) return
      const coords = getSvgCoords(e)
      const x = Math.max(0, Math.min(300, coords.x - dragRef.current.offsetX))
      const y = Math.max(0, Math.min(340, coords.y - dragRef.current.offsetY))
      onMovePoint?.(dragRef.current.id, x, y)
    },
    [readOnly, onMovePoint, getSvgCoords]
  )

  const handleMouseUp = useCallback(() => {
    dragRef.current = null
  }, [])

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 300 340"
      className="w-full max-w-[400px] select-none rounded-lg border border-gray-200 bg-white"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: readOnly ? "default" : "crosshair" }}
    >
      <FaceOutline />

      {dangerZones?.map((dz) => (
        <g key={dz.id}>
          <ellipse
            cx={dz.cx}
            cy={dz.cy}
            rx={dz.rx}
            ry={dz.ry}
            fill="rgba(239,68,68,0.12)"
            stroke="rgba(239,68,68,0.5)"
            strokeWidth={1}
            strokeDasharray="4 2"
          />
          <text
            x={dz.cx}
            y={dz.cy - dz.ry - 4}
            textAnchor="middle"
            fontSize={9}
            fill="#ef4444"
            fontWeight={500}
          >
            {dz.name}
          </text>
        </g>
      ))}

      {standardPoints?.map((sp) => (
        <g key={sp.id}>
          <circle cx={sp.x} cy={sp.y} r={6} fill="rgba(34,197,94,0.3)" stroke="#22c55e" strokeWidth={1.5} />
        </g>
      ))}

      {points.map((pt, idx) => {
        const diffColor = diffStatuses?.get(pt.id)
        const fill = diffColor ? DIFF_COLORS[diffColor] : "#0F766E"
        const isSelected = pt.id === selectedPointId

        return (
          <g key={pt.id} data-point-id={pt.id}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={isSelected ? 10 : 8}
              fill={fill}
              fillOpacity={0.85}
              stroke={isSelected ? "#F97066" : "#fff"}
              strokeWidth={isSelected ? 2.5 : 1.5}
            />
            {showLabels && (
              <text
                x={pt.x}
                y={pt.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={9}
                fill="#fff"
                fontWeight={700}
              >
                {idx + 1}
              </text>
            )}
          </g>
        )
      })}

      {annotations?.map((ann) => (
        <g key={ann.id}>
          <circle
            cx={ann.cx}
            cy={ann.cy}
            r={ann.radius}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={1.5}
            strokeDasharray="5 3"
          />
          <text
            x={ann.cx}
            y={ann.cy - ann.radius - 5}
            textAnchor="middle"
            fontSize={9}
            fill="#3b82f6"
            fontWeight={600}
          >
            {ann.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
