import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export default function Navbar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logOut = useAuthStore((s) => s.logOut);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-canvas-border bg-canvas-panel">
      <Link to="/" className="font-display text-lg font-semibold tracking-tight">
        Studio<span className="text-brand-500">.</span>
      </Link>
      <nav className="flex items-center gap-6 text-sm text-white/70">
        <Link to="/dashboard" className="hover:text-white transition-colors">
          Projects
        </Link>
        <Link to="/editor" className="hover:text-white transition-colors">
          New design
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-white/50 text-xs">{user.displayName ?? user.email}</span>
            <button
              onClick={async () => {
                await logOut();
                navigate("/");
              }}
              className="rounded-md border border-canvas-border px-3 py-1.5 text-xs hover:bg-white/5 transition-colors"
            >
              Log out
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 transition-colors"
          >
            Get started
          </Link>
        )}
      </nav>
    </header>
  );
}
