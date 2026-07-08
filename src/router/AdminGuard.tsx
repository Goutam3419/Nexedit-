import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { isAdminEmail } from "@/modules/admin/adminConfig";

// Volume 10 — Admin Panel access guard. Pehle normal login chahiye (ProtectedRoute
// jaisa), phir email allow-list (VITE_ADMIN_EMAILS) me hona chahiye.
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white/40 text-sm">
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!isAdminEmail(user.email)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-2 text-center px-4">
        <h1 className="font-display text-xl font-semibold">Access denied</h1>
        <p className="text-white/40 text-sm max-w-sm">
          Yeh page sirf admin accounts ke liye hai. Agar yeh galti hai, `.env` me
          VITE_ADMIN_EMAILS me apna email add karwayein.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
