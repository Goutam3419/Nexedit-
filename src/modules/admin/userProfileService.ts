import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  serverTimestamp,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import type { User } from "firebase/auth";

export interface UserProfileDoc {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt: Timestamp | null;
  lastLoginAt: Timestamp | null;
}

const COLLECTION = "users";

// Volume 12/10 — Firebase Auth khud saare users list karne ka client-side tarika
// nahi deta (security ke wajah se — sirf Admin SDK/Cloud Functions se hota hai).
// Isliye har login/signup par ek halka profile doc "users" collection me
// upsert karte hain — Admin Panel isi collection se "Users" tab banata hai.
export async function upsertUserProfile(user: User): Promise<void> {
  const ref = doc(db, COLLECTION, user.uid);
  const existing = await getDoc(ref);

  await setDoc(
    ref,
    {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      lastLoginAt: serverTimestamp(),
      // createdAt sirf pehli baar set hota hai, baad ke logins par overwrite nahi hota
      ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true }
  );
}

export async function listAllUsers(): Promise<UserProfileDoc[]> {
  const q = query(collection(db, COLLECTION), orderBy("lastLoginAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as UserProfileDoc);
}
