import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Layout from "@/components/Layout"
import Login from "@/pages/Login"
import Cases from "@/pages/Cases"
import CanvasPage from "@/pages/CanvasPage"
import Compare from "@/pages/Compare"
import Review from "@/pages/Review"
import ReviewList from "@/pages/ReviewList"
import Profile from "@/pages/Profile"
import Resources from "@/pages/Resources"
import { useStore } from "@/store/useStore"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useStore((s) => s.currentUser)
  if (!currentUser) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/cases" element={<Cases />} />
          <Route path="/canvas/:caseId" element={<CanvasPage />} />
          <Route path="/compare/:submissionId" element={<Compare />} />
          <Route path="/review/:submissionId" element={<Review />} />
          <Route path="/review" element={<ReviewList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/resources" element={<Resources />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
