import { AI_CONFIG, isMagicEraserConfigured } from "@/modules/ai/aiConfig";
import { assertNotRateLimited } from "@/modules/security/rateLimit";

// Volume 07 — Magic Eraser. Clipdrop "Cleanup" API use karta hai
// (https://clipdrop.co/apis/docs/cleanup — inpainting: mask ke white area ko
// AI se hataata/fill karta hai). Mask: same size PNG, jahan erase karna hai
// wahan white, baaki black.
export async function eraseAreaFromImage(imageUrl: string, maskDataUrl: string): Promise<string> {
  assertNotRateLimited("magic-eraser");
  if (!isMagicEraserConfigured()) {
    throw new Error(
      "Magic Eraser setup nahi hai. .env me VITE_CLIPDROP_API_KEY daalein (clipdrop.co se key milti hai)."
    );
  }

  const imageBlob = await (await fetch(imageUrl)).blob();
  const maskBlob = await (await fetch(maskDataUrl)).blob();

  const formData = new FormData();
  formData.append("image_file", imageBlob);
  formData.append("mask_file", maskBlob);

  const response = await fetch("https://clipdrop-api.co/cleanup/v1", {
    method: "POST",
    headers: { "x-api-key": AI_CONFIG.clipdropApiKey! },
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`Magic Eraser fail hua (${response.status}): ${message.slice(0, 150)}`);
  }

  const resultBlob = await response.blob();
  return URL.createObjectURL(resultBlob);
}

// Editor me user jo rectangle draw karta hai (image ke relative x/y/w/h), usse
// ek black/white mask PNG banata hai jo image ke actual pixel dimensions match kare.
export async function buildMaskFromRect(
  imageUrl: string,
  rect: { x: number; y: number; width: number; height: number },
  imageDisplayWidth: number,
  imageDisplayHeight: number
): Promise<string> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = imageUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;

  // Poora canvas black (kuch bhi erase nahi)
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Display coordinates ko actual image pixel coordinates me convert karte hain
  const scaleX = img.naturalWidth / imageDisplayWidth;
  const scaleY = img.naturalHeight / imageDisplayHeight;

  ctx.fillStyle = "white";
  ctx.fillRect(rect.x * scaleX, rect.y * scaleY, rect.width * scaleX, rect.height * scaleY);

  return canvas.toDataURL("image/png");
}
