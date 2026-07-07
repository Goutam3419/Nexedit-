// Volume 07 — AI Suite config. Yeh third-party AI APIs ke keys .env se padhta hai.
// Real product me yeh calls Cloud Functions ke peeche honi chahiye (taaki keys client
// me expose na ho) — abhi scaffold stage me directly client se call kar rahe hain,
// taaki feature turant test ho sake. Step 13 (Security) me isko backend-proxy
// pattern me migrate karna recommended hai.
export const AI_CONFIG = {
  removeBgApiKey: import.meta.env.VITE_REMOVE_BG_API_KEY as string | undefined,
  clipdropApiKey: import.meta.env.VITE_CLIPDROP_API_KEY as string | undefined,
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY as string | undefined,
};

export function isBackgroundRemovalConfigured() {
  return Boolean(AI_CONFIG.removeBgApiKey);
}

export function isMagicEraserConfigured() {
  return Boolean(AI_CONFIG.clipdropApiKey);
}

export function isOpenAIConfigured() {
  return Boolean(AI_CONFIG.openaiApiKey);
}
