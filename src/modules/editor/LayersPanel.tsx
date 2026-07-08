import { useEditorStore } from "@/store/editorStore";
import { Lock, Unlock, Eye, EyeOff, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import clsx from "clsx";

// Volume 04 — Layers panel. Objects array me jo order hai, wahi z-index order hai
// (list me neeche wala item canvas par upar dikhta hai).
export default function LayersPanel() {
  const objects = useEditorStore((s) => s.objects);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const selectObject = useEditorStore((s) => s.selectObject);
  const toggleLock = useEditorStore((s) => s.toggleLock);
  const toggleVisible = useEditorStore((s) => s.toggleVisible);
  const reorderObject = useEditorStore((s) => s.reorderObject);
  const removeObject = useEditorStore((s) => s.removeObject);

  return (
    <div className="flex flex-col gap-1 p-3">
      <h3 className="text-xs uppercase tracking-wide text-white/40 mb-2">Layers</h3>
      {[...objects].reverse().map((obj) => {
        const isSelected = selectedIds.includes(obj.id);
        return (
          <div
            key={obj.id}
            onClick={(e) => selectObject(obj.id, e.shiftKey)}
            className={clsx(
              "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm",
              isSelected ? "bg-brand-600/30 text-white" : "text-white/70 hover:bg-white/5"
            )}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleVisible(obj.id);
              }}
              className="shrink-0"
              title="Show/Hide"
            >
              {obj.visible ? <Eye size={14} /> : <EyeOff size={14} className="opacity-40" />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLock(obj.id);
              }}
              className="shrink-0"
              title="Lock/Unlock"
            >
              {obj.locked ? <Lock size={14} /> : <Unlock size={14} className="opacity-40" />}
            </button>

            <span className="flex-1 truncate">{obj.name}</span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                reorderObject(obj.id, "up");
              }}
              title="Bring forward"
            >
              <ChevronUp size={14} className="opacity-60 hover:opacity-100" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                reorderObject(obj.id, "down");
              }}
              title="Send backward"
            >
              <ChevronDown size={14} className="opacity-60 hover:opacity-100" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeObject(obj.id);
              }}
              title="Delete"
            >
              <Trash2 size={14} className="opacity-60 hover:text-red-400" />
            </button>
          </div>
        );
      })}
      {objects.length === 0 && (
        <p className="text-xs text-white/30 px-2">Canvas par kuch bhi nahi hai</p>
      )}
    </div>
  );
}
