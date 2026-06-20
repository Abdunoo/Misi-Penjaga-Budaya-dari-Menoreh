# Rebuild "Lucu yang Menyeramkan" — Vue 3 + Capacitor (pixel-perfect)

> **Status: SELESAI ✅** — aplikasi sudah dibangun, diuji di browser (Playwright),
> dan APK sudah jadi: `Lucu-yang-Menyeramkan-debug.apk` (21 MB) di root proyek.
> Dokumen ini mencerminkan implementasi final yang sebenarnya (bukan rencana awal).

## Context

Folder kerja `/home/abdun/abdun/project/education-project/Lucu-yang-Menyeramkan_1_1.0`
berisi **APK Android hasil decompile** dari sebuah course e-learning anak SD
yang dibuat dengan **Articulate Storyline 3** (v3.10.22406.0, oleh Dhesta
Youlandi Rahayu Sulistiyawati, S2 Pendidikan Dasar UNY, untuk SDN Tukharjo).
APK aslinya hanya WebView tipis yang menjalankan player Storyline HTML5.

User ingin **membangun ulang aplikasi ini dengan Vue.js + Capacitor** sehingga
bisa di-build menjadi `.apk`, dengan **desain yang sama persis** dengan aslinya.
Hasil akhir: aplikasi Vue mandiri (tanpa engine Storyline) yang secara visual &
interaktif identik dengan APK asli, dan dibungkus jadi APK Android.

### Hasil ekstraksi (terverifikasi dari data Storyline)

- **Canvas/stage native: 1280 × 720 px** setiap slide (16:9), background `#FFFFFF`.
- **Course CHROMELESS**: TIDAK ada player bar Storyline. Semua kontrol adalah
  **gambar PNG di dalam tiap slide** pada posisi tetap (direplikasi persis).
- **Font: Open Sans** (regular/bold/italic, via Google Fonts).
- **16 slide**: 1 Halaman Utama (menu) + 15 halaman materi (cerita fabel
  beruang/singa/buaya).
- **Penomoran halaman 1–15:** judul internal Storyline ("5a/5b/11a/11b") TIDAK
  sama dengan nomor di gambar. Gambar background sudah berlabel 1–15 berurutan.
  Yang dipakai = **urutan posisi dalam rantai navigasi = nomor di gambar = 1–15**.
- **Urutan rantai posisi 1→15 (slideId):**
  `6G5a8DEtRoU, 6QCwAJr6K2M, 5bFF75pEUPH, 5xyKuLAphI2, 6LJTtYkwQLX, 5upqtBZSZiz,
  6ksEZ5R8NAV, 5vS82aZCX3C, 66yni05rmU2, 5dLKJGXipve, 5chrZJdVBAp, 5okYciwgX3w,
  6bDA1sG8Zig, 6PCO471MeAT, 67bCu6Du3bf`.
- **Navigasi linear + hub:** Utama → hub ke 15 halaman lewat popup grid "Pilih
  Halaman" (3 halaman × 6 thumbnail, dinomori 1–15). Rantai linear 1→2→…→15.
  Tiap halaman materi: **Home** (kiri-atas) + **‹ Prev** + **› Next** (bawah).
  Halaman 1 tanpa Prev; Halaman 15 tanpa Next.
- **Audio:** narasi auto-play `onslidestart` (vol 0.75); tombol Volume↔Mute toggle;
  Replay muncul otomatis saat narasi selesai. Home punya musik latar (loop).

### Keputusan user (final)
1. Kontrol **persis seperti asli** (tombol in-slide, chromeless).
2. **Pakai ulang** scaffold `vue-app/`; samakan versi **Capacitor ke v7** (stabil).
3. Identitas: nama **"Lucu yang Menyeramkan"**, package
   **`com.sdntukharjo.lucumenyeramkan`**, ikon dari thumbnail asli (karakter).
4. **Popup fix:** saat popup (Pilih Halaman / Petunjuk / Tentang) terbuka,
   tombol base **Mulai/Petunjuk/Tentang disembunyikan** agar tidak bocor di balik
   scrim. Background tetap terlihat. Tombol muncul lagi saat popup ditutup.

