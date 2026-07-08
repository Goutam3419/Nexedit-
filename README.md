# AI Design Platform — 15-Step Build ✅ COMPLETE (Step 1–15)

Yeh Master Roadmap ka actual code hai — React + TypeScript + Vite + Tailwind + Firebase + Zustand + Konva ke saath.

## 🎉 Poora 15-Step build complete ho chuka hai!
**Ab kya karna hai:** `DEPLOYMENT.md` file kholein — usme Firebase project banane se lekar
Vercel par live deploy karne tak, poora step-by-step process hai.

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
12. ✅ Collaboration — Auto-save, Live sync, Share, Version History, Comments
13. ✅ Admin Panel — Email allow-list access, real Users list, Templates read-only gallery
14. ✅ Security + Performance — Firestore/Storage rules, Audit Logs, Rate limiting, Code splitting, Image compression
15. ✅ Deployment — **`npm run setup`** (interactive .env generator), `vercel.json` (SPA routing), GitHub Actions build-check CI, poori `DEPLOYMENT.md` guide (Firebase → GitHub → Vercel → live test)

## Quick Start
```bash
npm install
npm run setup   # Firebase/AI keys interactively poochega, khud .env banayega
npm run dev
```
Poora deployment process (Firebase Console se Vercel tak) ke liye **`DEPLOYMENT.md`** dekhein.

## ⚠️ Step 13 ke liye zaroori — Admin access setup
`.env` me apna email daalein taaki `/admin` khul sake:
```
VITE_ADMIN_EMAILS=you@example.com,teammate@example.com
```
Bina iske `/admin` page "Access denied" dikhayega (login hone ke baad bhi).

## ⚠️ Step 14 ke liye zaroori — Firestore/Storage Rules deploy karna
Ab tak Firestore/Storage "test mode" me the (sab authenticated users sab kuch kar sakte the).
**`firestore.rules` aur `storage.rules` files ab root folder me hain — inhe Firebase Console
me copy-paste karna zaroori hai:**

1. Firebase Console → Firestore Database → Rules tab → `firestore.rules` ka content paste karein → Publish
2. Firebase Console → Storage → Rules tab → `storage.rules` ka content paste karein → Publish

Bina iske test mode 30 din baad expire ho sakta hai aur app kaam karna band kar dega.

## Note on Step 14 scope (honest limitations)
- **Rate limiting** abhi sirf client-side hai (galti se double-click rokta hai) — koi determined
  abuser DevTools se bypass kar sakta hai. Real protection ke liye server-side rate limiting
  (Cloud Functions ya API Gateway) chahiye — yeh AI calls ko backend-proxy me move karne
  (jo pehle bhi note kiya tha) ke saath hi karna sahi rahega.
- **Audit Logs** sirf likhe ja sakte hain, client se padhe nahi ja sakte (jaan-boojh kar —
  taaki koi apna trail na dekh/badal sake). Inhe dekhne ke liye Firebase Console → Firestore
  → "auditLogs" collection manually check karni hogi, ya future me ek Cloud Function/Admin
  dashboard banega jo inhe securely dikhaye.
- **Backup strategy:** Firestore ka automatic daily backup Firebase Console → Firestore →
  Backups se enable hota hai (ya `gcloud firestore export`) — yeh infrastructure-level setting
  hai, code me nahi hoti.
- **Encryption:** Firebase khud hi data ko at-rest aur in-transit encrypt karta hai (Google Cloud
  ki default security) — isके liye humein alag se kuch likhne ki zaroorat nahi thi.
- **Virtualization:** abhi Layers list ya Dashboard grid me virtualization (bahut zyada items
  hone par) nahi hai — humare current scale (dozens of objects/projects) ke liye zaroorat
  nahi thi; agar future me hazaaron objects/projects ho to `react-window` jaisi library add
  karni chahiye.

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
npm run setup   # interactive — Firebase/AI keys poochega, khud .env bana dega
npm run dev
```
Ya manually: `.env.example` file ko copy karke `.env` naam dein, phir apni asli keys daalein.
**`.env` file kabhi kahin share na karein.**

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
