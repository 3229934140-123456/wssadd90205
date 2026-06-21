import { useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Clock, CheckCircle, PenLine } from "lucide-react"
import FaceCanvas from "@/components/FaceCanvas"
import { useStore } from "@/store/useStore"
import type { Annotation, Suggestion, TeacherReview, PointDiffStatus } from "@/types"

export default function Review() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const navigate = useNavigate()
  const { getSubmissionById, getCaseById, addReview, currentUser, compareSubmission } = useStore()

  const submission = getSubmissionById(submissionId!)
  const caseData = submission ? getCaseById(submission.caseId) : undefined
  const diffs = submission ? compareSubmission(submission) : []
  const isTeacher = currentUser?.role === "teacher"

  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [annotationMode, setAnnotationMode] = useState(false)

  const diffStatuses = new Map<string, PointDiffStatus>()
  diffs.forEach(d => diffStatuses.set(d.studentPoint.id, d.status))

  const handleDrawAnnotation = useCallback(
    (cx: number, cy: number, radius: number) => {
      if (!annotationMode) return
      const id = `ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      const n = annotations.length + 1
      const ann: Annotation = { id, cx, cy, radius, label: `#${n}` }
      setAnnotations(prev => [...prev, ann])
      setSuggestions(prev => [...prev, { annotationId: id, text: "" }])
    },
    [annotationMode, annotations.length]
  )

  const updateSuggestion = useCallback((annotationId: string, text: string) => {
    setSuggestions(prev => prev.map(s => (s.annotationId === annotationId ? { ...s, text } : s)))
  }, [])

  const handleSubmitReview = useCallback(() => {
    if (!currentUser || !submissionId) return
    const emptySuggestion = suggestions.find(s => !s.text.trim())
    if (emptySuggestion) return
    const review: TeacherReview = {
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      annotations,
      suggestions,
      reviewedAt: new Date().toISOString(),
    }
    addReview(submissionId, review)
    navigate("/profile")
  }, [currentUser, submissionId, annotations, suggestions, addReview, navigate])

  if (!submission || !caseData) {
    return <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center text-gray-500">提交记录不存在</div>
  }

  const canvasPoints = submission.points.map(p => ({ id: p.id, x: p.x, y: p.y }))
  const standardPts = caseData.standardPoints.map(p => ({ id: p.id, x: p.x, y: p.y }))
  const teacherAnnotations = isTeacher ? annotations : submission.review?.annotations ?? []

  const statusLabel: Record<string, string> = { correct: "正确", offset: "偏移", error: "错误" }
  const statusColor: Record<string, string> = { correct: "text-green-600", offset: "text-yellow-600", error: "text-red-600" }

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col">
      <header className="bg-[#0F766E] text-white px-4 py-3 shadow-md">
        <h1 className="text-lg font-bold tracking-wide">老师点评</h1>
        <div className="text-teal-100 text-sm mt-1">
          {submission.studentName} · {caseData.name} · {new Date(submission.submittedAt).toLocaleDateString()}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-4 gap-3">
          <FaceCanvas
            points={canvasPoints}
            standardPoints={standardPts}
            diffStatuses={diffStatuses}
            annotations={teacherAnnotations}
            readOnly
            showLabels
          />
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />标准点</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-600 inline-block" />正确</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />偏移</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />错误</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-blue-500 inline-block" />批注</span>
          </div>

          {isTeacher && (
            <button
              onClick={() => setAnnotationMode(m => !m)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                annotationMode ? "bg-[#F97066] text-white" : "bg-white text-[#0F766E] border border-[#0F766E]"
              }`}
            >
              {annotationMode ? "退出批注模式" : "添加批注"}
            </button>
          )}

          {isTeacher && annotationMode && (
            <p className="text-xs text-gray-500">点击面部添加圆形批注</p>
          )}
        </div>

        <aside className="w-96 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-[#0F766E]">点位对比 ({diffs.length})</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-500 font-medium">#</th>
                  <th className="px-3 py-2 text-left text-gray-500 font-medium">状态</th>
                  <th className="px-3 py-2 text-left text-gray-500 font-medium">关键问题</th>
                </tr>
              </thead>
              <tbody>
                {diffs.map((d, i) => (
                  <tr key={d.studentPoint.id} className="border-b border-gray-50">
                    <td className="px-3 py-2 font-semibold text-gray-700">{i + 1}</td>
                    <td className={`px-3 py-2 font-semibold ${statusColor[d.status]}`}>{statusLabel[d.status]}</td>
                    <td className="px-3 py-2 text-gray-600">
                      {d.inDangerZone && "⚠ 危险区 "}
                      {!d.layerMatch && "层次错误 "}
                      {(d.doseDiff ?? 0) > 0 && `剂量差${d.doseDiff}U `}
                      {(d.angleDiff ?? 0) > 10 && `角度差${d.angleDiff}°`}
                      {d.status === "correct" && "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isTeacher && annotations.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-3">
              <h3 className="text-sm font-bold text-[#0F766E] mb-2">建议</h3>
              <div className="space-y-2">
                {annotations.map((ann, i) => (
                  <div key={ann.id}>
                    <label className="text-xs text-gray-500 block mb-0.5">建议 #{i + 1}:</label>
                    <input
                      type="text"
                      value={suggestions.find(s => s.annotationId === ann.id)?.text ?? ""}
                      onChange={e => updateSuggestion(ann.id, e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                      placeholder="输入建议..."
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {isTeacher && annotations.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100">
              <button
                onClick={handleSubmitReview}
                className="w-full py-2.5 bg-[#0F766E] hover:bg-[#0D6560] text-white rounded-lg text-sm font-semibold transition-all active:scale-95"
              >
                提交点评
              </button>
            </div>
          )}

          {!isTeacher && submission.review && (
            <div className="border-t border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-bold text-[#0F766E]">老师点评</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                  <CheckCircle className="w-3 h-3" />已读
                </span>
              </div>
              <div className="space-y-2">
                {submission.review.suggestions.map((s, i) => (
                  <div key={s.annotationId} className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <div className="text-xs text-blue-500 font-semibold mb-1">批注 #{i + 1}</div>
                    <p className="text-sm text-gray-700">{s.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full py-2.5 bg-[#0F766E] hover:bg-[#0D6560] text-white rounded-lg text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <PenLine className="w-4 h-4" />写复盘笔记
                </button>
              </div>
            </div>
          )}

          {!isTeacher && !submission.review && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400">
              <Clock className="w-10 h-10 mb-3 animate-pulse" />
              <p className="text-sm">等待老师点评...</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