---

## Arsitektur final (data-driven)

Satu file `slides.json` (generated) mendeskripsikan setiap slide & layer popup
(objek, posisi absolut, aset, audio, target navigasi, openLayer, scrim fill).
Komponen Vue generik me-render JSON ke stage 1280×720 yang di-scale-to-fit.

### Langkah 1 — Script ekstraksi data (Node, build-time)
`vue-app/scripts/extract-slides.mjs` mem-parse sumber Storyline:
- `assets/html5/data/js/data.js` → `assetLib` (id → url mp3/img).
- `assets/html5/data/js/<slideId>.js` (×16) → objek per slide via `slideLayers[].objects[]`
  (`xPos/yPos/width/height/depth`, `imagelib` state 01=up/02=down, `accType`),
  navigasi `events[].actions[]` (`gotoplay` → slideId; `show_slidelayer` → layer id),
  dan `audiolib`.
- Resolusi aset: cocokkan hash-prefix `url` ke raster `mobile/<hash>_..._CXw_CYh.(png|jpg)`
  (abaikan `.swf`). Narasi = klip mp3 terpanjang per slide.
- Scrim popup (vectorshape full-stage tanpa raster) → di-flag `role:'scrim'` dengan
  warna fill: oranye `rgba(254,184,70,.60)` (grid Mulai), biru `rgba(136,212,238,.64)`
  (Tentang/Petunjuk).
- Output: `vue-app/src/data/slides.json` + salin **54 gambar + 43 audio** ke
  `vue-app/public/assets/{img,audio}/`.

### Langkah 2 — Foundation
- `package.json`: Capacitor v7 (`cli`+`core`+`android` `^7.4.3`), `vue-router ^4.5`,
  Pinia dihapus. `vite.config.ts`: `base: './'` (relatif untuk WebView `file://`).
- `index.html`: viewport `user-scalable=no, shrink-to-fit=no`, Google Font Open Sans,
  title "Lucu yang Menyeramkan". `main.css`: reset full-bleed putih.
- Template default (HelloWorld/TheWelcome/AboutView/counter store/icons) dihapus.

### Langkah 3 — Engine & komponen
- **`composables/useStageScale.ts`** — `scale = min(vw/1280, vh/720)`, translate+scale
  ke tengah, recompute saat resize/orientationchange (rAF-debounced).
- **`composables/useSlideAudio.ts`** — state machine `volume → mute → replay`,
  auto-play di-gate gesture pertama (WebView), `playSfx`, `resumeAfterGesture`.
- **`components/SlideStage.vue`** — host putih + stage 1280×720 ber-transform; emit
  `hostgesture` untuk resume audio. Konten via slot.
- **`components/StageObject.vue`** — render satu objek absolut (x/y/w/h/zIndex),
  swap gambar up/down saat `pointerdown`, drop-shadow + `:active scale(.96)`,
  dukung `fill` (scrim CSS). Klik → emit `activate`.

### Langkah 4 — Views & routing
- **`router/index.ts`** — **hash history** (`createWebHashHistory`); route `/`
  (HomeView) & `/slide/:n` (SlideView, lazy). Helper `targetToRoute(slideId)` di
  `data/slides.ts` memetakan slideId → `/slide/<nomor>` atau `/`.
