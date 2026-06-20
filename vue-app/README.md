# Lucu yang Menyeramkan — Vue 3 + Capacitor

Rebuild of the original Articulate Storyline 3 e-learning course "Lucu yang
Menyeramkan" (SDN Tukharjo) as a standalone Vue 3 app, packaged to Android with
Capacitor. Pixel-perfect 1280×720 stage, in-slide controls, backsound audio.

## Stack
- Vue 3.5 + Vite 8 + vue-router 4 (hash history for WebView)
- Capacitor 7 → Android `.apk`
- Data-driven: every slide is described in `src/data/slides.json`

## How it works
- `scripts/extract-slides.mjs` parses the original Storyline export
  (`../assets/html5/data/js/*.js`) into `src/data/slides.json` and copies the
  referenced raster + audio assets into `public/assets/`.
- `useStageScale.ts` scales the fixed 1280×720 stage to fit any viewport
  (Storyline `noscale` → responsive letterbox).
- `SlideStage.vue` + `StageObject.vue` render absolutely-positioned objects.
- `HomeView.vue` = Halaman Utama with Mulai (3-page "Pilih Halaman" grid),
  Petunjuk and Tentang popup layers.
- `SlideView.vue` = the 15 story pages (`/slide/1`..`/slide/15`); page numbers
  follow the navigation chain, matching the numbers baked into the artwork.
- `useSlideAudio.ts` = backsound state machine (Volume ↔ Mute ↔ Replay), gated
  behind the first tap for mobile autoplay rules.

## Develop
```bash
npm install
npm run dev          # http://localhost:5173
```

## Regenerate slide data / assets (only if the source export changes)
```bash
node scripts/extract-slides.mjs
```

## Build the Android APK
```bash
npm run build                       # vite build -> dist/
npx cap sync android                # copy dist into the native project
cd android
echo "sdk.dir=$HOME/Android/Sdk" > local.properties
./gradlew assembleDebug             # -> app/build/outputs/apk/debug/app-debug.apk
```
The debug APK is also copied to `../Lucu-yang-Menyeramkan-debug.apk`.

For a signed release build: `./gradlew assembleRelease` with a configured keystore.

## App identity
- appId: `com.sdntukharjo.lucumenyeramkan`
- appName: `Lucu yang Menyeramkan`
- Orientation: locked landscape (`sensorLandscape`)
- Icon: generated from the course thumbnail
