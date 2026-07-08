import { useState } from "react";
import { PenLine, Loader2 } from "lucide-react";
import { generateCopy } from "@/modules/ai/aiWriter";
import { isOpenAIConfigured } from "@/modules/ai/aiConfig";
import { useEditorStore } from "@/store/editorStore";
import { createText } from "@/modules/editor/objectFactory";

// Volume 07 — AI Writer. Headline/caption/tagline ke 4 suggestions deta hai,
// kisi ek par click karke seedhe canvas me text object add ho jaata hai.
export default function AIWriterSection() {
  const addObject = useEditorStore((s) => s.addObject);
  const selectObject = useEditorStore((s) => s.selectObject);
  const updateObject = useEditorStore((s) => s.updateObject);

  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setError(null);
    setBusy(true);
    setSuggestions([]);
    try {
      const results = await generateCopy(prompt);
      setSuggestions(results);
    } catch (err: any) {
      setError(err.message ?? "AI Writer suggestions nahi mile");
    } finally {
      setBusy(false);
    }
  }

  function handleAddText(text: string) {
    const obj = createText();
    addObject(obj);
    updateObject(obj.id, { text });
    selectObject(obj.id);
  }

  return (
    <div className="border-t border-canvas-border pt-4">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-white/40 mb-2">
        <PenLine size={13} /> AI Writer
      </div>
      {!isOpenAIConfigured() && (
        <p className="text-[11px] text-white/30 mb-2">
          Setup chahiye: `.env` me VITE_OPENAI_API_KEY daalein.
        </p>
      )}
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Kaisa text chahiye? (e.g. 'sale poster headline')"
        className="w-full bg-canvas-bg border border-canvas-border rounded-md px-2 py-1.5 text-xs outline-none focus:border-brand-500 mb-2"
      />
      <button
        onClick={handleGenerate}
        disabled={busy || !prompt.trim()}
        className="w-full flex items-center justify-center gap-2 text-xs py-2 rounded-md bg-brand-600 hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        {busy && <Loader2 size={13} className="animate-spin" />}
        Generate suggestions
      </button>

      {error && <p className="text-[11px] text-red-300 mt-2">{error}</p>}

      {suggestions.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-3">
          {suggestions.map((text, i) => (
            <button
              key={i}
              onClick={() => handleAddText(text)}
              className="text-left text-xs px-2.5 py-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
              title="Canvas me text ke roop me add karein"
            >
              {text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
