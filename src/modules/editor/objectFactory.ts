import type { CanvasObject } from "@/store/editorStore";

let counters: Record<string, number> = { rect: 0, circle: 0, text: 0, image: 0 };

function nextId(type: string) {
  counters[type] = (counters[type] ?? 0) + 1;
  return `${type}-${Date.now()}-${counters[type]}`;
}

// Step 4 defaults — sab naye objects in properties ke saath banenge
// taaki PropertiesPanel unhe turant control kar sake.
const advancedDefaults = {
  opacity: 1,
  rotation: 0,
  blendMode: "source-over" as const,
  grayscale: false,
  blurRadius: 0,
  brightness: 0,
  maskShape: "none" as const,
};

export function createRect(): CanvasObject {
  const n = ++counters.rect;
  return {
    id: nextId("rect"),
    type: "rect",
    x: 120,
    y: 120,
    width: 160,
    height: 100,
    fill: "#4F7CFF",
    name: `Rectangle ${n}`,
    locked: false,
    visible: true,
    ...advancedDefaults,
  };
}

export function createCircle(): CanvasObject {
  const n = ++counters.circle;
  return {
    id: nextId("circle"),
    type: "circle",
    x: 200,
    y: 200,
    radius: 60,
    fill: "#FF7A59",
    name: `Circle ${n}`,
    locked: false,
    visible: true,
    ...advancedDefaults,
  };
}

export function createText(): CanvasObject {
  const n = ++counters.text;
  return {
    id: nextId("text"),
    type: "text",
    x: 140,
    y: 140,
    text: "Type here",
    fontSize: 24,
    fill: "#FFFFFF",
    name: `Text ${n}`,
    locked: false,
    visible: true,
    ...advancedDefaults,
  };
}

export function createImage(src: string): CanvasObject {
  const n = ++counters.image;
  return {
    id: nextId("image"),
    type: "image",
    x: 100,
    y: 100,
    width: 240,
    height: 240,
    fill: "transparent",
    src,
    name: `Image ${n}`,
    locked: false,
    visible: true,
    ...advancedDefaults,
  };
}
