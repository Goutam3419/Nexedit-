import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuthStore } from "@/store/authStore";

// Volume 13 — Audit Logs. Important actions (delete, share, admin access) ko
// "auditLogs" collection me record karte hain. Firestore Rules (firestore.rules)
// me is collection ko client se READ nahi hone diya — sirf write, taaki koi
// apne trail ko chhup ke padh/badal na sake. Real review Firebase Console ya
// Cloud Function se hona chahiye.
export async function logAction(action: string, meta: Record<string, unknown> = {}): Promise<void> {
  const user = useAuthStore.getState().user;
  try {
    await addDoc(collection(db, "auditLogs"), {
      uid: user?.uid ?? "anonymous",
      email: user?.email ?? null,
      action,
      meta,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    // Audit log fail hone se main feature block nahi hona chahiye — sirf console warn karein.
    console.warn("Audit log fail:", err);
  }
}
