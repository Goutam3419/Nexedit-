// Volume 14 — Performance: Image Optimization. Upload se pehle badi images ko
// resize + compress karte hain (max dimension 1920px, JPEG quality 0.85).
// Isse Storage cost kam hota hai, upload/download fast hota hai, aur canvas
// render bhi halka rehta hai.
export async function compressImage(file: File, maxDimension = 1920, quality = 0.85): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return file;

  const img = new Image();
  const originalUrl = URL.createObjectURL(file);

  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = originalUrl;
    });

    const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight));
    // Chhoti images ko upscale nahi karte, aur agar already chhoti hai to original hi rakhte hain.
    if (scale >= 1) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob) return file;

    return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(originalUrl);
  }
}
