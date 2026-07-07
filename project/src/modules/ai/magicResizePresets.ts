export interface ResizePreset {
  name: string;
  width: number;
  height: number;
}

// Volume 07 — Magic Resize presets. Volume 06 (Templates) ki common sizes se match karte hain.
export const resizePresets: ResizePreset[] = [
  { name: "Instagram Post", width: 1080, height: 1080 },
  { name: "Instagram Story", width: 1080, height: 1920 },
  { name: "YouTube Thumbnail", width: 1280, height: 720 },
  { name: "Facebook Post", width: 1200, height: 630 },
  { name: "A4 Print (px @ 300dpi)", width: 2480, height: 3508 },
  { name: "Business Card", width: 1050, height: 600 },
];
