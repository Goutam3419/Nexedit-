import { storage } from "@/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export interface UploadResult {
  url: string;
  path: string;
  usedFirebase: boolean;
}

// Volume 05 — Upload system. Firebase Storage me file upload karta hai.
// Agar Firebase project connect nahi hai (jaise abhi is scaffold stage me),
// to error pakadke local blob URL par fallback kar deta hai — taaki editor
// bina real backend ke bhi kaam karta rahe. Step 8 me real Firebase project
// connect hone ke baad yeh automatically Storage use karne lagega.
export async function uploadAsset(file: File, folder: string = "assets"): Promise<UploadResult> {
  const path = `${folder}/${Date.now()}-${file.name}`;
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return { url, path, usedFirebase: true };
  } catch (err) {
    console.warn("Firebase Storage upload failed, using local blob URL fallback:", err);
    const url = URL.createObjectURL(file);
    return { url, path, usedFirebase: false };
  }
}