- **`views/HomeView.vue`** — base layer (bg + Mulai/Petunjuk/Tentang) + 1 popup
  layer aktif (scrim + panel + kontrol). State `openLayerId`; base buttons opens
  layer via `openLayer`, popup arrows ganti halaman grid, thumbnail → `router.push`,
  close → tutup. Musik latar loop (gated). **Computed `visibleBaseObjects`
  menyembunyikan tombol base saat popup terbuka** (fix #4).
- **`views/SlideView.vue`** — render slide via `slideByPage(n)`; filter objek audio
  (hanya state aktif yang tampil); Home→`/`, Prev/Next→`targetToRoute`, Volume/Mute/
  Replay→`toggle`. Re-attach narasi saat page berubah.
- **`App.vue`** — hanya `<RouterView />` (tanpa chrome).

### Langkah 5 — Capacitor & build APK
- `capacitor.config.ts`: `appId com.sdntukharjo.lucumenyeramkan`,
  `appName "Lucu yang Menyeramkan"`, `webDir dist`, `android.allowMixedContent`.
- `AndroidManifest.xml`: `android:screenOrientation="sensorLandscape"`.
- Ikon launcher di-generate dari `assets/story_content/thumbnail.jpg` (crop beruang)
  untuk semua densitas mipmap; adaptive icon background `#FFFFFF`.
- Build: `npm run build` → `npx cap sync android` →
  `cd android && ./gradlew assembleDebug` (SDK `~/Android/Sdk`, Java 21).
  Output: `android/app/build/outputs/apk/debug/app-debug.apk`, disalin ke
  `Lucu-yang-Menyeramkan-debug.apk` di root.

---

## File kunci (final)

| File | Peran |
|---|---|
| `vue-app/scripts/extract-slides.mjs` | parse Storyline → `slides.json` + salin aset |
| `vue-app/src/data/slides.json` | spesifikasi seluruh slide + home layers (generated) |
| `vue-app/src/data/slides.ts` | typed loader + `targetToRoute`/`slideByPage` |
| `vue-app/src/composables/useStageScale.ts` | scaling 1280×720 → viewport |
| `vue-app/src/composables/useSlideAudio.ts` | state machine audio (Volume/Mute/Replay) |
| `vue-app/src/components/SlideStage.vue` | host putih + stage ber-transform |
| `vue-app/src/components/StageObject.vue` | satu objek absolut (image/scrim/button) |
| `vue-app/src/views/HomeView.vue` | Halaman Utama + popup (+ fix sembunyikan tombol base) |
| `vue-app/src/views/SlideView.vue` | render halaman materi 1–15 + kontrol |
| `vue-app/src/router/index.ts` | hash routing `/` & `/slide/:n` |
| `vue-app/capacitor.config.ts` + `package.json` | identitas app + Capacitor v7 |
| `vue-app/android/app/src/main/AndroidManifest.xml` | orientasi landscape |

> Catatan: komponen `SlideControls.vue` & `PageMenu.vue` dari rencana awal TIDAK
> dibuat — logikanya digabung ke `SlideView.vue`/`HomeView.vue` (lebih sederhana,
> tetap data-driven via `StageObject`). `SlideObject.vue` direalisasikan sebagai
> `StageObject.vue`.

## Aset asli (sumber)
- Gambar: `assets/mobile/` (56 file). Audio: `assets/story_content/` (45 mp3).
- Yang dipakai app: 54 gambar + 43 audio (tersalin ke `vue-app/public/assets/`).

---

## Verifikasi (sudah dilakukan ✅)
1. **Type-check & build**: `vue-tsc --build` lolos; `npm run build` sukses.
2. **Browser (Playwright)**: Home, grid "Pilih Halaman", Petunjuk, Tentang, slide
   1/2/15 render **identik** dengan render asli. **65 aset** dicek via HTTP → 0 broken.
3. **Navigasi**: rantai 1→15 + Home/Prev/Next + grid thumbnail terverifikasi.
4. **Audio**: narasi auto-play (gated tap), Volume↔Mute, Replay on-ended.
5. **Popup fix**: saat popup terbuka tombol Mulai/Petunjuk/Tentang hilang; muncul
   lagi saat ditutup; navigasi grid tetap jalan.
6. **APK**: `./gradlew assembleDebug` → BUILD SUCCESSFUL (21 MB, 97 aset di dalam,
   orientasi landscape, label & package benar).

## Cara build ulang
```bash
cd vue-app
npm install
node scripts/extract-slides.mjs   # hanya jika sumber Storyline berubah
npm run build && npx cap sync android
cd android && ./gradlew assembleDebug
```

## Catatan lanjutan / opsional
- APK saat ini **debug** (test-key) untuk uji langsung. Untuk rilis resmi/Play Store
  perlu **release build** bertanda-tangan (`assembleRelease` + keystore).
- Autoplay diblokir sebagian WebView → playback pertama di-gate tap pertama.
- Drop-shadow & state pressed = approx CSS (`drop-shadow` + `:active scale`).
