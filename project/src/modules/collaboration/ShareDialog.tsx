import { useState } from "react";
import { X, Users, Loader2 } from "lucide-react";
import { addCollaborator, removeCollaborator } from "@/modules/dashboard/projectService";

// Volume 09 — Collaboration (Teams). Owner collaborator ka email add/remove
// kar sakta hai. Firestore Rules (Step 13) me `sharedWith` array check hoga
// (request.auth.token.email ke against) taaki woh users bhi read/write kar sakein.
export default function ShareDialog({
  projectId,
  sharedWith,
  onClose,
  onChanged,
}: {
  projectId: string;
  sharedWith: string[];
  onClose: () => void;
  onChanged: (emails: string[]) => void;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!email.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await addCollaborator(projectId, email.trim());
      onChanged([...sharedWith, email.trim()]);
      setEmail("");
    } catch (err: any) {
      setError(err.message ?? "Add nahi ho paaya");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(target: string) {
    try {
      await removeCollaborator(projectId, target);
      onChanged(sharedWith.filter((e) => e !== target));
    } catch (err: any) {
      setError(err.message ?? "Remove nahi ho paaya");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-canvas-panel border border-canvas-border rounded-lg w-full max-w-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <Users size={15} /> Share project
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="bg-red-950 border border-red-800 text-red-200 text-[11px] rounded-md px-3 py-2 mb-3">
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="collaborator@email.com"
            className="flex-1 bg-canvas-bg border border-canvas-border rounded-md px-2 py-1.5 text-xs outline-none focus:border-brand-500"
          />
          <button
            onClick={handleAdd}
            disabled={busy}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 transition-colors"
          >
            {busy && <Loader2 size={12} className="animate-spin" />}
            Add
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          {sharedWith.length === 0 && (
            <p className="text-[11px] text-white/30">Abhi koi collaborator nahi hai.</p>
          )}
          {sharedWith.map((collaboratorEmail) => (
            <div
              key={collaboratorEmail}
              className="flex items-center justify-between text-xs bg-white/5 rounded-md px-2.5 py-1.5"
            >
              <span className="truncate">{collaboratorEmail}</span>
              <button
                onClick={() => handleRemove(collaboratorEmail)}
                className="text-white/40 hover:text-red-400"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
