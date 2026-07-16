# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A standalone **Vue 3 + Capacitor** rebuild of an Articulate Storyline 3 e-learning
course ("Misi Penjaga Budaya dari Menoreh", SDN Tukharjo) — a story for elementary
students. The original was a decompiled Android APK that ran a thin WebView over
the Storyline HTML5 player; this project reproduces it pixel-for-pixel as a native
Vue app (no Storyline engine) and repackages it as an `.apk`.

The application source lives at the **repo root** (`src/`, `public/`, `android/`).
Legacy decompiled-APK blobs, duplicate raw Storyline exports, the original
Storyline-extraction scripts, and Playwright verification snapshots have been removed
from git — the app is now hand-written Vue components, not a generated data renderer.

> Note: the app identity is "Misi Penjaga Budaya dari Menoreh" (appId
> `com.misipenjagabudaya.menoreh`), matching the repo directory name. Treat this
> Vue project as the source of truth.

### Repo layout

```
./
├── src/                  Vue app (views, components, composables, data)
├── public/assets/        Runtime images + audio (img/, audio/) referenced by string path
├── android/              Capacitor Android shell
├── build-apk.sh          APK build wrapper
├── build-output/         Generated APKs (gitignored)
├── dist/                 Vite build output (gitignored)
├── images-assets/        Reference screenshots only — not loaded by the app
└── plans-rebuild/        Design doc (plan1.md, Indonesian)
```

## Commands (run from repo root)

```bash
npm install
npm run dev          # vite dev server -> http://localhost:5173
npm run build        # type-check + vite build -> dist/  (REQUIRED before cap sync)
npm run type-check   # vue-tsc --build only
npm run lint         # oxlint --fix then eslint --fix (run-s lint:*)
npm run format       # oxfmt src/  (no semicolons, single quotes — see .oxfmtrc.json)
```

There is **no test runner** configured. "Verification" in this project means
running the dev server and checking the stage visually.

### Build the Android APK

Use the wrapper script — it handles SDK resolution, capacitor sync, and keystore
generation:

```bash
./build-apk.sh                 # debug + release (default)
./build-apk.sh debug           # debug only
./build-apk.sh --skip-web      # reuse existing dist/ (skip npm/vite/cap sync)
```

Output APKs land in `./build-output/`. The script auto-writes
`android/local.properties` and auto-generates `android/release.jks` on first
release build (default passwords in the script header — override via env).

Manual equivalent: `npm run build && npx cap sync android && (cd android && ./gradlew assembleDebug)`.

## Architecture

The app is **component-first**: the UI (home menu, popups, the six shared nav
controls) is written as Vue components with their on-stage coordinates baked in. The
only data is a tiny typed list of the 24 story pages plus the quiz questions — a
repeating list is genuinely data; everything else is code.

### Data flow

1. **`src/data/slides.ts`** — the story data layer. Exports:
   - `STAGE = { width: 1280, height: 720 }` (fixed stage).
   - `StorySlide` interface + `SLIDES: StorySlide[]` — 24 entries of
     `{ page, title, background, backgroundAlt, backsound }`. **Pages are addressed by
     1-based number**, which is also the route param (`/slide/:n`) and the prev/next
     chain (`page ± 1`). No opaque Storyline slideIds, no `targetToRoute` indirection.
     Page 1 is the character intro, pages 2–23 are the 22 comic pages (their artwork is
     labelled "Halaman 1"–"Halaman 22", i.e. off by one from `page`), page 24 is the
     Glosarium.
   - `slideByPage(n)` and `PAGE_COUNT` (= 24).
2. **`src/data/quiz.ts`** — the 10 quiz questions (`QUIZ`, `QUIZ_COUNT`); `answer` is a
   0-based index into the 4 options.
3. **Views**
   - `views/SlideView.vue` — a story page: renders the `<img>` background + `<NavControls>`.
     Owns `useSlideAudio()` and the router; maps NavControls intents
     (`home → /`, `prev/next → page±1`, `toggle-audio`). The ends are asymmetric:
     **prev on page 1 goes home, next on page 24 goes to `/kuis`** — that route is the
     only way into the quiz (no menu button, no thumbnail).
   - `views/QuizView.vue` — `/kuis`: one component, three phases (`intro | playing |
     score`). 1 point per correct answer; no per-question right/wrong feedback by design.
     Nothing is persisted — closing the app restarts it.
   - `views/HomeView.vue` — the menu (Halaman Utama): composes `<HomeMenu>` plus one
     open popup, held in a single `popup` ref (`'mulai' | 'petunjuk' | 'tentang' | null`).
     Owns the looping background music + gesture-gating. Menu buttons hide while a popup
     is open (`buttonsHidden`).
