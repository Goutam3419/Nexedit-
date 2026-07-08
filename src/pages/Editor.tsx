import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Canvas from "@/modules/editor/Canvas";
import LayersPanel from "@/modules/editor/LayersPanel";
import Toolbar from "@/modules/editor/Toolbar";
import PropertiesPanel from "@/modules/editor/PropertiesPanel";
import AssetLibraryPanel from "@/modules/assets/AssetLibraryPanel";
import TemplatesPanel from "@/modules/templates/TemplatesPanel";
import ExportMenu from "@/modules/export/ExportMenu";
import AIPanel from "@/modules/ai/AIPanel";
import ShareDialog from "@/modules/collaboration/ShareDialog";
import VersionHistoryPanel from "@/modules/collaboration/VersionHistoryPanel";
import CommentsPanel from "@/modules/collaboration/CommentsPanel";
import { useEditorStore } from "@/store/editorStore";
import { useEditorShortcuts } from "@/hooks/useEditorShortcuts";
import { useAuthStore } from "@/store/authStore";
import {
  loadProject,
  saveProject,
  createProject,
  subscribeToProject,
  saveVersionSnapshot,
} from "@/modules/dashboard/projectService";
import { Undo2, Redo2, Loader2, Check, Users, History, MessageSquare } from "lucide-react";
import clsx from "clsx";

type SidebarTab = "layers" | "assets" | "templates" | "ai";
type SaveStatus = "idle" | "saving" | "saved" | "error";
type ActiveModal = "none" | "share" | "history" | "comments";

