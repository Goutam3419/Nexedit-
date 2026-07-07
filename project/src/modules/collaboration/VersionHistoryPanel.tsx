import { useEffect, useState } from "react";
import { X, History, Loader2 } from "lucide-react";
import { listVersions, type VersionDoc } from "@/modules/dashboard/projectService";
import { useEditorStore } from "@/store/editorStore";

function formatTime(timestamp: any) {
  if (!timestamp?.toDate) return "Just now";
  return timestamp.toDate().toLocaleString();
}

// Volume 09 — Version History. Har save par jo snapshot bana hai, uski list
// dikhata hai; kisi bhi purane version par "Restore" click karke wapas laa sakte ho.
export default function VersionHistoryPanel({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  const [versions, setVersions] = useState<VersionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const loadObjects = useEditorStore((s) => s.loadObjects);

  useEffect(() => {
    listVersions(projectId)
      .then(setVersions)
      .finally(() => setLoading(false));
  }, [projectId]);

  function handleRestore(version: VersionDoc) {
    loadObjects(version.objects);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-canvas-panel border border-canvas-border rounded-lg w-full max-w-sm p-4 max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <History size={15} /> Version history
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-1.5">
          {loading && (
            <div className="flex items-center gap-2 text-xs text-white/40 py-4 justify-center">
              <Loader2 size={14} className="animate-spin" /> Load ho raha hai...
            </div>
          )}
          {!loading && versions.length === 0 && (
            <p className="text-[11px] text-white/30 text-center py-4">
              Abhi koi version history nahi hai — Save karte hi yahan snapshots aane lagenge.
            </p>
          )}
          {versions.map((version) => (
            <button
              key={version.id}
              onClick={() => handleRestore(version)}
              className="text-left text-xs bg-white/5 hover:bg-white/10 rounded-md px-3 py-2 transition-colors"
            >
              <div className="text-white/80">{formatTime(version.savedAt)}</div>
              <div className="text-white/30 text-[10px]">{version.objects.length} objects</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
