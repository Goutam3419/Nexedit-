# AI Design Platform — 15-Step Build (Step 1–12 complete)

Yeh Master Roadmap ka actual code hai — React + TypeScript + Vite + Tailwind + Firebase + Zustand + Konva ke saath.

## Build Progress (15 Steps)
1. ✅ Project Foundation
2. ✅ Editor Core — Layers panel, Undo/Redo (Ctrl+Z), Multi-select (Shift+click), Lock/Visibility, Delete key
3. ✅ Editor Tools — Toolbar se Rectangle/Circle/Text/Image add karna (image = local upload)
4. ✅ Editor Advanced — Properties Panel: Opacity, Rotation, Blend Modes, Filters (Grayscale/Blur/Brightness), Circle Mask
5. ✅ Asset Library — Upload panel (Firebase Storage, local-blob fallback agar Firebase connect nahi hai), grid view, click-to-add-to-canvas
6. ✅ Templates Engine — 6 ready templates (Instagram x2, YouTube, Resume, Business Card, Poster), category filter, click-to-apply
7. ✅ Export Engine — PNG/JPG/PDF/SVG export + Batch ZIP (top bar "Export" button)
8. ✅ Firebase Auth — Email/Password + Google sign-in, Login/Signup pages, Protected routes, Navbar me user/logout
9. ✅ User Dashboard — Firestore "projects" collection: create/list/delete real projects; Editor me Save button aur project URL se auto-load
10. ✅ AI Tools Batch 1 — Magic Resize, Background Removal (remove.bg), Magic Eraser (Clipdrop)
11. ✅ AI Tools Batch 2 — AI Image, AI Logo, AI Writer (OpenAI)
12. ✅ Collaboration — **Auto-save** (2 sec debounce), **Live sync** (Firestore real-time listener — dusre collaborator ka edit turant dikhta hai), **Share** (email se collaborator add/remove), **Version History** (har save ka snapshot, restore kar sakte ho), **Comments** (real-time chat-jaisa)
13. 🔲 Admin Panel (real functionality)
14. 🔲 Security + Performance
15. 🔲 Deployment (Final complete website)

## ⚠️ Step 12 ke liye zaroori — Firestore Rules update
Ab projects share bhi ho sakte hain, isliye purani basic rule (sirf ownerId check karti thi)
kaafi nahi hai. Test mode me kaam chalega, lekin real rule kuch aisi honi chahiye
(Step 13 me hum isko finalize karenge):
```
match /projects/{projectId} {
  allow read, write: if request.auth != null && (
    request.auth.uid == resource.data.ownerId ||
    request.auth.token.email in resource.data.sharedWith
  );
  allow create: if request.auth != null;
  match /versions/{versionId} {
    allow read, write: if request.auth != null;
  }
  match /comments/{commentId} {
    allow read, write: if request.auth != null;
  }
}
```

## Note on Step 12 scope (honest limitations)
- **Live Editing** asli Google-Docs-jaisa operational-transform/CRDT nahi hai — yeh
  Firestore ke real-time listener (`onSnapshot`) par based hai. Matlab dusre collaborator
  ka poora canvas update turant sync ho jaata hai, lekin agar do log EXACT same second me
  edit karein to "last write wins" (jo baad me save hua wahi final rahega).
- **Comments** project-level hain (kisi specific object/layer se linked nahi) — object-level
  comments future iteration me add ho sakte hain.
- **Share** email string store karta hai; jab tak woh email se koi Firebase account login
  na kare, unka access "pending" jaisa rahega (Firestore Rules email-match par based hain).

## ⚠️ Firestore Security Rules (abhi test mode chahiye)
Step 13 (Security) me proper Firestore rules likhenge. Tab tak Firebase Console →
Firestore Database → Rules me test mode rakhein (ya khud yeh basic rule daal dein):
```
match /projects/{projectId} {
  allow read, write: if request.auth != null && request.auth.uid == resource.data.ownerId;
  allow create: if request.auth != null;
}
```

## ⚠️ Step 8 ke liye zaroori — real Firebase project chahiye
Ab tak sab kuch bina real backend ke chal raha tha. **Step 8 se aage (Auth) aur Step 9
(Firestore save/load) real Firebase project ke bina kaam nahi karega.** Setup steps:

1. https://console.firebase.google.com par jaake naya project banayein
2. Project settings → "Add app" → Web app → config values copy karein
3. Authentication → Sign-in method → **Email/Password** aur **Google** enable karein
4. Firestore Database banayein (test mode se shuru kar sakte hain)
5. Root folder me `.env` file banayein:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```
6. `npm run dev` restart karein

Bina isके Login/Signup/Save par error dikhega — yeh intentional hai, crash nahi hoga.

## Note on Step 5 (Firebase Storage)
Abhi tak koi real Firebase project connect nahi hai (`src/firebase/config.ts` me sirf stub hai),
isliye uploads automatically local blob URL par fallback ho jaate hain — editor bina backend ke
bhi test karne layak rehta hai. Jab Step 8 me real Firebase project connect hoga, uploads
automatically asli Firebase Storage me jaane lagenge (code already ready hai, sirf `.env` keys chahiye).

## Chalane ke liye
```bash
npm install
npm run dev
```
`.env.example` file ko copy karke `.env` naam dein, phir apni asli keys daalein
(neeche "zaroori" sections me detail hai). **`.env` file kabhi kahin share na karein.**

## Folder → Roadmap Volume mapping

| Folder | Roadmap Volume | Status |
|---|---|---|
| `src/pages/Home.tsx` | — Landing | ✅ Basic version ready |
| `src/pages/Editor.tsx`, `src/modules/editor/` | Volume 04 — Design Editor | 🟡 Sirf canvas + rect/text object base ready |
| `src/store/editorStore.ts` | Volume 04 — History/Objects data layer | 🟡 Basic add/select/remove |
| `src/pages/Dashboard.tsx` | Volume 11 — User Dashboard | 🟡 Empty grid stub |
| `src/pages/Admin.tsx` | Volume 10 — Admin Panel | 🔴 Stub only |
| `src/modules/ai/` | Volume 07 — AI Suite | 🔴 Empty, next major phase |
| `src/modules/assets/` | Volume 05 — Asset Library | 🔴 Empty |
| `src/modules/templates/` | Volume 06 — Templates | 🔴 Empty |
| `src/modules/collaboration/` | Volume 09 — Collaboration | 🔴 Empty |
| `src/firebase/config.ts` | Volume 12 — Backend | 🟡 Config stub, needs real Firebase project |

**Legend:** ✅ Ready · 🟡 Basic/partial · 🔴 Not started

## Agla kadam (jab bologe "aage badho")
1. Editor ko aur strong karna — layers panel, undo/redo, shape/image tools (Volume 04 baaki chapters)
2. Asset Library + Upload system (Volume 05)
3. Templates engine (Volume 06)
4. Firebase Auth wiring + Firestore project schema (Volume 12)

Har baar aap bolo "agla module banao", main isi structure ke andar naye folders/files add karta jaunga — poora project ek hi flow me chalega, koi cheez tootegi nahi.
