# Lucu yang Menyeramkan — Vue 3 + Capacitor

Rebuild of the original Articulate Storyline 3 e-learning course "Lucu yang
Menyeramkan" (SDN Tukharjo) as a standalone Vue 3 app, packaged to Android with
Capacitor. Pixel-perfect 1280×720 stage, in-slide controls, backsound audio.

## Stack
- Vue 3.5 + Vite 8 + vue-router 4 (hash history for WebView)
- Capacitor 7 → Android `.apk`
- Component-first: the UI is hand-written Vue components; the only data is a tiny
  typed list of the 21 story pages in `src/data/slides.ts`.

## How it works
- `src/data/slides.ts` exports `STAGE` (1280×720) and `SLIDES` — 21 entries of
  `{ page, title, background, backgroundAlt, backsound }`. Pages are addressed by
  number (`/slide/:n`), and prev/next is just `page ± 1`.
- `useStageScale.ts` scales the fixed 1280×720 stage to fit any viewport
  (Storyline `noscale` → responsive letterbox).
- `SlideStage.vue` is the letterbox host; `StageButton.vue` is the reusable
  absolutely-positioned image button (press-swap + shadow) that everything composes.
- `SlideView.vue` = a story page (`<img>` background + `<NavControls>`); `NavControls`
  holds the six controls with their coordinates baked in.
- `HomeView.vue` = Halaman Utama, composing `HomeMenu` + the popup components
  `MulaiGrid` (paged "Pilih Halaman" thumbnail grid generated from `SLIDES`),
  `PetunjukPopup`, `TentangPopup` (both via the shared `StagePopup` chrome).
- `useSlideAudio.ts` = backsound state machine (Volume ↔ Mute ↔ Replay), gated
  behind the first tap for mobile autoplay rules.

## Develop
```bash
npm install
npm run dev          # http://localhost:5173
```

## Build the Android APK
```bash
npm run build                       # vite build -> dist/
npx cap sync android                # copy dist into the native project
cd android
echo "sdk.dir=$HOME/Android/Sdk" > local.properties
./gradlew assembleDebug             # -> app/build/outputs/apk/debug/app-debug.apk
```
APKs are copied to `vue-app/build-output/` (run `./build-apk.sh` from `vue-app/`).

For a signed release build: `./gradlew assembleRelease` with a configured keystore.

## App identity
- appId: `com.sdntukharjo.lucumenyeramkan`
- appName: `Lucu yang Menyeramkan`
- Orientation: locked landscape (`sensorLandscape`)
- Icon: generated from the course thumbnail
