import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Trash2, Clock, AlertTriangle } from "lucide-react"
import FaceCanvas from "@/components/FaceCanvas"
import Toast from "@/components/Toast"
import { useStore } from "@/store/useStore"
import type { StudentPoint, LayerOption } from "@/types"
import { LAYER_LABELS, SIDE_LABELS } from "@/types"

function isPointInDangerZone(px: number, py: number, zones: { cx: number; cy: number; rx: number; ry: number }[]): boolean {
  return zones.some(z => ((px - z.cx) / z.rx) ** 2 + ((py - z.cy) / z.ry) ** 2 <= 1)
}

function AngleIndicator({ angle }: { angle: number }) {
  const rad = (angle * Math.PI) / 180
  const len = 16
  const ex = len * Math.cos(rad)
  const ey = -len * Math.sin(rad)
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className="inline-block ml-1 align-middle">
      <line x1="2" y1="18" x2="18" y2="18" stroke="#94a3b8" strokeWidth="1" />
      <line x1="2" y1="18" x2={2 + ex} y2={18 + ey} stroke="#0F766E" strokeWidth="1.5" />
      {angle > 0 && (
        <path
          d={`M2,18 L${2 + 10 * Math.cos(rad * 0.5)},${18 - 10 * Math.sin(rad * 0.5)} A10,10 0 0,0 12,18`}
          fill="rgba(15,118,110,0.15)"
          stroke="none"
        />
      )}
    </svg>
  )
}

