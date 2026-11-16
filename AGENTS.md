# AGENTS.md — Jessica (تطبيق التعليم الشامل)

Read this before touching the repo. It describes how this project actually works, not how it "usually" works elsewhere.

## What this is

**Jessica** is a client-only, gamified study PWA for Egyptian students (Primary 1–6, Preparatory 1–3). It reads the official Ministry books, explains pages with a BYOK AI key, and generates practice, plans and reports **entirely on the device**.

Hard constraints, do not violate:

1. **No backend, no accounts, no server calls** except the user's own AI provider and the optional anonymous counter. Everything else runs in the browser.
2. **Arabic-first**, Egypt-first. Seven UI languages: `ar, en, fr, es, de, tr, id`.
3. **Brand colours are fixed**: mint `#21e6c9`, violet `#6b8cff`, deep navy surfaces. Never re-theme the product to match a trend or a reference video.
4. Works **offline** after first load (service worker + IndexedDB).
5. The AI key is optional; every non-AI feature must work without one.

## Stack

- React 18 + TypeScript 5.6 (strict) + Vite 5, `react-router-dom` 6 (hash routing, `#/route`).
- Tailwind 3 with a small `@layer` extension in `src/index.css`; `cn()` helper in `src/lib/utils.ts`.
- State: **zustand 5** with `persist` (`src/store/useApp.ts`, key `jessica-profile-v1`, version 3), UI store `src/store/useUI.ts`.
- Local data: **IndexedDB via `idb`** (`src/lib/db.ts`) for book bytes, chapter text, quizzes, flashcards; localStorage for the profile blob and small flags.
- Heavy libs are lazy: `pdfjs-dist`, `jspdf`, `mermaid`, `katex`, `qrcode`, `html2canvas` — keep new imports lazy too.
- E2E: **Playwright** (`@playwright/test`), 27 spec files in `tests/e2e`.

## Commands

```bash
npm run dev              # vite dev server
npm run build            # tsc -b && vite build  → dist/
npm run preview -- --port 4174 --strictPort --host 127.0.0.1   # what Playwright uses
npm run test:e2e         # playwright test (builds nothing — build first)
npm run audit:seo        # node scripts/audit-seo.mjs  → must print "no problems found"
npm run content          # regenerate quiz/guides/topics/install/seo/feed pages
```

Rules of thumb:

- **Always `npm run build` before `npm run test:e2e`.** The tests run against `dist` through `vite preview`; a stale build produces false failures.
- Playwright starts its own preview server on **4174** with `channel: 'chrome'` (not bundled Chromium). Do not point it at another port.
- Node 20 in CI (`deploy.yml`), Node ≥20 locally.

## Repo map

```
src/
  App.tsx            routes; every page is lazy via src/pages/lazy.ts
  pages/             39 route components (Bank, Focus, Profiles, Course, Lesson, …)
  components/        shared UI (PageHeader, Card, Button, QuickStart, Mascot …)
  lib/               pure logic: questionBank, unitReview, bankHistory, course, lesson,
                     placement, units, dailyPlan, backup, db, gemini, shareCard …
  store/             zustand stores (useApp persisted, useUI ephemeral)
  i18n/              tr() + locale dictionaries (ar inline, others in locales/)
  data/              static catalogs (books, mascots, subjects)
  kids/              separate playful shell for Primary grades
public/
  welcome/           static marketing/SEO site (landing, grades, quiz, topics, bank, focus, install, en/)
  icons/, og.jpg, sitemap.xml, stats.json, feed.xml
scripts/             generators + audit (see below)
tests/e2e/           27 Playwright specs
marketing/           growth assets: posts, stories, films (not shipped)
```

## Architecture rules

