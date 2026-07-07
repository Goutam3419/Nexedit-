import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import type { CanvasObject } from "@/store/editorStore";

export interface ProjectDoc {
  id: string;
  name: string;
  ownerId: string;
  objects: CanvasObject[];
  sharedWith: string[]; // collaborator emails — Volume 09 (Collaboration)
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface VersionDoc {
  id: string;
  objects: CanvasObject[];
  savedAt: Timestamp | null;
}

export interface CommentDoc {
  id: string;
  authorEmail: string;
  text: string;
  createdAt: Timestamp | null;
}

const COLLECTION = "projects";

// Volume 12 — Firestore schema: "projects" collection.
// Doc shape: { name, ownerId, objects, sharedWith, createdAt, updatedAt }
// Subcollections: projects/{id}/versions (Version History), projects/{id}/comments (Comments)

export async function createProject(ownerId: string, name: string): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    name,
    ownerId,
    objects: [],
    sharedWith: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// Ab owned + shared (collaborator) dono tarah ke projects milte hain.
export async function listUserProjects(ownerId: string, email: string | null): Promise<ProjectDoc[]> {
  const ownedQuery = query(
    collection(db, COLLECTION),
    where("ownerId", "==", ownerId),
    orderBy("updatedAt", "desc")
  );
  const ownedSnap = await getDocs(ownedQuery);
  const owned = ownedSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProjectDoc, "id">) }));

  if (!email) return owned;

  const sharedQuery = query(
    collection(db, COLLECTION),
    where("sharedWith", "array-contains", email)
  );
  const sharedSnap = await getDocs(sharedQuery);
  const shared = sharedSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProjectDoc, "id">) }));

  const merged = [...owned, ...shared.filter((s) => !owned.some((o) => o.id === s.id))];
  return merged;
}

export async function loadProject(projectId: string): Promise<ProjectDoc | null> {
  const snap = await getDoc(doc(db, COLLECTION, projectId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<ProjectDoc, "id">) };
}

// Volume 09 — Live Editing (simplified). Real Google-Docs-jaisa operational
// transform nahi hai; yeh Firestore ka real-time listener hai — jab bhi koi
// collaborator save karta hai, baaki sab ke paas kuch second me update aa jaata hai.
export function subscribeToProject(
  projectId: string,
  onUpdate: (project: ProjectDoc) => void
): Unsubscribe {
  return onSnapshot(doc(db, COLLECTION, projectId), (snap) => {
    if (snap.exists()) {
      onUpdate({ id: snap.id, ...(snap.data() as Omit<ProjectDoc, "id">) });
    }
  });
}

export async function saveProject(
  projectId: string,
  objects: CanvasObject[],
  name?: string
): Promise<void> {
  await setDoc(
    doc(db, COLLECTION, projectId),
    {
      objects,
      ...(name ? { name } : {}),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deleteProject(projectId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, projectId));
}

// ---------- Volume 09 — Collaboration: Share / Teams ----------

export async function addCollaborator(projectId: string, email: string): Promise<void> {
  await setDoc(doc(db, COLLECTION, projectId), { sharedWith: arrayUnion(email) }, { merge: true });
}

export async function removeCollaborator(projectId: string, email: string): Promise<void> {
  await setDoc(doc(db, COLLECTION, projectId), { sharedWith: arrayRemove(email) }, { merge: true });
}

// ---------- Volume 09 — Version History ----------
// Har save par (auto ya manual) ek snapshot subcollection me push hota hai.

export async function saveVersionSnapshot(projectId: string, objects: CanvasObject[]): Promise<void> {
  await addDoc(collection(db, COLLECTION, projectId, "versions"), {
    objects,
    savedAt: serverTimestamp(),
  });
}

export async function listVersions(projectId: string): Promise<VersionDoc[]> {
  const q = query(
    collection(db, COLLECTION, projectId, "versions"),
    orderBy("savedAt", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<VersionDoc, "id">) }));
}

// ---------- Volume 09 — Comments ----------

export async function addComment(projectId: string, authorEmail: string, text: string): Promise<void> {
  await addDoc(collection(db, COLLECTION, projectId, "comments"), {
    authorEmail,
    text,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToComments(
  projectId: string,
  onUpdate: (comments: CommentDoc[]) => void
): Unsubscribe {
  const q = query(collection(db, COLLECTION, projectId, "comments"), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CommentDoc, "id">) })));
  });
}
