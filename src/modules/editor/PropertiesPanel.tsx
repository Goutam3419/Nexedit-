import { useEditorStore, type BlendMode } from "@/store/editorStore";

const blendModes: BlendMode[] = ["source-over", "multiply", "screen", "overlay", "darken", "lighten"];

// Step 4 — Editor Advanced. Selected object (agar ek hi selected ho) ke
// opacity, rotation, blend mode, filters, aur mask ko yahan se control karte hain.
export default function PropertiesPanel() {
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const objects = useEditorStore((s) => s.objects);
  const updateObject = useEditorStore((s) => s.updateObject);

  const selected =
    selectedIds.length === 1 ? objects.find((o) => o.id === selectedIds[0]) : null;

  if (!selected) {
    return (
      <div className="w-[260px] border-l border-canvas-border bg-canvas-panel p-4 text-xs text-white/40">
        Ek object select karein properties dekhne ke liye
        {selectedIds.length > 1 && <p className="mt-2">{selectedIds.length} objects selected</p>}
      </div>
    );
  }

  return (
    <div className="w-[260px] border-l border-canvas-border bg-canvas-panel p-4 flex flex-col gap-5 overflow-y-auto text-sm">
      <div>
        <h3 className="text-xs uppercase tracking-wide text-white/40 mb-2">{selected.name}</h3>
      </div>

      {/* Opacity */}
      <div>
        <label className="flex justify-between text-white/60 text-xs mb-1">
          <span>Opacity</span>
          <span>{Math.round(selected.opacity * 100)}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={selected.opacity}
          onChange={(e) => updateObject(selected.id, { opacity: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Rotation */}
      <div>
        <label className="flex justify-between text-white/60 text-xs mb-1">
          <span>Rotation</span>
          <span>{selected.rotation}°</span>
        </label>
        <input
          type="range"
          min={0}
          max={360}
          step={1}
          value={selected.rotation}
          onChange={(e) => updateObject(selected.id, { rotation: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Blend Mode */}
      <div>
        <label className="text-white/60 text-xs mb-1 block">Blend mode</label>
        <select
          value={selected.blendMode}
          onChange={(e) => updateObject(selected.id, { blendMode: e.target.value as BlendMode })}
          className="w-full bg-canvas-bg border border-canvas-border rounded-md px-2 py-1.5 text-white text-xs"
        >
          {blendModes.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>
      </div>

      {/* Filters (main image ke liye render hote hain, baaki shapes pe bhi apply ho sakta hai) */}
      <div className="border-t border-canvas-border pt-4">
        <h4 className="text-xs uppercase tracking-wide text-white/40 mb-3">Filters</h4>

        <label className="flex items-center justify-between text-white/60 text-xs mb-3">
          <span>Grayscale</span>
          <input
            type="checkbox"
            checked={selected.grayscale}
            onChange={(e) => updateObject(selected.id, { grayscale: e.target.checked })}
          />
        </label>

        <label className="flex justify-between text-white/60 text-xs mb-1">
          <span>Blur</span>
          <span>{selected.blurRadius}px</span>
        </label>
        <input
          type="range"
          min={0}
          max={20}
          step={1}
          value={selected.blurRadius}
          onChange={(e) => updateObject(selected.id, { blurRadius: Number(e.target.value) })}
          className="w-full mb-3"
        />

        <label className="flex justify-between text-white/60 text-xs mb-1">
          <span>Brightness</span>
          <span>{selected.brightness.toFixed(1)}</span>
        </label>
        <input
          type="range"
          min={-1}
          max={1}
          step={0.1}
          value={selected.brightness}
          onChange={(e) => updateObject(selected.id, { brightness: Number(e.target.value) })}
          className="w-full"
        />
        {selected.type !== "image" && (
          <p className="text-[10px] text-white/30 mt-2">
            Note: Blur/Brightness/Grayscale abhi sirf Image objects par visually render hote hain.
          </p>
        )}
      </div>

      {/* Mask */}
      <div className="border-t border-canvas-border pt-4">
        <h4 className="text-xs uppercase tracking-wide text-white/40 mb-3">Mask</h4>
        <div className="flex gap-2">
          <button
            onClick={() => updateObject(selected.id, { maskShape: "none" })}
            className={`flex-1 py-1.5 rounded-md text-xs ${
              selected.maskShape === "none" ? "bg-brand-600 text-white" : "bg-white/5 text-white/60"
            }`}
          >
            None
          </button>
          <button
            onClick={() => updateObject(selected.id, { maskShape: "circle" })}
            className={`flex-1 py-1.5 rounded-md text-xs ${
              selected.maskShape === "circle" ? "bg-brand-600 text-white" : "bg-white/5 text-white/60"
            }`}
          >
            Circle
          </button>
        </div>
      </div>

      {/* Crop (image only) */}
      {selected.type === "image" && (
        <div className="border-t border-canvas-border pt-4">
          <h4 className="text-xs uppercase tracking-wide text-white/40 mb-2">Crop</h4>
          <p className="text-[10px] text-white/30">
            Image ko drag/resize karke frame ke andar jo dikhega wahi crop area hoga. Advanced
            crop-handle UI Volume 04 ke agle iteration me aayega.
          </p>
        </div>
      )}
    </div>
  );
}
