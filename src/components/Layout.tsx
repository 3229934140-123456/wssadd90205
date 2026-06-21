import { useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import {
  ClipboardList,
  PenTool,
  GitCompare,
  MessageSquare,
  BarChart3,
  BookOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useStore } from "@/store/useStore"

const NAV_ITEMS = [
  { to: "/cases", icon: ClipboardList, label: "病例练习" },
  { to: "/canvas", icon: PenTool, label: "点位画布" },
  { to: "/compare", icon: GitCompare, label: "答案对比" },
  { to: "/review", icon: MessageSquare, label: "老师点评" },
  { to: "/profile", icon: BarChart3, label: "成绩档案" },
  { to: "/resources", icon: BookOpen, label: "资料库" },
]

export default function Layout() {
  const [collapsed, setCollapsed] = useState(true)
  const { currentUser, logout } = useStore()

  return (
    <div className="flex h-screen bg-[#F0F4F8]">
      <aside
        className="fixed left-0 top-0 z-40 flex h-full flex-col bg-[#0F766E] text-white transition-all duration-300 ease-in-out"
        style={{ width: collapsed ? 64 : 220 }}
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
      >
        <div className="flex h-14 items-center justify-between border-b border-white/10 px-3">
          <span
            className="overflow-hidden whitespace-nowrap text-lg font-bold transition-opacity duration-200"
            style={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
          >
            医美注射训练
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-sm font-bold">
            医
          </span>
        </div>

        <nav className="flex-1 py-2">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 transition-colors duration-150 ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span
                className="overflow-hidden whitespace-nowrap transition-opacity duration-200"
                style={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
              >
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          {currentUser && (
            <div
              className="mb-2 overflow-hidden whitespace-nowrap text-sm text-white/80 transition-opacity duration-200"
              style={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : "auto" }}
            >
              {currentUser.name}
            </div>
          )}
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded px-3 py-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span
              className="overflow-hidden whitespace-nowrap transition-opacity duration-200"
              style={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
            >
              退出登录
            </span>
          </button>
        </div>
      </aside>

      <main
        className="flex-1 overflow-y-auto transition-all duration-300 ease-in-out"
        style={{ marginLeft: collapsed ? 64 : 220 }}
      >
        <Outlet />
      </main>
    </div>
  )
}
