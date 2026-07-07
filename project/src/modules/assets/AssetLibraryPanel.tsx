import { useRef } from "react";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { useAssetStore, type AssetItem } from "@/store/assetStore";
import { useEditorStore } from "@/store/editorStore";
import { createImage } from "@/modules/editor/objectFactory";
import { uploadAsset } from "@/modules/assets/storageService";

// Volume 05 — Asset Library panel. Photos yahan upload/list hote hain,
// click karke seedhe editor canvas me add ho jaate hain.
export default function AssetLibraryPanel() {
  const assets = useAssetStore((s) => s.assets);
  const uploading = useAssetStore((s) => s.uploading);
  const addAsset = useAssetStore((s) => s.addAsset);
  const removeAsset = useAssetStore((s) => s.removeAsset);
  const setUploading = useAssetStore((s) => s.setUploading);

  const addObject = useEditorStore((s) => s.addObject);
  const selectObject = useEditorStore((s) => s.selectObject);

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    for (const file of Array.from(fileList)) {
      const result = await uploadAsset(file, "assets/photos");
      const asset: AssetItem = {
        id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        url: result.url,
        name: file.name,
        type: "photo",
        createdAt: Date.now(),
      };
      addAsset(asset);
    }
    setUploading(false);
  }

  function handleAddToCanvas(asset: AssetItem) {
    const obj = createImage(asset.url);
    addObject(obj);
    selectObject(obj.id);
  }

  return (
    <div className="flex flex-col gap-3 p-3 h-full">
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center justify-center gap-2 border border-dashed border-canvas-border rounded-md py-3 text-xs text-white/60 hover:border-brand-500 hover:text-brand-500 transition-colors"
      >
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        {uploading ? "Uploading..." : "Upload photos"}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-1">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="relative group aspect-square rounded-md overflow-hidden bg-canvas-bg border border-canvas-border cursor-pointer"
            onClick={() => handleAddToCanvas(asset)}
            title="Canvas me add karne ke liye click karein"
          >
            <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeAsset(asset.id);
              }}
              className="absolute top-1 right-1 bg-black/60 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={12} className="text-white" />
            </button>
          </div>
        ))}
        {assets.length === 0 && (
          <p className="col-span-2 text-xs text-white/30 text-center mt-4">
            Abhi koi asset upload nahi hua
          </p>
        )}
      </div>
    </div>
  );
}
