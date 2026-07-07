import { useRef } from "react";
import { Square, Circle, Type, ImagePlus } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { createRect, createCircle, createText, createImage } from "@/modules/editor/objectFactory";

// Volume 04 — Editor Tools. Yeh toolbar canvas me naye objects daalne ka
// primary entry point hai. Aage yahan pen/mask/crop tools bhi add honge.
export default function Toolbar() {
  const addObject = useEditorStore((s) => s.addObject);
  const selectObject = useEditorStore((s) => s.selectObject);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleAddRect() {
    const obj = createRect();
    addObject(obj);
    selectObject(obj.id);
  }

  function handleAddCircle() {
    const obj = createCircle();
    addObject(obj);
    selectObject(obj.id);
  }

  function handleAddText() {
    const obj = createText();
    addObject(obj);
    selectObject(obj.id);
  }

  function handleImageButtonClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Abhi ke liye local blob URL use kar rahe hain (in-memory).
    // Step 5 (Asset Library) me isko Firebase Storage upload se replace karenge.
    const url = URL.createObjectURL(file);
    const obj = createImage(url);
    addObject(obj);
    selectObject(obj.id);
    e.target.value = "";
  }

  const buttonClass =
    "flex flex-col items-center gap-1 w-14 py-2 rounded-md text-white/70 hover:bg-white/10 hover:text-white transition-colors text-[10px]";

  return (
    <div className="flex flex-col items-center gap-2 p-3 border-r border-canvas-border bg-canvas-panel">
      <button onClick={handleAddRect} className={buttonClass} title="Rectangle">
        <Square size={18} />
        Rect
      </button>
      <button onClick={handleAddCircle} className={buttonClass} title="Circle">
        <Circle size={18} />
        Circle
      </button>
      <button onClick={handleAddText} className={buttonClass} title="Text">
        <Type size={18} />
        Text
      </button>
      <button onClick={handleImageButtonClick} className={buttonClass} title="Upload image">
        <ImagePlus size={18} />
        Image
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
