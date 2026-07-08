// Volume 13 — Rate Limiting (client-side, basic). Har "key" (e.g. "ai-image")
// ke liye minimum gap enforce karta hai taaki galti se ek hi button bar-bar
// click karke AI API credits waste na ho. Real production me server-side
// rate limiting (Cloud Functions + Firestore counter, ya API Gateway) zaroori
// hai — yeh client-side sirf accidental double-click se bachaata hai, kisi
// determined abuser ko nahi rok sakta (woh dev tools se bypass kar sakta hai).
const lastCallTimestamps = new Map<string, number>();

export function assertNotRateLimited(key: string, minIntervalMs: number = 3000) {
  const now = Date.now();
  const last = lastCallTimestamps.get(key) ?? 0;
  if (now - last < minIntervalMs) {
    const waitSeconds = Math.ceil((minIntervalMs - (now - last)) / 1000);
    throw new Error(`Thoda ruk jaayein — ${waitSeconds} second baad phir try karein.`);
  }
  lastCallTimestamps.set(key, now);
}
