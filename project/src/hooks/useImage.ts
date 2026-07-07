import { useEffect, useState } from "react";

// Chota helper hook — image URL se HTMLImageElement banata hai (Konva.Image ko chahiye).
// Aage Volume 05 (Asset Library) is hook ko upload system ke saath reuse karega.
export default function useImage(src?: string): [HTMLImageElement | undefined] {
  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);

  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => setImage(img);
    return () => {
      img.onload = null;
    };
  }, [src]);

  return [image];
}
