export interface User {
  id: string
  name: string
  role: "student" | "teacher"
  password?: string
}

export interface StandardPoint {
  id: string
  x: number
  y: number
  side: "left" | "right" | "bilateral"
  dose: number
  layer: "intradermal" | "subcutaneous" | "intramuscular"
  angle: number
  label: string
}

export interface DangerZone {
  id: string
  cx: number
  cy: number
  rx: number
  ry: number
  name: string
  warning: string
}

export interface CaseData {
  id: string
  name: string
  difficulty: 1 | 2 | 3
  category: string
  patientAge: number
  patientGender: string
  chiefComplaint: string
  injectionHistory: string
  contraindications: string[]
  anatomyHints: string[]
  standardPoints: StandardPoint[]
  dangerZones: DangerZone[]
  description: string
}

export interface StudentPoint {
  id: string
  x: number
  y: number
  side: "left" | "right" | "bilateral"
  leftDose: number
  rightDose: number
  layer: "intradermal" | "subcutaneous" | "intramuscular"
  angle: number
}

export interface AdjustedReason {
  pointId: string
  reason: string
}

export interface SubmissionScore {
  total: number
  pointAccuracy: number
  doseReasonable: number
  layerCorrect: number
  safetyAwareness: number
}

export interface Annotation {
  id: string
  cx: number
  cy: number
  radius: number
  label: string
}

export interface Suggestion {
  annotationId: string
  text: string
  category: "point" | "dose" | "safety"
}

export interface ReviewVersion {
  version: number
  teacherId: string
  teacherName: string
  modifiedAt: string
  summary: string
}

export interface TeacherReview {
  teacherId: string
  teacherName: string
  annotations: Annotation[]
  suggestions: Suggestion[]
  pointFeedback?: string
  doseFeedback?: string
  safetyFeedback?: string
  generalComment?: string
  reviewedAt: string
  currentVersion: number
  versions: ReviewVersion[]
}

export interface Submission {
  id: string
  caseId: string
  studentId: string
  studentName: string
  points: StudentPoint[]
  submittedAt: string
  adjustedReasons: AdjustedReason[]
  score?: SubmissionScore
  review?: TeacherReview
  bookmarked: boolean
  notes: string
  status: "submitted" | "adjusted" | "reviewed"
}

export type PointDiffStatus = "correct" | "offset" | "error"

export interface PointDiff {
  studentPoint: StudentPoint
  standardPoint?: StandardPoint
  status: PointDiffStatus
  doseDiff?: number
  layerMatch?: boolean
  angleDiff?: number
  inDangerZone: boolean
}

export type LayerOption = "intradermal" | "subcutaneous" | "intramuscular"

export const LAYER_LABELS: Record<LayerOption, string> = {
  intradermal: "皮内",
  subcutaneous: "皮下",
  intramuscular: "肌层",
}

export const SIDE_LABELS: Record<string, string> = {
  left: "左侧",
  right: "右侧",
  bilateral: "双侧",
}
