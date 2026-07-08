import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { generateLogo } from "@/modules/ai/aiImage";
import { isOpenAIConfigured } from "@/modules/ai/aiConfig";
import { useEditorStore } from "@/store/editorStore";
import { createImage } from "@/modules/editor/objectFactory";

// Volume 07 — AI Logo. "AI Image" service ko hi ek logo-specific prompt ke
// saath call karta hai (see aiImage.ts → generateLogo).
export default function AILogoSection() {
  const addObject = useEditorStore((s) => s.addObject);
  const selectObject = useEditorStore((s) => s.selectObject);

  const [idea, setIdea] = useState("");
  const [busy, setBusy] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!idea.trim()) return;
    setError(null);
    setBusy(true);
    setResultUrl(null);
    try {
      const url = await generateLogo(idea);
      setResultUrl(url);
    } catch (err: any) {
      setError(err.message ?? "AI Logo generate nahi ho paaya");
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
        <Sparkles size={13} /> AI Logo
      </div>
      {!isOpenAIConfigured() && (
        <p className="text-[11px] text-white/30 mb-2">
          Setup chahiye: `.env` me VITE_OPENAI_API_KEY daalein.
        </p>
      )}
      <input
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder="Business/brand ka naam ya idea (e.g. 'organic coffee shop')"
        className="w-full bg-canvas-bg border border-canvas-border rounded-md px-2 py-1.5 text-xs outline-none focus:border-brand-500 mb-2"
      />
      <button
        onClick={handleGenerate}
        disabled={busy || !idea.trim()}
        className="w-full flex items-center justify-center gap-2 text-xs py-2 rounded-md bg-brand-600 hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        {busy && <Loader2 size={13} className="animate-spin" />}
        Generate Logo
      </button>

      {error && <p className="text-[11px] text-red-300 mt-2">{error}</p>}

      {resultUrl && (
        <div className="mt-3">
          <img
            src={resultUrl}
            alt="AI generated logo"
            className="w-full rounded-md border border-canvas-border bg-white"
          />
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
