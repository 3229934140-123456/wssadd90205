import { useState, useRef, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { BarChart3, Trophy, Star, Bookmark, ChevronDown, ChevronUp, FileDown, PenLine, Eye, MessageSquare, FileText, CheckSquare, NotebookPen, Award, TrendingUp } from "lucide-react"
import { useStore } from "@/store/useStore"
import RadarChart from "@/components/RadarChart"
import FaceCanvas from "@/components/FaceCanvas"

export default function Profile() {
  const navigate = useNavigate()
  const currentUser = useStore((s) => s.currentUser)
  const getSubmissionsByStudent = useStore((s) => s.getSubmissionsByStudent)
  const toggleBookmark = useStore((s) => s.toggleBookmark)
  const updateNotes = useStore((s) => s.updateNotes)
  const getCaseById = useStore((s) => s.getCaseById)
  const profileSelectedCaseId = useStore((s) => s.profileSelectedCaseId)
  const setProfileSelectedCaseId = useStore((s) => s.setProfileSelectedCaseId)
  const compareSubmission = useStore((s) => s.compareSubmission)

  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({})
  const [filter, setFilter] = useState<"all" | "bookmarked" | "hasNotes" | "pending" | "reviewed">("all")
  const [reportExpanded, setReportExpanded] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)
  const exportingRef = useRef(false)

  if (!currentUser) return <div className="flex h-full items-center justify-center text-gray-400">请先登录</div>

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

  const filteredList = useMemo(() => sorted.filter((sub) => {
    switch (filter) {
      case "bookmarked": return sub.bookmarked
      case "hasNotes": return sub.notes.trim().length > 0
      case "pending": return (sub.status === "submitted" || sub.status === "adjusted") && !sub.review
      case "reviewed": return !!sub.review
      default: return true
    }
  }), [sorted, filter])

  const filterTabs: { key: typeof filter; label: string }[] = [
    { key: "all", label: "全部" },
    { key: "bookmarked", label: "已收藏" },
    { key: "hasNotes", label: "有笔记" },
    { key: "pending", label: "待点评" },
    { key: "reviewed", label: "已点评" },
  ]
  const statusConfig = {
    reviewed: { label: "已点评", cls: "bg-teal-100 text-teal-700" },
    adjusted: { label: "待点评", cls: "bg-yellow-100 text-yellow-700" },
    submitted: { label: "已提交", cls: "bg-gray-100 text-gray-500" },
  }

  const casesWithSubmissions = useMemo(() => {
    const map = new Map<string, typeof submissions>()
    submissions.forEach((s) => {
      if (!map.has(s.caseId)) map.set(s.caseId, [])
      map.get(s.caseId)!.push(s)
    })
    return Array.from(map.entries()).map(([caseId, subs]) => ({
      caseId,
      caseName: getCaseById(caseId)?.name ?? "未知病例",
      subs: subs.sort((a, b) => +new Date(a.submittedAt) - +new Date(b.submittedAt)),
    }))
  }, [submissions, getCaseById])

  const selectedCaseId = profileSelectedCaseId ?? (casesWithSubmissions[0]?.caseId ?? null)

  const iconMap: Record<string, any> = {
    submission: FileText,
    adjusted: CheckSquare,
    review: MessageSquare,
    notes: NotebookPen,
  }
  const typeOrder: Record<string, number> = { submission: 0, adjusted: 1, review: 2, notes: 3 }

  const toggleNote = (id: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const scrollToNote = (id: string) => {
    if (!expandedNotes.has(id)) toggleNote(id)
    setTimeout(() => {
      document.getElementById(`note-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 50)
  }

  const timelineEvents = useMemo(() => {
    if (!selectedCaseId) return []
    const events: any[] = []
    submissions.filter((s) => s.caseId === selectedCaseId).forEach((sub) => {
      events.push({
        id: `${sub.id}-sub`,
        type: "submission",
        date: new Date(sub.submittedAt),
        title: "提交练习",
        subtitle: `得分: ${sub.score?.total ?? 0}`,
        action: () => { setProfileSelectedCaseId(selectedCaseId); navigate(`/compare/${sub.id}`) },
        label: "查看",
      })
      if (sub.status === "adjusted" || sub.adjustedReasons.length > 0) {
        events.push({
          id: `${sub.id}-adj`,
          type: "adjusted",
          date: new Date(sub.submittedAt),
          title: "答案对比",
          action: () => { setProfileSelectedCaseId(selectedCaseId); navigate(`/compare/${sub.id}`) },
          label: "查看对比",
        })
      }
      if (sub.review) {
        events.push({
          id: `${sub.id}-rev`,
          type: "review",
          date: new Date(sub.review.reviewedAt),
          title: "老师反馈",
          subtitle: sub.review.teacherName + (sub.review.currentVersion > 1 ? ` · v${sub.review.currentVersion}` : ""),
          action: () => { setProfileSelectedCaseId(selectedCaseId); navigate(`/review/${sub.id}`) },
          label: "查看点评",
        })
      }
      if (sub.notes.trim()) {
        const nd = sub.review ? new Date(sub.review.reviewedAt) : new Date(sub.submittedAt)
        events.push({
          id: `${sub.id}-note`,
          type: "notes",
          date: nd,
          title: "笔记复盘",
          action: () => scrollToNote(sub.id),
          label: "编辑",
        })
      }
    })
    return events.sort((a, b) => +a.date - +b.date || typeOrder[a.type] - typeOrder[b.type])
  }, [selectedCaseId, submissions, navigate, setProfileSelectedCaseId])

  const handleExport = async () => {
    try {
      exportingRef.current = true
      setReportExpanded(true)
      const html2canvas = (await import("html2canvas")).default
      const { jsPDF } = await import("jspdf")
      await new Promise(r => setTimeout(r, 300))
      if (!reportRef.current) { exportingRef.current = false; return }
      const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = (canvas.height * pdfW) / canvas.width
      const pageH = pdf.internal.pageSize.getHeight()
      let heightLeft = pdfH
      let position = 0
      pdf.addImage(imgData, "PNG", 0, position, pdfW, pdfH)
      heightLeft -= pageH
      while (heightLeft > 0) {
        position = heightLeft - pdfH
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, pdfW, pdfH)
        heightLeft -= pageH
      }
      pdf.save("结业报告.pdf")
    } catch (e) {
      console.error(e)
      alert("导出失败，请确认已安装 html2canvas 和 jspdf 依赖")
    } finally {
      exportingRef.current = false
    }
  }

  const stats = [
    { icon: BarChart3, label: "总练习次数", value: totalPractices, color: "text-[#0F766E]" },
    { icon: BarChart3, label: "平均分", value: avgScore, color: "text-[#0F766E]" },
    { icon: Trophy, label: "最高分", value: maxScore, color: "text-[#F97066]" },
    { icon: Star, label: "已收藏数", value: bookmarkCount, color: "text-yellow-500" },
  ]

  const CATS = [
    { v: "point", l: "点位问题", c: "#0F766E" },
    { v: "dose", l: "剂量问题", c: "#F97066" },
    { v: "safety", l: "安全风险", c: "#DC2626" },
  ]

  const annColorMap = (sugs: any[]) => {
    const m = new Map<string, string>()
    sugs.forEach(s => { const c = CATS.find(c => c.v === s.category); if (c) m.set(s.annotationId, c.c) })
    return m
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">成绩档案</h1>
            <p className="mt-1 text-sm text-gray-500">{currentUser.name} 的练习记录与能力评估</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0D6B63]"
          >
            <FileDown size={16} /> 导出结业报告
          </button>
        </div>

        <div className="space-y-6">
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
            <div className="mb-4 flex flex-wrap gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    filter === tab.key
                      ? "bg-[#0F766E] text-white"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {filteredList.length === 0 ? (
              <p className="text-sm text-gray-400">暂无练习记录</p>
            ) : (
              <div className="space-y-3">
                {filteredList.map((sub) => {
                  const caseData = getCaseById(sub.caseId)
                  const st = statusConfig[sub.status as keyof typeof statusConfig] ?? statusConfig.submitted
                  return (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:border-[#0F766E] hover:bg-gray-50"
                    >
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
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}>
                          {st.label}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/compare/${sub.id}`) }}
                            className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-[#0F766E] hover:text-[#0F766E]"
                          >
                            <Eye size={12} /> 查看对比
                          </button>
                          {sub.review && (
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/review/${sub.id}`) }}
                              className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-[#0F766E] hover:text-[#0F766E]"
                            >
                              <MessageSquare size={12} /> 查看点评
                            </button>
                          )}
                        </div>
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
                        <button
                          onClick={() => navigate(`/canvas/${sub.caseId}`)}
                          className="rounded-md bg-[#0F766E] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#0D6B63]"
                        >
                          重新练习
                        </button>
                        <button
                          onClick={() => toggleBookmark(sub.id)}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50"
                        >
                          取消收藏
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {submissions.length > 0 && (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-[#1E293B]">病例复盘时间线</h2>
              {casesWithSubmissions.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {casesWithSubmissions.map((c) => (
                    <button
                      key={c.caseId}
                      onClick={() => setProfileSelectedCaseId(c.caseId)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        selectedCaseId === c.caseId
                          ? "bg-[#0F766E] text-white"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {c.caseName}
                    </button>
                  ))}
                </div>
              )}
              <div className="relative pl-8">
                {timelineEvents.length === 0 ? (
                  <p className="text-sm text-gray-400">请选择病例查看时间线</p>
                ) : (
                  timelineEvents.map((e, i) => {
                    const Icon = iconMap[e.type]
                    const last = i === timelineEvents.length - 1
                    return (
                      <div key={e.id} className="relative pb-6">
                        {!last && (
                          <div className="absolute left-[-24px] top-6 w-0.5 h-full bg-gray-200" />
                        )}
                        <div className="absolute left-[-28px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#0F766E] text-white">
                          <Icon size={14} />
                        </div>
                        <div className="rounded-lg border border-gray-100 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-[#1E293B]">{e.title}</div>
                              {e.subtitle && <div className="text-xs text-gray-400">{e.subtitle}</div>}
                            </div>
                            <div className="text-xs text-gray-400">
                              {e.date.toLocaleDateString("zh-CN")}
                            </div>
                          </div>
                          {e.action && (
                            <button
                              onClick={e.action}
                              className="mt-2 rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-[#0F766E] hover:text-[#0F766E]"
                            >
                              {e.label}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {submissions.length > 0 && (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-[#1E293B]">复盘笔记</h2>
              <div className="space-y-3">
                {sorted.map((sub) => {
                  const caseData = getCaseById(sub.caseId)
                  const hasNote = sub.notes.trim().length > 0
                  const isOpen = expandedNotes.has(sub.id)
                  const draft = editingNotes[sub.id] ?? sub.notes
                  return (
                    <div key={sub.id} id={`note-${sub.id}`} className="rounded-lg border border-gray-100">
                      <button
                        onClick={() => toggleNote(sub.id)}
                        className="flex w-full items-center justify-between p-4 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-[#1E293B]">{caseData?.name ?? "未知病例"}</span>
                          {hasNote && (
                            <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-medium text-teal-700">
                              有笔记
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!hasNote && (
                            <span className="flex items-center gap-1 text-xs font-medium text-[#0F766E]">
                              <PenLine size={12} />写笔记
                            </span>
                          )}
                          {isOpen ? (
                            <ChevronUp size={16} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={16} className="text-gray-400" />
                          )}
                        </div>
                      </button>
                      {isOpen && (
                        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                          <textarea
                            value={draft}
                            onChange={(e) =>
                              setEditingNotes((prev) => ({ ...prev, [sub.id]: e.target.value }))
                            }
                            className="w-full rounded-lg border border-gray-200 p-3 text-sm text-[#1E293B] focus:border-[#0F766E] focus:outline-none"
                            rows={3}
                            placeholder="写下你的复盘思考..."
                          />
                          <button
                            onClick={() => {
                              updateNotes(sub.id, draft)
                              setEditingNotes((prev) => {
                                const n = { ...prev }
                                delete n[sub.id]
                                return n
                              })
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
            </div>
          )}

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <button
              onClick={() => setReportExpanded((e) => !e)}
              className="flex w-full items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-[#0F766E]" />
                <h2 className="text-lg font-semibold text-[#1E293B]">结业报告</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleExport()
                  }}
                  className="rounded-md bg-[#0F766E] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0D6B63]"
                >
                  导出PDF
                </button>
                {reportExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>
            {(reportExpanded || exportingRef.current) && (
              <div ref={reportRef} className="mt-6 border-t border-gray-100 pt-6 space-y-8 bg-white">
                <div className="text-center border-b border-gray-200 pb-4">
                  <h3 className="text-xl font-bold text-[#0F766E]">注射点位练习结业报告</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    学员：{currentUser.name} | 生成日期：{new Date().toLocaleDateString("zh-CN")}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#1E293B] mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#0F766E]" />学习概览
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-[#0F766E]">{totalPractices}</div>
                      <div className="text-xs text-gray-500">总练习次数</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-[#0F766E]">{avgScore}</div>
                      <div className="text-xs text-gray-500">平均分</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-[#F97066]">{maxScore}</div>
                      <div className="text-xs text-gray-500">最高分</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-green-600">
                        {submissions.filter((s) => s.review).length}
                      </div>
                      <div className="text-xs text-gray-500">已点评数</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#1E293B] mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#0F766E]" />综合能力评估
                  </h4>
                  <div className="flex justify-center py-2">
                    <RadarChart data={radarData} size={220} />
                  </div>
                </div>

                {casesWithSubmissions.map((caseGroup) => {
                  const c = getCaseById(caseGroup.caseId)
                  const lastSub = caseGroup.subs[caseGroup.subs.length - 1]
                  const scores = caseGroup.subs.map(s => s.score?.total ?? 0)
                  const scoreTrend = scores.length >= 2 ? (scores[scores.length - 1] - scores[0]) : 0
                  return (
                    <div key={caseGroup.caseId} className="border border-gray-200 rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div>
                          <h4 className="text-base font-bold text-[#0F766E]">{c?.name ?? caseGroup.caseName}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">共{caseGroup.subs.length}次练习</p>
                        </div>
                        {scoreTrend !== 0 && (
                          <div className={`flex items-center gap-1 text-xs font-semibold ${scoreTrend > 0 ? "text-green-600" : "text-red-500"}`}>
                            <TrendingUp className={`w-3.5 h-3.5 ${scoreTrend < 0 ? "rotate-180" : ""}`} />
                            {scoreTrend > 0 ? `+${scoreTrend}分` : `${scoreTrend}分`}
                          </div>
                        )}
                      </div>

                      <div>
                        <h5 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-[#0F766E]" />练习记录与分数变化
                        </h5>
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-2 py-1.5 text-left font-medium text-gray-600 border border-gray-200">日期</th>
                              <th className="px-2 py-1.5 text-center font-medium text-gray-600 border border-gray-200">总分</th>
                              <th className="px-2 py-1.5 text-center font-medium text-gray-600 border border-gray-200">点位</th>
                              <th className="px-2 py-1.5 text-center font-medium text-gray-600 border border-gray-200">剂量</th>
                              <th className="px-2 py-1.5 text-center font-medium text-gray-600 border border-gray-200">层次</th>
                              <th className="px-2 py-1.5 text-center font-medium text-gray-600 border border-gray-200">安全</th>
                            </tr>
                          </thead>
                          <tbody>
                            {caseGroup.subs.map((sub) => (
                              <tr key={sub.id}>
                                <td className="px-2 py-1.5 border border-gray-200 text-gray-600">{new Date(sub.submittedAt).toLocaleDateString("zh-CN")}</td>
                                <td className="px-2 py-1.5 border border-gray-200 text-center font-medium text-[#0F766E]">{sub.score?.total ?? 0}</td>
                                <td className="px-2 py-1.5 border border-gray-200 text-center text-gray-600">{sub.score?.pointAccuracy ?? 0}</td>
                                <td className="px-2 py-1.5 border border-gray-200 text-center text-gray-600">{sub.score?.doseReasonable ?? 0}</td>
                                <td className="px-2 py-1.5 border border-gray-200 text-center text-gray-600">{sub.score?.layerCorrect ?? 0}</td>
                                <td className="px-2 py-1.5 border border-gray-200 text-center text-gray-600">{sub.score?.safetyAwareness ?? 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {lastSub?.review && (
                        <>
                          <div className="flex gap-4 items-start">
                            <div className="w-[200px] shrink-0">
                              <h5 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5 text-[#0F766E]" />老师圈注
                              </h5>
                              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white" style={{ width: 200, height: 220 }}>
                                <FaceCanvas
                                  points={lastSub.points.map(p => ({ id: p.id, x: p.x, y: p.y }))}
                                  standardPoints={(c?.standardPoints ?? []).map(p => ({ id: p.id, x: p.x, y: p.y }))}
                                  annotations={lastSub.review.annotations}
                                  annotationColors={annColorMap(lastSub.review.suggestions)}
                                  readOnly
                                  showLabels={false}
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h5 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                                <MessageSquare className="w-3.5 h-3.5 text-[#0F766E]" />
                                老师结构化点评
                                <span className="text-[10px] font-normal text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">v{lastSub.review.currentVersion} · {lastSub.review.teacherName}</span>
                              </h5>
                              <div className="space-y-2">
                                {lastSub.review.suggestions.length > 0 && (
                                  <div className="grid grid-cols-3 gap-2">
                                    {CATS.map(cat => {
                                      const items = lastSub.review!.suggestions.filter(s => s.category === cat.v)
                                      if (items.length === 0) return null
                                      return (
                                        <div key={cat.v} className="rounded border p-2" style={{ borderColor: cat.c }}>
                                          <div className="text-[10px] font-bold mb-1" style={{ color: cat.c }}>{cat.l} ({items.length})</div>
                                          <ul className="space-y-0.5">
                                            {items.map((s, i) => (
                                              <li key={s.annotationId} className="text-[11px] text-gray-700 leading-tight">{i + 1}. {s.text}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                                {lastSub.review.pointFeedback && (
                                  <div><span className="text-[10px] font-bold text-[#0F766E]">点位总结：</span><span className="text-[11px] text-gray-600">{lastSub.review.pointFeedback}</span></div>
                                )}
                                {lastSub.review.doseFeedback && (
                                  <div><span className="text-[10px] font-bold text-[#F97066]">剂量总结：</span><span className="text-[11px] text-gray-600">{lastSub.review.doseFeedback}</span></div>
                                )}
                                {lastSub.review.safetyFeedback && (
                                  <div><span className="text-[10px] font-bold text-red-600">安全风险：</span><span className="text-[11px] text-gray-600">{lastSub.review.safetyFeedback}</span></div>
                                )}
                                {lastSub.review.generalComment && (
                                  <div><span className="text-[10px] font-bold text-gray-600">综合评语：</span><span className="text-[11px] text-gray-600">{lastSub.review.generalComment}</span></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {caseGroup.subs.some(s => s.notes.trim()) && (
                        <div>
                          <h5 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                            <NotebookPen className="w-3.5 h-3.5 text-[#0F766E]" />复盘笔记
                          </h5>
                          <div className="space-y-1.5">
                            {caseGroup.subs.filter(s => s.notes.trim()).map((sub) => (
                              <div key={sub.id} className="bg-gray-50 rounded p-2.5">
                                <div className="text-[10px] font-medium text-[#0F766E] mb-0.5">
                                  {new Date(sub.submittedAt).toLocaleDateString("zh-CN")}
                                </div>
                                <p className="text-[11px] text-gray-600 whitespace-pre-wrap leading-relaxed">{sub.notes}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
