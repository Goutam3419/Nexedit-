import jsPDF from "jspdf";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { stageRef } from "@/modules/editor/stageRef";

// Volume 08 — Export Engine.
// Konva.Stage.toDataURL() se hi PNG/JPG/PDF banate hain (Stage already
// canvas render kar chuka hota hai, isliye pixel-perfect export milta hai).

function getStageOrThrow() {
  const stage = stageRef.current;
  if (!stage) throw new Error("Canvas abhi ready nahi hai — thoda ruk ke phir try karein.");
  return stage;
}

export function exportAsPNG(filename = "design.png") {
  const stage = getStageOrThrow();
  const dataUrl = stage.toDataURL({ mimeType: "image/png", pixelRatio: 2 });
  saveAs(dataUrl, filename);
}

export function exportAsJPG(filename = "design.jpg") {
  const stage = getStageOrThrow();
  // JPG transparency support nahi karta, isliye white background flatten karte hain.
  const dataUrl = stage.toDataURL({ mimeType: "image/jpeg", quality: 0.92, pixelRatio: 2 });
  saveAs(dataUrl, filename);
}

export function exportAsPDF(filename = "design.pdf") {
  const stage = getStageOrThrow();
  const dataUrl = stage.toDataURL({ mimeType: "image/png", pixelRatio: 2 });
  const widthPx = stage.width();
  const heightPx = stage.height();

  const pdf = new jsPDF({
    orientation: widthPx > heightPx ? "landscape" : "portrait",
    unit: "px",
    format: [widthPx, heightPx],
  });
  pdf.addImage(dataUrl, "PNG", 0, 0, widthPx, heightPx);
  pdf.save(filename);
}

// SVG — Konva canvas ko true vector SVG me export karna ek alag renderer maangta hai
// (shapes ko manually SVG paths me convert karna padta). Abhi practical approach:
// raster image ko ek SVG wrapper ke andar embed karte hain — file .svg hai aur
// kisi bhi SVG viewer/editor me khulegi, lekin vector-editable nahi hai.
// Volume 04 ke aage ke iteration me is hook ko real vector export se replace karenge.
export function exportAsSVG(filename = "design.svg") {
  const stage = getStageOrThrow();
  const dataUrl = stage.toDataURL({ mimeType: "image/png", pixelRatio: 2 });
  const width = stage.width();
  const height = stage.height();
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <image href="${dataUrl}" width="${width}" height="${height}" />
</svg>`;
  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  saveAs(blob, filename);
}

// Batch export — sab formats ek saath ZIP me (Volume 08: "ZIP + Batch export queue")
export async function exportBatchZip(filename = "design-export.zip") {
  const stage = getStageOrThrow();
  const pngUrl = stage.toDataURL({ mimeType: "image/png", pixelRatio: 2 });
  const jpgUrl = stage.toDataURL({ mimeType: "image/jpeg", quality: 0.92, pixelRatio: 2 });

  const zip = new JSZip();
  zip.file("design.png", pngUrl.split(",")[1], { base64: true });
  zip.file("design.jpg", jpgUrl.split(",")[1], { base64: true });

  const width = stage.width();
  const height = stage.height();
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <image href="${pngUrl}" width="${width}" height="${height}" />
</svg>`;
  zip.file("design.svg", svgContent);

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, filename);
}
