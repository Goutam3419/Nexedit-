import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/authStore";
import {
  listUserProjects,
  createProject,
  deleteProject,
  type ProjectDoc,
} from "@/modules/dashboard/projectService";
import { Plus, Trash2, Loader2 } from "lucide-react";

// Volume 11 — User Dashboard. Firestore se logged-in user ke projects
// fetch karke grid me dikhata hai. Naya design banane par turant Editor khulta hai.
export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    listUserProjects(user.uid, user.email)
      .then(setProjects)
      .catch((err) => setError(err.message ?? "Projects load nahi ho paaye"))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleCreate() {
    if (!user) return;
    setCreating(true);
    try {
      const id = await createProject(user.uid, "Untitled design");
      navigate(`/editor/${id}`);
    } catch (err: any) {
      setError(err.message ?? "Naya project nahi ban paaya");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.message ?? "Delete nahi ho paaya");
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="font-display text-2xl font-semibold mb-6">Your projects</h1>

        {error && (
          <div className="bg-red-950 border border-red-800 text-red-200 text-xs rounded-md px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={handleCreate}
            disabled={creating}
            className="aspect-video rounded-lg border border-dashed border-canvas-border flex flex-col items-center justify-center gap-2 text-white/40 hover:border-brand-500 hover:text-brand-500 cursor-pointer transition-colors"
          >
            {creating ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
            <span className="text-sm">Naya design</span>
          </button>

          {loading ? (
            <div className="col-span-full flex items-center justify-center py-10 text-white/30 text-sm gap-2">
              <Loader2 size={16} className="animate-spin" /> Projects load ho rahe hain...
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/editor/${project.id}`)}
                className="group relative aspect-video rounded-lg border border-canvas-border bg-canvas-panel flex items-end p-3 cursor-pointer hover:border-brand-500 transition-colors"
              >
                <span className="text-sm text-white/80 truncate">{project.name}</span>
                {project.ownerId !== user?.uid && (
                  <span className="absolute top-2 left-2 text-[10px] bg-brand-600/80 rounded px-1.5 py-0.5">
                    Shared
                  </span>
                )}
                <button
                  onClick={(e) => handleDelete(project.id, e)}
                  className="absolute top-2 right-2 bg-black/50 rounded p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete project"
                >
                  <Trash2 size={14} className="text-white" />
                </button>
              </div>
            ))
          )}

          {!loading && projects.length === 0 && (
            <p className="col-span-full text-center text-white/30 text-sm py-6">
              Abhi koi project nahi hai — "Naya design" par click karke shuru karein
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
