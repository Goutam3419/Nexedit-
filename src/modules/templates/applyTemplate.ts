import type { Template } from "@/modules/templates/templateData";
import type { CanvasObject } from "@/store/editorStore";

// Template ke objects me "id" nahi hota (reusable definition), isliye apply
// karte waqt har object ko fresh unique id di jaati hai.
export function instantiateTemplate(template: Template): CanvasObject[] {
  return template.objects.map((obj, index) => ({
    ...obj,
    id: `${template.id}-${Date.now()}-${index}`,
  }));
}
