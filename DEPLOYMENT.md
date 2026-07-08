# Final Setup & Deployment Guide

Yeh guide poora process cover karti hai — Firebase project banane se lekar
Vercel par live deploy karne tak. Step-by-step follow karein.

---

## Part 1 — Firebase Project banayein (sirf aap kar sakte hain, Google login chahiye)

1. https://console.firebase.google.com kholein, Google account se login karein
2. "Add project" → naam dein (e.g. "ai-design-platform") → Continue → project ban jaayega
3. Project ke andar "</> " (Web app) icon par click karein → app naam dein → "Register app"
4. Jo `firebaseConfig` object dikhega, uski 6 values kahin note kar lein (agla step me chahiye):
   - apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId

### Authentication enable karein
5. Left sidebar → Build → Authentication → "Get started"
6. "Sign-in method" tab → Email/Password → Enable → Save
7. Wapas "Sign-in method" → Google → Enable → Save

### Firestore Database banayein
8. Left sidebar → Build → Firestore Database → "Create database"
9. "Start in test mode" chunein (baad me hum real rules daal denge) → Enable

### Storage enable karein
10. Left sidebar → Build → Storage → "Get started" → Next → Done

### Security Rules publish karein (zaroori — Step 14 se)
11. Firestore Database → Rules tab → is project ki `firestore.rules` file ka poora content
    copy-paste karein → "Publish"
12. Storage → Rules tab → `storage.rules` file ka content copy-paste karein → "Publish"

---

## Part 2 — Local setup (Termux ya kisi bhi computer par)

```bash
# 1. Project folder me jaayein (jahan ZIP extract ki hai)
cd project

# 2. Dependencies install karein
npm install

# 3. Interactive setup chalayein — yeh Firebase/AI keys poochega aur khud .env bana dega
npm run setup

# 4. Project chalayein
npm run dev
```

Terminal me jo link dikhega (e.g. `http://localhost:5173`), use browser me kholein.

**Test karein:** Sign up karein → Dashboard khulna chahiye → "Naya design" → Editor khulna
chahiye → kuch shape add karke Save karein → Firebase Console → Firestore Database me
"projects" collection me naya document dikhna chahiye.

---

## Part 3 — GitHub par push karein (Vercel deploy ke liye zaroori)

```bash
git init
git add .
git commit -m "Initial commit — AI Design Platform"
```

Phir GitHub.com par naya (empty) repository banayein, aur:
```bash
git remote add origin <aapke-repo-ka-URL>
git branch -M main
git push -u origin main
```

**Zaroori:** `.env` file `.gitignore` me hai, isliye woh GitHub par nahi jaayegi (jaisa hona
chahiye — keys public repo me nahi jaani chahiye).

---

## Part 4 — Vercel par Deploy karein

1. https://vercel.com par jaayein, GitHub se sign in karein
2. "Add New" → "Project" → apna GitHub repo select karein → "Import"
3. Vercel khud detect kar lega ki yeh Vite project hai (Framework: Vite)
4. **Environment Variables** section me apni sab `.env` values ek-ek karke add karein
   (VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, ... sab)
5. "Deploy" dabayein — 1-2 minute me live ho jaayega, ek URL milega
   (e.g. `https://ai-design-platform.vercel.app`)

### Firebase Console me deployed domain allow karein
6. Firebase Console → Authentication → Settings → "Authorized domains" → apna Vercel
   domain (`xxx.vercel.app`) add karein — warna Login/Signup live site par kaam nahi karega

---

## Part 5 — Live test aur error fixing

Live site par sab kuch test karein: Signup, Editor, Templates, Export, AI tools (agar keys
di hain), Admin Panel (agar apna email `VITE_ADMIN_EMAILS` me daala hai).

**Agar Vercel build logs me koi error aaye**, ya browser console me koi red error dikhe:
uska poora text copy karke share karein — us hisaab se fix kiya jaayega.

Common cheezein jo galti se miss ho sakti hain:
- Vercel me Environment Variables add karna bhool jaana
- Firebase "Authorized domains" me Vercel URL add na karna
- Firestore/Storage Rules publish na karna (test mode expire hone par sab kuch fail hoga)
