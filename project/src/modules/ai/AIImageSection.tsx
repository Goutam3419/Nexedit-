import { useState } from "react";
import { ImageIcon, Loader2 } from "lucide-react";
import { generateImage } from "@/modules/ai/aiImage";
import { isOpenAIConfigured } from "@/modules/ai/aiConfig";
import { useEditorStore } from "@/store/editorStore";
import { createImage } from "@/modules/editor/objectFactory";

// Volume 07 — AI Image. Prompt se image banata hai aur "Add to canvas" se
// seedhe editor me daal deta hai.
export default function AIImageSection() {
  const addObject = useEditorStore((s) => s.addObject);
  const selectObject = useEditorStore((s) => s.selectObject);

  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setError(null);
    setBusy(true);
    setResultUrl(null);
    try {
      const url = await generateImage(prompt);
      setResultUrl(url);
    } catch (err: any) {
      setError(err.message ?? "AI Image generate nahi ho paayi");
    } finally {
      setBusy(false);
    }
  }

  function handleAddToCanvas() {
    if (!resultUrl) return;
    const obj = createImage(resultUrl);
    addObject(obj);
    selectObject(obj.id);
  }

  return (
    <div className="border-t border-canvas-border pt-4">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-white/40 mb-2">
        <ImageIcon size={13} /> AI Image
      </div>
      {!isOpenAIConfigured() && (
        <p className="text-[11px] text-white/30 mb-2">
          Setup chahiye: `.env` me VITE_OPENAI_API_KEY daalein.
        </p>
      )}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Jaisa image chahiye uska description likhein..."
        rows={2}
        className="w-full bg-canvas-bg border border-canvas-border rounded-md px-2 py-1.5 text-xs outline-none focus:border-brand-500 mb-2 resize-none"
      />
      <button
        onClick={handleGenerate}
        disabled={busy || !prompt.trim()}
        className="w-full flex items-center justify-center gap-2 text-xs py-2 rounded-md bg-brand-600 hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        {busy && <Loader2 size={13} className="animate-spin" />}
        Generate
      </button>

      {error && <p className="text-[11px] text-red-300 mt-2">{error}</p>}

      {resultUrl && (
        <div className="mt-3">
          <img src={resultUrl} alt="AI generated" className="w-full rounded-md border border-canvas-border" />
          <button
            onClick={handleAddToCanvas}
            className="w-full mt-2 text-xs py-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
          >
            Add to canvas
          </button>
        </div>
      )}
    </div>
  );
}
