import { useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";

// Volume 04 — Keyboard Shortcuts. Abhi: Ctrl+Z (undo), Ctrl+Shift+Z / Ctrl+Y (redo), Delete (remove selected).
// Aage yahan copy/paste, group (Ctrl+G), zoom shortcuts add honge.
export function useEditorShortcuts() {
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const removeObject = useEditorStore((s) => s.removeObject);
  const selectedIds = useEditorStore((s) => s.selectedIds);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMeta = e.ctrlKey || e.metaKey;

      if (isMeta && e.key.toLowerCase() === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
        return;
      }
      if (isMeta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
        return;
      }
      if (isMeta && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.length > 0) {
        const target = document.activeElement?.tagName;
        if (target === "INPUT" || target === "TEXTAREA") return;
        e.preventDefault();
        selectedIds.forEach((id) => removeObject(id));
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, removeObject, selectedIds]);
}
