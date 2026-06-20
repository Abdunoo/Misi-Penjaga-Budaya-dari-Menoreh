# Rencana: Transisi Halaman/Popup + UI Seru untuk Anak SD

## Context

Aplikasi ini adalah rebuild Vue 3 + Capacitor dari e-learning Storyline ("Lucu yang
Menyeramkan") — cerita fabel untuk siswa SD **kelas 5–6**. Saat ini perpindahan antar
halaman dan munculnya popup terjadi **instan tanpa animasi**, dan UI terasa statis.

Tujuan user:
1. **Permintaan inti** — tambahkan transisi: perpindahan halaman = **geser** (slide,
   sesuai arah navigasi), munculnya popup = **muncul** (fade + scale-in).
2. **Tujuan lebih luas** — buat UI **seru & tidak membosankan** untuk anak SD:
   efek suara (SFX), animasi tombol yang "hidup", dan animasi dekoratif di Halaman Utama.

Keputusan user (terkonfirmasi): gaya geser **mengikuti arah navigasi**, perpindahan
ke/dari Home **ikut geser**, durasi geser **~350ms**, tingkat keramaian **"ceria &
seimbang"**, dan dikerjakan **bertahap** (Fase 1 transisi dulu, Fase 2 fitur seru).

> Catatan arsitektur penting: **setiap view me-render `SlideStage`-nya sendiri**
> (`.stage-host` = `position: fixed; inset: 0`). `App.vue` hanya berisi `<RouterView/>`.
> `useStageScale` menaruh transform skala di elemen **dalam** (`.stage`), jadi transform
> geser di **root view** (`.stage-host`) tidak bentrok (elemen berbeda). Router **wajib
> tetap** `createWebHashHistory` (Capacitor `file://`).

---

## FASE 1 — Transisi Geser (halaman) + Muncul (popup)  ← kerjakan dulu

### 1.1 `src/App.vue` — bungkus RouterView dengan `<Transition>` + viewport clip

Ganti `<RouterView/>` dengan pola slot, beri `:key="route.path"` (WAJIB — `SlideView`
dipakai ulang untuk semua `/slide/:n`; tanpa key Vue patch in-place dan transisi tidak
jalan). Bungkus dengan `.route-viewport` sebagai containing block agar halaman yang
ter-geser keluar layar **ter-clip** (bukan menimbulkan scroll/bocor).

```vue
<template>
  <div class="route-viewport">
    <RouterView v-slot="{ Component, route }">
      <Transition :name="(route.meta.transition as string) || 'none'">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </div>
</template>

<style scoped>
.route-viewport {
  position: fixed; inset: 0; overflow: hidden;
  transform: translateZ(0); /* jadikan containing block utk .stage-host (position:fixed) → clip rapi */
}
</style>
```

### 1.2 `src/router/index.ts` — tentukan arah geser via `beforeEach`

Petakan rute ke indeks numerik (Home = 0, slide n = n), bandingkan dengan rute
sebelumnya, tulis `to.meta.transition`. Tangani **first load** (`from.name === undefined`)
→ `none` (jangan animasi saat aplikasi baru dibuka).

```ts
declare module 'vue-router' {
  interface RouteMeta { transition?: string }
}

router.beforeEach((to, from) => {
  const idx = (r: any) => (r.name === 'home' ? 0 : Number(r.params.n))
  const fromIdx = idx(from)
  to.meta.transition =
    from.name === undefined || Number.isNaN(fromIdx)
      ? 'none'
      : idx(to) >= fromIdx ? 'slide-forward' : 'slide-back'
})
```

Hasil: Home→Slide & Mulai-grid→Slide = `slide-forward` (maju); Slide→Home & Prev =
`slide-back` (mundur). (Mulai grid ada di dalam HomeView, tapi `selectPage` tetap memicu
route `/` → `/slide/n`, jadi terdeteksi benar.)

### 1.3 `src/components/StagePopup.vue` — **BLOKER**: jadikan satu root

`<Transition>` butuh anak **satu elemen root**. `StagePopup` saat ini punya **3 root**
(`.scrim`, `<slot/>`, `<StageButton>`) → jika dibungkus Transition, Vue **diam-diam tidak
menerapkan animasi** (hanya warning). Solusi minimal & **tanpa pergeseran layout**:
bungkus jadi satu `.popup-root` seukuran panggung.

```vue
<template>
  <div class="popup-root">
    <div class="scrim" :style="{ background: scrim }" />
    <slot />
    <StageButton ... @activate="emit('close')" />
  </div>
</template>
<style scoped>
.popup-root { position: absolute; left: 0; top: 0; width: 1280px; height: 720px; }
.scrim { /* tetap: absolute 1280x720 */ }
</style>
```

Wrapper memakai origin yang sama dengan `.stage` (top-left), jadi koordinat absolut
anak (scrim, panel, tombol close) **identik** seperti sebelumnya — nol pergeseran.

### 1.4 `src/views/HomeView.vue` — bungkus rantai popup dengan `<Transition name="popup">`

Popup hanya `null↔A` (tak ada A→B langsung karena tombol menu disembunyikan saat popup
terbuka), jadi rantai `v-if/v-else-if` menyajikan **satu anak** → aman. Mode default
(tanpa `out-in`).

```vue
<Transition name="popup">
  <MulaiGrid v-if="popup === 'mulai'" @select="selectPage" @close="close" />
  <PetunjukPopup v-else-if="popup === 'petunjuk'" @close="close" />
  <TentangPopup v-else-if="popup === 'tentang'" @close="close" />
</Transition>
```

### 1.5 CSS transisi — tambahkan ke `src/assets/main.css` (global)

Hanya animasikan `transform`/`opacity` (compositor-only, mulus di WebView Android).
`translateX(100%)` relatif lebar elemen fixed = lebar viewport → geser penuh layar.

```css
/* ---- Geser halaman (350ms) ---- */
.slide-forward-enter-active, .slide-forward-leave-active,
.slide-back-enter-active,    .slide-back-leave-active {
  transition: transform 350ms cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: transform;
}
.slide-forward-enter-active, .slide-back-enter-active { z-index: 1; }
.slide-forward-leave-active, .slide-back-leave-active { z-index: 0; pointer-events: none; }

.slide-forward-enter-from { transform: translateX(100%); }   /* baru dari kanan */
.slide-forward-leave-to   { transform: translateX(-100%); }  /* lama ke kiri */
.slide-back-enter-from    { transform: translateX(-100%); }  /* baru dari kiri */
.slide-back-leave-to      { transform: translateX(100%); }   /* lama ke kanan */

.none-enter-active, .none-leave-active { transition: none; }

/* ---- Muncul popup (~260ms, fade + scale, sedikit pop) ---- */
.popup-enter-active, .popup-leave-active {
  transition: opacity 260ms ease, transform 260ms cubic-bezier(0.34, 1.3, 0.64, 1);
  transform-origin: 640px 360px; /* pusat panggung (koordinat stage tak ter-skala) */
  will-change: opacity, transform;
}
.popup-enter-from, .popup-leave-to { opacity: 0; transform: scale(0.92); }
.popup-leave-active { pointer-events: none; }

/* ---- Aksesibilitas: hormati reduce-motion (sekolah/anak) ---- */
@media (prefers-reduced-motion: reduce) {
  .slide-forward-enter-active, .slide-forward-leave-active,
  .slide-back-enter-active, .slide-back-leave-active,
  .popup-enter-active, .popup-leave-active { transition-duration: 1ms !important; }
}
```

`pointer-events: none` pada layer yang sedang **keluar** mencegah tap nyasar ke
komponen yang sedang di-unmount (aman terhadap audio-unlock; guard di `useSlideAudio`
sudah no-op bila audio sudah di-detach).

### Yang TIDAK perlu diubah
`SlideStage.vue` tidak diubah — translateX geser menempel di root-nya (`.stage-host`)
lewat kelas transisi; transform skala `.stage` di elemen berbeda (tak bentrok).

---

## FASE 2 — UI Seru untuk Anak SD (kerjakan setelah Fase 1 disetujui)

Tingkat: **"ceria & seimbang"** — hidup & menyenangkan tapi tidak mengganggu fokus baca.
Fitur dipilih user: **SFX**, **animasi latar Home**, **animasi tombol hidup**.

> **Realitas aset (penting):** belum ada file SFX (hanya `musik-home.mp3` & `narasi-*`),
> dan `page-cover.png` adalah **satu gambar datar** (tak ada layer elemen terpisah).
> Maka: SFX = tambah file kecil baru; animasi latar Home = **overlay dekoratif CSS/SVG**
> (bukan menggerakkan elemen di dalam PNG); animasi tombol = CSS murni.

### 2.1 Efek Suara (SFX) — manfaatkan `playSfx` yang SUDAH ADA

`useSlideAudio` sudah punya `playSfx(src)` (saat ini belum dipakai). Rencana:
- Tambah 3 file kecil di `public/assets/sfx/`: `click.mp3` (tap tombol),
  `whoosh.mp3` (ganti halaman), `pop.mp3` (popup muncul). File ringan (<20KB) berlisensi
  bebas; volume lembut (mis. 0.4–0.5) agar tidak berisik.
- Buat composable kecil **`src/composables/useSfx.ts`** (singleton, preload `Audio`,
  hormati reduce-motion / opsi mute) supaya SFX bisa dipakai lintas komponen tanpa
  bergantung instance `useSlideAudio` per-view.
- Picu: `click` di `StageButton.vue` (`@activate` / `pointerdown`) & tombol menu;
  `whoosh` di `App.vue` `beforeEach` atau saat transisi geser mulai; `pop` saat popup
  terbuka (`HomeView` set `popup`).
- **Hormati `prefers-reduced-motion`** dan sediakan jalan agar SFX tidak dobel dengan
  narasi (SFX volume rendah, durasi sangat pendek).

> Keputusan terbuka untuk diklarifikasi saat Fase 2: apakah user menyediakan file SFX
> sendiri, atau saya bundel SFX bebas-lisensi. (Akan ditanyakan sebelum eksekusi Fase 2.)

### 2.2 Animasi tombol "hidup" — CSS murni di tombol menu Home

Di `HomeMenu.vue` (Mulai/Petunjuk/Tentang): tambah animasi **idle** halus (pulse/
bounce/wiggle lembut) via `@keyframes`, dengan jeda berbeda per tombol agar tidak
serempak. Tetap pakai `transform` (compositor-only). Pertahankan `:active scale(0.96)`
yang sudah ada. Bisa diberi sedikit "pop-in" saat tombol pertama muncul.
Hormati `prefers-reduced-motion` (matikan idle-anim).

### 2.3 Animasi latar Halaman Utama — overlay dekoratif CSS/SVG

Karena cover satu PNG datar, tambahkan **lapisan dekoratif terpisah** di `HomeView`/
`HomeMenu` (di belakang tombol, di atas cover): elemen ringan seperti
awan/daun/percikan (CSS shapes atau beberapa PNG kecil/SVG) yang **melayang perlahan**
(`@keyframes` translate/float, durasi panjang, gerak halus). Opsional: napas "ken-burns"
sangat halus pada cover (scale 1.0→1.03 bolak-balik) agar latar tidak mati.
Semua compositor-only & hormati reduce-motion.

---

## Verifikasi (end-to-end)

Tidak ada test runner di proyek ini — verifikasi = jalankan dev server & cek visual.

1. `npm install` lalu `npm run dev` → buka `http://localhost:5173`.
2. **Geser halaman:** dari Home buka Mulai → pilih halaman (harus geser **maju**).
   Di halaman cerita tekan **Next** (geser maju), **Prev** (geser mundur), **Home**
   (geser mundur). Pastikan tidak ada scrollbar horizontal / halaman bocor di tepi.
3. **First load:** muat ulang di `#/slide/5` → **tidak** ada animasi geser saat buka.
4. **Popup muncul:** buka Petunjuk / Tentang / Mulai → fade + scale-in; tutup (X) →
   fade + scale-out. Pastikan scrim & panel beranimasi bersama (berkat `.popup-root`).
5. **Reduce motion:** aktifkan "reduce motion" OS → transisi jadi instan, app tetap
   berfungsi.
6. **Audio tetap jalan:** narasi/musik tidak rusak oleh transisi; tap pertama tetap
   meng-unlock audio.
7. **Type-check & lint:** `npm run type-check` lalu `npm run lint`.
8. (Fase 2) cek SFX terdengar lembut & tidak dobel; tombol Home beranimasi halus; latar
   Home terasa hidup tanpa mengganggu baca.
9. (Opsional) build APK: `./build-apk.sh debug` lalu cek di WebView Android (orientasi
   landscape) bahwa geser mulus & tidak nge-jank.

## Berkas yang diubah/ditambah

**Fase 1:** `src/App.vue`, `src/router/index.ts`, `src/components/StagePopup.vue`,
`src/views/HomeView.vue`, `src/assets/main.css`.
**Fase 2:** `src/composables/useSfx.ts` (baru), `public/assets/sfx/*` (baru),
`src/components/StageButton.vue`, `src/components/HomeMenu.vue`, `src/views/HomeView.vue`,
`src/assets/main.css` (keyframes idle/float).
