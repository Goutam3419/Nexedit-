import { AI_CONFIG, isOpenAIConfigured } from "@/modules/ai/aiConfig";

// Volume 07 — AI Image. OpenAI Images API use karta hai (model: gpt-image-1 / dall-e-3).
// Yeh AI Logo tool bhi isi function ko style-specific prompt ke saath reuse karta hai.
export async function generateImage(prompt: string): Promise<string> {
  if (!isOpenAIConfigured()) {
    throw new Error(
      "AI Image setup nahi hai. .env me VITE_OPENAI_API_KEY daalein (platform.openai.com se milti hai)."
    );
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_CONFIG.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`AI Image generation fail hui (${response.status}): ${message.slice(0, 150)}`);
  }

  const data = await response.json();
  const imageUrl = data.data?.[0]?.url;
  if (!imageUrl) throw new Error("AI se koi image nahi mili, phir try karein.");
  return imageUrl;
}

// AI Logo — "AI Image" ko hi ek logo-specific prompt prefix ke saath call karta hai.
export async function generateLogo(idea: string): Promise<string> {
  const styledPrompt = `Minimal, modern vector-style logo design for: "${idea}". Flat colors, simple shapes, centered on a plain white background, no text unless specified, professional branding style.`;
  return generateImage(styledPrompt);
}
