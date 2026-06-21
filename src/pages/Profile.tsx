import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { BarChart3, Trophy, Star, Bookmark, ChevronDown, ChevronUp, FileDown, PenLine } from "lucide-react"
import { useStore } from "@/store/useStore"
import RadarChart from "@/components/RadarChart"

export default function Profile() {
  const navigate = useNavigate()
  const currentUser = useStore((s) => s.currentUser)
  const getSubmissionsByStudent = useStore((s) => s.getSubmissionsByStudent)
  const toggleBookmark = useStore((s) => s.toggleBookmark)
  const updateNotes = useStore((s) => s.updateNotes)
  const getCaseById = useStore((s) => s.getCaseById)

  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({})
  const reportRef = useRef<HTMLDivElement>(null)

  if (!currentUser) {
    return <div className="flex h-full items-center justify-center text-gray-400">请先登录</div>
  }

  const submissions = getSubmissionsByStudent(currentUser.id)
  const bookmarked = submissions.filter((s) => s.bookmarked)

  const totalPractices = submissions.length
  const avgScore = totalPractices > 0 ? Math.round(submissions.reduce((a, s) => a + (s.score?.total ?? 0), 0) / totalPractices) : 0
  const maxScore = totalPractices > 0 ? Math.max(...submissions.map((s) => s.score?.total ?? 0)) : 0
  const bookmarkCount = bookmarked.length

  const avgPointAccuracy = totalPractices > 0 ? Math.round(submissions.reduce((a, s) => a + (s.score?.pointAccuracy ?? 0), 0) / totalPractices) : 0
  const avgDoseReasonable = totalPractices > 0 ? Math.round(submissions.reduce((a, s) => a + (s.score?.doseReasonable ?? 0), 0) / totalPractices) : 0
  const avgLayerCorrect = totalPractices > 0 ? Math.round(submissions.reduce((a, s) => a + (s.score?.layerCorrect ?? 0), 0) / totalPractices) : 0
  const avgSafetyAwareness = totalPractices > 0 ? Math.round(submissions.reduce((a, s) => a + (s.score?.safetyAwareness ?? 0), 0) / totalPractices) : 0

  const radarData = [
    { label: "点位准确", value: avgPointAccuracy },
    { label: "剂量合理", value: avgDoseReasonable },
    { label: "层次正确", value: avgLayerCorrect },
    { label: "安全意识", value: avgSafetyAwareness },
  ]

  const sorted = [...submissions].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

  const statusConfig: Record<string, { label: string; cls: string }> = {
    reviewed: { label: "已点评", cls: "bg-teal-100 text-teal-700" },
    adjusted: { label: "待点评", cls: "bg-yellow-100 text-yellow-700" },
    submitted: { label: "已提交", cls: "bg-gray-100 text-gray-500" },
  }

  const handleExport = async () => {
    try {
      const html2canvas = (await import("html2canvas")).default
      const { jsPDF } = await import("jspdf")
      if (!reportRef.current) return
      const canvas = await html2canvas(reportRef.current, { scale: 2 })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = (canvas.height * pdfW) / canvas.width
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH)
      pdf.save("结业报告.pdf")
    } catch {
      alert("导出失败，请确认已安装 html2canvas 和 jspdf 依赖")
    }
  }

  const toggleNote = (id: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const stats = [
    { icon: BarChart3, label: "总练习次数", value: totalPractices, color: "text-[#0F766E]" },
    { icon: BarChart3, label: "平均分", value: avgScore, color: "text-[#0F766E]" },
    { icon: Trophy, label: "最高分", value: maxScore, color: "text-[#F97066]" },
    { icon: Star, label: "已收藏数", value: bookmarkCount, color: "text-yellow-500" },
  ]

  return (
    <div className="min-h-screen bg-[#F0F4F8] px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">成绩档案</h1>
            <p className="mt-1 text-sm text-gray-500">{currentUser.name} 的练习记录与能力评估</p>
          </div>
          <button onClick={handleExport} className="flex items-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0D6B63]">
            <FileDown size={16} /> 导出结业报告
          </button>
        </div>

        <div ref={reportRef} className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <s.icon size={16} />
                  <span className="text-xs">{s.label}</span>
                </div>
                <div className={`mt-2 text-2xl font-bold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {totalPractices > 0 && (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-[#1E293B]">综合能力评估</h2>
              <div className="flex justify-center">
                <RadarChart data={radarData} size={260} />
              </div>
            </div>
          )}

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#1E293B]">练习历史</h2>
            {sorted.length === 0 ? (
              <p className="text-sm text-gray-400">暂无练习记录</p>
            ) : (
              <div className="space-y-3">
                {sorted.map((sub) => {
                  const caseData = getCaseById(sub.caseId)
                  const st = statusConfig[sub.status] ?? statusConfig.submitted
                  return (
                    <div key={sub.id} onClick={() => navigate(`/compare/${sub.id}`)} className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:border-[#0F766E] hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0F4F8]">
                          <BarChart3 size={18} className="text-[#0F766E]" />
                        </div>
                        <div>
                          <div className="font-medium text-[#1E293B]">{caseData?.name ?? "未知病例"}</div>
                          <div className="text-xs text-gray-400">{new Date(sub.submittedAt).toLocaleDateString("zh-CN")}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-[#0F766E]">{sub.score?.total ?? 0}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}>{st.label}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {bookmarked.length > 0 && (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-[#1E293B]">已收藏病例</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {bookmarked.map((sub) => {
                  const caseData = getCaseById(sub.caseId)
                  return (
                    <div key={sub.id} className="rounded-lg border border-gray-100 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium text-[#1E293B]">{caseData?.name ?? "未知病例"}</span>
                        <Bookmark size={16} className="fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="text-sm text-gray-400">得分: {sub.score?.total ?? 0}</div>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => navigate(`/canvas/${sub.caseId}`)} className="rounded-md bg-[#0F766E] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#0D6B63]">重新练习</button>
                        <button onClick={() => toggleBookmark(sub.id)} className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50">取消收藏</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {submissions.length > 0 && (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-[#1E293B]">复盘笔记</h2>
              {submissions.length === 0 ? (
                <p className="text-sm text-gray-400">暂无练习记录</p>
              ) : (
                <div className="space-y-3">
                  {sorted.map((sub) => {
                    const caseData = getCaseById(sub.caseId)
                    const hasNote = sub.notes.trim().length > 0
                    const isOpen = expandedNotes.has(sub.id)
                    const draft = editingNotes[sub.id] ?? sub.notes
                    return (
                      <div key={sub.id} className="rounded-lg border border-gray-100">
                        <button onClick={() => toggleNote(sub.id)} className="flex w-full items-center justify-between p-4 text-left">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-[#1E293B]">{caseData?.name ?? "未知病例"}</span>
                            {hasNote && <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-medium text-teal-700">有笔记</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            {!hasNote && (
                              <span className="flex items-center gap-1 text-xs text-[#0F766E] font-medium">
                                <PenLine size={12} />写笔记
                              </span>
                            )}
                            {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                          </div>
                        </button>
                        {isOpen && (
                          <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                            <textarea
                              value={draft}
                              onChange={(e) => setEditingNotes((prev) => ({ ...prev, [sub.id]: e.target.value }))}
                              className="w-full rounded-lg border border-gray-200 p-3 text-sm text-[#1E293B] focus:border-[#0F766E] focus:outline-none"
                              rows={3}
                              placeholder="写下你的复盘思考..."
                            />
                            <button
                              onClick={() => {
                                updateNotes(sub.id, draft)
                                setEditingNotes((prev) => { const n = { ...prev }; delete n[sub.id]; return n })
                              }}
                              className="mt-2 rounded-md bg-[#0F766E] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#0D6B63]"
                            >
                              保存
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
