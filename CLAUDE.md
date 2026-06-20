# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A standalone **Vue 3 + Capacitor** rebuild of an Articulate Storyline 3 e-learning
course ("Lucu yang Menyeramkan", SDN Tukharjo) — a fabel story for elementary
students. The original was a decompiled Android APK that ran a thin WebView over
the Storyline HTML5 player; this project reproduces it pixel-for-pixel as a native
Vue app (no Storyline engine) and repackages it as an `.apk`.

The application source lives at the **repo root** (`src/`, `public/`, `android/`,
`scripts/`). Legacy decompiled-APK blobs, duplicate raw Storyline exports, and
Playwright verification snapshots have been removed from git.

> Note: the repo directory is named `Misi-Penjaga-Budaya-dari-Menoreh` but the
> app identity is still "Lucu yang Menyeramkan". Treat this Vue project as the
> source of truth.

### Repo layout

```
./
├── src/                  Vue app (views, components, composables, data)
├── public/assets/        Runtime images + audio (referenced by slides.json)
├── android/              Capacitor Android shell
├── scripts/              extract-slides.mjs, rename-assets.mjs (rare use)
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

The app is **data-driven**: every slide, object, position, image state, and
navigation link is described in `src/data/slides.json`. The Vue components are a
thin renderer over that data. There is no per-slide hand-written markup.

### Data flow

1. **`src/data/slides.json`** — generated artifact. Shape: `{ stage, home, slides[] }`.
   - `stage` is fixed **1280×720**. Every object has absolute `x/y/w/h/depth`.
   - Each object carries `up`/`down` image paths, an optional `role`
     (`home`/`next`/`prev`/`volume`/`mute`/`replay`/`close`/`tentang`/`petunjuk`),
     a `target` (gotoplay slideId), and `openLayer` (popup layer id).
2. **`src/data/slides.ts`** — the only place that imports the JSON. Provides typed
   accessors (`SLIDES`, `HOME`, `STAGE`), `slideByPage(n)`, and
   `targetToRoute(slideId)` which maps an internal slideId to a router path.
   **Import slide data from here, never from the JSON directly.**
3. **Views** consume the typed data:
   - `views/HomeView.vue` — the menu (Halaman Utama): base layer + popup layers
     (Mulai's 3-page "Pilih Halaman" grid, Petunjuk, Tentang). Popup state is a
     single `openLayerId` ref; base-layer buttons are hidden while a popup is open.
   - `views/SlideView.vue` — the 15 story pages at `/slide/1`..`/slide/15`.
4. **Components** render objects:
   - `components/SlideStage.vue` — the letterbox host; applies the scale transform
     and emits `hostgesture` on first pointer (used to unblock audio autoplay).
   - `components/StageObject.vue` — one absolutely-positioned object; renders a
     `<button>` if `accType === 'button'` else a `<div>`, swaps `up`→`down` image
     on press.

### Key conventions & gotchas

- **Page numbers (1–15) follow the navigation chain order, NOT Storyline's internal
  titles** (which drift, e.g. internal "5b" displays as "Halaman 6"). The display
  page number is baked into the background artwork. `targetToRoute()` resolves
  slideIds → page routes via this mapping.
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
  in the top-right shows exactly one of the three variants at a time;
  `SlideView` filters which one is visible based on the state.
- `@` aliases `src/` (vite + tsconfig).

### Regenerating slide data (rarely needed)

`scripts/extract-slides.mjs` parses the original Storyline export
(`window.globalProvideData` calls in `assets/html5/data/js/*.js`) into
`slides.json` and copies referenced rasters/audio into `public/assets/`.
`scripts/rename-assets.mjs` then renames the opaque Storyline-hash filenames into
meaningful grouped names and rewrites the JSON paths (writes `public/assets/MANIFEST.md`).

**Important:** the original Storyline source tree (`assets/html5/`, `assets/mobile/`,
`assets/story_content/`) is **not** in this repo. Re-running extraction requires
pointing the script at a restored export — a full copy exists at the sibling dir
`/home/abdun/abdun/project/education-project/Lucu-yang-Menyeramkan_1_1.0/`.
For normal feature work you edit `slides.json` / components directly and do **not**
re-run extraction.

`images-assets/` (numbered PNG screenshots) is reference material only and is
not referenced by the Vue runtime.

## App identity (capacitor.config.ts)

- appId `com.sdntukharjo.lucumenyeramkan`, appName "Lucu yang Menyeramkan"
- Locked landscape orientation; `allowMixedContent: true`