- **Routing**: add a page in `src/pages`, export it through `src/pages/lazy.ts`, then register the route in `src/App.tsx`. Never import a heavy page eagerly.
- **State**: user progress goes through `useApp` actions (`addXP`, `recordSkill`, `recordStudy`, `recordUnitScore`, `addMistake`, `removeMistake`, `updateBookUnits`, …). Do not write to localStorage directly for profile data; use `src/lib/*` helpers for small side stores (e.g. `profiles.ts`, `bankHistory.ts`).
- **Persistence**: schema changes to the profile blob need care — persisted state is versioned (3). Additive fields are fine; renaming/removing needs a migration or a safe fallback read.
- **i18n**: every user-visible string goes through `tr('English key', { vars })`. New keys must be added to `src/i18n/index.tsx` (Arabic) **and** all six files in `src/i18n/locales/`. Keys are English sentences with `{placeholders}`; Arabic-Indic digits come from `num()`.
- **Arabic text**: chapter/unit detection lives in `src/lib/units.ts` — headings are matched with `matchArabicHeading` and ordinals normalised. Do not hardcode Arabic unit names.
- **Math in RTL**: Arabic-Indic digits are weak-directional. Pure math strings must be isolated (`<bdi dir="ltr">`) or they mirror inside Arabic sentences. `Bank.tsx` has the `RichText` helper for exactly this.
- **Printing**: print-only views use the `worksheet-print` / `print-report` / `cert-print` classes in `src/index.css`. Multi-page papers render through a **portal to `document.body`** plus the `bank-print-mode` body class; without that, absolutely-positioned content is clipped to one page.
- **Kids mode**: grades 1–6 open the `src/kids` shell regardless of route. Anything aimed at those grades must exist inside the kids shell, or be reachable through parent settings.
- **AI**: `src/lib/gemini.ts` is the only gateway. Never hardcode keys, never send data anywhere except the user's chosen provider, and keep every AI feature optional with a graceful non-AI fallback.

## Static site, SEO and generated pages

`public/welcome/` is a real marketing site. Some of it is **generated** — do not hand-edit generated output unless you also fix the generator:

- `scripts/generate-quiz.mjs` → `public/welcome/quiz/**`
- `scripts/generate-topics.mjs` → `public/welcome/topics/**`
- `scripts/generate-install.mjs` → `public/welcome/install/**`
- `scripts/generate-seo.mjs` → `public/welcome/grades/**` + `public/sitemap.xml`
- `scripts/generate-feed.mjs` → `public/welcome/feed.xml`

Hand-written (safe to edit directly): `public/welcome/index.html`, `bank/`, `focus/`, `en/**`, `style.css`.

**Any new page must pass `npm run audit:seo`**: unique `<title>` ≤ 65 chars, description 60–165 chars, exactly one `<h1>`, canonical URL, ≥ 220 words, no internal broken links, and entries in `sitemap.xml` **and** the `urls` array in `scripts/generate-seo.mjs` (otherwise the next generator run drops it).

Arabic pages pair with English ones through reciprocal `hreflang` (`ar`, `en`, `x-default`) and a visible language switch in the header.

## Testing recipe

- Seed a profile with `addInitScript` before `page.goto`, **guarded** with `if (localStorage.getItem('jessica-profile-v1')) return` — otherwise a reload re-seeds and breaks switching tests.
- Minimal seed: `jessica-profile-v1` (`{ state: { onboarded: true, acceptedTerms: 1, name, apiKey: '', model, xp, streak, coins, customBooks: [...], completedTopics: [], skillStats: {}, mistakes: [], dailyLog: {}, settings: { language: 'en', gradeLevel: 7, curriculum: 'egypt', schoolType: 'government', primaryUi: 'auto', aiProvider: 'gemini', theme: 'dark', keyOptional: true, quickStart: false } }, version: 3 }`) plus `jessica-disclaimer-v1 = '1'`.
- Use `data-testid` for behaviour, roles/names for a11y. Avoid asserting on generated numbers — the bank is randomised.
- Run the affected spec, then the full suite before committing.

## Deployment

- Push to `main` → `.github/workflows/deploy.yml` builds with `npm ci && npm run build` and publishes `dist` to GitHub Pages (`https://bishoynabilanis.github.io/jessica/`).
- GitHub Pages takes ~60–100 s to serve a new build; polling immediately gives 404/503. Verify after a wait, not instantly.
- `e2e.yml` runs the Playwright suite in CI; `seo-watch.yml` checks indexing; `stats.yml` archives anonymous counters into `public/stats.json`.

## Anti-patterns (do not do these)

- Adding a backend, a database, login, analytics SDKs, or any third-party script that phones home.
- Storing or logging API keys; committing `.env` files.
- Rewriting generated marketing pages by hand without updating their generator.
- Shipping a new page without `sitemap.xml` + `audit:seo` green.
- Adding English-only text in a component instead of `tr()` — or adding a key to some locales only.
- Hosting story/post artwork inside `public/` (keep it in `marketing/`, ship nothing unused).
- Changing the brand palette, or restyling to imitate a reference video.
- Leaving `dist/`, `test-results/`, `*.tsbuildinfo`, or scratch scripts in a commit.
- Deleting a failing test instead of diagnosing it.

## Where the product is heading

Roadmap lives in `ROADMAP.md`. The current differentiator is the **question bank** (`/bank`): procedural, offline, explained questions with a timed exam, a printable sheet, a mistakes notebook, a unit review and a weekly paper. Marketing assets and the published log live in `marketing/growth/`.
