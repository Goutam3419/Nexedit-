import { create } from "zustand";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "@/firebase/config";

interface AuthState {
  user: User | null;
  loading: boolean; // initial auth-check loading (avoids flash of "logged out" on refresh)
  error: string | null;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  clearError: () => void;
}

// Volume 12 — Authentication. Firebase Auth ke saath real signup/login/logout.
// onAuthStateChanged listener neeche subscribeToAuth() me hai — App.tsx isko
// ek baar mount hote hi call karega taaki refresh ke baad bhi session bana rahe.
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  signUp: async (name, email, password) => {
    set({ error: null });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(cred.user, { displayName: name });
    } catch (err: any) {
      set({ error: mapAuthError(err) });
      throw err;
    }
  },

  signIn: async (email, password) => {
    set({ error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      set({ error: mapAuthError(err) });
      throw err;
    }
  },

  signInWithGoogle: async () => {
    set({ error: null });
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err: any) {
      set({ error: mapAuthError(err) });
      throw err;
    }
  },

  logOut: async () => {
    await signOut(auth);
  },

  clearError: () => set({ error: null }),
}));

// Real Firebase project connect hone tak yeh calls fail honge (network-request-failed
// ya invalid-api-key) — us case me UI ek clear error dikhayega, crash nahi karega.
function mapAuthError(err: any): string {
  const code = err?.code ?? "";
  if (code.includes("auth/invalid-api-key") || code.includes("auth/api-key"))
    return "Firebase project abhi connect nahi hai. .env me real Firebase keys daalein.";
  if (code.includes("auth/email-already-in-use")) return "Yeh email pehle se registered hai.";
  if (code.includes("auth/invalid-credential") || code.includes("auth/wrong-password"))
    return "Email ya password galat hai.";
  if (code.includes("auth/user-not-found")) return "Is email se koi account nahi mila.";
  if (code.includes("auth/weak-password")) return "Password kam se kam 6 characters ka ho.";
  return err?.message ?? "Kuch galat ho gaya, phir try karein.";
}

// App.tsx me ek baar call hoga taaki auth state hamesha sync rahe.
export function subscribeToAuth() {
  return onAuthStateChanged(auth, (user) => {
    useAuthStore.setState({ user, loading: false });
    // Volume 10 — Admin Panel ke "Users" tab ke liye halka profile track karte hain.
    if (user) {
      import("@/modules/admin/userProfileService").then(({ upsertUserProfile }) => {
        upsertUserProfile(user).catch((err) => console.warn("User profile sync fail:", err));
      });
    }
  });
}