3. **Components** (all under `src/components/`, geometry hardcoded in 1280×720 space)
   - `SlideStage.vue` — letterbox host; applies the scale transform and emits
     `hostgesture` on first pointer (used to unblock audio autoplay). Has a `<slot/>`.
   - **The UI chrome is code-built, not PNG.** The home menu buttons, the six nav
     controls, the popup close button, and the Petunjuk/Tentang panels are CSS + inline
     SVG so colors/text re-theme from the `--ui-*` design tokens in
     `src/assets/theme.css` (loaded in `main.ts`; it also bundles the rounded display
     font `public/assets/fonts/Fredoka.ttf` via `@font-face`, `var(--ui-font)`). The old
     image-button primitive `StageButton.vue` is gone; the originals under
     `public/assets/img/{ui,petunjuk,tentang}` are no longer loaded.
   - `icons/UiGlyph.vue` — one inline `<svg>` glyph (`home | arrow | speaker |
     speaker-off | replay | close`) drawn in `currentColor`; `arrow` points right (flip
     via `flip` for "prev").
   - `CircleBadge.vue` — presentational round icon badge (gradient fill + maroon ring +
     `UiGlyph`); reused by `IconButton` and by the Petunjuk legend rows.
   - `IconButton.vue` — the round-control primitive: absolutely-positioned `<button>`
     with **typed props** (`x,y,w,h,name`, `variant?`, `flip?`, `pulse?`, `alt?`)
     wrapping `CircleBadge`; press feedback + click SFX; emits `activate`.
   - `PillButton.vue` — the menu-button primitive: absolutely-positioned lozenge
     (`x,y,w,h,label`, `pulse?`) with the label in `var(--ui-font)`; emits `activate`.
   - `NavControls.vue` — the six controls (home/prev/next + the volume/mute/replay trio,
     exactly one audio variant visible per `audioState`) as `IconButton`s. Presentational;
     emits an `activate(intent)` the parent handles.
   - `HomeMenu.vue` — cover image + Mulai/Petunjuk/Tentang `PillButton`s; emits `open(popup)`.
   - `StagePopup.vue` — shared popup chrome (full-stage scrim + `IconButton` close) with a
     `<slot/>` for the panel; emits `close`.
   - `PetunjukPopup.vue` — code-built tan panel + header plaque + a data-driven legend
     (icon `CircleBadge` + label per row). Each row reads "this icon → tapping it does
     <label>", so the pairing must track `useSlideAudio.toggle()`; there is deliberately
     **no `replay` row** (tracks loop, so that state is unreachable).
     `TentangPopup.vue` — code-built orange panel + header + the developer portrait
     (`assets/img/profil.webp`, `object-fit: cover` in a 248×326 slot) + the developer
     info rows (editable object in `<script>`). Both via `StagePopup`.
   - `MulaiGrid.vue` — "Pilih Halaman": a paged 3×2 thumbnail grid **generated by
     iterating `SLIDES`** (6 per page → 4 pages), laid out with CSS grid. Internal page
     index + prev/next arrows; emits `select(page)` and `close`. Adding a story page to
     `SLIDES` shows up here automatically.

### Key conventions & gotchas

- **Asset paths are plain strings** like `assets/img/page-cover.png` (no leading slash),
  bound dynamically (`:src="…"`). They live in `public/assets/` and are served as-is — do
  **not** use a static `src="assets/…"` attribute (Vite's template compiler tries to
  bundle it and the build fails); keep the binding dynamic so it stays a runtime URL under
  `file://`. The same applies to the bundled font (`@font-face src: url('assets/fonts/…')`
  — relative, no leading slash).
- **Page numbers (1–24) are the navigation order.** The artwork carries its own label,
  which is off by one for the story pages (page 2 is drawn "Halaman 1" … page 23 is
  "Halaman 22") because page 1 is the character intro. `slide.title` is the original
  internal title (kept for reference; titles drift, e.g. page 6's title is "Halaman 6"
  but page 9's is also "Halaman 8"). When writing user-facing docs, use the `page`
  number and explain the offset — see `docs/PANDUAN_PENGGUNAAN.md`.
- **Hash router** (`createWebHashHistory`) is mandatory — HTML5 history routing
  404s inside the Capacitor `file://` WebView on reload/deep-link.
- **`base: './'`** in `vite.config.ts` (relative) so assets resolve under `file://`.
- **Fixed-stage scaling**: `composables/useStageScale.ts` scales 1280×720 to fit
  the viewport (Storyline `noscale` → responsive letterbox). Events bind *inside*
  the scaled `.stage`, so hit-testing stays accurate at any scale.
- **Audio is gesture-gated**: mobile WebViews block autoplay-with-sound until a
  user gesture. `composables/useSlideAudio.ts` is a per-slide state machine
  (`volume`↔`mute`↔`replay`) that surfaces `needsGesture` and retries after the
  first tap (wired through `SlideStage`'s `hostgesture` event). The audio control
  in the top-right shows exactly one of the three variants at a time; `NavControls`
  picks which one from the `audioState` prop `SlideView` passes in.
- `@` aliases `src/` (vite + tsconfig).

### History note (no longer applicable)

This app was originally a data-driven renderer over a generated `src/data/slides.json`,
produced by `scripts/extract-slides.mjs` / `rename-assets.mjs` from the decompiled
Storyline export. That toolchain has been **removed** — the UI is now hand-written
components and the data is a small typed array. Re-extraction is not supported. If it is
ever needed again, the decompiled source still lives at the sibling dir
`/home/abdun/abdun/project/education-project/Lucu-yang-Menyeramkan_1_1.0/`.

`images-assets/` (numbered PNG screenshots) is reference material only and is
not referenced by the Vue runtime.

## App identity (capacitor.config.ts)

- appId `com.misipenjagabudaya.menoreh`, appName "Misi Penjaga Budaya dari Menoreh"
- Locked landscape orientation; `allowMixedContent: true`
- Note: the release keystore alias/password is still `lucumenyeramkan` (see
  `build-apk.sh` defaults) — kept unchanged for signing continuity; it is unrelated
  to the app name and not user-visible.
