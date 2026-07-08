import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import ProtectedRoute from "@/router/ProtectedRoute";
import AdminGuard from "@/router/AdminGuard";

// Volume 14 — Performance: Code Splitting. Home page eager load hoti hai
// (pehla impression fast hona chahiye); baaki heavy pages (khaaskar Editor,
// jismein Konva/jsPDF/JSZip jaisi bhaari libraries hain) lazy-load hoti hain —
// matlab unka JS bundle sirf tab download hoga jab user wahan jaayega.
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const EditorPage = lazy(() => import("@/pages/Editor"));
const AdminPage = lazy(() => import("@/pages/Admin"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function PageFallback() {
  return (
    <div className="h-screen flex items-center justify-center text-white/30 text-sm">
      Load ho raha hai...
    </div>
  );
}

// Har naya module (AI, Templates, Assets, Collaboration) is file me
// apna <Route> add karega. Dashboard/Editor/Admin ab login ke bina accessible nahi.
export default function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editor/:projectId?"
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminPage />
            </AdminGuard>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
