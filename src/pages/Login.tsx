import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogIn, Shield } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function Login() {
  const navigate = useNavigate();
  const { login, getUsers } = useStore();
  const users = getUsers();
  const students = users.filter((u) => u.role === "student");
  const teachers = users.filter((u) => u.role === "teacher");

  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleStudentLogin = (userId: string) => {
    const ok = login(userId);
    if (ok) navigate("/cases");
  };

  const handleTeacherSelect = (userId: string) => {
    setSelectedTeacher(userId);
    setPassword("");
    setError("");
  };

  const handleTeacherLogin = () => {
    if (!selectedTeacher) return;
    const ok = login(selectedTeacher, password);
    if (ok) {
      navigate("/cases");
    } else {
      setError("密码错误，请重试");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F766E] to-[#064E3B] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#0F766E] to-[#0D9488] px-6 py-8 text-center">
            <svg
              viewBox="0 0 64 64"
              className="w-14 h-14 mx-auto mb-3 text-white/90"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="28" y="6" width="8" height="30" rx="2" />
              <line x1="28" y1="14" x2="36" y2="14" />
              <line x1="32" y1="36" x2="32" y2="54" />
              <circle cx="32" cy="56" r="3" />
              <line x1="26" y1="44" x2="38" y2="44" />
              <line x1="26" y1="44" x2="22" y2="48" />
              <line x1="38" y1="44" x2="42" y2="48" />
              <line x1="22" y1="10" x2="28" y2="10" />
              <line x1="36" y1="10" x2="42" y2="10" />
            </svg>
            <h1 className="text-2xl font-bold text-white tracking-wide">注射点位记录器</h1>
            <p className="text-teal-100/80 mt-1 text-sm">医美注射规范化训练系统</p>
          </div>

          <div className="px-6 py-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-[#0F766E]" />
                <h2 className="text-sm font-semibold text-[#0F766E] uppercase tracking-wider">学员入口</h2>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {students.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleStudentLogin(s.id)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#F0F4F8] hover:bg-[#0F766E] text-[#0F766E] hover:text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md active:scale-95"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200" />

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-[#F97066]" />
                <h2 className="text-sm font-semibold text-[#F97066] uppercase tracking-wider">老师入口</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {teachers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTeacherSelect(t.id)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 ${
                      selectedTeacher === t.id
                        ? "bg-[#F97066] text-white shadow-md"
                        : "bg-[#FFF1F0] text-[#F97066] hover:bg-[#F97066] hover:text-white hover:shadow-md"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    {t.name}
                  </button>
                ))}
              </div>

              {selectedTeacher && (
                <div className="mt-3 space-y-2 animate-in fade-in duration-200">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleTeacherLogin()}
                    placeholder="请输入密码"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F97066]/40 focus:border-[#F97066] transition-all duration-200"
                    autoFocus
                  />
                  {error && (
                    <p className="text-xs text-[#F97066]">{error}</p>
                  )}
                  <button
                    onClick={handleTeacherLogin}
                    className="w-full py-2.5 bg-[#F97066] hover:bg-[#E05A50] text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                  >
                    登录
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-teal-200/50 text-xs mt-4">医美注射规范化训练 · 仅供教学使用</p>
      </div>
    </div>
  );
}
