import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, Loader2 } from "lucide-react";
import {
  exportAsPNG,
  exportAsJPG,
  exportAsPDF,
  exportAsSVG,
  exportBatchZip,
} from "@/modules/export/exportService";

// Volume 08 — Export Engine UI. Editor top bar me "Export" button, click pe
// PNG/JPG/PDF/SVG/Batch ZIP ke options dikhte hain.
export default function ExportMenu() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  async function run(fn: () => void | Promise<void>) {
    setError(null);
    setBusy(true);
    try {
      await fn();
    } catch (err: any) {
      setError(err.message ?? "Export fail ho gaya");
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  const items = [
    { label: "PNG", action: () => exportAsPNG() },
    { label: "JPG", action: () => exportAsJPG() },
    { label: "PDF", action: () => exportAsPDF() },
    { label: "SVG", action: () => exportAsSVG() },
    { label: "Batch ZIP (PNG+JPG+SVG)", action: () => exportBatchZip() },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        className="flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-xs text-white hover:bg-brand-700 transition-colors"
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        Export
        <ChevronDown size={12} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-56 bg-canvas-panel border border-canvas-border rounded-md shadow-lg z-50 overflow-hidden">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => run(item.action)}
              className="w-full text-left px-3 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="absolute right-0 mt-1 w-56 bg-red-950 border border-red-800 text-red-200 text-[11px] rounded-md px-3 py-2 z-50">
          {error}
        </div>
      )}
    </div>
  );
}
