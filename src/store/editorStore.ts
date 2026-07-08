import { create } from "zustand";

export type BlendMode =
  | "source-over"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten";

export type CanvasObject = {
  id: string;
  type: "rect" | "circle" | "text" | "image";
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  fontSize?: number;
  fill: string;
  src?: string;
  name: string;
  locked: boolean;
  visible: boolean;

  // Step 4 — Editor Advanced
  opacity: number; // 0 to 1
  rotation: number; // degrees
  blendMode: BlendMode;
  grayscale: boolean;
  blurRadius: number; // 0 = no blur
  brightness: number; // -1 to 1, 0 = normal
  maskShape: "none" | "circle"; // simple mask support
  crop?: { x: number; y: number; width: number; height: number }; // image crop only
};

interface HistorySnapshot {
  objects: CanvasObject[];
}

interface EditorState {
  objects: CanvasObject[];
  selectedIds: string[];

  // Step 10 — AI Tools: design page size (Magic Resize target), erase-tool state
  designWidth: number;
  designHeight: number;
  eraseMode: boolean;
  eraseRect: { x: number; y: number; width: number; height: number } | null;
  setDesignSize: (width: number, height: number) => void;
  scaleDesign: (newWidth: number, newHeight: number) => void;
  setEraseMode: (on: boolean) => void;
  setEraseRect: (rect: { x: number; y: number; width: number; height: number } | null) => void;

  // history (undo/redo) — Step 2
  past: HistorySnapshot[];
  future: HistorySnapshot[];

  addObject: (obj: CanvasObject) => void;
  loadObjects: (objs: CanvasObject[]) => void;
  loadObjectsSilent: (objs: CanvasObject[]) => void;
  updateObject: (id: string, patch: Partial<CanvasObject>) => void;
  removeObject: (id: string) => void;

  // selection — multi-select support
  selectObject: (id: string, additive?: boolean) => void;
  clearSelection: () => void;

  // layers — reordering + lock/visibility
  reorderObject: (id: string, direction: "up" | "down") => void;
  toggleLock: (id: string) => void;
  toggleVisible: (id: string) => void;

  // history actions
  undo: () => void;
  redo: () => void;
}

const baseDefaults = {
  opacity: 1,
  rotation: 0,
  blendMode: "source-over" as const,
  grayscale: false,
  blurRadius: 0,
  brightness: 0,
  maskShape: "none" as const,
};

const initialObjects: CanvasObject[] = [
  { id: "demo-rect", type: "rect", x: 80, y: 80, width: 200, height: 120, fill: "#4F7CFF", name: "Rectangle 1", locked: false, visible: true, ...baseDefaults },
  { id: "demo-text", type: "text", x: 100, y: 220, text: "Double-click to edit", fontSize: 20, fill: "#FFFFFF", name: "Text 1", locked: false, visible: true, ...baseDefaults },
];

// Har state-changing action se pehle current objects ko "past" me push karte hain,
// taaki undo() usko wapas laa sake. Yehi standard undo/redo pattern hai.
function pushHistory(state: EditorState): Partial<EditorState> {
  return {
    past: [...state.past, { objects: state.objects }],
    future: [],
  };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  objects: initialObjects,
  selectedIds: [],
  past: [],
  future: [],

  designWidth: 1080,
  designHeight: 1080,
  eraseMode: false,
  eraseRect: null,

  setDesignSize: (width, height) => set({ designWidth: width, designHeight: height }),

  // Step 10 — Magic Resize. Design ke naye target size ke hisaab se sab objects
  // ko proportionally scale + reposition karta hai (non-uniform scale X/Y).
  scaleDesign: (newWidth, newHeight) =>
    set((state) => {
      const scaleX = newWidth / state.designWidth;
      const scaleY = newHeight / state.designHeight;
      const scaled = state.objects.map((o) => ({
        ...o,
        x: o.x * scaleX,
        y: o.y * scaleY,
        width: o.width !== undefined ? o.width * scaleX : o.width,
        height: o.height !== undefined ? o.height * scaleY : o.height,
        radius: o.radius !== undefined ? o.radius * ((scaleX + scaleY) / 2) : o.radius,
        fontSize: o.fontSize !== undefined ? o.fontSize * ((scaleX + scaleY) / 2) : o.fontSize,
      }));
      return {
        ...pushHistory(state),
        objects: scaled,
        designWidth: newWidth,
        designHeight: newHeight,
      };
    }),

  setEraseMode: (on) => set({ eraseMode: on, eraseRect: null }),
  setEraseRect: (rect) => set({ eraseRect: rect }),

  addObject: (obj) =>
    set((state) => ({
      ...pushHistory(state),
      objects: [...state.objects, obj],
    })),

  // Step 12 — Collaboration: remote se aaya update. History me push nahi karte
  // (warna dusre user ka edit hamare Undo button se galti se undo ho sakta hai).
  loadObjectsSilent: (objs) => set({ objects: objs }),

  // Step 6 — Templates Engine. Poora canvas ek template ke objects se replace karta hai.
  loadObjects: (objs) =>
    set((state) => ({
      ...pushHistory(state),
      objects: objs,
      selectedIds: [],
    })),

  updateObject: (id, patch) =>
    set((state) => ({
      ...pushHistory(state),
      objects: state.objects.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    })),

  removeObject: (id) =>
    set((state) => ({
      ...pushHistory(state),
      objects: state.objects.filter((o) => o.id !== id),
      selectedIds: state.selectedIds.filter((sid) => sid !== id),
    })),

  selectObject: (id, additive = false) =>
    set((state) => ({
      selectedIds: additive
        ? state.selectedIds.includes(id)
          ? state.selectedIds.filter((sid) => sid !== id)
          : [...state.selectedIds, id]
        : [id],
    })),

  clearSelection: () => set({ selectedIds: [] }),

  reorderObject: (id, direction) =>
    set((state) => {
      const index = state.objects.findIndex((o) => o.id === id);
      if (index === -1) return {};
      const swapWith = direction === "up" ? index + 1 : index - 1;
      if (swapWith < 0 || swapWith >= state.objects.length) return {};
      const newObjects = [...state.objects];
      [newObjects[index], newObjects[swapWith]] = [newObjects[swapWith], newObjects[index]];
      return { ...pushHistory(state), objects: newObjects };
    }),

  toggleLock: (id) =>
    set((state) => ({
      objects: state.objects.map((o) => (o.id === id ? { ...o, locked: !o.locked } : o)),
    })),

  toggleVisible: (id) =>
    set((state) => ({
      objects: state.objects.map((o) => (o.id === id ? { ...o, visible: !o.visible } : o)),
    })),

  undo: () => {
    const state = get();
    if (state.past.length === 0) return;
    const previous = state.past[state.past.length - 1];
    set({
      objects: previous.objects,
      past: state.past.slice(0, -1),
      future: [{ objects: state.objects }, ...state.future],
    });
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return;
    const next = state.future[0];
    set({
      objects: next.objects,
      past: [...state.past, { objects: state.objects }],
      future: state.future.slice(1),
    });
  },
}));
