# Review — Jessica launch film

16 s · 1080×1920 · 30 fps · Arabic (RTL)

## What it is

One idea: **"كتب الوزارة بقت درس"** — the Ministry textbook page becomes a four-step lesson with a
check at the end. The viewer is an Egyptian parent/student who already spends hours reading and gets
nothing back.

Beats: hook (3 hours, no result) → reveal (the book page, inside the app) → the four steps → the
check (4 questions) → end card with the app and the community group.

## Frames reviewed

- 1.4 s — hook: two lines, no letter-spacing (Arabic joins intact), inside the 90% box.
- 5.2 s — reveal: real lesson screen, caption "بدون مفتاح · بدون إنترنت".
- 8.6 s — steps: four rows, real terms screen bleeding from the bottom (intentional).
- 11.8 s — proof: real check screen, "٤ أسئلة تقولك إنت فين".
- 15.0 s — end card: mark, "مجاني · بدون حساب", `is.gd/jessicaapp`, group link.

## Checks

- `npx hyperframes check` → lint 0, layout 0, runtime 0.
- Text was moved to 150 px margins; the remaining platform-rail warnings are silenced with
  `data-layout-allow-safe-zone` because this cut targets the Facebook feed and Reels, where the safe
  box is wider than TikTok's right rail. Do not reuse this film for TikTok without moving the copy.
- Screenshots are the product itself (captured from the local build), not mockups.

## Known gaps

- **No audio yet.** A soft music bed would lift it; nothing is claimed on screen that needs sound.
- The end-card footer sits close to the bottom edge (safe for FB/Reels, tight on Shorts).
