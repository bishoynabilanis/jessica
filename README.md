# Jessica — AI Learning Universe 🌙

A fully client-side, gamified study PWA for **Egyptian First Preparatory language-school students**.
Jessica reads the actual textbook page with the student, explains it, quizzes them, and turns revision into a game —
with **no backend, no accounts and no subscriptions**.

The whole interface is available in **English and Arabic** (full RTL layout, Cairo typography and Arabic-first AI answers).
واجهة التطبيق متاحة بالكامل باللغتين **الإنجليزية والعربية** مع دعم كامل للاتجاه من اليمين لليسار وردود ذكية بالعربية.

> **Bring your own key (BYOK):** the AI runs on the student's own Google Gemini API key. Every request goes
> straight from the browser to Google. Nothing is proxied, stored on a server or shared.

---

## ✨ What's inside

| Area | Features |
| --- | --- |
| **Reading** | Local PDF viewer with selectable text layer, highlight → explain / ELI5 / translate / save, saved highlights, page-grounded AI tutor, page OCR for scanned PDFs, zoom & fullscreen |
| **AI tutor** | Streaming chat, Socratic mode, role-play personas, Arabic & Egyptian-Arabic answers, KaTeX math, read-aloud (TTS) and voice input (STT) |
| **Study** | Adaptive daily plan, unit practice hub, cached per-unit question banks, skills map with exam readiness, achievements and printable certificates, unit summaries (offline + read-aloud), mistake notebook with explain-my-mistake and drills, quizzes, flashcards with SM-2 spaced repetition, cheat-sheet PDF, 5-day planner, mind maps (Mermaid), podcast mode, comic strips, essay grader |
| **Practice** | Timed mock exams with question navigator, flags, autosave/resume and extra time, printable worksheets with answer keys, reading-fluency coach, class assignments via link/QR, teacher question studio and class CSV, pronunciation coach, vision solver (camera), virtual labs, peer battles via URL/QR |
| **Motivation** | XP & levels, daily streaks, rotating quests, coins, evolving mascot with looks/cosmetics, daily riddle, learning constellation, gentle proactive nudges |
| **Comfort** | Dark/light themes, text scaling, Atkinson Hyperlegible (dyslexia-friendly), reduced motion, offline shell, local notifications, question read-aloud, crash boundary, global search (⌘K) |
| **Privacy** | Everything in `localStorage` + IndexedDB, JSON backup/restore, full ZIP backup with books and flashcards, one-click wipe, parent WhatsApp report generated on-device |
| **Languages** | English + Arabic UI, one-tap language switch in the top bar, Settings and onboarding, RTL layout, Arabic AI answers and prompts |
| **Primary mode** | A separate kids world for Primary 4: its own shell and routes, bright world theme, floating scenery, big controls, daily gift and stickers, sticker book, badges, parent gate, read-to-me page reader and age-appropriate explanations |

The 7th-grade curriculum covers **English, Arabic, German, French, Science, Mathematics and Social Studies**.

---

