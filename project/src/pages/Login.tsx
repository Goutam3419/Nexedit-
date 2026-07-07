import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.signIn);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const error = useAuthStore((s) => s.error);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch {
      // error already set in store
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      await signInWithGoogle();
      navigate("/dashboard");
    } catch {
      // error already set in store
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold text-center mb-6">Log in</h1>

        {error && (
          <div className="bg-red-950 border border-red-800 text-red-200 text-xs rounded-md px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-canvas-panel border border-canvas-border rounded-md px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-canvas-panel border border-canvas-border rounded-md px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={busy}
            className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 transition-colors rounded-md py-2 text-sm font-medium"
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            Log in
          </button>
        </form>

        <div className="flex items-center gap-2 my-4 text-white/30 text-xs">
          <div className="flex-1 h-px bg-canvas-border" />
          or
          <div className="flex-1 h-px bg-canvas-border" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={busy}
          className="w-full border border-canvas-border rounded-md py-2 text-sm hover:bg-white/5 transition-colors"
        >
          Continue with Google
        </button>

        <p className="text-center text-xs text-white/40 mt-6">
          Account nahi hai?{" "}
          <Link to="/signup" className="text-brand-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
