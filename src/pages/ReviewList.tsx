import { useNavigate } from "react-router-dom"
import { Clock, CheckCircle, MessageSquare, ChevronRight, ClipboardList, Search, AlertTriangle } from "lucide-react"
import { useStore } from "@/store/useStore"

export default function ReviewList() {
  const navigate = useNavigate()
  const { currentUser, submissions, getSubmissionsByStudent, getCaseById, getCases, reviewListFilter, setReviewListFilter, compareSubmission } = useStore()

  if (!currentUser) return null

  const isTeacher = currentUser.role === "teacher"

  if (isTeacher) {
    const cases = getCases()

    const filtered = submissions.filter((s) => {
      if (reviewListFilter.search) {
        if (!s.studentName.toLowerCase().includes(reviewListFilter.search.toLowerCase())) return false
      }
      if (reviewListFilter.caseId !== "all") {
        if (s.caseId !== reviewListFilter.caseId) return false
      }
      const isReviewed = s.status === "reviewed" && s.review
      if (reviewListFilter.status === "pending" && isReviewed) return false
      if (reviewListFilter.status === "reviewed" && !isReviewed) return false
      if (reviewListFilter.hasSafetyIssue) {
        const diffs = compareSubmission(s)
        if (!diffs.some((d) => d.inDangerZone)) return false
      }
      return true
    })

    const tabs = [
      { key: "all", label: "全部" },
      { key: "pending", label: "待点评" },
      { key: "reviewed", label: "已点评" },
    ]

    return (
      <div className="min-h-screen bg-[#F0F4F8] px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-[#0F766E]" />
            <h1 className="text-2xl font-bold text-[#1E293B]">点评列表</h1>
          </div>

          <div className="mb-4 flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={reviewListFilter.search}
                onChange={(e) => setReviewListFilter({ search: e.target.value })}
                placeholder="搜索学生姓名"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
              />
            </div>
            <select
              value={reviewListFilter.caseId}
              onChange={(e) => setReviewListFilter({ caseId: e.target.value })}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-[#1E293B] focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] bg-white"
            >
              <option value="all">全部病例</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reviewListFilter.hasSafetyIssue}
                onChange={(e) => setReviewListFilter({ hasSafetyIssue: e.target.checked })}
                className="w-4 h-4 accent-[#DC2626]"
              />
              <span className="text-sm text-[#1E293B] flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
                有安全风险
              </span>
            </label>
          </div>

          <div className="mb-4 flex gap-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setReviewListFilter({ status: tab.key as 'all' | 'pending' | 'reviewed' })}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  reviewListFilter.status === tab.key
                    ? "bg-white text-[#0F766E] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">共</span>
            <span className="rounded-full bg-[#0F766E] px-2.5 py-0.5 text-xs font-bold text-white">{filtered.length}</span>
            <span className="text-sm text-gray-500">条记录</span>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400">暂无匹配的提交</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((s) => {
                const c = getCaseById(s.caseId)
                const isReviewed = s.status === "reviewed" && s.review
                const hasSafetyIssue = compareSubmission(s).some((d) => d.inDangerZone)
                return (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/review/${s.id}`)}
                    className="flex cursor-pointer items-center justify-between rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-[#0F766E] border-2 border-transparent"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isReviewed ? "bg-green-50 text-green-600" : "bg-teal-50 text-[#0F766E]"}`}>
                        {isReviewed ? <CheckCircle className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[#1E293B]">{s.studentName} · {c?.name ?? "—"}</p>
                          {hasSafetyIssue && (
                            <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                              <AlertTriangle className="w-3 h-3" />
                              风险
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{new Date(s.submittedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${isReviewed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {isReviewed ? "已点评" : "待点评"}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  const mySubmissions = getSubmissionsByStudent(currentUser.id)

  return (
    <div className="min-h-screen bg-[#F0F4F8] px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-[#0F766E]" />
          <h1 className="text-2xl font-bold text-[#1E293B]">我的提交记录</h1>
        </div>

        {mySubmissions.length === 0 ? (
          <p className="text-sm text-gray-400">暂无提交记录</p>
        ) : (
          <div className="space-y-3">
            {mySubmissions.map((s) => {
              const c = getCaseById(s.caseId)
              const isReviewed = s.status === "reviewed" && s.review
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isReviewed ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-500"}`}>
                      {isReviewed ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1E293B]">{c?.name ?? "—"}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{new Date(s.submittedAt).toLocaleDateString()}</span>
                        {isReviewed && s.score && <span className="text-[#0F766E] font-medium">得分 {s.score.total}</span>}
                      </div>
                    </div>
                  </div>
                  {isReviewed ? (
                    <button
                      onClick={() => navigate(`/review/${s.id}`)}
                      className="rounded-lg bg-[#0F766E] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#0D6B63]"
                    >
                      查看点评
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-yellow-500 font-medium">
                      <Clock className="w-3.5 h-3.5" />等待点评
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