## 🚀 Quick start

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production build → dist/
npm run preview      # preview the production build
```

Requirements: **Node.js 18+** and npm.

### Get a Gemini key

1. Open [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Create a free API key.
3. Paste it in the onboarding screen or in **Settings → Gemini API key → Save & test**.

The key is saved only in this browser's `localStorage`. The app works without a key for reading,
flashcards, the vault, planner, labs and games — AI features unlock when a key is present.

---

## 📚 Official Egyptian book library

Jessica ships with a catalogue of the **official Ministry of Education books** for the preparatory
stage plus **Primary 4** (Term 1), covering English, Arabic, Mathematics, Science, Social Studies and French.

The AI adapts its teaching style to the imported book: Primary 4 gets very short sentences, concrete examples and simpler quizzes, while preparatory grades keep the teen-level depth.

Switching the **Stage** to Primary (Library, Settings or onboarding) opens **Jessica Kids**: a completely separate world with its own navigation, home, library, play area, cards, buddy page and parent-gated settings. It adds a daily gift (stars + collectible sticker), a daily star goal, streak encouragement, continue-reading, a 3-minute play shortcut, a 12-sticker book, badges, a read-to-me page button, a guided 5-minute lesson (read → play → reward, saved and resumable), tap-a-word helper with pronunciation and meanings, karaoke-style read-aloud highlighting, voice answers, a lesson mystery box, an illustrated adventure map, a parent dashboard with a daily time limit, a daily reminder, parent-set tasks with star rewards, week-over-week comparison, a weekly WhatsApp report and a printable PDF — with no advanced controls. Preparatory mode is unchanged, and the two stages keep separate books and progress.

The catalogue lives in `src/data/officialBooks.ts` and points at the ministry's public PDF blobs
(`elearnningcontent.blob.core.windows.net`). The ministry portal itself blocks access from outside
Egypt, but the PDF files are public.

**Why the PDFs are not bundled:** the books are 6–136 MB each; the full Term 1 set is over 700 MB,
which cannot be shipped in a static deployment. Instead:

1. Pick the grade, term and subject in the **Library**.
2. Tap **Download PDF** — the official file opens in a new tab; save it.
3. Tap **Import**, choose the saved file, and confirm.

The app then reads the PDF locally, indexes every page into IndexedDB and detects its units, so the
tutor, quizzes, flashcards and the unit rail all work from the real book — even offline afterwards.
Text-based PDFs only: a scanned image PDF with no text layer cannot be indexed (use the Vision solver).

To add or correct a catalogue entry, edit `src/data/officialBooks.ts`; no rebuild script is needed.
Books imported by the student are stored in IndexedDB (`pdf:<bookId>` + `chapter:<bookId>`), never uploaded.

> The textbooks are © Ministry of Education and Technical Education, Egypt, distributed free to students.
> They are downloaded by the student for personal study and are not redistributed by this app.

---

## 🌍 Deployment & automatic updates

The build is 100% static. `vite.config.ts` uses `base: './'`, so the same `dist/` works at a domain root
**or** in a sub-path (GitHub Pages project sites). The app is a PWA, so visitors can install it on
Android/iOS/desktop and it keeps working offline.

> ⚠️ **Egypt note:** `*.netlify.app` subdomains are blocked by Egyptian ISPs (verified on the Netlify
> forum and r/Egypt_Developers), so a Netlify Drop link shows a blank/blocked page inside Egypt even
> though it opens everywhere else. Use GitHub Pages, Vercel, Firebase Hosting, or a custom domain.
> See [`DEPLOY-AR.md`](./DEPLOY-AR.md) for Arabic step-by-step instructions.

### Option A — Vercel (recommended, 2 minutes)

1. Create a GitHub repository and push this project.
2. In Vercel: **Add New → Project → Import** the repository.
3. Vercel reads `vercel.json`: build `npm run build`, output `dist`.
4. Deploy. Every push to `main` deploys automatically to the same public URL.

### Option B — GitHub Pages (free)

1. Create a repository on GitHub and push this project to `main`.
2. Repository **Settings → Pages → Source: GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) builds and publishes on every push.
4. The public URL appears under **Settings → Pages** (and in the Actions run).

### Option C — Netlify

Import the repository; `netlify.toml` already sets build command, publish directory and no-cache
headers for `sw.js`.

### How updates reach installed users

- The service worker is registered with `updateViaCache: 'none'` and checks for a new version:
  - every 30 minutes,
  - whenever the app becomes visible again,
  - when the browser checks after navigation.
- When a new worker takes control, the page reloads once automatically, so the new bundle runs.
- Progress, books, cards and settings are stored locally, so the reload keeps everything.
- `sw.js` and `index.html` are served with `must-revalidate`, preventing a stale shell.
- Users can always force an update by closing and reopening the installed app, or by refreshing.

### Install on a phone

- **Android/Chrome:** open the site → menu → **Install app** (or the install button in Settings).
- **iPhone/Safari:** Share → **Add to Home Screen**.
- **Desktop:** install icon in the address bar.

---

## 🔐 Privacy & security model

- **No backend.** There is no database, no analytics and no account system.
- **API key** lives in `localStorage` and is sent directly to `generativelanguage.googleapis.com`.
  Anyone with access to the unlocked device/browser profile can read it — treat it like a password and
  never commit it to a repository.
- **Study data** (XP, streaks, notes, planner, exams, flashcards, chats) stays in `localStorage` and
  IndexedDB on the device.
- **Backups** exported from Settings contain progress and settings but **never the API key**.
- **Parent report** is composed locally and only leaves the device when the student taps WhatsApp.
- Vision images are sent to Gemini for the single request and are not stored by the app.

### Static-PWA limitations

- Daily riddle notifications fire at/after **16:00 only while the app is open** (or on the next open).
  True background push requires a server, which this project intentionally avoids.
- AI features need an internet connection; the reader, books, flashcards, vault, planner and labs work offline.
- pdf.js serves CMap files from a CDN for some non-Latin PDFs. Arabic text extraction therefore needs a
  connection the first time; the rendered page itself is cached.

---

## 🧱 Tech stack

React 18 · TypeScript · Vite · TailwindCSS · Zustand (persisted) · React Router (hash) ·
pdfjs-dist · IndexedDB (`idb`) · react-markdown + remark-math/rehype-katex · Mermaid ·
jsPDF · qrcode · Framer Motion · lucide-react.

### Project layout

```
public/
  icons/                 PWA icons
  manifest.webmanifest
  sw.js                  service worker
