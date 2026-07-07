import { useState } from "react";
import clsx from "clsx";
import { templates, templateCategories, type TemplateCategory } from "@/modules/templates/templateData";
import { instantiateTemplate } from "@/modules/templates/applyTemplate";
import { useEditorStore } from "@/store/editorStore";

// Volume 06 — Templates Engine panel. Category select karke gallery dekho,
// click karte hi poora canvas us template se replace ho jaata hai
// (agar current canvas khaali nahi hai to bhi — undo se wapas laa sakte ho).
export default function TemplatesPanel() {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("Instagram");
  const loadObjects = useEditorStore((s) => s.loadObjects);
  const setDesignSize = useEditorStore((s) => s.setDesignSize);

  const filtered = templates.filter((t) => t.category === activeCategory);

  function handleApply(templateId: string) {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    const objects = instantiateTemplate(template);
    loadObjects(objects);
    setDesignSize(template.canvasWidth, template.canvasHeight);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1 flex-wrap px-3 pt-3 pb-2">
        {templateCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={clsx(
              "text-[11px] px-2.5 py-1 rounded-full transition-colors",
              activeCategory === cat
                ? "bg-brand-600 text-white"
                : "bg-white/5 text-white/50 hover:bg-white/10"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 p-3 overflow-y-auto flex-1">
        {filtered.map((template) => (
          <button
            key={template.id}
            onClick={() => handleApply(template.id)}
            className="group text-left rounded-md overflow-hidden border border-canvas-border hover:border-brand-500 transition-colors"
            title={`Apply "${template.name}"`}
          >
            <div
              className="aspect-[4/5] flex items-end p-2"
              style={{ backgroundColor: template.previewColor }}
            >
              <span className="text-[10px] text-white/90 bg-black/30 rounded px-1.5 py-0.5">
                {template.canvasWidth}×{template.canvasHeight}
              </span>
            </div>
            <div className="px-2 py-1.5 text-[11px] text-white/70 group-hover:text-white">
              {template.name}
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-2 text-xs text-white/30 text-center mt-4">
            Is category me abhi koi template nahi
          </p>
        )}
      </div>
    </div>
  );
}