export default function EditorPage() {
  useEditorShortcuts();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.past.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);
  const objects = useEditorStore((s) => s.objects);
  const loadObjects = useEditorStore((s) => s.loadObjects);
  const loadObjectsSilent = useEditorStore((s) => s.loadObjectsSilent);

  const [tab, setTab] = useState<SidebarTab>("templates");
  const [projectName, setProjectName] = useState("Untitled design");
  const [currentId, setCurrentId] = useState<string | undefined>(projectId);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [loadingProject, setLoadingProject] = useState(!!projectId);
  const [modal, setModal] = useState<ActiveModal>("none");

  const isOwner = !ownerId || ownerId === user?.uid;
  const isRemoteUpdate = useRef(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Volume 09/11 — jab projectId URL me ho, Firestore se poora canvas load karte hain.
  useEffect(() => {
    if (!projectId) return;
    setLoadingProject(true);
    loadProject(projectId)
      .then((data) => {
        if (data) {
          loadObjects(data.objects);
          setProjectName(data.name);
          setOwnerId(data.ownerId);
          setSharedWith(data.sharedWith ?? []);
        }
      })
      .catch((err) => console.warn("Project load fail:", err))
      .finally(() => setLoadingProject(false));
  }, [projectId]);

  // Volume 09 — Live Editing (simplified real-time sync). Jab bhi koi collaborator
  // save karta hai, Firestore se real-time update aakar canvas refresh ho jaata hai.
  useEffect(() => {
    if (!currentId) return;
    const unsubscribe = subscribeToProject(currentId, (project) => {
      isRemoteUpdate.current = true;
      loadObjectsSilent(project.objects);
      setSharedWith(project.sharedWith ?? []);
    });
    return () => unsubscribe();
  }, [currentId]);

  // Volume 09 — Auto Save. Objects badalte hi 2 second baad (agar koi aur edit
  // na aaye) automatically Firestore me save ho jaata hai.
  useEffect(() => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return; // yeh change remote se aaya tha, wapas save mat karo (infinite loop se bachne ke liye)
    }
    if (!user || !currentId) return; // pehla save manually "Save" button se hi hoga

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      setStatus("saving");
      try {
        await saveProject(currentId, objects, projectName);
        await saveVersionSnapshot(currentId, objects);
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 1500);
      } catch (err) {
        console.warn("Auto-save fail:", err);
        setStatus("error");
      }
    }, 2000);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [objects]);

  async function handleSave() {
    if (!user) {
      setStatus("error");
      return;
    }
    setStatus("saving");
    try {
      let idToSave = currentId;
      if (!idToSave) {
        idToSave = await createProject(user.uid, projectName);
        setCurrentId(idToSave);
        setOwnerId(user.uid);
        navigate(`/editor/${idToSave}`, { replace: true });
      }
      await saveProject(idToSave, objects, projectName);
      await saveVersionSnapshot(idToSave, objects);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      console.warn("Save fail:", err);
      setStatus("error");
    }
  }

  if (loadingProject) {
    return (
      <div className="h-screen flex items-center justify-center text-white/40 text-sm">
        Project load ho raha hai...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="h-14 flex items-center justify-between px-4 border-b border-canvas-border bg-canvas-panel text-sm text-white/70">
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="bg-transparent outline-none focus:bg-white/5 rounded px-1 -ml-1"
        />
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={clsx(
              "p-2 rounded-md hover:bg-white/10",
              !canUndo && "opacity-30 cursor-not-allowed"
            )}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={clsx(
              "p-2 rounded-md hover:bg-white/10",
              !canRedo && "opacity-30 cursor-not-allowed"
            )}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 size={16} />
          </button>
          <div className="w-px h-5 bg-canvas-border mx-1" />

          <button
            onClick={handleSave}
            disabled={status === "saving"}
            className="flex items-center gap-1.5 rounded-md border border-canvas-border px-3 py-1.5 text-xs hover:bg-white/5 transition-colors"
            title="Firestore me save karein"
          >
            {status === "saving" && <Loader2 size={14} className="animate-spin" />}
            {status === "saved" && <Check size={14} className="text-green-400" />}
            {status === "saving" ? "Saving..." : status === "saved" ? "Saved" : "Save"}
          </button>
          {status === "error" && (
            <span className="text-red-400 text-[11px] ml-1">Save fail — Firebase connect hai?</span>
          )}

          <div className="w-px h-5 bg-canvas-border mx-1" />

          {currentId && (
            <>
              {isOwner && (
                <button
                  onClick={() => setModal("share")}
                  className="p-2 rounded-md hover:bg-white/10"
                  title="Share project"
                >
                  <Users size={16} />
                </button>
              )}
              <button
                onClick={() => setModal("history")}
                className="p-2 rounded-md hover:bg-white/10"
                title="Version history"
              >
                <History size={16} />
              </button>
              <button
                onClick={() => setModal("comments")}
                className="p-2 rounded-md hover:bg-white/10"
                title="Comments"
              >
                <MessageSquare size={16} />
              </button>
              <div className="w-px h-5 bg-canvas-border mx-1" />
            </>
          )}

          <ExportMenu />
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <Toolbar />
        <aside className="w-[280px] border-r border-canvas-border bg-canvas-panel flex flex-col">
          <div className="flex border-b border-canvas-border text-xs">
            <button
              onClick={() => setTab("templates")}
              className={clsx(
                "flex-1 py-2.5 transition-colors",
                tab === "templates" ? "text-white border-b-2 border-brand-500" : "text-white/40"
              )}
            >
              Templates
            </button>
            <button
              onClick={() => setTab("assets")}
              className={clsx(
                "flex-1 py-2.5 transition-colors",
                tab === "assets" ? "text-white border-b-2 border-brand-500" : "text-white/40"
              )}
            >
              Assets
            </button>
            <button
              onClick={() => setTab("layers")}
              className={clsx(
                "flex-1 py-2.5 transition-colors",
                tab === "layers" ? "text-white border-b-2 border-brand-500" : "text-white/40"
              )}
            >
              Layers
            </button>
            <button
              onClick={() => setTab("ai")}
              className={clsx(
                "flex-1 py-2.5 transition-colors",
                tab === "ai" ? "text-white border-b-2 border-brand-500" : "text-white/40"
              )}
            >
              AI
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {tab === "templates" ? (
              <TemplatesPanel />
            ) : tab === "assets" ? (
              <AssetLibraryPanel />
            ) : tab === "ai" ? (
              <AIPanel />
            ) : (
              <LayersPanel />
            )}
          </div>
        </aside>
        <main className="flex-1 overflow-hidden">
          <Canvas />
        </main>
        <PropertiesPanel />
      </div>

      {modal === "share" && currentId && (
        <ShareDialog
          projectId={currentId}
          sharedWith={sharedWith}
          onClose={() => setModal("none")}
          onChanged={setSharedWith}
        />
      )}
      {modal === "history" && currentId && (
        <VersionHistoryPanel projectId={currentId} onClose={() => setModal("none")} />
      )}
      {modal === "comments" && currentId && (
        <CommentsPanel projectId={currentId} onClose={() => setModal("none")} />
      )}
    </div>
  );
}