scripts/
  generate-icons.mjs     SVG/PNG icon generator (npm run icons)
src/
  components/
    common/              shared page chrome, book cards, key notices
    layout/              shell, sidebar, top bar, mobile nav, quick panel
    reader/              PdfViewer, ReaderChat, ReaderStudio
    tools/               16 AI/study tools (quiz, SRS, exam, vision, podcast…)
    ui/                  buttons, cards, modals, toggles, markdown
  data/                  official book catalogue, riddles, mascots, personas
  hooks/                 PWA install, notifications, idle detector, study timer
  lib/                   gemini, prompts, pdf, SRS, speech, audio, export, battle
  pages/                 Dashboard, Library, Reader, StudyHub, Games, Labs,
                         Constellation, Vault, Mascot, Settings, Battle
  store/                 useApp (profile/progress), useUI (toasts)
```

### IndexedDB & storage keys

| Store | Key / name | Contents |
| --- | --- | --- |
| localStorage | `jessica-profile-v1` | XP, streaks, settings, vault, planner, exams, mascot |
| IndexedDB | `pdf:<bookId>` | Imported official PDF bytes |
| IndexedDB | `chapter:<bookId>` | Extracted per-book text cache + units |
| IndexedDB | `chat:<bookId>` | Tutor conversations per book |
| IndexedDB | `cards` | Flashcards + SRS scheduling |

---

## 🧪 Quality checks

```bash
npm run build     # strict TypeScript + production bundle
```

The production build has been smoke-tested in Chromium for: onboarding → dashboard, official library with
grade/term/subject filters, importing a real 112-page ministry PDF with unit detection, reader navigation,
studio tool grid, whiteboard, study hub, arcade, labs, constellation, vault, mascot, settings, peer battle,
parent report, daily riddle and theme/model switching.

---

## 🇪🇬 بالعربي السريع

- التطبيق **مجاني بالكامل** وبدون سيرفر: كل البيانات بتتخزن على جهازك فقط.
- محتاج **مفتاح Gemini مجاني** من Google AI Studio عشان تشغّل المدرس الذكي.
- مكتبة الوزارة الرسمية جاهزة داخل التطبيق: اختار الصف والترم والمادة، نزّل الـPDF واستورده مرة واحدة.
- الكتب مش مضمّنة في المشروع بسبب أحجامها (6–136 ميجا للكتاب)، وبتتخزن على جهازك بعد الاستيراد.
- بعد أي تعديل: `npm run build` وارفع مجلد `dist` على Vercel أو GitHub Pages.
- مفتاح الـ API بيتخزن في المتصفح فقط — متشاركوش مع حد ومتضيفوش على GitHub.
- الإشعارات اليومية بتشتغل والتطبيق مفتوح فقط، لأن التطبيق ثابت بدون سيرفر.

---

Made with care for curious minds. **تعلّم، العب، واكبر.** 🦊✨
