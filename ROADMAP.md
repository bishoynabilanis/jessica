# Jessica — Global Roadmap

**Vision:** any student, in any country, can point Jessica at their own textbook and get a
tutor that speaks their language, on their device, without an account.

Today Jessica is strong where it counts: local-first, offline, 70+ features, official Egyptian
books, and an AI tutor grounded in the real page. The gap to a global product is mostly
**localisation, distribution and trust** — not features.

---

## Where we stand

| Signal | Status |
| --- | --- |
| Lighthouse (live) | Accessibility 96 · Best practices 100 · SEO 100 |
| Bundle | ~897 KB main (269 KB gzip) + lazy chunks |
| Languages | English + Arabic (RTL) |
| Curricula | Egypt only (prep 1–3, primary 4, Term 1) |
| Accounts | none (privacy-first) |
| Backend | none |

---

## Phase 1 — Global-ready core (2–3 weeks)

**Goal:** a student in France, Turkey or Indonesia can finish setup without seeing "Egypt".

1. ✅ **Country & curriculum selector** at setup: Egypt, Gulf, International, Other.
   Learner bands adapt, and the Egyptian catalog only appears for Egypt.
2. ✅ **UI languages**: English, Arabic, French, Spanish, German, Turkish and Indonesian ship with
   on-demand locale packs. Urdu (RTL) and Portuguese next. AI answers follow the UI language.
3. ✅ **Multi-provider AI**: Gemini, OpenAI, Anthropic, OpenRouter and any OpenAI-compatible endpoint.
4. **Accessibility to 100**: main landmarks, focus states, keyboard traps, screen-reader
   labels on icon-only buttons, captions for generated audio.
5. **Public landing page** (static, indexable) with screenshots, feature grid, install guide,
   `hreflang`, sitemap. The app itself stays hash-routed; the landing page brings the traffic.
6. **Trust pages**: Privacy, Terms, Data deletion, "How your key is used", COPPA/GDPR-K notes
   for under-13 use.
7. **Opt-in privacy analytics**: aggregate counts only (no identifiers), off by default.

## Phase 2 — Content at global scale (3–4 weeks)

1. Term 2 for all Egyptian grades; Primary 5–6; Secondary 1–3.
2. A community **book catalog** format (JSON) that anyone can contribute — country, grade,
   subject, term, URL and checksum.
3. Import from Google Drive / Files / camera scan → OCR → book.
4. Better auto unit/chapter detection for unknown books (headings, TOC, page numbering).
5. Question-bank quality: difficulty calibration, distractor quality, topic tagging,
   adaptive practice.

## Phase 3 — Accounts, sync and classrooms (4–6 weeks)

1. **Optional** account with end-to-end encrypted sync (Supabase + client-side key), so a
   student can move between phone and laptop. Local-only stays the default.
2. **Google Classroom / Microsoft Teams / Canvas** integration for assignments and grades.
3. Teacher dashboard: rosters, class progress, question banks, exportable reports.
4. School licences + admin controls (SSO later).

## Phase 4 — Distribution & community (ongoing)

1. Android (TWA/Play) and iOS (Capacitor) builds; Microsoft Store.
2. Share sheets: "open a PDF in Jessica", "explain this screenshot".
3. Study groups, privacy-safe leaderboards, teacher ambassadors.
4. Marketplace for verified content packs (free + paid) with revenue share.
5. Offline small model (WebLLM) for hints without any API key — the ultimate low-connectivity win.

---

## What we will not do

- No ads, no selling data, no mandatory sign-up.
- No tracking that breaks the "everything stays on your device" promise.
- No feature that only works online.