export default function CanvasPage() {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()
  const { getCaseById, addSubmission, currentUser } = useStore()
  const caseData = getCaseById(caseId!)

  const [points, setPoints] = useState<StudentPoint[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [toastMsg, setToastMsg] = useState("")
  const [toastVisible, setToastVisible] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
  }

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg)
    setToastVisible(true)
  }, [])

  const handleAddPoint = useCallback(
    (x: number, y: number) => {
      if (!caseData) return
      const id = `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      const newPt: StudentPoint = { id, x, y, side: "bilateral", leftDose: 0, rightDose: 0, layer: "intramuscular", angle: 90 }
      setPoints(prev => [...prev, newPt])
      setSelectedId(id)
      if (isPointInDangerZone(x, y, caseData.dangerZones)) {
        const zone = caseData.dangerZones.find(z => ((x - z.cx) / z.rx) ** 2 + ((y - z.cy) / z.ry) ** 2 <= 1)
        showToast(`⚠ 该点位于${zone?.name ?? "危险区"}：${zone?.warning ?? "请谨慎操作"}`)
      }
    },
    [caseData, showToast]
  )

  const handleMovePoint = useCallback((id: string, x: number, y: number) => {
    setPoints(prev => prev.map(p => (p.id === id ? { ...p, x, y } : p)))
  }, [])

  const updatePoint = useCallback((id: string, patch: Partial<StudentPoint>) => {
    setPoints(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)))
  }, [])

  const deletePoint = useCallback((id: string) => {
    setPoints(prev => prev.filter(p => p.id !== id))
    if (selectedId === id) setSelectedId(null)
  }, [selectedId])

  const handleSubmit = () => {
    const incomplete = points.find(p => !p.leftDose || !p.rightDose || p.angle == null || !p.layer)
    if (incomplete) {
      showToast("请填写所有点位的剂量、层次和角度")
      return
    }
    setShowConfirm(true)
  }

  const confirmSubmit = () => {
    const submissionId = Date.now().toString()
    addSubmission({
      id: submissionId,
      caseId: caseId!,
      studentId: currentUser?.id ?? "",
      studentName: currentUser?.name ?? "",
      points,
      submittedAt: new Date().toISOString(),
      adjustedReasons: [],
      bookmarked: false,
      notes: "",
      status: "submitted",
    })
    navigate(`/compare/${submissionId}`)
  }

  if (!caseData) return <div className="p-8 text-center text-gray-500">案例不存在</div>

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col">
      <header className="bg-[#0F766E] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <h1 className="text-lg font-bold tracking-wide">{caseData.name}</h1>
        <div className="flex items-center gap-2 text-teal-100 text-sm">
          <Clock className="w-4 h-4" />
          <span className="font-mono">{fmt(elapsed)}</span>
        </div>
        <button onClick={handleSubmit} className="px-5 py-1.5 bg-[#F97066] hover:bg-[#E05A50] text-white rounded-lg text-sm font-semibold transition-all active:scale-95">
          提交
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-4">
          <FaceCanvas
            points={points.map(p => ({ id: p.id, x: p.x, y: p.y }))}
            dangerZones={caseData.dangerZones.map(z => ({ id: z.id, cx: z.cx, cy: z.cy, rx: z.rx, ry: z.ry, name: z.name }))}
            selectedPointId={selectedId}
            onAddPoint={handleAddPoint}
            onMovePoint={handleMovePoint}
            onSelectPoint={setSelectedId}
          />
        </div>

        <aside className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-[#0F766E]">点位列表 ({points.length})</h2>
          </div>
          {points.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">点击面部添加注射点</div>
          )}
          <div className="flex-1 overflow-y-auto">
            {points.map((pt, idx) => (
              <div
                key={pt.id}
                onClick={() => setSelectedId(pt.id)}
                className={`px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors ${selectedId === pt.id ? "bg-teal-50 border-l-2 border-l-[#0F766E]" : "hover:bg-gray-50"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-[#0F766E]">点位 {idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">({Math.round(pt.x)}, {Math.round(pt.y)})</span>
                    <button onClick={e => { e.stopPropagation(); deletePoint(pt.id) }} className="p-1 text-gray-400 hover:text-[#F97066] transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-500">侧别</label>
                    <select value={pt.side} onChange={e => updatePoint(pt.id, { side: e.target.value as StudentPoint["side"] })} className="w-full mt-0.5 text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0F766E]">
                      {Object.entries(SIDE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">左侧剂量</label>
                      <div className="flex mt-0.5">
                        <input type="number" min={0} value={pt.leftDose || ""} onChange={e => updatePoint(pt.id, { leftDose: Number(e.target.value) })} className="w-full text-sm border border-gray-200 rounded-l px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0F766E]" />
                        <span className="text-xs text-gray-400 border border-l-0 border-gray-200 rounded-r px-1.5 flex items-center">U</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">右侧剂量</label>
                      <div className="flex mt-0.5">
                        <input type="number" min={0} value={pt.rightDose || ""} onChange={e => updatePoint(pt.id, { rightDose: Number(e.target.value) })} className="w-full text-sm border border-gray-200 rounded-l px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0F766E]" />
                        <span className="text-xs text-gray-400 border border-l-0 border-gray-200 rounded-r px-1.5 flex items-center">U</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">注射层次</label>
                    <select value={pt.layer} onChange={e => updatePoint(pt.id, { layer: e.target.value as LayerOption })} className="w-full mt-0.5 text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0F766E]">
                      {(Object.entries(LAYER_LABELS) as [LayerOption, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">进针角度</label>
                    <div className="flex items-center mt-0.5">
                      <input type="number" min={0} max={90} value={pt.angle ?? ""} onChange={e => { const v = Math.min(90, Math.max(0, Number(e.target.value))); updatePoint(pt.id, { angle: v }) }} className="w-20 text-sm border border-gray-200 rounded-l px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0F766E]" />
                      <span className="text-xs text-gray-400 border border-l-0 border-gray-200 rounded-r px-1.5 flex items-center">°</span>
                      <AngleIndicator angle={pt.angle} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <Toast message={toastMsg} type="warning" visible={toastVisible} onClose={() => setToastVisible(false)} />

      {showConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-[#F97066]" />
              <h3 className="text-base font-bold text-gray-800">确认提交</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">共 {points.length} 个点位，提交后将进入评分环节，确认提交？</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors">取消</button>
              <button onClick={confirmSubmit} className="flex-1 py-2 rounded-lg bg-[#0F766E] text-white text-sm font-semibold hover:bg-[#0D6560] transition-colors">确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
