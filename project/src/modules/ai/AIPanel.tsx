import { useState } from "react";
import { Wand2, Scissors, Eraser, Loader2 } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { resizePresets } from "@/modules/ai/magicResizePresets";
import { removeBackgroundFromUrl } from "@/modules/ai/backgroundRemoval";
import { eraseAreaFromImage, buildMaskFromRect } from "@/modules/ai/magicEraser";
import { isBackgroundRemovalConfigured, isMagicEraserConfigured } from "@/modules/ai/aiConfig";
import AIImageSection from "@/modules/ai/AIImageSection";
import AILogoSection from "@/modules/ai/AILogoSection";
import AIWriterSection from "@/modules/ai/AIWriterSection";

// Volume 07 — AI Suite (Batch 1). Teen tools: Magic Resize (pure client-side),
// Background Removal aur Magic Eraser (dono third-party AI API ke peeche).
export default function AIPanel() {
  const objects = useEditorStore((s) => s.objects);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const designWidth = useEditorStore((s) => s.designWidth);
  const designHeight = useEditorStore((s) => s.designHeight);
  const scaleDesign = useEditorStore((s) => s.scaleDesign);
  const updateObject = useEditorStore((s) => s.updateObject);
  const eraseMode = useEditorStore((s) => s.eraseMode);
  const eraseRect = useEditorStore((s) => s.eraseRect);
  const setEraseMode = useEditorStore((s) => s.setEraseMode);
  const setEraseRect = useEditorStore((s) => s.setEraseRect);

  const [bgBusy, setBgBusy] = useState(false);
  const [eraseBusy, setEraseBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedObj =
    selectedIds.length === 1 ? objects.find((o) => o.id === selectedIds[0]) : null;
  const isImageSelected = selectedObj?.type === "image";

  async function handleRemoveBackground() {
    if (!selectedObj || selectedObj.type !== "image" || !selectedObj.src) return;
    setError(null);
    setBgBusy(true);
    try {
      const newUrl = await removeBackgroundFromUrl(selectedObj.src);
      updateObject(selectedObj.id, { src: newUrl });
    } catch (err: any) {
      setError(err.message ?? "Background removal fail hui");
    } finally {
      setBgBusy(false);
    }
  }

  async function handleEraseArea() {
    if (!selectedObj || selectedObj.type !== "image" || !selectedObj.src || !eraseRect) return;
    setError(null);
    setEraseBusy(true);
    try {
      // eraseRect stage coordinates me hai; image object ke relative karte hain
      const relativeRect = {
        x: eraseRect.x - selectedObj.x,
        y: eraseRect.y - selectedObj.y,
        width: eraseRect.width,
        height: eraseRect.height,
      };
      const maskUrl = await buildMaskFromRect(
        selectedObj.src,
        relativeRect,
        selectedObj.width ?? 1,
        selectedObj.height ?? 1
      );
      const newUrl = await eraseAreaFromImage(selectedObj.src, maskUrl);
      updateObject(selectedObj.id, { src: newUrl });
      setEraseMode(false);
      setEraseRect(null);
    } catch (err: any) {
      setError(err.message ?? "Magic Eraser fail hua");
    } finally {
      setEraseBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 p-3 text-sm overflow-y-auto h-full">
      {error && (
        <div className="bg-red-950 border border-red-800 text-red-200 text-[11px] rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* Magic Resize */}
      <div>
        <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-white/40 mb-2">
          <Wand2 size={13} /> Magic Resize
        </div>
        <p className="text-[11px] text-white/40 mb-2">
          Current: {Math.round(designWidth)} × {Math.round(designHeight)}
        </p>
        <div className="flex flex-col gap-1.5">
          {resizePresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => scaleDesign(preset.width, preset.height)}
              className="flex justify-between items-center text-left text-xs px-2.5 py-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span>{preset.name}</span>
              <span className="text-white/40">
                {preset.width}×{preset.height}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Background Removal */}
      <div className="border-t border-canvas-border pt-4">
        <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-white/40 mb-2">
          <Scissors size={13} /> Background Removal
        </div>
        {!isBackgroundRemovalConfigured() && (
          <p className="text-[11px] text-white/30 mb-2">
            Setup chahiye: `.env` me VITE_REMOVE_BG_API_KEY daalein (remove.bg).
          </p>
        )}
        <button
          onClick={handleRemoveBackground}
          disabled={!isImageSelected || bgBusy}
          className="w-full flex items-center justify-center gap-2 text-xs py-2 rounded-md bg-brand-600 hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {bgBusy && <Loader2 size={13} className="animate-spin" />}
          {isImageSelected ? "Remove Background" : "Pehle ek Image select karein"}
        </button>
      </div>

      {/* Magic Eraser */}
      <div className="border-t border-canvas-border pt-4">
        <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-white/40 mb-2">
          <Eraser size={13} /> Magic Eraser
        </div>
        {!isMagicEraserConfigured() && (
          <p className="text-[11px] text-white/30 mb-2">
            Setup chahiye: `.env` me VITE_CLIPDROP_API_KEY daalein (clipdrop.co).
          </p>
        )}
        {!isImageSelected ? (
          <p className="text-[11px] text-white/30">Pehle ek Image select karein.</p>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setEraseMode(!eraseMode)}
              className={`text-xs py-2 rounded-md transition-colors ${
                eraseMode ? "bg-red-600 hover:bg-red-700" : "bg-white/5 hover:bg-white/10"
              }`}
            >
              {eraseMode ? "Drawing mode ON — canvas par drag karein" : "Erase area select karein"}
            </button>
            <button
              onClick={handleEraseArea}
              disabled={!eraseRect || eraseBusy}
              className="w-full flex items-center justify-center gap-2 text-xs py-2 rounded-md bg-brand-600 hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {eraseBusy && <Loader2 size={13} className="animate-spin" />}
              Erase selected area
            </button>
          </div>
        )}
      </div>

      {/* Batch 2 — Step 11 */}
      <AIImageSection />
      <AILogoSection />
      <AIWriterSection />
    </div>
  );
}
