import { create } from "zustand";

export interface AssetItem {
  id: string;
  url: string;
  name: string;
  type: "photo" | "video" | "audio" | "icon";
  createdAt: number;
}

interface AssetState {
  assets: AssetItem[];
  uploading: boolean;
  addAsset: (asset: AssetItem) => void;
  removeAsset: (id: string) => void;
  setUploading: (v: boolean) => void;
}

// Volume 05 — Asset Library data layer. Abhi session-only (in-memory) hai;
// Step 8-9 me Firestore collection "assets" ke saath persist hone lagega
// (per-user history) jab Auth wire ho jayega.
export const useAssetStore = create<AssetState>((set) => ({
  assets: [],
  uploading: false,
  addAsset: (asset) => set((state) => ({ assets: [asset, ...state.assets] })),
  removeAsset: (id) => set((state) => ({ assets: state.assets.filter((a) => a.id !== id) })),
  setUploading: (v) => set({ uploading: v }),
}));
