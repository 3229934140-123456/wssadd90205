import { useState } from "react"
import { useParams } from "react-router-dom"
import { ArrowLeft, CheckCircle, AlertCircle, XCircle, Send } from "lucide-react"
import FaceCanvas from "@/components/FaceCanvas"
import { useStore } from "@/store/useStore"
import { LAYER_LABELS, SIDE_LABELS } from "@/types"
import type { PointDiff, AdjustedReason } from "@/types"

const STATUS_BG: Record<string, string> = {
  correct: "bg-green-50",
  offset: "bg-yellow-50",
  error: "bg-red-50",
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  correct: <CheckCircle className="w-4 h-4 text-green-600" />,
  offset: <AlertCircle className="w-4 h-4 text-yellow-600" />,
  error: <XCircle className="w-4 h-4 text-red-600" />,
}

const STATUS_LABEL: Record<string, string> = {
  correct: "正确",
  offset: "偏移",
  error: "错误",
}

export default function Compare() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const { getSubmissionById, getCaseById, compareSubmission, updateAdjustedReasons } = useStore()

  const submission = getSubmissionById(submissionId!)
  const caseData = submission ? getCaseById(submission.caseId) : undefined
  const diffs: PointDiff[] = submission ? compareSubmission(submission) : []

  const [reasons, setReasons] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    submission?.adjustedReasons.forEach(r => { init[r.pointId] = r.reason })
    return init
  })
  const [submitted, setSubmitted] = useState(false)

  if (!submission || !caseData) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <p className="text-gray-500 text-lg">未找到提交记录</p>
      </div>
    )
  }

  const diffStatuses = new Map<string, "correct" | "offset" | "error">()
  diffs.forEach(d => diffStatuses.set(d.studentPoint.id, d.status))

  const standardPoints = caseData.standardPoints.map(p => ({ id: p.id, x: p.x, y: p.y }))

  const canvasPoints = diffs.map(d => ({ id: d.studentPoint.id, x: d.studentPoint.x, y: d.studentPoint.y }))

  const dangerZones = caseData.dangerZones.map(z => ({
    id: z.id, cx: z.cx, cy: z.cy, rx: z.rx, ry: z.ry, name: z.name,
  }))

  const handleSubmitReasons = () => {
    const adjusted: AdjustedReason[] = Object.entries(reasons)
      .filter(([, v]) => v.trim())
      .map(([pointId, reason]) => ({ pointId, reason }))
    updateAdjustedReasons(submission.id, adjusted)
    setSubmitted(true)
  }

  const notCorrectDiffs = diffs.filter(d => d.status !== "correct")

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col">
      <header className="bg-[#0F766E] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => history.back()} className="p-1 hover:bg-teal-700 rounded transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-wide">答案对比</h1>
            <p className="text-teal-200 text-xs">{caseData.name} · {new Date(submission.submittedAt).toLocaleString()}</p>
          </div>
        </div>
        {submission.score && (
          <div className="bg-white/15 backdrop-blur rounded-lg px-4 py-2 text-sm">
            <div className="font-bold text-base">{submission.score.total}分</div>
            <div className="flex gap-3 text-teal-200 text-xs mt-0.5">
              <span>定位{submission.score.pointAccuracy}</span>
              <span>剂量{submission.score.doseReasonable}</span>
              <span>层次{submission.score.layerCorrect}</span>
              <span>安全{submission.score.safetyAwareness}</span>
            </div>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <section className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-bold text-[#0F766E] mb-3">可视化对比</h2>
          <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> 正确</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" /> 偏移</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> 错误</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500 inline-block" /> 标准点</span>
          </div>
          <div className="flex justify-center">
            <FaceCanvas
              points={canvasPoints}
              dangerZones={dangerZones}
              standardPoints={standardPoints}
              diffStatuses={diffStatuses}
              readOnly
              showLabels
            />
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-4 overflow-x-auto">
          <h2 className="text-sm font-bold text-[#0F766E] mb-3">剂量对比</h2>
          <table className="w-full text-sm border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs">
                <th className="py-2 px-2 text-left">点位编号</th>
                <th className="py-2 px-2 text-left">侧别</th>
                <th className="py-2 px-2 text-right">学员剂量</th>
                <th className="py-2 px-2 text-right">标准剂量</th>
                <th className="py-2 px-2 text-right">偏差%</th>
                <th className="py-2 px-2 text-left">注射层次</th>
                <th className="py-2 px-2 text-center">层次匹配</th>
                <th className="py-2 px-2 text-right">进针角度</th>
                <th className="py-2 px-2 text-right">角度偏差</th>
                <th className="py-2 px-2 text-center">状态</th>
              </tr>
            </thead>
            <tbody>
              {diffs.map((d, i) => {
                const sp = d.studentPoint
                const std = d.standardPoint
                const doseDiffPct = std && std.dose > 0
                  ? Math.round(Math.abs(sp.leftDose - std.dose) / std.dose * 100)
                  : null
                return (
                  <tr key={sp.id} className={`border-b border-gray-100 ${STATUS_BG[d.status]}`}>
                    <td className="py-2 px-2 font-medium text-gray-700">#{i + 1}</td>
                    <td className="py-2 px-2 text-gray-600">{SIDE_LABELS[sp.side] ?? sp.side}</td>
                    <td className="py-2 px-2 text-right text-gray-800">{sp.leftDose}U</td>
                    <td className="py-2 px-2 text-right text-gray-500">{std ? `${std.dose}U` : "-"}</td>
                    <td className={`py-2 px-2 text-right font-medium ${doseDiffPct !== null && doseDiffPct > 20 ? "text-red-600" : "text-gray-600"}`}>
                      {doseDiffPct !== null ? `${doseDiffPct}%` : "-"}
                    </td>
                    <td className="py-2 px-2 text-gray-600">{LAYER_LABELS[sp.layer]}</td>
                    <td className="py-2 px-2 text-center">
                      {d.layerMatch ? <CheckCircle className="w-4 h-4 text-green-600 inline" /> : <XCircle className="w-4 h-4 text-red-500 inline" />}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-600">{sp.angle}°</td>
                    <td className="py-2 px-2 text-right text-gray-600">{d.angleDiff !== undefined ? `${d.angleDiff}°` : "-"}</td>
                    <td className="py-2 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {STATUS_ICON[d.status]}
                        <span className="text-xs">{STATUS_LABEL[d.status]}</span>
                      </div>
                      {d.inDangerZone && (
                        <span className="inline-block mt-0.5 text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded">在危险区!</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

        {notCorrectDiffs.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <h2 className="text-sm font-bold text-[#0F766E] mb-1">调整理由</h2>
            {notCorrectDiffs.map((d, i) => {
              const idx = diffs.indexOf(d) + 1
              return (
                <div key={d.studentPoint.id}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    点位#{idx} 调整理由:
                    {d.inDangerZone && <span className="text-red-600 ml-2">在危险区!</span>}
                  </label>
                  <textarea
                    value={reasons[d.studentPoint.id] ?? ""}
                    onChange={e => setReasons(prev => ({ ...prev, [d.studentPoint.id]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F766E] resize-none"
                    rows={2}
                    placeholder="请输入调整理由..."
                  />
                </div>
              )
            })}
            <button
              onClick={handleSubmitReasons}
              disabled={submitted}
              className="flex items-center gap-2 px-5 py-2 bg-[#0F766E] hover:bg-[#0D6560] disabled:bg-gray-400 text-white rounded-lg text-sm font-semibold transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              {submitted ? "已提交" : "提交调整理由"}
            </button>
          </section>
        )}
      </div>
    </div>
  )
}
