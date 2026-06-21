import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Star, AlertTriangle, Info, X } from "lucide-react"
import { useStore } from "@/store/useStore"
import FaceCanvas from "@/components/FaceCanvas"

export default function Cases() {
  const navigate = useNavigate()
  const getCases = useStore((s) => s.getCases)
  const getSubmissionsByStudent = useStore((s) => s.getSubmissionsByStudent)
  const currentUser = useStore((s) => s.currentUser)
  const [selectedCase, setSelectedCase] = useState<ReturnType<typeof getCases>[0] | null>(null)

  const cases = getCases()
  const studentSubmissions = currentUser ? getSubmissionsByStudent(currentUser.id) : []

  const isCompleted = (caseId: string) => studentSubmissions.some((s) => s.caseId === caseId)

  const categoryColor: Record<string, string> = {
    "瘦脸": "bg-teal-100 text-teal-800",
    "填充": "bg-blue-100 text-blue-800",
    "除皱": "bg-purple-100 text-purple-800",
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1E293B]">模拟病例库</h1>
          <p className="mt-1 text-sm text-gray-500">选择病例进行注射练习，提升临床操作技能</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCase(c)}
              className="group cursor-pointer rounded-xl border-2 border-transparent bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#0F766E] hover:shadow-lg"
            >
              <div className="mb-3 flex items-start justify-between">
                <h2 className="text-lg font-semibold text-[#1E293B]">{c.name}</h2>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColor[c.category] || "bg-gray-100 text-gray-700"}`}>
                  {c.category}
                </span>
              </div>

              <div className="mb-3 flex items-center gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < c.difficulty ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                  />
                ))}
                <span className="ml-1 text-xs text-gray-400">
                  {c.difficulty === 1 ? "初级" : c.difficulty === 2 ? "中级" : "高级"}
                </span>
              </div>

              <div className="mb-3 flex justify-center">
                <div className="w-[140px]">
                  <FaceCanvas
                    points={[]}
                    dangerZones={c.dangerZones.map((dz) => ({
                      id: dz.id,
                      cx: dz.cx,
                      cy: dz.cy,
                      rx: dz.rx,
                      ry: dz.ry,
                      name: dz.name,
                    }))}
                    readOnly
                    showLabels={false}
                  />
                </div>
              </div>

              <p className="mb-3 line-clamp-2 text-sm text-gray-500">{c.description}</p>

              <div>
                {isCompleted(c.id) ? (
                  <span className="inline-block rounded-full bg-green-100 px-3 py-0.5 text-xs font-medium text-green-700">
                    已完成
                  </span>
                ) : (
                  <span className="inline-block rounded-full bg-gray-100 px-3 py-0.5 text-xs font-medium text-gray-500">
                    未练习
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedCase(null)}>
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCase(null)}
              className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h2 className="mb-6 text-xl font-bold text-[#1E293B]">{selectedCase.name}</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-3 font-semibold text-[#1E293B]">患者信息</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-gray-400">年龄：</span>
                    <span className="text-[#1E293B]">{selectedCase.patientAge}岁</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-400">性别：</span>
                    <span className="text-[#1E293B]">{selectedCase.patientGender}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-400">主诉：</span>
                    <span className="text-[#1E293B]">{selectedCase.chiefComplaint}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-400">注射史：</span>
                    <span className="text-[#1E293B]">{selectedCase.injectionHistory}</span>
                  </div>
                </div>

                <h4 className="mb-2 mt-4 font-medium text-[#1E293B]">禁忌症</h4>
                <ul className="space-y-1.5">
                  {selectedCase.contraindications.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle size={14} className="mt-0.5 shrink-0 text-[#F97066]" />
                      <span className="text-[#1E293B]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-[#1E293B]">解剖提示</h3>
                <ul className="space-y-1.5">
                  {selectedCase.anatomyHints.map((hint, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Info size={14} className="mt-0.5 shrink-0 text-[#0F766E]" />
                      <span className="text-[#1E293B]">{hint}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedCase(null)}
                className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                关闭
              </button>
              <button
                onClick={() => navigate(`/canvas/${selectedCase.id}`)}
                className="rounded-lg bg-[#0F766E] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0D6B63]"
              >
                开始练习
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
