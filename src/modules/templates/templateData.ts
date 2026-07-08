import type { CanvasObject } from "@/store/editorStore";

export type TemplateCategory =
  | "Instagram"
  | "YouTube"
  | "Resume"
  | "Business Card"
  | "Poster";

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  previewColor: string; // simple color swatch used in gallery card (no image assets needed)
  canvasWidth: number;
  canvasHeight: number;
  // Objects yahan "id" ke bina defined hain — apply karte waqt unique id di jaati hai (see applyTemplate.ts)
  objects: Omit<CanvasObject, "id">[];
}

const base = {
  opacity: 1,
  rotation: 0,
  blendMode: "source-over" as const,
  grayscale: false,
  blurRadius: 0,
  brightness: 0,
  maskShape: "none" as const,
  locked: false,
  visible: true,
};

// Volume 06 — Templates. Har template ek chota starter design hai.
// Real product me yeh sab Firestore "templates" collection se aayenge;
// abhi ke liye code me hi define kiye hain taaki bina backend ke bhi kaam kare.
export const templates: Template[] = [
  {
    id: "tpl-insta-sale",
    name: "Instagram Sale Post",
    category: "Instagram",
    previewColor: "#4F7CFF",
    canvasWidth: 1080,
    canvasHeight: 1080,
    objects: [
      { type: "rect", x: 0, y: 0, width: 1080, height: 1080, fill: "#4F7CFF", name: "Background", ...base },
      { type: "text", x: 80, y: 420, text: "BIG SALE", fontSize: 96, fill: "#FFFFFF", name: "Headline", ...base },
      { type: "text", x: 80, y: 540, text: "Up to 50% off — this week only", fontSize: 36, fill: "#EAF0FF", name: "Subtext", ...base },
    ],
  },
  {
    id: "tpl-insta-quote",
    name: "Instagram Quote Post",
    category: "Instagram",
    previewColor: "#161A20",
    canvasWidth: 1080,
    canvasHeight: 1080,
    objects: [
      { type: "rect", x: 0, y: 0, width: 1080, height: 1080, fill: "#161A20", name: "Background", ...base },
      { type: "text", x: 100, y: 460, text: '"Design is intelligence made visible."', fontSize: 48, fill: "#FFFFFF", name: "Quote", ...base },
    ],
  },
  {
    id: "tpl-yt-thumbnail",
    name: "YouTube Thumbnail",
    category: "YouTube",
    previewColor: "#FF3D3D",
    canvasWidth: 1280,
    canvasHeight: 720,
    objects: [
      { type: "rect", x: 0, y: 0, width: 1280, height: 720, fill: "#0F1115", name: "Background", ...base },
      { type: "circle", x: 1000, y: 360, radius: 220, fill: "#FF3D3D", name: "Accent circle", ...base },
      { type: "text", x: 60, y: 280, text: "I TRIED THIS\nFOR 30 DAYS", fontSize: 72, fill: "#FFFFFF", name: "Headline", ...base },
    ],
  },
  {
    id: "tpl-resume-classic",
    name: "Classic Resume",
    category: "Resume",
    previewColor: "#FFFFFF",
    canvasWidth: 850,
    canvasHeight: 1100,
    objects: [
      { type: "rect", x: 0, y: 0, width: 850, height: 1100, fill: "#FFFFFF", name: "Background", ...base },
      { type: "rect", x: 0, y: 0, width: 260, height: 1100, fill: "#161A20", name: "Sidebar", ...base },
      { type: "text", x: 30, y: 60, text: "Your Name", fontSize: 32, fill: "#FFFFFF", name: "Name", ...base },
      { type: "text", x: 30, y: 110, text: "Product Designer", fontSize: 16, fill: "#9AA4B2", name: "Title", ...base },
      { type: "text", x: 300, y: 60, text: "Experience", fontSize: 24, fill: "#161A20", name: "Section: Experience", ...base },
    ],
  },
  {
    id: "tpl-bizcard",
    name: "Minimal Business Card",
    category: "Business Card",
    previewColor: "#F4F4F4",
    canvasWidth: 1050,
    canvasHeight: 600,
    objects: [
      { type: "rect", x: 0, y: 0, width: 1050, height: 600, fill: "#F4F4F4", name: "Background", ...base },
      { type: "text", x: 60, y: 240, text: "Jane Doe", fontSize: 48, fill: "#161A20", name: "Name", ...base },
      { type: "text", x: 60, y: 300, text: "Creative Director — Studio Co.", fontSize: 20, fill: "#4F4F4F", name: "Role", ...base },
    ],
  },
  {
    id: "tpl-poster-event",
    name: "Event Poster",
    category: "Poster",
    previewColor: "#2E4BB8",
    canvasWidth: 1000,
    canvasHeight: 1400,
    objects: [
      { type: "rect", x: 0, y: 0, width: 1000, height: 1400, fill: "#2E4BB8", name: "Background", ...base },
      { type: "text", x: 60, y: 560, text: "SUMMER\nMUSIC FEST", fontSize: 88, fill: "#FFFFFF", name: "Headline", ...base },
      { type: "text", x: 60, y: 780, text: "August 12 · City Park", fontSize: 30, fill: "#DCE4FF", name: "Details", ...base },
    ],
  },
];

export const templateCategories: TemplateCategory[] = [
  "Instagram",
  "YouTube",
  "Resume",
  "Business Card",
  "Poster",
];
