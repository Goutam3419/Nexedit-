import { AI_CONFIG, isBackgroundRemovalConfigured } from "@/modules/ai/aiConfig";
import { assertNotRateLimited } from "@/modules/security/rateLimit";

// Volume 07 — Background Removal. remove.bg API use karta hai
// (https://www.remove.bg/api — free tier available, API key chahiye).
export async function removeBackgroundFromUrl(imageUrl: string): Promise<string> {
  assertNotRateLimited("bg-removal");
  if (!isBackgroundRemovalConfigured()) {
    throw new Error(
      "Background removal setup nahi hai. .env me VITE_REMOVE_BG_API_KEY daalein (remove.bg se free API key milti hai)."
    );
  }

  // Pehle image URL se blob banate hain (local blob URL ya Firebase Storage URL dono chalega).
  const sourceBlob = await (await fetch(imageUrl)).blob();

  const formData = new FormData();
  formData.append("image_file", sourceBlob);
  formData.append("size", "auto");

  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": AI_CONFIG.removeBgApiKey! },
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`Background removal fail hui (${response.status}): ${message.slice(0, 150)}`);
  }

  const resultBlob = await response.blob();
  return URL.createObjectURL(resultBlob);
}
