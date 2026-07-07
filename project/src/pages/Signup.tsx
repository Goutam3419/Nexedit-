import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const signUp = useAuthStore((s) => s.signUp);
  const error = useAuthStore((s) => s.error);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await signUp(name, email, password);
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
        <h1 className="font-display text-2xl font-semibold text-center mb-6">Create account</h1>

        {error && (
          <div className="bg-red-950 border border-red-800 text-red-200 text-xs rounded-md px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            required
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-canvas-panel border border-canvas-border rounded-md px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
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
            placeholder="Password (min 6 characters)"
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
            Sign up
          </button>
        </form>

        <p className="text-center text-xs text-white/40 mt-6">
          Pehle se account hai?{" "}
          <Link to="/login" className="text-brand-500 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
