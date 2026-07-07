import { AI_CONFIG, isOpenAIConfigured } from "@/modules/ai/aiConfig";

// Volume 07 — AI Writer. OpenAI Chat Completions se headlines/captions/copy generate
// karta hai. Response ko newline se split karke multiple suggestions dete hain.
export async function generateCopy(prompt: string): Promise<string[]> {
  if (!isOpenAIConfigured()) {
    throw new Error(
      "AI Writer setup nahi hai. .env me VITE_OPENAI_API_KEY daalein (platform.openai.com se milti hai)."
    );
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_CONFIG.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Tum ek design copywriter ho. User jo bhi maange (headline, caption, tagline, poster text) uske 4 chote alag-alag options do, ek-ek line me, bina numbering ke, koi extra explanation mat do.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`AI Writer fail hua (${response.status}): ${message.slice(0, 150)}`);
  }

  const data = await response.json();
  const text: string = data.choices?.[0]?.message?.content ?? "";
  return text
    .split("\n")
    .map((line) => line.replace(/^[-•\d.\s]+/, "").trim())
    .filter(Boolean);
}
