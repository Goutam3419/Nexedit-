import type Konva from "konva";

// Konva.Stage instance ko yahan store karte hain (module-level, jaise objectFactory
// ke counters). Canvas.tsx isko set karta hai, exportService.ts isko read karta hai.
// Yeh Volume 04 (Canvas) aur Volume 08 (Export Engine) ke beech ka simple bridge hai.
export const stageRef: { current: Konva.Stage | null } = { current: null };
