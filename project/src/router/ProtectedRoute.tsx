import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

// Volume 12 — Auth guard. Jab tak Firebase se initial auth-check poora nahi
// hota (loading), spinner dikhate hain — taaki refresh pe galti se login page
// pe redirect na ho jaaye.
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white/40 text-sm">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
