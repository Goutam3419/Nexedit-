import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { listAllUsers, type UserProfileDoc } from "@/modules/admin/userProfileService";
import { templates } from "@/modules/templates/templateData";
import { logAction } from "@/modules/security/auditLog";
import { Users, LayoutTemplate, BarChart3, Loader2 } from "lucide-react";
import clsx from "clsx";

type AdminTab = "overview" | "users" | "templates";

function formatDate(timestamp: any) {
  if (!timestamp?.toDate) return "—";
  return timestamp.toDate().toLocaleDateString();
}

// Volume 10 — Admin Panel. Real Firestore data dikhata hai (Users), aur
// existing templates ka read-only view. Billing/Coupons/AI-usage abhi
// tracked nahi hain — README me limitation note ki hai.
export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [users, setUsers] = useState<UserProfileDoc[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    logAction("admin.panel.access");
    listAllUsers()
      .then(setUsers)
      .catch((err) => setError(err.message ?? "Users load nahi ho paaye"))
      .finally(() => setLoadingUsers(false));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-display text-2xl font-semibold mb-6">Admin Panel</h1>

        <div className="flex gap-1 border-b border-canvas-border mb-6 text-sm">
          {(
            [
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "users", label: "Users", icon: Users },
              { id: "templates", label: "Templates", icon: LayoutTemplate },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={clsx(
                "flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors",
                tab === id ? "border-brand-500 text-white" : "border-transparent text-white/40"
              )}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-950 border border-red-800 text-red-200 text-xs rounded-md px-3 py-2 mb-4">
            {error}
          </div>
        )}

        {tab === "overview" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-canvas-panel border border-canvas-border rounded-lg p-4">
              <p className="text-white/40 text-xs mb-1">Total Users</p>
              <p className="text-2xl font-semibold">
                {loadingUsers ? <Loader2 size={18} className="animate-spin" /> : users.length}
              </p>
            </div>
            <div className="bg-canvas-panel border border-canvas-border rounded-lg p-4">
              <p className="text-white/40 text-xs mb-1">Templates Available</p>
              <p className="text-2xl font-semibold">{templates.length}</p>
            </div>
            <div className="bg-canvas-panel border border-canvas-border rounded-lg p-4">
              <p className="text-white/40 text-xs mb-1">Billing</p>
              <p className="text-xs text-white/30 mt-2">Abhi tak setup nahi hai</p>
            </div>
            <div className="bg-canvas-panel border border-canvas-border rounded-lg p-4">
              <p className="text-white/40 text-xs mb-1">AI Usage</p>
              <p className="text-xs text-white/30 mt-2">Tracking abhi nahi hai</p>
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="bg-canvas-panel border border-canvas-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-white/40 text-xs">
                <tr>
                  <th className="text-left px-4 py-2.5">Email</th>
                  <th className="text-left px-4 py-2.5">Name</th>
                  <th className="text-left px-4 py-2.5">Joined</th>
                  <th className="text-left px-4 py-2.5">Last login</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-white/30">
                      <Loader2 size={16} className="animate-spin inline" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-white/30">
                      Abhi koi user nahi hai
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.uid} className="border-t border-canvas-border">
                      <td className="px-4 py-2.5">{u.email}</td>
                      <td className="px-4 py-2.5 text-white/60">{u.displayName ?? "—"}</td>
                      <td className="px-4 py-2.5 text-white/40">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-2.5 text-white/40">{formatDate(u.lastLoginAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "templates" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {templates.map((t) => (
              <div
                key={t.id}
                className="rounded-lg overflow-hidden border border-canvas-border"
              >
                <div
                  className="aspect-[4/5] flex items-end p-2"
                  style={{ backgroundColor: t.previewColor }}
                >
                  <span className="text-[10px] text-white/90 bg-black/30 rounded px-1.5 py-0.5">
                    {t.category}
                  </span>
                </div>
                <div className="px-2 py-1.5 text-xs text-white/70">{t.name}</div>
              </div>
            ))}
            <p className="col-span-full text-[11px] text-white/30 mt-2">
              Yeh templates abhi code me defined hain (Firestore me nahi) — isliye yahan se
              edit/delete nahi ho sakte. Real CRUD ke liye templates ko Firestore collection
              me migrate karna hoga (future iteration).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
