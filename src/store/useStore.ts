import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, Submission, StudentPoint, AdjustedReason, Annotation, Suggestion, TeacherReview, SubmissionScore, PointDiff, PointDiffStatus } from "../types"
import { MOCK_USERS, MOCK_CASES } from "../data/mockData"

interface AppState {
  currentUser: User | null
  submissions: Submission[]
  reviewListFilter: { search: string; caseId: string; status: 'all' | 'pending' | 'reviewed'; hasSafetyIssue: boolean }
  login: (userId: string, password?: string) => boolean
  logout: () => void
  addSubmission: (submission: Submission) => void
  updateSubmission: (id: string, data: Partial<Submission>) => void
  addReview: (submissionId: string, review: TeacherReview) => void
  toggleBookmark: (submissionId: string) => void
  updateNotes: (submissionId: string, notes: string) => void
  updateAdjustedReasons: (submissionId: string, reasons: AdjustedReason[]) => void
  setReviewListFilter: (filter: Partial<{ search: string; caseId: string; status: 'all' | 'pending' | 'reviewed'; hasSafetyIssue: boolean }>) => void
  getUsers: () => User[]
  getCases: () => typeof MOCK_CASES
  getCaseById: (id: string) => typeof MOCK_CASES[0] | undefined
  getSubmissionsByStudent: (studentId: string) => Submission[]
  getSubmissionsPendingReview: () => Submission[]
  getSubmissionById: (id: string) => Submission | undefined
  compareSubmission: (submission: Submission) => PointDiff[]
  calculateScore: (submission: Submission) => SubmissionScore
}

const DISTANCE_THRESHOLD_CORRECT = 15
const DISTANCE_THRESHOLD_OFFSET = 30

function calcDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

function isPointInDangerZone(px: number, py: number, dangerZones: { cx: number; cy: number; rx: number; ry: number }[]): boolean {
  return dangerZones.some(dz => {
    const dx = (px - dz.cx) / dz.rx
    const dy = (py - dz.cy) / dz.ry
    return dx * dx + dy * dy <= 1
  })
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      submissions: [],
      reviewListFilter: { search: '', caseId: 'all', status: 'all', hasSafetyIssue: false },

      login: (userId: string, password?: string) => {
        const user = MOCK_USERS.find(u => u.id === userId)
        if (!user) return false
        if (user.role === "teacher" && user.password !== password) return false
        set({ currentUser: user })
        return true
      },

      logout: () => set({ currentUser: null }),

      addSubmission: (submission) => {
        const score = get().calculateScore(submission)
        set(state => ({
          submissions: [...state.submissions, { ...submission, score }],
        }))
      },

      updateSubmission: (id, data) => {
        set(state => ({
          submissions: state.submissions.map(s => (s.id === id ? { ...s, ...data } : s)),
        }))
      },

      addReview: (submissionId, review) => {
        set(state => ({
          submissions: state.submissions.map(s =>
            s.id === submissionId ? { ...s, review, status: "reviewed" as const } : s
          ),
        }))
      },

      toggleBookmark: (submissionId) => {
        set(state => ({
          submissions: state.submissions.map(s =>
            s.id === submissionId ? { ...s, bookmarked: !s.bookmarked } : s
          ),
        }))
      },

      updateNotes: (submissionId, notes) => {
        set(state => ({
          submissions: state.submissions.map(s =>
            s.id === submissionId ? { ...s, notes } : s
          ),
        }))
      },

      updateAdjustedReasons: (submissionId, reasons) => {
        set(state => ({
          submissions: state.submissions.map(s =>
            s.id === submissionId ? { ...s, adjustedReasons: reasons, status: "adjusted" as const } : s
          ),
        }))
      },

      setReviewListFilter: (filter) => {
        set(state => ({
          reviewListFilter: { ...state.reviewListFilter, ...filter },
        }))
      },

      getUsers: () => MOCK_USERS,
      getCases: () => MOCK_CASES,
      getCaseById: (id) => MOCK_CASES.find(c => c.id === id),

      getSubmissionsByStudent: (studentId) => {
        return get().submissions.filter(s => s.studentId === studentId)
      },

      getSubmissionsPendingReview: () => {
        return get().submissions.filter(s => s.status !== "reviewed" || !s.review)
      },

      getSubmissionById: (id) => {
        return get().submissions.find(s => s.id === id)
      },

      compareSubmission: (submission) => {
        const caseData = MOCK_CASES.find(c => c.id === submission.caseId)
        if (!caseData) return []

        const diffs: PointDiff[] = []
        const matchedStandards = new Set<string>()

        for (const sp of submission.points) {
          let closestStd: typeof caseData.standardPoints[0] | undefined
          let closestDist = Infinity

          for (const std of caseData.standardPoints) {
            if (matchedStandards.has(std.id)) continue
            const dist = calcDistance(sp.x, sp.y, std.x, std.y)
            if (dist < closestDist) {
              closestDist = dist
              closestStd = std
            }
          }

          let status: PointDiffStatus = "error"
          if (closestStd && closestDist <= DISTANCE_THRESHOLD_CORRECT) {
            status = "correct"
            matchedStandards.add(closestStd.id)
          } else if (closestStd && closestDist <= DISTANCE_THRESHOLD_OFFSET) {
            status = "offset"
            matchedStandards.add(closestStd.id)
          }

          const inDanger = isPointInDangerZone(sp.x, sp.y, caseData.dangerZones)
          if (inDanger && status !== "error") {
            status = "error"
          }

          diffs.push({
            studentPoint: sp,
            standardPoint: closestStd,
            status,
            doseDiff: closestStd ? Math.abs(sp.leftDose - closestStd.dose) : undefined,
            layerMatch: closestStd ? sp.layer === closestStd.layer : false,
            angleDiff: closestStd ? Math.abs(sp.angle - closestStd.angle) : undefined,
            inDangerZone: inDanger,
          })
        }

        return diffs
      },

      calculateScore: (submission) => {
        const diffs = get().compareSubmission(submission)
        const totalPoints = diffs.length || 1

        const correctCount = diffs.filter(d => d.status === "correct").length
        const pointAccuracy = Math.round((correctCount / totalPoints) * 100)

        const doseErrors = diffs.filter(d => d.doseDiff !== undefined).map(d => d.doseDiff!)
        const avgDoseError = doseErrors.length > 0 ? doseErrors.reduce((a, b) => a + b, 0) / doseErrors.length : 0
        const doseReasonable = Math.max(0, Math.round(100 - avgDoseError * 5))

        const layerCorrectCount = diffs.filter(d => d.layerMatch).length
        const layerCorrect = Math.round((layerCorrectCount / totalPoints) * 100)

        const dangerCount = diffs.filter(d => d.inDangerZone).length
        const safetyAwareness = Math.max(0, Math.round(100 - dangerCount * 30))

        const total = Math.round((pointAccuracy + doseReasonable + layerCorrect + safetyAwareness) / 4)

        return { total, pointAccuracy, doseReasonable, layerCorrect, safetyAwareness }
      },
    }),
    {
      name: "injection-trainer-storage",
      partialize: (state) => ({
        currentUser: state.currentUser,
        submissions: state.submissions,
        reviewListFilter: state.reviewListFilter,
      }),
    }
  )
)
