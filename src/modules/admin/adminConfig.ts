// Volume 10 — Admin Panel access control.
// Abhi ke liye simple env-based allow-list use kar rahe hain (Cloud Functions
// + custom claims real production ke liye better hote, lekin woh Node backend
// maangte hain jo abhi scope se bahar hai — Step 14/15 me consider karein).
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminList = (import.meta.env.VITE_ADMIN_EMAILS as string | undefined) ?? "";
  const allowList = adminList
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowList.includes(email.toLowerCase());
}
