import { useState, useCallback, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { XCircle, Save, FileText, PenLine, CheckCircle } from "lucide-react"
import FaceCanvas from "@/components/FaceCanvas"
import { useStore } from "@/store/useStore"
import type { Annotation, Suggestion } from "@/types"

const CATS = [
  { v: "point", l: "点位问题", c: "#0F766E" },
  { v: "dose", l: "剂量问题", c: "#F97066" },
  { v: "safety", l: "安全风险", c: "#DC2626" },
] as const

const QUICK = {
  point: ["点位过低", "点位偏移", "点位过高", "左右不对称", "层次错误"],
  dose: ["剂量分布不均", "剂量偏大", "剂量偏小", "剂量计算错误", "未考虑个体差异"],
  safety: ["未避开危险区", "进针角度错误", "进针深度不足", "操作不规范", "消毒不彻底"],
}

export default function Review() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const navigate = useNavigate()
  const { getSubmissionById, getCaseById, addReview, currentUser, compareSubmission, updateNotes } = useStore()

  const sub = getSubmissionById(submissionId!)
  const caseData = sub ? getCaseById(sub.caseId) : undefined
  const isTeacher = currentUser?.role === "teacher"

  const diffs = useMemo(() => (sub ? compareSubmission(sub) : []), [sub, compareSubmission])

  const [anns, setAnns] = useState<Annotation[]>([])
  const [sugs, setSugs] = useState<Suggestion[]>([])
  const [annMode, setAnnMode] = useState(false)
  const [fb, setFb] = useState({ point: "", dose: "", safety: "", general: "" })
  const [tTab, setTtab] = useState<"point" | "dose" | "safety" | "general">("point")
  const [sTab, setStab] = useState<"point" | "dose" | "safety">("point")
  const [noteDraft, setNoteDraft] = useState(sub?.notes || "")
  const [noteSaved, setNoteSaved] = useState(false)

  const diffStatuses = useMemo(() => {
    const m = new Map<string, "correct" | "offset" | "error">()
    diffs.forEach(d => m.set(d.studentPoint.id, d.status))
    return m
  }, [diffs])

  const annColors = useMemo(() => {
    const m = new Map<string, string>()
    sugs.forEach(s => { const c = CATS.find(c => c.v === s.category); if (c) m.set(s.annotationId, c.c) })
    return m
  }, [sugs])

  const studentAnnColors = useMemo(() => {
    const m = new Map<string, string>()
    sub?.review?.suggestions.forEach(s => { const c = CATS.find(c => c.v === s.category); if (c) m.set(s.annotationId, c.c) })
    return m
  }, [sub?.review?.suggestions])

  const grouped = useMemo(() => {
    const g: Record<string, Suggestion[]> = { point: [], dose: [], safety: [] }
    sub?.review?.suggestions.forEach(s => g[s.category].push(s))
    return g
  }, [sub?.review?.suggestions])

  const onDraw = useCallback(
    (cx: number, cy: number, radius: number) => {
      if (!annMode) return
      const id = `ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      setAnns(p => [...p, { id, cx, cy, radius, label: `#${p.length + 1}` }])
      setSugs(p => [...p, { annotationId: id, text: "", category: "point" }])
    },
    [annMode]
  )

  const delAnn = useCallback((id: string) => {
    setAnns(p => p.filter(a => a.id !== id))
    setSugs(p => p.filter(s => s.annotationId !== id))
  }, [])

  const updSug = useCallback((id: string, field: "text" | "category", val: string) => {
    setSugs(p => p.map(s => (s.annotationId === id ? { ...s, [field]: val } : s)))
  }, [])

  const submitReview = useCallback(() => {
    if (!currentUser || !submissionId) return
    if (sugs.find(s => !s.text.trim())) return
    addReview(submissionId, {
      teacherId: currentUser.id, teacherName: currentUser.name,
      annotations: anns, suggestions: sugs,
      pointFeedback: fb.point, doseFeedback: fb.dose,
      safetyFeedback: fb.safety, generalComment: fb.general,
      reviewedAt: new Date().toISOString(),
    })
    navigate("/review")
  }, [currentUser, submissionId, anns, sugs, fb, addReview, navigate])

  const importSugs = useCallback(() => {
    if (!sub?.review) return
    const g: Record<string, string[]> = { point: [], dose: [], safety: [] }
    sub.review.suggestions.forEach(s => g[s.category].push(s.text))
    const lines: string[] = []
    CATS.forEach(c => {
      if (g[c.v].length > 0) {
        lines.push(`【${c.l}】`)
        g[c.v].forEach((t, i) => lines.push(`${i + 1}. ${t}`))
        lines.push("")
      }
    })
    const r = sub.review
    if (r.pointFeedback) lines.push(`【点位问题总结】\n${r.pointFeedback}\n`)
    if (r.doseFeedback) lines.push(`【剂量问题总结】\n${r.doseFeedback}\n`)
    if (r.safetyFeedback) lines.push(`【安全风险总结】\n${r.safetyFeedback}\n`)
    if (r.generalComment) lines.push(`【综合评语】\n${r.generalComment}\n`)
    setNoteDraft(lines.join("\n").trim())
    setNoteSaved(false)
  }, [sub?.review])

  const quickFill = useCallback((tab: "point" | "dose" | "safety", text: string) => {
    setFb(p => ({ ...p, [tab]: p[tab] ? `${p[tab]}、${text}` : text }))
  }, [])

  if (!sub || !caseData) {
    return <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center text-gray-500">提交记录不存在</div>
  }

  const canvasPts = sub.points.map(p => ({ id: p.id, x: p.x, y: p.y }))
  const stdPts = caseData.standardPoints.map(p => ({ id: p.id, x: p.x, y: p.y }))
  const displayAnns = isTeacher ? anns : sub.review?.annotations ?? []
  const displayColors = isTeacher ? annColors : studentAnnColors

  const catColor = (c: string) => CATS.find(x => x.v === c)?.c || "#3b82f6"
  const tabLbl = (t: string) => t === "point" ? "点位" : t === "dose" ? "剂量" : t === "safety" ? "安全" : "综合"
  const saveNotes = () => { updateNotes(sub.id, noteDraft); setNoteSaved(true) }
  const fbKey = `${sTab}Feedback` as "pointFeedback" | "doseFeedback" | "safetyFeedback"

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col">
      <header className="bg-[#0F766E] text-white px-4 py-3 shadow-md">
        <h1 className="text-lg font-bold tracking-wide">{isTeacher ? "老师点评" : "查看点评"}</h1>
        <div className="text-teal-100 text-sm mt-1">
          {sub.studentName} · {caseData.name} · {new Date(sub.submittedAt).toLocaleDateString()}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-4 gap-3">
          <FaceCanvas
            points={canvasPts} standardPoints={stdPts} diffStatuses={diffStatuses}
            annotations={displayAnns} annotationColors={displayColors}
            annotationMode={isTeacher && annMode} onEndDraw={onDraw}
            readOnly={!isTeacher || !annMode} showLabels
          />
          <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap justify-center">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" />标准点</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-600" />正确</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />偏移</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" />错误</span>
            {CATS.map(c => (
              <span key={c.v} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.c }} />{c.l}
              </span>
            ))}
          </div>
          {isTeacher && (
            <button
              onClick={() => setAnnMode(m => !m)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                annMode ? "bg-[#F97066] text-white" : "bg-white text-[#0F766E] border border-[#0F766E]"
              }`}
            >
              {annMode ? "退出批注模式" : "进入批注模式"}
            </button>
          )}
          {isTeacher && annMode && <p className="text-xs text-gray-500">在面部拖拽绘制圆形批注</p>}
        </div>

        <aside className="w-96 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          {isTeacher ? (
            <div className="flex flex-col h-full">
              {anns.length > 0 && (
                <div className="px-4 py-3 border-b border-gray-100 max-h-56 overflow-y-auto">
                  <h3 className="text-sm font-bold text-[#0F766E] mb-2">批注建议 ({anns.length})</h3>
                  <div className="space-y-2">
                    {anns.map((ann, i) => {
                      const s = sugs.find(s => s.annotationId === ann.id)
                      return (
                        <div key={ann.id} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-700">#{i + 1}</span>
                            <button onClick={() => delAnn(ann.id)} className="text-gray-400 hover:text-red-500">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                          <input type="text" value={s?.text ?? ""} onChange={e => updSug(ann.id, "text", e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                            placeholder="输入建议..." />
                          <select value={s?.category ?? "point"} onChange={e => updSug(ann.id, "category", e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0F766E]">
                            {CATS.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
                          </select>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex border-b border-gray-200">
                  {(["point", "dose", "safety", "general"] as const).map(t => (
                    <button key={t} onClick={() => setTtab(t)}
                      className={`flex-1 px-2 py-2 text-xs font-medium transition-colors ${
                        tTab === t ? "text-[#0F766E] border-b-2 border-[#0F766E] bg-teal-50" : "text-gray-500 hover:text-gray-700"
                      }`}>
                      {tabLbl(t)}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                  {tTab !== "general" && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {QUICK[tTab].map(text => (
                        <button key={text} onClick={() => quickFill(tTab, text)}
                          className="px-2 py-1 text-xs rounded-full border border-gray-200 hover:border-[#0F766E] hover:text-[#0F766E] transition-colors">
                          {text}
                        </button>
                      ))}
                    </div>
                  )}
                  <textarea value={fb[tTab]} onChange={e => setFb(p => ({ ...p, [tTab]: e.target.value }))}
                    className="w-full h-28 rounded-lg border border-gray-200 p-2.5 text-sm text-[#1E293B] focus:border-[#0F766E] focus:outline-none resize-none"
                    placeholder={tTab === "general" ? "输入综合评语..." : "输入详细反馈..."} />
                </div>
              </div>

              <div className="px-4 py-3 border-t border-gray-100">
                <button onClick={submitReview}
                  className="w-full py-2.5 bg-[#0F766E] hover:bg-[#0D6560] text-white rounded-lg text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5">
                  <Save className="w-4 h-4" />保存点评
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {sub.review ? (
                <>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-[#0F766E]">老师点评</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                      <CheckCircle className="w-3 h-3" />已点评
                    </span>
                  </div>
                  <div className="flex border-b border-gray-200">
                    {CATS.map(c => (
                      <button key={c.v} onClick={() => setStab(c.v)}
                        className={`flex-1 px-2 py-2 text-xs font-medium transition-colors ${
                          sTab === c.v ? "text-[#0F766E] border-b-2 border-[#0F766E] bg-teal-50" : "text-gray-500 hover:text-gray-700"
                        }`}>
                        {c.l} ({grouped[c.v].length})
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {grouped[sTab].map((s, i) => (
                      <div key={s.annotationId} className="rounded-lg border p-2.5" style={{ borderColor: catColor(s.category) }}>
                        <div className="text-xs font-semibold mb-0.5" style={{ color: catColor(s.category) }}>建议 #{i + 1}</div>
                        <p className="text-sm text-gray-700">{s.text}</p>
                      </div>
                    ))}
                    {grouped[sTab].length === 0 && <p className="text-sm text-gray-400 text-center py-4">该类别暂无建议</p>}
                    {sub.review[fbKey] && (
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <h4 className="text-xs font-bold text-gray-700 mb-1">{tabLbl(sTab)}问题总结</h4>
                        <p className="text-sm text-gray-600">{sub.review[fbKey]}</p>
                      </div>
                    )}
                    {sub.review.generalComment && (
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <h4 className="text-xs font-bold text-gray-700 mb-1">综合评语</h4>
                        <p className="text-sm text-gray-600">{sub.review.generalComment}</p>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-gray-200 px-4 py-3">
                    <h4 className="text-sm font-bold text-[#0F766E] mb-2 flex items-center gap-1.5">
                      <PenLine className="w-3.5 h-3.5" />复盘笔记
                    </h4>
                    <textarea value={noteDraft} onChange={e => { setNoteDraft(e.target.value); setNoteSaved(false) }}
                      className="w-full rounded-lg border border-gray-200 p-2.5 text-sm text-[#1E293B] focus:border-[#0F766E] focus:outline-none resize-none"
                      rows={3} placeholder="写下你的复盘思考..." />
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={importSugs}
                        className="flex items-center gap-1.5 rounded-md border border-[#0F766E] px-3 py-1.5 text-xs font-medium text-[#0F766E] transition-colors hover:bg-teal-50">
                        <FileText className="w-3.5 h-3.5" />一键带入
                      </button>
                      <button onClick={saveNotes}
                        className="flex items-center gap-1.5 rounded-md bg-[#0F766E] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#0D6B63]">
                        <Save className="w-3.5 h-3.5" />{noteSaved ? "已保存" : "保存笔记"}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400">
                  <p className="text-sm">等待老师点评...</p>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
