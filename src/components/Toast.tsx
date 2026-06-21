import { useEffect } from "react"
import { X } from "lucide-react"

interface ToastProps {
  message: string
  type: "warning" | "success" | "error"
  visible: boolean
  onClose: () => void
}

const BG_MAP = {
  warning: "bg-amber-50 border-amber-400 text-amber-800",
  success: "bg-emerald-50 border-emerald-400 text-emerald-800",
  error: "bg-red-50 border-red-400 text-red-800",
}

const ICON_BG_MAP = {
  warning: "text-amber-500",
  success: "text-emerald-500",
  error: "text-red-500",
}

export default function Toast({ message, type, visible, onClose }: ToastProps) {
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [visible, onClose])

  if (!visible) return null

  return (
    <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 animate-slide-down">
      <div
        className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${BG_MAP[type]}`}
      >
        <span className={`text-lg ${ICON_BG_MAP[type]}`}>
          {type === "warning" && "⚠"}
          {type === "success" && "✓"}
          {type === "error" && "✕"}
        </span>
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
