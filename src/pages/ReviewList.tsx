import { useNavigate } from "react-router-dom"
import { Clock, CheckCircle, MessageSquare, ChevronRight, ClipboardList } from "lucide-react"
import { useStore } from "@/store/useStore"

export default function ReviewList() {
  const navigate = useNavigate()
  const { currentUser, submissions, getSubmissionsByStudent, getCaseById } = useStore()

  if (!currentUser) return null

  const isTeacher = currentUser.role === "teacher"

  if (isTeacher) {
    const pending = submissions.filter((s) => s.status !== "reviewed" || !s.review)
    const reviewed = submissions.filter((s) => s.status === "reviewed" && s.review)

    return (
      <div className="min-h-screen bg-[#F0F4F8] px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-[#0F766E]" />
            <h1 className="text-2xl font-bold text-[#1E293B]">待点评提交</h1>
            <span className="rounded-full bg-[#F97066] px-2.5 py-0.5 text-xs font-bold text-white">{pending.length}</span>
          </div>

          {pending.length === 0 ? (
            <p className="text-sm text-gray-400 mb-10">暂无待点评提交</p>
          ) : (
            <div className="mb-10 space-y-3">
              {pending.map((s) => {
                const c = getCaseById(s.caseId)
                return (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/review/${s.id}`)}
                    className="flex cursor-pointer items-center justify-between rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-[#0F766E] border-2 border-transparent"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-[#0F766E]">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#1E293B]">{s.studentName} · {c?.name ?? "—"}</p>
                        <p className="text-xs text-gray-400">{new Date(s.submittedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">待点评</span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mb-6 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-[#0F766E]" />
            <h1 className="text-2xl font-bold text-[#1E293B]">已点评提交</h1>
            <span className="rounded-full bg-[#0F766E] px-2.5 py-0.5 text-xs font-bold text-white">{reviewed.length}</span>
          </div>

          {reviewed.length === 0 ? (
            <p className="text-sm text-gray-400">暂无已点评提交</p>
          ) : (
            <div className="space-y-3">
              {reviewed.map((s) => {
                const c = getCaseById(s.caseId)
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border-2 border-transparent"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#1E293B]">{s.studentName} · {c?.name ?? "—"}</p>
                        <p className="text-xs text-gray-400">{new Date(s.submittedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">已点评</span>
                      <button
                        onClick={() => navigate(`/review/${s.id}`)}
                        className="rounded-lg bg-[#0F766E] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#0D6B63]"
                      >
                        查看
                      </button>
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
